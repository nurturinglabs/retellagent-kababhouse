"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Loader2, Truck, DollarSign, TrendingUp, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  awaiting_dispatch: { label: "Awaiting Dispatch", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  dispatched:        { label: "Dispatched",        className: "bg-blue-100 text-blue-800 border-blue-200" },
  in_transit:        { label: "In Transit",        className: "bg-orange-100 text-orange-800 border-orange-200" },
  delivered:         { label: "Delivered",          className: "bg-green-100 text-green-800 border-green-200" },
};

function DeliveryStatusBadge({ status }: { status: string }) {
  const config = deliveryStatusConfig[status] ?? deliveryStatusConfig.awaiting_dispatch;
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Delivery Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage delivery orders and Uber Direct dispatch</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-950/30">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_delivery_orders_today}</p>
                <p className="text-xs text-gray-500">Deliveries Today</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-[11px]">
              <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-700">{stats.status_breakdown.awaiting_dispatch} waiting</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{stats.status_breakdown.dispatched} dispatched</span>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">{stats.status_breakdown.in_transit} in transit</span>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-700">{stats.status_breakdown.delivered} delivered</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.delivery_revenue_today)}</p>
                <p className="text-xs text-gray-500">Delivery Revenue</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-gray-400">
              Food: {formatCurrency(stats.food_total_today)} + Fees: {formatCurrency(stats.delivery_fees_today)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2.5 dark:bg-orange-950/30">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.commission_saved_today)}</p>
                <p className="text-xs text-gray-500">Commission Saved</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-gray-400">
              vs DoorDash 25% commission on {formatCurrency(stats.food_total_today)} food sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5 dark:bg-purple-950/30">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.delivery_fees_today)}</p>
                <p className="text-xs text-gray-500">Delivery Fees Collected</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-gray-400">
              $6.99 flat fee per delivery order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Items</TableHead>
                <TableHead className="hidden md:table-cell">Delivery Address</TableHead>
                <TableHead>Food Total</TableHead>
                <TableHead className="hidden sm:table-cell">Del. Fee</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No delivery orders yet. Delivery orders will appear here as they come in.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const foodTotal = order.order_total - (order.delivery_fee ?? 0);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] truncate lg:table-cell">
                        {truncateItems(order.order_items)}
                      </TableCell>
                      <TableCell className="hidden max-w-[160px] md:table-cell">
                        <div className="text-xs">{order.delivery_address}</div>
                        {order.delivery_city && (
                          <div className="text-xs text-gray-400">{order.delivery_city}, {order.delivery_zip}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(foodTotal)}</TableCell>
                      <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                        {formatCurrency(order.delivery_fee ?? 0)}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(order.order_total)}</TableCell>
                      <TableCell>
                        <DeliveryStatusBadge status={order.delivery_status ?? "awaiting_dispatch"} />
                      </TableCell>
                      <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                        {formatTime(order.created_at)}
                      </TableCell>
                      <TableCell>
                        {order.delivery_status === "awaiting_dispatch" ? (
                          <Button
                            variant="default"
                            size="xs"
                            disabled={dispatchingId === order.id}
                            onClick={() => dispatchOrder(order.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {dispatchingId === order.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Truck className="h-3 w-3" />
                                <span className="ml-1">Dispatch</span>
                              </>
                            )}
                          </Button>
                        ) : order.delivery_status === "dispatched" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                            Dispatched &#10003;
                          </span>
                        ) : order.delivery_status === "in_transit" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                            In Transit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            Delivered &#10003;
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
