import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { 
  User, 
  Mail, 
  Edit2, 
  Save, 
  X, 
  GraduationCap, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  Plus
} from 'lucide-react';
import ProfileUploader from '../components/ProfileUploader';

const MenteeProfile: React.FC = () => {
  const { user } = useAuth(); // 'user' já vem com a foto!
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado do perfil (mock data - em produção viria do backend)
  const [profile, setProfile] = useState({
    name: user?.name || 'Usuário',
    email: user?.email || '',
    bio: 'Estudante em busca de conhecimento e mentoria para crescer profissionalmente.',
    interests: ['JavaScript', 'React', 'Node.js'],
    currentLevel: 'Intermediário',
    goals: ['Conseguir primeiro emprego em tech', 'Dominar React', 'Aprender TypeScript'],
    sessionsAttended: 12,
    totalHours: 18,
    mentorsWorkedWith: 4,
    certificates: 2
  });

  const [editForm, setEditForm] = useState({ ...profile });
  const [newInterest, setNewInterest] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter((_, i) => i !== index)
    });
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setEditForm({
        ...editForm,
        goals: [...editForm.goals, newGoal.trim()]
      });
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setEditForm({
      ...editForm,
      goals: editForm.goals.filter((_, i) => i !== index)
    });
  };

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
              <GraduationCap size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Perfil do Aprendiz
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Gerencie suas informações e acompanhe seu progresso
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Visualize e edite seu perfil, acompanhe suas sessões e metas de aprendizado
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
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={24} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {profile.sessionsAttended}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Sessões Participadas</p>
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
              {profile.totalHours}h
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Horas de Aprendizado</p>
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
            backgroundColor: '#e9d5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <User size={24} style={{ color: '#9333ea' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {profile.mentorsWorkedWith}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Mentores</p>
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
            <Award size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
              {profile.certificates}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Certificados</p>
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
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e3a8a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <User size={20} style={{ color: '#2563eb' }} />
                Informações Básicas
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                margin: '0.25rem 0 0 0'
              }}>
                Seus dados pessoais
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
                    borderLeft: '3px solid #8b5cf6'
                  }}>
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Nível */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nível de Conhecimento
                </label>
                {isEditing ? (
                  <select
                    value={editForm.currentLevel}
                    onChange={(e) => setEditForm({ ...editForm, currentLevel: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: 'white'
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
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                ) : (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e9d5ff',
                    color: '#6b21a8',
                    borderRadius: '0.75rem',
                    fontWeight: '500'
                  }}>
                    <GraduationCap size={16} />
                    {profile.currentLevel}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Áreas de Interesse */}
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
                <Target size={20} style={{ color: '#9333ea' }} />
                Áreas de Interesse
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b21a8',
                margin: '0.25rem 0 0 0'
              }}>
                Tecnologias e temas que você quer aprender
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Lista de Interesses */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(isEditing ? editForm.interests : profile.interests).map((interest, index) => (
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
                    {interest}
                    {isEditing && (
                      <button
                        onClick={() => removeInterest(index)}
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

              {/* Adicionar Interesse */}
              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input
                    type="text"
                    placeholder="Ex: Python, Machine Learning..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={addInterest} 
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
          {/* --- CARD FOTO DE PERFIL --- */}
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
              backgroundColor: '#dbeafe', // Cor de fundo (Aprendiz)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e3a8a', // Cor do texto (Aprendiz)
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
                user ? user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'A'
              )}
            </div>
            
            {/* Nome e Tipo */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1rem', marginBottom: '0.25rem' }}>
              {profile.name}
            </h2>
            <Badge 
              variant="default"
              style={{ 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                color: '#1e40af',
                border: '1px solid #93c5fd'
              }}
            >
              Aprendiz
            </Badge>

            {/* 3. Renderiza o Uploader SOMENTE se estiver em modo de edição */}
            {isEditing && (
              <ProfileUploader />
            )}
          </Card>
          
          {/* Objetivos */}
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
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#7c2d12',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Target size={20} style={{ color: '#ea580c' }} />
                Meus Objetivos
              </h3>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {(isEditing ? editForm.goals : profile.goals).map((goal, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.875rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
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
                  }}
                >
                  <Target size={16} style={{ color: '#9333ea', marginTop: '0.125rem', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.875rem', color: '#374151', flex: 1, lineHeight: '1.5' }}>{goal}</p>
                  {isEditing && (
                    <button
                      onClick={() => removeGoal(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {/* Adicionar Objetivo */}
              {isEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Input
                    type="text"
                    placeholder="Novo objetivo..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addGoal} 
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
                    <Plus size={16} />
                    Adicionar Objetivo
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Progresso */}
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
                <TrendingUp size={20} style={{ color: '#16a34a' }} />
                Progresso Recente
              </h3>
            </div>

            <div style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {[
                { label: 'Sessões Concluídas', current: 12, total: 15, percentage: 80, color: '#9333ea', bgColor: '#e9d5ff' },
                { label: 'Horas de Estudo', current: 18, total: 25, percentage: 72, color: '#16a34a', bgColor: '#dcfce7' },
                { label: 'Objetivos Atingidos', current: 2, total: 3, percentage: 66, color: '#f59e0b', bgColor: '#fef3c7' }
              ].map((item, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>{item.label}</span>
                    <span style={{
                      fontWeight: '600',
                      color: item.color,
                      padding: '0.125rem 0.5rem',
                      backgroundColor: item.bgColor,
                      borderRadius: '0.375rem'
                    }}>
                      {item.current}/{item.total}{item.label.includes('Horas') ? 'h' : ''}
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
        </div>
      </div>
    </div>
  );
};

export default MenteeProfile;