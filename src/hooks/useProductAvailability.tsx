import { useState, useEffect } from "react";
import api from "@/lib/api";
import { eachDayOfInterval, isSameDay, subDays, addDays } from "date-fns";

export const useProductAvailability = (productId: string | undefined) => {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchUnavailableDates = async () => {
      setLoading(true);
      try {
        // Use a wide range for initial fetch (current year +/- 1 year)
        const now = new Date();
        const fromDate = new Date(now.getFullYear() - 0, now.getMonth(), 1).toISOString().split("T")[0];
        const toDate = new Date(now.getFullYear() + 1, now.getMonth(), 1).toISOString().split("T")[0];

        const { data } = await api.post("/api/availability/unavailable-dates", {
          productId,
          fromDate,
          toDate,
        });

        // data is string[] of dates like "2024-01-15"
        const dates: string[] = Array.isArray(data) ? data : (data.dates || []);
        setUnavailableDates(dates.map((d: string) => new Date(d + "T00:00:00")));
      } catch {
        setUnavailableDates([]);
      }
      setLoading(false);
    };

    fetchUnavailableDates();
  }, [productId]);

  const checkConflict = (startDate: Date | undefined, endDate: Date | undefined): boolean => {
    if (!startDate || !endDate) return false;
    const rangeDates = eachDayOfInterval({ start: startDate, end: endDate });
    return rangeDates.some((d) => unavailableDates.some((ud) => isSameDay(d, ud)));
  };

  const checkUsageConflict = (usageDate: Date | undefined): boolean => {
    if (!usageDate) return false;
    const delivery = subDays(usageDate, 1);
    const pickup = addDays(usageDate, 1);
    return checkConflict(delivery, pickup);
  };

  return { unavailableDates, loading, checkConflict, checkUsageConflict };
};
