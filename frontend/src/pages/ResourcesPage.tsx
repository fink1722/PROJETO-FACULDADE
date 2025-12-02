import React, { useState } from 'react';
import { Search, BookOpen, Video, FileText, Download, Star, Filter, Target, TrendingUp, FolderOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf' | 'template';
  category: string;
  rating: number;
  downloads: number;
  author: string;
  duration?: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  tags: string[];
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Guia Completo de Programação Web',
    description: 'Aprenda HTML, CSS e JavaScript do zero ao avançado com exemplos práticos.',
    type: 'article',
    category: 'Programação',
    rating: 4.8,
    downloads: 1250,
    author: 'Maria Santos',
    level: 'iniciante',
    tags: ['HTML', 'CSS', 'JavaScript', 'Web Development']
  },
  {
    id: '2',
    title: 'Introdução ao React',
    description: 'Tutorial em vídeo sobre os conceitos fundamentais do React.',
    type: 'video',
    category: 'Programação',
    rating: 4.9,
    downloads: 890,
    author: 'João Silva',
    duration: '2h 30min',
    level: 'intermediario',
    tags: ['React', 'JavaScript', 'Frontend']
  },
  {
    id: '3',
    title: 'Template de Currículo Profissional',
    description: 'Modelo de currículo otimizado para área de tecnologia.',
    type: 'template',
    category: 'Carreira',
    rating: 4.7,
    downloads: 2100,
    author: 'Ana Costa',
    level: 'iniciante',
    tags: ['Currículo', 'Carreira', 'Trabalho']
  },
  {
    id: '4',
    title: 'Fundamentos de Matemática Aplicada',
    description: 'PDF completo com exercícios e soluções de matemática.',
    type: 'pdf',
    category: 'Matemática',
    rating: 4.6,
    downloads: 750,
    author: 'Carlos Lima',
    level: 'intermediario',
    tags: ['Matemática', 'Cálculo', 'Estatística']
  },
  {
    id: '5',
    title: 'Como Estudar Eficientemente',
    description: 'Dicas e técnicas para maximizar seu aprendizado.',
    type: 'article',
    category: 'Estudo',
    rating: 4.8,
    downloads: 1500,
    author: 'Pedro Oliveira',
    level: 'iniciante',
    tags: ['Estudo', 'Produtividade', 'Aprendizado']
  },
  {
    id: '6',
    title: 'Preparação para OAB',
    description: 'Material completo para o exame da Ordem dos Advogados.',
    type: 'pdf',
    category: 'Direito',
    rating: 4.9,
    downloads: 3200,
    author: 'Dr. Rafael Mendes',
    level: 'avancado',
    tags: ['OAB', 'Direito', 'Exame']
  },
  {
    id: '7',
    title: 'Inglês para Programadores',
    description: 'Vídeo-aulas focadas no vocabulário técnico em inglês.',
    type: 'video',
    category: 'Idiomas',
    rating: 4.7,
    downloads: 1800,
    author: 'Sarah Johnson',
    duration: '3h 15min',
    level: 'intermediario',
    tags: ['Inglês', 'Programação', 'Tecnologia']
  },
  {
    id: '8',
    title: 'Planejamento de Estudos',
    description: 'Template para organizar seus estudos e metas acadêmicas.',
    type: 'template',
    category: 'Estudo',
    rating: 4.6,
    downloads: 950,
    author: 'Lucas Martins',
    level: 'iniciante',
    tags: ['Organização', 'Estudo', 'Produtividade']
  }
];

const categories = ['Todos', 'Programação', 'Carreira', 'Matemática', 'Estudo', 'Idiomas', 'Direito'];
const levels = ['Todos', 'iniciante', 'intermediario', 'avancado'];

const ResourcesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || resource.category === selectedCategory;
    const matchesLevel = selectedLevel === 'Todos' || resource.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={20} className="text-red-500" />;
      case 'pdf':
        return <FileText size={20} className="text-red-600" />;
      case 'template':
        return <Download size={20} className="text-blue-500" />;
      default:
        return <BookOpen size={20} className="text-green-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'iniciante':
        return 'success';
      case 'intermediario':
        return 'warning';
      case 'avancado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Estatísticas dos recursos
  const totalResources = mockResources.length;
  const totalDownloads = mockResources.reduce((sum, resource) => sum + resource.downloads, 0);
  const avgRating = (mockResources.reduce((sum, resource) => sum + resource.rating, 0) / totalResources).toFixed(1);
  const categoriesCount = new Set(mockResources.map(r => r.category)).size;

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
              <FolderOpen size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Recursos Educacionais
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Materiais gratuitos para acelerar seu aprendizado
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Acesse artigos, vídeos, PDFs e templates para potencializar seus estudos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="outline" size="sm">
            <Filter size={16} style={{ marginRight: '0.5rem' }} />
            Filtros Avançados
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{totalResources}</h3>
            <p className="stat-label">Recursos Disponíveis</p>
            <div className="stat-trend">
              <span className="text-blue-600 text-sm">Todas as categorias</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Download className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{totalDownloads.toLocaleString()}</h3>
            <p className="stat-label">Downloads Totais</p>
            <div className="stat-trend">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 text-sm">+15% este mês</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">
            <Star className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{avgRating}</h3>
            <p className="stat-label">Avaliação Média</p>
            <div className="stat-trend">
              <span className="text-yellow-600 text-sm">Excelente qualidade</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <Target className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{categoriesCount}</h3>
            <p className="stat-label">Categorias</p>
            <div className="stat-trend">
              <span className="text-purple-600 text-sm">Áreas diversificadas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="main-grid">
        
        {/* Left Column - Search and Filters */}
        <div className="content-column">
          
          {/* Search Card */}
          <Card className="section-card">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon section-icon-blue">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="section-title">Buscar Recursos</h2>
                  <p className="section-subtitle">Encontre materiais que correspondem ao seu interesse</p>
                </div>
              </div>
            </div>
            
            <div className="sessions-list">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Filters Card */}
          <Card className="section-card">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon section-icon-green">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="section-title">Filtros</h2>
                  <p className="section-subtitle">Refine sua busca por categoria e nível</p>
                </div>
              </div>
            </div>
            
            <div className="sessions-list space-y-4">
              
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Categoria</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`p-2 text-sm font-medium rounded-lg text-left ${
                        selectedCategory === category
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Nível</h3>
                <div className="space-y-2">
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full p-2 text-sm font-medium rounded-lg text-left ${
                        selectedLevel === level
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {level === 'Todos' ? 'Todos os níveis' : 
                       level === 'iniciante' ? 'Iniciante' :
                       level === 'intermediario' ? 'Intermediário' : 'Avançado'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Resources List */}
        <div className="sidebar-column">
          
          {/* Results Summary */}
          <Card className="sidebar-card">
            <div className="sidebar-header">
              <h3 className="sidebar-title">Resultados</h3>
            </div>
            <div className="quick-actions">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{filteredResources.length}</div>
                <div className="text-sm text-gray-600">Recurso(s) encontrado(s)</div>
              </div>
            </div>
          </Card>

          {/* Resources List */}
          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <Card className="sidebar-card">
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum recurso encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou termo de busca
                  </p>
                  <Button variant="primary" onClick={() => {
                    setSelectedCategory('Todos');
                    setSelectedLevel('Todos');
                    setSearchTerm('');
                  }}>
                    Limpar Filtros
                  </Button>
                </div>
              </Card>
            ) : (
              filteredResources.map((resource) => (
                <Card key={resource.id} className="sidebar-card">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{resource.title}</h4>
                          <Badge variant={getLevelColor(resource.level)} size="sm">
                            {resource.level === 'iniciante' ? 'Iniciante' :
                             resource.level === 'intermediario' ? 'Intermediário' : 'Avançado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{resource.author}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{resource.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{resource.rating}</span>
                      </div>
                      <span>{resource.downloads.toLocaleString()} downloads</span>
                      {resource.duration && <span>{resource.duration}</span>}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="info" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 2 && (
                        <Badge variant="info" size="sm">
                          +{resource.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;