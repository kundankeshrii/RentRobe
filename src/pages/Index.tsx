import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, Sparkles, RotateCcw, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import { Product } from "@/lib/data";
import api from "@/lib/api";
import heroImage from "@/assets/hero-image.jpg";
import lehengaImg from "@/assets/lehenga.avif";
import gownImg from "@/assets/gawn.webp";
import sareeImg from "@/assets/saree.webp";

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/api/products");
        const list = data.content || data || [];
        setProducts(list.map((p: any) => ({
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
        })));
      } catch {
        // fallback to empty
      }
    };
    fetchProducts();
  }, []);

  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 3);

  const categories = [
    { label: "Lehenga", sublabel: "Bridal & Festive", image: lehengaImg, filter: "Lehengas" },
    { label: "Gown", sublabel: "Elegant & Glamorous", image: gownImg, filter: "Gowns" },
    { label: "Saree", sublabel: "Six Yards of Grace", image: sareeImg, filter: "Sarees" },
    { label: "Indo-Western", sublabel: "Fusion & Modern", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80", filter: "Ethnic" },
    { label: "Party Wear", sublabel: "Night Out & Events", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80", filter: "Dresses" },
  ];

  const steps = [
    { icon: Sparkles, title: "Browse & Choose", desc: "Explore hundreds of designer pieces and select your perfect look." },
    { icon: Package, title: "We Deliver", desc: "Your item arrives cleaned, pressed, and beautifully packaged to your door." },
    { icon: RotateCcw, title: "Wear & Return", desc: "Enjoy your rental, then return it with our prepaid label. Simple." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative h-[100svh] min-h-[560px] flex items-center overflow-hidden">
        <img src={heroImage} alt="RentRobe Hero" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-4">
          <motion.div className="max-w-2xl" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-primary" />
              <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase font-body text-primary-foreground/80">Designer Fashion Rental</p>
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl md:text-8xl text-primary-foreground font-light leading-[0.92] mb-6">
              Rent Your<br /><em className="text-primary">Dream</em><br />Outfit
            </motion.h1>

            <motion.p variants={fadeUp} className="text-sm md:text-lg text-primary-foreground/80 font-body font-light mb-8 md:mb-10 max-w-md leading-relaxed">
              Wear luxury designer sarees, lehengas, gowns & more for every occasion. Starting from ₹499.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-3 md:gap-4 flex-wrap">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-6 md:px-9 py-3.5 md:py-4 text-[10px] md:text-xs tracking-widest uppercase font-body font-medium hover:bg-blush-deep hover:gap-4 transition-all duration-300 group shadow-soft"
              >
                Rent Your Dream Outfit
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#categories"
                className="inline-flex items-center gap-2 border border-primary-foreground/50 text-primary-foreground px-6 md:px-8 py-3.5 md:py-4 text-[10px] md:text-xs tracking-widest uppercase font-body font-light hover:bg-primary-foreground/10 hover:border-primary-foreground transition-all duration-300"
              >
                Explore Styles
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 md:mt-14 flex gap-6 md:gap-8">
              {[
                { val: "500+", label: "Designer Pieces" },
                { val: "₹499", label: "Starting Price" },
                { val: "4.9★", label: "Avg. Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-xl md:text-2xl text-primary-foreground font-light">{s.val}</p>
                  <p className="text-[9px] md:text-xs text-primary-foreground/60 font-body font-light tracking-wider uppercase mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2">
          <motion.div
            className="w-px h-14 bg-primary-foreground/30"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
          />
          <span className="text-primary-foreground/50 text-[10px] tracking-[0.25em] uppercase font-body mt-2 rotate-90 origin-center">Scroll</span>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-secondary border-y border-border py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 md:gap-12 text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground">
            <span className="hidden md:block">Free Delivery & Returns</span>
            <span className="hidden md:block text-border">·</span>
            <span>500+ Designer Pieces</span>
            <span className="hidden md:block text-border">·</span>
            <span className="hidden md:block">Professionally Cleaned</span>
            <span className="hidden md:block text-border">·</span>
            <span className="md:hidden">Free Delivery</span>
            <span className="hidden md:block">Insured Rentals</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <AnimatedSection className="container mx-auto px-4 pt-16 md:pt-24" id="categories">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Shop by Style</p>
            <h2 className="font-display text-3xl md:text-5xl font-light">Find Your Look</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-1.5 text-xs tracking-widest uppercase font-body font-light text-primary hover:gap-3 transition-all duration-300">
            All Styles <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 h-auto md:h-[560px]">
          {categories.map((cat, idx) => (
            <Link
              key={cat.label}
              to={`/shop?category=${cat.filter}`}
              className={`group relative overflow-hidden ${idx < 2 ? "col-span-1 md:col-span-2 row-span-1 md:row-span-2 aspect-[3/4] md:aspect-auto" : "col-span-1 md:col-span-2 aspect-[3/4] md:aspect-auto"}`}
            >
              <img src={cat.image} alt={cat.label} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-foreground/10 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-display text-xl md:text-3xl text-primary-foreground font-light leading-tight">{cat.label}</h3>
                  <p className="text-primary-foreground/70 text-[10px] md:text-xs tracking-wider uppercase font-body font-light mt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">{cat.sublabel}</p>
                  <div className="mt-2 md:mt-3 inline-flex items-center gap-1.5 text-primary-foreground text-[10px] md:text-xs tracking-widest uppercase font-body font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Shop Now <ArrowRight size={10} />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/40 transition-colors duration-300 pointer-events-none" />
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* ── FEATURED ── */}
      <AnimatedSection className="container mx-auto px-4 pt-16 md:pt-24">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Curated for You</p>
            <h2 className="font-display text-3xl md:text-5xl font-light">Featured Pieces</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-1.5 text-xs tracking-widest uppercase font-body font-light text-primary hover:gap-3 transition-all duration-300">
            View All <ChevronRight size={12} />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {featured.map((product) => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 md:hidden text-center">
          <Link to="/shop" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-body font-light text-primary">
            View All <ArrowRight size={12} />
          </Link>
        </div>
      </AnimatedSection>

      {/* ── HOW IT WORKS ── */}
      <AnimatedSection className="container mx-auto px-4 pt-16 md:pt-24">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Simple Process</p>
          <h2 className="font-display text-3xl md:text-5xl font-light">How RentRobe Works</h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group text-center p-6 md:p-8 border border-border hover:border-primary/40 hover:shadow-soft transition-all duration-300 cursor-default"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-5 md:mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <step.icon size={20} className="text-accent-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              <div className="text-3xl md:text-4xl font-display text-muted-foreground/30 font-light mb-2 group-hover:text-primary/30 transition-colors duration-300">
                0{index + 1}
              </div>
              <h3 className="font-display text-xl md:text-2xl font-light mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* ── NEW ARRIVALS BANNER ── */}
      <AnimatedSection className="container mx-auto px-4 pt-16 md:pt-24">
        <div className="bg-secondary px-6 md:px-16 py-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <div>
              <p className="text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Just In</p>
              <h2 className="font-display text-3xl md:text-5xl font-light mb-4">New Arrivals</h2>
              <p className="text-sm text-muted-foreground font-body font-light max-w-sm">
                Fresh pieces added weekly. Be the first to wear the latest designer looks.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4 w-full md:w-auto">
              {newArrivals.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="aspect-[2/3] overflow-hidden bg-muted">
                    <img src={product.images[0]} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <p className="mt-2 text-[10px] md:text-xs font-body font-light text-muted-foreground">{product.designer}</p>
                  <p className="font-display text-xs md:text-sm font-light">{product.name}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 md:mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-3.5 text-[10px] md:text-xs tracking-widest uppercase font-body font-medium hover:bg-blush-deep transition-all duration-300 group"
            >
              Shop New Arrivals
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ── SOCIAL PROOF ── */}
      <AnimatedSection className="container mx-auto px-4 pt-16 md:pt-24 pb-4">
        <div className="text-center">
          <p className="font-display text-2xl md:text-4xl font-light italic text-muted-foreground">
            "The most sustainable way to dress well."
          </p>
          <p className="mt-4 text-[10px] md:text-xs tracking-widest uppercase font-body font-light text-muted-foreground">— Vogue, 2024</p>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default Index;
