// ============================================================
// CraveBox – GET /api/orders/[orderReference] Endpoint
// Fetches verified order status from MongoDB Atlas (cravebox.orders)
// Returns sanitized order details for customer tracking & confirmation
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { restaurantConfig } from "@/lib/restaurantConfig";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderReference: string }> }
) {
  try {
    const { orderReference } = await params;

    if (!orderReference || !orderReference.trim()) {
      return NextResponse.json(
        { success: false, error: "Order reference is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await OrderModel.findOne({
      orderReference: orderReference.trim().toUpperCase(),
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const estimatedTime =
      order.fulfilmentType === "delivery"
        ? restaurantConfig.delivery.estimatedDeliveryWindow
        : restaurantConfig.currentBranch.collectionEstimate;

    // Return sanitized public view
    return NextResponse.json({
      success: true,
      data: {
        orderReference: order.orderReference,
        fulfilmentType: order.fulfilmentType,
        customerName: order.customer.fullName,
        delivery: order.delivery
          ? {
              postcode: order.delivery.postcode,
              addressLine1: order.delivery.addressLine1,
              townOrCity: order.delivery.townOrCity,
            }
          : undefined,
        collection: order.collection
          ? {
              branchName: order.collection.branchName,
              collectionSlotLabel: order.collection.collectionSlotLabel,
            }
          : undefined,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          size: i.size,
          flavour: i.flavour,
          sauce: i.sauce,
          extras: i.extras.map((e) => e.name),
          unitPricePence: i.unitPricePence,
          lineTotalPence: i.lineTotalPence,
        })),
        pricingSummary: order.pricingSummary,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        estimatedTime,
      },
    });
  } catch (err) {
    console.error("Order lookup error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve order details." },
      { status: 500 }
    );
  }
}
