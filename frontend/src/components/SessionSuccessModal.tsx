import React, { useEffect } from 'react';
import { CheckCircle, Calendar, Users, X, Eye, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionSuccessModalProps {
  sessionTitle: string;
  scheduledAt: string;
  maxParticipants: number;
  onClose: () => void;
}

const SessionSuccessModal: React.FC<SessionSuccessModalProps> = ({ 
  sessionTitle, 
  scheduledAt, 
  maxParticipants, 
  onClose 
}) => {
  const navigate = useNavigate();

  // Bloqueia o scroll do body quando o modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    // Adiciona listener para tecla ESC
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleViewSessions = () => {
    onClose();
    navigate('/sessions');
  };

  const handleCreateAnother = () => {
    onClose();
    // Permanece na mesma página
  };

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="session-success-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
          maxWidth: '520px',
          width: 'calc(100% - 2rem)',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente de sucesso */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decoração de fundo */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />

          {/* Close Button */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Fechar"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              color: 'white',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.75rem',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
              zIndex: 10,
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          {/* Success Icon */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              backdropFilter: 'blur(10px)',
              animation: 'scaleIn 0.5s ease-out 0.2s both'
            }}>
              <CheckCircle size={48} color="white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 0.5rem 0',
            position: 'relative',
            textAlign: 'center'
          }}>
            Sessão Criada! 🎉
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.95)',
            margin: 0,
            position: 'relative',
            textAlign: 'center'
          }}>
            Sua sessão está publicada e pronta para inscrições
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Session Info Card */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#166534',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Calendar size={20} />
              Detalhes da Sessão
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '0.25rem'
                }}>
                  Título:
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#166534',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {sessionTitle}
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '1.5rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid #bbf7d0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: '500' }}>
                    {new Date(scheduledAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: '500' }}>
                    Até {maxParticipants} participantes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#dbeafe',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <Share2 size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
            <p style={{
              fontSize: '0.875rem',
              color: '#1e3a8a',
              margin: 0,
              lineHeight: '1.5'
            }}>
              <strong>Sua sessão já está visível</strong> para todos os aprendizes na plataforma!
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { label: 'Inscritos', value: '0', color: '#3b82f6' },
              { label: 'Visualizações', value: '0', color: '#8b5cf6' },
              { label: 'Status', value: 'Ativa', color: '#10b981' }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '0.875rem',
                  textAlign: 'center'
                }}
              >
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: stat.color,
                  margin: '0 0 0.25rem 0'
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleViewSessions}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
              }}
            >
              <Eye size={20} />
              Ver Minhas Sessões
            </button>
            
            <button
              onClick={handleCreateAnother}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '12px',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Criar Outra Sessão
            </button>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            textAlign: 'center',
            margin: '1rem 0 0 0'
          }}>
            Você receberá notificações quando alguém se inscrever
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Garantir que o modal fique acima de tudo */
        body.modal-open {
          overflow: hidden;
        }

        @media (max-width: 640px) {
          /* Em telas pequenas, ajusta o padding e tamanho do modal */
          .session-success-modal {
            width: calc(100% - 1rem) !important;
            max-height: 95vh !important;
          }
        }
      `}</style>
    </>
  );
};

export default SessionSuccessModal;


