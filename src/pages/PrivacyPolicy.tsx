import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Helmet><title>Privacy Policy | RentRobe</title></Helmet>
    <Navbar />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-light mb-8">Privacy Policy</h1>
      <div className="space-y-8 text-sm font-body font-light leading-relaxed text-muted-foreground">
        <p>Last updated: March 2026</p>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal information:</strong> Name, email, phone number, delivery address.</li>
            <li><strong>Payment information:</strong> UPI transaction IDs and payment screenshots (processed securely).</li>
            <li><strong>Usage data:</strong> Browsing history, wishlist items, and order history.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Processing and fulfilling your rental orders.</li>
            <li>Communicating order updates and promotional offers.</li>
            <li>Improving our platform and personalizing your experience.</li>
            <li>Fraud prevention and payment verification.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Data Protection</h2>
          <p>We use industry-standard encryption and secure storage. Payment screenshots are stored in private encrypted buckets accessible only to authorized administrators. We never share your personal data with third parties for marketing purposes.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Your Rights</h2>
          <p>You may request access, correction, or deletion of your personal data at any time by contacting us at <a href="mailto:renttrobe@gmail.com" className="text-primary hover:underline">renttrobe@gmail.com</a>.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default PrivacyPolicy;
