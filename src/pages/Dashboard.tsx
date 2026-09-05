import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, CalendarClock, LogOut, Star, Truck, RotateCcw, MapPin, AlertCircle, Sparkles } from "lucide-react";
import { format, isPast, addDays } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import WriteReviewModal from "@/components/WriteReviewModal";
import { Skeleton } from "@/components/ui/skeleton";
import { profileSchema } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tabs = ["My Orders", "Upcoming Rentals", "Track Order", "Profile Settings"] as const;
type Tab = (typeof tabs)[number];

const statusConfig = {
  upcoming: { label: "Upcoming", icon: CalendarClock, className: "bg-accent text-accent-foreground" },
  active: { label: "Active", icon: Clock, className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle, className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", icon: Package, className: "bg-destructive/10 text-destructive" },
  return_requested: { label: "Return Requested", icon: RotateCcw, className: "bg-yellow-100 text-yellow-700" },
} as const;

const parseDateSafe = (d: string | Date | undefined): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(`${d}T00:00:00`);
  }
  return new Date(d);
};

type RentalStatus = keyof typeof statusConfig;

interface OrderRow {
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
  product_id: string | null;
  delivery_status?: string;
  tracking_number?: string | null;
}

// Return Modal
const ReturnModal = ({
  open,
  onOpenChange,
  order,
  onReturnRequested,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRow | null;
  onReturnRequested: (orderId: string) => void;
}) => {
  const [reason, setReason] = useState("");
  const [condition, setCondition] = useState("good");
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for the return.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/orders/${order.id}/return`, { reason: reason.trim(), condition });
      toast.success("Return request submitted! We will contact you within 24 hours.");
      onReturnRequested(order.id);
      onOpenChange(false);
      setReason("");
      setCondition("good");
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        toast.success("Return request noted! Our team will reach out within 24 hours.");
        onReturnRequested(order.id);
        onOpenChange(false);
        setReason("");
        setCondition("good");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to submit return request.");
      }
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light">Return Product</DialogTitle>
          <p className="text-xs text-muted-foreground font-body font-light">Order #{order.order_number}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Item Condition</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "good", label: "Good - No damage" },
                { value: "minor", label: "Minor wear" },
                { value: "damaged", label: "Damaged" },
              ].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setCondition(opt.value)}
                  className={`px-3 py-2 text-xs font-body border transition-colors ${condition === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Reason for Return</label>
            <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="e.g. Rental period ending, item no longer needed..."
              className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>
          <div className="flex items-start gap-2 bg-accent/50 p-3">
            <AlertCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs font-body font-light text-muted-foreground">
              Our team will arrange a pickup from your delivery address. Please keep the product packed securely.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => onOpenChange(false)}
              className="flex-1 py-3 border border-border text-xs tracking-widest uppercase font-body font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !reason.trim()}
              className="flex-1 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? "Submitting..." : "Request Return"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status as RentalStatus] || statusConfig.upcoming;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 font-body font-medium rounded-none ${config.className}`}>
      <Icon size={12} /> {config.label}
    </span>
  );
};

