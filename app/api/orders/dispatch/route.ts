import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/store";
import { log, logError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body as { order_id?: string };

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "order_id is required" },
        { status: 400 }
      );
    }

    log("POST /api/orders/dispatch - Dispatching order", { order_id });

    const order = getOrder(order_id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order not found: ${order_id}` },
        { status: 404 }
      );
    }

    if (order.order_type !== "delivery") {
      return NextResponse.json(
        { success: false, error: "Only delivery orders can be dispatched" },
        { status: 400 }
      );
    }

    if (order.delivery_status === "dispatched" || order.delivery_status === "in_transit" || order.delivery_status === "delivered") {
      return NextResponse.json(
        { success: false, error: `Order already ${order.delivery_status}` },
        { status: 400 }
      );
    }

    // Mock Uber Direct dispatch — generate a fake uber_direct_id
    const mockUberDirectId = `ud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    order.delivery_status = "dispatched";
    order.uber_direct_id = mockUberDirectId;
    order.order_status = "preparing";
    order.updated_at = new Date();

    log("Order dispatched via Uber Direct (mock)", {
      order_id: order.id,
      uber_direct_id: mockUberDirectId,
      delivery_status: order.delivery_status,
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      uber_direct_id: mockUberDirectId,
      delivery_status: "dispatched",
      message: "Order dispatched to Uber Direct driver",
    });
  } catch (error) {
    logError("POST /api/orders/dispatch failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
