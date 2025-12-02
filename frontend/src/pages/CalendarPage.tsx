import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Calendar from '../components/ui/Calendar';
import { sessionService, mentorService } from '../services';
import type { Session } from '../types';
import { formatDate, formatTime, getStatusText } from '../utils/sessionUtils';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  X,
  Info,
  CalendarDays,
  Video
} from 'lucide-react';

const CalendarPage: React.FC = () => {
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar sessões da API - sempre busca apenas as inscritas
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando sessões inscritas');
      const [sessionsResponse, mentorsResponse] = await Promise.all([
        sessionService.getMyEnrolled(),
        mentorService.getAll()
      ]);
      console.log('📊 Sessões inscritas recebidas:', sessionsResponse.data?.length, 'sessões');
      setSessions(sessionsResponse.data || []);
      setMentors(mentorsResponse.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarregar dados quando navegar para esta página
  useEffect(() => {
    fetchData();
  }, [fetchData, location.pathname]);

  // Filtrar sessões do mês atual e futuras
  const currentSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduledAt);
    const now = new Date();
    return sessionDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1);
  });

  const handleDateClick = (date: Date, sessions: Session[]) => {
    setSelectedDate(date);
    setSelectedSessions(sessions);
    setSelectedSession(null);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  const handleCloseDetails = () => {
    setSelectedSession(null);
    setSelectedDate(null);
    setSelectedSessions([]);
  };

  const getSessionMentor = (session: Session) => {
    return mentors.find(mentor => mentor.id === session.mentorId);
  };

  return (
    <div className="dashboard-container" style={{ 
      maxHeight: 'calc(100vh - 80px)', 
      overflowY: 'auto',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '0.5rem 0'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(249, 115, 22, 0.3)'
            }}>
              <CalendarDays size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Calendário de Sessões
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Visualize todas as suas sessões agendadas em um calendário
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Suas sessões inscritas - Gerencie seus compromissos e acompanhe suas próximas mentorias
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-grid" style={{ width: '100%', maxWidth: '100%' }}>

        {/* Left Column - Calendar */}
        <div className="content-column" style={{ minWidth: 0 }}>
          {loading ? (
            <Card>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #f3f4f6',
                  borderTopColor: '#f97316',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Carregando calendário...</p>
              </div>
            </Card>
          ) : (
            <Calendar
              sessions={currentSessions}
              onDateClick={handleDateClick}
              onSessionClick={handleSessionClick}
            />
          )}
        </div>

        {/* Right Column - Details */}
        <div 
          className="sidebar-column" 
          style={{ 
            maxHeight: 'calc(100vh - 200px)', 
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          
          {/* Selected Date Info */}
          {selectedDate && !selectedSession && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {formatDate(selectedDate)}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {selectedSessions.length} sessão(ões) neste dia
                  </p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  style={{
                    padding: '0.25rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#111827';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {selectedSessions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: '#9ca3af'
                }}>
                  <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>Nenhuma sessão agendada neste dia</p>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem'
                }}>
                  {selectedSessions.map(session => {
                    const mentor = getSessionMentor(session);
                    return (
                      <div
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        style={{
                          padding: '1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#f97316';
                          e.currentTarget.style.backgroundColor = '#fff7ed';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.5rem'
                        }}>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 0.25rem 0',
                            flex: 1
                          }}>
                            {session.title}
                          </h4>
                          <Badge
                            variant={
                              session.status === 'upcoming' ? 'info' :
                              session.status === 'live' ? 'success' :
                              session.status === 'completed' ? 'default' : 'error'
                            }
                            size="sm"
                          >
                            {getStatusText(session.status)}
                          </Badge>
                        </div>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {mentor?.name || 'Mentor'}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            <span>{formatTime(new Date(session.scheduledAt))}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={12} />
                            <span>{session.duration}min</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Session Details */}
          {selectedSession && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {selectedSession.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Badge
                      variant={
                        selectedSession.status === 'upcoming' ? 'info' :
                        selectedSession.status === 'live' ? 'success' :
                        selectedSession.status === 'completed' ? 'default' : 'error'
                      }
                      size="sm"
                    >
                      {getStatusText(selectedSession.status)}
                    </Badge>
                    {selectedSession.topic && (
                      <Badge variant="info" size="sm">
                        {selectedSession.topic}
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  style={{
                    padding: '0.25rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#111827';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mentor Info */}
              {(() => {
                const mentor = getSessionMentor(selectedSession);
                return mentor && (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: '0 0 0.5rem 0',
                      fontWeight: '500'
                    }}>
                      MENTOR
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#111827',
                      margin: 0,
                      fontWeight: '600'
                    }}>
                      {mentor.name}
                    </p>
                  </div>
                );
              })()}

              {/* Session Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    <CalendarIcon size={16} style={{ color: '#6b7280' }} />
                    <span>{formatDate(new Date(selectedSession.scheduledAt))}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    <Clock size={16} style={{ color: '#6b7280' }} />
                    <span>{formatTime(new Date(selectedSession.scheduledAt))} ({selectedSession.duration} minutos)</span>
                  </div>
                  {selectedSession.maxParticipants && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}>
                      <Users size={16} style={{ color: '#6b7280' }} />
                      <span>{selectedSession.currentParticipants || 0}/{selectedSession.maxParticipants} participantes</span>
                    </div>
                  )}
                  {selectedSession.meetingLink && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#2563eb'
                    }}>
                      <MapPin size={16} />
                      <a 
                        href={selectedSession.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#2563eb',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        Link da reunião
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 0.5rem 0'
                }}>
                  Descrição
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {selectedSession.description}
                </p>
              </div>

              {/* Objectives */}
              {selectedSession.objectives && selectedSession.objectives.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Info size={16} />
                    Objetivos
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {selectedSession.objectives.map((objective, index) => (
                      <li key={index} style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        paddingLeft: '1.5rem',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          color: '#f97316'
                        }}>•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botão de Entrar na Reunião */}
              {selectedSession.meetingLink && (
                <Button
                  variant="primary"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem'
                  }}
                  onClick={() => {
                    if (selectedSession.meetingLink) {
                      window.open(selectedSession.meetingLink, '_blank');
                    }
                  }}
                >
                  <Video size={20} />
                  Entrar na Reunião
                </Button>
              )}
            </Card>
          )}

          {/* No Selection */}
          {!selectedDate && !selectedSession && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Info size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Selecione uma data
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                Clique em um dia do calendário para ver as sessões agendadas ou clique em uma sessão para ver os detalhes
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;

