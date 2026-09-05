import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingBag, Plus, Pencil, Trash2, LogOut, Search, Upload, X, ImageIcon, BarChart3, CreditCard, CheckCircle, XCircle, Eye,
} from "lucide-react";
import AdminAnalytics from "@/components/AdminAnalytics";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  designer: string;
  category: string;
  rental_price: number;
  retail_price: number;
  sizes: string[];
  colors: string[];
  description: string;
  details: string[];
  images: string[];
  occasion: string[];
  available: boolean;
  is_featured: boolean;
  is_new: boolean;
  stock_quantity: number;
  security_deposit: number;
}

interface Order {
  id: string;
  user_id: string;
  product_id: string | null;
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
  delivery_status: string;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  security_deposit: number;
  deposit_status: string;
  deposit_deduction_amount: number;
  payment_method: string;
  payment_status: string;
  upi_transaction_id: string | null;
  payment_screenshot_url: string | null;
  payment_verified_at: string | null;
  delivery_name: string;
  delivery_email: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_pin: string;
  products?: { name: string; designer: string; images: string[] } | null;
}

interface UserProfile {
  user_id: string;
  full_name: string;
}

const emptyProduct: Omit<Product, "id"> = {
  name: "", designer: "", category: "", rental_price: 0, retail_price: 0,
  sizes: [], colors: [], description: "", details: [], images: [],
  occasion: [], available: true, is_featured: false, is_new: false,
  stock_quantity: 1, security_deposit: 0,
};

const statusOptions = ["upcoming", "active", "completed", "cancelled"];
const deliveryStatusOptions = ["pending", "processing", "shipped", "in_transit", "delivered"];

