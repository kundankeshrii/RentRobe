import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import QuickViewModal from "@/components/QuickViewModal";
import { categories, occasions, Product } from "@/lib/data";
import api from "@/lib/api";

const PRICE_RANGES = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹3,000", min: 0, max: 3000 },
  { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
  { label: "₹5,000 – ₹8,000", min: 5000, max: 8000 },
  { label: "₹8,000+", min: 8000, max: Infinity },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "Free Size"];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PRODUCTS_PER_PAGE = 20;

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") || "All");
  const [selectedOccasion, setSelectedOccasion] = useState(() => searchParams.get("occasion") || "All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Sync URL params when they change (e.g. navigating from homepage links)
  useEffect(() => {
    const cat = searchParams.get("category");
    const occ = searchParams.get("occasion");
    if (cat) setSelectedCategory(cat);
    if (occ) setSelectedOccasion(occ);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/api/products");
        const list = data.content || data || [];
        const mapped: Product[] = list.map((p: any) => ({
          id: p.id,
          name: p.name,
          designer: p.designer,
          category: p.category,
          rentalPrice: Number(p.rentalPrice),
          retailPrice: Number(p.retailPrice),
          sizes: p.sizes,
          colors: p.colors,
          rating: Number(p.rating),
          reviewCount: p.reviewCount,
          description: p.description,
          details: p.details,
          images: p.images,
          occasion: p.occasion,
          available: p.available,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
        }));
        setProducts(mapped);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.designer.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedCategory !== "All") result = result.filter((p) => p.category === selectedCategory);
    if (selectedOccasion !== "All") result = result.filter((p) => p.occasion.includes(selectedOccasion));
    const range = PRICE_RANGES[selectedPriceRange];
    if (range && selectedPriceRange > 0) result = result.filter((p) => p.rentalPrice >= range.min && p.rentalPrice < range.max);
    if (selectedSizes.length > 0) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.rentalPrice - b.rentalPrice);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.rentalPrice - a.rentalPrice);
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, search, selectedCategory, selectedOccasion, selectedPriceRange, selectedSizes, sortBy]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PRODUCTS_PER_PAGE); }, [search, selectedCategory, selectedOccasion, selectedPriceRange, selectedSizes, sortBy]);

  const visibleProducts = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedOccasion !== "All" ? 1 : 0) + (selectedPriceRange > 0 ? 1 : 0) + (selectedSizes.length > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedOccasion("All");
    setSelectedPriceRange(0);
    setSelectedSizes([]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="pt-20 md:pt-24 pb-6 md:pb-8 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Explore</p>
          <h1 className="font-display text-4xl md:text-6xl font-light">The Collection</h1>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground font-body font-light">{filtered.length} pieces available</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designers, styles..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 md:gap-3 ml-auto items-center">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="relative flex items-center gap-2 border border-border px-3 md:px-4 py-2.5 text-[10px] md:text-xs tracking-widest uppercase font-body font-light hover:border-primary transition-colors"
            >
              <SlidersHorizontal size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none border border-border px-3 md:px-4 py-2.5 pr-8 text-[10px] md:text-xs tracking-widest uppercase font-body font-light bg-background focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-secondary border border-border p-4 md:p-6 mb-6 md:mb-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <p className="text-xs tracking-widest uppercase font-body font-medium">Refine Results</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-xs font-body font-light text-primary hover:underline">Clear all filters</button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Category */}
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-medium mb-3">Category</p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs tracking-wider uppercase font-body font-light border transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"}`}
                      >{cat}</button>
                    ))}
                  </div>
                </div>
                {/* Price */}
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-medium mb-3">Price Range</p>
                  <div className="flex flex-col gap-1.5">
                    {PRICE_RANGES.map((range, idx) => (
                      <button key={range.label} onClick={() => setSelectedPriceRange(idx)}
                        className={`text-left px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-body font-light border transition-colors ${selectedPriceRange === idx ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"}`}
                      >{range.label}</button>
                    ))}
                  </div>
                </div>
                {/* Size */}
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-medium mb-3">Size</p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {ALL_SIZES.map((size) => (
                      <button key={size} onClick={() => toggleSize(size)}
                        className={`min-w-[36px] md:min-w-[40px] px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs tracking-wider uppercase font-body font-light border transition-colors ${selectedSizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"}`}
                      >{size}</button>
                    ))}
                  </div>
                </div>
                {/* Occasion */}
                <div>
                  <p className="text-xs tracking-widest uppercase font-body font-medium mb-3">Occasion</p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {occasions.map((occ) => (
                      <button key={occ} onClick={() => setSelectedOccasion(occ)}
                        className={`px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs tracking-wider uppercase font-body font-light border transition-colors ${selectedOccasion === occ ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"}`}
                      >{occ}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {selectedCategory !== "All" && (
              <button onClick={() => setSelectedCategory("All")} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1 text-xs font-body font-light">
                {selectedCategory} <X size={10} />
              </button>
            )}
            {selectedOccasion !== "All" && (
              <button onClick={() => setSelectedOccasion("All")} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1 text-xs font-body font-light">
                {selectedOccasion} <X size={10} />
              </button>
            )}
            {selectedPriceRange > 0 && (
              <button onClick={() => setSelectedPriceRange(0)} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1 text-xs font-body font-light">
                {PRICE_RANGES[selectedPriceRange].label} <X size={10} />
              </button>
            )}
            {selectedSizes.map((size) => (
              <button key={size} onClick={() => toggleSize(size)} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1 text-xs font-body font-light">
                Size: {size} <X size={10} />
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {visibleProducts.map((product) => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} onQuickView={() => setQuickViewProduct(product)} />
                </motion.div>
              ))}
            </motion.div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                  className="px-8 py-3 border border-border text-xs tracking-widest uppercase font-body font-light hover:border-primary hover:text-primary transition-colors"
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-display text-3xl font-light text-muted-foreground mb-4">No pieces found</p>
            <p className="text-sm font-body font-light text-muted-foreground mb-6">Try adjusting your filters</p>
            <button onClick={clearAllFilters} className="text-xs tracking-widest uppercase font-body font-light text-primary hover:underline">
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      <Footer />
    </div>
  );
};

export default Shop;
