"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
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
  if (!sentiment) return "text-zinc-500";
  const s = sentiment.toLowerCase();
  if (s === "positive") return "text-green-400";
  if (s === "negative") return "text-red-400";
  return "text-zinc-500";
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

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    case "confirmed":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "preparing":
      return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    case "ready":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "completed":
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    default:
      return "bg-white/[0.05] text-zinc-400 border border-white/[0.06]";
  }
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
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-zinc-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error ?? "Order not found"}</p>
        <Link href="/dashboard">
          <button className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-colors text-sm">
            Back to Orders
          </button>
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
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <span aria-hidden="true">&larr;</span> Back to Orders
      </Link>

      {/* Order header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">{order.id}</h1>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.order_status)}`}
        >
          {STATUS_LABELS[order.order_status] ?? order.order_status}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Info */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">Customer Information</h2>
            </div>
            <div className="px-6 py-5">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-300">
                    {order.customer_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-300">
                    {order.customer_phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500">
                    Order Type
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-zinc-300 capitalize">
                    {order.order_type}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">Order Items</h2>
            </div>
            <div className="px-6 py-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="pb-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Item</th>
                      <th className="pb-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Qty</th>
                      <th className="pb-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Unit Price</th>
                      <th className="pb-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Customizations</th>
                      <th className="pb-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {order.order_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-medium text-zinc-300">
                          {item.name}
                        </td>
                        <td className="py-3 text-center text-zinc-400">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right text-zinc-400">
                          {formatPrice(item.unit_price)}
                        </td>
                        <td className="py-3">
                          {Object.keys(item.customizations).length > 0 ? (
                            <span className="text-xs text-zinc-500">
                              {Object.entries(item.customizations)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(", ")}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-600">
                              None
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-medium text-zinc-300">
                          {formatPrice(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/[0.06]">
                      <td colSpan={4} className="pt-3 text-right font-bold text-white">
                        Total
                      </td>
                      <td className="pt-3 text-right font-bold text-white">
                        {formatPrice(order.order_total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {order.special_requests && (
                <>
                  <div className="my-4 border-t border-white/[0.06]" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Special Requests
                    </p>
                    <p className="mt-1 text-sm text-zinc-300">{order.special_requests}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column (1/3 width) */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">Status Timeline</h2>
            </div>
            <div className="px-6 py-5">
              {isCancelled ? (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-400">
                    Order Cancelled
                  </span>
                </div>
              ) : (
                <ol className="relative space-y-4 border-l-2 border-white/[0.06] pl-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <li key={step} className="relative">
                        <div
                          className={`absolute -left-[calc(1.5rem+5px)] top-0.5 h-3 w-3 rounded-full border-2 ${
                            isCurrent
                              ? "border-orange-500 bg-orange-500"
                              : isActive
                                ? "border-orange-500 bg-orange-500/30"
                                : "border-white/[0.06] bg-[#060606]"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            isCurrent
                              ? "font-bold text-white"
                              : isActive
                                ? "font-medium text-zinc-300"
                                : "text-zinc-600"
                          }`}
                        >
                          {STATUS_LABELS[step]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="my-4 border-t border-white/[0.06]" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-zinc-300">{formatTimestamp(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last Updated</span>
                  <span className="text-zinc-300">{formatTimestamp(order.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Info */}
          {order.call_id && (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="text-base font-semibold text-white">Call Information</h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Duration</span>
                  <span className="font-medium text-zinc-300">
                    {formatDuration(order.call_duration_seconds)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Sentiment</span>
                  <span
                    className={`font-medium capitalize ${getSentimentColor(order.sentiment)}`}
                  >
                    {order.sentiment ?? "N/A"}
                  </span>
                </div>

                {order.transcript && (
                  <>
                    <div className="border-t border-white/[0.06]" />
                    <div>
                      <p className="mb-2 text-sm font-medium text-zinc-500">
                        Transcript
                      </p>
                      <div className="max-h-60 overflow-y-auto rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed whitespace-pre-wrap text-zinc-400">
                        {order.transcript}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-white/[0.06]" />
      <div className="flex flex-wrap gap-3">
        {order.order_status !== "ready" &&
          order.order_status !== "completed" &&
          order.order_status !== "cancelled" && (
            <button
              onClick={() => updateStatus("ready")}
              disabled={updating}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updating ? "Updating..." : "Mark Ready"}
            </button>
          )}

        {order.order_status !== "completed" &&
          order.order_status !== "cancelled" && (
            <button
              onClick={() => updateStatus("completed")}
              disabled={updating}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updating ? "Updating..." : "Complete Order"}
            </button>
          )}

        {order.order_status !== "completed" &&
          order.order_status !== "cancelled" && (
            <button
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
              className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updating ? "Updating..." : "Cancel Order"}
            </button>
          )}

        {(order.order_status === "completed" ||
          order.order_status === "cancelled") && (
          <p className="text-sm text-zinc-500 italic">
            This order has been{" "}
            {order.order_status === "completed" ? "completed" : "cancelled"}. No
            further actions available.
          </p>
        )}
      </div>
    </div>
  );
}
