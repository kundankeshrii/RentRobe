import { ShieldCheck, BadgeCheck, Sparkles, Award } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Secure Payments", desc: "256-bit encryption" },
  { icon: BadgeCheck, label: "Verified Rentals", desc: "Authenticated users" },
  { icon: Sparkles, label: "Quality Checked", desc: "Every outfit inspected" },
  { icon: Award, label: "Trusted Platform", desc: "5000+ happy renters" },
];

const TrustBadges = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
    {badges.map((b) => (
      <div key={b.label} className="flex flex-col items-center text-center p-3 bg-secondary/50 border border-border">
        <b.icon size={20} className="text-primary mb-1.5" />
        <span className="text-xs font-body font-medium tracking-wide">{b.label}</span>
        <span className="text-[10px] text-muted-foreground font-body font-light">{b.desc}</span>
      </div>
    ))}
  </div>
);

export default TrustBadges;
