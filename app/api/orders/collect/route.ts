import { NextRequest, NextResponse } from "next/server";
import { addOrder, getOrCreateCustomer } from "@/lib/store";
import { getMenuItem } from "@/lib/menu";
import { BUSINESS_CONFIG } from "@/config/business";
import { log, logError } from "@/lib/utils";

interface IncomingItem {
  name: string;
  quantity: number;
  price?: number;
  customizations?: Record<string, string>;
}

interface CollectOrderBody {
  customer_name: string;
  customer_phone: string;
  order_type?: "pickup" | "delivery";
  pickup_time?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_zip?: string;
  items: IncomingItem[];
  special_requests?: string;
  order_total?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CollectOrderBody = await request.json();

    log("POST /api/orders/collect - Incoming request", body);

    // ── Validate required fields ───────────────────────────────────
    const { customer_name, customer_phone, items } = body;

    if (!customer_name || !customer_phone || !items) {
      log("Validation failed: missing required fields", {
        customer_name: !!customer_name,
        customer_phone: !!customer_phone,
        items: !!items,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: customer_name, customer_phone, and items are required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      log("Validation failed: items must be a non-empty array");
      return NextResponse.json(
        {
          success: false,
          error: "items must be a non-empty array",
        },
        { status: 400 }
      );
    }

    // ── Validate and build OrderItem objects ────────────────────────
    const validatedItems = [];

    for (const item of items) {
      const menuItem = getMenuItem(item.name);

      if (!menuItem) {
        log(`Menu item not found: "${item.name}"`);
        return NextResponse.json(
          {
            success: false,
            error: `Menu item not found: "${item.name}"`,
          },
          { status: 400 }
        );
      }

      const unit_price = item.price ?? menuItem.price;
      const quantity = item.quantity || 1;
      const customizations = item.customizations ?? {};
      const subtotal = unit_price * quantity;

      const orderItem = {
        name: menuItem.name,
        quantity,
        unit_price,
        customizations,
        subtotal,
      };

      log(`Validated item: ${menuItem.name}`, orderItem);
      validatedItems.push(orderItem);
    }

    log("All items validated", validatedItems);

    // ── Calculate total ────────────────────────────────────────────
    const foodTotal = validatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const isDelivery = (body.order_type || "pickup") === "delivery";
    const deliveryFee = isDelivery ? BUSINESS_CONFIG.delivery.delivery_fee : 0;
    const calculatedTotal = Math.round((foodTotal + deliveryFee) * 100) / 100;
    const orderTotal = body.order_total ?? calculatedTotal;

    log("Order total", { provided: body.order_total, foodTotal, deliveryFee, calculated: calculatedTotal, final: orderTotal });

    // ── Get or create customer ─────────────────────────────────────
    const customer = await getOrCreateCustomer(customer_phone, customer_name);
    log("Customer resolved", { id: customer.id, phone: customer.phone, name: customer.name });

    // ── Create the order ───────────────────────────────────────────
    const order = await addOrder({
      customer_name,
      customer_phone,
      order_type: body.order_type || "pickup",
      order_items: validatedItems,
      special_requests: body.special_requests || "",
      order_total: orderTotal,
      order_status: "pending",
      pickup_time: body.pickup_time,
      ...(isDelivery && {
        delivery_address: body.delivery_address,
        delivery_city: body.delivery_city,
        delivery_zip: body.delivery_zip,
        delivery_fee: deliveryFee,
        delivery_status: "awaiting_dispatch" as const,
        estimated_delivery_time: BUSINESS_CONFIG.delivery.estimated_delivery_time,
      }),
    });

    log("Order created successfully", order);

    // ── Return success response ────────────────────────────────────
    const response = {
      success: true,
      order_id: order.id,
      status: "pending",
      estimated_ready_time: isDelivery
        ? BUSINESS_CONFIG.delivery.estimated_delivery_time
        : (body.pickup_time || "25 minutes"),
      ...(isDelivery && { delivery_fee: deliveryFee }),
      message: isDelivery
        ? "Delivery order received and being processed"
        : "Order received and being processed",
    };

    log("Returning response", response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logError("POST /api/orders/collect failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
