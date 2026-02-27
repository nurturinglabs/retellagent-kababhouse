"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const C = {
  primary: "#c2571a",
  secondary: "#e87d2f",
  teal: "#0d9488",
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  rose: "#ef4444",
  purple: "#8b5cf6",
};

const STACK = { pickup: C.primary, delivery: C.secondary, catering: C.teal, inquiry: C.blue };
const DONUT = [C.teal, C.primary, C.secondary, C.blue];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FilterMode = "daily" | "weekly" | "monthly";

interface DayEntry {
  rawDate: Date;
  date: string;
  pickup: number;
  delivery: number;
  catering: number;
  inquiry: number;
}

interface ChartEntry {
  date: string;
  pickup: number;
  delivery: number;
  catering: number;
  inquiry: number;
}

// ---------------------------------------------------------------------------
// Seeded random
// ---------------------------------------------------------------------------
function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// Generate 88 days of daily data (Dec 1, 2025 – Feb 26, 2026)
// ---------------------------------------------------------------------------
const allDailyData: DayEntry[] = (() => {
  const d: DayEntry[] = [];
  const start = new Date(2025, 11, 1); // Dec 1, 2025
  for (let i = 0; i < 88; i++) {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + i);
    const we = dt.getDay() === 0 || dt.getDay() === 6 ? 1.3 : 1.0;
    const tr = 1 + i * 0.003;
    const s = dt.getTime();
    d.push({
      rawDate: new Date(dt),
      date: dt.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      pickup: Math.round((3 + sr(s + 1) * 5) * we * tr),
      delivery: Math.round((1 + sr(s + 2) * 3) * we * tr),
      catering: sr(s + 3) > 0.7 ? Math.round(1 + sr(s + 4) * 2) : 0,
      inquiry: Math.round(1 + sr(s + 5) * 3),
    });
  }
  return d;
})();

// "Today" = Feb 26 (last day in the dataset)
const today = allDailyData[allDailyData.length - 1];

// ---------------------------------------------------------------------------
// TIME-WINDOW SLICES — each filter shows a different subset of data
// ---------------------------------------------------------------------------

// DAILY: Today only → chart shows hourly breakdown for a realistic busy day
const todayHourlyChart: ChartEntry[] = (() => {
  // Realistic hourly order volumes for a busy restaurant day (~50 total orders)
  const hours = [
    { h: "9 AM",  base: 2 },
    { h: "10 AM", base: 3 },
    { h: "11 AM", base: 5 },
    { h: "12 PM", base: 8 },
    { h: "1 PM",  base: 7 },
    { h: "2 PM",  base: 4 },
    { h: "3 PM",  base: 2 },
    { h: "4 PM",  base: 3 },
    { h: "5 PM",  base: 5 },
    { h: "6 PM",  base: 7 },
    { h: "7 PM",  base: 6 },
    { h: "8 PM",  base: 3 },
    { h: "9 PM",  base: 1 },
  ];
  return hours.map((slot, i) => {
    const seed = i * 137 + 42;
    const jitter = 0.8 + sr(seed) * 0.4; // 0.8 – 1.2x variation
    const total = Math.max(1, Math.round(slot.base * jitter));
    const pickup = Math.max(1, Math.round(total * (0.45 + sr(seed + 1) * 0.1)));
    const delivery = Math.max(0, Math.round(total * (0.20 + sr(seed + 2) * 0.1)));
    const catering = sr(seed + 3) > 0.75 ? Math.round(total * 0.08) : 0;
    const inquiry = Math.max(0, total - pickup - delivery - catering);
    return { date: slot.h, pickup, delivery, catering, inquiry };
  });
})();

// WEEKLY: Last 7 days → chart shows 7 daily bars
const last7Days = allDailyData.slice(-7);
const weeklyChart: ChartEntry[] = last7Days.map((d) => ({
  date: d.rawDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
  pickup: d.pickup,
  delivery: d.delivery,
  catering: d.catering,
  inquiry: d.inquiry,
}));

// MONTHLY: Last 30 days → chart shows 30 daily bars
const last30Days = allDailyData.slice(-30);
const monthlyChart: ChartEntry[] = last30Days.map((d) => ({
  date: d.date,
  pickup: d.pickup,
  delivery: d.delivery,
  catering: d.catering,
  inquiry: d.inquiry,
}));

// ---------------------------------------------------------------------------
// Stats computation — genuinely different per time window
// ---------------------------------------------------------------------------
interface DerivedStats {
  totalOrders: number;
  totalCalls: number;
  completed: number;
  cancelled: number;
  noShow: number;
  inProgress: number;
  customers: number;
  avgOrderValue: number;
  repeatRate: number;
  donutData: { name: string; value: number }[];
  statuses: { label: string; count: number; pct: number; dot: string; bar: string }[];
}

