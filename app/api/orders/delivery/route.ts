import { NextResponse } from "next/server";
import { getAllOrders, getTodayOrders } from "@/lib/store";

export async function GET() {
  const allOrders = await getAllOrders();
  const deliveryOrders = allOrders.filter((o) => o.order_type === "delivery");

  const todayOrders = await getTodayOrders();
  const todayDelivery = todayOrders.filter((o) => o.order_type === "delivery");

  const todayFoodTotal = todayDelivery.reduce((sum, o) => {
    const fee = o.delivery_fee ?? 0;
    return sum + (o.order_total - fee);
  }, 0);

  const todayDeliveryFees = todayDelivery.reduce(
    (sum, o) => sum + (o.delivery_fee ?? 0),
    0
  );

  // Commission saved vs DoorDash (25% of food total)
  const commissionSaved = Math.round(todayFoodTotal * 0.25 * 100) / 100;

  const statusBreakdown = {
    awaiting_dispatch: todayDelivery.filter(
      (o) => o.delivery_status === "awaiting_dispatch"
    ).length,
    dispatched: todayDelivery.filter(
      (o) => o.delivery_status === "dispatched"
    ).length,
    in_transit: todayDelivery.filter(
      (o) => o.delivery_status === "in_transit"
    ).length,
    delivered: todayDelivery.filter(
      (o) => o.delivery_status === "delivered"
    ).length,
  };

  return NextResponse.json({
    orders: deliveryOrders,
    stats: {
      total_delivery_orders_today: todayDelivery.length,
      status_breakdown: statusBreakdown,
      delivery_revenue_today:
        Math.round(
          todayDelivery.reduce((sum, o) => sum + o.order_total, 0) * 100
        ) / 100,
      food_total_today: Math.round(todayFoodTotal * 100) / 100,
      delivery_fees_today: Math.round(todayDeliveryFees * 100) / 100,
      commission_saved_today: commissionSaved,
    },
  });
}
