import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { mockDocuments } from '../data/mockData';
import { sessionService, mentorService } from '../services';
import DocumentCard from '../components/DocumentCard';
import DocumentUploadModal from '../components/DocumentUploadModal';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatTime, getStatusText } from '../utils/sessionUtils';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  Share2,
  Heart,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  Settings,
  Link as LinkIcon,
  ArrowLeft,
  Video,
  MessageSquare,
  UserPlus,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  FileText,
  Download,
  Upload,
  X,
  Trash2
} from 'lucide-react';

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Buscar sessão e mentor da API
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);

        // Buscar sessão
        const sessionResponse = await sessionService.getById(id!);
        const sessionData = sessionResponse.data;
        setSession(sessionData);
        setIsSubscribed(sessionData.isEnrolled || false);

        // Buscar mentor
        if (sessionData.mentorId) {
          const mentorResponse = await mentorService.getById(sessionData.mentorId);
          setMentor(mentorResponse.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSessionData();
    }
  }, [id]);

  // Encontrar documentos desta sessão
  const sessionDocuments = mockDocuments.filter(doc => doc.sessionId === id);

  // Verificar se usuário atual é o mentor desta sessão
  // Comparar com mentor.userId (pois session.mentorId é o ID do mentor, não do usuário)
  const isMentorOfSession = user?.userType === 'mentor' && mentor?.userId === user?.id;

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
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="dashboard-container">
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem'
        }}>
          <AlertCircle size={64} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Sessão não encontrada
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            A sessão que você está procurando não existe ou foi removida.
          </p>
          <Button variant="primary" onClick={() => navigate('/sessions')}>
            Voltar para Sessões
          </Button>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    try {
      await sessionService.join(id!);
      setIsSubscribed(true);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);

      // Recarregar dados da sessão para atualizar currentParticipants
      const sessionResponse = await sessionService.getById(id!);
      setSession(sessionResponse.data);
    } catch (error: any) {
      console.error('Erro ao se inscrever:', error);
      alert(error.response?.data?.message || 'Erro ao se inscrever na sessão');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await sessionService.leave(id!);
      setIsSubscribed(false);
      alert('Inscrição cancelada com sucesso!');

      // Recarregar dados da sessão para atualizar currentParticipants
      const sessionResponse = await sessionService.getById(id!);
      setSession(sessionResponse.data);
    } catch (error: any) {
      console.error('Erro ao cancelar inscrição:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar inscrição');
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await sessionService.delete(id!);
      alert('Sessão excluída com sucesso!');
      navigate('/sessions');
    } catch (error: any) {
      console.error('Erro ao excluir sessão:', error);
      alert(error.response?.data?.message || 'Erro ao excluir sessão');
    }
  };

  const handleJoinSession = () => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: session.title,
        text: session.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const availableSpots = session.maxParticipants 
    ? session.maxParticipants - (session.currentParticipants || 0)
    : null;

  return (
    <>
      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          sessionId={id}
          mentorId={user?.id || ''}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 3000);
          }}
        />
      )}

      <div className="dashboard-container">
      
      {/* Success Message */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 10000,
          padding: '1rem 1.5rem',
          backgroundColor: '#dcfce7',
          border: '2px solid #16a34a',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideInRight 0.3s ease-out',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <CheckCircle size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <p style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#166534', 
              margin: 0
            }}>
              Inscrição realizada com sucesso! 🎉
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/sessions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
            padding: '0.5rem 1rem'
          }}
        >
          <ArrowLeft size={20} />
          Voltar para Sessões
        </Button>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}
      className="session-detail-grid">
        
        {/* Left Column - Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Status Banner */}
            {session.status === 'live' && (
              <div style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Sessão ao vivo agora
                </span>
              </div>
            )}

            <div style={{ padding: '2rem' }}>
              {/* Topic Badge */}
              {session.topic && (
                <div style={{ marginBottom: '1rem' }}>
                  <Badge variant="info" size="sm">
                    {session.topic}
                  </Badge>
                </div>
              )}

              {/* Title */}
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                {session.title}
              </h1>

              {/* Meta Info */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.9375rem', color: '#374151', fontWeight: '500' }}>
                    {formatDate(session.scheduledAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.9375rem', color: '#374151', fontWeight: '500' }}>
                    {formatTime(session.scheduledAt)} • {session.duration} min
                  </span>
                </div>
                {session.maxParticipants && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.9375rem', color: '#374151', fontWeight: '500' }}>
                      {session.currentParticipants || 0}/{session.maxParticipants} inscritos
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <Badge 
                variant={
                  session.status === 'upcoming' ? 'info' : 
                  session.status === 'live' ? 'success' : 
                  session.status === 'completed' ? 'default' : 'warning'
                }
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                {getStatusText(session.status)}
              </Badge>
            </div>
          </Card>

          {/* Description Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
              borderLeft: '4px solid #f97316'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#7c2d12',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BookOpen size={20} style={{ color: '#f97316' }} />
                Sobre a Sessão
              </h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{
                fontSize: '1rem',
                color: '#374151',
                lineHeight: '1.8',
                margin: 0
              }}>
                {session.description}
              </p>
            </div>
          </Card>

          {/* Requirements Card */}
          {session.requirements && session.requirements.length > 0 && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                borderLeft: '4px solid #f97316'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#7c2d12',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Settings size={20} style={{ color: '#f97316' }} />
                  Requisitos
                </h2>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {session.requirements.map((req, index) => (
                    <li key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: '#fff7ed',
                      borderRadius: '0.75rem',
                      border: '1px solid #fed7aa'
                    }}>
                      <CheckCircle size={20} style={{ color: '#f97316', flexShrink: 0, marginTop: '0.125rem' }} />
                      <span style={{ fontSize: '0.9375rem', color: '#9a3412', lineHeight: '1.5' }}>
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Objectives Card */}
          {session.objectives && session.objectives.length > 0 && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                borderLeft: '4px solid #f97316'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#7c2d12',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Target size={20} style={{ color: '#f97316' }} />
                  Objetivos de Aprendizado
                </h2>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {session.objectives.map((obj, index) => (
                    <li key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '0.75rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      <Target size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: '0.125rem' }} />
                      <span style={{ fontSize: '0.9375rem', color: '#15803d', lineHeight: '1.5' }}>
                        {obj}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Documents Card - Apenas para sessões concluídas */}
          {session.status === 'completed' && (sessionDocuments.length > 0 || isMentorOfSession) && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                borderLeft: '4px solid #f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#7c2d12',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FileText size={20} style={{ color: '#f97316' }} />
                    Materiais da Sessão
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#9a3412',
                    margin: '0.25rem 0 0 0'
                  }}>
                    {sessionDocuments.length} {sessionDocuments.length === 1 ? 'documento disponível' : 'documentos disponíveis'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isMentorOfSession && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowUploadModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        fontSize: '0.8125rem'
                      }}
                    >
                      <Upload size={14} />
                      Upload Documento
                    </Button>
                  )}
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {sessionDocuments.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    {sessionDocuments.map(document => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #e5e7eb'
                  }}>
                    <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '1rem'
                    }}>
                      {isMentorOfSession 
                        ? 'Nenhum documento compartilhado ainda. Faça upload de materiais para seus aprendizes!' 
                        : 'Nenhum documento disponível para esta sessão no momento.'}
                    </p>
                    {isMentorOfSession && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowUploadModal(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                        }}
                      >
                        <Upload size={16} />
                        Fazer Upload
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '2px solid #f97316',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(249, 115, 22, 0.1)',
            position: 'sticky',
            top: '1rem'
          }}>
            <div style={{ padding: '1.5rem' }}>
              {availableSpots !== null && availableSpots > 0 && (
                <div style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: availableSpots < 5 ? '#fef3c7' : '#dcfce7',
                  borderRadius: '12px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Sparkles size={20} style={{ color: availableSpots < 5 ? '#f59e0b' : '#16a34a' }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: availableSpots < 5 ? '#92400e' : '#166534'
                  }}>
                    {availableSpots < 5 ? `Apenas ${availableSpots} vagas restantes!` : `${availableSpots} vagas disponíveis`}
                  </span>
                </div>
              )}

              {session.status === 'live' ? (
                <Button
                  variant="success"
                  onClick={handleJoinSession}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1rem',
                    padding: '1rem 1.5rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Video size={20} />
                  Entrar na Sessão Ao Vivo
                </Button>
              ) : (session.status === 'upcoming' || session.status === 'scheduled') && !isMentorOfSession ? (
                <>
                  {!isSubscribed ? (
                    <Button
                      variant="primary"
                      onClick={handleSubscribe}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                        padding: '1rem 1.5rem',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <UserPlus size={20} />
                      Inscrever-se na Sessão
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Button
                        variant="success"
                        disabled
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1rem',
                          padding: '1rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          opacity: 1
                        }}
                      >
                        <CheckCircle size={20} />
                        Inscrito
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleUnsubscribe}
                        style={{
                          width: '100%',
                          border: '2px solid #ef4444',
                          color: '#ef4444',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          padding: '0.75rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <X size={18} />
                        Cancelar Inscrição
                      </Button>
                    </div>
                  )}
                </>
              ) : null}

              {/* Botão de Excluir Sessão - apenas para o mentor */}
              {isMentorOfSession && (
                <Button
                  variant="outline"
                  onClick={handleDeleteSession}
                  style={{
                    width: '100%',
                    border: '2px solid #dc2626',
                    color: '#dc2626',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    padding: '0.75rem 1.5rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={18} />
                  Excluir Sessão
                </Button>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem'
                  }}
                >
                  <Share2 size={18} />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  style={{
                    padding: '0.75rem',
                    minWidth: 'auto'
                  }}
                >
                  <Heart size={18} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Mentor Card */}
          {mentor && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                borderLeft: '4px solid #f97316'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#7c2d12',
                  margin: 0
                }}>
                  Sobre o Mentor
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <Avatar name={mentor.name} size="lg" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {mentor.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                        {mentor.rating}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        ({mentor.totalSessions} sessões)
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={16} style={{ color: '#f97316' }} />
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {mentor.experience} anos de experiência
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  {mentor.bio}
                </p>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {mentor.specialties.slice(0, 4).map((specialty, index) => (
                    <Badge key={index} variant="secondary" size="sm">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/mentors/${mentor.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600'
                  }}
                >
                  Ver Perfil Completo
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Info Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
              borderLeft: '4px solid #f97316'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#7c2d12',
                margin: 0
              }}>
                Informações Rápidas
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} style={{ color: '#f97316' }} />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                      Duração
                    </span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {session.duration} minutos
                  </span>
                </div>

                {session.maxParticipants && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} style={{ color: '#f97316' }} />
                      <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                        Participantes
                      </span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                      {session.currentParticipants || 0} / {session.maxParticipants}
                    </span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} style={{ color: '#f97316' }} />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                      Formato
                    </span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    Online
                  </span>
                </div>

                {session.meetingLink && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.75rem',
                    border: '1px solid #93c5fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <LinkIcon size={18} style={{ color: '#2563eb' }} />
                      <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>
                        Link da Reunião
                      </span>
                    </div>
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.75rem',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        display: 'block'
                      }}
                    >
                      {session.meetingLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1024px) {
          .session-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      </div>
    </>
  );
};

export default SessionDetailPage;


