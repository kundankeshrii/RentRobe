import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WishlistContextType {
  items: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const GUEST_WISHLIST_KEY = "guest_wishlist";

const loadGuestWishlist = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveGuestWishlist = (items: string[]) => {
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load wishlist based on auth state
  useEffect(() => {
    if (user) {
      const init = async () => {
        try {
          const { data } = await api.get("/api/wishlist");
          const dbIds: string[] = data.productIds || [];

          // Merge guest wishlist into API
          const guestItems = loadGuestWishlist();

          const pendingStr = sessionStorage.getItem("rentrobe_pending_action");
          if (pendingStr) {
            try {
              const pending = JSON.parse(pendingStr);
              if (pending.type === "wishlist" && pending.payload?.productId) {
                const pid = pending.payload.productId;
                if (!guestItems.includes(pid)) {
                  guestItems.push(pid);
                }
                sessionStorage.removeItem("rentrobe_pending_action");
                toast.success("Item successfully added to wishlist!");
              }
            } catch (err) {
              console.error("Failed to parse pending wishlist action", err);
            }
          }

          const toAdd = guestItems.filter((id) => !dbIds.includes(id));
          for (const productId of toAdd) {
            try {
              await api.post(`/api/wishlist/${productId}`);
            } catch {
              // ignore individual errors
            }
          }

          // Clear guest storage
          localStorage.removeItem(GUEST_WISHLIST_KEY);

          const merged = Array.from(new Set([...dbIds, ...guestItems]));
          setItems(merged);
        } catch {
          setItems([]);
        }
        setInitialized(true);
      };
      init();
    } else {
      setItems(loadGuestWishlist());
      setInitialized(true);
    }
  }, [user]);

  // Persist guest wishlist to localStorage
  useEffect(() => {
    if (initialized && !user) {
      saveGuestWishlist(items);
    }
  }, [items, user, initialized]);

  const isWishlisted = useCallback((productId: string) => items.includes(productId), [items]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const exists = items.includes(productId);
      if (exists) {
        setItems((prev) => prev.filter((id) => id !== productId));
        if (user) {
          try {
            await api.delete(`/api/wishlist/${productId}`);
          } catch {
            // ignore
          }
        }
      } else {
        setItems((prev) => [...prev, productId]);
        if (user) {
          try {
            await api.post(`/api/wishlist/${productId}`);
          } catch {
            // ignore
          }
        }
      }
    },
    [items, user]
  );

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlist, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
