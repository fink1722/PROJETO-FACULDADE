import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const sessionService = {
  // Listar sessões
  async getAll(params?: { status?: string; mentorId?: string; limit?: number; offset?: number }) {
    const response = await api.get(API_ENDPOINTS.SESSIONS, { params });
    return response.data;
  },

  // Buscar sessão por ID
  async getById(id: string) {
    const response = await api.get(API_ENDPOINTS.SESSION_BY_ID(id));
    return response.data;
  },

  // Criar sessão
  async create(data: any) {
    const response = await api.post(API_ENDPOINTS.SESSIONS, data);
    return response.data;
  },

  // Atualizar sessão
  async update(id: string, data: any) {
    const response = await api.put(API_ENDPOINTS.SESSION_BY_ID(id), data);
    return response.data;
  },

  // Deletar sessão
  async delete(id: string) {
    const response = await api.delete(API_ENDPOINTS.SESSION_BY_ID(id));
    return response.data;
  },

  // Inscrever-se em sessão
  async join(id: string) {
    const response = await api.post(API_ENDPOINTS.SESSION_JOIN(id));
    return response.data;
  },

  // Desinscrever-se de sessão
  async leave(id: string) {
    const response = await api.post(API_ENDPOINTS.SESSION_LEAVE(id));
    return response.data;
  },

  // Buscar sessões inscritas pelo usuário
  async getMyEnrolled() {
    const response = await api.get(API_ENDPOINTS.MY_ENROLLED_SESSIONS);
    return response.data;
  },
};
