import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { sessionService, mentorService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { SkeletonSessionCard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import type { Session, Mentor } from '../types';
import { formatDate, getStatusText } from '../utils/sessionUtils';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search,
  Filter,
  Play,
  Eye,
  CheckCircle,
  CalendarDays,
  CalendarPlus,
  BookOpen,
  AlertCircle,
  UserPlus
} from 'lucide-react';

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToastContext();
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'completed' | 'scheduled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);

  // Ler mentorId da query string ao carregar a página
  useEffect(() => {
    const mentorIdParam = searchParams.get('mentorId');
    if (mentorIdParam) {
      setSelectedMentorId(mentorIdParam);
      toast.info(`Mostrando sessões do mentor selecionado`);
    }
  }, [searchParams, toast]);

  // Buscar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar sessões com filtro opcional por mentorId
        const sessionsResponse = await sessionService.getAll({
          status: filterStatus === 'all' ? undefined : filterStatus,
          mentorId: selectedMentorId || undefined
        });

        // Buscar mentores
        const mentorsResponse = await mentorService.getAll();

        setSessions(sessionsResponse.data || []);
        setMentors(mentorsResponse.data || []);
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar sessões. Verifique se o backend está rodando.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterStatus, selectedMentorId]);

  // Filtrar sessões por termo de busca (client-side)
  const filteredSessions = sessions.filter(session => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.title.toLowerCase().includes(searchLower) ||
        session.description.toLowerCase().includes(searchLower) ||
        session.topic?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleJoinSession = async (sessionId: string) => {
    try {
      await sessionService.join(sessionId);
      alert('Entrada na sessão realizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao entrar na sessão:', error);
      alert(error.response?.data?.message || 'Erro ao entrar na sessão');
    }
  };

  const handleSubscribe = async (sessionId: string) => {
    if (!isAuthenticated || !user) {
      toast.warning('Você precisa estar logado para se inscrever em uma sessão');
      navigate('/login');
      return;
    }

    try {
      setJoiningSessionId(sessionId);
      console.log('[SessionsPage] Tentando inscrever-se na sessão:', sessionId);
      
      const response = await sessionService.join(sessionId);
      
      if (response.success) {
        // Atualizar estado local imediatamente
        setSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === sessionId 
              ? { 
                  ...s, 
                  isEnrolled: true, 
                  currentParticipants: response.data?.currentParticipants ?? (s.currentParticipants ?? 0) + 1
                }
              : s
          )
        );
        
        // Recarregar sessões para garantir sincronização completa
        setTimeout(async () => {
          try {
            const sessionsResponse = await sessionService.getAll({
              status: filterStatus === 'all' ? undefined : filterStatus
            });
            setSessions(sessionsResponse.data || []);
          } catch (err) {
            console.error('Erro ao recarregar sessões:', err);
          }
        }, 500);
        
        // Feedback visual com Toast
        toast.success(response.message || 'Inscrição realizada com sucesso!');
      } else {
        toast.error(response.message || 'Erro ao se inscrever na sessão');
      }
    } catch (error: any) {
      console.error('[SessionsPage] Erro ao se inscrever:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao se inscrever na sessão';
      console.error('[SessionsPage] Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
        sessionId
      });
      
      // Mensagens de erro mais específicas
      let userFriendlyMessage = errorMessage;
      if (error.response?.status === 400) {
        if (errorMessage.includes('não aceita inscrições')) {
          userFriendlyMessage = 'Esta sessão não aceita inscrições. Entre em contato com o mentor.';
        } else if (errorMessage.includes('cheia')) {
          userFriendlyMessage = 'Esta sessão está cheia. Tente outra sessão.';
        } else if (errorMessage.includes('já está inscrito')) {
          userFriendlyMessage = 'Você já está inscrito nesta sessão.';
        } else if (errorMessage.includes('mentor não pode')) {
          userFriendlyMessage = 'Você não pode se inscrever em sua própria sessão.';
        }
      }
      
      toast.error(userFriendlyMessage);
    } finally {
      setJoiningSessionId(null);
    }
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  // Calcular contadores
  const allSessionsCount = sessions.length;
  const upcomingCount = sessions.filter(s => s.status === 'upcoming').length;
  const liveCount = sessions.filter(s => s.status === 'live').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length;

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem',
            marginBottom: '2rem' 
          }}>
            <SkeletonSessionCard />
            <SkeletonSessionCard />
            <SkeletonSessionCard />
            <SkeletonSessionCard />
          </div>
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
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem' }}>
            Erro ao Carregar Sessões
          </h3>
          <p style={{ color: '#dc2626', marginBottom: '1.5rem' }}>{error}</p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none'
            }}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Header Section */}
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
              <BookOpen size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Sessões de Mentoria
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Participe de sessões abertas e aprenda com profissionais experientes
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Explore, filtre e gerencie todas as sessões disponíveis no sistema
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button 
            variant="outline" 
            size="sm"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              color: '#f97316',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Filter size={16} />
            Filtros Avançados
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{upcomingCount}</div>
            <div className="stat-label">Próximas Sessões</div>
            <div className="stat-trend">
              <span style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: '500' }}>
                Abertas para inscrição
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Play size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{liveCount}</div>
            <div className="stat-label">Ao Vivo</div>
            <div className="stat-trend">
              <span style={{ fontSize: '0.875rem', color: '#16a34a', fontWeight: '500' }}>
                Acontecendo agora
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Concluídas</div>
            <div className="stat-trend">
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                Histórico
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <CalendarPlus size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{scheduledCount}</div>
            <div className="stat-label">Agendadas</div>
            <div className="stat-trend">
              <span style={{ fontSize: '0.875rem', color: '#9333ea', fontWeight: '500' }}>
                Sessões individuais
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '1rem'
      }}
      className="sessions-grid"
      >
        
        {/* Left Column - Results */}
        <div className="sidebar-column">
          
          {/* Results Summary */}
          <div className="sidebar-card">
            <div className="sidebar-header">
              <h3 className="sidebar-title">Resultados</h3>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                {filteredSessions.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Sessão(ões) encontrada(s)
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem' 
          }}>
            {filteredSessions.length === 0 ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <EmptyState
                  type="sessions"
                  actionLabel={searchTerm || filterStatus !== 'all' ? 'Limpar Filtros' : undefined}
                  onAction={() => {
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                />
              </div>
            ) : (
              filteredSessions.map((session) => {
                const mentor = mentors.find(m => m.id === session.mentorId);
                const isMentorOfSession = user?.userType === 'mentor' && mentor?.userId === user?.id;

                return (
                  <div
                    key={session.id}
                    className="enhanced-card"
                    style={{
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                        <Avatar
                          src={mentor?.avatar}
                          name={mentor?.name || 'Mentor'}
                          size="md"
                          style={{ flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            justifyContent: 'space-between',
                            marginBottom: '0.375rem',
                            gap: '0.5rem'
                          }}>
                            <h4 style={{
                              fontWeight: '600',
                              color: '#111827',
                              fontSize: '0.9375rem',
                              margin: 0,
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {session.title}
                            </h4>
                            <Badge 
                              variant={
                                session.status === 'upcoming' ? 'info' : 
                                session.status === 'live' ? 'success' : 
                                session.status === 'completed' ? 'default' : 'warning'
                              }
                              size="sm"
                              style={{ flexShrink: 0 }}
                            >
                              {getStatusText(session.status)}
                            </Badge>
                          </div>
                          <p style={{ 
                            fontSize: '0.8125rem', 
                            color: '#64748b', 
                            margin: '0 0 0.375rem 0',
                            fontWeight: '500'
                          }}>
                            {mentor?.name || 'Mentor'}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            margin: 0
                          }}>
                            {session.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Topic Badge */}
                      {session.topic && (
                        <div style={{ marginBottom: '0.875rem' }}>
                          <Badge variant="info" size="sm">
                            {session.topic}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Meta Info */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '0.875rem',
                        flex: 1
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CalendarDays size={13} style={{ color: '#64748b' }} />
                          <span style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: '500' }}>
                            {formatDate(session.scheduledAt)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={13} style={{ color: '#64748b' }} />
                          <span style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: '500' }}>
                            {session.duration}min
                          </span>
                        </div>
                        {session.maxParticipants && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={13} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: '500' }}>
                              {session.currentParticipants || 0}/{session.maxParticipants}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        {session.status === 'live' && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            style={{ 
                              flex: 1,
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '0.8125rem',
                              padding: '0.5rem 0.875rem'
                            }}
                            onClick={() => handleJoinSession(session.id)}
                          >
                            <Play size={14} />
                            Entrar
                          </Button>
                        )}
                        
                        {(session.status === 'upcoming' || session.status === 'scheduled') && !isMentorOfSession && (
                          <>
                            {session.isEnrolled ? (
                              <Button
                                variant="success"
                                size="sm"
                                disabled
                                style={{
                                  flex: 1,
                                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                  border: 'none',
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '0.8125rem',
                                  padding: '0.5rem 0.875rem',
                                  cursor: 'not-allowed',
                                  opacity: 0.8
                                }}
                              >
                                <CheckCircle size={16} style={{ marginRight: '4px' }} />
                                Inscrito
                              </Button>
                            ) : session.maxParticipants && session.currentParticipants !== undefined && session.currentParticipants >= session.maxParticipants ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                style={{
                                  flex: 1,
                                  background: '#f3f4f6',
                                  border: '1px solid #d1d5db',
                                  color: '#6b7280',
                                  fontWeight: '600',
                                  fontSize: '0.8125rem',
                                  padding: '0.5rem 0.875rem',
                                  cursor: 'not-allowed'
                                }}
                              >
                                <AlertCircle size={16} style={{ marginRight: '4px' }} />
                                Sessão Cheia
                              </Button>
                            ) : !session.maxParticipants ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                style={{
                                  flex: 1,
                                  background: '#f3f4f6',
                                  border: '1px solid #d1d5db',
                                  color: '#6b7280',
                                  fontWeight: '600',
                                  fontSize: '0.8125rem',
                                  padding: '0.5rem 0.875rem',
                                  cursor: 'not-allowed'
                                }}
                              >
                                <AlertCircle size={16} style={{ marginRight: '4px' }} />
                                Não Aceita Inscrições
                              </Button>
                            ) : !isAuthenticated ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/login')}
                                style={{
                                  flex: 1,
                                  background: 'transparent',
                                  border: '1px solid #f97316',
                                  color: '#f97316',
                                  fontWeight: '600',
                                  fontSize: '0.8125rem',
                                  padding: '0.5rem 0.875rem'
                                }}
                              >
                                <UserPlus size={16} style={{ marginRight: '4px' }} />
                                Fazer Login
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={joiningSessionId === session.id}
                                style={{
                                  flex: 1,
                                  background: joiningSessionId === session.id 
                                    ? '#d1d5db' 
                                    : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                  border: 'none',
                                  color: 'white',
                                  fontWeight: '600',
                                  boxShadow: joiningSessionId === session.id ? 'none' : '0 4px 6px -1px rgba(249, 115, 22, 0.3), 0 2px 4px -1px rgba(249, 115, 22, 0.2)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  fontSize: '0.8125rem',
                                  padding: '0.5rem 0.875rem',
                                  cursor: joiningSessionId === session.id ? 'not-allowed' : 'pointer',
                                  opacity: joiningSessionId === session.id ? 0.7 : 1
                                }}
                                onClick={() => handleSubscribe(session.id)}
                                onMouseEnter={(e) => {
                                  if (joiningSessionId !== session.id) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(249, 115, 22, 0.4), 0 4px 8px -2px rgba(249, 115, 22, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (joiningSessionId !== session.id) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.3), 0 2px 4px -1px rgba(249, 115, 22, 0.2)';
                                  }
                                }}
                              >
                                {joiningSessionId === session.id ? (
                                  <>
                                    <svg style={{ animation: 'spin 1s linear infinite', width: '16', height: '16', marginRight: '4px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Inscrevendo...
                                  </>
                                ) : (
                                  <>
                                    <CalendarPlus size={16} style={{ marginRight: '4px' }} />
                                    Inscrever-se
                                  </>
                                )}
                              </Button>
                            )}
                          </>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            color: '#f97316',
                            fontWeight: '600',
                            padding: '0.5rem',
                            minWidth: 'auto'
                          }}
                          onClick={() => handleViewDetails(session.id)}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Search and Filters */}
        <div className="content-column">
          
          {/* Search Card */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon section-icon-blue">
                  <Search size={20} />
                </div>
                <div>
                  <h2 className="section-title">Buscar Sessões</h2>
                  <p className="section-subtitle">
                    Encontre sessões que correspondem ao seu interesse
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Buscar por título, descrição ou tópico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{
                    paddingLeft: '2.75rem',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon section-icon-green">
                  <Filter size={20} />
                </div>
                <div>
                  <h2 className="section-title">Filtros</h2>
                  <p className="section-subtitle">
                    Filtre por status das sessões
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { value: 'all', label: 'Todas as Sessões', count: allSessionsCount },
                  { value: 'upcoming', label: 'Próximas', count: upcomingCount },
                  { value: 'live', label: 'Ao Vivo', count: liveCount },
                  { value: 'completed', label: 'Concluídas', count: completedCount },
                  { value: 'scheduled', label: 'Agendadas', count: scheduledCount }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value as any)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      borderRadius: '12px',
                      textAlign: 'left',
                      background: filterStatus === filter.value 
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)'
                        : '#f9fafb',
                      border: filterStatus === filter.value 
                        ? '1px solid rgba(249, 115, 22, 0.4)' 
                        : '1px solid #e5e7eb',
                      color: filterStatus === filter.value ? '#f97316' : '#374151',
                      fontWeight: filterStatus === filter.value ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filterStatus === filter.value 
                        ? '0 2px 4px rgba(249, 115, 22, 0.15)' 
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (filterStatus !== filter.value) {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (filterStatus !== filter.value) {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <span>{filter.label}</span>
                    <Badge 
                      variant={filterStatus === filter.value ? 'warning' : 'info'} 
                      size="sm"
                    >
                      {filter.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS para animação do spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SessionsPage;
