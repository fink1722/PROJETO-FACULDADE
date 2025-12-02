import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { Sparkles, GraduationCap, Users, X } from 'lucide-react';

interface WelcomeModalProps {
  userType: 'mentor' | 'aprendiz';
  userName: string;
  userId: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ userType, userName, userId, onClose }) => {
  const { startOnboarding, skipOnboarding } = useOnboarding();

  const handleStartTour = () => {
    onClose();
    setTimeout(() => {
      startOnboarding(userType, userId);
    }, 300);
  };

  const handleSkip = () => {
    skipOnboarding();
    onClose();
  };

  const isMentor = userType === 'mentor';

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
        onClick={handleSkip}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
        <div style={{
          background: isMentor 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '2rem',
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
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.75rem',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            marginBottom: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            {isMentor ? (
              <Users size={32} color="white" />
            ) : (
              <GraduationCap size={32} color="white" />
            )}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 0.5rem 0',
            position: 'relative'
          }}>
            Olá, {userName}! 👋
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.95)',
            margin: 0,
            position: 'relative'
          }}>
            {isMentor 
              ? 'Que ótimo ter você aqui como mentor!'
              : 'Seja bem-vindo à sua jornada de aprendizado!'
            }
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <p style={{
              fontSize: '0.875rem',
              color: '#92400e',
              margin: 0,
              lineHeight: '1.5'
            }}>
              {isMentor 
                ? 'Preparamos um tour rápido para você conhecer todas as ferramentas para criar e gerenciar suas mentorias!'
                : 'Preparamos um tour rápido para você conhecer como encontrar mentores e participar de sessões incríveis!'
              }
            </p>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              O que você vai aprender:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {isMentor ? (
                <>
                  <FeatureItem text="Como criar e gerenciar sessões de mentoria" />
                  <FeatureItem text="Onde encontrar seus aprendizes e mensagens" />
                  <FeatureItem text="Como configurar seu perfil profissional" />
                  <FeatureItem text="Onde acompanhar suas estatísticas e impacto" />
                </>
              ) : (
                <>
                  <FeatureItem text="Como buscar e escolher mentores ideais" />
                  <FeatureItem text="Onde encontrar sessões abertas" />
                  <FeatureItem text="Como agendar e participar de mentorias" />
                  <FeatureItem text="Onde acompanhar seu progresso e metas" />
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSkip}
              style={{
                flex: 1,
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
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              Pular
            </button>
            
            <button
              onClick={handleStartTour}
              style={{
                flex: 2,
                padding: '0.875rem 1.5rem',
                background: isMentor
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isMentor
                  ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                  : '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isMentor
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = isMentor
                  ? '0 6px 8px -1px rgba(16, 185, 129, 0.4)'
                  : '0 6px 8px -1px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isMentor
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isMentor
                  ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                  : '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
              }}
            >
              Começar Tour 🚀
            </button>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            textAlign: 'center',
            margin: '1rem 0 0 0'
          }}>
            Leva apenas 2 minutos • Você pode pular a qualquer momento
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
      `}</style>
    </>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#dcfce7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
        <path d="M1 5L4.5 8.5L11 1.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <span style={{
      fontSize: '0.9375rem',
      color: '#374151',
      lineHeight: '1.5'
    }}>
      {text}
    </span>
  </div>
);

export default WelcomeModal;

