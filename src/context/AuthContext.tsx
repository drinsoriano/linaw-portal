import React, { createContext, useContext, useState } from "react";
import type { AppUser, UserRole } from "../types";
import { ROLE_LOGIN_PRESETS } from "../data/users";

interface AuthContextValue {
  user: AppUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  canEdit: () => boolean;
  canValidate: () => boolean;
  canAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem("linaw_user");
      return stored ? (JSON.parse(stored) as AppUser) : null;
    } catch {
      return null;
    }
  });

  const login = (role: UserRole) => {
    const u = ROLE_LOGIN_PRESETS[role];
    setUser(u);
    localStorage.setItem("linaw_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("linaw_user");
  };

  const hasRole = (...roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const canEdit = () =>
    hasRole("SYSTEM_ADMIN", "BARANGAY_ENCODER");

  const canValidate = () =>
    hasRole("SYSTEM_ADMIN", "CENRO_EVALUATOR");

  const canAdmin = () =>
    hasRole("SYSTEM_ADMIN");

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        hasRole,
        canEdit,
        canValidate,
        canAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
