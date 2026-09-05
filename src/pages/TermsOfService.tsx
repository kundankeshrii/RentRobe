import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <Helmet><title>Terms of Service | RentRobe</title></Helmet>
    <Navbar />
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-light mb-8">Terms of Service</h1>
      <div className="space-y-8 text-sm font-body font-light leading-relaxed text-muted-foreground">
        <p>Last updated: March 2026</p>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Agreement to Terms</h2>
          <p>By accessing or using RentRobe, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Rental Agreement</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must be at least 18 years old to rent from RentRobe.</li>
            <li>All outfits remain the property of RentRobe and must be returned by the rental end date.</li>
            <li>You are responsible for the outfit during the rental period.</li>
            <li>Sub-renting or lending rented items is strictly prohibited.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Payments & Deposits</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Full rental amount and security deposit must be paid before dispatch.</li>
            <li>UPI payments require verification before order processing.</li>
            <li>Security deposits are refunded per our Rental Policy after inspection.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Liability</h2>
          <p>RentRobe is not liable for allergic reactions, discomfort, or any issues arising from wearing rented outfits. We recommend checking fabric details before renting. Our total liability is limited to the rental amount paid.</p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default TermsOfService;