function computeStats(data: ChartEntry[], completionRate: number, cancelRate: number, noShowRate: number, avgOV: number, repeat: number): DerivedStats {
  const totalPickup = data.reduce((s, d) => s + d.pickup, 0);
  const totalDelivery = data.reduce((s, d) => s + d.delivery, 0);
  const totalCatering = data.reduce((s, d) => s + d.catering, 0);
  const totalInquiries = data.reduce((s, d) => s + d.inquiry, 0);
  const totalOrders = totalPickup + totalDelivery + totalCatering;
  const totalCalls = totalOrders + totalInquiries;

  const completed = Math.round(totalOrders * completionRate);
  const cancelled = Math.round(totalOrders * cancelRate);
  const noShow = Math.round(totalOrders * noShowRate);
  const inProgress = totalOrders - completed - cancelled - noShow;
  const customers = Math.max(1, Math.round(totalOrders * 0.72));

  const donutData = [
    { name: "Pickup", value: totalPickup },
    { name: "Delivery", value: totalDelivery },
    { name: "Catering", value: totalCatering },
    { name: "Inquiry", value: totalInquiries },
  ];

  const pct = (n: number) => (totalOrders ? Math.round((n / totalOrders) * 100) : 0);
  const statuses = [
    { label: "Completed", count: completed, pct: pct(completed), dot: "bg-emerald-500", bar: "bg-emerald-500" },
    { label: "Cancelled", count: cancelled, pct: pct(cancelled), dot: "bg-rose-500", bar: "bg-rose-500" },
    { label: "No show", count: noShow, pct: pct(noShow), dot: "bg-amber-500", bar: "bg-amber-500" },
    { label: "In Progress", count: inProgress, pct: pct(inProgress), dot: "bg-blue-500", bar: "bg-blue-500" },
  ];

  return { totalOrders, totalCalls, completed, cancelled, noShow, inProgress, customers, avgOrderValue: avgOV, repeatRate: repeat, donutData, statuses };
}

// Each time period has slightly different rates (realistic: daily fluctuates more)
const viewConfig: Record<FilterMode, {
  chart: ChartEntry[];
  stats: DerivedStats;
  dateRange: string;
  peakLabel: string;
  footerLabels: [string, string, string];
}> = {
  daily: {
    chart: todayHourlyChart,
    stats: computeStats(todayHourlyChart, 0.71, 0.08, 0.05, 31.20, 22),
    dateRange: "February 26, 2026",
    peakLabel: "12 PM",
    footerLabels: ["Orders Today", "Calls Today", "Customers"],
  },
  weekly: {
    chart: weeklyChart,
    stats: computeStats(weeklyChart, 0.78, 0.06, 0.04, 29.50, 32),
    dateRange: "Feb 20 – Feb 26, 2026",
    peakLabel: "6 PM",
    footerLabels: ["Orders", "Calls", "Customers"],
  },
  monthly: {
    chart: monthlyChart,
    stats: computeStats(monthlyChart, 0.83, 0.04, 0.03, 28.45, 38),
    dateRange: "Jan 28 – Feb 26, 2026",
    peakLabel: "6 PM",
    footerLabels: ["Orders", "Calls", "Customers"],
  },
};

// Busiest hours (static aggregate)
const busiestHours = [
  { hour: "9 AM", orders: 8 }, { hour: "10 AM", orders: 14 },
  { hour: "11 AM", orders: 28 }, { hour: "12 PM", orders: 42 },
  { hour: "1 PM", orders: 38 }, { hour: "2 PM", orders: 22 },
  { hour: "3 PM", orders: 15 }, { hour: "4 PM", orders: 18 },
  { hour: "5 PM", orders: 35 }, { hour: "6 PM", orders: 48 },
  { hour: "7 PM", orders: 44 }, { hour: "8 PM", orders: 30 },
  { hour: "9 PM", orders: 12 },
];

// ---------------------------------------------------------------------------
// Compact Tooltips
// ---------------------------------------------------------------------------
function VolTip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="mb-0.5 font-semibold text-gray-600">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
}

function HrTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-gray-600">{label}</p>
      <p className="font-bold text-[#c2571a]">{payload[0].value} orders</p>
    </div>
  );
}