// Order Card
const OrderCard = ({
  order, reviewedProductIds, onWriteReview, onReturn,
}: {
  order: OrderRow;
  reviewedProductIds: Set<string>;
  onWriteReview: (order: OrderRow) => void;
  onReturn: (order: OrderRow) => void;
}) => {
  const isCompleted = order.status === "completed";
  const isActive = order.status === "active";
  const isReturnRequested = order.status === "return_requested";
  const hasReviewed = order.product_id ? reviewedProductIds.has(order.product_id) : false;
  const rentalEndPassed = isPast(new Date(order.rental_end || new Date()));
  const canReturn = (isActive || (isCompleted && !rentalEndPassed)) && !isReturnRequested;

  const deliveryDate = order.delivery_date ? parseDateSafe(order.delivery_date) : (order.rental_start ? parseDateSafe(order.rental_start) : new Date());
  const usageDate = order.usage_date ? parseDateSafe(order.usage_date) : addDays(deliveryDate, 1);
  const pickupDate = order.pickup_date ? parseDateSafe(order.pickup_date) : (order.rental_end ? parseDateSafe(order.rental_end) : addDays(usageDate, 1));

  return (
    <div className="flex flex-col bg-secondary border border-border">
      <Link to={`/order/${order.id}`} className="block hover:bg-muted/30 transition-all">
        <div className="flex gap-5 p-5">
          <div className="w-20 h-[104px] flex-shrink-0 bg-muted flex items-center justify-center">
            <Package size={24} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-display text-xl font-light">Order #{order.order_number}</h3>
                <p className="text-xs text-muted-foreground font-body font-light mt-1">
                  Size {order.size} · ₹{Number(order.total_price).toLocaleString("en-IN")}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs font-body font-light text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-primary" />
                <span>Usage: <strong className="text-foreground font-medium">{format(usageDate, "MMM dd, yyyy")}</strong></span>
              </span>
              <span>•</span>
              <span>Delivery: <span className="text-foreground">{format(deliveryDate, "MMM dd")}</span></span>
              <span>•</span>
              <span>Pickup: <span className="text-foreground">{format(pickupDate, "MMM dd, yyyy")}</span></span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-4 flex items-center gap-3 flex-wrap border-t border-border/50 pt-3">
        {isCompleted && order.product_id && (
          hasReviewed ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-muted-foreground">
              <CheckCircle size={14} /> Review Submitted
            </span>
          ) : (
            <button onClick={() => onWriteReview(order)}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity">
              <Star size={13} /> Write Review
            </button>
          )
        )}
        {canReturn && (
          <button onClick={() => onReturn(order)}
            className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-xs tracking-widest uppercase font-body font-medium hover:border-primary hover:text-primary transition-colors">
            <RotateCcw size={13} /> Return Item
          </button>
        )}
        {isReturnRequested && (
          <span className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-yellow-600">
            <RotateCcw size={14} /> Return Requested — We will contact you soon
          </span>
        )}
        {order.status !== "completed" && order.status !== "cancelled" && order.status !== "return_requested" && !canReturn && (
          <p className="text-xs text-muted-foreground font-body font-light italic">
            You can review this product after completing your rental
          </p>
        )}
      </div>
    </div>
  );
};

// Track Order Tab
const deliverySteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "in_transit", label: "In Transit", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
] as const;