const AdminDashboard = () => {
  const [tab, setTab] = useState<"products" | "orders" | "analytics" | "payments">("products");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, { full_name: string; email: string }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Order detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/api/products?size=1000");
      if (data && data.content) {
        setProducts(data.content.map((p: any) => ({
          id: p.id,
          name: p.name,
          designer: p.designer,
          category: p.category,
          rental_price: p.rentalPrice !== undefined ? p.rentalPrice : p.rental_price,
          retail_price: p.retailPrice !== undefined ? p.retailPrice : p.retail_price,
          sizes: p.sizes,
          colors: p.colors,
          description: p.description,
          details: p.details,
          images: p.images,
          occasion: p.occasion,
          available: p.available,
          is_featured: p.isFeatured !== undefined ? p.isFeatured : p.is_featured,
          is_new: p.isNew !== undefined ? p.isNew : p.is_new,
          stock_quantity: p.stockQuantity !== undefined ? p.stockQuantity : p.stock_quantity,
          security_deposit: p.securityDeposit !== undefined ? p.securityDeposit : p.security_deposit,
        })));
      }
    } catch (err: any) {
      toast({ title: "Failed to fetch products", description: err.message, variant: "destructive" });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/api/admin/orders");
      if (data) {
        setOrders(data.map((o: any) => ({
          id: o.id,
          user_id: o.userId || o.user_id,
          product_id: o.productId || o.product_id,
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
          delivery_status: o.deliveryStatus || o.delivery_status,
          tracking_number: o.trackingNumber || o.tracking_number,
          estimated_delivery_date: o.estimatedDeliveryDate || o.estimated_delivery_date,
          security_deposit: o.securityDeposit !== undefined ? o.securityDeposit : o.security_deposit,
          deposit_status: o.depositStatus || o.deposit_status,
          deposit_deduction_amount: o.depositDeductionAmount !== undefined ? o.depositDeductionAmount : o.deposit_deduction_amount,
          payment_method: o.paymentMethod || o.payment_method,
          payment_status: o.paymentStatus || o.payment_status,
          upi_transaction_id: o.upiTransactionId || o.upi_transaction_id,
          payment_screenshot_url: o.paymentScreenshotUrl || o.payment_screenshot_url,
          payment_verified_at: o.paymentVerifiedAt || o.payment_verified_at,
          delivery_name: o.deliveryName || o.delivery_name,
          delivery_email: o.deliveryEmail || o.delivery_email,
          delivery_phone: o.deliveryPhone || o.delivery_phone,
          delivery_address: o.deliveryAddress || o.delivery_address,
          delivery_city: o.deliveryCity || o.delivery_city,
          delivery_pin: o.deliveryPin || o.delivery_pin,
          products: o.productName ? {
            name: o.productName,
            designer: o.productDesigner || "",
            images: o.productImage ? [o.productImage] : [],
          } : null
        })));
      }
    } catch (err: any) {
      toast({ title: "Failed to fetch orders", description: err.message, variant: "destructive" });
    }
  };

  const fetchUserProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    try {
      const { data } = await api.post("/api/admin/users/profiles", userIds);
      const profileMap: Record<string, { full_name: string; email: string }> = {};
      if (data) {
        data.forEach((p: any) => {
          profileMap[p.userId || p.user_id] = { full_name: p.fullName || p.full_name || "Unknown", email: "" };
        });
      }
      setUserProfiles(profileMap);
    } catch (err: any) {
      console.error("Failed to fetch user profiles", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrders()]);
      setLoading(false);
    };
    load();
  }, []);

  // Fetch user profiles when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const uniqueUserIds = [...new Set(orders.map((o) => o.user_id))];
      fetchUserProfiles(uniqueUserIds);
    }
  }, [orders]);

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const { data } = await api.post("/api/products/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (data?.url) {
          newImageUrls.push(data.url);
        }
      } catch (err: any) {
        toast({ title: "Upload failed", description: err.response?.data?.message || err.message, variant: "destructive" });
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageUrls],
    }));
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Product CRUD
  const openAddProduct = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    setSaving(true);
    const payload = {
      name: formData.name,
      designer: formData.designer,
      category: formData.category,
      rentalPrice: formData.rental_price,
      retailPrice: formData.retail_price,
      sizes: formData.sizes,
      colors: formData.colors,
      description: formData.description,
      details: formData.details,
      images: formData.images,
      occasion: formData.occasion,
      available: formData.available,
      isFeatured: formData.is_featured,
      isNew: formData.is_new,
      stockQuantity: formData.stock_quantity,
      securityDeposit: formData.security_deposit,
    };

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, payload);
        toast({ title: "Product updated" });
      } else {
        await api.post("/api/products", payload);
        toast({ title: "Product added" });
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/products/${deleteId}`);
      toast({ title: "Product deleted" });
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/api/admin/orders/${orderId}`, { status });
      toast({ title: `Order status → ${status}` });
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const updateDeliveryInfo = async (orderId: string, updates: { delivery_status?: string; tracking_number?: string; estimated_delivery_date?: string | null; deposit_status?: string; deposit_deduction_amount?: number; security_deposit?: number }) => {
    const camelUpdates: any = {};
    if (updates.delivery_status !== undefined) camelUpdates.deliveryStatus = updates.delivery_status;
    if (updates.tracking_number !== undefined) camelUpdates.trackingNumber = updates.tracking_number;
    if (updates.estimated_delivery_date !== undefined) camelUpdates.estimatedDeliveryDate = updates.estimated_delivery_date;
    if (updates.deposit_status !== undefined) camelUpdates.depositStatus = updates.deposit_status;
    if (updates.deposit_deduction_amount !== undefined) camelUpdates.depositDeductionAmount = updates.deposit_deduction_amount;

    try {
      await api.put(`/api/admin/orders/${orderId}`, camelUpdates);
      toast({ title: "Order info updated" });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, ...updates } : prev);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const handlePaymentVerification = async (orderId: string, action: "verified" | "rejected") => {
    try {
      await api.put(`/api/admin/orders/${orderId}/payment`, { action });
      toast({ title: `Payment ${action}` });
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const pendingPaymentOrders = orders.filter((o) => o.payment_method === "upi_qr" && o.payment_status === "pending_verification");
  const processedPaymentOrders = orders.filter((o) => o.payment_method === "upi_qr" && o.payment_status !== "pending_verification");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.designer.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) => o.order_number.toLowerCase().includes(search.toLowerCase()) || o.status.toLowerCase().includes(search.toLowerCase())
  );

  const updateArrayField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-display text-2xl tracking-widest font-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-secondary">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-light">
              RENT<span className="text-primary">ROBE</span>
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body font-light ml-3">Admin</span>
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground font-body font-light hover:text-destructive transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Products", value: products.length, icon: Package },
            { label: "Orders", value: orders.length, icon: ShoppingBag },
            { label: "Active Orders", value: orders.filter((o) => o.status === "active").length, icon: ShoppingBag },
            { label: "Pending Payments", value: pendingPaymentOrders.length, icon: CreditCard },
            { label: "Revenue", value: `₹${orders.filter(o => o.payment_status === "paid" || o.payment_status === "verified").reduce((s, o) => s + Number(o.total_price), 0).toLocaleString()}`, icon: ShoppingBag },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary p-5 border border-border">
              <p className="font-display text-3xl font-light text-primary">{stat.value}</p>
              <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border mb-6">
          {(["analytics", "products", "orders", "payments"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSearch(""); }}
              className={`px-6 py-3 text-xs tracking-widest uppercase font-body font-light transition-colors border-b-2 -mb-px ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "analytics" ? "Analytics" : t === "products" ? "Products" : t === "payments" ? "Payments" : "Orders"}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {tab === "analytics" && <AdminAnalytics orders={orders} />}

        {/* Search + Add */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full pl-9 pr-4 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {tab === "products" && (
            <button
              onClick={openAddProduct}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>

        {/* Products Table */}
        {tab === "products" && (
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hidden md:table-cell">Category</th>
                   <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Rental</th>
                   <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hidden md:table-cell">Stock</th>
                   <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] && (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover bg-muted" />
                        )}
                        <div>
                          <p className="font-body font-light">{p.name}</p>
                          <p className="text-xs text-muted-foreground font-body font-light">{p.designer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-body font-light hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 font-body font-light">₹{Number(p.rental_price).toLocaleString()}</td>
                    <td className="px-4 py-3 font-body font-light hidden md:table-cell">{p.stock_quantity}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 font-body font-light ${p.available ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        {p.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => openEditProduct(p)} className="p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-2 hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-body font-light">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Table */}
        {tab === "orders" && (
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hidden md:table-cell">Product</th>
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hidden md:table-cell">Schedule / Usage</th>
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                    <td className="px-4 py-3">
                      <p className="font-body font-light">{o.order_number || o.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground font-body font-light">Size: {o.size}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-body font-light">{userProfiles[o.user_id]?.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-body font-light">{o.user_id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="font-body font-light">{o.products?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-body font-light">{o.products?.designer || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-body font-light hidden md:table-cell">
                      <p className="text-foreground font-medium">{o.usage_date || "—"}</p>
                      <p className="text-[11px] text-muted-foreground">Del: {o.delivery_date || o.rental_start} · Pick: {o.pickup_date || o.rental_end}</p>
                    </td>
                    <td className="px-4 py-3 font-body font-light">₹{Number(o.total_price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="text-xs px-2 py-1.5 border border-border bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-body font-light">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Payments Tab */}
        {tab === "payments" && (
          <div className="space-y-8">
            {/* Pending Verification */}
            <div>
              <h3 className="text-xs tracking-widest uppercase font-body font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <CreditCard size={14} /> Pending Verification
                {pendingPaymentOrders.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 font-body">{pendingPaymentOrders.length}</span>
                )}
              </h3>
              {pendingPaymentOrders.length === 0 ? (
                <div className="border border-border p-8 text-center text-muted-foreground font-body font-light">
                  No pending UPI payments to verify
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPaymentOrders.map((o) => (
                    <div key={o.id} className="border border-border bg-secondary p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-body font-medium text-sm">{o.order_number}</p>
                          <p className="text-xs text-muted-foreground font-body font-light">
                            {userProfiles[o.user_id]?.full_name || "Unknown"} · {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-display text-2xl text-primary">₹{Number(o.total_price).toLocaleString()}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Product</p>
                          <p className="font-body font-light">{o.products?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground font-body font-light">{o.products?.designer || ""}</p>
                        </div>
                        <div>
                          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Rental Schedule</p>
                          <p className="font-body font-light font-medium text-foreground">Usage: {o.usage_date || o.rental_start}</p>
                          <p className="text-[11px] text-muted-foreground">Del: {o.delivery_date || o.rental_start} &bull; Pick: {o.pickup_date || o.rental_end}</p>
                        </div>
                        <div>
                          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Delivery</p>
                          <p className="font-body font-light">{o.delivery_name}</p>
                          <p className="text-xs text-muted-foreground font-body font-light">{o.delivery_city} — {o.delivery_pin}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">UPI Transaction ID</p>
                          <p className="font-body font-medium text-sm bg-background border border-border px-3 py-2">{o.upi_transaction_id || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Payment Screenshot</p>
                          {o.payment_screenshot_url ? (
                            <button
                              onClick={() => setScreenshotPreview(o.payment_screenshot_url)}
                              className="inline-flex items-center gap-2 text-sm font-body font-light text-primary hover:underline bg-background border border-border px-3 py-2 w-full"
                            >
                              <Eye size={14} /> View Screenshot
                            </button>
                          ) : (
                            <p className="font-body font-light text-sm text-muted-foreground bg-background border border-border px-3 py-2">No screenshot</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handlePaymentVerification(o.id, "verified")}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle size={14} /> Approve Payment
                        </button>
                        <button
                          onClick={() => handlePaymentVerification(o.id, "rejected")}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-destructive text-destructive text-xs tracking-widest uppercase font-body font-medium hover:bg-destructive/10 transition-colors"
                        >
                          <XCircle size={14} /> Reject Payment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Processed Payments */}
            {processedPaymentOrders.length > 0 && (
              <div>
                <h3 className="text-xs tracking-widest uppercase font-body font-medium text-muted-foreground mb-4">Processed UPI Payments</h3>
                <div className="border border-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary">
                        <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Order</th>
                        <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Customer</th>
                        <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hidden md:table-cell">Transaction ID</th>
                        <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Total</th>
                        <th className="text-left px-4 py-3 text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedPaymentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-3 font-body font-light">{o.order_number}</td>
                          <td className="px-4 py-3 font-body font-light">{userProfiles[o.user_id]?.full_name || "—"}</td>
                          <td className="px-4 py-3 font-body font-light text-muted-foreground hidden md:table-cell">{o.upi_transaction_id || "—"}</td>
                          <td className="px-4 py-3 font-body font-light">₹{Number(o.total_price).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 font-body font-light ${
                              o.payment_status === "verified" ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
                            }`}>
                              {o.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      <Dialog open={!!screenshotPreview} onOpenChange={() => setScreenshotPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Payment Screenshot</DialogTitle>
          </DialogHeader>
          {screenshotPreview && (
            <img src={screenshotPreview} alt="Payment screenshot" className="w-full max-h-[70vh] object-contain border border-border" />
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Order Number</p>
                  <p className="font-body font-light">{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Status</p>
                  <p className="font-body font-light capitalize">{selectedOrder.status}</p>
                </div>
              </div>

              <div>
                <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Customer</p>
                <p className="font-body font-light">{userProfiles[selectedOrder.user_id]?.full_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground font-body font-light">ID: {selectedOrder.user_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Product</p>
                  <p className="font-body font-light">{selectedOrder.products?.name || "—"}</p>
                  <p className="text-xs text-muted-foreground font-body font-light">{selectedOrder.products?.designer || ""}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Size</p>
                  <p className="font-body font-light">{selectedOrder.size}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Rental Schedule</p>
                  <p className="font-body font-light font-medium text-foreground">Usage: {selectedOrder.usage_date || selectedOrder.rental_start}</p>
                  <p className="text-[11px] text-muted-foreground">Del: {selectedOrder.delivery_date || selectedOrder.rental_start} &bull; Pick: {selectedOrder.pickup_date || selectedOrder.rental_end}</p>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Total</p>
                  <p className="font-body font-light text-primary">₹{Number(selectedOrder.total_price).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">Order Date</p>
                <p className="font-body font-light">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              {/* Delivery Address */}
              <div className="border-t border-border pt-4">
                <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Delivery Address</p>
                <div className="bg-secondary border border-border px-4 py-3 space-y-1">
                  <p className="font-body font-medium text-sm">{selectedOrder.delivery_name || "—"}</p>
                  <p className="font-body font-light text-sm text-muted-foreground">{selectedOrder.delivery_phone || "—"}</p>
                  {selectedOrder.delivery_email && (
                    <p className="font-body font-light text-sm text-muted-foreground">{selectedOrder.delivery_email}</p>
                  )}
                  <p className="font-body font-light text-sm">
                    {[selectedOrder.delivery_address, selectedOrder.delivery_city, selectedOrder.delivery_pin]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>

              {/* Delivery Tracking Controls */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Delivery Tracking</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-body font-light text-muted-foreground block mb-1">Delivery Status</label>
                    <select
                      value={selectedOrder.delivery_status || "pending"}
                      onChange={(e) => updateDeliveryInfo(selectedOrder.id, { delivery_status: e.target.value })}
                      className="w-full text-xs px-2 py-2 border border-border bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                    >
                      {deliveryStatusOptions.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-body font-light text-muted-foreground block mb-1">Est. Delivery Date</label>
                    <input
                      type="date"
                      value={selectedOrder.estimated_delivery_date || ""}
                      onChange={(e) => updateDeliveryInfo(selectedOrder.id, { estimated_delivery_date: e.target.value || null })}
                      className="w-full text-xs px-2 py-2 border border-border bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-body font-light text-muted-foreground block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    defaultValue={selectedOrder.tracking_number || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (selectedOrder.tracking_number || "")) {
                        updateDeliveryInfo(selectedOrder.id, { tracking_number: e.target.value });
                      }
                    }}
                    placeholder="e.g. AWB123456789"
                    className="w-full text-xs px-2 py-2 border border-border bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Security Deposit Controls */}
              {Number(selectedOrder.security_deposit) > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground">Security Deposit — ₹{Number(selectedOrder.security_deposit).toLocaleString()}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-body font-light text-muted-foreground block mb-1">Deposit Status</label>
                      <select
                        value={selectedOrder.deposit_status || "held"}
                        onChange={(e) => updateDeliveryInfo(selectedOrder.id, { deposit_status: e.target.value })}
                        className="w-full text-xs px-2 py-2 border border-border bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="held">Held</option>
                        <option value="refunded">Refunded</option>
                        <option value="deducted">Deducted</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-body font-light text-muted-foreground block mb-1">Deduction Amount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        max={Number(selectedOrder.security_deposit)}
                        defaultValue={Number(selectedOrder.deposit_deduction_amount) || 0}
                        onBlur={(e) => {
                          const val = Number(e.target.value) || 0;
                          if (val !== Number(selectedOrder.deposit_deduction_amount || 0)) {
                            updateDeliveryInfo(selectedOrder.id, {
                              deposit_deduction_amount: val,
                              deposit_status: val > 0 ? "deducted" : "held",
                            });
                          }
                        }}
                        className="w-full text-xs px-2 py-2 border border-border bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Form Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-light">
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Name</label>
                <input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Designer</label>
                <input value={formData.designer} onChange={(e) => setFormData((p) => ({ ...p, designer: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Category</label>
                <input value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Rental Price (₹)</label>
                <input type="number" value={formData.rental_price} onChange={(e) => setFormData((p) => ({ ...p, rental_price: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Retail Price (₹)</label>
                <input type="number" value={formData.retail_price} onChange={(e) => setFormData((p) => ({ ...p, retail_price: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Stock Qty</label>
                <input type="number" min={0} value={formData.stock_quantity} onChange={(e) => setFormData((p) => ({ ...p, stock_quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Deposit (₹)</label>
                <input type="number" min={0} value={formData.security_deposit} onChange={(e) => setFormData((p) => ({ ...p, security_deposit: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Sizes (comma-separated)</label>
                <input value={formData.sizes.join(", ")} onChange={(e) => updateArrayField("sizes", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
                  placeholder="XS, S, M, L, XL" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Colors (comma-separated)</label>
                <input value={formData.colors.join(", ")} onChange={(e) => updateArrayField("colors", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
                  placeholder="Red, Blue, Gold" />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Product Images</label>
              
              {/* Uploaded images preview */}
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative group w-20 h-20">
                      <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                {/* File upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border bg-secondary text-sm font-body font-light hover:border-primary transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload Images
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* URL fallback */}
              <div className="mt-3">
                <label className="text-xs font-body font-light text-muted-foreground block mb-1">Or paste image URLs (comma-separated)</label>
                <input
                  value={formData.images.filter(img => !img.includes('product-images')).join(", ")}
                  onChange={(e) => {
                    const storageImages = formData.images.filter(img => img.includes('product-images'));
                    const urlImages = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    setFormData((prev) => ({ ...prev, images: [...storageImages, ...urlImages] }));
                  }}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Occasion (comma-separated)</label>
                <input value={formData.occasion.join(", ")} onChange={(e) => updateArrayField("occasion", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
                  placeholder="Wedding, Festive" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-1">Details (comma-separated)</label>
                <input value={formData.details.join(", ")} onChange={(e) => updateArrayField("details", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
                  placeholder="Pure silk, Dry clean only" />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2 text-sm font-body font-light cursor-pointer">
                <input type="checkbox" checked={formData.available} onChange={(e) => setFormData((p) => ({ ...p, available: e.target.checked }))}
                  className="accent-primary" />
                Available
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-body font-light cursor-pointer">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData((p) => ({ ...p, is_featured: e.target.checked }))}
                  className="accent-primary" />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-body font-light cursor-pointer">
                <input type="checkbox" checked={formData.is_new} onChange={(e) => setFormData((p) => ({ ...p, is_new: e.target.checked }))}
                  className="accent-primary" />
                New
              </label>
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setShowProductModal(false)}
              className="px-5 py-2.5 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={saveProduct} disabled={saving || !formData.name}
              className="px-6 py-2.5 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Saving..." : editingProduct ? "Update" : "Add Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light">Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body font-light">This action cannot be undone.</p>
          <DialogFooter>
            <button onClick={() => setDeleteId(null)}
              className="px-5 py-2.5 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={deleteProduct}
              className="px-6 py-2.5 bg-destructive text-destructive-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity">
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;


