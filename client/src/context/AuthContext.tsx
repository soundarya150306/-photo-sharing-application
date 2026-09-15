import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  quickDemoLogin: (type?: 'ADMIN' | 'TEAM_1' | 'TEAM_2' | 'TEAM_3') => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lumina_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.data.success) {
          setUser(res.data.data.user);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('lumina_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('lumina_auth_token');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (type: 'ADMIN' | 'TEAM_1' | 'TEAM_2' | 'TEAM_3' = 'ADMIN'): Promise<User | null> => {
    setIsLoading(true);
    try {
      // 1. Try dedicated fast 1-click demo endpoint (auto-seeds if needed)
      const res = await api.demoLogin(type);
      if (res.data?.success && res.data?.data) {
        const { token: newToken, user: newUser } = res.data.data;
        login(newToken, newUser);
        return newUser;
      }
    } catch (err) {
      console.warn('Dedicated demo login attempt, falling back to standard login:', err);
    }

    // 2. Fallback to standard login
    try {
      let email = 'admin@lumina.photos';
      let password = 'Admin@123456';

      if (type === 'TEAM_1') {
        email = 'photographer1@lumina.photos';
        password = 'Team@123456';
      } else if (type === 'TEAM_2') {
        email = 'photographer2@lumina.photos';
        password = 'Team@123456';
      } else if (type === 'TEAM_3') {
        email = 'photographer3@lumina.photos';
        password = 'Team@123456';
      }

      const res = await api.login({ email, password });
      if (res.data?.success && res.data?.data) {
        const { token: newToken, user: newUser } = res.data.data;
        login(newToken, newUser);
        return newUser;
      }
    } catch (fallbackError) {
      console.error('Quick demo login error:', fallbackError);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickDemoLogin }}>
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
