import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, updateOrderStatus } from "@/lib/store";
import type { Order } from "@/lib/types";

// Map local order_status values to POS state values
const STATUS_TO_STATE: Record<string, string> = {
  pending: "open",
  confirmed: "open",
  preparing: "in_progress",
  ready: "fulfilled",
  completed: "fulfilled",
  cancelled: "cancelled",
};

const STATE_TO_STATUS: Record<string, string> = {
  open: "confirmed",
  in_progress: "preparing",
  fulfilled: "ready",
  cancelled: "cancelled",
};

// Convert a local Order to the CloverOrder shape the POS page expects
function toCloverOrder(order: Order) {
  return {
    id: order.id,
    title: `Voice Order - ${order.customer_name || "Customer"}`,
    note: [
      order.customer_phone && order.customer_phone !== "unknown"
        ? `Phone: ${order.customer_phone}`
        : null,
      order.special_requests ? `Special: ${order.special_requests}` : null,
    ]
      .filter(Boolean)
      .join(" | ") || undefined,
    state: STATUS_TO_STATE[order.order_status] || "open",
    createdTime: order.created_at.getTime(),
    modifiedTime: order.updated_at.getTime(),
    lineItems: (order.order_items || []).map((item, idx) => ({
      id: `LI-${order.id}-${idx}`,
      name: item.name,
      price: Math.round(item.unit_price * 100), // dollars → cents
      unitQty: item.quantity,
    })),
  };
}

/**
 * GET — Return all orders for the POS kitchen display.
 * Reads from the same local store that the webhook writes to.
 */
export async function GET() {
  const orders = await getAllOrders();
  const posOrders = orders.map(toCloverOrder);

  return NextResponse.json({
    mock_mode: true,
    orders: posOrders,
    summary: {
      total: posOrders.length,
      open: posOrders.filter((o) => o.state === "open").length,
      in_progress: posOrders.filter((o) => o.state === "in_progress").length,
      fulfilled: posOrders.filter((o) => o.state === "fulfilled").length,
    },
  });
}

/**
 * PATCH — Update an order's state (e.g., open → in_progress → fulfilled).
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

  // Convert POS state back to local order status
  const newStatus = STATE_TO_STATUS[state] || state;
  const updated = await updateOrderStatus(order_id, newStatus);

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, order: toCloverOrder(updated) });
}
