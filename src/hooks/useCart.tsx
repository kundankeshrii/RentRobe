import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

export interface CartItem {
  id?: string; // server-side cart item id
  productId: string;
  name: string;
  designer: string;
  image: string;
  size: string;
  usageDate?: Date;
  rentalStart: Date;
  rentalEnd: Date;
  rentalPrice: number;
  securityDeposit?: number;
  quantity: number;
}

interface SerializedCartItem extends Omit<CartItem, "usageDate" | "rentalStart" | "rentalEnd"> {
  usageDate?: string;
  rentalStart: string;
  rentalEnd: string;
}

export const formatDateSafe = (d: Date | string | undefined): string => {
  if (!d) return "";
  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    return format(new Date(d), "yyyy-MM-dd");
  }
  return format(d, "yyyy-MM-dd");
};

export const parseDateSafe = (d: string | Date | undefined): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(`${d}T00:00:00`);
  }
  return new Date(d);
};

/** Unique key for a cart line item */
export const cartItemKey = (item: { productId: string; size: string; rentalStart: Date; rentalEnd: Date }) =>
  `${item.productId}|${item.size}|${formatDateSafe(item.rentalStart)}|${formatDateSafe(item.rentalEnd)}`;

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: string, rentalStart: Date, rentalEnd: Date) => void;
  updateQuantity: (productId: string, size: string, rentalStart: Date, rentalEnd: Date, quantity: number) => void;
  clearCart: () => void;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "guest_cart";

const loadGuestCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return [];
    const parsed: SerializedCartItem[] = JSON.parse(stored);
    return parsed.map((item) => {
      const rentalStart = parseDateSafe(item.rentalStart);
      const rentalEnd = parseDateSafe(item.rentalEnd);
      const usageDate = item.usageDate ? parseDateSafe(item.usageDate) : addDays(rentalStart, 1);
      return {
        ...item,
        usageDate,
        rentalStart,
        rentalEnd,
      };
    });
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]) => {
  try {
    const serialized: SerializedCartItem[] = items.map((item) => ({
      ...item,
      usageDate: item.usageDate ? formatDateSafe(item.usageDate) : undefined,
      rentalStart: formatDateSafe(item.rentalStart),
      rentalEnd: formatDateSafe(item.rentalEnd),
    }));
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(serialized));
  } catch {
    // storage full or unavailable
  }
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
};

const matchItem = (a: CartItem, productId: string, size: string, start: Date, end: Date) =>
  a.productId === productId &&
  a.size === size &&
  formatDateSafe(a.rentalStart) === formatDateSafe(start) &&
  formatDateSafe(a.rentalEnd) === formatDateSafe(end);

