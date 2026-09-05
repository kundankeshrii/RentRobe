import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const RentalPolicy = () => (
  <div className="min-h-screen bg-background">
    <Helmet><title>Rental Policy | RentRobe</title></Helmet>
    <Navbar />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-light mb-8">Rental Policy</h1>
      <div className="space-y-8 text-sm font-body font-light leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">How Renting Works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Browse our collection and select your outfit, size, and rental dates.</li>
            <li>Complete payment including a refundable security deposit.</li>
            <li>Your outfit will be delivered 1–2 days before your rental start date.</li>
            <li>Wear, enjoy, and return by the rental end date.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Rental Duration</h2>
          <p>Standard rentals are 3–7 days. Extended rentals may be available at additional daily rates. The daily rate is calculated as 1/3 of the base 3-day rental price.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Late Return Charges</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>1–2 days late:</strong> ₹500 per day deducted from security deposit.</li>
            <li><strong>3–5 days late:</strong> ₹750 per day deducted from security deposit.</li>
            <li><strong>6+ days late:</strong> Full security deposit forfeited, additional charges may apply.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Security Deposit</h2>
          <p>A refundable security deposit is collected with every order. The deposit is refunded within 5–7 business days after the outfit is returned and inspected. Deductions may apply for late returns, damage, or missing items.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Cancellation Rules</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>7+ days before rental:</strong> Full refund (excluding processing fees).</li>
            <li><strong>3–6 days before rental:</strong> 50% refund of rental amount.</li>
            <li><strong>Less than 3 days:</strong> No refund on rental amount; security deposit refunded.</li>
          </ul>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default RentalPolicy;
