import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import DocumentCard from '../components/DocumentCard';
import { mockDocuments } from '../data/mockData';
import { mentorService } from '../services';
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToastContext } from '../contexts/ToastContext';
import { 
  User, 
  Mail, 
  Edit2, 
  Save, 
  X, 
  Briefcase, 
  Star, 
  Calendar,
  TrendingUp,
  Award,
  Plus,
  MessageSquare,
  Linkedin,
  Instagram,
  Twitter,
  Github,
  Globe,
  UserCircle,
  BookOpen,
  Download,
  Eye
} from 'lucide-react';

import ProfileUploader from '../components/ProfileUploader';
import MentorSessionsManager from '../components/MentorSessionsManager';

const MentorProfile: React.FC = () => {
  const { user } = useAuth();
  const toast = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  
  // Buscar dados do mentor do backend
  useEffect(() => {
    const fetchMentorData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar todos os mentores e encontrar o que corresponde ao userId
        const mentorsResponse = await mentorService.getAll();
        const mentor = mentorsResponse.data?.find((m: any) => m.userId === user.id);

        if (mentor) {
          // Buscar dados completos do mentor
          const mentorDetails = await mentorService.getById(mentor.id);
          setMentorData(mentorDetails.data);
        } else {
          setError('Perfil de mentor não encontrado. Certifique-se de que você está logado como mentor.');
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados do mentor:', err);
        setError('Erro ao carregar perfil do mentor.');
        toast.error('Erro ao carregar perfil do mentor.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [user, toast]);

  // Documentos do mentor
  const mentorDocuments = mockDocuments.filter(doc => doc.mentorId === mentorData?.id || doc.mentorId === user?.id);
  const totalDocDownloads = mentorDocuments.reduce((sum, doc) => sum + doc.downloadCount, 0);
  const totalDocViews = mentorDocuments.reduce((sum, doc) => sum + doc.viewCount, 0);
  
  // Estado do perfil (combinando dados do backend com dados do usuário)
  const [profile, setProfile] = useState({
    name: user?.name || 'Usuário',
    email: user?.email || '',
    bio: 'Profissional experiente dedicado a compartilhar conhecimento e ajudar outros a crescerem em suas carreiras.',
    specialties: ['JavaScript', 'React', 'Node.js', 'Liderança'],
    experience: '8 anos',
    company: 'Tech Company',
    position: 'Senior Developer',
    sessionsCreated: 24,
    totalStudents: 156,
    rating: 4.8,
    totalReviews: 89,
    socialMedia: {
      linkedin: 'https://linkedin.com/in/seuperfil',
      github: 'https://github.com/seuperfil',
      twitter: 'https://twitter.com/seuperfil',
      instagram: 'https://instagram.com/seuperfil',
      website: 'https://seusite.com'
    }
  });

  // Atualizar perfil quando mentorData mudar
  useEffect(() => {
    if (mentorData) {
      setProfile({
        name: user?.name || mentorData.name || 'Usuário',
        email: user?.email || mentorData.email || '',
        bio: mentorData.bio || 'Profissional experiente dedicado a compartilhar conhecimento e ajudar outros a crescerem em suas carreiras.',
        specialties: mentorData.specialties || [],
        experience: mentorData.experience ? `${mentorData.experience} anos` : '8 anos',
        company: 'Tech Company',
        position: 'Senior Developer',
        sessionsCreated: mentorData.totalSessions || 24,
        totalStudents: 156,
        rating: mentorData.rating || 4.8,
        totalReviews: 89,
        socialMedia: {
          linkedin: 'https://linkedin.com/in/seuperfil',
          github: 'https://github.com/seuperfil',
          twitter: 'https://twitter.com/seuperfil',
          instagram: 'https://instagram.com/seuperfil',
          website: 'https://seusite.com'
        }
      });
    }
  }, [mentorData, user]);

  const [editForm, setEditForm] = useState({ ...profile });
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setEditForm({
        ...editForm,
        specialties: [...editForm.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setEditForm({
      ...editForm,
      specialties: editForm.specialties.filter((_, i) => i !== index)
    });
  };

  // Mock de feedbacks recentes
  const recentFeedbacks = [
    {
      id: 1,
      student: 'Maria Santos',
      comment: 'Excelente mentor! Me ajudou muito a entender React Hooks.',
      rating: 5,
      date: '2 dias atrás'
    },
    {
      id: 2,
      student: 'João Silva',
      comment: 'Muito didático e paciente. Recomendo!',
      rating: 5,
      date: '1 semana atrás'
    },
    {
      id: 3,
      student: 'Ana Costa',
      comment: 'Sessão muito produtiva sobre arquitetura de software.',
      rating: 4,
      date: '2 semanas atrás'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '2rem' }}>
          <SkeletonCard />
          <SkeletonList count={2} />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !mentorData) {
    return (
      <div className="dashboard-container">
        <EmptyState
          type="generic"
          title="Perfil não encontrado"
          message={error || 'Não foi possível carregar o perfil do mentor.'}
        />
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
              <UserCircle size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Perfil do Mentor
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Gerencie suas informações e acompanhe seu impacto
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Visualize e edite seu perfil, veja suas sessões e métricas de mentoria
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
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
                <X size={16} />
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
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
                <Save size={16} />
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setIsEditing(true)}
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
              <Edit2 size={16} />
              Editar Perfil
            </Button>
          )}
        </div>
      </header>

      {/* Stats Cards */}
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
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={24} style={{ color: '#ea580c' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {profile.sessionsCreated}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Sessões Criadas</p>
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
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
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
            <TrendingUp size={24} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {profile.totalStudents}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Aprendizes Impactados</p>
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
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
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
            <MessageSquare size={24} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {profile.totalReviews}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Feedbacks Recebidos</p>
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
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
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
            <BookOpen size={24} style={{ color: '#d97706' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {mentorDocuments.length}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Documentos Compartilhados</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}
      className="responsive-grid">
        
        {/* Left Column (8 columns) */}
        <div style={{
          gridColumn: 'span 8',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          
          {/* Informações Básicas */}
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
              background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)'
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
                <User size={20} style={{ color: '#ea580c' }} />
                Informações Básicas
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#9a3412',
                margin: '0.25rem 0 0 0'
              }}>
                Seus dados pessoais e profissionais
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Nome */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nome
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                ) : (
                  <p style={{ color: '#111827', fontWeight: '500', fontSize: '1.125rem' }}>{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} style={{ color: '#9ca3af' }} />
                  <p style={{ color: '#111827' }}>{profile.email}</p>
                </div>
              </div>

              {/* Cargo e Empresa */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Cargo
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    />
                  ) : (
                    <p style={{ color: '#111827', fontWeight: '500' }}>{profile.position}</p>
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
                    Empresa
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    />
                  ) : (
                    <p style={{ color: '#111827', fontWeight: '500' }}>{profile.company}</p>
                  )}
                </div>
              </div>

              {/* Experiência */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Anos de Experiência
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  />
                ) : (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '0.75rem',
                    fontWeight: '500'
                  }}>
                    <Briefcase size={16} />
                    {profile.experience}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Sobre mim
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s',
                      resize: 'none',
                      fontFamily: 'inherit'
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
                ) : (
                  <p style={{
                    color: '#374151',
                    lineHeight: '1.6',
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.75rem',
                    borderLeft: '3px solid #f97316'
                  }}>
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Especialidades */}
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
              background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#581c87',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Award size={20} style={{ color: '#9333ea' }} />
                Especialidades
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b21a8',
                margin: '0.25rem 0 0 0'
              }}>
                Áreas em que você pode ajudar
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Lista de Especialidades */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(isEditing ? editForm.specialties : profile.specialties).map((specialty, index) => (
                  <Badge 
                    key={index} 
                    variant="primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {specialty}
                    {isEditing && (
                      <button
                        onClick={() => removeSpecialty(index)}
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
                    )}
                  </Badge>
                ))}
              </div>

              {/* Adicionar Especialidade */}
              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input
                    type="text"
                    placeholder="Ex: Python, Gestão de Equipes..."
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  />
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={addSpecialty} 
                    style={{ 
                      flexShrink: 0,
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
                    <Plus size={16} />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (4 columns) */}
        <div style={{
          gridColumn: 'span 4',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
            {/* --- CARD DA FOTO DE PERFIL --- */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Avatar Grande */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#fed7aa', // Cor de fundo (Mentor)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c2d12', // Cor do texto (Mentor)
              fontWeight: '700',
              fontSize: '3rem',
              overflow: 'hidden',
              border: '4px solid white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}>
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Perfil" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user ? user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'M'
              )}
            </div>
            
            {/* Nome e Tipo */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1rem', marginBottom: '0.25rem' }}>
              {profile.name}
            </h2>
            <Badge 
              variant="default"
              style={{ 
                background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                color: '#7c2d12',
                border: '1px solid #f97316'
              }}
            >
              Mentor
            </Badge>

            {/* 3. Renderiza o Uploader SOMENTE se estiver em modo de edição */}
            {isEditing && (
              <ProfileUploader />
            )}
          </Card>
          
          {/* Redes Sociais */}
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
              background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#4c1d95',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Globe size={20} style={{ color: '#7c3aed' }} />
                Redes Sociais
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#5b21b6',
                margin: '0.25rem 0 0 0'
              }}>
                Conecte-se comigo
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {isEditing ? (
                <>
                  {/* LinkedIn */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Linkedin size={16} style={{ color: '#0077b5' }} />
                      LinkedIn
                    </label>
                    <Input
                      type="text"
                      value={editForm.socialMedia.linkedin}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/in/seuperfil"
                    />
                  </div>

                  {/* GitHub */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Github size={16} style={{ color: '#333' }} />
                      GitHub
                    </label>
                    <Input
                      type="text"
                      value={editForm.socialMedia.github}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, github: e.target.value }
                      })}
                      placeholder="https://github.com/seuperfil"
                    />
                  </div>

                  {/* Twitter */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Twitter size={16} style={{ color: '#1da1f2' }} />
                      Twitter
                    </label>
                    <Input
                      type="text"
                      value={editForm.socialMedia.twitter}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/seuperfil"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Instagram size={16} style={{ color: '#e4405f' }} />
                      Instagram
                    </label>
                    <Input
                      type="text"
                      value={editForm.socialMedia.instagram}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/seuperfil"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      <Globe size={16} style={{ color: '#10b981' }} />
                      Website
                    </label>
                    <Input
                      type="text"
                      value={editForm.socialMedia.website}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        socialMedia: { ...editForm.socialMedia, website: e.target.value }
                      })}
                      placeholder="https://seusite.com"
                    />
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {/* LinkedIn */}
                  {profile.socialMedia.linkedin && (
                    <a
                      href={profile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.borderColor = '#0077b5';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#0077b5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Linkedin size={18} style={{ color: 'white' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          LinkedIn
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Perfil profissional
                        </p>
                      </div>
                    </a>
                  )}

                  {/* GitHub */}
                  {profile.socialMedia.github && (
                    <a
                      href={profile.socialMedia.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Github size={18} style={{ color: 'white' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          GitHub
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Projetos e código
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Twitter */}
                  {profile.socialMedia.twitter && (
                    <a
                      href={profile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.borderColor = '#1da1f2';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#1da1f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Twitter size={18} style={{ color: 'white' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          Twitter
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Atualizações e insights
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Instagram */}
                  {profile.socialMedia.instagram && (
                    <a
                      href={profile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#e4405f';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Instagram size={18} style={{ color: 'white' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          Instagram
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Fotos e stories
                        </p>
                      </div>
                    </a>
                  )}

                  {/* Website */}
                  {profile.socialMedia.website && (
                    <a
                      href={profile.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ecfdf5';
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Globe size={18} style={{ color: 'white' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          Website
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          Portfólio pessoal
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Feedbacks Recentes */}
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
                <MessageSquare size={20} style={{ color: '#2563eb' }} />
                Feedbacks Recentes
              </h3>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {recentFeedbacks.map((feedback) => (
                <div key={feedback.id} style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <p style={{
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: '#111827'
                    }}>
                      {feedback.student}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                      {Array.from({ length: feedback.rating }).map((_, i) => (
                        <Star key={i} size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      ))}
                    </div>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                    lineHeight: '1.5'
                  }}>
                    {feedback.comment}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    {feedback.date}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <Button 
                variant="outline" 
                size="sm" 
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#2563eb',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
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
                Ver Todos os Feedbacks
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Minhas Sessões - Largura Total */}
      <Card style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        marginTop: '2rem'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
          borderLeft: '4px solid #f97316'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#7c2d12',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Calendar size={20} style={{ color: '#f97316' }} />
            Gerenciar Sessões
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#9a3412',
            margin: '0.25rem 0 0 0'
          }}>
            Visualize, edite e exclua suas sessões de mentoria
          </p>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <MentorSessionsManager />
        </div>
      </Card>

      {/* Meus Documentos - Largura Total */}
      <Card style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        marginTop: '2rem'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
          borderLeft: '4px solid #f97316',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#7c2d12',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BookOpen size={20} style={{ color: '#f97316' }} />
              Meus Documentos
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#9a3412',
              margin: '0.25rem 0 0 0'
            }}>
              {mentorDocuments.length} documentos compartilhados em sessões concluídas
            </p>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Estatísticas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{
              padding: '0.875rem',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <BookOpen size={20} style={{ color: '#d97706', margin: '0 auto 0.5rem' }} />
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#d97706',
                margin: 0
              }}>
                {mentorDocuments.length}
              </p>
              <p style={{
                fontSize: '0.6875rem',
                color: '#92400e',
                margin: '0.25rem 0 0 0'
              }}>
                Documentos
              </p>
            </div>

            <div style={{
              padding: '0.875rem',
              backgroundColor: '#dbeafe',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Download size={20} style={{ color: '#2563eb', margin: '0 auto 0.5rem' }} />
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#2563eb',
                margin: 0
              }}>
                {totalDocDownloads}
              </p>
              <p style={{
                fontSize: '0.6875rem',
                color: '#1e40af',
                margin: '0.25rem 0 0 0'
              }}>
                Downloads
              </p>
            </div>

            <div style={{
              padding: '0.875rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Eye size={20} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#10b981',
                margin: 0
              }}>
                {totalDocViews}
              </p>
              <p style={{
                fontSize: '0.6875rem',
                color: '#15803d',
                margin: '0.25rem 0 0 0'
              }}>
                Visualizações
              </p>
            </div>
          </div>

          {/* Recent Documents */}
          {mentorDocuments.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {mentorDocuments.slice(0, 6).map(document => (
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
              <BookOpen size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.5rem'
              }}>
                Você ainda não compartilhou nenhum documento
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                Compartilhe materiais, slides e recursos com seus aprendizes em sessões concluídas
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MentorProfile;