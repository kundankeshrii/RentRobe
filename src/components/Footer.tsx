import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/">
              <span className="font-display text-2xl tracking-widest font-light">
                RENT<span className="text-primary">ROBE</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground font-body font-light leading-relaxed">
              RentRobe is a premium fashion rental platform for renting designer outfits for weddings and special occasions.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/rent_robe" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 12a4 4 0 1 1 8 0c0 3-2 6-3 7" /><path d="M9.5 17l1.5-5" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-medium text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Shop", to: "/shop" },
                { label: "New Arrivals", to: "/shop" },
                { label: "Wishlist", to: "/wishlist" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-body font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-medium text-foreground mb-4">Customer Support</h4>
            <ul className="space-y-3">
              {[
                { label: "Rental Policy", to: "/rental-policy" },
                { label: "Return & Refund Policy", to: "/return-policy" },
                { label: "Damage Policy", to: "/damage-policy" },
                { label: "FAQs", to: "/shop" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-body font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-medium text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Terms of Service", to: "/terms-of-service" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-body font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-body font-medium text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:renttrobe@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body font-light">
                  <Mail size={14} /> renttrobe@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body font-light tracking-wide">
            © {new Date().getFullYear()} RentRobe. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors font-body font-light">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors font-body font-light">Terms of Service</Link>
            <Link to="/rental-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors font-body font-light">Rental Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
