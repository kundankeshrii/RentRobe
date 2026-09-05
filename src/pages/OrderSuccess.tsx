import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const method = searchParams.get("method") || "upi";

  const mailtoSubject = encodeURIComponent("Payment Submitted - RentRobe Order");
  const mailtoBody = encodeURIComponent(
    `New payment submitted for Order #${orderNumber} on RentRobe. Please verify in the admin dashboard.`
  );
  const mailtoLink = `mailto:renttrobe@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h1 className="font-display text-3xl font-light mb-2">Order Placed Successfully!</h1>
          {orderNumber && (
            <p className="text-sm font-body font-medium text-foreground mb-2">
              Order #{orderNumber}
            </p>
          )}
          {method === "upi" ? (
            <p className="text-sm text-muted-foreground font-body font-light mb-8">
              Payment uploaded successfully. Please send confirmation email.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground font-body font-light mb-8">
              Your rental order has been placed successfully. You'll receive a confirmation email shortly.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {method === "upi" && orderNumber && (
              <a
                href={mailtoLink}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors"
              >
                <Mail size={16} />
                Send Email Confirmation
              </a>
            )}
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors border border-primary"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 text-xs tracking-widest uppercase font-body font-light text-muted-foreground hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
