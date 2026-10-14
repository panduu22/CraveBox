// ============================================================
// CraveBox – Mongoose Product Model
// Collection: cravebox.products
// Stores menu products with integer pence pricing & variants
// ============================================================

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExtra {
  id: string;
  name: string;
  price: number; // GBP float (e.g. 0.50)
  pricePence: number; // Integer pence (e.g. 50)
}

export interface ISizeVariant {
  label: string;
  price: number; // GBP addon float (e.g. 2.00)
  pricePence: number; // Integer pence (e.g. 200)
}

export interface IProductDocument extends Document {
  id: string; // Stable product identifier e.g. "c1", "b1"
  slug: string; // URL-safe unique slug e.g. "classic-crunch-chicken"
  name: string;
  description: string;
  price: number; // GBP float (e.g. 7.99)
  pricePence: number; // Exact integer pence (e.g. 799)
  image: string;
  category: string;
  available: boolean;
  popular?: boolean;
  bestseller?: boolean;
  vegetarian?: boolean;
  sizes?: ISizeVariant[];
  flavours?: string[];
  sauces?: string[];
  extras?: IExtra[];
  allergens?: string[];
  calories?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExtraSchema = new Schema<IExtra>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    pricePence: { type: Number, required: true },
  },
  { _id: false }
);

const SizeVariantSchema = new Schema<ISizeVariant>(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true },
    pricePence: { type: Number, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePence: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    vegetarian: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: [SizeVariantSchema],
      default: undefined,
    },
    flavours: {
      type: [String],
      default: undefined,
    },
    sauces: {
      type: [String],
      default: undefined,
    },
    extras: {
      type: [ExtraSchema],
      default: undefined,
    },
    allergens: {
      type: [String],
      default: undefined,
    },
    calories: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "products", // Explicitly map to cravebox.products collection
  }
);

// Prevent model recompilation during Next.js hot-reloading
export const ProductModel: Model<IProductDocument> =
  (mongoose.models && mongoose.models.Product) ||
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default ProductModel;
