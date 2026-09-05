import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.post("/api/checkout/verify", { sessionId });
        if (data?.success) {
          clearCart();
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          {status === "verifying" && (
            <>
              <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl font-light mb-2">Verifying Payment</h2>
              <p className="text-sm text-muted-foreground font-body font-light">Please wait while we confirm your order...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
              <h2 className="font-display text-3xl font-light mb-2">Order Confirmed!</h2>
              <p className="text-sm text-muted-foreground font-body font-light mb-8">
                Your rental order has been placed successfully. You'll receive a confirmation email shortly.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors"
              >
                View My Orders
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="font-display text-3xl font-light mb-2">Something went wrong</h2>
              <p className="text-sm text-muted-foreground font-body font-light mb-8">
                We couldn't verify your payment. If you were charged, please contact support.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
