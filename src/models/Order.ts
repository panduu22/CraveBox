// ============================================================
// CraveBox – Mongoose Order Model
// Collection: cravebox.orders
// Immutable snapshots of customer orders, verified server pricing,
// fulfilment details, payment status, and order status.
// ============================================================

import mongoose, { Schema, Model } from "mongoose";

export type FulfilmentType = "delivery" | "collection";
export type PaymentMethod = "online_card" | "cash_on_delivery" | "cash_on_collection";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "received"
  | "kitchen_preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface IOrderItemExtra {
  id: string;
  name: string;
  pricePence: number;
}

export interface IOrderItemSnapshot {
  productId: string;
  productName: string;
  quantity: number;
  unitPricePence: number;
  lineTotalPence: number;
  size?: string;
  sizePricePence: number;
  flavour?: string;
  sauce?: string;
  extras: IOrderItemExtra[];
  specialInstructions?: string;
}

export interface ICustomerSnapshot {
  fullName: string;
  email: string;
  phone: string;
}

export interface IDeliverySnapshot {
  postcode: string;
  addressLine1: string;
  addressLine2?: string;
  townOrCity: string;
  deliveryInstructions?: string;
  outwardCode: string;
}

export interface ICollectionSnapshot {
  branchId: string;
  branchName: string;
  branchAddress: string;
  collectionSlotId: string;
  collectionSlotLabel: string;
  collectionNote?: string;
}

export interface IPricingSummarySnapshot {
  subtotalPence: number;
  deliveryFeePence: number;
  discountPence: number;
  finalTotalPence: number;
  currency: "GBP";
}

export interface IOrder {
  orderReference: string;
  idempotencyKey?: string;
  fulfilmentType: FulfilmentType;
  customer: ICustomerSnapshot;
  delivery?: IDeliverySnapshot;
  collection?: ICollectionSnapshot;
  items: IOrderItemSnapshot[];
  promoCode?: string;
  pricingSummary: IPricingSummarySnapshot;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  stripePaymentIntentId?: string;
  clientIp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IOrderDocument = IOrder & {
  _id: mongoose.Types.ObjectId;
};

const OrderItemExtraSchema = new Schema<IOrderItemExtra>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    pricePence: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>(
  {
    productId: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
    unitPricePence: { type: Number, required: true, min: 0 },
    lineTotalPence: { type: Number, required: true, min: 0 },
    size: { type: String, trim: true },
    sizePricePence: { type: Number, default: 0, min: 0 },
    flavour: { type: String, trim: true },
    sauce: { type: String, trim: true },
    extras: { type: [OrderItemExtraSchema], default: [] },
    specialInstructions: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const CustomerSnapshotSchema = new Schema<ICustomerSnapshot>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DeliverySnapshotSchema = new Schema<IDeliverySnapshot>(
  {
    postcode: { type: String, required: true, trim: true, uppercase: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    townOrCity: { type: String, required: true, trim: true },
    deliveryInstructions: { type: String, trim: true, maxlength: 500 },
    outwardCode: { type: String, required: true, trim: true, uppercase: true },
  },
  { _id: false }
);

const CollectionSnapshotSchema = new Schema<ICollectionSnapshot>(
  {
    branchId: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    branchAddress: { type: String, required: true, trim: true },
    collectionSlotId: { type: String, required: true, trim: true },
    collectionSlotLabel: { type: String, required: true, trim: true },
    collectionNote: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const PricingSummarySnapshotSchema = new Schema<IPricingSummarySnapshot>(
  {
    subtotalPence: { type: Number, required: true, min: 0 },
    deliveryFeePence: { type: Number, required: true, min: 0 },
    discountPence: { type: Number, required: true, min: 0 },
    finalTotalPence: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "GBP" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    fulfilmentType: {
      type: String,
      required: true,
      enum: ["delivery", "collection"],
      index: true,
    },
    customer: {
      type: CustomerSnapshotSchema,
      required: true,
    },
    delivery: {
      type: DeliverySnapshotSchema,
      default: undefined,
    },
    collection: {
      type: CollectionSnapshotSchema,
      default: undefined,
    },
    items: {
      type: [OrderItemSnapshotSchema],
      required: true,
      validate: [(val: IOrderItemSnapshot[]) => val.length > 0, "Order must contain at least one item."],
    },
    promoCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    pricingSummary: {
      type: PricingSummarySnapshotSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["online_card", "cash_on_delivery", "cash_on_collection"],
      index: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "received",
        "kitchen_preparing",
        "ready_for_pickup",
        "out_for_delivery",
        "completed",
        "cancelled",
      ],
      default: "received",
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      sparse: true,
    },
    clientIp: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "orders", // Explicitly store in cravebox.orders
    suppressReservedKeysWarning: true,
  }
);

// Indexes
OrderSchema.index({ "customer.email": 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel: Model<IOrder> =
  (mongoose.models && mongoose.models.Order) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
