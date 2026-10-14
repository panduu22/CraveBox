// ============================================================
// CraveBox – Central Restaurant & Fulfilment Configuration
// Keep location, delivery rules, and operating town configurable
// ============================================================

export interface OpeningTimeSlot {
  day: string;
  open: string; // 24h format e.g. "11:00"
  close: string; // 24h format e.g. "23:00"
  openHour: number;
  closeHour: number;
}

export interface BranchDetails {
  id: string;
  name: string;
  brandTag: string;
  addressLine1: string;
  addressLine2?: string;
  townOrCity: string; // Configurable operating city/town (e.g. London, Birmingham, Manchester)
  postcode: string;
  phone: string;
  email: string;
  collectionEstimate: string; // e.g. "15–20 minutes"
  schedule: OpeningTimeSlot[];
}

export interface DeliveryConfiguration {
  currency: "GBP";
  // All monetary values in integer pence to avoid float precision errors
  deliveryFeePence: number; // 299 = £2.99
  minimumDeliveryOrderPence: number; // 1200 = £12.00
  freeDeliveryThresholdPence: number; // 2500 = £25.00
  estimatedDeliveryWindow: string; // e.g. "25–40 minutes"
  // Outward postcode areas currently covered (mock configurable delivery zones)
  allowedOutwardDistricts: string[];
}

export interface PaymentConfiguration {
  allowOnlineCard: boolean;
  allowCashOnDelivery: boolean;
  allowCashOnCollection: boolean;
}

export interface RestaurantConfig {
  restaurantName: string;
  currentBranch: BranchDetails;
  delivery: DeliveryConfiguration;
  payments: PaymentConfiguration;
}

// Configurable restaurant and fulfilment settings
export const restaurantConfig: RestaurantConfig = {
  restaurantName: "CraveBox",
  currentBranch: {
    id: "branch-central",
    name: "CraveBox Central Branch",
    brandTag: "Demo Store Location (Configurable)",
    addressLine1: "123 High Street",
    addressLine2: "Suite 4B",
    townOrCity: "London", // Configurable: can be updated when town is finalised
    postcode: "E1 6RF",
    phone: "0208 123 4567",
    email: "orders@cravebox.co.uk",
    collectionEstimate: "15–20 minutes",
    schedule: [
      { day: "Monday", open: "11:00", close: "23:00", openHour: 11, closeHour: 23 },
      { day: "Tuesday", open: "11:00", close: "23:00", openHour: 11, closeHour: 23 },
      { day: "Wednesday", open: "11:00", close: "23:00", openHour: 11, closeHour: 23 },
      { day: "Thursday", open: "11:00", close: "23:00", openHour: 11, closeHour: 23 },
      { day: "Friday", open: "11:00", close: "00:00", openHour: 11, closeHour: 24 },
      { day: "Saturday", open: "11:00", close: "00:00", openHour: 11, closeHour: 24 },
      { day: "Sunday", open: "12:00", close: "22:30", openHour: 12, closeHour: 22.5 },
    ],
  },
  delivery: {
    currency: "GBP",
    deliveryFeePence: 299, // £2.99
    minimumDeliveryOrderPence: 1200, // £12.00 minimum order for delivery
    freeDeliveryThresholdPence: 2500, // £25.00 threshold for free delivery
    estimatedDeliveryWindow: "25–40 minutes",
    // Configurable outward postcode prefixes
    allowedOutwardDistricts: [
      "E1", "E2", "E3", "E8", "E9", "E14", "E15",
      "EC1", "EC2", "EC3", "EC4",
      "WC1", "WC2",
      "SE1", "SE16",
      "N1",
      "NE1", "NE2", "NE3", "NE4", "NE5", "NE6", "NE7", "NE8",
    ],
  },
  payments: {
    allowOnlineCard: true,
    allowCashOnDelivery: true,
    allowCashOnCollection: true,
  },
};

// ============================================================
// Postcode & Phone Validation Utilities
// ============================================================

export function isValidUKPostcodeFormat(postcode: string): boolean {
  if (!postcode) return false;
  const cleaned = postcode.trim().toUpperCase();
  // Standard UK postcode regex (A-Z1-2 digits/alpha space digits A-Z2)
  const ukRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  return ukRegex.test(cleaned);
}

export interface PostcodeValidationResult {
  isValidFormat: boolean;
  isInDeliveryZone: boolean;
  outwardCode: string;
  formattedPostcode: string;
  errorMessage?: string;
  successMessage?: string;
}

export function validateDeliveryPostcode(rawPostcode: string): PostcodeValidationResult {
  const cleaned = rawPostcode.trim().toUpperCase();

  if (!cleaned) {
    return {
      isValidFormat: false,
      isInDeliveryZone: false,
      outwardCode: "",
      formattedPostcode: "",
      errorMessage: "Please enter your UK postcode.",
    };
  }

  if (!isValidUKPostcodeFormat(cleaned)) {
    return {
      isValidFormat: false,
      isInDeliveryZone: false,
      outwardCode: "",
      formattedPostcode: cleaned,
      errorMessage: "Please enter a valid UK postcode format (e.g. E1 6RF or SW1A 1AA).",
    };
  }

  // Normalise spaces: e.g. 'e16rf' -> 'E1 6RF'
  const compact = cleaned.replace(/\s+/g, "");
  const inward = compact.slice(-3);
  const outward = compact.slice(0, compact.length - 3);
  const formattedPostcode = `${outward} ${inward}`;

  // Check if outward code is in the configured active service area
  const isCovered = restaurantConfig.delivery.allowedOutwardDistricts.some(
    (dist) => outward === dist || outward.startsWith(dist)
  );

  if (!isCovered) {
    return {
      isValidFormat: true,
      isInDeliveryZone: false,
      outwardCode: outward,
      formattedPostcode,
      errorMessage: `We currently do not deliver to ${outward}. You can still choose Takeaway Collection or order to an address in our delivery zones.`,
    };
  }

  return {
    isValidFormat: true,
    isInDeliveryZone: true,
    outwardCode: outward,
    formattedPostcode,
    successMessage: `Verified! We deliver to ${outward} (approx ${restaurantConfig.delivery.estimatedDeliveryWindow}).`,
  };
}

export function isValidUKMobile(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  // UK mobile: starts with 07 followed by 9 digits, or +447 followed by 9 digits
  const ukMobileRegex = /^(?:(?:\+44\s?|0)7(?:[1-9]\d{8}|0\d{8}))$/;
  return ukMobileRegex.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Available collection time windows (validated against today's hours)
export function getAvailableCollectionSlots(): { id: string; label: string; available: boolean }[] {
  return [
    { id: "asap", label: `ASAP (${restaurantConfig.currentBranch.collectionEstimate})`, available: true },
    { id: "slot-30", label: "In 30–45 minutes", available: true },
    { id: "slot-60", label: "In 1 hour", available: true },
    { id: "slot-90", label: "In 1.5 hours", available: true },
    { id: "slot-later", label: "Later today (Store confirmed)", available: true },
  ];
}
