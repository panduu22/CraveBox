// ============================================================
// CraveBox – POST /api/orders Endpoint
// Validates, recalculates, and saves customer takeaway orders
// to MongoDB Atlas (cravebox.orders).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { processAndSaveOrder } from "@/lib/orderService";
import { CreateOrderRequestDTO } from "@/lib/orderTypes";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    let body: CreateOrderRequestDTO;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // Attach client IP for abuse detection
    const result = await processAndSaveOrder({
      ...body,
      clientIp,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: result.statusCode }
    );
  } catch (error) {
    // Log safe error without sensitive information
    const safeMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("Unhandled error in POST /api/orders:", safeMsg);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your order. Please try again.",
      },
      { status: 500 }
    );
  }
}
