import { NextRequest, NextResponse } from "next/server";
import { getAllItems, getItemsByCategory, setItemAvailability } from "@/lib/menu";

export async function GET() {
  return NextResponse.json({ items: getAllItems() });
}

export async function PATCH(request: NextRequest) {
  const { itemId, available } = await request.json();
  const success = setItemAvailability(itemId, available);
  return NextResponse.json({ success });
}
