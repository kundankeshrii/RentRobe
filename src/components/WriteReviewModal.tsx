import { useState } from "react";
import { Star, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  productId: string;
  orderNumber: string;
  onReviewSubmitted: () => void;
}

const WriteReviewModal = ({
  open,
  onOpenChange,
  orderId,
  productId,
  orderNumber,
  onReviewSubmitted,
}: WriteReviewModalProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setSubmitting(true);

    try {
      // Check eligibility
      const { data } = await api.get(`/api/reviews/eligible/${productId}`);
      if (!data?.eligible) {
        toast.error("You can only review products you've completed renting.");
        setSubmitting(false);
        return;
      }
    } catch {
      toast.error("Eligibility check failed.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/api/reviews", {
        productId: productId,
        rating,
        comment: comment.trim(),
        size,
      });

      toast.success("Review submitted! Thank you for your feedback.");
      setComment("");
      setSize("");
      setRating(5);
      onOpenChange(false);
      onReviewSubmitted();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to submit review.";
      if (msg.includes("duplicate") || msg.includes("23505")) {
        toast.error("You've already reviewed this product.");
      } else {
        toast.error(msg);
      }
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-light">
            Write a Review
          </DialogTitle>
          <p className="text-xs text-muted-foreground font-body font-light">
            Order {orderNumber}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Star Rating */}
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    size={24}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Worn */}
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              Size Worn (Optional)
            </label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. M, L, Free Size"
              className="w-full px-4 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              Your Review
            </label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="inline-flex items-center gap-2 w-full justify-center bg-primary text-primary-foreground px-8 py-3 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={13} />
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewModal;
