// ============================================================
// CraveBox – Safe, Repeatable Database Seeder
// Seeds menu products into MongoDB: cravebox.products
// Idempotent upserts based on stable product id & unique slug
// Usage: npm run seed
// ============================================================

import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { connectToDatabase, disconnectDatabase } from "../src/lib/mongodb";
import { ProductModel } from "../src/models/Product";
import { products as staticProducts } from "../src/lib/data";
import { poundsToPence } from "../src/lib/currency";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function seedProducts() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.error("\n❌ Seeding Aborted: MONGODB_URI is not configured in .env.local.");
    console.error("Please add your MongoDB Atlas connection string to .env.local:");
    console.error("MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cravebox?retryWrites=true&w=majority\n");
    process.exit(1);
  }

  console.log("🌱 Connecting to MongoDB Atlas (cravebox database)...");
  await connectToDatabase();
  console.log(" Connected to MongoDB Atlas.");

  console.log(`📦 Preparing to seed ${staticProducts.length} menu items into cravebox.products...`);

  let upsertedCount = 0;
  let modifiedCount = 0;

  for (const item of staticProducts) {
    const slug = slugify(item.name);
    const pricePence = poundsToPence(item.price);

    const sizes = item.sizes?.map((s) => ({
      label: s.label,
      price: s.price,
      pricePence: poundsToPence(s.price),
    }));

    const extras = item.extras?.map((e) => ({
      id: e.id,
      name: e.name,
      price: e.price,
      pricePence: poundsToPence(e.price),
    }));

    const doc = {
      id: item.id,
      slug,
      name: item.name,
      description: item.description,
      price: item.price,
      pricePence,
      image: item.image,
      category: item.category,
      available: item.available,
      popular: item.popular ?? false,
      bestseller: item.bestseller ?? false,
      vegetarian: item.vegetarian ?? false,
      sizes,
      flavours: item.flavours,
      sauces: item.sauces,
      extras,
      allergens: item.allergens,
      calories: item.calories,
    };

    // Safe upsert by stable product identifier
    const res = await ProductModel.updateOne(
      { id: item.id },
      { $set: doc },
      { upsert: true }
    );

    if (res.upsertedCount > 0) {
      upsertedCount++;
    } else {
      modifiedCount++;
    }
  }

  const totalInCollection = await ProductModel.countDocuments();

  console.log("\n🎉 Seeding Completed Successfully!");
  console.log(`   - New items inserted: ${upsertedCount}`);
  console.log(`   - Existing items verified/updated: ${modifiedCount}`);
  console.log(`   - Total products in cravebox.products: ${totalInCollection}`);

  await disconnectDatabase();
  console.log("🔌 Disconnected from MongoDB.\n");
}

// Run directly if invoked via CLI
if (require.main === module) {
  seedProducts().catch((err) => {
    console.error("❌ Seeding Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
