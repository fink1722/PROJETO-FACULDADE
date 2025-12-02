// Tipos base do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Apenas para mock, não enviar ao backend
  avatar?: string;
  profileImageUrl?: string; // <-- ADICIONE ESTA LINHA
  role: 'admin' | 'user' | 'mentor';
  userType?: 'mentor' | 'aprendiz'; // Tipo de usuário específico
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos específicos do sistema de mentoria
export interface Mentor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profileImageUrl?: string; // <-- ADICIONE ESTA LINHA
  bio: string;
  specialties: string[];
  experience: number; // anos de experiência
  rating: number;
  totalSessions: number;
  hourlyRate?: number;
  availability: Availability[];
  languages: string[];
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Mentee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profileImageUrl?: string; // <-- ADICIONE ESTA LINHA
  bio?: string;
  goals: string[];
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  preferredLanguages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId?: string;
  title: string;
  description: string;
  topic?: string;
  scheduledAt: Date;
  duration: number; // em minutos
  maxParticipants?: number;
  currentParticipants?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'upcoming' | 'live';
  meetingLink?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  requirements?: string[];
  objectives?: string[];
  documents?: string[]; // IDs dos documentos
  hasDocuments?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  sessionId: string;
  mentorId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'zip' | 'code' | 'image' | 'video' | 'other';
  fileSize: number; // em bytes
  downloadCount: number;
  viewCount: number;
  uploadedAt: Date;
  tags?: string[];
  isPublic: boolean; // se está disponível para todos ou só para participantes
  language?: string; // para arquivos de código
  thumbnailUrl?: string; // preview/thumbnail
}

export interface Availability {
  id: string;
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'career' | 'leadership' | 'communication' | 'technical' | 'personal';
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  progress: number; // 0-100
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  categories: {
    communication: number;
    expertise: number;
    helpfulness: number;
    punctuality: number;
  };
  createdAt: Date;
}

export interface MatchingCriteria {
  specialties?: string[];
  experience?: {
    min?: number;
    max?: number;
  };
  rating?: {
    min?: number;
  };
  languages?: string[];
  availability?: {
    dayOfWeek?: number;
    timeRange?: {
      start: string;
      end: string;
    };
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// Tipos para formulários
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// Tipos para componentes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}
