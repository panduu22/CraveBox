"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Store,
  CreditCard,
  Banknote,
  Lock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  Tag,
  ArrowRight,
  ShieldCheck,
  Building2,
  Info,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatGBPFromPence } from "@/lib/currency";
import {
  restaurantConfig,
  validateDeliveryPostcode,
  isValidUKMobile,
  isValidEmail,
  getAvailableCollectionSlots,
  PostcodeValidationResult,
} from "@/lib/restaurantConfig";
import { calculatePromoDiscount, PromoCalculationResult } from "@/lib/promoCodes";
import { CreateOrderRequestDTO, PaymentMethodChoice } from "@/lib/orderTypes";

type FulfilmentType = "delivery" | "collection";

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  // Delivery fields
  postcode: string;
  addressLine1: string;
  addressLine2: string;
  townOrCity: string;
  deliveryInstructions: string;
  // Collection fields
  collectionSlotId: string;
  collectionNotes: string;
  // Payment
  paymentMethod: PaymentMethodChoice;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  addressLine1?: string;
  townOrCity?: string;
}

export default function CheckoutClient() {
  const router = useRouter();
  const { items, subtotalPence, clearCart, getItemPricing } = useCart();

  const [fulfilment, setFulfilment] = useState<FulfilmentType>("delivery");
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    postcode: "",
    addressLine1: "",
    addressLine2: "",
    townOrCity: restaurantConfig.currentBranch.townOrCity, // Pre-fill with configured town
    deliveryInstructions: "",
    collectionSlotId: "asap",
    collectionNotes: "",
    paymentMethod: "online_card",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [postcodeCheck, setPostcodeCheck] = useState<PostcodeValidationResult | null>(null);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Submission & Gateway Ready Modal state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderSubmitError, setOrderSubmitError] = useState<string | null>(null);
  const [preparedOrderPayload, setPreparedOrderPayload] = useState<CreateOrderRequestDTO | null>(null);
  const [showOrderReviewModal, setShowOrderReviewModal] = useState(false);

  // Available collection slots
  const collectionSlots = useMemo(() => getAvailableCollectionSlots(), []);

  // Delivery fee calculation
  const isDelivery = fulfilment === "delivery";
  const standardDeliveryFeePence =
    !isDelivery || subtotalPence >= restaurantConfig.delivery.freeDeliveryThresholdPence || items.length === 0
      ? 0
      : restaurantConfig.delivery.deliveryFeePence;

  // Calculate active promo
  const promoResult: PromoCalculationResult = useMemo(() => {
    if (!appliedPromo) {
      return { valid: false, discountPence: 0, deliveryWaived: false };
    }
    return calculatePromoDiscount(appliedPromo, subtotalPence, standardDeliveryFeePence, isDelivery);
  }, [appliedPromo, subtotalPence, standardDeliveryFeePence, isDelivery]);

  const deliveryFeePence = promoResult.deliveryWaived ? 0 : standardDeliveryFeePence;
  const discountPence = promoResult.discountPence;

  // Final Total strictly calculated in integer pence
  const finalTotalPence = Math.max(0, subtotalPence + deliveryFeePence - discountPence);

  // Delivery minimum check
  const minimumOrderPence = restaurantConfig.delivery.minimumDeliveryOrderPence;
  const isDeliveryShortfall = isDelivery && subtotalPence < minimumOrderPence && items.length > 0;
  const shortfallAmountPence = minimumOrderPence - subtotalPence;

  // Field change handler
  function handleInputChange(field: keyof CheckoutFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear inline error on edit
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Auto-check postcode when user enters UK postcode
    if (field === "postcode") {
      if (value.trim().length >= 5) {
        const check = validateDeliveryPostcode(value);
        setPostcodeCheck(check);
        if (!check.isValidFormat) {
          setErrors((prev) => ({ ...prev, postcode: check.errorMessage }));
        } else if (!check.isInDeliveryZone) {
          setErrors((prev) => ({ ...prev, postcode: check.errorMessage }));
        } else {
          setErrors((prev) => ({ ...prev, postcode: undefined }));
        }
      } else {
        setPostcodeCheck(null);
      }
    }
  }

  // Switch fulfilment type and reset payment option if needed
  function handleFulfilmentSwitch(type: FulfilmentType) {
    setFulfilment(type);
    if (type === "collection" && formData.paymentMethod === "cash_on_delivery") {
      setFormData((prev) => ({ ...prev, paymentMethod: "cash_on_collection" }));
    } else if (type === "delivery" && formData.paymentMethod === "cash_on_collection") {
      setFormData((prev) => ({ ...prev, paymentMethod: "cash_on_delivery" }));
    }
  }

  // Apply promo code
  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = calculatePromoDiscount(promoInput, subtotalPence, standardDeliveryFeePence, isDelivery);
    if (res.valid) {
      setAppliedPromo(res.code || promoInput.toUpperCase());
      setPromoMessage(`Promo code "${res.code}" applied: ${res.description}`);
    } else {
      setPromoMessage(res.errorMessage || "Invalid promo code.");
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoMessage(null);
  }

  // Form Validation
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    if (!isValidUKMobile(formData.phone)) {
      newErrors.phone = "Please enter a valid UK mobile number starting with 07 (e.g. 07123 456789).";
    }

    if (isDelivery) {
      const check = validateDeliveryPostcode(formData.postcode);
      setPostcodeCheck(check);
      if (!check.isValidFormat) {
        newErrors.postcode = check.errorMessage || "Please enter a valid UK postcode.";
      } else if (!check.isInDeliveryZone) {
        newErrors.postcode = check.errorMessage;
      }

      if (!formData.addressLine1.trim()) {
        newErrors.addressLine1 = "Please enter your street address and house/flat number.";
      }

      if (!formData.townOrCity.trim()) {
        newErrors.townOrCity = "Please enter your town or city.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Handle Form Submission
  function handleOrderReview(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      return;
    }

    if (isDeliveryShortfall) {
      return;
    }

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector(".border-red-500");
      firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    // Prepare clean server-side Order Payload DTO
    // Ensures client totals are formatted for backend validation without trusting client sums
    const selectedSlot = collectionSlots.find((s) => s.id === formData.collectionSlotId);

    const payload: CreateOrderRequestDTO = {
      orderReference: `CB-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      fulfilmentType: fulfilment,
      customer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      },
      delivery: isDelivery
        ? {
            postcode: postcodeCheck?.formattedPostcode || formData.postcode.toUpperCase().trim(),
            addressLine1: formData.addressLine1.trim(),
            addressLine2: formData.addressLine2.trim() || undefined,
            townOrCity: formData.townOrCity.trim(),
            deliveryInstructions: formData.deliveryInstructions.trim() || undefined,
            outwardCode: postcodeCheck?.outwardCode || "",
          }
        : undefined,
      collection: !isDelivery
        ? {
            branchId: restaurantConfig.currentBranch.id,
            branchName: restaurantConfig.currentBranch.name,
            branchAddress: `${restaurantConfig.currentBranch.addressLine1}, ${restaurantConfig.currentBranch.townOrCity} ${restaurantConfig.currentBranch.postcode}`,
            collectionSlotId: formData.collectionSlotId,
            collectionSlotLabel: selectedSlot?.label || "ASAP",
            collectionNote: formData.collectionNotes.trim() || undefined,
          }
        : undefined,
      items: items.map((item) => {
        const pricing = getItemPricing(item);
        return {
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.customisation.quantity,
          size: item.customisation.size,
          sizePricePence: Math.round((item.customisation.sizePrice ?? 0) * 100),
          flavour: item.customisation.flavour,
          sauce: item.customisation.sauce,
          extras: item.customisation.extras.map((ex) => ({
            id: ex.id,
            name: ex.name,
            pricePence: Math.round(ex.price * 100),
          })),
          specialInstructions: item.customisation.specialInstructions,
          unitPricePence: pricing.unitPence,
          lineTotalPence: pricing.totalPence,
        };
      }),
      promoCode: appliedPromo || undefined,
      pricingSummary: {
        subtotalPence,
        deliveryFeePence,
        discountPence,
        finalTotalPence,
        currency: "GBP",
      },
      paymentMethod: formData.paymentMethod,
      timestamp: new Date().toISOString(),
    };

    setPreparedOrderPayload(payload);
    setShowOrderReviewModal(true);
    setIsSubmitting(false);
  }

  // Empty cart fallback
  if (items.length === 0 && !preparedOrderPayload) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 px-4 py-16 bg-[#faf7f2]">
        <div className="text-7xl animate-bounce">🛒</div>
        <div className="text-center">
          <h1 className="font-display font-black text-3xl mb-2 text-[#1a1a1a]">Your basket is empty</h1>
          <p className="text-stone-500 max-w-md text-sm leading-relaxed">
            Please add some delicious items from our menu before proceeding to checkout.
          </p>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-2 bg-[#d42b2b] hover:bg-[#b52222] text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md shadow-red-500/20 hover:-translate-y-0.5"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-6">
          <Link href="/cart" className="hover:text-[#d42b2b] transition-colors">
            Basket ({items.length} items)
          </Link>
          <ChevronRight size={13} className="text-stone-400" />
          <span className="text-[#d42b2b]">Checkout & Fulfilment</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1a1a1a]">Checkout</h1>
            <p className="text-xs text-stone-500 mt-1">
              Select delivery or collection, enter your contact details, and review your order.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Secure 256-bit Checkout</span>
          </div>
        </div>

        <form onSubmit={handleOrderReview}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: Forms */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Fulfilment Selection Cards */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80">
                <h2 className="font-display font-bold text-lg text-stone-900 mb-1">
                  1. Choose Fulfilment Method
                </h2>
                <p className="text-xs text-stone-500 mb-4">
                  Select whether you would like home delivery or takeaway collection from our branch.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Home Delivery Option */}
                  <button
                    type="button"
                    onClick={() => handleFulfilmentSwitch("delivery")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                      isDelivery
                        ? "border-[#d42b2b] bg-red-50/50 shadow-sm"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isDelivery ? "bg-[#d42b2b] text-white" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">Home Delivery</span>
                          {isDelivery && (
                            <span className="w-2 h-2 rounded-full bg-[#d42b2b] inline-block" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1 leading-snug">
                          Delivered to your doorstep in approx {restaurantConfig.delivery.estimatedDeliveryWindow}.
                        </p>
                        <div className="mt-2 text-[11px] font-semibold text-stone-600">
                          {standardDeliveryFeePence === 0 ? (
                            <span className="text-emerald-600 font-bold">FREE Delivery</span>
                          ) : (
                            <span>Delivery: {formatGBPFromPence(restaurantConfig.delivery.deliveryFeePence)} (Free over £25)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Takeaway Collection Option */}
                  <button
                    type="button"
                    onClick={() => handleFulfilmentSwitch("collection")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                      !isDelivery
                        ? "border-[#d42b2b] bg-red-50/50 shadow-sm"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          !isDelivery ? "bg-[#d42b2b] text-white" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        <Store size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">Takeaway Collection</span>
                          {!isDelivery && (
                            <span className="w-2 h-2 rounded-full bg-[#d42b2b] inline-block" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1 leading-snug">
                          Pick up directly from our counter. Fast & fresh.
                        </p>
                        <div className="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          Ready in {restaurantConfig.currentBranch.collectionEstimate} · No Min Order
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Minimum Order Shortfall Warning Banner */}
                {isDeliveryShortfall && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-sm block mb-0.5">
                        Minimum delivery order is {formatGBPFromPence(minimumOrderPence)}
                      </strong>
                      <span>
                        Your food subtotal is {formatGBPFromPence(subtotalPence)}. Please add{" "}
                        <strong>{formatGBPFromPence(shortfallAmountPence)}</strong> more to proceed with delivery,
                        or switch to <strong>Takeaway Collection</strong> with no minimum spend!
                      </span>
                      <div className="mt-2.5 flex items-center gap-3">
                        <Link
                          href="/menu"
                          className="font-bold text-[#d42b2b] underline hover:text-[#b52222]"
                        >
                          + Add items from menu
                        </Link>
                        <span className="text-stone-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleFulfilmentSwitch("collection")}
                          className="font-bold text-stone-800 underline hover:text-[#d42b2b]"
                        >
                          Switch to Collection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Customer Contact Details */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80">
                <h2 className="font-display font-bold text-lg text-stone-900 mb-1">
                  2. Contact Information
                </h2>
                <p className="text-xs text-stone-500 mb-4">
                  We use your details to send order updates and text our delivery rider instructions.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="fullName">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                        errors.fullName ? "border-red-500 bg-red-50/30" : "border-stone-200 focus:border-[#d42b2b]"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="alex@example.co.uk"
                        className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                          errors.email ? "border-red-500 bg-red-50/30" : "border-stone-200 focus:border-[#d42b2b]"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="phone">
                        UK Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="07123 456789"
                        className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                          errors.phone ? "border-red-500 bg-red-50/30" : "border-stone-200 focus:border-[#d42b2b]"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3A. Delivery Details (if Home Delivery) */}
              {isDelivery ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 animate-fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display font-bold text-lg text-stone-900">
                      3. Delivery Address
                    </h2>
                    <span className="text-xs text-stone-400">UK Delivery Only</span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4">
                    Enter your delivery address. Service area validation is checked against active delivery zones.
                  </p>

                  <div className="space-y-4">
                    {/* Postcode validation field */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="postcode">
                        UK Postcode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="postcode"
                          type="text"
                          required
                          value={formData.postcode}
                          onChange={(e) => handleInputChange("postcode", e.target.value)}
                          placeholder="e.g. E1 6RF or EC2A 4NE"
                          className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm uppercase font-medium focus:outline-none transition-colors ${
                            errors.postcode
                              ? "border-red-500 bg-red-50/30 text-red-900"
                              : postcodeCheck?.isInDeliveryZone
                              ? "border-emerald-500 bg-emerald-50/20 text-emerald-900"
                              : "border-stone-200 focus:border-[#d42b2b]"
                          }`}
                        />
                        {postcodeCheck?.isInDeliveryZone && (
                          <CheckCircle2
                            size={18}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600"
                          />
                        )}
                      </div>

                      {/* Postcode Feedback */}
                      {errors.postcode ? (
                        <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1.5">
                          <AlertCircle size={13} className="flex-shrink-0" />
                          <span>{errors.postcode}</span>
                        </p>
                      ) : postcodeCheck?.isInDeliveryZone ? (
                        <p className="text-xs text-emerald-700 mt-1.5 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="flex-shrink-0" />
                          <span>{postcodeCheck.successMessage}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-stone-400 mt-1">
                          We currently deliver to postcodes starting with:{" "}
                          {restaurantConfig.delivery.allowedOutwardDistricts.slice(0, 6).join(", ")}...
                        </p>
                      )}
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="addressLine1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="addressLine1"
                        type="text"
                        required
                        value={formData.addressLine1}
                        onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                        placeholder="House / Flat number and street name"
                        className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                          errors.addressLine1 ? "border-red-500 bg-red-50/30" : "border-stone-200 focus:border-[#d42b2b]"
                        }`}
                      />
                      {errors.addressLine1 && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.addressLine1}</p>
                      )}
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="addressLine2">
                        Address Line 2 <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="addressLine2"
                        type="text"
                        value={formData.addressLine2}
                        onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                        placeholder="Apartment, suite, unit, building floor"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b]"
                      />
                    </div>

                    {/* Town / City */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="townOrCity">
                        Town or City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="townOrCity"
                        type="text"
                        required
                        value={formData.townOrCity}
                        onChange={(e) => handleInputChange("townOrCity", e.target.value)}
                        placeholder="e.g. London"
                        className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm focus:outline-none transition-colors ${
                          errors.townOrCity ? "border-red-500 bg-red-50/30" : "border-stone-200 focus:border-[#d42b2b]"
                        }`}
                      />
                      {errors.townOrCity && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.townOrCity}</p>
                      )}
                    </div>

                    {/* Delivery Instructions */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="deliveryInstructions">
                        Delivery Notes <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        id="deliveryInstructions"
                        rows={2}
                        value={formData.deliveryInstructions}
                        onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                        placeholder="e.g. Leave with reception, ring flat buzzer #12, knock loudly..."
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#d42b2b] resize-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* 3B. Collection Details (if Takeaway Collection) */
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 animate-fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display font-bold text-lg text-stone-900">
                      3. Collection Store & Time
                    </h2>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Free Collection
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-4">
                    Your food will be freshly prepared and packed ready for counter pickup.
                  </p>

                  {/* Branch Details Card */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 mb-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-[#d42b2b]" />
                        <h3 className="font-bold text-sm text-stone-900">
                          {restaurantConfig.currentBranch.name}
                        </h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-md">
                        {restaurantConfig.currentBranch.brandTag}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 pl-6">
                      {restaurantConfig.currentBranch.addressLine1}, {restaurantConfig.currentBranch.townOrCity} {restaurantConfig.currentBranch.postcode}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-stone-500 pt-1 pl-6">
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-[#d42b2b]" />
                        {restaurantConfig.currentBranch.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#d42b2b]" />
                        Today: 11:00 – 23:00 (Open)
                      </span>
                    </div>
                  </div>

                  {/* Pick Collection Time Window */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="collectionSlot">
                        Estimated Collection Time <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="collectionSlot"
                        value={formData.collectionSlotId}
                        onChange={(e) => handleInputChange("collectionSlotId", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b]"
                      >
                        {collectionSlots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                        <Info size={12} />
                        <span>Collection slots are subject to store kitchen queue confirmation.</span>
                      </p>
                    </div>

                    {/* Collection Note */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="collectionNotes">
                        Collection Note <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="collectionNotes"
                        type="text"
                        value={formData.collectionNotes}
                        onChange={(e) => handleInputChange("collectionNotes", e.target.value)}
                        placeholder="e.g. Collecting in red car, will ring on arrival"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#d42b2b]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Payment Method UI */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80">
                <h2 className="font-display font-bold text-lg text-stone-900 mb-1">
                  4. Payment Method
                </h2>
                <p className="text-xs text-stone-500 mb-4">
                  Choose how you would like to settle your order.
                </p>

                <div className="space-y-3">
                  {/* Online Card Option */}
                  {restaurantConfig.payments.allowOnlineCard && (
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === "online_card"
                          ? "border-[#d42b2b] bg-red-50/40 shadow-xs"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online_card"
                        checked={formData.paymentMethod === "online_card"}
                        onChange={() => handleInputChange("paymentMethod", "online_card")}
                        className="mt-1 text-[#d42b2b] focus:ring-[#d42b2b]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                            <CreditCard size={17} className="text-[#d42b2b]" />
                            Online Payment (Card / Digital Wallet)
                          </span>
                          <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            Secure Gateway
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1 leading-snug">
                          Pay securely with Visa, Mastercard, American Express, Apple Pay or Google Pay.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Cash on Delivery Option (only for Delivery) */}
                  {isDelivery && restaurantConfig.payments.allowCashOnDelivery && (
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === "cash_on_delivery"
                          ? "border-[#d42b2b] bg-red-50/40 shadow-xs"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === "cash_on_delivery"}
                        onChange={() => handleInputChange("paymentMethod", "cash_on_delivery")}
                        className="mt-1 text-[#d42b2b] focus:ring-[#d42b2b]"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <Banknote size={17} className="text-[#d42b2b]" />
                          Cash on Delivery
                        </span>
                        <p className="text-xs text-stone-500 mt-1 leading-snug">
                          Pay cash to our delivery driver at your doorstep. Please have exact change if possible.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Cash on Collection Option (only for Collection) */}
                  {!isDelivery && restaurantConfig.payments.allowCashOnCollection && (
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === "cash_on_collection"
                          ? "border-[#d42b2b] bg-red-50/40 shadow-xs"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_collection"
                        checked={formData.paymentMethod === "cash_on_collection"}
                        onChange={() => handleInputChange("paymentMethod", "cash_on_collection")}
                        className="mt-1 text-[#d42b2b] focus:ring-[#d42b2b]"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-sm text-stone-900 flex items-center gap-2">
                          <Banknote size={17} className="text-[#d42b2b]" />
                          Pay on Collection (Cash or Card at Store)
                        </span>
                        <p className="text-xs text-stone-500 mt-1 leading-snug">
                          Pay using cash or chip & pin card machine when collecting your takeaway.
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-500 flex items-center gap-2">
                  <Lock size={14} className="text-stone-400 flex-shrink-0" />
                  <span>
                    No fake completed orders are created: submitting validates your order payload ready for backend dispatch.
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Sticky Order Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                  <h2 className="font-display font-bold text-lg text-stone-900">Order Summary</h2>
                  <Link href="/cart" className="text-xs font-semibold text-[#d42b2b] hover:underline">
                    Edit Basket
                  </Link>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 mb-4 divide-y divide-stone-50">
                  {items.map((item) => {
                    const pricing = getItemPricing(item);
                    return (
                      <div key={item.cartId} className="pt-3 first:pt-0 flex gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 relative">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                              {item.product.name}
                            </p>
                            <span className="text-xs sm:text-sm font-bold text-[#d42b2b] whitespace-nowrap">
                              {formatGBPFromPence(pricing.totalPence)}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-500 mt-0.5 space-y-0.5">
                            <p className="font-medium text-stone-700">Qty: {item.customisation.quantity}</p>
                            {item.customisation.size && (
                              <p>Portion: {item.customisation.size}</p>
                            )}
                            {item.customisation.flavour && (
                              <p>Flavour: {item.customisation.flavour}</p>
                            )}
                            {item.customisation.sauce && (
                              <p>Sauce: {item.customisation.sauce}</p>
                            )}
                            {item.customisation.extras.length > 0 && (
                              <p>+ {item.customisation.extras.map((e) => e.name).join(", ")}</p>
                            )}
                            {item.customisation.specialInstructions && (
                              <p className="italic text-stone-400">Note: {item.customisation.specialInstructions}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code Input */}
                <div className="border-t border-stone-100 pt-4 mb-4">
                  {appliedPromo ? (
                    promoResult.valid ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                        <div className="flex items-center gap-1.5">
                          <Tag size={13} className="text-emerald-600" />
                          <span>Code <strong>{appliedPromo}</strong> applied</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-emerald-700 hover:text-red-600 font-bold p-1"
                          aria-label="Remove promo code"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={13} className="text-amber-600 shrink-0" />
                          <span><strong>{appliedPromo}</strong>: {promoResult.errorMessage || "Conditions not met"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-amber-700 hover:text-red-600 font-bold p-1 ml-2"
                          aria-label="Remove promo code"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Promo code (e.g. CRAVE10)"
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase focus:outline-none focus:border-[#d42b2b]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoMessage && !appliedPromo && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{promoMessage}</p>
                  )}
                </div>

                {/* Price Breakdown (Strict Integer Pence) */}
                <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Food Subtotal</span>
                    <span className="font-semibold text-stone-900">{formatGBPFromPence(subtotalPence)}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Fulfilment ({isDelivery ? "Home Delivery" : "Collection"})</span>
                    <span className={deliveryFeePence === 0 ? "text-emerald-600 font-bold" : "font-semibold text-stone-900"}>
                      {deliveryFeePence === 0 ? "FREE" : formatGBPFromPence(deliveryFeePence)}
                    </span>
                  </div>

                  {discountPence > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount ({appliedPromo})</span>
                      <span>-{formatGBPFromPence(discountPence)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline font-black text-lg text-stone-900 border-t border-stone-100 pt-3 mt-1">
                    <span>Total Due</span>
                    <span className="text-[#d42b2b] text-xl">{formatGBPFromPence(finalTotalPence)}</span>
                  </div>
                </div>

                {/* Submit / Review CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isDeliveryShortfall}
                  className="w-full mt-6 py-4 px-6 rounded-2xl bg-[#d42b2b] hover:bg-[#b52222] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Validating Order...
                    </>
                  ) : isDeliveryShortfall ? (
                    `Min Delivery Spend: ${formatGBPFromPence(minimumOrderPence)}`
                  ) : (
                    <>
                      <Lock size={16} />
                      Review & Place Order — {formatGBPFromPence(finalTotalPence)}
                    </>
                  )}
                </button>

                <p className="text-[11px] text-stone-400 text-center mt-3">
                  By clicking Place Order, your order payload is verified for transmission.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 10. Order Review & Gateway Payload Modal */}
      {showOrderReviewModal && preparedOrderPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-stone-900">Order Validated</h3>
                  <p className="text-xs text-stone-500">Ready for Server API Dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderReviewModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
                aria-label="Close review"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order Reference:</span>
                  <span className="font-mono font-bold text-[#d42b2b]">{preparedOrderPayload.orderReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Fulfilment:</span>
                  <span className="font-semibold capitalize text-stone-900">{preparedOrderPayload.fulfilmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-medium text-stone-900">{preparedOrderPayload.customer.fullName} ({preparedOrderPayload.customer.phone})</span>
                </div>
                {preparedOrderPayload.delivery && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Delivery Postcode:</span>
                    <span className="font-semibold text-stone-900">{preparedOrderPayload.delivery.postcode}</span>
                  </div>
                )}
                {preparedOrderPayload.collection && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Collection Slot:</span>
                    <span className="font-semibold text-stone-900">{preparedOrderPayload.collection.collectionSlotLabel}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-stone-200/60 font-bold">
                  <span>Total Calculated:</span>
                  <span className="text-[#d42b2b] text-base">{formatGBPFromPence(preparedOrderPayload.pricingSummary.finalTotalPence)}</span>
                </div>
              </div>

              {/* Server Error Banner */}
              {orderSubmitError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs leading-relaxed flex gap-2">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <span>{orderSubmitError}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrderReviewModal(false);
                    setOrderSubmitError(null);
                  }}
                  className="flex-1 py-3 px-4 border border-stone-300 rounded-xl font-semibold text-stone-700 hover:bg-stone-50 transition-colors text-xs"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={async () => {
                    if (isConfirming || !preparedOrderPayload) return;
                    setIsConfirming(true);
                    setOrderSubmitError(null);
                    try {
                      const res = await fetch("/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(preparedOrderPayload),
                      });
                      const json = await res.json();
                      if (!res.ok || !json.success) {
                        setOrderSubmitError(
                          json.error ||
                            "Failed to place order. Please check your details and try again."
                        );
                        setIsConfirming(false);
                        return;
                      }
                      const savedRef = json.data?.orderReference || preparedOrderPayload.orderReference;
                      try {
                        if (typeof window !== "undefined") {
                          window.sessionStorage.setItem("cravebox-latest-order-id", savedRef);
                        }
                      } catch {
                        // sessionStorage error ignored
                      }
                      clearCart();
                      router.push(`/order-confirmation?ref=${encodeURIComponent(savedRef)}`);
                    } catch {
                      setOrderSubmitError("Network error. Please check your connection and try again.");
                      setIsConfirming(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-[#d42b2b] hover:bg-[#b52222] disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors text-xs flex items-center justify-center gap-1.5"
                >
                  {isConfirming ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      <span>Place Order — {preparedOrderPayload ? formatGBPFromPence(preparedOrderPayload.pricingSummary.finalTotalPence) : ""}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
