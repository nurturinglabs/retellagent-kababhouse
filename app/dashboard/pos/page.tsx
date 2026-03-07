"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  ChefHat,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface LineItem {
  id: string;
  name: string;
  price: number;
  unitQty: number;
  note?: string;
}

interface CloverOrder {
  id: string;
  title: string;
  note?: string;
  state: string;
  createdTime: number;
  modifiedTime: number;
  lineItems: LineItem[];
}

interface POSData {
  mock_mode: boolean;
  orders: CloverOrder[];
  summary: {
    total: number;
    open: number;
    in_progress: number;
    fulfilled: number;
  };
}

const stateConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  open: {
    label: "New",
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    icon: Clock,
  },
  in_progress: {
    label: "Preparing",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: ChefHat,
  },
  fulfilled: {
    label: "Ready",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};

export default function POSPage() {
  const [data, setData] = useState<POSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/pos");
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to fetch POS data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateState(orderId: string, newState: string) {
    setUpdatingId(orderId);
    try {
      await fetch("/api/dashboard/pos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, state: newState }),
      });
      await fetchOrders();
    } catch {
      console.error("Failed to update order state");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getElapsed(ts: number) {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return "Just now";
    return `${mins}m ago`;
  }

  const openOrders = data?.orders.filter((o) => o.state === "open") ?? [];
  const inProgressOrders =
    data?.orders.filter((o) => o.state === "in_progress") ?? [];
  const fulfilledOrders =
    data?.orders.filter((o) => o.state === "fulfilled") ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6 text-orange-600" />
            Clover POS — Kitchen Display
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.mock_mode && (
              <Badge variant="outline" className="mr-2 text-orange-600 border-orange-300">
                Mock Mode
              </Badge>
            )}
            Orders sync from voice ordering system. Auto-refreshes every 5s.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl font-bold">{data?.summary.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-yellow-600 uppercase tracking-wide">New / Open</p>
            <p className="text-2xl font-bold text-yellow-700">
              {data?.summary.open ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-blue-600 uppercase tracking-wide">Preparing</p>
            <p className="text-2xl font-bold text-blue-700">
              {data?.summary.in_progress ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-green-600 uppercase tracking-wide">Ready</p>
            <p className="text-2xl font-bold text-green-700">
              {data?.summary.fulfilled ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {data && data.orders.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              No orders yet
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
              Orders will appear here when customers place them through the
              voice agent or the order API. Try placing a test order using the
              curl command from the testing guide.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Kanban-Style Columns */}
      {data && data.orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column: New */}
          <div>
            <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> New Orders ({openOrders.length})
            </h2>
            <div className="space-y-3">
              {openOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={() => updateState(order.id, "in_progress")}
                  actionLabel="Start Preparing"
                  actionColor="bg-blue-600 hover:bg-blue-700 text-white"
                  updating={updatingId === order.id}
                  formatTime={formatTime}
                  getElapsed={getElapsed}
                />
              ))}
              {openOrders.length === 0 && (
                <p className="text-xs text-gray-400 italic">No new orders</p>
              )}
            </div>
          </div>

          {/* Column: Preparing */}
          <div>
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <ChefHat className="h-4 w-4" /> Preparing ({inProgressOrders.length})
            </h2>
            <div className="space-y-3">
              {inProgressOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={() => updateState(order.id, "fulfilled")}
                  actionLabel="Mark Ready"
                  actionColor="bg-green-600 hover:bg-green-700 text-white"
                  updating={updatingId === order.id}
                  formatTime={formatTime}
                  getElapsed={getElapsed}
                />
              ))}
              {inProgressOrders.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No orders being prepared
                </p>
              )}
            </div>
          </div>

          {/* Column: Ready */}
          <div>
            <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Ready ({fulfilledOrders.length})
            </h2>
            <div className="space-y-3">
              {fulfilledOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updating={false}
                  formatTime={formatTime}
                  getElapsed={getElapsed}
                />
              ))}
              {fulfilledOrders.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No orders ready
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">
            How the Clover POS Integration Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-500 space-y-2">
          <p>
            <strong>1. Customer orders</strong> via voice agent (Retell) or API
            call.
          </p>
          <p>
            <strong>2. Order syncs to Clover POS</strong> — appears here as
            &quot;New&quot; with line items and special instructions.
          </p>
          <p>
            <strong>3. Kitchen staff clicks &quot;Start Preparing&quot;</strong>{" "}
            — order moves to the Preparing column.
          </p>
          <p>
            <strong>4. When food is ready</strong>, click &quot;Mark Ready&quot;
            — customer gets notified.
          </p>
          <p className="text-xs text-orange-600 mt-3">
            Currently running in <strong>Mock Mode</strong> — orders are stored
            in-memory. Connect real Clover credentials in Settings to sync with
            your actual POS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order Card Component
// ---------------------------------------------------------------------------

function OrderCard({
  order,
  onAction,
  actionLabel,
  actionColor,
  updating,
  formatTime,
  getElapsed,
}: {
  order: CloverOrder;
  onAction?: () => void;
  actionLabel?: string;
  actionColor?: string;
  updating: boolean;
  formatTime: (ts: number) => string;
  getElapsed: (ts: number) => string;
}) {
  const config = stateConfig[order.state] || stateConfig.open;
  const Icon = config.icon;
  const totalCents = order.lineItems.reduce(
    (sum, li) => sum + li.price * li.unitQty,
    0
  );

  return (
    <Card className={`border ${config.bg}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm">{order.id}</p>
            <p className="text-xs text-gray-500">
              {order.title.replace("Voice Order - ", "")}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${config.color} border-current`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Line items */}
        <div className="space-y-1">
          {order.lineItems.map((li) => (
            <div key={li.id} className="flex justify-between text-sm">
              <span>
                {li.unitQty}x {li.name}
              </span>
              <span className="text-gray-500">
                ${((li.price * li.unitQty) / 100).toFixed(2)}
              </span>
            </div>
          ))}
          {order.lineItems.length === 0 && (
            <p className="text-xs text-gray-400 italic">No items yet</p>
          )}
        </div>

        {/* Note */}
        {order.note && (
          <p className="text-xs text-orange-700 bg-orange-50 rounded px-2 py-1">
            Note: {order.note}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-200">
          <div className="text-xs text-gray-400">
            {formatTime(order.createdTime)} &middot;{" "}
            {getElapsed(order.createdTime)}
          </div>
          <p className="text-sm font-semibold">
            ${(totalCents / 100).toFixed(2)}
          </p>
        </div>

        {/* Action button */}
        {onAction && actionLabel && (
          <Button
            size="sm"
            className={`w-full ${actionColor}`}
            onClick={onAction}
            disabled={updating}
          >
            {updating ? "Updating..." : actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
