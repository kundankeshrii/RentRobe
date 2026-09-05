import { useState, useCallback } from "react";
import api from "@/lib/api";

export interface PromoResult {
  valid: boolean;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  error?: string;
}

export const usePromoCode = () => {
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);

  const applyPromo = useCallback(async (code: string): Promise<PromoResult> => {
    if (!code.trim()) {
      const result: PromoResult = { valid: false, code, discountType: "fixed", value: 0, error: "Enter a promo code" };
      setPromo(null);
      return result;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/promo/validate", { code: code.trim().toUpperCase() });
      setLoading(false);

      if (!data.valid) {
        const result: PromoResult = {
          valid: false,
          code,
          discountType: "fixed",
          value: 0,
          error: data.error || "Invalid promo code",
        };
        setPromo(null);
        return result;
      }

      const result: PromoResult = {
        valid: true,
        code: data.code,
        discountType: data.discountType as "percentage" | "fixed",
        value: Number(data.value),
      };
      setPromo(result);
      return result;
    } catch (err: any) {
      setLoading(false);
      const result: PromoResult = {
        valid: false,
        code,
        discountType: "fixed",
        value: 0,
        error: err.response?.data?.message || "Invalid promo code",
      };
      setPromo(null);
      return result;
    }
  }, []);

  const clearPromo = useCallback(() => setPromo(null), []);

  const calcDiscount = useCallback((subtotal: number) => {
    if (!promo?.valid) return 0;
    if (promo.discountType === "percentage") {
      return Math.round(subtotal * (promo.value / 100));
    }
    return Math.min(promo.value, subtotal);
  }, [promo]);

  return { promo, loading, applyPromo, clearPromo, calcDiscount };
};
