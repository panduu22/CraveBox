// ============================================================
// CraveBox – Promo Code Engine (Integer Pence Arithmetic)
// ============================================================

export interface PromoCode {
  code: string;
  description: string;
  type: "percent" | "fixed" | "free_delivery";
  valuePenceOrPercent: number; // e.g. 10 for 10%, 300 for £3.00
  minimumSubtotalPence?: number;
}

export const VALID_PROMO_CODES: Record<string, PromoCode> = {
  FREESHIP: {
    code: "FREESHIP",
    description: "Free delivery on your order",
    type: "free_delivery",
    valuePenceOrPercent: 0,
  },
  CRAVE10: {
    code: "CRAVE10",
    description: "10% off your food subtotal",
    type: "percent",
    valuePenceOrPercent: 10,
    minimumSubtotalPence: 1000, // £10.00 min
  },
  HOTCHICKEN: {
    code: "HOTCHICKEN",
    description: "£3.00 off orders over £15",
    type: "fixed",
    valuePenceOrPercent: 300, // £3.00 in pence
    minimumSubtotalPence: 1500, // £15.00 min
  },
};

export interface PromoCalculationResult {
  valid: boolean;
  code?: string;
  description?: string;
  discountPence: number;
  deliveryWaived: boolean;
  errorMessage?: string;
}

export function calculatePromoDiscount(
  rawCode: string,
  subtotalPence: number,
  deliveryFeePence: number,
  isDelivery: boolean
): PromoCalculationResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discountPence: 0, deliveryWaived: false };
  }

  const promo = VALID_PROMO_CODES[code];
  if (!promo) {
    return {
      valid: false,
      discountPence: 0,
      deliveryWaived: false,
      errorMessage: `Promo code "${code}" is not valid or has expired.`,
    };
  }

  if (promo.minimumSubtotalPence && subtotalPence < promo.minimumSubtotalPence) {
    const requiredFormatted = `£${(promo.minimumSubtotalPence / 100).toFixed(2)}`;
    return {
      valid: false,
      discountPence: 0,
      deliveryWaived: false,
      errorMessage: `Code ${code} requires a minimum food subtotal of ${requiredFormatted}.`,
    };
  }

  if (promo.type === "free_delivery") {
    if (!isDelivery) {
      return {
        valid: false,
        discountPence: 0,
        deliveryWaived: false,
        errorMessage: "Code FREESHIP is only applicable to Home Delivery orders.",
      };
    }
    return {
      valid: true,
      code,
      description: promo.description,
      discountPence: deliveryFeePence,
      deliveryWaived: true,
    };
  }

  if (promo.type === "percent") {
    // Exact integer pence calculation: Math.round(subtotalPence * percent / 100)
    const discountPence = Math.round((subtotalPence * promo.valuePenceOrPercent) / 100);
    return {
      valid: true,
      code,
      description: promo.description,
      discountPence,
      deliveryWaived: false,
    };
  }

  if (promo.type === "fixed") {
    const discountPence = Math.min(subtotalPence, promo.valuePenceOrPercent);
    return {
      valid: true,
      code,
      description: promo.description,
      discountPence,
      deliveryWaived: false,
    };
  }

  return { valid: false, discountPence: 0, deliveryWaived: false };
}
