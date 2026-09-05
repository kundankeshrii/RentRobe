import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { loginSchema, signupSchema, forgotSchema } from "@/lib/validations";

const inputClass =
  "w-full px-4 py-3 border border-border bg-background text-sm font-body font-light focus:outline-none focus:border-primary transition-colors";
const errorClass = "text-xs text-destructive font-body mt-1";

// Simple rate limiter for login attempts
const loginAttempts: { count: number; resetAt: number } = { count: 0, resetAt: 0 };
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

// Password strength checker
const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score === 3) return { score, label: "Good", color: "bg-yellow-400" };
  return { score, label: "Strong", color: "bg-green-500" };
};

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const validate = (): boolean => {
    try {
      if (mode === "forgot") forgotSchema.parse({ email });
      else if (mode === "signup") signupSchema.parse({ name, email, password });
      else if (mode === "login") loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const now = Date.now();
        if (now > loginAttempts.resetAt) {
          loginAttempts.count = 0;
          loginAttempts.resetAt = now + LOCKOUT_MS;
        }
        if (loginAttempts.count >= MAX_LOGIN_ATTEMPTS) {
          toast.error("Too many login attempts. Please wait a minute.");
          setLoading(false);
          return;
        }
        loginAttempts.count++;
      }

      if (mode === "forgot") {
        try {
          await api.post("/api/auth/reset-password", { email });
          toast.success("Password reset link sent! Check your email.");
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to send reset link.");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error);
        } else {
          toast.success("Account created! You are now signed in.");
          const redirectUrl = sessionStorage.getItem("rentrobe_redirect_url");
          if (redirectUrl) {
            sessionStorage.removeItem("rentrobe_redirect_url");
            navigate(redirectUrl);
          } else {
            navigate("/dashboard");
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error);
        } else {
          const redirectUrl = sessionStorage.getItem("rentrobe_redirect_url");
          if (redirectUrl) {
            sessionStorage.removeItem("rentrobe_redirect_url");
            navigate(redirectUrl);
          } else {
            navigate("/dashboard");
          }
        }
      }
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80" alt="Fashion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <Link to="/"><span className="font-display text-3xl tracking-widest font-light text-primary-foreground">RENT<span className="opacity-70">ROBE</span></span></Link>
          <p className="mt-4 font-display text-4xl text-primary-foreground font-light italic leading-tight">"Wear designer.<br />Spend less.<br />Return guilt-free."</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden block mb-12"><span className="font-display text-2xl tracking-widest font-light">RENT<span className="text-primary">ROBE</span></span></Link>

          {mode !== "forgot" && (
            <div className="flex border-b border-border mb-10">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setFieldErrors({}); }}
                  className={`flex-1 pb-4 text-xs tracking-widest uppercase font-body font-light transition-colors ${mode === m ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"}`}>
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          <div className="mb-8">
            <h1 className="font-display text-4xl font-light">
              {mode === "login" ? "Welcome back" : mode === "signup" ? "Join RentRobe" : "Reset Password"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground font-body font-light">
              {mode === "login" ? "Sign in to access your account and rentals." : mode === "signup" ? "Create an account to start renting designer fashion." : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Sophie Laurent" />
                {fieldErrors.name && <p className={errorClass}>{fieldErrors.name}</p>}
              </div>
            )}
            <div>
              <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
              {fieldErrors.email && <p className={errorClass}>{fieldErrors.email}</p>}
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="text-xs tracking-widest uppercase font-body font-light text-muted-foreground block mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <p className={errorClass}>{fieldErrors.password}</p>}
                {mode === "signup" && password && (() => {
                  const { score, label, color } = getPasswordStrength(password);
                  return (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= score ? color : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-body ${
                        score <= 1 ? "text-red-500" :
                        score === 2 ? "text-orange-400" :
                        score === 3 ? "text-yellow-500" :
                        "text-green-500"
                      }`}>
                        {label} password
                        {score <= 2 && " — Use uppercase, numbers & special characters (e.g. @, #, !)"}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode("forgot"); setFieldErrors({}); }} className="text-xs text-primary font-body font-light underline">Forgot password?</button>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-body font-medium hover:opacity-90 transition-colors disabled:opacity-50">
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground font-body font-light">
            {mode === "forgot" ? (
              <button onClick={() => { setMode("login"); setFieldErrors({}); }} className="text-primary underline">Back to sign in</button>
            ) : mode === "login" ? (
              <>Don't have an account? <button onClick={() => { setMode("signup"); setFieldErrors({}); }} className="text-primary underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode("login"); setFieldErrors({}); }} className="text-primary underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