// Map API cart item to CartItem
const apiToCartItem = (row: any): CartItem => {
  const rentalStart = parseDateSafe(row.rentalStart);
  const rentalEnd = parseDateSafe(row.rentalEnd);
  const usageDate = row.usageDate ? parseDateSafe(row.usageDate) : addDays(rentalStart, 1);
  return {
    id: row.id,
    productId: row.productId,
    name: row.name,
    designer: row.designer,
    image: row.image,
    size: row.size,
    usageDate,
    rentalStart,
    rentalEnd,
    rentalPrice: Number(row.rentalPrice),
    securityDeposit: Number(row.securityDeposit) || 0,
    quantity: row.quantity,
  };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load cart based on auth state
  useEffect(() => {
    if (user) {
      // Logged in: load from API, merge guest cart
      const init = async () => {
        try {
          const { data } = await api.get("/api/cart");
          const dbItems: CartItem[] = (data.items || []).map(apiToCartItem);

          // Merge guest cart
          const guestItems = loadGuestCart();

          const pendingStr = sessionStorage.getItem("rentrobe_pending_action");
          if (pendingStr) {
            try {
              const pending = JSON.parse(pendingStr);
              if (pending.type === "cart" && pending.payload) {
                const pItem = pending.payload;
                const rStart = parseDateSafe(pItem.rentalStart);
                const rEnd = parseDateSafe(pItem.rentalEnd);
                const uDate = pItem.usageDate ? parseDateSafe(pItem.usageDate) : addDays(rStart, 1);
                const cartItem: CartItem = {
                  productId: pItem.productId,
                  name: pItem.name,
                  designer: pItem.designer,
                  image: pItem.image,
                  size: pItem.size,
                  usageDate: uDate,
                  rentalStart: rStart,
                  rentalEnd: rEnd,
                  rentalPrice: Number(pItem.rentalPrice),
                  securityDeposit: Number(pItem.securityDeposit || 0),
                  quantity: 1,
                };
                
                const exists = guestItems.some((gi) => matchItem(gi, cartItem.productId, cartItem.size, cartItem.rentalStart, cartItem.rentalEnd));
                if (!exists) {
                  guestItems.push(cartItem);
                }
                sessionStorage.removeItem("rentrobe_pending_action");
                toast.success("Item successfully added to cart!");
              }
            } catch (err) {
              console.error("Failed to parse pending cart action", err);
            }
          }
          for (const gi of guestItems) {
            const exists = dbItems.some((di) => matchItem(di, gi.productId, gi.size, gi.rentalStart, gi.rentalEnd));
            if (!exists) {
              try {
                await api.post("/api/cart", {
                  productId: gi.productId,
                  name: gi.name,
                  designer: gi.designer,
                  image: gi.image,
                  size: gi.size,
                  usageDate: gi.usageDate ? formatDateSafe(gi.usageDate) : formatDateSafe(addDays(gi.rentalStart, 1)),
                  rentalStart: formatDateSafe(gi.rentalStart),
                  rentalEnd: formatDateSafe(gi.rentalEnd),
                  rentalPrice: gi.rentalPrice,
                  securityDeposit: gi.securityDeposit || 0,
                  quantity: gi.quantity,
                });
              } catch {
                // ignore individual merge errors
              }
            }
          }

          clearGuestCart();

          // Reload from API to get merged state
          const { data: merged } = await api.get("/api/cart");
          setItems((merged.items || []).map(apiToCartItem));
        } catch {
          setItems([]);
        }
        setInitialized(true);
      };
      init();
    } else {
      // Guest: load from localStorage
      setItems(loadGuestCart());
      setInitialized(true);
    }
  }, [user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (initialized && !user) {
      saveGuestCart(items);
    }
  }, [items, user, initialized]);

  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity">) => {
      const startStr = formatDateSafe(item.rentalStart);
      const endStr = formatDateSafe(item.rentalEnd);
      const usageStr = item.usageDate ? formatDateSafe(item.usageDate) : formatDateSafe(addDays(parseDateSafe(item.rentalStart), 1));
      if (user) {
        try {
          await api.post("/api/cart", {
            productId: item.productId,
            name: item.name,
            designer: item.designer,
            image: item.image,
            size: item.size,
            usageDate: usageStr,
            rentalStart: startStr,
            rentalEnd: endStr,
            rentalPrice: item.rentalPrice,
            securityDeposit: item.securityDeposit || 0,
            quantity: 1,
          });
          // Refresh from API
          const { data } = await api.get("/api/cart");
          setItems((data.items || []).map(apiToCartItem));
        } catch {
          // ignore
        }
      } else {
        setItems((prev) => {
          const existing = prev.find((i) => matchItem(i, item.productId, item.size, item.rentalStart, item.rentalEnd));
          if (existing) {
            return prev.map((i) =>
              matchItem(i, item.productId, item.size, item.rentalStart, item.rentalEnd)
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }
          return [...prev, { ...item, quantity: 1 }];
        });
      }
    },
    [user]
  );

  const removeItem = useCallback(
    async (productId: string, size: string, rentalStart: Date, rentalEnd: Date) => {
      if (user) {
        // Find the item id
        const found = items.find((i) => matchItem(i, productId, size, rentalStart, rentalEnd));
        if (found?.id) {
          try {
            await api.delete(`/api/cart/${found.id}`);
            const { data } = await api.get("/api/cart");
            setItems((data.items || []).map(apiToCartItem));
          } catch {
            // ignore
          }
        }
      } else {
        setItems((prev) => prev.filter((i) => !matchItem(i, productId, size, rentalStart, rentalEnd)));
      }
    },
    [user, items]
  );

  const updateQuantity = useCallback(
    async (productId: string, size: string, rentalStart: Date, rentalEnd: Date, quantity: number) => {
      if (quantity < 1) return;
      if (user) {
        const found = items.find((i) => matchItem(i, productId, size, rentalStart, rentalEnd));
        if (found?.id) {
          try {
            await api.put(`/api/cart/${found.id}`, { quantity });
            const { data } = await api.get("/api/cart");
            setItems((data.items || []).map(apiToCartItem));
          } catch {
            // ignore
          }
        }
      } else {
        setItems((prev) =>
          prev.map((i) => matchItem(i, productId, size, rentalStart, rentalEnd) ? { ...i, quantity } : i)
        );
      }
    },
    [user, items]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await api.delete("/api/cart");
      } catch {
        // ignore
      }
      setItems([]);
    } else {
      setItems([]);
      clearGuestCart();
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, count: items.reduce((s, i) => s + i.quantity, 0) }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
