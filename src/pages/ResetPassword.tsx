import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import api from "@/lib/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for reset token in URL query params or hash
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || params.get("access_token");
    if (t) {
      setToken(t);
      setReady(true);
    } else {
      const hash = window.location.hash;
      if (hash.includes("access_token=")) {
        const hashParams = new URLSearchParams(hash.replace("#", ""));
        const hashToken = hashParams.get("access_token");
        if (hashToken) {
          setToken(hashToken);
          setReady(true);
          return;
        }
      }
      // Check if user already has a JWT (logged in)
      const stored = localStorage.getItem("rentrobe_token");
      if (stored) {
        setToken(stored);
        setReady(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { password, token });
      toast.success("Password updated successfully!");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <Lock size={32} className="text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl font-light mb-4">Invalid Link</h1>
          <p className="text-sm text-muted-foreground font-body font-light mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/auth" className="text-primary text-sm font-body underline">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/">
            <h1 className="font-display text-4xl font-light tracking-wide">
              RENT<span className="text-primary">ROBE</span>
            </h1>
          </Link>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-body font-light mt-1">
            Reset Password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-body font-light">
          <Link to="/auth" className="underline hover:text-foreground transition-colors">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
