import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const documentService = {
  // Listar documentos
  async getAll(params?: { sessionId?: string; limit?: number; offset?: number }) {
    const response = await api.get(API_ENDPOINTS.DOCUMENTS, { params });
    return response.data;
  },

  // Buscar documento por ID
  async getById(id: string) {
    const response = await api.get(API_ENDPOINTS.DOCUMENT_BY_ID(id));
    return response.data;
  },

  // Criar documento
  async create(data: any) {
    const response = await api.post(API_ENDPOINTS.DOCUMENTS, data);
    return response.data;
  },

  // Atualizar documento
  async update(id: string, data: any) {
    const response = await api.put(API_ENDPOINTS.DOCUMENT_BY_ID(id), data);
    return response.data;
  },

  // Deletar documento
  async delete(id: string) {
    const response = await api.delete(API_ENDPOINTS.DOCUMENT_BY_ID(id));
    return response.data;
  },

  // Incrementar contador de downloads
  async incrementDownload(id: string) {
    const response = await api.post(API_ENDPOINTS.DOCUMENT_DOWNLOAD(id));
    return response.data;
  },
};
