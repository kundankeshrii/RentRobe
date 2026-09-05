import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ChevronRight, Check, Lock, ShoppingBag, Upload, QrCode, Smartphone, Clock, Shield } from "lucide-react";
import upiQrImage from "@/assets/upi-qr.jpeg";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, CartItem } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { usePromoCode } from "@/hooks/usePromoCode";
import { deliverySchema, DeliveryData } from "@/lib/validations";
import TrustBadges from "@/components/TrustBadges";
import { Checkbox } from "@/components/ui/checkbox";

const steps = ["Delivery", "Review", "Pay"];

const getItemPrice = (item: CartItem) => {
  return Math.round(item.rentalPrice) * item.quantity;
};

const inputClass =
  "w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors";
const labelClass =
  "text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2";
const errorClass = "text-xs text-destructive font-body mt-1";

const Checkout = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "upi">("stripe");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [upiScreenshot, setUpiScreenshot] = useState<File | null>(null);
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [delivery, setDelivery] = useState<DeliveryData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { promo, calcDiscount } = usePromoCode();

  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => s + getItemPrice(i), 0);
  const discount = calcDiscount(subtotal);
  const depositTotal = items.reduce((s, i) => s + (i.securityDeposit || 0) * i.quantity, 0);
  const total = subtotal - discount + depositTotal;

  // Session expiry guard: redirect to login if session is lost
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // UPI Payment Timer (15 minutes)
  const TIMER_DURATION = 15 * 60; // seconds
  const [timerSeconds, setTimerSeconds] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  // Start timer when UPI is selected on payment step
  useEffect(() => {
    if (step === 2 && paymentMethod === "upi") {
      setTimerSeconds(TIMER_DURATION);
      setTimerActive(true);
      setTimerExpired(false);
    } else {
      setTimerActive(false);
    }
  }, [step, paymentMethod]);

  // Countdown effect
  useEffect(() => {
    if (!timerActive || timerExpired) return;
    if (timerSeconds <= 0) {
      setTimerExpired(true);
      setTimerActive(false);
      handleTimerExpiry();
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerExpired]);

  const handleTimerExpiry = useCallback(async () => {
    toast.error("Payment time expired. Your reservation has been released.");
    // Clean expired cart reservations
    try {
      await api.post("/api/cart/clean-expired");
    } catch (e) {
      console.error("Failed to clean cart items:", e);
    }
    clearCart();
    navigate("/cart");
  }, [clearCart, navigate]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const validateDelivery = (): boolean => {
    try {
      deliverySchema.parse(delivery);
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      if (!validateDelivery()) return;
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  const handlePay = async () => {
    if (!user) {
      toast.error("Please log in to place an order");
      return;
    }
    setIsSubmitting(true);
    try {
      // Validate availability before proceeding to payment
      const availabilityPayload = items.map((item) => ({
        product_id: item.productId,
        size: item.size,
        usage_date: format(item.usageDate || addDays(item.rentalStart, 1), "yyyy-MM-dd"),
        rental_start: format(item.rentalStart, "yyyy-MM-dd"),
        rental_end: format(item.rentalEnd, "yyyy-MM-dd"),
      }));

      const { data: conflicts } = await api.post("/api/checkout/validate", availabilityPayload);

      if (conflicts && Array.isArray(conflicts) && conflicts.length > 0) {
        const conflictNames = conflicts
          .map((c: any) => items.find((i) => i.productId === c.product_id || i.productId === c.productId)?.name || "Unknown")
          .join(", ");
        toast.error(`These items are no longer available for your selected dates: ${conflictNames}. Please update your cart.`);
        setIsSubmitting(false);
        return;
      }

      // Clean expired cart reservations
      await api.post("/api/cart/clean-expired");

      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          designer: item.designer,
          image: item.image,
          size: item.size,
          usageDate: format(item.usageDate || addDays(item.rentalStart, 1), "yyyy-MM-dd"),
          rentalStart: format(item.rentalStart, "yyyy-MM-dd"),
          rentalEnd: format(item.rentalEnd, "yyyy-MM-dd"),
          price: getItemPrice(item) / item.quantity,
          quantity: item.quantity,
          days: 1,
          securityDeposit: item.securityDeposit || 0,
        })),
        delivery,
        promoCode: promo?.valid ? promo.code : null,
        promoDiscount: discount,
        depositTotal,
        origin: window.location.origin,
      };

      const { data } = await api.post("/api/checkout/stripe", payload);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ShoppingBag size={40} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-3xl font-light mb-2">Nothing to checkout</h2>
            <p className="text-sm text-muted-foreground font-body font-light mb-8">Add items to your bag first</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 container mx-auto px-4 py-12 max-w-5xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          ← Back to Bag
        </Link>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center text-xs font-body font-medium transition-colors ${
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                      ? "border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-xs tracking-widest uppercase font-body font-light hidden md:block ${
                    i === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="mx-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            {step === 0 && (
              <form onSubmit={handleNext}>
                <div className="space-y-6 animate-fade-in">
                  <h2 className="font-display text-3xl font-light">Delivery Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        required
                        value={delivery.firstName}
                        onChange={(e) => setDelivery({ ...delivery, firstName: e.target.value })}
                        className={inputClass}
                        placeholder="Sophie"
                      />
                      {fieldErrors.firstName && <p className={errorClass}>{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        required
                        value={delivery.lastName}
                        onChange={(e) => setDelivery({ ...delivery, lastName: e.target.value })}
                        className={inputClass}
                        placeholder="Laurent"
                      />
                      {fieldErrors.lastName && <p className={errorClass}>{fieldErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      required
                      value={delivery.email}
                      onChange={(e) => setDelivery({ ...delivery, email: e.target.value })}
                      className={inputClass}
                      placeholder="your@email.com"
                    />
                    {fieldErrors.email && <p className={errorClass}>{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      required
                      value={delivery.phone}
                      onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                      className={inputClass}
                      placeholder="+91 98765 43210"
                    />
                    {fieldErrors.phone && <p className={errorClass}>{fieldErrors.phone}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input
                      required
                      value={delivery.address}
                      onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                      className={inputClass}
                      placeholder="123 Main Street"
                    />
                    {fieldErrors.address && <p className={errorClass}>{fieldErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        required
                        value={delivery.city}
                        onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                        className={inputClass}
                        placeholder="Mumbai"
                      />
                      {fieldErrors.city && <p className={errorClass}>{fieldErrors.city}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>PIN Code</label>
                      <input
                        required
                        value={delivery.pin}
                        onChange={(e) => setDelivery({ ...delivery, pin: e.target.value })}
                        className={inputClass}
                        placeholder="400001"
                      />
                      {fieldErrors.pin && <p className={errorClass}>{fieldErrors.pin}</p>}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-8 w-full py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors"
                >
                  Continue
                </button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={handleNext}>
                <div className="space-y-6 animate-fade-in">
                  <h2 className="font-display text-3xl font-light">Review Order</h2>

                  <div className="bg-secondary p-6 space-y-4">
                    <h3 className="text-xs tracking-widest uppercase font-body font-medium">Delivery To</h3>
                    <div className="text-sm font-body font-light text-muted-foreground space-y-1">
                      <p className="text-foreground font-medium">
                        {delivery.firstName} {delivery.lastName}
                      </p>
                      <p>{delivery.address}</p>
                      <p>
                        {delivery.city} — {delivery.pin}
                      </p>
                      <p>
                        {delivery.phone} · {delivery.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-xs text-primary underline font-body"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="bg-secondary p-6 space-y-4">
                    <h3 className="text-xs tracking-widest uppercase font-body font-medium">Items</h3>
                    {items.map((item) => {
                      const usageDate = item.usageDate || addDays(item.rentalStart, 1);
                      return (
                        <div key={item.productId + item.size} className="flex gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-20 object-cover bg-secondary" />
                          <div>
                            <p className="text-xs text-muted-foreground font-body font-light">{item.designer}</p>
                            <p className="text-sm font-body font-light">{item.name}</p>
                            <p className="text-xs font-body font-medium text-primary mt-0.5">
                              Usage Date: {format(usageDate, "dd MMM yyyy")}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-body font-light">
                              Delivery: {format(item.rentalStart, "dd MMM")} · Pickup: {format(item.rentalEnd, "dd MMM")}
                            </p>
                            <p className="text-primary font-display mt-1">
                              ₹{getItemPrice(item).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-secondary p-4 flex items-center gap-2">
                    <Lock size={14} className="text-primary" />
                    <span className="text-xs font-body font-light text-muted-foreground">
                      You'll be redirected to Stripe for secure payment
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-body font-light">
                    By placing your order, you agree to our{" "}
                    <a href="#" className="text-primary underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary underline">
                      Rental Agreement
                    </a>
                    .
                  </p>
                </div>
                <button
                  type="submit"
                  className="mt-8 w-full py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="font-display text-3xl font-light">Payment</h2>
                <TrustBadges />

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Choose Payment Method</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      className={`p-4 border text-left transition-all ${
                        paymentMethod === "stripe"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Lock size={18} className={paymentMethod === "stripe" ? "text-primary" : "text-muted-foreground"} />
                        <div>
                          <p className="text-sm font-body font-medium">Card / Online</p>
                          <p className="text-xs text-muted-foreground font-body font-light">Credit, Debit, UPI via Stripe</p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-4 border text-left transition-all ${
                        paymentMethod === "upi"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <QrCode size={18} className={paymentMethod === "upi" ? "text-primary" : "text-muted-foreground"} />
                        <div>
                          <p className="text-sm font-body font-medium">UPI QR Payment</p>
                          <p className="text-xs text-muted-foreground font-body font-light">Scan & pay via any UPI app</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Stripe Payment */}
                {paymentMethod === "stripe" && (
                  <div className="space-y-4">
                    <div className="bg-secondary p-6 space-y-4">
                      <Lock size={18} className="text-primary" />
                      <p className="text-sm font-body font-light">
                        Click below to proceed to Stripe's secure checkout. You can pay with credit/debit card, UPI, or other
                        supported methods.
                      </p>
                    </div>
                    <button
                      onClick={handlePay}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Redirecting to Stripe..." : `Pay ₹${total.toLocaleString("en-IN")}`}
                    </button>
                  </div>
                )}

                {/* UPI QR Payment */}
                {paymentMethod === "upi" && (
                  <div className="space-y-6">
                    {/* Timer */}
                    <div className={`p-4 flex items-center gap-3 border ${
                      timerSeconds <= 120
                        ? "border-destructive bg-destructive/10"
                        : "border-primary bg-primary/5"
                    }`}>
                      <Clock size={20} className={timerSeconds <= 120 ? "text-destructive" : "text-primary"} />
                      <div className="flex-1">
                        <p className="text-sm font-body font-medium">
                          You have <span className="font-display text-lg">{formatTimer(timerSeconds)}</span> to complete the payment
                        </p>
                        <p className="text-xs text-muted-foreground font-body font-light">
                          Reservation will be released after timer expires
                        </p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-secondary p-6 flex flex-col items-center">
                      <p className="text-xs tracking-widest uppercase font-body font-medium mb-4">Scan to Pay</p>
                      <div className="bg-background p-3 border border-border inline-block mb-3">
                        <img src={upiQrImage} alt="UPI QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                      </div>
                      <p className="font-display text-2xl text-primary mt-2">₹{total.toLocaleString("en-IN")}</p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-secondary p-5 space-y-4">
                      <p className="text-xs tracking-widest uppercase font-body font-medium">How to Pay</p>
                      {[
                        { step: 1, text: "Scan the QR code using any UPI app" },
                        { step: 2, text: `Complete payment for ₹${total.toLocaleString("en-IN")}` },
                        { step: 3, text: "Enter your UPI Transaction ID below" },
                        { step: 4, text: "Upload the payment screenshot" },
                      ].map((s) => (
                        <div key={s.step} className="flex items-start gap-3">
                          <span className="w-6 h-6 flex-shrink-0 bg-primary text-primary-foreground text-xs flex items-center justify-center font-body font-medium">
                            {s.step}
                          </span>
                          <p className="text-sm font-body font-light text-muted-foreground pt-0.5">{s.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Supported Apps */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Smartphone size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-body font-light">Supported:</span>
                      {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                        <span key={app} className="text-xs bg-secondary px-2.5 py-1 font-body font-light text-foreground">
                          {app}
                        </span>
                      ))}
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-5">
                      <div>
                        <label className={labelClass}>UPI Transaction ID *</label>
                        <input
                          required
                          value={upiTransactionId}
                          onChange={(e) => setUpiTransactionId(e.target.value)}
                          placeholder="e.g. 412345678901"
                          maxLength={50}
                          className={inputClass}
                        />
                        {!upiTransactionId.trim() && upiSubmitting && (
                          <p className={errorClass}>Transaction ID is required</p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>Payment Screenshot * (PNG/JPEG, max 2MB)</label>
                        <input
                          ref={screenshotInputRef}
                          type="file"
                          accept="image/png,image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) { setUpiScreenshot(null); return; }
                            const allowed = ["image/png", "image/jpeg"];
                            if (!allowed.includes(file.type)) {
                              toast.error("Only PNG and JPEG images are allowed.");
                              e.target.value = "";
                              return;
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("File size must be under 2MB.");
                              e.target.value = "";
                              return;
                            }
                            setUpiScreenshot(file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => screenshotInputRef.current?.click()}
                          className={`w-full py-4 border border-dashed transition-colors flex items-center justify-center gap-2 text-sm font-body font-light ${
                            upiScreenshot
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          }`}
                        >
                          <Upload size={16} />
                          {upiScreenshot ? upiScreenshot.name : "Upload Screenshot"}
                        </button>
                        {upiScreenshot && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(upiScreenshot)}
                              alt="Payment screenshot preview"
                              className="max-h-40 object-contain border border-border"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      onClick={async () => {
                        if (!user) { toast.error("Please log in"); return; }
                        if (!upiTransactionId.trim()) { toast.error("Enter your UPI Transaction ID"); return; }
                        if (!upiScreenshot) { toast.error("Upload your payment screenshot"); return; }
                        // Re-validate file before upload
                        const allowedTypes = ["image/png", "image/jpeg"];
                        if (!allowedTypes.includes(upiScreenshot.type)) { toast.error("Only PNG/JPEG allowed"); return; }
                        if (upiScreenshot.size > 2 * 1024 * 1024) { toast.error("File too large (max 2MB)"); return; }
                        setUpiSubmitting(true);
                        try {
                          // Upload screenshot using REST API
                          const formData = new FormData();
                          formData.append("file", upiScreenshot);
                          const uploadRes = await api.post("/api/upload/payment-screenshot", formData, {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          });
                          const screenshotUrl = uploadRes.data.url;

                          // Create order with UPI payment method
                          const payload = {
                            items: items.map((item) => ({
                              productId: item.productId,
                              name: item.name,
                              designer: item.designer,
                              image: item.image,
                              size: item.size,
                              usageDate: format(item.usageDate || addDays(item.rentalStart, 1), "yyyy-MM-dd"),
                              rentalStart: format(item.rentalStart, "yyyy-MM-dd"),
                              rentalEnd: format(item.rentalEnd, "yyyy-MM-dd"),
                              price: getItemPrice(item) / item.quantity,
                              quantity: item.quantity,
                              days: 1,
                              securityDeposit: item.securityDeposit || 0,
                            })),
                            delivery,
                            upiTransactionId: upiTransactionId.trim(),
                            screenshotUrl: screenshotUrl,
                            promoCode: promo?.valid ? promo.code : null,
                            promoDiscount: discount,
                            depositTotal,
                          };

                          const { data: orderData } = await api.post("/api/orders/upi", payload);

                          const orderNum = orderData?.[0]?.orderNumber || orderData?.[0]?.order_number || `RR-${Date.now()}`;

                          clearCart();
                          toast.success("Payment submitted for verification!");
                          navigate(`/order-success?order=${encodeURIComponent(orderNum)}&method=upi`);
                        } catch (err: any) {
                          console.error(err);
                          toast.error(err.message || "Failed to submit payment");
                        } finally {
                          setUpiSubmitting(false);
                        }
                      }}
                      disabled={upiSubmitting || timerExpired}
                      className="w-full py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {timerExpired ? "Time Expired — Reservation Released" : upiSubmitting ? "Submitting..." : "Submit Payment for Verification"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-secondary p-6 sticky top-24">
              <h3 className="font-display text-2xl font-light mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const usageDate = item.usageDate || addDays(item.rentalStart, 1);
                  return (
                    <div key={item.productId + item.size} className="flex gap-3">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 object-cover bg-secondary"
                          style={{ height: "72px" }}
                        />
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-body">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-body font-light text-muted-foreground">{item.designer}</p>
                        <p className="text-sm font-body font-light leading-tight">{item.name}</p>
                        <p className="text-xs font-body font-medium text-primary mt-0.5">
                          Usage: {format(usageDate, "dd MMM yyyy")}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-body font-light">
                          Delivery: {format(item.rentalStart, "dd MMM")} · Pickup: {format(item.rentalEnd, "dd MMM")}
                        </p>
                      </div>
                      <span className="font-display text-lg text-primary">
                        ₹{getItemPrice(item).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm font-body font-light">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-body font-light text-green-600">
                    <span>Promo discount</span>
                    <span>−₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-body font-light">
                  <span className="text-muted-foreground">Delivery & Pickup</span>
                  <span className="text-primary">Free</span>
                </div>
                {depositTotal > 0 && (
                  <div className="flex justify-between text-sm font-body font-light">
                    <span className="text-muted-foreground">Security deposit (refundable)</span>
                    <span>₹{depositTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-body font-medium">Total</span>
                <span className="font-display text-3xl text-primary">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