// Tiny sparkline SVG
function Spark({ color, up = true }: { color: string; up?: boolean }) {
  const pts = up ? "2,14 8,10 14,12 20,6 26,8 32,2" : "2,2 8,6 14,4 20,10 26,8 32,14";
  return (
    <svg width="36" height="16" viewBox="0 0 36 16" fill="none" className="opacity-60">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("daily");

  useEffect(() => {
    setMounted(true);
    fetch("/api/dashboard/analytics")
      .then((r) => r.json())
      .then((j) => { if (j.totalOrders > 0) setIsLive(true); })
      .catch(() => {});
  }, []);

  // All values derived from the selected time window
  const view = viewConfig[filter];
  const { totalOrders, totalCalls, completed, cancelled, customers, avgOrderValue, repeatRate, donutData, statuses } = view.stats;
  const chartData = view.chart;

  // Completion percentage
  const completionPct = totalOrders ? Math.round((completed / totalOrders) * 100) : 0;
  const cancelPct = totalOrders ? Math.round((cancelled / totalOrders) * 100) : 0;

  // XAxis config per view
  const xInterval = filter === "monthly" ? 2 : 0;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Business Insights
          </h1>
          <p className="text-xs text-gray-500">
            {view.dateRange} &middot; {totalOrders.toLocaleString()} orders &middot; {customers} customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-[10px] text-amber-700">
              Demo Data
            </Badge>
          )}
          <div className="inline-flex rounded-lg border bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900">
            {(["daily", "weekly", "monthly"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  filter === mode
                    ? "bg-[#c2571a] text-white"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STAT CARDS (5) ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {([
          { icon: ShoppingBag, color: "#0d9488", value: totalOrders.toLocaleString(), label: "TOTAL ORDERS", up: true },
          { icon: Users, color: "#3b82f6", value: String(customers), label: "CUSTOMERS", up: true },
          { icon: CheckCircle2, color: "#22c55e", value: `${completionPct}%`, label: "COMPLETION", up: true },
          { icon: AlertTriangle, color: "#f59e0b", value: `${cancelPct}%`, label: "CANCELLATIONS", up: false },
          { icon: Clock, color: "#8b5cf6", value: view.peakLabel, label: "PEAK HOUR", up: true },
        ] as const).map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="flex items-start justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900"
            >
              <div>
                <Icon className="mb-2 h-4 w-4" style={{ color: c.color }} />
                <p className="text-xl font-bold leading-none" style={{ color: c.color }}>
                  {c.value}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                  {c.label}
                </p>
              </div>
              <Spark color={c.up ? "#22c55e" : "#ef4444"} up={c.up} />
            </div>
          );
        })}
      </div>

      {/* ── MIDDLE ROW: Stacked Bar + Donut ────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_280px] gap-3">
        {/* Order Volume by Type */}
        <div className="flex flex-col rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {filter === "daily" ? "Today\u2019s Orders by Hour" : filter === "weekly" ? "This Week\u2019s Orders" : "Last 30 Days Orders"}
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              {(["Pickup", "Delivery", "Catering", "Inquiry"] as const).map((n) => (
                <span key={n} className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: STACK[n.toLowerCase() as keyof typeof STACK] }} />
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={0} barCategoryGap={filter === "weekly" ? "25%" : "18%"}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    interval={xInterval}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<VolTip />} />
                  <Bar dataKey="pickup" stackId="a" fill={STACK.pickup} name="Pickup" />
                  <Bar dataKey="delivery" stackId="a" fill={STACK.delivery} name="Delivery" />
                  <Bar dataKey="catering" stackId="a" fill={STACK.catering} name="Catering" />
                  <Bar dataKey="inquiry" stackId="a" fill={STACK.inquiry} radius={[1.5, 1.5, 0, 0]} name="Inquiry" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut: Call Type Breakdown */}
        <div className="flex flex-col items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
          <h2 className="mb-1 self-start text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Call Type Breakdown
          </h2>
          <div className="flex flex-1 items-center justify-center">
            {mounted && (
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="value" strokeWidth={2} stroke="#fff">
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v?: number, n?: string) => [`${v ?? 0} calls`, n ?? ""]}
                    contentStyle={{ borderRadius: "8px", fontSize: "11px", border: "1px solid #e5e7eb" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-1">
            {donutData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: DONUT[i] }} />
                  {item.name}
                </span>
                <span className="font-bold text-gray-800">
                  {totalCalls ? Math.round((item.value / totalCalls) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Busiest Hours + Insights + Status ──────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Busiest Hours */}
        <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Busiest Hours
          </h2>
          <div className="h-[150px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={busiestHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#94a3b8" }} interval={1} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<HrTip />} />
                  <Bar dataKey="orders" fill={C.teal} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Business Insights */}
        <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Business Insights
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-gray-700">Repeat Customer Rate</span>
                <span className="text-xs font-bold text-gray-900">{repeatRate}%</span>
              </div>
              <div className="mt-1 h-[6px] w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${repeatRate}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">{Math.round(customers * repeatRate / 100)} returning customers</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-gray-700">Cancellation Rate</span>
                <span className="text-xs font-bold text-gray-900">{cancelPct}%</span>
              </div>
              <div className="mt-1 h-[6px] w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${cancelPct}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">{cancelled} cancelled orders</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-gray-700">Avg Order Value</span>
                <span className="text-xs font-bold text-gray-900">${avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="mt-1 h-[6px] w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((avgOrderValue / 50) * 100, 100)}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">target $50.00</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
            Status Overview
          </h2>
          <div className="space-y-2">
            {statuses.map((s) => (
              <div key={s.label}>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} />
                  <span className="flex-1 text-gray-600">{s.label}</span>
                  <span className="font-bold text-gray-900">{s.count}</span>
                  <span className="w-10 text-right text-[10px] text-gray-400">({s.pct}%)</span>
                </div>
                <div className="ml-4 mt-0.5 h-[5px] w-full overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-6 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-900">
        <div className="text-center">
          <p className="text-sm font-bold text-[#c2571a]">{totalOrders}</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{view.footerLabels[0]}</p>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-sm font-bold text-[#c2571a]">{totalCalls}</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{view.footerLabels[1]}</p>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-sm font-bold text-[#c2571a]">{customers}</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{view.footerLabels[2]}</p>
        </div>
      </div>
    </div>
  );
}
