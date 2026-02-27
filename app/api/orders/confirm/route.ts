import { NextRequest, NextResponse } from "next/server";
import { addOrder, getOrCreateCustomer, updateOrderStatus } from "@/lib/store";
import { getMenuItem } from "@/lib/menu";
import { createCloverOrder, addLineItemsToClover } from "@/lib/clover";
import { sendOrderConfirmationSMS, sendOrderReceiptEmail } from "@/lib/notifications";
import { log, logError } from "@/lib/utils";
import { BUSINESS_CONFIG } from "@/config/business";
import type { OrderItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customer_name,
      customer_phone,
      customer_email,
      order_items,
      total_price,
      special_requests = "",
      order_type = "pickup",
      delivery_address,
      delivery_city,
      delivery_zip,
    } = body as {
      customer_name?: string;
      customer_phone?: string;
      customer_email?: string;
      order_items?: {
        name: string;
        quantity: number;
        price?: number;
        customizations?: Record<string, string>;
      }[];
      total_price?: number;
      special_requests?: string;
      order_type?: "pickup" | "delivery";
      delivery_address?: string;
      delivery_city?: string;
      delivery_zip?: string;
    };

    // ── Validate required fields ──────────────────────────────────────
    if (!customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: "customer_name and customer_phone are required" },
        { status: 400 }
      );
    }

    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return NextResponse.json(
        { success: false, error: "order_items must be a non-empty array" },
        { status: 400 }
      );
    }

    log("Order confirm request received", {
      customer_name,
      customer_phone,
      customer_email,
      order_items,
      total_price,
      special_requests,
      order_type,
    });

    // ── Build OrderItem array (look up prices from menu if not provided) ──
    const builtItems: OrderItem[] = order_items.map((item) => {
      let unitPrice = item.price ?? 0;

      if (!item.price) {
        const menuItem = getMenuItem(item.name);
        if (menuItem) {
          unitPrice = menuItem.price;
        } else {
          log(`Menu item not found for "${item.name}", using price 0`);
        }
      }

      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;

      return {
        name: item.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        customizations: item.customizations ?? {},
        subtotal,
      };
    });

    // ── Calculate total from items if total_price not provided ─────────
    const isDelivery = order_type === "delivery";
    const foodTotal = Math.round(builtItems.reduce((sum, i) => sum + i.subtotal, 0) * 100) / 100;
    const deliveryFee = isDelivery ? BUSINESS_CONFIG.delivery.delivery_fee : 0;
    const calculatedTotal = total_price ?? Math.round((foodTotal + deliveryFee) * 100) / 100;

    // ── Get or create customer ────────────────────────────────────────
    const customer = getOrCreateCustomer(customer_phone, customer_name);
    log("Customer resolved", { id: customer.id, phone: customer.phone });

    // ── Create order in store with status "confirmed" ─────────────────
    const pickupTime = `${BUSINESS_CONFIG.default_prep_time} minutes`;

    const order = addOrder({
      customer_name,
      customer_phone,
      customer_email,
      order_type,
      order_items: builtItems,
      special_requests,
      order_total: calculatedTotal,
      order_status: "confirmed",
      pickup_time: isDelivery ? undefined : pickupTime,
      ...(isDelivery && {
        delivery_address,
        delivery_city,
        delivery_zip,
        delivery_fee: deliveryFee,
        delivery_status: "awaiting_dispatch" as const,
        estimated_delivery_time: BUSINESS_CONFIG.delivery.estimated_delivery_time,
      }),
    });

    log("Order created in store", { order_id: order.id, total: calculatedTotal });

    // ── Try to create Clover order ────────────────────────────────────
    let cloverOrderId: string | null = null;

    try {
      const cloverResult = await createCloverOrder({
        title: `Voice Order - ${customer_name}`,
        note: special_requests || undefined,
      });
      log("Clover createCloverOrder result", cloverResult);

      if (cloverResult?.id) {
        cloverOrderId = cloverResult.id;

        const lineItems = builtItems.map((item) => ({
          name: item.name,
          price: item.unit_price,
          quantity: item.quantity,
          note: Object.entries(item.customizations)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ") || undefined,
        }));

        const lineItemResult = await addLineItemsToClover(cloverOrderId, lineItems);
        log("Clover addLineItemsToClover result", { success: lineItemResult });

        // Update order with Clover order ID
        const updatedOrder = updateOrderStatus(order.id, "confirmed");
        if (updatedOrder) {
          (updatedOrder as any).clover_order_id = cloverOrderId;
        }

        log("Order updated with clover_order_id", { order_id: order.id, clover_order_id: cloverOrderId });
      }
    } catch (cloverError) {
      logError("Clover integration failed (order still confirmed)", cloverError);
    }

    // ── Try to send SMS confirmation ──────────────────────────────────
    let smsSent = false;

    try {
      const smsResult = await sendOrderConfirmationSMS(customer_phone, {
        customerName: customer_name,
        orderId: order.id,
        total: calculatedTotal,
        pickupTime,
        orderType: order_type,
        deliveryAddress: delivery_address,
        deliveryFee: isDelivery ? deliveryFee : undefined,
        estimatedDeliveryTime: isDelivery ? BUSINESS_CONFIG.delivery.estimated_delivery_time : undefined,
      });
      smsSent = smsResult.success;
      log("SMS confirmation result", smsResult);
    } catch (smsError) {
      logError("SMS confirmation failed", smsError);
    }

    // ── Try to send email receipt (if customer_email provided) ────────
    let emailSent = false;

    if (customer_email) {
      try {
        const emailResult = await sendOrderReceiptEmail(customer_email, {
          customerName: customer_name,
          orderId: order.id,
          items: builtItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
          total: calculatedTotal,
          pickupTime,
          orderType: order_type,
          deliveryAddress: delivery_address,
          deliveryFee: isDelivery ? deliveryFee : undefined,
          estimatedDeliveryTime: isDelivery ? BUSINESS_CONFIG.delivery.estimated_delivery_time : undefined,
        });
        emailSent = emailResult.success;
        log("Email receipt result", emailResult);
      } catch (emailError) {
        logError("Email receipt failed", emailError);
      }
    }

    // ── Return success response ───────────────────────────────────────
    const response = {
      success: true,
      order_id: order.id,
      clover_order_id: cloverOrderId,
      estimated_ready_time: pickupTime,
      sms_sent: smsSent,
      email_sent: emailSent,
      message: "Order confirmed and sent to kitchen",
    };

    log("Order confirm response", response);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    logError("Order confirm failed", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
