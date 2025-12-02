import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Users, GraduationCap, MessageCircle, UserSearch } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { mentorService } from '../services';
import type { Mentor } from '../types';

interface SearchFilters {
  specialties: string[];
  languages: string[];
  experience: string;
  availability: string[];
}

const MentorSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    specialties: [],
    languages: [],
    experience: 'all',
    availability: []
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [availableLanguages] = useState<string[]>(['Português', 'Inglês', 'Espanhol', 'Francês']);

  // Buscar mentores e especialidades da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [mentorsResponse, specialtiesResponse] = await Promise.all([
          mentorService.getAll(),
          mentorService.getSpecialties()
        ]);

        setMentors(mentorsResponse.data || []);
        setAvailableSpecialties(specialtiesResponse.data || []);
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar mentores.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    // Filtro por termo de busca
    if (searchTerm && !mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !mentor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // Filtro por especialidades
    if (filters.specialties.length > 0 && 
        !filters.specialties.some(specialty => mentor.specialties.includes(specialty))) {
      return false;
    }

    // Filtro por idiomas
    if (filters.languages.length > 0 && 
        !filters.languages.some(language => mentor.languages.includes(language))) {
      return false;
    }

    // Filtro por experiência
    if (filters.experience !== 'all') {
      const experienceYears = parseInt(filters.experience);
      if (mentor.experience < experienceYears) {
        return false;
      }
    }

    return true;
  });

  const handleSpecialtyToggle = (specialty: string) => {
    setFilters(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      specialties: [],
      languages: [],
      experience: 'all',
      availability: []
    });
    setSearchTerm('');
  };

  const handleBookSession = (mentorId: string) => {
    // TODO: Implementar agendamento de sessão
    alert(`Redirecionando para agendamento com mentor ${mentorId}`);
  };

  const handleViewProfile = (mentorId: string) => {
    // TODO: Implementar visualização de perfil do mentor
    alert(`Visualizando perfil do mentor ${mentorId}`);
  };

  // Organizar especialidades por categoria para melhor UX
  const specialtiesByCategory = {
    'Programação': availableSpecialties.filter(s => ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Algoritmos', 'Frontend', 'Backend'].includes(s)),
    'Design': availableSpecialties.filter(s => ['UX Design', 'UI Design', 'Figma', 'Photoshop', 'Design Gráfico'].includes(s)),
    'Matemática': availableSpecialties.filter(s => ['Cálculo', 'Álgebra Linear', 'Estatística', 'Geometria'].includes(s)),
    'Medicina': availableSpecialties.filter(s => ['Medicina', 'Enfermagem', 'Anatomia', 'Fisiologia', 'Cardiologia'].includes(s)),
    'Idiomas': availableSpecialties.filter(s => ['Inglês', 'Espanhol', 'Francês', 'TOEFL', 'IELTS'].includes(s)),
    'Outros': availableSpecialties.filter(s => !['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Algoritmos', 'Frontend', 'Backend', 'UX Design', 'UI Design', 'Figma', 'Photoshop', 'Design Gráfico', 'Cálculo', 'Álgebra Linear', 'Estatística', 'Geometria', 'Medicina', 'Enfermagem', 'Anatomia', 'Fisiologia', 'Cardiologia', 'Inglês', 'Espanhol', 'Francês', 'TOEFL', 'IELTS'].includes(s))
  };

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
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Carregando mentores...</p>
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
            Erro ao Carregar Mentores
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
              <UserSearch size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Buscar Mentores
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Encontre o mentor ideal para suas necessidades de aprendizado
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Explore perfis, filtre por especialidades e conecte-se com profissionais experientes
          </p>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{mentors.length}</h3>
            <p className="stat-label">Tutores Disponíveis</p>
            <div className="stat-trend">
              <span className="text-gray-500 text-sm">Todas as áreas</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Star className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">4.8</h3>
            <p className="stat-label">Avaliação Média</p>
            <div className="stat-trend">
              <span className="text-green-600 text-sm">Excelente qualidade</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">
            <Clock className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">24h</h3>
            <p className="stat-label">Resposta Rápida</p>
            <div className="stat-trend">
              <span className="text-gray-500 text-sm">Tempo médio</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">100%</h3>
            <p className="stat-label">Gratuito</p>
            <div className="stat-trend">
              <span className="text-purple-600 text-sm">Para estudantes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid - Optimized Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1.5rem'
      }}
      className="responsive-grid">
        
        {/* Left Column - Search and Filters (3 columns) */}
        <div style={{
          gridColumn: 'span 3',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          
          {/* Search Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
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
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e3a8a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Search size={20} style={{ color: '#2563eb' }} />
                Buscar Mentores
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#1e40af',
                margin: '0.25rem 0 0 0'
              }}>
                Encontre especialistas qualificados
              </p>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  placeholder="Nome, especialidade ou área de estudo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem 0.75rem 2.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.2s'
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
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#065f46',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Filter size={20} style={{ color: '#16a34a' }} />
                  Filtros
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#047857',
                  margin: '0.25rem 0 0 0'
                }}>
                  Refine sua busca
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearFilters}
                style={{
                  background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  color: '#6b7280',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(107, 114, 128, 0.1)'
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
                Limpar
              </Button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Experience Filter */}
              <div>
                <h3 style={{
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280'
                }}>
                  Experiência Mínima
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { value: 'all', label: 'Qualquer nível' },
                    { value: '1', label: '1+ anos' },
                    { value: '3', label: '3+ anos' },
                    { value: '5', label: '5+ anos' },
                    { value: '10', label: '10+ anos' }
                  ].map(exp => (
                    <button
                      key={exp.value}
                      onClick={() => setFilters(prev => ({ ...prev, experience: exp.value }))}
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        fontSize: '0.875rem',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '0.75rem',
                        backgroundColor: filters.experience === exp.value ? '#fed7aa' : 'white',
                        color: filters.experience === exp.value ? '#7c2d12' : '#374151',
                        border: filters.experience === exp.value ? '1px solid #fb923c' : '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontWeight: '500',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (filters.experience !== exp.value) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (filters.experience !== exp.value) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages Filter */}
              <div>
                <h3 style={{ fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>Idiomas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {availableLanguages.map(language => (
                    <Button
                      key={language}
                      variant={filters.languages.includes(language) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleLanguageToggle(language)}
                      style={{ fontSize: '0.875rem', height: '2.5rem' }}
                    >
                      {language}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Specialties by Category */}
              <div>
                <h3 style={{ fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>Áreas de Estudo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {Object.entries(specialtiesByCategory).map(([category, specialties]) => (
                    <div key={category}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {category}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                        {specialties.slice(0, 6).map(specialty => (
                          <Button
                            key={specialty}
                            variant={filters.specialties.includes(specialty) ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleSpecialtyToggle(specialty)}
                            style={{ fontSize: '0.75rem', height: '2rem', justifyContent: 'flex-start' }}
                          >
                            {specialty}
                          </Button>
                        ))}
                        {specialties.length > 6 && (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ fontSize: '0.75rem', height: '2rem', justifyContent: 'flex-start' }}
                          >
                            +{specialties.length - 6}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results (9 columns) */}
        <div style={{
          gridColumn: 'span 9',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          
          {/* Results Summary */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            background: 'linear-gradient(135deg, white 0%, #fef3c7 100%)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Mentores Encontrados
                </h2>
                <p style={{
                  color: '#6b7280',
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  {filteredMentors.length} especialista{filteredMentors.length !== 1 ? 's' : ''} disponível{filteredMentors.length !== 1 ? 'is' : ''} para você
                </p>
              </div>
              <div style={{
                textAlign: 'right',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '16px',
                minWidth: '100px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {filteredMentors.length}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  resultados
                </div>
              </div>
            </div>
          </div>

          {/* Mentors Grid */}
          {filteredMentors.length === 0 ? (
            <Card style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Search style={{ width: '5rem', height: '5rem', color: '#d1d5db', margin: '0 auto 2rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>
                Nenhum mentor encontrado
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '32rem', margin: '0 auto 2rem', fontSize: '1.125rem' }}>
                Não encontramos mentores que correspondam aos seus critérios de busca. 
                Tente ajustar os filtros ou usar termos diferentes.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleClearFilters}
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '0.875rem 2rem',
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
                Limpar Filtros
              </Button>
            </Card>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#f97316';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>
                  <div style={{ padding: '1.5rem' }}>
                    {/* Header com Avatar e Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                      <Avatar
                        src={mentor.avatar}
                        name={mentor.name}
                        size="lg" 
                        style={{ flexShrink: 0, width: '3.5rem', height: '3.5rem' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontWeight: '700',
                          color: '#111827',
                          fontSize: '1.125rem',
                          marginBottom: '0.375rem'
                        }}>
                          {mentor.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <Badge variant="primary" size="sm">
                            {mentor.specialties[0]}
                          </Badge>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                            <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                              {mentor.rating}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {mentor.experience} anos de experiência
                        </span>
                      </div>
                    </div>
                    
                    {/* Bio */}
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {mentor.bio}
                    </p>
                    
                    {/* Especialidades */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      {mentor.specialties.slice(0, 3).map(specialty => (
                        <Badge key={specialty} variant="secondary" size="sm">
                          {specialty}
                        </Badge>
                      ))}
                      {mentor.specialties.length > 3 && (
                        <Badge variant="default" size="sm">
                          +{mentor.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button 
                        variant="primary" 
                        size="sm"
                        style={{ 
                          flex: 1,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '600',
                          borderRadius: '12px',
                          padding: '0.75rem 1rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onClick={() => handleBookSession(mentor.id)}
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
                        <MessageCircle size={16} />
                        Agendar Sessão
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#2563eb',
                          fontWeight: '600',
                          borderRadius: '12px',
                          padding: '0.75rem 1rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onClick={() => handleViewProfile(mentor.id)}
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
                        Ver Perfil
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorSearch;