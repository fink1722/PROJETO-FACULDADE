import api from './api';
import { API_ENDPOINTS } from '../config/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: 'mentor' | 'aprendiz';
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    token: string;
  };
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);

    // Salvar token e usuário no localStorage
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  // Registro
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.REGISTER, data);

    // Salvar token e usuário no localStorage
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  // Buscar dados do usuário autenticado
  async me() {
    const response = await api.get(API_ENDPOINTS.ME);
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obter usuário do localStorage
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Atualizar perfil do usuário
  async updateProfile(data: { name?: string; email?: string; profileImageUrl?: string }) {
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, data);

    // Atualizar usuário no localStorage
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }

    return response.data;
  },
};
