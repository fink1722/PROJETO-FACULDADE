import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const mentorService = {
  // Listar todos os mentores
  async getAll(params?: { search?: string; limit?: number; offset?: number }) {
    const response = await api.get(API_ENDPOINTS.MENTORS, { params });
    return response.data;
  },

  // Buscar mentor por ID
  async getById(id: string) {
    const response = await api.get(API_ENDPOINTS.MENTOR_BY_ID(id));
    return response.data;
  },

  // Atualizar mentor
  async update(id: string, data: any) {
    const response = await api.put(API_ENDPOINTS.MENTOR_BY_ID(id), data);
    return response.data;
  },

  // Listar especialidades
  async getSpecialties() {
    const response = await api.get(API_ENDPOINTS.MENTOR_SPECIALTIES);
    return response.data;
  },
};
