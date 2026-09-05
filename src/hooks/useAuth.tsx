import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";

interface AppUser {
  id: string;
  email: string;
  role?: string;
}

interface AppSession {
  user: AppUser;
}

interface AuthContextType {
  session: AppSession | null;
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Decode JWT payload without verifying signature */
const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
};

const tokenToUser = (token: string): AppUser | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: payload.sub || payload.userId || payload.id || "",
    email: payload.email || "",
    role: payload.role,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("rentrobe_token");
    if (token) {
      const decoded = tokenToUser(token);
      setUser(decoded);
    }
    setLoading(false);
  }, []);

  const session: AppSession | null = user ? { user } : null;

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data } = await api.post("/api/auth/register", { email, password, fullName });
      const token: string = data.token;
      localStorage.setItem("rentrobe_token", token);
      const decoded = tokenToUser(token);
      setUser(decoded);
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message || "Registration failed" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      const token: string = data.token;
      localStorage.setItem("rentrobe_token", token);
      const decoded = tokenToUser(token);
      setUser(decoded);
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message || "Login failed" };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("rentrobe_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