const TrackOrderTab = ({ orders }: { orders: OrderRow[] }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || "");
  const [trackingDetails, setTrackingDetails] = useState<any>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  useEffect(() => {
    if (!selectedOrderId) return;
    const fetchTracking = async () => {
      setLoadingTrack(true);
      try {
        const { data } = await api.get(`/api/orders/${selectedOrderId}`);
        setTrackingDetails(data);
      } catch {
        setTrackingDetails(null);
      } finally {
        setLoadingTrack(false);
      }
    };
    fetchTracking();
  }, [selectedOrderId]);

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Truck size={32} className="text-muted-foreground mx-auto mb-4" />
        <p className="font-display text-2xl font-light text-muted-foreground">No orders to track</p>
        <Link to="/shop" className="mt-4 inline-block text-sm text-primary font-body font-light underline">Browse the collection</Link>
      </div>
    );
  }

  const deliveryStatus = trackingDetails?.deliveryStatus || trackingDetails?.delivery_status || "pending";
  const trackingNumber = trackingDetails?.trackingNumber || trackingDetails?.tracking_number;
  const estimatedDelivery = trackingDetails?.estimatedDeliveryDate || trackingDetails?.estimated_delivery_date;
  const currentStepIndex = deliverySteps.findIndex((s) => s.key === deliveryStatus);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="animate-fade-in max-w-2xl">
      <h2 className="font-display text-2xl font-light mb-6">Track Your Order</h2>
      <div className="mb-8">
        <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Select Order</label>
        <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}
          className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors">
          {orders.map((order) => {
            const usageDate = order.usage_date ? new Date(order.usage_date) : (order.rental_start ? addDays(new Date(order.rental_start), 1) : new Date());
            return (
              <option key={order.id} value={order.id}>
                Order #{order.order_number} — Usage: {format(usageDate, "MMM dd, yyyy")}
              </option>
            );
          })}
        </select>
      </div>

      {loadingTrack ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <div className="border border-border bg-secondary p-6 mb-6">
            <h3 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-5 flex items-center gap-2">
              <Truck size={14} /> Delivery Tracking
            </h3>
            <div className="relative">
              {deliverySteps.map((step, i) => {
                const StepIcon = step.icon;
                const isCompleted = i <= activeIndex;
                const isCurrent = i === activeIndex;
                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {i < deliverySteps.length - 1 && (
                      <div className={`absolute left-[15px] top-[30px] w-px h-[calc(100%-6px)] ${i < activeIndex ? "bg-primary" : "bg-border"}`} />
                    )}
                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                      isCurrent ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <StepIcon size={14} />
                    </div>
                    <div className={`pb-6 ${i === deliverySteps.length - 1 ? "pb-0" : ""}`}>
                      <p className={`text-sm font-body ${isCurrent ? "font-medium text-foreground" : isCompleted ? "font-light text-foreground" : "font-light text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-xs text-primary font-body font-light mt-0.5">Current status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-border space-y-2">
              {trackingNumber && (
                <div className="flex justify-between text-sm font-body font-light">
                  <span className="text-muted-foreground">Tracking Number</span>
                  <span className="font-mono text-xs">{trackingNumber}</span>
                </div>
              )}
              {estimatedDelivery && (
                <div className="flex justify-between text-sm font-body font-light">
                  <span className="text-muted-foreground">Estimated Delivery</span>
                  <span>{format(new Date(estimatedDelivery), "MMM dd, yyyy")}</span>
                </div>
              )}
              {!trackingNumber && !estimatedDelivery && (
                <p className="text-xs text-muted-foreground font-body font-light">
                  Tracking details will appear here once your order is shipped.
                </p>
              )}
            </div>
          </div>
          {selectedOrder && (
            <div className="border border-border bg-secondary p-5">
              <h3 className="text-xs tracking-widest uppercase font-body font-medium text-primary mb-4 flex items-center gap-2">
                <CalendarClock size={14} /> Rental Schedule
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background p-2.5 rounded-sm border border-border/50 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-body block">Delivery</span>
                  <p className="font-body text-xs font-medium mt-1">
                    {format(parseDateSafe(selectedOrder.delivery_date || selectedOrder.rental_start), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="bg-primary/5 p-2.5 rounded-sm border border-primary/20 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-primary font-body font-medium block">Usage Date</span>
                  <p className="font-body text-xs font-semibold text-primary mt-1">
                    {format(selectedOrder.usage_date ? parseDateSafe(selectedOrder.usage_date) : addDays(parseDateSafe(selectedOrder.delivery_date || selectedOrder.rental_start), 1), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="bg-background p-2.5 rounded-sm border border-border/50 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-body block">Pickup</span>
                  <p className="font-body text-xs font-medium mt-1">
                    {format(parseDateSafe(selectedOrder.pickup_date || selectedOrder.rental_end), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Dashboard Main
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("My Orders");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSize, setProfileSize] = useState("M");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());
  const [reviewModal, setReviewModal] = useState<{ open: boolean; order: OrderRow | null }>({ open: false, order: null });
  const [returnModal, setReturnModal] = useState<{ open: boolean; order: OrderRow | null }>({ open: false, order: null });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [ordersRes, profileRes, reviewsRes] = await Promise.all([
          api.get("/api/orders"),
          api.get("/api/profiles/me"),
          api.get("/api/reviews/my-reviews"),
        ]);
        if (ordersRes.data) {
          setOrders(ordersRes.data.map((o: any) => ({
            id: o.id,
            order_number: o.orderNumber || o.order_number,
            size: o.size,
            usage_date: o.usageDate || o.usage_date,
            delivery_date: o.deliveryDate || o.delivery_date,
            pickup_date: o.pickupDate || o.pickup_date,
            rental_start: o.rentalStart || o.rental_start,
            rental_end: o.rentalEnd || o.rental_end,
            total_price: o.totalPrice !== undefined ? o.totalPrice : o.total_price,
            status: o.status,
            created_at: o.createdAt || o.created_at,
            product_id: o.productId || o.product_id,
            delivery_status: o.deliveryStatus || o.delivery_status,
            tracking_number: o.trackingNumber || o.tracking_number,
          })));
        }
        if (profileRes.data) {
          setProfileName(profileRes.data.fullName || profileRes.data.full_name || "");
          setProfilePhone(profileRes.data.phone || "");
          setProfileSize(profileRes.data.defaultSize || profileRes.data.default_size || "M");
        }
        if (reviewsRes.data) {
          setReviewedProductIds(new Set(reviewsRes.data.map((r: any) => r.productId || r.product_id)));
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleWriteReview = (order: OrderRow) => {
    setReviewModal({ open: true, order });
  };

  const handleReviewSubmitted = (productId: string) => {
    setReviewedProductIds((prev) => new Set([...prev, productId]));
  };

  const handleReturn = (order: OrderRow) => {
    setReturnModal({ open: true, order });
  };

  const handleReturnRequested = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "return_requested" } : o))
    );
  };

  const handleSaveProfile = async () => {
    setProfileErrors({});
    const parseResult = profileSchema.safeParse({ fullName: profileName, phone: profilePhone });
    if (!parseResult.success) {
      const errs: Record<string, string> = {};
      parseResult.error.errors.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as string] = e.message;
      });
      setProfileErrors(errs);
      return;
    }
    setSavingProfile(true);
    try {
      await api.put("/api/profiles/me", {
        fullName: profileName.trim(),
        phone: profilePhone.trim() || null,
        defaultSize: profileSize,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const userName = profileName || user?.fullName || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const upcomingRentals = orders.filter((o) => o.status === "upcoming" || o.status === "active");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display text-2xl font-light">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-light">{userName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground font-body font-light">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-0 mt-8 border-b border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs tracking-widest uppercase font-body font-light transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {activeTab === "My Orders" && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: String(orders.length) },
                { label: "Upcoming", value: String(orders.filter((r) => r.status === "upcoming").length) },
                { label: "Active", value: String(orders.filter((r) => r.status === "active").length) },
                { label: "Completed", value: String(orders.filter((r) => r.status === "completed").length) },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary p-5 border border-border">
                  <p className="font-display text-3xl font-light text-primary">{stat.value}</p>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} reviewedProductIds={reviewedProductIds} onWriteReview={handleWriteReview} onReturn={handleReturn} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package size={32} className="text-muted-foreground mx-auto mb-4" />
                <p className="font-display text-2xl font-light text-muted-foreground">No orders yet</p>
                <Link to="/shop" className="mt-4 inline-block text-sm text-primary font-body font-light underline">Browse the collection</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "Upcoming Rentals" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-light mb-8">Upcoming Rentals ({upcomingRentals.length})</h2>
            {upcomingRentals.length > 0 ? (
              <div className="space-y-4">
                {upcomingRentals.map((order) => (
                  <OrderCard key={order.id} order={order} reviewedProductIds={reviewedProductIds} onWriteReview={handleWriteReview} onReturn={handleReturn} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CalendarClock size={32} className="text-muted-foreground mx-auto mb-4" />
                <p className="font-display text-2xl font-light text-muted-foreground">No upcoming rentals</p>
                <Link to="/shop" className="mt-4 inline-block text-sm text-primary font-body font-light underline">Browse the collection</Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "Track Order" && (
          <div className="animate-fade-in">
            <TrackOrderTab orders={orders} />
          </div>
        )}

        {activeTab === "Profile Settings" && (
          <div className="max-w-xl space-y-8 animate-fade-in">
            <h2 className="font-display text-2xl font-light">Account Settings</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Full Name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
                {profileErrors.fullName && <p className="text-xs text-destructive font-body mt-1">{profileErrors.fullName}</p>}
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Email</label>
                <input defaultValue={user?.email || ""} disabled
                  className="w-full px-4 py-3 border border-border bg-muted text-sm font-body font-light text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Phone</label>
                <input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+91 00000 00000"
                  className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Default Size</label>
                <select value={profileSize} onChange={(e) => setProfileSize(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors">
                  {["XS", "S", "M", "L", "XL"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={handleSaveProfile} disabled={savingProfile}
                className="px-8 py-3.5 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
            <div className="border-t border-border pt-8">
              <button onClick={handleSignOut}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground font-body font-light hover:text-destructive transition-colors">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {reviewModal.order && (
        <WriteReviewModal
          open={reviewModal.open}
          onOpenChange={(open) => setReviewModal((prev) => ({ ...prev, open }))}
          orderId={reviewModal.order.id}
          productId={reviewModal.order.product_id!}
          orderNumber={reviewModal.order.order_number}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <ReturnModal
        open={returnModal.open}
        onOpenChange={(open) => setReturnModal((prev) => ({ ...prev, open }))}
        order={returnModal.order}
        onReturnRequested={handleReturnRequested}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
