// ============================================================
// CraveBox – Server-Side Order Processing & Validation Service
// Trust zero client pricing: strictly re-evaluates all products,
// portions, extras, discounts, minimum spend and delivery fees
// against server configurations and MongoDB Atlas.
// ============================================================

import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel, IProductDocument } from "@/models/Product";
import { OrderModel, IOrderDocument, IOrderItemSnapshot } from "@/models/Order";
import { products as staticProducts } from "@/lib/data";
import {
  restaurantConfig,
  validateDeliveryPostcode,
  isValidUKMobile,
  isValidEmail,
  getAvailableCollectionSlots,
} from "@/lib/restaurantConfig";
import { calculatePromoDiscount } from "@/lib/promoCodes";
import { CreateOrderRequestDTO } from "@/lib/orderTypes";

// In-memory rate limiting map: IP -> timestamp[]
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 12; // 12 orders per minute per IP
const ipRequestTimestamps = new Map<string, number[]>();

export function checkRateLimit(clientIp: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = (ipRequestTimestamps.get(clientIp) || []).filter(
    (t) => now - t < rateLimitWindowMs
  );

  if (timestamps.length >= maxRequestsPerWindow) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + rateLimitWindowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  timestamps.push(now);
  ipRequestTimestamps.set(clientIp, timestamps);
  return { allowed: true };
}

export interface ValidationSuccess {
  isValid: true;
  orderData: Partial<IOrderDocument>;
}

export interface ValidationFailure {
  isValid: false;
  statusCode: number;
  errorMessage: string;
}

export type OrderValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Generates a unique, human-friendly order reference: e.g. "CB-20261015-8492"
 */
export function generateOrderReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const alphaTag = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `CB-${dateStr}-${alphaTag}${randomSuffix}`;
}

/**
 * Validates order inputs and recalculates all prices on the server.
 * Never trusts client unit prices or totals.
 */
