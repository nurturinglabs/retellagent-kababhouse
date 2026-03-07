import { NextRequest, NextResponse } from "next/server";
import {
  getMockCloverOrders,
  updateMockCloverOrderState,
} from "@/lib/clover";

/**
 * GET — Return all mock Clover POS orders (kitchen display).
 */
export async function GET() {
  const orders = await getMockCloverOrders();

  return NextResponse.json({
    mock_mode: true,
    orders,
    summary: {
      total: orders.length,
      open: orders.filter((o) => o.state === "open").length,
      in_progress: orders.filter((o) => o.state === "in_progress").length,
      fulfilled: orders.filter((o) => o.state === "fulfilled").length,
    },
  });
}

/**
 * PATCH — Update a mock Clover order's state (e.g., open → in_progress → fulfilled).
 */
export async function PATCH(request: NextRequest) {
  const { order_id, state } = await request.json();

  if (!order_id || !state) {
    return NextResponse.json(
      { success: false, error: "order_id and state are required" },
      { status: 400 }
    );
  }

  const validStates = ["open", "in_progress", "fulfilled", "cancelled"];
  if (!validStates.includes(state)) {
    return NextResponse.json(
      { success: false, error: `Invalid state. Must be one of: ${validStates.join(", ")}` },
      { status: 400 }
    );
  }

  const updated = await updateMockCloverOrderState(order_id, state);

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, order: updated });
}
