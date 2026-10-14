// ============================================================
// CraveBox – GET /api/products Endpoint
// Reads menu items from MongoDB Atlas (cravebox.products)
// Provides resilient fallback to local static data if DB is offline
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { products as staticProducts, Product } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const popularOnly = searchParams.get("popular") === "true";
    const bestsellerOnly = searchParams.get("bestseller") === "true";
    const vegetarianOnly = searchParams.get("vegetarian") === "true";
    const availableOnly = searchParams.get("available") === "true";

    // Attempt database query
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();

        // Build MongoDB filter query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};

        if (category && category !== "all") {
          query.category = category;
        }

        if (popularOnly) {
          query.popular = true;
        }

        if (bestsellerOnly) {
          query.bestseller = true;
        }

        if (vegetarianOnly) {
          query.vegetarian = true;
        }

        if (availableOnly) {
          query.available = true;
        }

        if (search && search.trim()) {
          const regex = new RegExp(search.trim(), "i");
          query.$or = [{ name: regex }, { description: regex }];
        }

        const dbProducts = await ProductModel.find(query).lean().exec();

        // If collection has data, return it
        if (dbProducts && dbProducts.length > 0) {
          const formattedProducts: Product[] = dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            category: p.category,
            available: p.available,
            popular: p.popular,
            bestseller: p.bestseller,
            vegetarian: p.vegetarian,
            sizes: p.sizes?.map((s) => ({ label: s.label, price: s.price })),
            flavours: p.flavours,
            sauces: p.sauces,
            extras: p.extras?.map((e) => ({ id: e.id, name: e.name, price: e.price })),
            allergens: p.allergens,
            calories: p.calories,
          }));

          return NextResponse.json({
            success: true,
            source: "mongodb",
            count: formattedProducts.length,
            data: formattedProducts,
          });
        }
      } catch (dbError) {
        console.warn(
          "⚠️ MongoDB query failed, falling back to static menu data:",
          dbError instanceof Error ? dbError.message : dbError
        );
      }
    }

    // Graceful fallback: Filter static menu data
    let fallback = staticProducts;

    if (category && category !== "all") {
      fallback = fallback.filter((p) => p.category === category);
    }

    if (popularOnly) {
      fallback = fallback.filter((p) => p.popular);
    }

    if (bestsellerOnly) {
      fallback = fallback.filter((p) => p.bestseller);
    }

    if (vegetarianOnly) {
      fallback = fallback.filter((p) => p.vegetarian);
    }

    if (availableOnly) {
      fallback = fallback.filter((p) => p.available);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      fallback = fallback.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      source: "static_fallback",
      count: fallback.length,
      data: fallback,
      note: "Serving verified static menu. Run 'npm run seed' once MONGODB_URI is configured.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to load products",
        data: staticProducts,
      },
      { status: 500 }
    );
  }
}