export async function validateAndRecalculateOrder(
  dto: CreateOrderRequestDTO & { clientIp?: string; idempotencyKey?: string }
): Promise<OrderValidationResult> {
  // 1. Basic Payload & Customer Validation
  if (!dto || typeof dto !== "object") {
    return { isValid: false, statusCode: 400, errorMessage: "Invalid request payload." };
  }

  const { customer, fulfilmentType, items, paymentMethod } = dto;

  if (!customer) {
    return { isValid: false, statusCode: 400, errorMessage: "Customer contact details are required." };
  }

  const fullName = (customer.fullName || "").trim();
  if (fullName.length < 2 || fullName.length > 100) {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Customer name must be between 2 and 100 characters.",
    };
  }

  const email = (customer.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Please provide a valid email address.",
    };
  }

  const phone = (customer.phone || "").trim();
  if (!isValidUKMobile(phone)) {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Please provide a valid UK mobile number starting with 07 (e.g. 07123456789).",
    };
  }

  // 2. Fulfilment & Postcode Validation
  if (fulfilmentType !== "delivery" && fulfilmentType !== "collection") {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Fulfilment method must be either 'delivery' or 'collection'.",
    };
  }

  let validatedDelivery = undefined;
  let validatedCollection = undefined;

  if (fulfilmentType === "delivery") {
    if (!dto.delivery) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: "Delivery address details are required for Home Delivery orders.",
      };
    }

    const { postcode, addressLine1, addressLine2, townOrCity, deliveryInstructions } = dto.delivery;

    if (!addressLine1 || !addressLine1.trim()) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: "Street address line 1 is required for delivery.",
      };
    }

    if (!townOrCity || !townOrCity.trim()) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: "Town or city is required for delivery.",
      };
    }

    const postcodeCheck = validateDeliveryPostcode(postcode || "");
    if (!postcodeCheck.isValidFormat) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: postcodeCheck.errorMessage || "Invalid UK postcode format.",
      };
    }

    if (!postcodeCheck.isInDeliveryZone) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: postcodeCheck.errorMessage || "We do not deliver to this postcode.",
      };
    }

    validatedDelivery = {
      postcode: postcodeCheck.formattedPostcode,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2?.trim() || undefined,
      townOrCity: townOrCity.trim(),
      deliveryInstructions: deliveryInstructions?.trim() || undefined,
      outwardCode: postcodeCheck.outwardCode,
    };
  } else {
    // Collection
    const slotId = dto.collection?.collectionSlotId || "asap";
    const availableSlots = getAvailableCollectionSlots();
    const matchedSlot = availableSlots.find((s) => s.id === slotId) || availableSlots[0];

    validatedCollection = {
      branchId: restaurantConfig.currentBranch.id,
      branchName: restaurantConfig.currentBranch.name,
      branchAddress: `${restaurantConfig.currentBranch.addressLine1}, ${restaurantConfig.currentBranch.townOrCity} ${restaurantConfig.currentBranch.postcode}`,
      collectionSlotId: matchedSlot.id,
      collectionSlotLabel: matchedSlot.label,
      collectionNote: dto.collection?.collectionNote?.trim() || undefined,
    };
  }

  // 3. Payment Method Validation
  const validMethods = ["online_card", "cash_on_delivery", "cash_on_collection"];
  if (!validMethods.includes(paymentMethod)) {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: `Invalid payment method: "${paymentMethod}".`,
    };
  }

  if (fulfilmentType === "collection" && paymentMethod === "cash_on_delivery") {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Cash on Delivery cannot be selected for Takeaway Collection.",
    };
  }

  if (fulfilmentType === "delivery" && paymentMethod === "cash_on_collection") {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Cash on Collection cannot be selected for Home Delivery.",
    };
  }

  // 4. Items Validation & Server-Side Price Lookup
  if (!Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Order must contain at least one item.",
    };
  }

  if (items.length > 50) {
    return {
      isValid: false,
      statusCode: 400,
      errorMessage: "Order contains too many items (maximum 50 line items allowed).",
    };
  }

  // Connect to DB and fetch trusted products
  let dbProducts: IProductDocument[] = [];
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const productIds = items.map((i) => i.productId);
      dbProducts = await ProductModel.find({ id: { $in: productIds } }).lean().exec();
    }
  } catch (err) {
    console.warn("MongoDB product lookup warning (falling back to static catalog if available):", err);
  }

  // Fallback to static catalog if DB returned no products
  const getProductById = (id: string) => {
    const fromDb = dbProducts.find((p) => p.id === id);
    if (fromDb) return fromDb;
    const fromStatic = staticProducts.find((p) => p.id === id);
    if (fromStatic) {
      return {
        id: fromStatic.id,
        name: fromStatic.name,
        price: fromStatic.price,
        pricePence: Math.round(fromStatic.price * 100),
        available: fromStatic.available ?? true,
        sizes: fromStatic.sizes?.map((s) => ({
          label: s.label,
          price: s.price,
          pricePence: Math.round(s.price * 100),
        })),
        flavours: fromStatic.flavours,
        sauces: fromStatic.sauces,
        extras: fromStatic.extras?.map((e) => ({
          id: e.id,
          name: e.name,
          price: e.price,
          pricePence: Math.round(e.price * 100),
        })),
      };
    }
    return null;
  };

  const validatedItems: IOrderItemSnapshot[] = [];
  let calculatedSubtotalPence = 0;

  for (const item of items) {
    if (!item.productId) {
      return { isValid: false, statusCode: 400, errorMessage: "Missing product ID on line item." };
    }

    const quantity = Math.floor(Number(item.quantity));
    if (!quantity || quantity < 1 || quantity > 99) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: `Invalid quantity "${item.quantity}" for product ID ${item.productId}. Must be 1–99.`,
      };
    }

    const product = getProductById(item.productId);
    if (!product) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: `Product "${item.productName || item.productId}" (ID: ${item.productId}) was not found in our menu.`,
      };
    }

    if (product.available === false) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: `"${product.name}" is currently sold out and unavailable to order.`,
      };
    }

    // Base price strictly from trusted product data in integer pence
    const basePricePence = product.pricePence ?? Math.round(product.price * 100);

    // Size validation and add-on price
    let sizePricePence = 0;
    let selectedSizeLabel = undefined;

    if (product.sizes && product.sizes.length > 0) {
      if (!item.size) {
        return {
          isValid: false,
          statusCode: 400,
          errorMessage: `Please select a size option for "${product.name}".`,
        };
      }
      const matchedSize = product.sizes.find(
        (s) => s.label.toLowerCase() === item.size?.trim().toLowerCase()
      );
      if (!matchedSize) {
        return {
          isValid: false,
          statusCode: 400,
          errorMessage: `Invalid size option "${item.size}" for "${product.name}".`,
        };
      }
      selectedSizeLabel = matchedSize.label;
      sizePricePence = matchedSize.pricePence ?? Math.round(matchedSize.price * 100);
    }

    // Flavour validation
    let validatedFlavour = undefined;
    if (item.flavour && product.flavours && product.flavours.length > 0) {
      const matched = product.flavours.find(
        (f) => f.toLowerCase() === item.flavour?.trim().toLowerCase()
      );
      if (matched) {
        validatedFlavour = matched;
      }
    }

    // Extras validation and price calculation
    const validatedExtras: { id: string; name: string; pricePence: number }[] = [];
    if (Array.isArray(item.extras) && item.extras.length > 0 && product.extras) {
      for (const extraItem of item.extras) {
        const matchedExtra = product.extras.find((e) => e.id === extraItem.id);
        if (matchedExtra) {
          const extraPence = matchedExtra.pricePence ?? Math.round(matchedExtra.price * 100);
          validatedExtras.push({
            id: matchedExtra.id,
            name: matchedExtra.name,
            pricePence: extraPence,
          });
        }
      }
    }

    // Total unit price in pence (Server recalculated)
    const extrasTotalPence = validatedExtras.reduce((sum, e) => sum + e.pricePence, 0);
    const unitPricePence = basePricePence + sizePricePence + extrasTotalPence;
    const lineTotalPence = unitPricePence * quantity;

    calculatedSubtotalPence += lineTotalPence;

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPricePence,
      lineTotalPence,
      size: selectedSizeLabel,
      sizePricePence,
      flavour: validatedFlavour,
      sauce: item.sauce?.trim() || undefined,
      extras: validatedExtras,
      specialInstructions: item.specialInstructions?.trim() || undefined,
    });
  }

  // 5. Minimum Order Requirement (Delivery only)
  if (fulfilmentType === "delivery") {
    const minDeliveryPence = restaurantConfig.delivery.minimumDeliveryOrderPence;
    if (calculatedSubtotalPence < minDeliveryPence) {
      const minPounds = (minDeliveryPence / 100).toFixed(2);
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: `Delivery requires a minimum food spend of £${minPounds}. You can add more items or switch to Takeaway Collection.`,
      };
    }
  }

  // 6. Delivery Fee Calculation (Server-side)
  let deliveryFeePence = 0;
  if (fulfilmentType === "delivery") {
    if (calculatedSubtotalPence >= restaurantConfig.delivery.freeDeliveryThresholdPence) {
      deliveryFeePence = 0;
    } else {
      deliveryFeePence = restaurantConfig.delivery.deliveryFeePence;
    }
  }

  // 7. Promo Code Validation & Recalculation (Server-side)
  let discountPence = 0;
  let appliedPromoCode: string | undefined = undefined;

  if (dto.promoCode && dto.promoCode.trim()) {
    const promoCheck = calculatePromoDiscount(
      dto.promoCode,
      calculatedSubtotalPence,
      deliveryFeePence,
      fulfilmentType === "delivery"
    );

    if (!promoCheck.valid) {
      return {
        isValid: false,
        statusCode: 400,
        errorMessage: promoCheck.errorMessage || `Promo code "${dto.promoCode}" is invalid.`,
      };
    }

    appliedPromoCode = promoCheck.code;
    discountPence = promoCheck.discountPence;
    if (promoCheck.deliveryWaived) {
      deliveryFeePence = 0;
    }
  }

  // 8. Strict Final Total Pence
  const finalTotalPence = Math.max(0, calculatedSubtotalPence + deliveryFeePence - discountPence);

  // 9. Payment Status
  // Cash orders are unpaid until received in person; online_card is pending until payment gateway processes
  const paymentStatus = paymentMethod === "online_card" ? "pending" : "unpaid";
  const orderStatus = "received";

  const orderReference = dto.orderReference && dto.orderReference.startsWith("CB-")
    ? dto.orderReference
    : generateOrderReference();

  const orderData: Partial<IOrderDocument> = {
    orderReference,
    idempotencyKey: dto.idempotencyKey || dto.orderReference || undefined,
    fulfilmentType,
    customer: {
      fullName,
      email,
      phone,
    },
    delivery: validatedDelivery,
    collection: validatedCollection,
    items: validatedItems,
    promoCode: appliedPromoCode,
    pricingSummary: {
      subtotalPence: calculatedSubtotalPence,
      deliveryFeePence,
      discountPence,
      finalTotalPence,
      currency: "GBP",
    },
    paymentMethod,
    paymentStatus,
    orderStatus,
    clientIp: dto.clientIp || undefined,
  };

  return { isValid: true, orderData };
}

