import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import api from "@/lib/api";
import { Product } from "@/lib/data";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

const Wishlist = () => {
  const { items } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/api/products", {
          params: { ids: items.join(",") }
        });
        if (data) {
          setProducts(
            data.map((p: any) => ({
              id: p.id,
              name: p.name,
              designer: p.designer,
              category: p.category,
              rentalPrice: p.rentalPrice !== undefined ? Number(p.rentalPrice) : Number(p.rental_price),
              retailPrice: p.retailPrice !== undefined ? Number(p.retailPrice) : Number(p.retail_price),
              sizes: p.sizes,
              colors: p.colors,
              rating: p.rating !== undefined ? Number(p.rating) : 5,
              reviewCount: p.reviewCount !== undefined ? p.reviewCount : p.review_count,
              description: p.description,
              details: p.details,
              images: p.images,
              occasion: p.occasion,
              available: p.available,
              isFeatured: p.isFeatured !== undefined ? p.isFeatured : p.is_featured,
              isNew: p.isNew !== undefined ? p.isNew : p.is_new,
            }))
          );
        }
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Your Collection</p>
          <h1 className="font-display text-5xl md:text-6xl font-light">Wishlist</h1>
          <p className="mt-2 text-sm text-muted-foreground font-body font-light">{items.length} saved pieces</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-accent-foreground" />
            </div>
            <p className="font-display text-3xl font-light text-muted-foreground mb-4">Your wishlist is empty</p>
            <p className="text-sm font-body font-light text-muted-foreground mb-8">Save pieces you love for later</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity"
            >
              Browse Collection
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
