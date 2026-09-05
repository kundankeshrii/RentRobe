import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
 import {
  Star,
  Heart,
  Check,
  Package,
  RotateCcw,
  ShoppingBag,
  Shield,
} from "lucide-react";
import SizeGuideModal from "@/components/SizeGuideModal";
import ProductSEO from "@/components/ProductSEO";
import { subDays, addDays, format } from "date-fns";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import { products as mockProducts } from "@/lib/data";
import api from "@/lib/api";
import { useProductAvailability } from "@/hooks/useProductAvailability";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ProductImageGallery from "@/components/ProductImageGallery";
import RentalDatePicker from "@/components/RentalDatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [usageDate, setUsageDate] = useState<Date | undefined>(undefined);
  const [dbProduct, setDbProduct] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unavailableDates, checkUsageConflict } = useProductAvailability(id);

  const isValidUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setDbProduct(data);
      } catch {
        // not found or error
        setDbProduct(null);
      }
      setDbLoading(false);
    };
    fetchProduct();
  }, [id]);

  const mockProduct = mockProducts.find((p) => p.id === id);
  const product = dbProduct || mockProduct;

  if (!dbLoading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl font-light">Product not found</p>
          <Link to="/shop" className="mt-4 inline-block text-primary text-sm font-body font-light underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  if (dbLoading || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-12">
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="space-y-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rentalPrice = dbProduct ? Number(dbProduct.rentalPrice) : product.rentalPrice;
  const retailPrice = dbProduct ? Number(dbProduct.retailPrice) : product.retailPrice;
  const securityDeposit = dbProduct ? Number(dbProduct.securityDeposit || 0) : 0;
  const stockQuantity = dbProduct?.stockQuantity ?? undefined;
  const isAvailable = dbProduct ? dbProduct.available : product.available;
  const productName = product.name;
  const productDesigner = product.designer;
  const productImages = dbProduct ? dbProduct.images : product.images;
  const productSizes = dbProduct ? dbProduct.sizes : product.sizes;
  const productDescription = dbProduct ? dbProduct.description : product.description;
  const productDetails = dbProduct ? dbProduct.details : product.details;
  const productRating = dbProduct ? Number(dbProduct.rating) : product.rating;
  const productReviewCount = dbProduct ? dbProduct.reviewCount : product.reviewCount;
  const productCategory = dbProduct ? dbProduct.category : product.category;
  const productIsNew = dbProduct ? dbProduct.isNew : product.isNew;

  const related = mockProducts.filter((p) => p.id !== id && p.category === productCategory).slice(0, 4);
  const savings = Math.round(((retailPrice - rentalPrice) / retailPrice) * 100);
  const totalPrice = rentalPrice;
  const hasConflict = checkUsageConflict(usageDate);
  const canAddToCart = selectedSize && usageDate && isAvailable && !hasConflict && (stockQuantity === undefined || stockQuantity > 0);
  const wishlisted = isWishlisted(id || "");

  const handleAddToCart = () => {
    if (!usageDate) return;
    const deliveryDate = subDays(usageDate, 1);
    const pickupDate = addDays(usageDate, 1);

    if (!user) {
      const pendingAction = {
        type: "cart",
        payload: {
          productId: id || "",
          name: productName,
          designer: productDesigner,
          image: productImages[0],
          size: selectedSize,
          usageDate: format(usageDate, "yyyy-MM-dd"),
          rentalStart: format(deliveryDate, "yyyy-MM-dd"),
          rentalEnd: format(pickupDate, "yyyy-MM-dd"),
          rentalPrice: rentalPrice,
          securityDeposit: securityDeposit,
        }
      };
      sessionStorage.setItem("rentrobe_pending_action", JSON.stringify(pendingAction));
      sessionStorage.setItem("rentrobe_redirect_url", window.location.pathname);
      toast.error("Please login to add items to your cart");
      navigate("/auth");
      return;
    }
    if (!canAddToCart) return;
    addItem({
      productId: id || "",
      name: productName,
      designer: productDesigner,
      image: productImages[0],
      size: selectedSize,
      usageDate: usageDate,
      rentalStart: deliveryDate,
      rentalEnd: pickupDate,
      rentalPrice: rentalPrice,
      securityDeposit: securityDeposit,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="min-h-screen">
      <ProductSEO
        name={productName}
        designer={productDesigner}
        description={productDescription}
        rentalPrice={rentalPrice}
        retailPrice={retailPrice}
        image={productImages[0] || ""}
        rating={productRating}
        reviewCount={productReviewCount}
        available={isAvailable}
        productId={id || ""}
      />
      <Navbar />

      <div className="pt-20 container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-6 md:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[150px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ProductImageGallery images={productImages} name={productName} isNew={productIsNew} />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:sticky lg:top-24 lg:self-start space-y-5 md:space-y-6"
          >
            <div>
              <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">{productDesigner}</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-3">{productName}</h1>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={`${i < Math.floor(productRating) ? "fill-primary text-primary" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-xs md:text-sm text-muted-foreground font-body font-light">{productRating} ({productReviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl md:text-3xl text-primary">₹{rentalPrice.toLocaleString("en-IN")}</span>
                <span className="text-xs md:text-sm text-muted-foreground font-body font-light">/ day</span>
              </div>
              <p className="text-xs text-muted-foreground font-body font-light mt-1">
                Retail: <span className="line-through">₹{retailPrice.toLocaleString("en-IN")}</span>
                <span className="ml-2 text-accent-foreground font-medium">Save {savings}%</span>
              </p>
              {securityDeposit > 0 && (
                <div className="mt-2 flex items-center gap-2 bg-secondary px-3 py-2">
                  <Shield size={13} className="text-primary flex-shrink-0" />
                  <span className="text-xs font-body font-light text-muted-foreground">
                    Refundable security deposit: <span className="text-foreground font-medium">₹{securityDeposit.toLocaleString("en-IN")}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs tracking-widest uppercase font-body font-medium">Select Size</p>
                <SizeGuideModal />
              </div>
              <Select value={selectedSize} onValueChange={setSelectedSize} disabled={!isAvailable}>
                <SelectTrigger className="w-full h-12 border-border font-body">
                  <SelectValue placeholder="Choose your size" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {productSizes.map((size: string) => (
                    <SelectItem key={size} value={size} className="font-body">{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rental Date Picker */}
            <RentalDatePicker
              usageDate={usageDate}
              onUsageDateChange={setUsageDate}
              totalPrice={totalPrice}
              unavailableDates={unavailableDates}
              stockQuantity={stockQuantity}
              hasConflict={hasConflict}
            />

            {/* CTA */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`flex-1 py-3.5 md:py-4 text-xs tracking-widest uppercase font-body font-medium transition-all flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-600 text-primary-foreground"
                    : canAddToCart
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {addedToCart ? (<><Check size={16} /> Added to Bag</>) : !isAvailable ? ("Currently Rented") : (<><ShoppingBag size={16} /> Add to Cart</>)}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  if (!user) {
                    const pendingAction = {
                      type: "wishlist",
                      payload: {
                        productId: id || "",
                      }
                    };
                    sessionStorage.setItem("rentrobe_pending_action", JSON.stringify(pendingAction));
                    sessionStorage.setItem("rentrobe_redirect_url", window.location.pathname);
                    toast.error("Please login to add items to your wishlist");
                    navigate("/auth");
                    return;
                  }
                  toggleWishlist(id || "");
                }}
                className="w-12 h-12 md:w-14 md:h-14 border border-border flex items-center justify-center hover:border-primary transition-colors"
              >
                <Heart size={18} className={wishlisted ? "fill-primary text-primary" : "text-foreground/60"} />
              </motion.button>
            </div>

            {!canAddToCart && isAvailable && !hasConflict && (
              <p className="text-xs text-muted-foreground font-body font-light">
                {!selectedSize && !usageDate ? "Select a size and event usage date to continue" : !selectedSize ? "Please select a size" : "Please select your event usage date"}
              </p>
            )}

            {/* Perks */}
            <div className="bg-secondary p-4 md:p-5 space-y-3">
              {[
                { icon: Package, text: "Free delivery & returns on all orders" },
                { icon: RotateCcw, text: "Professionally cleaned before every rental" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={15} className="text-primary flex-shrink-0" />
                  <span className="text-xs font-body font-light text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs tracking-widest uppercase font-body font-medium mb-3">About This Piece</h3>
              <p className="text-sm font-body font-light text-muted-foreground leading-relaxed">{productDescription}</p>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-xs tracking-widest uppercase font-body font-medium mb-3">Details</h3>
              <ul className="space-y-2">
                {productDetails.map((detail: string) => (
                  <li key={detail} className="flex items-start gap-2 text-sm font-body font-light text-muted-foreground">
                    <span className="text-primary mt-1.5">—</span>{detail}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={id || ""} productRating={productRating} productReviewCount={productReviewCount} />

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 md:mt-20 border-t border-border pt-12 md:pt-16">
            <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">You Might Also Like</p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-8 md:mb-10">Similar Pieces</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
