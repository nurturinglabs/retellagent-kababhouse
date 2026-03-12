"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Loader2, Truck, DollarSign, TrendingUp, Package } from "lucide-react";
import type { Order } from "@/lib/types";

// ---- Types -----------------------------------------------------------------

interface DeliveryStats {
  total_delivery_orders_today: number;
  status_breakdown: {
    awaiting_dispatch: number;
    dispatched: number;
    in_transit: number;
    delivered: number;
  };
  delivery_revenue_today: number;
  food_total_today: number;
  delivery_fees_today: number;
  commission_saved_today: number;
}

interface DeliveryData {
  orders: Order[];
  stats: DeliveryStats;
}

// ---- Demo data -------------------------------------------------------------

const DEMO_DELIVERY_ORDERS: Order[] = [
  {
    id: "ORD-20260226-101",
    customer_name: "Maria Garcia",
    customer_phone: "+15551112222",
    order_type: "delivery",
    order_items: [
      { name: "Mix Grill Plate", quantity: 1, unit_price: 28.99, customizations: {}, subtotal: 28.99 },
      { name: "Hummus", quantity: 1, unit_price: 9.99, customizations: {}, subtotal: 9.99 },
    ],
    special_requests: "",
    order_total: 45.97,
    order_status: "confirmed",
    delivery_address: "456 Oak Ave",
    delivery_city: "Oak Creek",
    delivery_zip: "53154",
    delivery_fee: 6.99,
    delivery_status: "awaiting_dispatch",
    estimated_delivery_time: "35-45 minutes",
    created_at: new Date(Date.now() - 10 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 10 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-102",
    customer_name: "David Kim",
    customer_phone: "+15553334444",
    order_type: "delivery",
    order_items: [
      { name: "Chicken Shawarma Plate", quantity: 2, unit_price: 23.99, customizations: {}, subtotal: 47.98 },
      { name: "Baklava", quantity: 2, unit_price: 4.99, customizations: {}, subtotal: 9.98 },
    ],
    special_requests: "Extra garlic sauce on the side",
    order_total: 64.95,
    order_status: "preparing",
    delivery_address: "789 Pine St, Apt 3B",
    delivery_city: "Oak Creek",
    delivery_zip: "53154",
    delivery_fee: 6.99,
    delivery_status: "dispatched",
    estimated_delivery_time: "35-45 minutes",
    uber_direct_id: "ud_1740580000_abc123",
    created_at: new Date(Date.now() - 25 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 15 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-103",
    customer_name: "Sarah Mitchell",
    customer_phone: "+15555556666",
    order_type: "delivery",
    order_items: [
      { name: "Beef Shawarma Sandwich", quantity: 1, unit_price: 12.99, customizations: {}, subtotal: 12.99 },
      { name: "Fries (Large)", quantity: 1, unit_price: 6.99, customizations: {}, subtotal: 6.99 },
    ],
    special_requests: "",
    order_total: 26.97,
    order_status: "preparing",
    delivery_address: "321 Elm St",
    delivery_city: "Oak Creek",
    delivery_zip: "53154",
    delivery_fee: 6.99,
    delivery_status: "in_transit",
    estimated_delivery_time: "35-45 minutes",
    uber_direct_id: "ud_1740578000_def456",
    created_at: new Date(Date.now() - 40 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 20 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-104",
    customer_name: "James Thompson",
    customer_phone: "+15557778888",
    order_type: "delivery",
    order_items: [
      { name: "Lamb Kabob Plate", quantity: 1, unit_price: 26.99, customizations: {}, subtotal: 26.99 },
      { name: "Tabbouleh Salad", quantity: 1, unit_price: 9.99, customizations: {}, subtotal: 9.99 },
      { name: "Garlic Sauce (container)", quantity: 2, unit_price: 2.99, customizations: {}, subtotal: 5.98 },
    ],
    special_requests: "No onions on the plate",
    order_total: 49.95,
    order_status: "completed",
    delivery_address: "555 Maple Dr",
    delivery_city: "Oak Creek",
    delivery_zip: "53154",
    delivery_fee: 6.99,
    delivery_status: "delivered",
    estimated_delivery_time: "35-45 minutes",
    uber_direct_id: "ud_1740575000_ghi789",
    created_at: new Date(Date.now() - 90 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 55 * 60 * 1000) as unknown as Date,
  },
];

// ---- Helpers ---------------------------------------------------------------

const deliveryStatusConfig: Record<string, { label: string; className: string }> = {
  awaiting_dispatch: { label: "Awaiting Dispatch", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  dispatched:        { label: "Dispatched",        className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  in_transit:        { label: "In Transit",        className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  delivered:         { label: "Delivered",          className: "bg-green-500/10 text-green-400 border-green-500/20" },
};

function DeliveryStatusBadge({ status }: { status: string }) {
  const config = deliveryStatusConfig[status] ?? deliveryStatusConfig.awaiting_dispatch;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function formatCurrency(n: number) { return `$${n.toFixed(2)}`; }

function formatTime(dateValue: Date | string) {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function truncateItems(items: { name: string; quantity: number }[]) {
  const names = items.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ""}`);
  const joined = names.join(", ");
  return joined.length > 45 ? joined.slice(0, 42) + "..." : joined;
}

// ---- Page ------------------------------------------------------------------

export default function DeliveryPage() {
  const [orders, setOrders] = useState<Order[]>(DEMO_DELIVERY_ORDERS);
  const [loading, setLoading] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const [stats, setStats] = useState<DeliveryStats>(() => {
    // Compute demo stats
    const foodTotal = DEMO_DELIVERY_ORDERS.reduce((s, o) => s + o.order_total - (o.delivery_fee ?? 0), 0);
    return {
      total_delivery_orders_today: DEMO_DELIVERY_ORDERS.length,
      status_breakdown: {
        awaiting_dispatch: DEMO_DELIVERY_ORDERS.filter((o) => o.delivery_status === "awaiting_dispatch").length,
        dispatched: DEMO_DELIVERY_ORDERS.filter((o) => o.delivery_status === "dispatched").length,
        in_transit: DEMO_DELIVERY_ORDERS.filter((o) => o.delivery_status === "in_transit").length,
        delivered: DEMO_DELIVERY_ORDERS.filter((o) => o.delivery_status === "delivered").length,
      },
      delivery_revenue_today: Math.round(DEMO_DELIVERY_ORDERS.reduce((s, o) => s + o.order_total, 0) * 100) / 100,
      food_total_today: Math.round(foodTotal * 100) / 100,
      delivery_fees_today: Math.round(DEMO_DELIVERY_ORDERS.reduce((s, o) => s + (o.delivery_fee ?? 0), 0) * 100) / 100,
      commission_saved_today: Math.round(foodTotal * 0.25 * 100) / 100,
    };
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/delivery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: DeliveryData = await res.json();
      if (data.orders.length > 0) {
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch {
      // keep demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dispatchOrder = async (orderId: string) => {
    setDispatchingId(orderId);
    try {
      const res = await fetch("/api/orders/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  delivery_status: "dispatched" as const,
                  uber_direct_id: data.uber_direct_id,
                  order_status: "preparing" as const,
                }
              : o
          )
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          status_breakdown: {
            ...prev.status_breakdown,
            awaiting_dispatch: prev.status_breakdown.awaiting_dispatch - 1,
            dispatched: prev.status_breakdown.dispatched + 1,
          },
        }));
      }
    } catch {
      // silently fail
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Delivery Orders</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage delivery orders and Uber Direct dispatch</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.05] px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Truck className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total_delivery_orders_today}</p>
              <p className="text-xs text-zinc-500">Deliveries Today</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-[11px]">
            <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-yellow-400">{stats.status_breakdown.awaiting_dispatch} waiting</span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400">{stats.status_breakdown.dispatched} dispatched</span>
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-400">{stats.status_breakdown.in_transit} in transit</span>
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-400">{stats.status_breakdown.delivered} delivered</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.delivery_revenue_today)}</p>
              <p className="text-xs text-zinc-500">Delivery Revenue</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            Food: {formatCurrency(stats.food_total_today)} + Fees: {formatCurrency(stats.delivery_fees_today)}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.commission_saved_today)}</p>
              <p className="text-xs text-zinc-500">Commission Saved</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            vs DoorDash 25% commission on {formatCurrency(stats.food_total_today)} food sales
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5">
              <Package className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.delivery_fees_today)}</p>
              <p className="text-xs text-zinc-500">Delivery Fees Collected</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">
            $6.99 flat fee per delivery order
          </p>
        </div>
      </div>

      {/* Delivery Orders Table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Delivery Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Customer</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 lg:table-cell">Items</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 md:table-cell">Delivery Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Food Total</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">Del. Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Status</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500">
                    No delivery orders yet. Delivery orders will appear here as they come in.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const foodTotal = order.order_total - (order.delivery_fee ?? 0);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-300">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-300">{order.customer_name}</div>
                        <div className="text-xs text-zinc-500">{order.customer_phone}</div>
                      </td>
                      <td className="hidden max-w-[180px] truncate px-4 py-3 text-sm text-zinc-400 lg:table-cell">
                        {truncateItems(order.order_items)}
                      </td>
                      <td className="hidden max-w-[160px] px-4 py-3 md:table-cell">
                        <div className="text-xs text-zinc-300">{order.delivery_address}</div>
                        {order.delivery_city && (
                          <div className="text-xs text-zinc-600">{order.delivery_city}, {order.delivery_zip}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">{formatCurrency(foodTotal)}</td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-zinc-500 sm:table-cell">
                        {formatCurrency(order.delivery_fee ?? 0)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-300">{formatCurrency(order.order_total)}</td>
                      <td className="px-4 py-3">
                        <DeliveryStatusBadge status={order.delivery_status ?? "awaiting_dispatch"} />
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-zinc-500 sm:table-cell">
                        {formatTime(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {order.delivery_status === "awaiting_dispatch" ? (
                          <button
                            disabled={dispatchingId === order.id}
                            onClick={() => dispatchOrder(order.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
                          >
                            {dispatchingId === order.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Truck className="h-3 w-3" />
                                <span>Dispatch</span>
                              </>
                            )}
                          </button>
                        ) : order.delivery_status === "dispatched" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400">
                            Dispatched &#10003;
                          </span>
                        ) : order.delivery_status === "in_transit" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400">
                            In Transit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
                            Delivered &#10003;
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
