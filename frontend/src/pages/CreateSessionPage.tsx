import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import SessionSuccessModal from '../components/SessionSuccessModal';
import { sessionTopics } from '../data/mockData';
import { sessionService, mentorService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Plus, 
  X, 
  FileText,
  Settings,
  BookOpen,
  Eye,
  BarChart3,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface SessionForm {
  title: string;
  description: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  meetingLink: string;
  requirements: string[];
  objectives: string[];
}

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<SessionForm>({
    title: '',
    description: '',
    topic: '',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 20,
    meetingLink: '',
    requirements: [],
    objectives: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSession, setCreatedSession] = useState<SessionForm | null>(null);

  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');

  const handleInputChange = (field: keyof SessionForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoFillData = () => {
    // Calcula data 7 horas no futuro
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 7);
    const formattedDate = futureDate.toISOString().slice(0, 16);

    setForm({
      title: 'Desenvolvimento de Liderança para Jovens Profissionais',
      description: 'Nesta sessão, vamos explorar os principais conceitos de liderança moderna, técnicas de gestão de equipes e como desenvolver habilidades de comunicação eficaz no ambiente corporativo.',
      topic: sessionTopics[0] || 'Liderança',
      scheduledAt: formattedDate,
      duration: 90,
      maxParticipants: 25,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      requirements: [
        'Conhecimento básico em gestão',
        'Experiência mínima de 1 ano em equipe',
        'Interesse em desenvolvimento profissional'
      ],
      objectives: [
        'Identificar estilos de liderança',
        'Desenvolver comunicação assertiva',
        'Aplicar técnicas de feedback construtivo'
      ]
    });
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setForm(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setForm(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!form.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }

    if (!form.topic) {
      newErrors.topic = 'Selecione um tópico';
    }

    if (!form.scheduledAt) {
      newErrors.scheduledAt = 'Data e hora são obrigatórias';
    } else {
      // Validar se a data é no mínimo 6 horas no futuro
      const selectedDate = new Date(form.scheduledAt);
      const minDate = new Date();
      minDate.setHours(minDate.getHours() + 6);
      
      if (selectedDate < minDate) {
        newErrors.scheduledAt = 'A sessão deve ser agendada com no mínimo 6 horas de antecedência';
      }
    }

    if (!form.meetingLink.trim()) {
      newErrors.meetingLink = 'O link da reunião é obrigatório';
    } else if (!form.meetingLink.startsWith('http://') && !form.meetingLink.startsWith('https://')) {
      newErrors.meetingLink = 'Informe um link válido (deve começar com http:// ou https://)';
    }

    if (form.duration < 30 || form.duration > 180) {
      newErrors.duration = 'A duração deve estar entre 30 e 180 minutos';
    }

    if (form.maxParticipants < 1 || form.maxParticipants > 100) {
      newErrors.maxParticipants = 'Número de participantes deve estar entre 1 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar o perfil do mentor usando o ID do usuário logado
      const mentorsResponse = await mentorService.getAll();
      const mentor = mentorsResponse.data.find((m: any) => m.userId === user?.id);

      if (!mentor) {
        alert('Erro: Perfil de mentor não encontrado. Certifique-se de que você está logado como mentor.');
        setIsSubmitting(false);
        return;
      }

      // Criar nova sessão através da API
      const sessionData = {
        mentorId: mentor.id,
        title: form.title,
        description: form.description,
        topic: form.topic,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: form.duration,
        maxParticipants: form.maxParticipants,
        meetingLink: form.meetingLink,
        requirements: form.requirements,
        objectives: form.objectives
      };

      const response = await sessionService.create(sessionData);

      console.log('Sessão criada com sucesso:', response);

      setIsSubmitting(false);
      setCreatedSession(form);
      setShowSuccessModal(true);

      // Limpar formulário
      setForm({
        title: '',
        description: '',
        topic: '',
        scheduledAt: '',
        duration: 60,
        maxParticipants: 20,
        meetingLink: '',
        requirements: [],
        objectives: [],
      });
    } catch (error: any) {
      console.error('Erro ao criar sessão:', error);
      alert(`Erro ao criar sessão: ${error.response?.data?.message || error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && createdSession && (
        <SessionSuccessModal
          sessionTitle={createdSession.title}
          scheduledAt={createdSession.scheduledAt}
          maxParticipants={createdSession.maxParticipants}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

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
              <Sparkles size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Criar Nova Sessão
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Compartilhe conhecimento e conecte-se com aprendizes
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Preencha os campos abaixo para criar uma sessão de mentoria aberta
          </p>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#dcfce7',
          border: '2px solid #16a34a',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <CheckCircle size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#166534', 
              margin: '0 0 0.125rem 0' 
            }}>
              Sessão criada com sucesso! 🎉
            </p>
            <p style={{ fontSize: '0.8rem', color: '#15803d', margin: 0 }}>
              Sua sessão foi publicada e está disponível para inscrições
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem'
        }}
        className="responsive-grid">
          
          {/* Left Column - Main Form (8 columns) */}
          <div style={{
            gridColumn: 'span 8',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            {/* Basic Information */}
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
                  <FileText size={20} style={{ color: '#f97316' }} />
                  Informações Básicas
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Defina os detalhes principais da sessão
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Título da Sessão <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Desenvolvimento de Liderança para Jovens Profissionais"
                    value={form.title}
                    onChange={(e) => {
                      handleInputChange('title', e.target.value);
                      if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                    }}
                    required
                    className="enhanced-input"
                    style={{
                      borderColor: errors.title ? '#ef4444' : undefined,
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      padding: '0.875rem 1rem'
                    }}
                  />
                  {errors.title && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Descrição <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    placeholder="Descreva o que será abordado na sessão..."
                    value={form.description}
                    onChange={(e) => {
                      handleInputChange('description', e.target.value);
                      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    rows={5}
                    required
                    className="enhanced-textarea"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: errors.description ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '0.875rem',
                      fontSize: '1rem',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      minHeight: '120px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      if (!errors.description) {
                        e.target.style.borderColor = '#e5e7eb';
                      }
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                  {errors.description && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Tópico <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={form.topic}
                    onChange={(e) => {
                      handleInputChange('topic', e.target.value);
                      if (errors.topic) setErrors(prev => ({ ...prev, topic: '' }));
                    }}
                    required
                    className="enhanced-select"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: errors.topic ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '0.875rem',
                      fontSize: '1rem',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    onFocus={(e: any) => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.1)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e: any) => {
                      if (!errors.topic) {
                        e.target.style.borderColor = '#e5e7eb';
                      }
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <option value="">Selecione um tópico</option>
                    {sessionTopics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                  {errors.topic && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.topic}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Scheduling */}
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
                  <Calendar size={20} style={{ color: '#f97316' }} />
                  Agendamento
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Configure data, hora e duração (mínimo 6h de antecedência)
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Data e Hora <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => {
                      handleInputChange('scheduledAt', e.target.value);
                      if (errors.scheduledAt) setErrors(prev => ({ ...prev, scheduledAt: '' }));
                    }}
                    required
                    min={(() => {
                      const minDate = new Date();
                      minDate.setHours(minDate.getHours() + 6);
                      return minDate.toISOString().slice(0, 16);
                    })()}
                    className="enhanced-input"
                    style={{
                      borderColor: errors.scheduledAt ? '#ef4444' : undefined,
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      padding: '0.875rem 1rem'
                    }}
                  />
                  {errors.scheduledAt && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.scheduledAt}
                    </p>
                  )}
                  {!errors.scheduledAt && form.scheduledAt && (
                    <p style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} />
                      Data válida! (6+ horas de antecedência)
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Duração (minutos) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    type="number"
                    min="30"
                    max="180"
                    step="15"
                    value={form.duration}
                    onChange={(e) => {
                      handleInputChange('duration', parseInt(e.target.value));
                      if (errors.duration) setErrors(prev => ({ ...prev, duration: '' }));
                    }}
                    required
                    className="enhanced-input"
                    style={{
                      borderColor: errors.duration ? '#ef4444' : undefined,
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      padding: '0.875rem 1rem'
                    }}
                  />
                  {errors.duration && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.duration}
                    </p>
                  )}
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Recomendado: 60-90 minutos
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Máximo de Participantes <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={form.maxParticipants}
                    onChange={(e) => {
                      handleInputChange('maxParticipants', parseInt(e.target.value));
                      if (errors.maxParticipants) setErrors(prev => ({ ...prev, maxParticipants: '' }));
                    }}
                    required
                    className="enhanced-input"
                    style={{
                      borderColor: errors.maxParticipants ? '#ef4444' : undefined,
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      padding: '0.875rem 1rem'
                    }}
                  />
                  {errors.maxParticipants && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.maxParticipants}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Meeting Link */}
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
                  <LinkIcon size={20} style={{ color: '#f97316' }} />
                  Link da Reunião
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Insira o link do Google Meet, Zoom ou outra plataforma
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    URL da Videochamada <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij ou https://zoom.us/j/..."
                    value={form.meetingLink}
                    onChange={(e) => {
                      handleInputChange('meetingLink', e.target.value);
                      if (errors.meetingLink) setErrors(prev => ({ ...prev, meetingLink: '' }));
                    }}
                    required
                    className="enhanced-input"
                    style={{
                      borderColor: errors.meetingLink ? '#ef4444' : undefined,
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      padding: '0.875rem 1rem'
                    }}
                  />
                  {errors.meetingLink && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} />
                      {errors.meetingLink}
                    </p>
                  )}
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    💡 Dica: Use links do Google Meet, Zoom, Microsoft Teams, etc.
                  </p>
                </div>
              </div>
            </Card>

            {/* Requirements */}
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
                  Requisitos (Opcional)
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Defina os pré-requisitos para participar da sessão
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input
                    type="text"
                    placeholder="Ex: Conhecimento básico em gestão"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    className="enhanced-input"
                    style={{
                      transition: 'all 0.3s ease',
                      fontSize: '0.9375rem',
                      padding: '0.75rem 1rem'
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddRequirement}
                    variant="primary"
                    size="sm"
                    style={{ 
                      flexShrink: 0,
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
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.3)';
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {form.requirements.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Requisitos Adicionados:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {form.requirements.map((requirement, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem'
                          }}
                        >
                          {requirement}
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            style={{
                              marginLeft: '0.25rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'inherit',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Objectives */}
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
                  Objetivos (Opcional)
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Estabeleça os objetivos de aprendizado da sessão
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input
                    type="text"
                    placeholder="Ex: Identificar estilos de liderança"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                    className="enhanced-input"
                    style={{
                      transition: 'all 0.3s ease',
                      fontSize: '0.9375rem',
                      padding: '0.75rem 1rem'
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddObjective}
                    variant="primary"
                    size="sm"
                    style={{ 
                      flexShrink: 0,
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
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.3)';
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {form.objectives.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Objetivos Adicionados:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {form.objectives.map((objective, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.375rem 0.75rem'
                          }}
                        >
                          {objective}
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(index)}
                            style={{
                              marginLeft: '0.25rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'inherit',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
            
            {/* Session Preview */}
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
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                borderLeft: '4px solid #f97316'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#7c2d12',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Eye size={20} style={{ color: '#f97316' }} />
                  Preview da Sessão
                </h3>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Visualização em tempo real
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>
                  <h4 style={{
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {form.title || 'Título da sessão...'}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    {form.topic || 'Tópico não selecionado'}
                  </p>
                </div>
                
                {form.description && (
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    borderLeft: '3px solid #f97316'
                  }}>
                    {form.description}
                  </p>
                )}
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem'
                  }}>
                    <Clock size={16} style={{ color: '#6b7280' }} />
                    <span>{form.duration} min</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem'
                  }}>
                    <Users size={16} style={{ color: '#6b7280' }} />
                    <span>{form.maxParticipants} max</span>
                  </div>
                </div>
                
                {form.scheduledAt && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    padding: '0.75rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.75rem'
                  }}>
                    <Calendar size={16} style={{ color: '#2563eb' }} />
                    <span style={{ fontWeight: '500', color: '#1e3a8a' }}>
                      {new Date(form.scheduledAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {form.meetingLink && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    padding: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '0.75rem'
                  }}>
                    <LinkIcon size={16} style={{ color: '#16a34a' }} />
                    <a 
                      href={form.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        fontWeight: '500', 
                        color: '#166534',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        display: 'block'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {form.meetingLink}
                    </a>
                  </div>
                )}

                {form.requirements.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Requisitos:
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      {form.requirements.slice(0, 3).map((req, idx) => (
                        <li key={idx} style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          paddingLeft: '1rem',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: '#f97316'
                          }}>•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {form.objectives.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Objetivos:
                    </p>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      {form.objectives.slice(0, 3).map((obj, idx) => (
                        <li key={idx} style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          paddingLeft: '1rem',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            color: '#f97316'
                          }}>✓</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
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
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
                borderLeft: '4px solid #f97316'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#7c2d12',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <BarChart3 size={20} style={{ color: '#f97316' }} />
                  Resumo
                </h3>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Estatísticas da sessão
                </p>
              </div>
              
              <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {[
                  { label: 'Requisitos', value: form.requirements.length, icon: Settings, color: '#f97316', bgColor: '#fff7ed' },
                  { label: 'Objetivos', value: form.objectives.length, icon: Target, color: '#f97316', bgColor: '#fff7ed' },
                  { label: 'Duração', value: `${form.duration} min`, icon: Clock, color: '#f97316', bgColor: '#fff7ed' },
                  { label: 'Participantes', value: form.maxParticipants, icon: Users, color: '#f97316', bgColor: '#fff7ed' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: item.bgColor,
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#374151'
                    }}>
                      <item.icon size={16} style={{ color: item.color }} />
                      <span>{item.label}:</span>
                    </div>
                    <span style={{
                      fontWeight: '600',
                      color: item.color
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Auto-fill Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '1.5rem',
          paddingBottom: '1rem'
        }}>
          <Button 
            type="button" 
            onClick={handleAutoFillData}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '0.875rem 2.5rem',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(139, 92, 246, 0.3)';
            }}
          >
            <Sparkles size={20} />
            Inserir dados
          </Button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/sessions')}
            style={{
              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              color: '#6b7280',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '0.875rem 2rem',
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
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            size="lg"
            disabled={isSubmitting}
            style={{
              background: isSubmitting 
                ? 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
                : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '0.875rem 2rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(249, 115, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.3)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Criar Sessão
              </>
            )}
          </Button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .enhanced-input:hover:not(:disabled),
        .enhanced-select:hover:not(:disabled),
        .enhanced-textarea:hover:not(:disabled) {
          border-color: #f97316 !important;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15) !important;
        }
        
        .enhanced-input:focus,
        .enhanced-select:focus,
        .enhanced-textarea:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1) !important;
          transform: translateY(-1px);
        }
        
        .enhanced-input::placeholder,
        .enhanced-textarea::placeholder {
          color: #9ca3af;
          opacity: 0.8;
        }
        
        .enhanced-select option {
          padding: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .responsive-grid > div {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
    </>
  );
};

export default CreateSessionPage;