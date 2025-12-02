import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const goalService = {
  // Listar metas
  async getAll(params?: { status?: string; limit?: number; offset?: number }) {
    const response = await api.get(API_ENDPOINTS.GOALS, { params });
    return response.data;
  },

  // Buscar meta por ID
  async getById(id: string) {
    const response = await api.get(API_ENDPOINTS.GOAL_BY_ID(id));
    return response.data;
  },

  // Criar meta
  async create(data: any) {
    const response = await api.post(API_ENDPOINTS.GOALS, data);
    return response.data;
  },

  // Atualizar meta
  async update(id: string, data: any) {
    const response = await api.put(API_ENDPOINTS.GOAL_BY_ID(id), data);
    return response.data;
  },

  // Deletar meta
  async delete(id: string) {
    const response = await api.delete(API_ENDPOINTS.GOAL_BY_ID(id));
    return response.data;
  },
};
