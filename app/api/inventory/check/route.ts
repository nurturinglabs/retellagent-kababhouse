import { NextRequest, NextResponse } from "next/server";
import { getMenuItem } from "@/lib/menu";
import { log, logError } from "@/lib/utils";
import { BUSINESS_CONFIG } from "@/config/business";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_name, quantity = 1 } = body as {
      item_name: string;
      quantity?: number;
    };

    log("Inventory check request", { item_name, quantity });

    const menuItem = getMenuItem(item_name);

    if (!menuItem) {
      const result = {
        available: false,
        message: `Item "${item_name}" not found on our menu`,
      };
      log("Inventory check result: item not found", result);
      return NextResponse.json(result, { status: 404 });
    }

    if (!menuItem.available) {
      const result = {
        available: false,
        item_name: menuItem.name,
        message: "Sorry, this item is currently unavailable",
      };
      log("Inventory check result: item unavailable", result);
      return NextResponse.json(result);
    }

    const result = {
      available: true,
      item_name: menuItem.name,
      price: menuItem.price,
      estimated_time: `${BUSINESS_CONFIG.default_prep_time} minutes`,
      message: "Item is available",
    };
    log("Inventory check result: item available", result);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    logError("Inventory check failed", error);
    return NextResponse.json(
      { available: false, error: message },
      { status: 500 }
    );
  }
}
