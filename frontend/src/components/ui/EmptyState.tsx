import React from 'react';
import { Button } from './Button';
import {
  Search,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  Inbox,
  BookOpen,
  UserCircle,
} from 'lucide-react';

export type EmptyStateType =
  | 'sessions'
  | 'mentors'
  | 'documents'
  | 'search'
  | 'generic'
  | 'calendar'
  | 'users';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const defaultConfigs: Record<EmptyStateType, { icon: React.ReactNode; title: string; message: string }> = {
  sessions: {
    icon: <Calendar size={48} />,
    title: 'Nenhuma sessão encontrada',
    message: 'Não há sessões disponíveis no momento. Tente ajustar os filtros ou volte mais tarde.',
  },
  mentors: {
    icon: <UserCircle size={48} />,
    title: 'Nenhum mentor encontrado',
    message: 'Não há mentores disponíveis no momento. Tente ajustar os filtros de busca.',
  },
  documents: {
    icon: <FileText size={48} />,
    title: 'Nenhum documento encontrado',
    message: 'Não há documentos disponíveis para esta sessão ainda.',
  },
  search: {
    icon: <Search size={48} />,
    title: 'Nenhum resultado encontrado',
    message: 'Não encontramos resultados para sua busca. Tente usar termos diferentes ou ajustar os filtros.',
  },
  calendar: {
    icon: <Calendar size={48} />,
    title: 'Nenhuma sessão agendada',
    message: 'Você não tem sessões agendadas para este período.',
  },
  users: {
    icon: <Users size={48} />,
    title: 'Nenhum usuário encontrado',
    message: 'Não há usuários disponíveis no momento.',
  },
  generic: {
    icon: <Inbox size={48} />,
    title: 'Nada por aqui',
    message: 'Não há conteúdo disponível no momento.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  const config = defaultConfigs[type];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          color: '#9ca3af',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {displayIcon}
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 0.5rem 0',
        }}
      >
        {displayTitle}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: '0 0 1.5rem 0',
          maxWidth: '400px',
          lineHeight: '1.5',
        }}
      >
        {displayMessage}
      </p>

      {onAction && actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

interface EmptyStateCardProps extends EmptyStateProps {
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = (props) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <EmptyState {...props} />
    </div>
  );
};

