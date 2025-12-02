// Configuração da API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',

  // Mentors
  MENTORS: '/mentors',
  MENTOR_BY_ID: (id: string) => `/mentors/${id}`,
  MENTOR_SPECIALTIES: '/mentors/specialties',

  // Sessions
  SESSIONS: '/sessions',
  SESSION_BY_ID: (id: string) => `/sessions/${id}`,
  SESSION_JOIN: (id: string) => `/sessions/${id}/join`,
  SESSION_LEAVE: (id: string) => `/sessions/${id}/leave`,
  MY_ENROLLED_SESSIONS: '/sessions/my/enrolled',

  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
  DOCUMENT_DOWNLOAD: (id: string) => `/documents/${id}/download`,

  // Goals
  GOALS: '/goals',
  GOAL_BY_ID: (id: string) => `/goals/${id}`,
} as const;
