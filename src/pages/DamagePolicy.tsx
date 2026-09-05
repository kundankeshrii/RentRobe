import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const DamagePolicy = () => (
  <div className="min-h-screen bg-background">
    <Helmet><title>Damage Policy | RentRobe</title></Helmet>
    <Navbar />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-light mb-8">Damage Policy</h1>
      <div className="space-y-8 text-sm font-body font-light leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">What's Covered</h2>
          <p>Normal wear and tear is expected. Minor creasing, light perfume scent, and small lint are not considered damage. Regular dry cleaning and standard sanitization are complimentary with every rental.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Security Deposit Deductions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Minor stains (removable):</strong> ₹500 — ₹1,000 deducted from deposit.</li>
            <li><strong>Permanent stains or burns:</strong> ₹1,500 — ₹3,000 deducted from deposit.</li>
            <li><strong>Tears, rips, or missing embellishments:</strong> Up to full deposit deducted.</li>
            <li><strong>Missing accessories or belts:</strong> Cost of replacement deducted.</li>
            <li><strong>Unrepairable damage:</strong> Full deposit forfeited; additional charges may apply up to retail value.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Dispute Process</h2>
          <p>If you disagree with an assessment, contact us within 48 hours with photographs. Our team will review and respond within 3 business days.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default DamagePolicy;
