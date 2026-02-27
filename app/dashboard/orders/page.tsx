"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Loader2 } from "lucide-react";
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

interface DashboardData {
  orders: Order[];
  stats: {
    total_orders_today: number;
    revenue_today: number;
    avg_order_value: number;
    total_calls_today: number;
  };
}

// ---- Demo data -------------------------------------------------------------

const DEMO_ORDERS: Order[] = [
  {
    id: "ORD-20260226-001",
    customer_name: "Ahmad Hassan",
    customer_phone: "+15551234567",
    order_type: "pickup",
    order_items: [
      { name: "Chicken Shawarma Plate", quantity: 2, unit_price: 15.99, customizations: {}, subtotal: 31.98 },
      { name: "Hummus", quantity: 1, unit_price: 6.99, customizations: {}, subtotal: 6.99 },
      { name: "Baklava", quantity: 2, unit_price: 4.99, customizations: {}, subtotal: 9.98 },
    ],
    special_requests: "Extra garlic sauce",
    order_total: 48.95,
    order_status: "preparing",
    pickup_time: "12:30 PM",
    created_at: new Date(Date.now() - 25 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 10 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-002",
    customer_name: "Sarah Johnson",
    customer_phone: "+15559876543",
    order_type: "pickup",
    order_items: [
      { name: "Lamb Kabob Sandwich", quantity: 1, unit_price: 12.99, customizations: {}, subtotal: 12.99 },
      { name: "Falafel Plate", quantity: 1, unit_price: 13.99, customizations: {}, subtotal: 13.99 },
    ],
    special_requests: "",
    order_total: 26.98,
    order_status: "confirmed",
    pickup_time: "1:00 PM",
    created_at: new Date(Date.now() - 15 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 14 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-003",
    customer_name: "Mike Chen",
    customer_phone: "+15555551234",
    order_type: "delivery",
    order_items: [
      { name: "Mixed Grill Plate", quantity: 1, unit_price: 22.99, customizations: {}, subtotal: 22.99 },
      { name: "Tabbouleh", quantity: 1, unit_price: 7.99, customizations: {}, subtotal: 7.99 },
      { name: "Garlic Naan", quantity: 2, unit_price: 3.99, customizations: {}, subtotal: 7.98 },
    ],
    special_requests: "No onions",
    order_total: 38.96,
    order_status: "pending",
    delivery_address: "123 Main St, Oak Creek, WI",
    created_at: new Date(Date.now() - 5 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 5 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-004",
    customer_name: "Lisa Park",
    customer_phone: "+15557778888",
    order_type: "pickup",
    order_items: [
      { name: "Chicken Shawarma Sandwich", quantity: 2, unit_price: 11.99, customizations: {}, subtotal: 23.98 },
    ],
    special_requests: "",
    order_total: 23.98,
    order_status: "ready",
    pickup_time: "12:15 PM",
    created_at: new Date(Date.now() - 40 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 2 * 60 * 1000) as unknown as Date,
  },
  {
    id: "ORD-20260226-005",
    customer_name: "James Wilson",
    customer_phone: "+15553334444",
    order_type: "pickup",
    order_items: [
      { name: "Beef Kabob Plate", quantity: 1, unit_price: 17.99, customizations: {}, subtotal: 17.99 },
      { name: "Lentil Soup", quantity: 1, unit_price: 5.99, customizations: {}, subtotal: 5.99 },
    ],
    special_requests: "",
    order_total: 23.98,
    order_status: "completed",
    pickup_time: "11:30 AM",
    created_at: new Date(Date.now() - 90 * 60 * 1000) as unknown as Date,
    updated_at: new Date(Date.now() - 60 * 60 * 1000) as unknown as Date,
  },
];

// ---- Helpers ---------------------------------------------------------------

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed:  { label: "Confirmed",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  preparing:  { label: "Preparing",  className: "bg-orange-100 text-orange-800 border-orange-200" },
  ready:      { label: "Ready",      className: "bg-green-100 text-green-800 border-green-200" },
  completed:  { label: "Completed",  className: "bg-gray-100 text-gray-700 border-gray-200" },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-800 border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.pending;
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
  return joined.length > 50 ? joined.slice(0, 47) + "..." : joined;
}

// ---- Page ------------------------------------------------------------------

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: DashboardData = await res.json();
      if (data.orders.length > 0) setOrders(data.orders);
    } catch {
      // keep demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/dashboard/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, order_status: newStatus as Order["order_status"] } : o
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all incoming orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-1.5">Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No orders yet. Orders will appear here as they come in.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">
                        {order.order_type === "delivery" ? "Delivery" : "Pickup"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                      {truncateItems(order.order_items)}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.order_total)}</TableCell>
                    <TableCell><StatusBadge status={order.order_status} /></TableCell>
                    <TableCell className="hidden text-sm text-gray-500 sm:table-cell">
                      {formatTime(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="xs" asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>View</Link>
                        </Button>
                        {(order.order_status === "confirmed" || order.order_status === "preparing") && (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={updatingOrderId === order.id}
                            onClick={() => updateOrderStatus(order.id, "ready")}
                          >
                            {updatingOrderId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Ready"}
                          </Button>
                        )}
                        {order.order_status === "ready" && (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={updatingOrderId === order.id}
                            onClick={() => updateOrderStatus(order.id, "completed")}
                          >
                            {updatingOrderId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Complete"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
