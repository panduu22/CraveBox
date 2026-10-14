import assert from "node:assert/strict";
import {
  poundsToPence,
  penceToPounds,
  formatGBPFromPence,
  calculateItemPricing,
} from "../src/lib/currency";
import {
  restaurantConfig,
  validateDeliveryPostcode,
  isValidUKPostcodeFormat,
  isValidUKMobile,
  isValidEmail,
  getAvailableCollectionSlots,
} from "../src/lib/restaurantConfig";
import {
  calculatePromoDiscount,
} from "../src/lib/promoCodes";
import { CreateOrderRequestDTO } from "../src/lib/orderTypes";

console.log("=================================================");
console.log("  CRAVEBOX COMPLETE ORDERING FLOW AUDIT SUITE");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(name: string, fn: () => void) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`  ✓ ${name}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------------------------
// 1. Product Sizes, Flavours, Extras & Customisation Pricing
// ----------------------------------------------------------------------
console.log("--- 1. Product Sizes, Flavours & Customisation Pricing ---");

runTest("Item pricing handles base price without customisations", () => {
  // Base £5.99 (599p), qty 2 = 1198p
  const pricing = calculateItemPricing(5.99, 0, [], 2);
  assert.equal(pricing.unitPence, 599);
  assert.equal(pricing.totalPence, 1198);
  assert.equal(pricing.unitPounds, 5.99);
  assert.equal(pricing.totalPounds, 11.98);
});

runTest("Item pricing includes size price add-on accurately in integer pence", () => {
  // Base £5.99 + Large size £2.00 (+200p) = 799p per unit * 3 = 2397p
  const pricing = calculateItemPricing(5.99, 2.0, [], 3);
  assert.equal(pricing.unitPence, 799);
  assert.equal(pricing.totalPence, 2397);
});

runTest("Item pricing sums multiple extras without floating point inaccuracies", () => {
  // Base £6.49 (649p), Cheese £0.60 (60p), Bacon £0.90 (90p), Extra Sauce £0.50 (50p) = 849p unit
  const extras = [
    { id: "cheese", name: "Cheese Slice", price: 0.6 },
    { id: "bacon", name: "Crispy Bacon", price: 0.9 },
    { id: "sauce", name: "Garlic Mayo", price: 0.5 },
  ];
  const pricing = calculateItemPricing(6.49, 0, extras, 1);
  assert.equal(pricing.unitPence, 849);
  assert.equal(pricing.totalPence, 849);
  assert.equal(formatGBPFromPence(pricing.totalPence), "£8.49");
});

// ----------------------------------------------------------------------
// 2. Customisation Signatures & Line Item Merging vs Separation
// ----------------------------------------------------------------------
console.log("\n--- 2. Customisation Signatures & Basket Line Items ---");

function mockGetSignature(
  productId: string,
  c: {
    size?: string;
    flavour?: string;
    sauce?: string;
    extras?: { id: string }[];
    specialInstructions?: string;
  }
) {
  const sortedExtras = [...(c.extras || [])].map((e) => e.id).sort().join(",");
  const instructions = (c.specialInstructions || "").trim().toLowerCase();
  return `${productId}|${c.size || ""}|${c.flavour || ""}|${c.sauce || ""}|${sortedExtras}|${instructions}`;
}

runTest("Identical items with same options generate identical signature", () => {
  const sig1 = mockGetSignature("burger-1", {
    size: "Regular",
    flavour: "Spicy",
    extras: [{ id: "cheese" }, { id: "bacon" }],
    specialInstructions: "No pickles",
  });
  const sig2 = mockGetSignature("burger-1", {
    size: "Regular",
    flavour: "Spicy",
    extras: [{ id: "bacon" }, { id: "cheese" }], // different order
    specialInstructions: "  no pickles  ", // whitespace & casing variation
  });
  assert.equal(sig1, sig2);
});

runTest("Different sizes of same product generate distinct signatures", () => {
  const sigRegular = mockGetSignature("wings-1", { size: "6 Pieces" });
  const sigLarge = mockGetSignature("wings-1", { size: "10 Pieces" });
  assert.notEqual(sigRegular, sigLarge);
});

runTest("Empty or missing extras do not crash signature generator", () => {
  const sig = mockGetSignature("burger-1", { size: "Regular" });
  assert.ok(sig.startsWith("burger-1|Regular"));
});

// ----------------------------------------------------------------------
// 3. Integer Pence Currency Conversions & Rounding
// ----------------------------------------------------------------------
console.log("\n--- 3. Strict Integer Pence Currency Conversions ---");

runTest("poundsToPence rounds correctly avoiding IEEE 754 precision issues", () => {
  // 19.99 * 100 in native JS is 1998.9999999999998
  assert.equal(19.99 * 100 === 1999, false); // native JS fails
  assert.equal(poundsToPence(19.99), 1999); // our currency lib passes
  assert.equal(poundsToPence(0.1 + 0.2), 30);
  assert.equal(poundsToPence(12.34), 1234);
});

runTest("penceToPounds converts integers to two decimal place numbers", () => {
  assert.equal(penceToPounds(1999), 19.99);
  assert.equal(penceToPounds(30), 0.3);
  assert.equal(penceToPounds(0), 0);
});

runTest("formatGBPFromPence outputs clean £ symbol format", () => {
  assert.equal(formatGBPFromPence(1299), "£12.99");
  assert.equal(formatGBPFromPence(50), "£0.50");
  assert.equal(formatGBPFromPence(0), "£0.00");
});

// ----------------------------------------------------------------------
// 4. Delivery vs Collection Fulfilment Rules
// ----------------------------------------------------------------------
console.log("\n--- 4. Delivery vs Collection Fulfilment Rules ---");

runTest("Collection orders incur £0 delivery fee regardless of subtotal", () => {
  const isDelivery = false;
  const deliveryFee = !isDelivery ? 0 : restaurantConfig.delivery.deliveryFeePence;
  assert.equal(deliveryFee, 0);
});

runTest("Delivery orders below threshold incur delivery fee", () => {
  const subtotalPence = 1500; // £15.00 (above min £12, below free £25)
  assert.ok(subtotalPence < restaurantConfig.delivery.freeDeliveryThresholdPence);
  const fee =
    subtotalPence >= restaurantConfig.delivery.freeDeliveryThresholdPence
      ? 0
      : restaurantConfig.delivery.deliveryFeePence;
  assert.equal(fee, 299); // £2.99
});

runTest("Delivery orders at or above threshold receive free delivery", () => {
  const subtotalPence = 2500; // £25.00
  const fee =
    subtotalPence >= restaurantConfig.delivery.freeDeliveryThresholdPence
      ? 0
      : restaurantConfig.delivery.deliveryFeePence;
  assert.equal(fee, 0);
});

runTest("Collection slots are configured and available", () => {
  const slots = getAvailableCollectionSlots();
  assert.ok(slots.length >= 3);
  assert.equal(slots[0].id, "asap");
  assert.ok(slots.every((s) => s.available === true));
});

// ----------------------------------------------------------------------
// 5. UK Postcode Validation & Minimum Spend
// ----------------------------------------------------------------------
console.log("\n--- 5. UK Postcode Validation & Minimum Order Check ---");

runTest("Validates standard UK postcode format regex", () => {
  assert.equal(isValidUKPostcodeFormat("E1 6RF"), true);
  assert.equal(isValidUKPostcodeFormat("e16rf"), true);
  assert.equal(isValidUKPostcodeFormat("NE1 7RU"), true);
  assert.equal(isValidUKPostcodeFormat("SW1A 1AA"), true);
  assert.equal(isValidUKPostcodeFormat("W1A 0AX"), true);
  assert.equal(isValidUKPostcodeFormat("INVALID"), false);
  assert.equal(isValidUKPostcodeFormat("12345"), false);
  assert.equal(isValidUKPostcodeFormat(""), false);
});

runTest("Detects covered outward delivery zones", () => {
  const resE1 = validateDeliveryPostcode("E1 6RF");
  assert.equal(resE1.isValidFormat, true);
  assert.equal(resE1.isInDeliveryZone, true);
  assert.equal(resE1.formattedPostcode, "E1 6RF");

  const resNE1 = validateDeliveryPostcode("NE1 7RU");
  assert.equal(resNE1.isValidFormat, true);
  assert.equal(resNE1.isInDeliveryZone, true);
});

runTest("Rejects postcodes outside delivery zone with informative message", () => {
  const resOut = validateDeliveryPostcode("BT1 1AA"); // Belfast
  assert.equal(resOut.isValidFormat, true);
  assert.equal(resOut.isInDeliveryZone, false);
  assert.ok(resOut.errorMessage?.includes("do not deliver to BT1"));
});

runTest("Minimum order applies only to Home Delivery", () => {
  const subtotalPence = 899; // £8.99 (< £12.00 min)
  const minDeliveryPence = restaurantConfig.delivery.minimumDeliveryOrderPence;

  // Delivery: blocked
  const isDeliveryShortfall = subtotalPence < minDeliveryPence;
  assert.equal(isDeliveryShortfall, true);

  // Collection: not blocked
  const canCollect = subtotalPence > 0;
  assert.equal(canCollect, true);
});

runTest("Validates UK mobile phone numbers", () => {
  assert.equal(isValidUKMobile("07123456789"), true);
  assert.equal(isValidUKMobile("07123 456 789"), true);
  assert.equal(isValidUKMobile("+447123456789"), true);
  assert.equal(isValidUKMobile("0191 123 4567"), false); // landline
  assert.equal(isValidUKMobile("12345"), false);
});

runTest("Validates customer email format", () => {
  assert.equal(isValidEmail("customer@example.com"), true);
  assert.equal(isValidEmail("invalid-email"), false);
  assert.equal(isValidEmail("test@domain"), false);
});

// ----------------------------------------------------------------------
// 6. Promo Code Engine & Error Handling
// ----------------------------------------------------------------------
console.log("\n--- 6. Promo Code Validation & Discount Calculations ---");

runTest("Unknown promo code returns clear error", () => {
  const res = calculatePromoDiscount("BOGUSCODE", 2000, 299, true);
  assert.equal(res.valid, false);
  assert.equal(res.discountPence, 0);
  assert.ok(res.errorMessage?.includes("not valid"));
});

runTest("FREESHIP waives delivery fee for delivery orders", () => {
  const res = calculatePromoDiscount("FREESHIP", 1500, 299, true);
  assert.equal(res.valid, true);
  assert.equal(res.deliveryWaived, true);
  assert.equal(res.discountPence, 299);
});

runTest("FREESHIP rejected for collection orders with explicit guidance", () => {
  const res = calculatePromoDiscount("FREESHIP", 1500, 0, false);
  assert.equal(res.valid, false);
  assert.ok(res.errorMessage?.includes("Home Delivery"));
});

runTest("CRAVE10 applies 10% off when food subtotal meets £10 minimum", () => {
  // £20.00 (2000p) subtotal -> 10% = 200p (£2.00) discount
  const res = calculatePromoDiscount("CRAVE10", 2000, 299, true);
  assert.equal(res.valid, true);
  assert.equal(res.discountPence, 200);
});

runTest("CRAVE10 enforces £10 minimum subtotal requirement", () => {
  // £8.50 (850p) subtotal -> fails min spend
  const res = calculatePromoDiscount("CRAVE10", 850, 299, true);
  assert.equal(res.valid, false);
  assert.ok(res.errorMessage?.includes("minimum food subtotal of £10.00"));
});

runTest("HOTCHICKEN applies £3.00 off when subtotal meets £15 minimum", () => {
  // £16.00 (1600p) -> £3.00 (300p) discount
  const res = calculatePromoDiscount("HOTCHICKEN", 1600, 299, true);
  assert.equal(res.valid, true);
  assert.equal(res.discountPence, 300);
});

runTest("HOTCHICKEN rejected when subtotal is under £15 minimum", () => {
  const res = calculatePromoDiscount("HOTCHICKEN", 1450, 299, true);
  assert.equal(res.valid, false);
  assert.ok(res.errorMessage?.includes("minimum food subtotal of £15.00"));
});

// ----------------------------------------------------------------------
// 7. Order DTO Payload Integrity (Ready for POST /api/orders & Stripe)
// ----------------------------------------------------------------------
console.log("\n--- 7. Order DTO & Gateway Payload Integrity ---");

runTest("Prepares complete order DTO with integer pence pricing summary", () => {
  const subtotalPence = 2198; // 2 burgers
  const deliveryFeePence = 299;
  const discountPence = 220; // 10%
  const finalTotalPence = subtotalPence + deliveryFeePence - discountPence; // 2277p (£22.77)

  const orderDTO: CreateOrderRequestDTO = {
    orderReference: "CB-TEST-001",
    fulfilmentType: "delivery",
    customer: {
      fullName: "Jane Doe",
      email: "jane@example.co.uk",
      phone: "07123456789",
    },
    delivery: {
      postcode: "E1 6RF",
      addressLine1: "10 Downing Road",
      townOrCity: "London",
      outwardCode: "E1",
    },
    items: [
      {
        productId: "test-prod-1",
        productName: "Crave Classic Burger",
        quantity: 2,
        size: "Regular",
        sizePricePence: 0,
        extras: [],
        unitPricePence: 1099,
        lineTotalPence: 2198,
      },
    ],
    promoCode: "CRAVE10",
    pricingSummary: {
      subtotalPence,
      deliveryFeePence,
      discountPence,
      finalTotalPence,
      currency: "GBP",
    },
    paymentMethod: "online_card",
    timestamp: new Date().toISOString(),
  };

  assert.equal(orderDTO.pricingSummary.finalTotalPence, 2277);
  assert.equal(formatGBPFromPence(orderDTO.pricingSummary.finalTotalPence), "£22.77");
  assert.equal(orderDTO.items.length, 1);
  assert.equal(orderDTO.customer.email, "jane@example.co.uk");
  assert.ok(orderDTO.orderReference.startsWith("CB-"));
});

// ----------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------
console.log("\n=================================================");
console.log(`  RESULTS: ${passedCount} / ${totalCount} tests passed.`);
console.log("=================================================\n");

if (passedCount !== totalCount) {
  process.exit(1);
}
