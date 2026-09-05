import { Package, Truck, MapPin, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const deliverySteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "in_transit", label: "In Transit", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
] as const;

interface DeliveryTimelineProps {
  deliveryStatus: string;
  trackingNumber?: string | null;
  estimatedDeliveryDate?: string | null;
}

const DeliveryTimeline = ({ deliveryStatus, trackingNumber, estimatedDeliveryDate }: DeliveryTimelineProps) => {
  const currentIndex = deliverySteps.findIndex((s) => s.key === deliveryStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="border border-border bg-secondary p-5 mb-6">
      <h2 className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-5 flex items-center gap-2">
        <Truck size={14} /> Delivery Tracking
      </h2>

      {/* Timeline */}
      <div className="relative">
        {deliverySteps.map((step, i) => {
          const StepIcon = step.icon;
          const isCompleted = i <= activeIndex;
          const isCurrent = i === activeIndex;

          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              {/* Vertical line */}
              {i < deliverySteps.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[30px] w-px h-[calc(100%-6px)] ${
                    i < activeIndex ? "bg-primary" : "bg-border"
                  }`}
                />
              )}

              {/* Icon circle */}
              <div
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <StepIcon size={14} />
              </div>

              {/* Label */}
              <div className={`pb-6 ${i === deliverySteps.length - 1 ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-body ${
                    isCurrent ? "font-medium text-foreground" : isCompleted ? "font-light text-foreground" : "font-light text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-primary font-body font-light mt-0.5">Current status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking info */}
      <div className="mt-5 pt-4 border-t border-border space-y-2">
        {trackingNumber && (
          <div className="flex justify-between text-sm font-body font-light">
            <span className="text-muted-foreground">Tracking Number</span>
            <span className="font-mono text-xs">{trackingNumber}</span>
          </div>
        )}
        {estimatedDeliveryDate && (
          <div className="flex justify-between text-sm font-body font-light">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span>{format(new Date(estimatedDeliveryDate), "MMM dd, yyyy")}</span>
          </div>
        )}
        {!trackingNumber && !estimatedDeliveryDate && (
          <p className="text-xs text-muted-foreground font-body font-light">
            Tracking details will appear here once your order is shipped.
          </p>
        )}
      </div>
    </div>
  );
};

export default DeliveryTimeline;
