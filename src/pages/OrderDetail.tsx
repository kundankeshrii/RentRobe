import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, Package, CalendarClock, CreditCard, MapPin, Shield, Tag, Sparkles, Truck, PackageCheck } from "lucide-react";
import { format, addDays } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeliveryTimeline from "@/components/DeliveryTimeline";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  upcoming: { label: "Upcoming", icon: CalendarClock, className: "bg-blue-50 text-blue-700 border-blue-200" },
  active: { label: "Active", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", icon: CheckCircle, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", icon: Package, className: "bg-destructive/10 text-destructive" },
} as const;

type RentalStatus = keyof typeof statusConfig;

interface OrderWithProduct {
  id: string;
  order_number: string;
  size: string;
  usage_date?: string;
  delivery_date?: string;
  pickup_date?: string;
  rental_start: string;
  rental_end: string;
  total_price: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_status: string;
  delivery_name: string;
  delivery_email: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_pin: string;
  delivery_status?: string;
  tracking_number?: string | null;
  estimated_delivery_date?: string | null;
  security_deposit?: number;
  deposit_status?: string;
  deposit_deduction_amount?: number;
  promo_code?: string | null;
  promo_discount?: number;
  products?: {
    name: string;
    designer: string;
    images: string[];
    retail_price: number;
    rental_price: number;
  } | null;
}

