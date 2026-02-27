import { NextRequest, NextResponse } from "next/server";
import { getMenuItem, validateCustomization } from "@/lib/menu";
import { log, logError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customizations } = body as {
      items: { name: string; quantity: number }[];
      customizations?: string[];
    };

    // Validate items is a non-empty array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          errors: ["Items must be a non-empty array"],
          items_validated: [],
          total: 0,
        },
        { status: 400 }
      );
    }

    const validatedItems: {
      name: string;
      quantity: number;
      unit_price: number;
      available: boolean;
      subtotal: number;
    }[] = [];
    const errors: string[] = [];

    // Validate each item against the menu
    for (const item of items) {
      const menuItem = getMenuItem(item.name);

      if (menuItem) {
        validatedItems.push({
          name: menuItem.name,
          quantity: item.quantity,
          unit_price: menuItem.price,
          available: menuItem.available,
          subtotal: menuItem.price * item.quantity,
        });
      } else {
        errors.push(`Item not found: ${item.name}`);
      }
    }

    // Validate customizations if provided
    if (customizations && Array.isArray(customizations)) {
      for (const customization of customizations) {
        // General check: validate customization against all validated items
        const isValidForAnyItem = validatedItems.some((validatedItem) => {
          const menuItem = getMenuItem(validatedItem.name);
          return menuItem
            ? validateCustomization(menuItem.id, customization)
            : false;
        });

        if (!isValidForAnyItem) {
          errors.push(`Invalid customization: ${customization}`);
        }
      }
    }

    // Calculate total from all validated item subtotals
    const total = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Log validated items and errors
    log("Order validation - validated items", validatedItems);
    if (errors.length > 0) {
      log("Order validation - errors", errors);
    }

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      items_validated: validatedItems,
      total,
    });
  } catch (error) {
    logError("Order validation failed", error);

    return NextResponse.json(
      {
        valid: false,
        errors: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during validation",
        ],
      },
      { status: 500 }
    );
  }
}
