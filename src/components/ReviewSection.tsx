import { useState, useEffect } from "react";
import { Star, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { reviews as mockReviews } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewSectionProps {
  productId: string;
  productRating: number;
  productReviewCount: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  size: string;
  createdAt: string;
}

const ReviewSection = ({ productId, productRating, productReviewCount }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [size, setSize] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/api/reviews/${productId}`);
        setDbReviews((data as Review[]) || []);
      } catch {
        setDbReviews([]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [productId]);

  // Check if user can review (has completed order for this product)
  const checkReviewEligibility = async () => {
    if (!user) {
      setCanReview(false);
      return;
    }
    setCheckingEligibility(true);
    try {
      const { data } = await api.get(`/api/reviews/eligible/${productId}`);
      setCanReview(!!data?.eligible);
    } catch {
      setCanReview(false);
    }
    setCheckingEligibility(false);
  };

  useEffect(() => {
    checkReviewEligibility();
  }, [user, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to leave a review.", variant: "destructive" });
      return;
    }
    if (!canReview) {
      toast({ title: "Not eligible", description: "You can only review products you've rented.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/reviews", {
        productId: productId,
        rating,
        comment,
        size,
      });
      setDbReviews((prev) => [data as Review, ...prev]);
      setComment("");
      setSize("");
      setRating(5);
      setShowForm(false);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || error.message || "Failed to submit review.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const allReviews = dbReviews.length > 0 ? dbReviews : [];
  const displayReviews = allReviews.length > 0 ? allReviews : mockReviews;
  const isUsingMock = allReviews.length === 0;

  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : productRating;

  const totalCount = allReviews.length > 0 ? allReviews.length : productReviewCount;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Today";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="mt-20 border-t border-border pt-16">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
        <div>
          <p className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground mb-2">Customer Stories</p>
          <h2 className="font-display text-4xl font-light">Reviews</h2>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="font-display text-5xl text-primary">{avgRating}</div>
            <div className="flex justify-end mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-primary text-primary" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-body font-light mt-1">{totalCount} reviews</p>
          </div>

          {user && canReview && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-primary-foreground px-6 py-3 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity"
            >
              Write Review
            </button>
          )}
          {user && !canReview && !checkingEligibility && (
            <p className="text-xs text-muted-foreground font-body font-light italic">
              Rent this item to leave a review
            </p>
          )}
          {!user && (
            <a href="/auth" className="text-xs text-primary font-body underline">
              Sign in to review
            </a>
          )}
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-secondary p-6 md:p-8 mb-10 overflow-hidden"
          >
            <h3 className="text-xs tracking-widest uppercase font-body font-medium mb-6">Share Your Experience</h3>

            {/* Star Rating */}
            <div className="mb-5">
              <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Rating</label>
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
                      size={22}
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

            {/* Size */}
            <div className="mb-5">
              <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Size Worn</label>
              <input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M, L, Free Size"
                className="w-full max-w-xs px-4 py-2.5 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Your Review</label>
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
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={13} />
              {submitting ? "Submitting..." : "Submit Review"}
            </button>

            {!user && (
              <p className="mt-3 text-xs text-muted-foreground font-body font-light">
                You need to <a href="/auth" className="text-primary underline">sign in</a> to submit a review.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-secondary p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="h-2 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {displayReviews.map((review: any) => (
            <motion.div
              key={review.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="bg-secondary p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-body font-medium">
                  {isUsingMock
                    ? review.avatar
                    : (review.userName || review.user_name || "A").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-body font-medium">{isUsingMock ? review.user : (review.userName || review.user_name)}</p>
                  <p className="text-xs text-muted-foreground font-body font-light">
                    {review.size && `Size ${review.size} · `}
                    {isUsingMock ? review.date : formatDate(review.createdAt || review.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} className={`${i < review.rating ? "fill-primary text-primary" : "text-border"}`} />
                ))}
              </div>
              <p className="text-sm font-body font-light text-muted-foreground leading-relaxed">{review.comment}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ReviewSection;
