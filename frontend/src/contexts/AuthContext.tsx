// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

// Tipo do contexto de autenticação
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, userType: 'mentor' | 'aprendiz') => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => void;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider do contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // Função de login usando a API real
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Função de registro usando a API real
  const register = async (name: string, email: string, password: string, userType: 'mentor' | 'aprendiz'): Promise<boolean> => {
    try {
      const response = await authService.register({ name, email, password, userType });

      if (response.success) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return false;
    }
  };

  /**
   * Atualiza o usuário logado no estado e no localStorage.
   */
  const updateUser = (data: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const updatedUser = { ...prevUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