const parseDateSafe = (d: string | Date | undefined): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(`${d}T00:00:00`);
  }
  return new Date(d);
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        if (data) {
          const mapped: OrderWithProduct = {
            id: data.id,
            order_number: data.orderNumber || data.order_number,
            size: data.size,
            usage_date: data.usageDate || data.usage_date,
            delivery_date: data.deliveryDate || data.delivery_date,
            pickup_date: data.pickupDate || data.pickup_date,
            rental_start: data.rentalStart || data.rental_start,
            rental_end: data.rentalEnd || data.rental_end,
            total_price: data.totalPrice !== undefined ? data.totalPrice : data.total_price,
            status: data.status,
            created_at: data.createdAt || data.created_at,
            payment_method: data.paymentMethod || data.payment_method,
            payment_status: data.paymentStatus || data.payment_status,
            delivery_name: data.deliveryName || data.delivery_name,
            delivery_email: data.deliveryEmail || data.delivery_email,
            delivery_phone: data.deliveryPhone || data.delivery_phone,
            delivery_address: data.deliveryAddress || data.delivery_address,
            delivery_city: data.deliveryCity || data.delivery_city,
            delivery_pin: data.deliveryPin || data.delivery_pin,
            delivery_status: data.deliveryStatus || data.delivery_status,
            tracking_number: data.trackingNumber || data.tracking_number,
            estimated_delivery_date: data.estimatedDeliveryDate || data.estimated_delivery_date,
            security_deposit: data.securityDeposit !== undefined ? data.securityDeposit : data.security_deposit,
            deposit_status: data.depositStatus || data.deposit_status,
            deposit_deduction_amount: data.depositDeductionAmount !== undefined ? data.depositDeductionAmount : data.deposit_deduction_amount,
            promo_code: data.promoCode || data.promo_code,
            promo_discount: data.promoDiscount !== undefined ? data.promoDiscount : data.promo_discount,
            products: data.productName ? {
              name: data.productName,
              designer: data.productDesigner || "",
              images: data.productImage ? [data.productImage] : [],
              retail_price: data.productRetailPrice || 0,
              rental_price: data.productRentalPrice || 0,
            } : null,
          };
          setOrder(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-12 max-w-2xl">
          <Skeleton className="h-6 w-32 mb-8" />
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-16 text-center">
          <p className="font-display text-2xl font-light mb-4">Order Not Found</p>
          <Link to="/dashboard" className="text-primary text-xs tracking-widest uppercase font-body hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status as RentalStatus] || statusConfig.upcoming;
  const StatusIcon = config.icon;
  const subtotal = order.total_price - (Number(order.security_deposit) || 0) + (Number(order.promo_discount) || 0);
  const productImage = order.products?.images?.[0];

  const deliveryDateVal = order.delivery_date ? parseDateSafe(order.delivery_date) : (order.rental_start ? parseDateSafe(order.rental_start) : new Date());
  const usageDateVal = order.usage_date ? parseDateSafe(order.usage_date) : addDays(deliveryDateVal, 1);
  const pickupDateVal = order.pickup_date ? parseDateSafe(order.pickup_date) : (order.rental_end ? parseDateSafe(order.rental_end) : addDays(usageDateVal, 1));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 container mx-auto px-4 py-12 max-w-2xl">
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-body font-light text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Order Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-border mb-6">
          <div>
            <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Order Details</p>
            <h1 className="font-display text-3xl font-light mt-1">#{order.order_number}</h1>
            <p className="text-xs text-muted-foreground font-body font-light mt-1">
              Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 font-body font-medium rounded-none ${config.className}`}>
            <StatusIcon size={12} /> {config.label}
          </span>
        </div>

        {/* Product */}
        <div className="border border-border bg-secondary p-5 mb-6">
          <h2 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-4">Product</h2>
          <div className="flex gap-5">
            {productImage ? (
              <img src={productImage} alt={order.products?.name} className="w-24 h-32 object-cover flex-shrink-0 bg-muted" />
            ) : (
              <div className="w-24 h-32 flex-shrink-0 bg-muted flex items-center justify-center">
                <Package size={24} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl font-light">{order.products?.name || "Product"}</p>
              <p className="text-xs text-muted-foreground font-body font-light mt-1">
                {order.products?.designer || "Designer"}
              </p>
              <p className="text-sm font-body font-light mt-2">Size: {order.size}</p>
              {order.products && (
                <p className="text-xs text-muted-foreground font-body font-light mt-1">
                  Retail ₹{Number(order.products.retail_price).toLocaleString("en-IN")} · Rental ₹{Number(order.products.rental_price).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rental Schedule */}
        <div className="border border-border bg-secondary p-5 mb-6">
          <h2 className="text-xs tracking-widest uppercase font-body font-medium text-primary mb-4 flex items-center gap-2">
            <CalendarClock size={14} /> Rental Schedule
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-background/80 p-3 rounded-sm border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Truck size={12} />
                <span className="text-[10px] uppercase tracking-wider font-body font-light">Delivery</span>
              </div>
              <p className="font-body text-xs md:text-sm font-medium">{format(deliveryDateVal, "MMM dd, yyyy")}</p>
            </div>
            <div className="bg-primary/5 p-3 rounded-sm border border-primary/20 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Sparkles size={12} />
                <span className="text-[10px] uppercase tracking-wider font-body font-medium">Usage Date</span>
              </div>
              <p className="font-body text-xs md:text-sm font-semibold text-primary">{format(usageDateVal, "MMM dd, yyyy")}</p>
            </div>
            <div className="bg-background/80 p-3 rounded-sm border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <PackageCheck size={12} />
                <span className="text-[10px] uppercase tracking-wider font-body font-light">Pickup</span>
              </div>
              <p className="font-body text-xs md:text-sm font-medium">{format(pickupDateVal, "MMM dd, yyyy")}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className="border border-border bg-secondary p-5 mb-6">
            <h2 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-4 flex items-center gap-2">
              <MapPin size={14} /> Delivery Address
            </h2>
            <p className="font-body text-sm font-light">{order.delivery_name}</p>
            <p className="font-body text-sm font-light text-muted-foreground mt-1">{order.delivery_address}</p>
            <p className="font-body text-sm font-light text-muted-foreground">{order.delivery_city} — {order.delivery_pin}</p>
            <p className="font-body text-sm font-light text-muted-foreground mt-1">{order.delivery_phone} · {order.delivery_email}</p>
          </div>
        )}

        {/* Delivery Tracking */}
        <DeliveryTimeline
          deliveryStatus={order.delivery_status}
          trackingNumber={order.tracking_number}
          estimatedDeliveryDate={order.estimated_delivery_date}
        />

        {/* Payment Summary */}
        <div className="border border-border bg-secondary p-5 mb-6">
          <h2 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-4 flex items-center gap-2">
            <CreditCard size={14} /> Payment Summary
          </h2>
          <div className="space-y-2 text-sm font-body font-light">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rental fee</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {order.promo_discount && order.promo_discount > 0 ? (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1"><Tag size={12} /> Promo ({order.promo_code})</span>
                <span>−₹{Number(order.promo_discount).toLocaleString("en-IN")}</span>
              </div>
            ) : null}
            {Number(order.security_deposit) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security deposit (refundable)</span>
                <span>₹{Number(order.security_deposit).toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-medium text-base">
              <span>Total Paid</span>
              <span className="text-primary font-display text-xl">₹{Number(order.total_price).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-body font-light">
            <span className="capitalize">Payment: {order.payment_method || "Stripe"}</span>
            <span>·</span>
            <span className="capitalize">Status: {order.payment_status}</span>
          </div>
        </div>

        {/* Security Deposit Status */}
        {Number(order.security_deposit) > 0 && (
          <div className="border border-border bg-secondary p-5 mb-6">
            <h2 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-4 flex items-center gap-2">
              <Shield size={14} /> Security Deposit
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-body font-light text-muted-foreground">Deposit Amount</span>
                <span className="text-sm font-body font-medium">₹{Number(order.security_deposit).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-body font-light text-muted-foreground">Status</span>
                <span className={`text-xs px-3 py-1 font-body font-medium ${
                  order.deposit_status === "refunded" ? "bg-green-100 text-green-700" :
                  order.deposit_status === "deducted" ? "bg-destructive/10 text-destructive" :
                  "bg-accent text-accent-foreground"
                }`}>
                  {order.deposit_status === "held" ? "Held" : order.deposit_status === "refunded" ? "Refunded" : "Partially Deducted"}
                </span>
              </div>
              {Number(order.deposit_deduction_amount) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-body font-light text-muted-foreground">Deduction for damage</span>
                  <span className="text-sm font-body font-medium text-destructive">₹{Number(order.deposit_deduction_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
              {order.deposit_status === "held" && order.status !== "completed" && (
                <p className="text-xs font-body font-light text-muted-foreground mt-2">
                  Your deposit will be refunded within 5–7 business days after the outfit is collected and inspected.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetail;