/**
 * Handles end-to-end order persistence with idempotency check
 */
export async function processAndSaveOrder(
  dto: CreateOrderRequestDTO & { clientIp?: string; idempotencyKey?: string }
): Promise<{ success: boolean; statusCode: number; data?: Record<string, unknown>; error?: string }> {
  // Check rate limit
  if (dto.clientIp) {
    const rateCheck = checkRateLimit(dto.clientIp);
    if (!rateCheck.allowed) {
      return {
        success: false,
        statusCode: 429,
        error: `Too many order requests. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
      };
    }
  }

  // Ensure database connection
  try {
    await connectToDatabase();
  } catch (dbConnectErr) {
    console.error("Database connection failed during order checkout:", dbConnectErr);
    return {
      success: false,
      statusCode: 503,
      error: "Our ordering database is temporarily unavailable. Please try again in a few moments.",
    };
  }

  // Check Idempotency: Has this key/order already been processed?
  const idempotencyKey = dto.idempotencyKey || dto.orderReference;
  if (idempotencyKey) {
    try {
      const existing = await OrderModel.findOne({
        $or: [{ idempotencyKey }, { orderReference: idempotencyKey }],
      }).lean();

      if (existing) {
        // Return existing order without duplicate insertion
        return {
          success: true,
          statusCode: 200,
          data: {
            orderReference: existing.orderReference,
            alreadyExisted: true,
            fulfilmentType: existing.fulfilmentType,
            customer: {
              fullName: existing.customer.fullName,
              email: existing.customer.email,
              phone: existing.customer.phone,
            },
            pricingSummary: existing.pricingSummary,
            paymentMethod: existing.paymentMethod,
            paymentStatus: existing.paymentStatus,
            orderStatus: existing.orderStatus,
            createdAt: existing.createdAt,
            estimatedTime:
              existing.fulfilmentType === "delivery"
                ? restaurantConfig.delivery.estimatedDeliveryWindow
                : restaurantConfig.currentBranch.collectionEstimate,
          },
        };
      }
    } catch (findErr) {
      console.warn("Idempotency lookup warning:", findErr);
    }
  }

  // Recalculate & validate
  const validation = await validateAndRecalculateOrder(dto);
  if (!validation.isValid) {
    return {
      success: false,
      statusCode: validation.statusCode,
      error: validation.errorMessage,
    };
  }

  // Save to MongoDB Atlas
  try {
    const newOrder = await OrderModel.create(validation.orderData);

    return {
      success: true,
      statusCode: 201,
      data: {
        orderReference: newOrder.orderReference,
        alreadyExisted: false,
        fulfilmentType: newOrder.fulfilmentType,
        customer: {
          fullName: newOrder.customer.fullName,
          email: newOrder.customer.email,
          phone: newOrder.customer.phone,
        },
        pricingSummary: newOrder.pricingSummary,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        orderStatus: newOrder.orderStatus,
        createdAt: newOrder.createdAt,
        estimatedTime:
          newOrder.fulfilmentType === "delivery"
            ? restaurantConfig.delivery.estimatedDeliveryWindow
            : restaurantConfig.currentBranch.collectionEstimate,
      },
    };
  } catch (err: unknown) {
    // Handle duplicate key error gracefully
    const isDuplicate =
      typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000;
    if (isDuplicate) {
      const existing = await OrderModel.findOne({
        $or: [{ idempotencyKey }, { orderReference: dto.orderReference }],
      }).lean();
      if (existing) {
        return {
          success: true,
          statusCode: 200,
          data: {
            orderReference: existing.orderReference,
            alreadyExisted: true,
            pricingSummary: existing.pricingSummary,
            paymentMethod: existing.paymentMethod,
            paymentStatus: existing.paymentStatus,
            orderStatus: existing.orderStatus,
            createdAt: existing.createdAt,
          },
        };
      }
    }

    console.error("Order insertion error:", err instanceof Error ? err.message : err);
    return {
      success: false,
      statusCode: 500,
      error: "Failed to persist order to database. Please check your details and try again.",
    };
  }
}
