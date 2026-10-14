// ============================================================
// CraveBox – Idempotent Migration Script: Expand Menu Catalogue
// Upserts all products from src/lib/data.ts into cravebox.products
// Safe to run multiple times – will not delete or duplicate entries
// Usage: npm run migrate
// ============================================================

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { connectToDatabase, disconnectDatabase } from "../src/lib/mongodb";
import { ProductModel } from "../src/models/Product";
import { products as allProducts } from "../src/lib/data";
import { poundsToPence } from "../src/lib/currency";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function migrate() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.error("\n❌ Migration Aborted: MONGODB_URI is not configured in .env.local.");
    console.error("Please add your MongoDB Atlas connection string to .env.local:\n");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB Atlas (cravebox database)...");
  await connectToDatabase();
  console.log("✅ Connected.\n");

  const existingBefore = await ProductModel.countDocuments();
  console.log(`📊 Products in DB before migration: ${existingBefore}`);
  console.log(`📦 Products in static data.ts:      ${allProducts.length}`);
  console.log(`\n📝 Starting upsert migration...\n`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const item of allProducts) {
    try {
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

      // Safe upsert – match on stable 'id' field only
      const res = await ProductModel.updateOne(
        { id: item.id },
        { $set: doc },
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        inserted++;
        console.log(`  ✅ INSERTED: ${item.name} (${item.id})`);
      } else {
        updated++;
        console.log(`  🔄 UPDATED:  ${item.name} (${item.id})`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ FAILED: ${item.name} (${item.id}) – ${err instanceof Error ? err.message : err}`);
    }
  }

  const existingAfter = await ProductModel.countDocuments();

  console.log("\n" + "═".repeat(60));
  console.log("  Migration Complete");
  console.log("═".repeat(60));
  console.log(`  New products inserted:      ${inserted}`);
  console.log(`  Existing products updated:  ${updated}`);
  console.log(`  Errors:                     ${errors}`);
  console.log(`  Products in DB before:      ${existingBefore}`);
  console.log(`  Products in DB after:       ${existingAfter}`);
  console.log("═".repeat(60));

  if (errors > 0) {
    console.warn("\n⚠️  Some products failed to migrate. Review errors above.");
  } else {
    console.log("\n🎉 All products migrated successfully.");
  }

  await disconnectDatabase();
  console.log("🔌 Disconnected.\n");
}

migrate().catch((err) => {
  console.error("❌ Migration Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
