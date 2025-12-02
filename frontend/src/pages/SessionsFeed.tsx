import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService, mentorService } from '../services';
import type { Session, Mentor } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Star,
  ChevronRight,
  X,
  Video,
  CalendarPlus,
  Trash2
} from 'lucide-react';

const SessionsFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTopics, setSessionTopics] = useState<string[]>([]);

  // Buscar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[SessionsFeed] Buscando dados da API...');

        const [sessionsResponse, mentorsResponse] = await Promise.all([
          sessionService.getAll(),
          mentorService.getAll()
        ]);

        console.log('[SessionsFeed] Resposta de sessões:', sessionsResponse);
        console.log('[SessionsFeed] Resposta de mentores:', mentorsResponse);

        setSessions(sessionsResponse.data || []);
        setMentors(mentorsResponse.data || []);

        console.log('[SessionsFeed] Sessões carregadas:', sessionsResponse.data?.length || 0);
        console.log('[SessionsFeed] Mentores carregados:', mentorsResponse.data?.length || 0);

        // Extrair tópicos únicos das sessões
        const sessionsList = sessionsResponse.data || [];
        const topics = [...new Set(sessionsList.map((s: Session) => s.topic).filter(Boolean))];
        setSessionTopics(topics as string[]);

        console.log('[SessionsFeed] Dados carregados com sucesso!');
      } catch (err: any) {
        console.error('[SessionsFeed] Erro ao buscar dados:', err);
        console.error('[SessionsFeed] Detalhes do erro:', err.response?.data || err.message);
        setError(`Erro ao carregar sessões: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar sessões abertas (scheduled, upcoming e live)
  const openSessions = sessions.filter(session => {
    return session.status === 'scheduled' || session.status === 'upcoming' || session.status === 'live';
  });

  // Aplicar filtros
  const filteredSessions = openSessions.filter(session => {
    const matchesSearch = searchTerm === '' ||
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTopic = selectedTopic === '' || session.topic === selectedTopic;

    const matchesDate = selectedDate === '' ||
      new Date(session.scheduledAt).toISOString().split('T')[0] === selectedDate;

    return matchesSearch && matchesTopic && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTopic('');
    setSelectedDate('');
  };

  const handleSubscribe = async (sessionId: string) => {
    try {
      await sessionService.join(sessionId);
      alert('Inscrição realizada com sucesso!');
      // Recarregar sessões
      const [sessionsResponse, mentorsResponse] = await Promise.all([
        sessionService.getAll(),
        mentorService.getAll()
      ]);
      setSessions(sessionsResponse.data || []);
      setMentors(mentorsResponse.data || []);
    } catch (error: any) {
      console.error('Erro ao se inscrever:', error);
      alert(error.response?.data?.message || 'Erro ao se inscrever na sessão');
    }
  };

  const handleUnsubscribe = async (sessionId: string) => {
    try {
      await sessionService.leave(sessionId);
      alert('Inscrição cancelada com sucesso!');
      // Recarregar sessões
      const [sessionsResponse, mentorsResponse] = await Promise.all([
        sessionService.getAll(),
        mentorService.getAll()
      ]);
      setSessions(sessionsResponse.data || []);
      setMentors(mentorsResponse.data || []);
    } catch (error: any) {
      console.error('Erro ao cancelar inscrição:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar inscrição');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await sessionService.delete(sessionId);
      alert('Sessão excluída com sucesso!');
      // Recarregar sessões
      const [sessionsResponse, mentorsResponse] = await Promise.all([
        sessionService.getAll(),
        mentorService.getAll()
      ]);
      setSessions(sessionsResponse.data || []);
      setMentors(mentorsResponse.data || []);
    } catch (error: any) {
      console.error('Erro ao excluir sessão:', error);
      alert(error.response?.data?.message || 'Erro ao excluir sessão');
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Data inválida';

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(dateObj);
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Hora inválida';

    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getAvailableSpots = (session: any) => {
    if (!session.maxParticipants) return null;
    const available = session.maxParticipants - (session.currentParticipants || 0);
    return available;
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
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
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Carregando sessões...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#fef2f2',
          borderRadius: '12px',
          border: '1px solid #fee2e2'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem' }}>
            Erro ao Carregar Sessões
          </h3>
          <p style={{ color: '#dc2626', marginBottom: '1.5rem' }}>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

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
              <Video size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Sessões Abertas
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Encontre sessões de mentoria em grupo e conecte-se agora
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Explore e participe de sessões ao vivo ou agendadas com profissionais experientes
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            color: '#6b7280',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(107, 114, 128, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.15) 100%)';
            e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)';
            e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 114, 128, 0.1)';
          }}
        >
          <Filter size={16} />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </header>

      {/* Busca e Filtros */}
      <Card style={{
        marginBottom: '1.5rem',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ padding: '1.5rem' }}>
          {/* Barra de Busca */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <Search size={20} style={{ color: '#9ca3af' }} />
            </div>
            <input
              type="text"
              placeholder="Buscar sessões por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem 0.75rem 2.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316';
                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Filtros Expandidos */}
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              {/* Filtro de Tópico */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Tópico
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e: any) => {
                    e.target.style.borderColor = '#f97316';
                    e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                  }}
                  onBlur={(e: any) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Todos os tópicos</option>
                  {sessionTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Data */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Data
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Botão Limpar */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  style={{ 
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    color: '#6b7280',
                    fontWeight: '600',
                    borderRadius: '12px',
                    padding: '0.5rem 1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(107, 114, 128, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.15) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 114, 128, 0.1)';
                  }}
                >
                  <X size={16} />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}

          {/* Filtros Ativos */}
          {(searchTerm || selectedTopic || selectedDate) && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Busca: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {selectedTopic && (
                <Badge variant="secondary">
                  {selectedTopic}
                  <button onClick={() => setSelectedTopic('')} style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {selectedDate && (
                <Badge variant="secondary">
                  {new Date(selectedDate).toLocaleDateString('pt-BR')}
                  <button onClick={() => setSelectedDate('')} style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Resultados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {filteredSessions.length} {filteredSessions.length === 1 ? 'sessão encontrada' : 'sessões encontradas'}
          </p>
        </div>

        {filteredSessions.length === 0 ? (
          <Card style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px'
          }}>
            <Search size={64} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              Nenhuma sessão encontrada
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const mentor = mentors.find(m => m.id === session.mentorId);
            const availableSpots = getAvailableSpots(session);

            return (
              <Card key={session.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    
                    {/* Data e Hora */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      borderRadius: '16px',
                      padding: '1rem',
                      minWidth: '100px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Calendar size={20} style={{ color: '#2563eb', marginBottom: '0.5rem' }} />
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#1e3a8a'
                      }}>
                        {formatDate(session.scheduledAt)}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#2563eb',
                        marginTop: '0.25rem'
                      }}>
                        {formatTime(session.scheduledAt)}
                      </p>
                    </div>

                    {/* Conteúdo Principal */}
                    <div style={{ flex: 1 }}>
                      {/* Header da Sessão */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: '#111827'
                            }}>
                              {session.title}
                            </h3>
                            {session.status === 'live' && (
                              <Badge variant="success" style={{ animation: 'pulse 2s infinite' }}>
                                🔴 Ao Vivo
                              </Badge>
                            )}
                          </div>
                          {session.topic && (
                            <Badge variant="secondary" size="sm">
                              {session.topic}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Descrição */}
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {session.description}
                      </p>

                      {/* Mentor Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Avatar src={mentor?.avatar} name={mentor?.name || 'Mentor'} size="sm" />
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{mentor?.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{mentor?.rating}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#d1d5db' }}>•</span>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {mentor?.totalSessions} sessões
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Informações */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={16} />
                          <span>{session.duration} min</span>
                        </div>
                        {session.maxParticipants && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={16} />
                            <span>
                              {session.currentParticipants || 0}/{session.maxParticipants} inscritos
                            </span>
                          </div>
                        )}
                        {availableSpots !== null && availableSpots > 0 && (
                          <Badge variant={availableSpots < 5 ? 'warning' : 'success'} size="sm">
                            {availableSpots} {availableSpots === 1 ? 'vaga' : 'vagas'} {availableSpots === 1 ? 'disponível' : 'disponíveis'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Ação */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                      {/* Botão de excluir para o mentor */}
                      {user?.userType === 'mentor' && (() => {
                        const mentor = mentors.find(m => m.id === session.mentorId);
                        return mentor?.userId === user?.id;
                      })() && (
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteSession(session.id)}
                          style={{
                            border: '2px solid #dc2626',
                            color: '#dc2626',
                            fontWeight: '600',
                            borderRadius: '12px',
                            padding: '0.5rem 1rem',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 size={16} />
                          Excluir Sessão
                        </Button>
                      )}

                      {/* Botões de inscrição apenas se NÃO for o mentor */}
                      {(session.status === 'upcoming' || session.status === 'scheduled') && !(() => {
                        if (user?.userType === 'mentor') {
                          const mentor = mentors.find(m => m.id === session.mentorId);
                          return mentor?.userId === user?.id;
                        }
                        return false;
                      })() && (
                        <>
                          {!session.isEnrolled ? (
                            <Button
                              variant="primary"
                              onClick={() => handleSubscribe(session.id)}
                              style={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                border: 'none',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '12px',
                                padding: '0.5rem 1rem',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(249, 115, 22, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <CalendarPlus size={16} />
                              Inscrever-se
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => handleUnsubscribe(session.id)}
                              style={{
                                border: '2px solid #ef4444',
                                color: '#ef4444',
                                fontWeight: '600',
                                borderRadius: '12px',
                                padding: '0.5rem 1rem',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              ✓ Inscrito - Cancelar
                            </Button>
                          )}
                        </>
                      )}

                      <Button
                        variant={session.status === 'live' ? 'primary' : 'outline'}
                        onClick={() => navigate(`/sessions/${session.id}`)}
                        style={{
                          background: session.status === 'live'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'transparent',
                          border: session.status === 'live' ? 'none' : '2px solid #f97316',
                          color: session.status === 'live' ? 'white' : '#f97316',
                          fontWeight: '600',
                          borderRadius: '12px',
                          padding: '0.5rem 1rem',
                          transition: 'all 0.2s ease',
                          boxShadow: session.status === 'live'
                            ? '0 2px 4px rgba(16, 185, 129, 0.3)'
                            : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          if (session.status === 'live') {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                          } else {
                            e.currentTarget.style.backgroundColor = '#fff7ed';
                            e.currentTarget.style.borderColor = '#ea580c';
                          }
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (session.status === 'live') {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                          } else {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#f97316';
                          }
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Ver Detalhes
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SessionsFeed;
