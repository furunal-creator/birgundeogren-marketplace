import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// In-memory fallback store (used if API is unavailable)
const userStore: Map<string, { user: User; passwordHash: string }> = new Map();
let nextId = 1000;

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// Simple in-memory token storage (not localStorage - blocked in sandbox)
let memToken: string | null = null;
let memUser: User | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(memUser);
  const [token, setToken] = useState<string | null>(memToken);
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);

  // On mount, try to restore session from API if we have a token in memory
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedToken = memToken;
    if (!savedToken) return;

    // Verify token with API
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const userData = await res.json();
          const u: User = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            role: userData.role,
          };
          setUser(u);
          memUser = u;
        } else {
          // Token invalid, clear
          setToken(null);
          setUser(null);
          memToken = null;
          memUser = null;
        }
      })
      .catch(() => {
        // API unavailable, keep memory state
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try API first
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          const u: User = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role,
          };
          setToken(data.token);
          setUser(u);
          memToken = data.token;
          memUser = u;
          return;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "E-posta veya şifre hatalı.");
        }
      } catch (apiErr: any) {
        // If it's a user-facing error (not a network error), rethrow
        if (apiErr.message && !apiErr.message.includes("fetch") && !apiErr.message.includes("network")) {
          throw apiErr;
        }
        // Network error: fallback to in-memory store
        await new Promise(r => setTimeout(r, 300));
        const stored = userStore.get(email.toLowerCase());
        if (!stored) {
          throw new Error("Bu e-posta adresiyle kayıtlı hesap bulunamadı.");
        }
        if (stored.passwordHash !== simpleHash(password)) {
          throw new Error("E-posta veya şifre hatalı.");
        }
        const tok = `token_${stored.user.id}_${Date.now()}`;
        setToken(tok);
        setUser(stored.user);
        memToken = tok;
        memUser = stored.user;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    setIsLoading(true);
    try {
      // Try API first
      try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            phone: registerData.phone,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const u: User = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role,
          };
          setToken(data.token);
          setUser(u);
          memToken = data.token;
          memUser = u;
          return;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Kayıt sırasında bir hata oluştu.");
        }
      } catch (apiErr: any) {
        if (apiErr.message && !apiErr.message.includes("fetch") && !apiErr.message.includes("network")) {
          throw apiErr;
        }
        // Network error: fallback to in-memory
        await new Promise(r => setTimeout(r, 300));
        const emailKey = registerData.email.toLowerCase();
        if (userStore.has(emailKey)) {
          throw new Error("Bu e-posta adresi zaten kayıtlı.");
        }
        const newUser: User = {
          id: nextId++,
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phone: registerData.phone,
          role: "STUDENT",
        };
        userStore.set(emailKey, {
          user: newUser,
          passwordHash: simpleHash(registerData.password),
        });
        const tok = `token_${newUser.id}_${Date.now()}`;
        setToken(tok);
        setUser(newUser);
        memToken = tok;
        memUser = newUser;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    memToken = null;
    memUser = null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
