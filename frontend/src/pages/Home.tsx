import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton, SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { sessionService, mentorService } from '../services';
import type { Session, Mentor } from '../types';
import { formatDate, formatTime, getStatusText } from '../utils/sessionUtils';
import {
  Calendar,
  Clock,
  Users,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  Target,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sessionsResponse, mentorsResponse] = await Promise.all([
          sessionService.getAll(),
          mentorService.getAll({ limit: 4, sortBy: 'rating' })
        ]);

        setSessions(sessionsResponse.data || []);
        setMentors(mentorsResponse.data || []);
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookSession = useCallback((mentorId: string) => {
    // Redirecionar para página de sessões filtrando pelo mentor selecionado
    navigate(`/sessions?mentorId=${mentorId}`);
  }, [navigate]);

  const handleViewDetails = useCallback((sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  }, [navigate]);

  const handleViewAllSessions = useCallback(() => {
    navigate('/sessions');
  }, [navigate]);

  // Dados organizados
  const upcomingSessions = sessions.filter(session => session.status === 'upcoming').slice(0, 3);
  const recentSessions = sessions.filter(session => session.status === 'completed').slice(0, 3);
  const recommendedMentors = mentors.slice(0, 4);

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '2rem' }}>
          <Skeleton width="200px" height={32} borderRadius="8px" style={{ marginBottom: '2rem' }} />
          <SkeletonList count={3} CardComponent={SkeletonCard} />
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
            Erro ao Carregar Dashboard
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
              <LayoutDashboard size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Dashboard
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Acompanhe seu progresso e gerencie suas sessões
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Visão geral das suas atividades e próximas oportunidades de aprendizado
          </p>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={24} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>3</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Sessões Agendadas</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} style={{ color: '#16a34a' }} />
              <span style={{ color: '#16a34a', fontSize: '0.875rem' }}>+2% vs mês anterior</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={24} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>5</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Tutores Favoritos</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} style={{ color: '#16a34a' }} />
              <span style={{ color: '#16a34a', fontSize: '0.875rem' }}>+1% vs mês anterior</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={24} style={{ color: '#d97706' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>2h</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Próxima Sessão</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Hoje às 14:00</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#e9d5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Target size={24} style={{ color: '#9333ea' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>24h</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>Horas Estudadas</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} style={{ color: '#16a34a' }} />
              <span style={{ color: '#16a34a', fontSize: '0.875rem' }}>+8% vs mês anterior</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}
      className="responsive-grid">
        
        {/* Left Column - Primary Content (8 columns) */}
        <div style={{
          gridColumn: 'span 8',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          
          {/* Upcoming Sessions */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar size={20} style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    Próximas Sessões
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Suas sessões agendadas para esta semana
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllSessions}
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  color: '#ea580c',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(249, 115, 22, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.1)';
                }}
              >
                Ver Todas
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingSessions.map((session) => {
                const mentor = mentors.find(m => m.id === session.mentorId);
                return (
                  <div key={session.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    border: '1px solid #f1f5f9',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                    <Avatar
                      src={mentor?.avatar}
                      name={mentor?.name || 'Mentor'}
                      size="lg"
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0', lineHeight: 1.4 }}>
                        {session.title}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                        {mentor?.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(session.scheduledAt)}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatTime(session.scheduledAt)}</span>
                        <Badge variant="info" size="sm">
                          {getStatusText(session.status)}
                        </Badge>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleViewDetails(session.id)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          borderRadius: '12px',
                          padding: '0.5rem 1rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <Play size={16} />
                        Iniciar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Sessions */}
          <Card className="section-card">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon section-icon-green">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="section-title">Sessões Recentes</h2>
                  <p className="section-subtitle">Suas últimas sessões concluídas</p>
                </div>
              </div>
            </div>
            
            <div className="recent-sessions">
              {recentSessions.map((session) => {
                const mentor = mentors.find(m => m.id === session.mentorId);
                return (
                  <div key={session.id} className="recent-session-item">
                    <Avatar
                      src={mentor?.avatar}
                      name={mentor?.name || 'Mentor'}
                      size="md"
                      className="recent-avatar"
                    />
                    <div className="recent-content">
                      <h4 className="recent-title">{session.title}</h4>
                      <p className="recent-mentor">{mentor?.name} • {formatDate(session.scheduledAt)}</p>
                    </div>
                    <div className="recent-status">
                      <Badge variant="success" size="sm">
                        Concluída
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar (4 columns) */}
        <div style={{
          gridColumn: 'span 4',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          

          {/* Progress Overview */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e3a8a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <TrendingUp size={20} style={{ color: '#2563eb' }} />
                Progresso Acadêmico
              </h3>
            </div>
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {[
                { subject: 'Matemática', percentage: 75, color: '#2563eb', bgColor: '#dbeafe' },
                { subject: 'Programação', percentage: 60, color: '#16a34a', bgColor: '#dcfce7' },
                { subject: 'Inglês', percentage: 40, color: '#d97706', bgColor: '#fef3c7' },
                { subject: 'Design', percentage: 85, color: '#9333ea', bgColor: '#e9d5ff' }
              ].map((item, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      {item.subject}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: item.color,
                      padding: '0.125rem 0.5rem',
                      backgroundColor: item.bgColor,
                      borderRadius: '0.375rem'
                    }}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#f1f5f9',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                      borderRadius: '9999px',
                      width: `${item.percentage}%`,
                      transition: 'width 0.5s ease',
                      boxShadow: `0 0 8px ${item.color}40`
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Mentors */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#065f46',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users size={20} style={{ color: '#16a34a' }} />
                Novos Tutores
              </h3>
            </div>
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {recommendedMentors.map((mentor) => (
                <div key={mentor.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}>
                  <Avatar
                    src={mentor.avatar}
                    name={mentor.name}
                    size="md"
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#111827',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {mentor.name}
                    </h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {mentor.specialties[0]}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {mentor.rating}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    style={{
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#2563eb',
                      fontWeight: '600',
                      borderRadius: '12px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    onClick={() => handleBookSession(mentor.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                    }}
                  >
                    <Calendar size={14} />
                    Agendar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;