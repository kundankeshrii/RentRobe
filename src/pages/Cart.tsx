import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart, cartItemKey } from "@/hooks/useCart";
import { usePromoCode } from "@/hooks/usePromoCode";

const Cart = () => {
  const { items, removeItem, updateQuantity } = useCart();
  const { promo, loading: promoLoading, applyPromo, clearPromo, calcDiscount } = usePromoCode();
  const [promoInput, setPromoInput] = useState("");

  const getItemPrice = (item: typeof items[0]) => {
    return Math.round(item.rentalPrice) * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const discount = calcDiscount(subtotal);
  const depositTotal = items.reduce((sum, item) => sum + (item.securityDeposit || 0) * item.quantity, 0);
  const total = subtotal - discount + depositTotal;

  const handleApplyPromo = async () => {
    const result = await applyPromo(promoInput);
    if (result.valid) {
      toast.success(`Promo "${result.code}" applied! ${result.discountType === "percentage" ? `${result.value}% off` : `₹${result.value} off`}`);
    } else {
      toast.error(result.error || "Invalid code");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ShoppingBag size={40} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-3xl font-light mb-2">Your bag is empty</h2>
            <p className="text-sm text-muted-foreground font-body font-light mb-8">
              Explore our collection and find your perfect piece
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors group"
            >
              Shop Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 container mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Your Selection</p>
          <h1 className="font-display text-5xl font-light">Shopping Bag</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const key = cartItemKey(item);
              const usageDate = item.usageDate || addDays(item.rentalStart, 1);
              return (
                <div key={key} className="flex gap-5 pb-6 border-b border-border">
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <div className="w-24 h-32 md:w-32 md:h-40 overflow-hidden bg-secondary">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground">{item.designer}</p>
                        <Link to={`/product/${item.productId}`}>
                          <h3 className="font-display text-xl font-light hover:text-primary transition-colors">{item.name}</h3>
                        </Link>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.size, item.rentalStart, item.rentalEnd)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0" aria-label="Remove item">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-xs font-body font-light text-muted-foreground">Size: <span className="text-foreground">{item.size}</span></span>
                    </div>

                    {/* Schedule Badge */}
                    <div className="mt-3 bg-secondary/80 border border-border/50 p-2.5 space-y-1 w-fit rounded-sm">
                      <div className="flex items-center gap-1.5 text-xs font-body font-medium text-primary">
                        <Sparkles size={13} className="flex-shrink-0" />
                        <span>Usage Date: {format(usageDate, "dd MMMM yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-body text-muted-foreground">
                        <span>Delivery: <strong className="text-foreground font-normal">{format(item.rentalStart, "dd MMM yyyy")}</strong></span>
                        <span>•</span>
                        <span>Pickup: <strong className="text-foreground font-normal">{format(item.rentalEnd, "dd MMM yyyy")}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
                      <div className="flex items-center gap-2 border border-border">
                        <button onClick={() => updateQuantity(item.productId, item.size, item.rentalStart, item.rentalEnd, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-body font-light">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.size, item.rentalStart, item.rentalEnd, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-display text-2xl text-primary">₹{getItemPrice(item).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-secondary p-6 sticky top-24">
              <h2 className="font-display text-2xl font-light mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-body font-light">
                  <span className="text-muted-foreground">Rental subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-body font-light text-green-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> Promo discount</span>
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
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-body font-medium">Total</span>
                  <span className="font-display text-3xl text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Promo Code */}
              {promo?.valid ? (
                <div className="flex items-center gap-2 mb-6 bg-green-50 border border-green-200 px-3 py-2.5">
                  <Tag size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-sm font-body font-light text-green-700 flex-1">{promo.code} applied</span>
                  <button onClick={() => { clearPromo(); setPromoInput(""); toast.info("Promo code removed"); }} className="text-green-600 hover:text-green-800">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-0 mb-6">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2.5 text-sm border border-border border-r-0 bg-background font-body font-light focus:outline-none focus:border-primary transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="px-4 py-2.5 border border-border bg-background text-xs tracking-widest uppercase font-body font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50"
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}

              <Link to="/checkout" className="w-full block text-center py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors">
                Proceed to Checkout
              </Link>
              <Link to="/shop" className="mt-3 w-full block text-center py-3 border border-border text-xs tracking-widest uppercase font-body font-light hover:border-primary transition-colors">
                Continue Shopping
              </Link>
              <p className="mt-4 text-xs text-center text-muted-foreground font-body font-light">Free delivery & returns · Secure checkout</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
