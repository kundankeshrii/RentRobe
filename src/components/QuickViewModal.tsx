import { X, Star, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/data";
import { Link } from "react-router-dom";
import { useState } from "react";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState("");
  const savings = Math.round(((product.retailPrice - product.rentalPrice) / product.retailPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-background max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-accent transition-colors"
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-[3/4] bg-accent">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-1">
              {product.designer}
            </p>
            <h3 className="font-display text-3xl font-light mb-2">{product.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-body font-light">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-3xl text-primary">
                ₹{product.rentalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted-foreground font-body font-light">/ day</span>
            </div>
            <p className="text-xs text-muted-foreground font-body font-light mb-6">
              Retail ₹{product.retailPrice.toLocaleString("en-IN")} · Save {savings}%
            </p>

            {/* Sizes */}
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase font-body font-medium mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] px-3 py-2 text-xs tracking-wider uppercase font-body font-light border transition-colors ${
                      selectedSize === size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-body font-light leading-relaxed mb-6 line-clamp-3">
              {product.description}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                to={`/product/${product.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs tracking-widest uppercase font-body font-medium hover:bg-primary/90 transition-colors"
                onClick={onClose}
              >
                <ShoppingBag size={14} />
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
