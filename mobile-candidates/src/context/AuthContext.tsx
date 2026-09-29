import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { CandidateUser, LoginPayload, RegisterPayload } from '../types/auth.types';

interface AuthContextType {
  user: CandidateUser | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CandidateUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getStoredSession();
        if (session) {
          setToken(session.token);
          setUser(session.user);
        }
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setToken(result.access_token);
    setUser(result.user);
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
