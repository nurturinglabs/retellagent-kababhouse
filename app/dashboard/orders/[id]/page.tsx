"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import type { Order } from "@/lib/types";
import { formatPrice, getStatusColor } from "@/lib/utils";

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getSentimentColor(sentiment: string | undefined): string {
  if (!sentiment) return "text-muted-foreground";
  const s = sentiment.toLowerCase();
  if (s === "positive") return "text-green-600";
  if (s === "negative") return "text-red-600";
  return "text-gray-500";
}

function formatTimestamp(date: Date | string | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/orders/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.statusText}`);
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  async function updateStatus(newStatus: string) {
    try {
      setUpdating(true);
      const res = await fetch(`/api/dashboard/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update order: ${res.statusText}`);
      }
      const data = await res.json();
      setOrder(data.order ?? data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ?? "Order not found"}</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(
    order.order_status as (typeof STATUS_STEPS)[number]
  );
  const isCancelled = order.order_status === "cancelled";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span aria-hidden="true">&larr;</span> Back to Orders
      </Link>

      {/* Order header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{order.id}</h1>
        <Badge className={getStatusColor(order.order_status)}>
          {STATUS_LABELS[order.order_status] ?? order.order_status}
        </Badge>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {order.customer_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {order.customer_phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Order Type
                  </dt>
                  <dd className="mt-1 text-sm font-semibold capitalize">
                    {order.order_type}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead>Customizations</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.unit_price)}
                      </TableCell>
                      <TableCell>
                        {Object.keys(item.customizations).length > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {Object.entries(item.customizations)
                              .map(([key, val]) => `${key}: ${val}`)
                              .join(", ")}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatPrice(order.order_total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              {order.special_requests && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Special Requests
                    </p>
                    <p className="mt-1 text-sm">{order.special_requests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column (1/3 width) */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled ? (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Order Cancelled
                  </span>
                </div>
              ) : (
                <ol className="relative space-y-4 border-l-2 border-muted pl-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <li key={step} className="relative">
                        <div
                          className={`absolute -left-[calc(1.5rem+5px)] top-0.5 h-3 w-3 rounded-full border-2 ${
                            isCurrent
                              ? "border-primary bg-primary"
                              : isActive
                                ? "border-primary bg-primary/30"
                                : "border-muted bg-background"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isCurrent
                              ? "font-bold text-foreground"
                              : isActive
                                ? "font-medium text-foreground/80"
                                : "text-muted-foreground"
                          }`}
                        >
                          {STATUS_LABELS[step]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatTimestamp(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatTimestamp(order.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Info */}
          {order.call_id && (
            <Card>
              <CardHeader>
                <CardTitle>Call Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {formatDuration(order.call_duration_seconds)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sentiment</span>
                  <span
                    className={`font-medium capitalize ${getSentimentColor(order.sentiment)}`}
                  >
                    {order.sentiment ?? "N/A"}
                  </span>
                </div>

                {order.transcript && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Transcript
                      </p>
                      <div className="max-h-60 overflow-y-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed whitespace-pre-wrap">
                        {order.transcript}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <Separator />
      <div className="flex flex-wrap gap-3">
        {order.order_status !== "ready" &&
          order.order_status !== "completed" &&
          order.order_status !== "cancelled" && (
            <Button
              onClick={() => updateStatus("ready")}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updating ? "Updating..." : "Mark Ready"}
            </Button>
          )}

        {order.order_status !== "completed" &&
          order.order_status !== "cancelled" && (
            <Button
              onClick={() => updateStatus("completed")}
              disabled={updating}
              variant="default"
            >
              {updating ? "Updating..." : "Complete Order"}
            </Button>
          )}

        {order.order_status !== "completed" &&
          order.order_status !== "cancelled" && (
            <Button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to cancel this order?"
                  )
                ) {
                  updateStatus("cancelled");
                }
              }}
              disabled={updating}
              variant="destructive"
            >
              {updating ? "Updating..." : "Cancel Order"}
            </Button>
          )}

        {(order.order_status === "completed" ||
          order.order_status === "cancelled") && (
          <p className="text-sm text-muted-foreground italic">
            This order has been{" "}
            {order.order_status === "completed" ? "completed" : "cancelled"}. No
            further actions available.
          </p>
        )}
      </div>
    </div>
  );
}
