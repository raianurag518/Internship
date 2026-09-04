'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, LoginDTO, RegisterDTO } from '@/types/auth';
interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) { const data = await res.json(); setUser(data.user); } else { setUser(null); }
    } catch (e) { setUser(null); } finally { setLoading(false); }
  };
  useEffect(() => { refreshUser(); }, []);
  const login = async (data: LoginDTO) => {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Login failed');
    setUser(resData.user);
  };
  const register = async (data: RegisterDTO) => {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Registration failed');
    setUser(resData.user);
  };
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); };
  const switchDemoUser = async (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    let email = 'student@stanford.edu';
    let password = 'Student@1234';
    if (role === 'ORGANIZER') { email = 'organizer@campusconnect.demo'; password = 'Organizer@1234'; }
    else if (role === 'ADMIN') { email = 'admin@campusconnect.demo'; password = 'Admin@1234'; }
    await login({ email, password });
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchDemoUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
