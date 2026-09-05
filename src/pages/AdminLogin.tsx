import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else {
        navigate("/admin");
      }
    } catch {
      toast({ title: "Error", description: "Connection error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-light tracking-wide">
            RENT<span className="text-primary">ROBE</span>
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body font-light mt-1">
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Lock size={14} />
            {loading ? "Signing in..." : "Admin Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-body font-light">
          <a href="/" className="underline hover:text-foreground transition-colors">Back to store</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
