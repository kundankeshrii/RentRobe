import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/lib/data";
import { useState } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (id: string) => void;
  onQuickView?: () => void;
}

const PLACEHOLDER_IMG = "/placeholder.svg";

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);

  const savings = Math.round(((product.retailPrice - product.rentalPrice) / product.retailPrice) * 100);

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`}>
        {/* Image */}
        <div
          className="relative overflow-hidden bg-muted aspect-[3/4] mb-4"
          onMouseEnter={() => product.images[1] && setImgIndex(1)}
          onMouseLeave={() => setImgIndex(0)}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={imgError ? PLACEHOLDER_IMG : product.images[imgIndex]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-primary text-primary-foreground text-[10px] px-2.5 py-1 tracking-widest uppercase font-body font-medium">
                New
              </span>
            )}
            {!product.available && (
              <span className="bg-foreground/80 text-background text-[10px] px-2.5 py-1 tracking-widest uppercase font-body font-medium">
                Rented
              </span>
            )}
          </div>

          {/* Savings badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-background/90 backdrop-blur-sm text-foreground text-[10px] px-2.5 py-1 font-body font-light">
              Save {savings}% vs. buying
            </span>
          </div>

          {/* Quick View button */}
          {onQuickView && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView();
                }}
                className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm text-foreground text-[10px] px-3 py-1.5 font-body font-light hover:bg-background transition-colors"
              >
                <Eye size={12} />
                Quick View
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            const pendingAction = {
              type: "wishlist",
              payload: {
                productId: product.id,
              }
            };
            sessionStorage.setItem("rentrobe_pending_action", JSON.stringify(pendingAction));
            sessionStorage.setItem("rentrobe_redirect_url", window.location.pathname);
            toast.error("Please login to add items to your wishlist");
            navigate("/auth");
            return;
          }
          toggleWishlist(product.id);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
      >
        <Heart
          size={14}
          className={`transition-colors ${wishlisted ? "fill-primary text-primary" : "text-foreground/60"}`}
        />
      </motion.button>

      {/* Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-body font-light">{product.designer}</p>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-display text-base md:text-lg font-light text-foreground leading-tight hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={`${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-body font-light">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-lg md:text-xl text-primary">₹{product.rentalPrice.toLocaleString("en-IN")}</span>
          <span className="text-[10px] text-muted-foreground font-body font-light">/ day</span>
          <span className="text-[10px] text-muted-foreground font-body font-light line-through ml-1 hidden sm:inline">₹{product.retailPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
