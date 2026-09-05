import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const ReturnPolicy = () => (
  <div className="min-h-screen bg-background">
    <Helmet><title>Return & Refund Policy | RentRobe</title></Helmet>
    <Navbar />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-light mb-8">Return & Refund Policy</h1>
      <div className="space-y-8 text-sm font-body font-light leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Return & Pickup Process</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Pack the outfit in the original garment bag and packaging provided.</li>
            <li>The RentRobe team will collect the package from your delivery address on your scheduled pickup date (the day after your usage date).</li>
            <li>No manual pickup booking or drop-off required.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Cleaning Process</h2>
          <p>You do <strong>not</strong> need to dry clean the outfit before returning. Our team professionally cleans and inspects every garment after each rental. Simply return in a reasonable, wearable condition — light wear from normal use is expected.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Security deposits are refunded within 5–7 business days after inspection.</li>
            <li>Refunds are processed to the original payment method.</li>
            <li>UPI payment refunds may take an additional 2–3 business days.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Non-Refundable Items</h2>
          <p>Rental fees are non-refundable once the outfit has been dispatched.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default ReturnPolicy;
