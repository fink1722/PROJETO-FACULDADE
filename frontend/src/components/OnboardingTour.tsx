import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const OnboardingTour: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, previousStep, skipOnboarding, completeOnboarding } = useOnboarding();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.target);
      
      if (!targetElement) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipElement = tooltipRef.current;
      
      if (!tooltipElement) return;

      const tooltipRect = tooltipElement.getBoundingClientRect();
      const spacing = 20;
      
      let top = 0;
      let left = 0;
      let calculatedPlacement = step.placement || 'bottom';

      // Calcular posição baseada no placement
      switch (calculatedPlacement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - spacing;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = targetRect.bottom + spacing;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - spacing;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + spacing;
          break;
      }

      // Ajustar se sair da tela
      const padding = 10;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) {
        top = targetRect.bottom + spacing;
        calculatedPlacement = 'bottom';
      }
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = targetRect.top - tooltipRect.height - spacing;
        calculatedPlacement = 'top';
      }

      setPosition({ top, left });
      setPlacement(calculatedPlacement);

      // Highlight do elemento alvo
      targetElement.classList.add('onboarding-highlight');
      
      return () => {
        targetElement.classList.remove('onboarding-highlight');
      };
    };

    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      
      // Limpar highlight
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)'
        }}
        onClick={skipOnboarding}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999,
          maxWidth: '400px',
          minWidth: '300px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '1.5rem',
          animation: 'fadeInScale 0.3s ease-out',
          border: '2px solid #f97316'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={skipOnboarding}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div style={{ marginRight: '2rem' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 0.75rem 0',
            lineHeight: '1.3'
          }}>
            {currentStepData.title}
          </h3>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            margin: '0 0 1.5rem 0',
            lineHeight: '1.6'
          }}>
            {currentStepData.content}
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: index <= currentStep ? '#f97316' : '#e5e7eb',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {/* Counter */}
          <span style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {currentStep + 1} de {steps.length}
          </span>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isFirstStep && (
              <button
                onClick={previousStep}
                style={{
                  padding: '0.625rem 1rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>
            )}
            
            <button
              onClick={isLastStep ? completeOnboarding : nextStep}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(249, 115, 22, 0.3)';
              }}
            >
              {isLastStep ? (
                <>
                  Finalizar
                  <Check size={16} />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            backgroundColor: 'white',
            border: '2px solid #f97316',
            transform: 'rotate(45deg)',
            ...(placement === 'top' && {
              bottom: '-10px',
              left: '50%',
              marginLeft: '-8px',
              borderTop: 'none',
              borderLeft: 'none'
            }),
            ...(placement === 'bottom' && {
              top: '-10px',
              left: '50%',
              marginLeft: '-8px',
              borderBottom: 'none',
              borderRight: 'none'
            }),
            ...(placement === 'left' && {
              right: '-10px',
              top: '50%',
              marginTop: '-8px',
              borderLeft: 'none',
              borderBottom: 'none'
            }),
            ...(placement === 'right' && {
              left: '-10px',
              top: '50%',
              marginTop: '-8px',
              borderRight: 'none',
              borderTop: 'none'
            })
          }}
        />
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .onboarding-highlight {
          position: relative;
          z-index: 9997 !important;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.5) !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
      `}</style>
    </>
  );
};

export default OnboardingTour;

