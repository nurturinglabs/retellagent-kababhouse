import { NextResponse } from "next/server";
import {
  getAllOrders,
  getTodayOrders,
  getTodayRevenue,
  getAverageOrderValue,
  getCallStats,
} from "@/lib/store";

export async function GET() {
  const orders = await getAllOrders();
  const todayOrders = await getTodayOrders();
  const callStats = await getCallStats();

  const stats = {
    total_orders_today: todayOrders.length,
    revenue_today: await getTodayRevenue(),
    avg_order_value: await getAverageOrderValue(),
    total_calls_today: callStats.total,
  };

  return NextResponse.json({ orders, stats });
}
