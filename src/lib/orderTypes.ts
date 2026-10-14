// ============================================================
// CraveBox – Order Transfer Object (DTO) for Future Server API
// Ready for POST /api/orders & Stripe PaymentIntent creation
// ============================================================

export interface OrderItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  size?: string;
  sizePricePence: number;
  flavour?: string;
  sauce?: string;
  extras: {
    id: string;
    name: string;
    pricePence: number;
  }[];
  specialInstructions?: string;
  unitPricePence: number;
  lineTotalPence: number;
}

export interface CustomerDetailsDTO {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryDetailsDTO {
  postcode: string;
  addressLine1: string;
  addressLine2?: string;
  townOrCity: string;
  deliveryInstructions?: string;
  outwardCode: string;
}

export interface CollectionDetailsDTO {
  branchId: string;
  branchName: string;
  branchAddress: string;
  collectionSlotId: string;
  collectionSlotLabel: string;
  collectionNote?: string;
}

export type PaymentMethodChoice = "online_card" | "cash_on_delivery" | "cash_on_collection";

export interface CreateOrderRequestDTO {
  orderReference: string;
  fulfilmentType: "delivery" | "collection";
  customer: CustomerDetailsDTO;
  delivery?: DeliveryDetailsDTO;
  collection?: CollectionDetailsDTO;
  items: OrderItemDTO[];
  promoCode?: string;
  pricingSummary: {
    subtotalPence: number;
    deliveryFeePence: number;
    discountPence: number;
    finalTotalPence: number;
    currency: "GBP";
  };
  paymentMethod: PaymentMethodChoice;
  timestamp: string;
}
