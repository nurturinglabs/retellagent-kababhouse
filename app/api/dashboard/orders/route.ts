import { NextResponse } from "next/server";
import {
  getAllOrders,
  getTodayOrders,
  getTodayRevenue,
  getAverageOrderValue,
  getCallStats,
} from "@/lib/store";

export async function GET() {
  const orders = getAllOrders();
  const todayOrders = getTodayOrders();
  const callStats = getCallStats();

  const stats = {
    total_orders_today: todayOrders.length,
    revenue_today: getTodayRevenue(),
    avg_order_value: getAverageOrderValue(),
    total_calls_today: callStats.total,
  };

  return NextResponse.json({ orders, stats });
}
