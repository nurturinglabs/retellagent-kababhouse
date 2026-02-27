import { NextResponse } from "next/server";
import {
  getAllOrders,
  getTodayOrders,
  getTodayRevenue,
  getAverageOrderValue,
  getAllCustomers,
  getCallStats,
  getCallLogs,
  getCateringLeads,
} from "@/lib/store";

export async function GET() {
  const orders = getAllOrders();
  const todayOrders = getTodayOrders();
  const callStats = getCallStats();
  const callLogs = getCallLogs();
  const cateringLeads = getCateringLeads();
  const customers = getAllCustomers();

  // Total revenue across all orders
  const totalRevenue = orders.reduce((sum, o) => sum + (o.order_total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Orders by hour of day (0-23)
  const ordersByHour: { hour: string; orders: number }[] = Array.from(
    { length: 24 },
    (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      orders: 0,
    })
  );
  for (const order of orders) {
    const h = new Date(order.created_at).getHours();
    ordersByHour[h].orders += 1;
  }

  // Revenue trend over last 7 days
  const revenueTrend: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const dayRevenue = orders
      .filter((o) => {
        const oDate = new Date(o.created_at);
        return (
          oDate.getFullYear() === d.getFullYear() &&
          oDate.getMonth() === d.getMonth() &&
          oDate.getDate() === d.getDate()
        );
      })
      .reduce((sum, o) => sum + (o.order_total || 0), 0);
    revenueTrend.push({ date: dateStr, revenue: dayRevenue });
  }

  // Top items ordered (aggregate across all orders)
  const itemCounts: Record<string, number> = {};
  for (const order of orders) {
    if (order.order_items && Array.isArray(order.order_items)) {
      for (const item of order.order_items) {
        const name = item.name || "Unknown";
        itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
      }
    }
  }
  const topItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Call type breakdown
  const allCallLogs = callLogs;
  const callTypeBreakdown: { name: string; value: number }[] = [];
  const typeCounts: Record<string, number> = {};
  for (const log of allCallLogs) {
    const t = log.call_type || "other";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  for (const [name, value] of Object.entries(typeCounts)) {
    callTypeBreakdown.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    });
  }

  // Inquiry topics
  const topicCounts: Record<string, number> = {};
  for (const log of allCallLogs) {
    if (log.inquiry_topic) {
      topicCounts[log.inquiry_topic] =
        (topicCounts[log.inquiry_topic] || 0) + 1;
    }
  }
  const inquiryTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Catering lead pipeline
  const cateringPipeline: Record<string, number> = {
    new: 0,
    contacted: 0,
    quoted: 0,
    confirmed: 0,
    declined: 0,
  };
  for (const lead of cateringLeads) {
    const status = lead.status || "new";
    cateringPipeline[status] = (cateringPipeline[status] || 0) + 1;
  }

  // Delivery stats
  const pickupOrders = orders.filter((o) => o.order_type === "pickup");
  const deliveryOrders = orders.filter((o) => o.order_type === "delivery");
  const deliveryFoodTotal = deliveryOrders.reduce(
    (sum, o) => sum + o.order_total - (o.delivery_fee ?? 0),
    0
  );
  const deliveryStats = {
    pickup_count: pickupOrders.length,
    delivery_count: deliveryOrders.length,
    pickup_revenue: Math.round(pickupOrders.reduce((s, o) => s + o.order_total, 0) * 100) / 100,
    delivery_revenue: Math.round(deliveryOrders.reduce((s, o) => s + o.order_total, 0) * 100) / 100,
    delivery_fees_collected: Math.round(deliveryOrders.reduce((s, o) => s + (o.delivery_fee ?? 0), 0) * 100) / 100,
    commission_saved_total: Math.round(deliveryFoodTotal * 0.25 * 100) / 100,
  };

  return NextResponse.json({
    totalOrders,
    totalRevenue,
    avgOrderValue,
    totalCalls: allCallLogs.length,
    todayOrders: todayOrders.length,
    todayRevenue: getTodayRevenue(),
    todayAvgOrderValue: getAverageOrderValue(),
    todayCallStats: callStats,
    totalCustomers: customers.length,
    ordersByHour,
    revenueTrend,
    topItems,
    callTypeBreakdown,
    inquiryTopics,
    cateringPipeline,
    deliveryStats,
  });
}
