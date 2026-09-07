import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from storage
    const u = authService.getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const signUp = useCallback(async (payload) => {
    const created = await authService.signUp(payload);
    // auto login after signup
    const u = await authService.login({ identifier: created.email, password: payload.password, remember: true });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (!user) return null;
    const updated = await authService.updateProfile(user.id, patch);
    setUser(updated);
    return updated;
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signUp,
    logout,
    updateProfile,
  }), [user, loading, login, signUp, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
