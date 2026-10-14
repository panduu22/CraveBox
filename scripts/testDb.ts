// ============================================================
// CraveBox – Database Connection & Verification Test
// Tests connection to MongoDB Atlas and verifies cravebox.products
// Usage: npm run db:test
// ============================================================

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { connectToDatabase, disconnectDatabase } from "../src/lib/mongodb";
import { ProductModel } from "../src/models/Product";

export async function testConnection() {
  console.log("\n============================================================");
  console.log(" CraveBox – MongoDB Atlas Connection Verification");
  console.log("============================================================\n");

  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.warn("⚠️  MONGODB_URI is not set in environment or .env.local.");
    console.log("   To connect your MongoDB Atlas cluster:");
    console.log("   1. Create .env.local in the cravebox/ project root.");
    console.log("   2. Add: MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cravebox?retryWrites=true&w=majority");
    console.log("   3. Run: npm run db:test\n");
    return;
  }

  // Mask URI for safe output (never expose credentials)
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`🔗 Target: ${maskedUri}`);

  try {
    console.log("⏳ Connecting to database 'cravebox'...");
    const conn = await connectToDatabase();
    console.log(" Successfully connected to MongoDB Atlas!");

    if (!conn.connection.db) {
      throw new Error("Connected but database instance is unavailable.");
    }

    // Ping test
    const pingResult = await conn.connection.db.admin().ping();
    console.log("⚡ Database Ping:", pingResult.ok === 1 ? "OK (200)" : "Failed");

    // Check collections
    const collections = await conn.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`📂 Collections in 'cravebox': ${collectionNames.join(", ") || "(none yet)"}`);

    // Verify products collection
    const productCount = await ProductModel.countDocuments();
    console.log(`🍗 Products count in 'cravebox.products': ${productCount}`);

    if (productCount > 0) {
      const sample = await ProductModel.findOne().select("name category price pricePence available");
      if (sample) {
        console.log(`   Sample item: "${sample.name}" [${sample.category}] - £${sample.price.toFixed(2)} (${sample.pricePence}p)`);
      }
      console.log("\n MongoDB database connection and collection verification PASSED.");
    } else {
      console.log("\n⚠️  The 'products' collection is currently empty.");
      console.log("   Run 'npm run seed' to populate initial menu items.");
    }
  } catch (err) {
    console.error("\n❌ Database Connection Failed:");
    console.error(err instanceof Error ? err.message : err);
    console.log("\nTroubleshooting Tips:");
    console.log("1. Check Network Access in Atlas: Ensure your current IP is whitelisted (or 0.0.0.0/0 enabled).");
    console.log("2. Check Database User in Atlas: Ensure username & password are correct and have readWrite permissions.");
    console.log("3. Ensure special characters in password are URL-encoded if applicable.\n");
  } finally {
    await disconnectDatabase();
    console.log("🔌 Connection closed.\n");
  }
}

if (require.main === module) {
  testConnection();
}
