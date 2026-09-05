import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X, Heart, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

const Navbar = () => {
  const { count: cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/shop?occasion=Wedding Guest", label: "Occasions" },
    { href: "/shop?category=Gowns", label: "Gowns" },
    { href: "/shop?category=Dresses", label: "Dresses" },
  ];

  const isActive = (href: string) => location.pathname === href.split("?")[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground p-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <span className="font-display text-xl md:text-3xl tracking-widest font-light">
              RENT<span className="text-primary">ROBE</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs tracking-widest uppercase font-body font-light transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary border-b border-primary pb-0.5" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/wishlist" className="text-foreground/70 hover:text-primary transition-colors relative">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">
                  <User size={18} />
                </Link>
                <button onClick={handleSignOut} className="text-foreground/70 hover:text-primary transition-colors hidden md:block">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-foreground/70 hover:text-primary transition-colors">
                <User size={18} />
              </Link>
            )}
            <Link to="/cart" className="text-foreground/70 hover:text-primary transition-colors relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm tracking-widest uppercase font-body font-light text-foreground/70 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className="text-sm tracking-widest uppercase font-body font-light text-foreground/70 hover:text-primary transition-colors"
              >
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <div className="border-t border-border pt-4 flex gap-6">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm tracking-widest uppercase font-body font-light text-foreground/70 hover:text-primary transition-colors">
                      Account
                    </Link>
                    <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="text-sm tracking-widest uppercase font-body font-light text-foreground/70 hover:text-primary transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="text-sm tracking-widest uppercase font-body font-light text-foreground/70 hover:text-primary transition-colors">
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
