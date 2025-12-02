import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { sessionService, mentorService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { formatDate, formatTime, getStatusText } from '../utils/sessionUtils';
import {
  Calendar,
  Clock,
  Users,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Plus,
  CheckCircle
} from 'lucide-react';
import type { Session } from '../types';

const MentorSessionsManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Buscar mentorId do usuário atual
  useEffect(() => {
    const fetchMentorId = async () => {
      if (!user) return;

      try {
        const mentorsResponse = await mentorService.getAll();
        const mentor = mentorsResponse.data?.find((m: any) => m.userId === user.id);

        if (mentor) {
          setMentorId(mentor.id);
        }
      } catch (error) {
        console.error('Erro ao buscar mentor:', error);
      }
    };

    fetchMentorId();
  }, [user]);

  // Buscar sessões do mentor
  useEffect(() => {
    const fetchSessions = async () => {
      if (!mentorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await sessionService.getAll({ mentorId });
        setSessions(response.data || []);
      } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        toast.error('Erro ao carregar sessões');
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchSessions();
    }
  }, [mentorId, toast]);

  const handleDelete = async (sessionId: string, sessionTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a sessão "${sessionTitle}"?`)) {
      return;
    }

    try {
      setDeletingId(sessionId);
      await sessionService.delete(sessionId);

      // Remover da lista
      setSessions(sessions.filter(s => s.id !== sessionId));

      toast.success('Sessão excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir sessão');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = () => {
    // Navegar para página de edição (a ser implementada)
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleView = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  if (loading) {
    return (
      <Card style={{
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Carregando sessões...</p>
      </Card>
    );
  }

  if (!mentorId) {
    return (
      <Card style={{
        padding: '2rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280' }}>Perfil de mentor não encontrado</p>
      </Card>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Minhas Sessões ({sessions.length})
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.25rem 0 0 0'
          }}>
            Gerencie as sessões que você criou
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/sessions/create')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }}
        >
          <Plus size={16} />
          Nova Sessão
        </Button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card style={{
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <Calendar size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <h4 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Nenhuma sessão criada
          </h4>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '1.5rem'
          }}>
            Crie sua primeira sessão de mentoria e comece a ajudar aprendizes!
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/sessions/create')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
            }}
          >
            <Plus size={16} />
            Criar Primeira Sessão
          </Button>
        </Card>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {sessions.map(session => (
            <Card
              key={session.id}
              style={{
                padding: '1.25rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                {/* Session Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}>
                      {session.title}
                    </h4>
                    <Badge
                      variant={
                        session.status === 'upcoming' || session.status === 'scheduled' ? 'info' :
                        session.status === 'live' ? 'success' :
                        session.status === 'completed' ? 'default' : 'warning'
                      }
                      size="sm"
                    >
                      {getStatusText(session.status)}
                    </Badge>
                  </div>

                  {session.description && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      margin: '0 0 0.75rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {session.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={14} />
                      <span>{formatDate(session.scheduledAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={14} />
                      <span>{formatTime(session.scheduledAt)} ({session.duration}min)</span>
                    </div>
                    {session.maxParticipants && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Users size={14} />
                        <span>{session.currentParticipants || 0}/{session.maxParticipants}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexShrink: 0
                }}>
                  <button
                    onClick={() => handleView(session.id)}
                    style={{
                      padding: '0.5rem',
                      minWidth: 'auto',
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>

                  {(session.status === 'scheduled' || session.status === 'upcoming') && (
                    <>
                      <button
                        onClick={handleEdit}
                        style={{
                          padding: '0.5rem',
                          minWidth: 'auto',
                          color: '#3b82f6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Editar sessão"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(session.id, session.title)}
                        disabled={deletingId === session.id}
                        style={{
                          padding: '0.5rem',
                          minWidth: 'auto',
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: deletingId === session.id ? 'not-allowed' : 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s',
                          opacity: deletingId === session.id ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== session.id) {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Excluir sessão"
                      >
                        {deletingId === session.id ? (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #ef4444',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </>
                  )}

                  {session.status === 'completed' && (
                    <CheckCircle size={16} style={{ color: '#10b981', margin: '0.5rem' }} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSessionsManager;
