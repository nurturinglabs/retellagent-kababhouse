import { NextRequest, NextResponse } from "next/server";
import { BUSINESS_CONFIG } from "@/config/business";

export async function GET() {
  return NextResponse.json(BUSINESS_CONFIG);
}

export async function PUT(request: NextRequest) {
  const updates = await request.json();
  // Merge updates into BUSINESS_CONFIG (in-memory)
  Object.assign(BUSINESS_CONFIG, updates);
  return NextResponse.json({ success: true, settings: BUSINESS_CONFIG });
}
