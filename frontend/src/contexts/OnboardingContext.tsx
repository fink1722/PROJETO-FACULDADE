import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x: number; y: number };
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (userType: 'mentor' | 'aprendiz') => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Steps para Aprendiz
const aprendizSteps: OnboardingStep[] = [
  {
    target: '.sidebar-logo',
    title: '👋 Bem-vindo à Central do Mentor!',
    content: 'Aqui você encontrará mentores experientes para ajudar no seu aprendizado. Vamos fazer um tour rápido!',
    placement: 'bottom'
  },
  {
    target: '[href="/"]',
    title: '🏠 Dashboard',
    content: 'Seu painel principal onde você vê um resumo de suas atividades e próximas sessões.',
    placement: 'right'
  },
  {
    target: '[href="/search-mentors"]',
    title: '🔍 Buscar Mentores',
    content: 'Encontre mentores por especialidade, avaliação e disponibilidade. Use filtros para encontrar o mentor ideal!',
    placement: 'right'
  },
  {
    target: '[href="/sessions-feed"]',
    title: '📅 Sessões Abertas',
    content: 'Veja todas as sessões em grupo disponíveis. Participe de mentorias coletivas sobre diversos temas!',
    placement: 'right'
  },
  {
    target: '[href="/sessions"]',
    title: '📋 Minhas Sessões',
    content: 'Acompanhe suas sessões agendadas, histórico e feedback recebido.',
    placement: 'right'
  },
  {
    target: '[href="/mentee-profile"]',
    title: '👤 Seu Perfil',
    content: 'Configure seu perfil, defina suas metas de aprendizado e acompanhe seu progresso!',
    placement: 'right'
  },
  {
    target: '.header-search',
    title: '🔎 Busca Rápida',
    content: 'Use a busca para encontrar rapidamente mentores, sessões ou conteúdos.',
    placement: 'bottom'
  }
];

// Steps para Mentor
const mentorSteps: OnboardingStep[] = [
  {
    target: '.sidebar-logo',
    title: '👋 Bem-vindo, Mentor!',
    content: 'Obrigado por compartilhar seu conhecimento! Vamos conhecer a plataforma juntos.',
    placement: 'bottom'
  },
  {
    target: '[href="/"]',
    title: '🏠 Dashboard',
    content: 'Seu painel de controle onde você gerencia suas mentorias e acompanha estatísticas.',
    placement: 'right'
  },
  {
    target: '[href="/create-session"]',
    title: '➕ Criar Nova Sessão',
    content: 'Crie sessões individuais ou em grupo. Defina tema, data, duração e número de participantes!',
    placement: 'right'
  },
  {
    target: '[href="/sessions-feed"]',
    title: '📅 Sessões Abertas',
    content: 'Veja todas as suas sessões públicas e gerencie inscrições de aprendizes.',
    placement: 'right'
  },
  {
    target: '[href="/sessions"]',
    title: '📋 Minhas Sessões',
    content: 'Gerencie todas as suas mentorias - passadas, presentes e futuras.',
    placement: 'right'
  },
  {
    target: '[href="/mentor-profile"]',
    title: '👤 Seu Perfil',
    content: 'Configure seu perfil profissional, especialidades, redes sociais e acompanhe suas avaliações!',
    placement: 'right'
  },
  {
    target: '.header-search',
    title: '🔎 Busca Rápida',
    content: 'Use a busca para encontrar rapidamente aprendizes, sessões ou recursos.',
    placement: 'bottom'
  }
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const getUserKey = () => `onboarding_${userId}`;

  // Carregar estado do localStorage
  useEffect(() => {
    if (!userId) return;
    
    const userKey = getUserKey();
    const completed = localStorage.getItem(`${userKey}_completed`);
    if (completed === 'true') {
      setHasCompletedOnboarding(true);
    }
  }, [userId]);

  const startOnboarding = (userType: 'mentor' | 'aprendiz', currentUserId?: string) => {
    if (currentUserId) {
      setUserId(currentUserId);
    }
    
    const userSteps = userType === 'mentor' ? mentorSteps : aprendizSteps;
    setSteps(userSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    setIsActive(false);
    setCurrentStep(0);
    if (userId) {
      const userKey = getUserKey();
      localStorage.setItem(`${userKey}_skipped`, 'true');
    }
  };

  const completeOnboarding = () => {
    setIsActive(false);
    setCurrentStep(0);
    setHasCompletedOnboarding(true);
    if (userId) {
      const userKey = getUserKey();
      localStorage.setItem(`${userKey}_completed`, 'true');
    }
  };

  const value = {
    isActive,
    currentStep,
    steps,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    hasCompletedOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding deve ser usado dentro de um OnboardingProvider');
  }
  
  return context;
}

