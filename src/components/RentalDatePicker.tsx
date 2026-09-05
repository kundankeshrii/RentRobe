import { format, addDays, subDays, isSameDay } from "date-fns";
import { CalendarIcon, AlertCircle, Truck, Sparkles, PackageCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RentalDatePickerProps {
  usageDate: Date | undefined;
  onUsageDateChange: (date: Date | undefined) => void;
  totalPrice: number;
  unavailableDates?: Date[];
  stockQuantity?: number;
  hasConflict?: boolean;
}

const RentalDatePicker = ({
  usageDate,
  onUsageDateChange,
  totalPrice,
  unavailableDates = [],
  stockQuantity,
  hasConflict = false,
}: RentalDatePickerProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Delivery happens 1 day before usage, so earliest usage date must be tomorrow (delivery = today) or later
  const earliestUsageDate = addDays(today, 1);

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some((ud) => isSameDay(ud, date));
  };

  // A usage date is disabled if it is in the past, or if deliveryDate, usageDate, or pickupDate is unavailable
  const disableUsageDate = (date: Date) => {
    if (date < earliestUsageDate) return true;
    const delivery = subDays(date, 1);
    const pickup = addDays(date, 1);
    return isDateUnavailable(delivery) || isDateUnavailable(date) || isDateUnavailable(pickup);
  };

  const deliveryDate = usageDate ? subDays(usageDate, 1) : undefined;
  const pickupDate = usageDate ? addDays(usageDate, 1) : undefined;

  return (
    <div className="space-y-4">
      {/* Header & Stock status */}
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-widest uppercase font-body font-medium">
          When do you need this outfit?
        </p>
        {stockQuantity !== undefined && (
          <span
            className={cn(
              "text-xs font-body font-light px-2 py-0.5",
              stockQuantity > 0 ? "text-muted-foreground" : "text-destructive bg-destructive/10"
            )}
          >
            {stockQuantity > 0 ? `${stockQuantity} in stock` : "Out of stock"}
          </span>
        )}
      </div>

      {/* Single Usage Date Picker */}
      <div>
        <label className="text-xs text-muted-foreground font-body font-light mb-1.5 block">
          Event / Wear Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal font-body h-12 border-border",
                !usageDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {usageDate ? format(usageDate, "dd MMMM yyyy") : "Select Usage Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border border-border" align="start">
            <Calendar
              mode="single"
              selected={usageDate}
              onSelect={onUsageDateChange}
              disabled={disableUsageDate}
              modifiers={{ unavailable: unavailableDates }}
              modifiersClassNames={{ unavailable: "line-through text-destructive/50 bg-destructive/5" }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Conflict Warning */}
      {hasConflict && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-2">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="text-xs font-body font-light">
            This date range overlaps with existing bookings. Please choose a different date.
          </span>
        </div>
      )}

      {/* Rental Schedule Card */}
      {usageDate && deliveryDate && pickupDate && !hasConflict && (
        <div className="bg-secondary/70 border border-border p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-body font-medium uppercase tracking-wider text-primary">
            <Info size={14} />
            <span>Rental Schedule</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
            {/* Delivery */}
            <div className="bg-background/80 p-2.5 rounded-sm border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Truck size={12} />
                <span className="text-[10px] uppercase tracking-wider font-body font-light">Delivery</span>
              </div>
              <p className="text-xs md:text-sm font-body font-medium text-foreground">
                {format(deliveryDate, "dd MMM yyyy")}
              </p>
            </div>

            {/* Usage */}
            <div className="bg-primary/5 p-2.5 rounded-sm border border-primary/20 text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Sparkles size={12} />
                <span className="text-[10px] uppercase tracking-wider font-body font-medium">Usage</span>
              </div>
              <p className="text-xs md:text-sm font-body font-semibold text-primary">
                {format(usageDate, "dd MMM yyyy")}
              </p>
            </div>

            {/* Pickup */}
            <div className="bg-background/80 p-2.5 rounded-sm border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <PackageCheck size={12} />
                <span className="text-[10px] uppercase tracking-wider font-body font-light">Pickup</span>
              </div>
              <p className="text-xs md:text-sm font-body font-medium text-foreground">
                {format(pickupDate, "dd MMM yyyy")}
              </p>
            </div>
          </div>

          {/* Schedule description points */}
          <div className="text-[11px] font-body text-muted-foreground space-y-1 pt-1">
            <p>• Delivery happens 1 day before your selected wear date.</p>
            <p>• Wear and enjoy the outfit on your selected usage date.</p>
            <p>• Pickup is handled by the RentRobe team the next day.</p>
          </div>

          {/* Price breakdown */}
          <div className="border-t border-border pt-3 flex justify-between items-baseline text-sm font-body">
            <span className="text-muted-foreground font-light">Rental Fee</span>
            <span className="font-display text-xl text-primary">₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalDatePicker;
