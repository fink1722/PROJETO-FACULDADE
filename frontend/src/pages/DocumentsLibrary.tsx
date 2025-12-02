import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import DocumentCard from '../components/DocumentCard';
import { mockDocuments, mockMentors, mockSessions } from '../data/mockData';
import type { Document } from '../types';
import {
  BookOpen,
  Search,
  Filter,
  X,
  FileText,
  File,
  FileSpreadsheet,
  FileArchive,
  Code,
  Image as ImageIcon,
  Video,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';

const DocumentsLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<Document['fileType'] | 'all'>('all');
  const [selectedMentor, setSelectedMentor] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'downloads' | 'views'>('recent');

  // Obter todas as tags únicas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockDocuments.forEach(doc => {
      doc.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Obter mentores que têm documentos
  const mentorsWithDocs = useMemo(() => {
    const mentorIds = new Set(mockDocuments.map(doc => doc.mentorId));
    return mockMentors.filter(m => mentorIds.has(m.id));
  }, []);

  // Obter sessões que têm documentos
  const sessionsWithDocs = useMemo(() => {
    const sessionIds = new Set(mockDocuments.map(doc => doc.sessionId));
    return mockSessions.filter(s => sessionIds.has(s.id));
  }, []);

  // Filtrar e ordenar documentos
  const filteredDocuments = useMemo(() => {
    let filtered = [...mockDocuments];

    // Filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtro de tipo de arquivo
    if (selectedFileType !== 'all') {
      filtered = filtered.filter(doc => doc.fileType === selectedFileType);
    }

    // Filtro de mentor
    if (selectedMentor !== 'all') {
      filtered = filtered.filter(doc => doc.mentorId === selectedMentor);
    }

    // Filtro de sessão
    if (selectedSession !== 'all') {
      filtered = filtered.filter(doc => doc.sessionId === selectedSession);
    }

    // Filtro de tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(doc => doc.tags?.includes(selectedTag));
    }

    // Ordenação
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.downloadCount + b.viewCount) - (a.downloadCount + a.viewCount));
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'views':
        filtered.sort((a, b) => b.viewCount - a.viewCount);
        break;
    }

    return filtered;
  }, [searchTerm, selectedFileType, selectedMentor, selectedSession, selectedTag, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFileType('all');
    setSelectedMentor('all');
    setSelectedSession('all');
    setSelectedTag('all');
  };

  const hasActiveFilters = searchTerm || selectedFileType !== 'all' || selectedMentor !== 'all' || 
                           selectedSession !== 'all' || selectedTag !== 'all';

  // Estatísticas
  const stats = {
    total: mockDocuments.length,
    totalDownloads: mockDocuments.reduce((sum, doc) => sum + doc.downloadCount, 0),
    totalViews: mockDocuments.reduce((sum, doc) => sum + doc.viewCount, 0),
    fileTypes: mockDocuments.reduce((acc, doc) => {
      acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const fileTypeIcons: Record<string, any> = {
    pdf: FileText,
    pptx: File,
    docx: FileText,
    xlsx: FileSpreadsheet,
    zip: FileArchive,
    code: Code,
    image: ImageIcon,
    video: Video,
    other: File
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
              <BookOpen size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.25rem 0'
              }}>
                Biblioteca de Documentos
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#f97316',
                margin: 0,
                fontWeight: '500'
              }}>
                Acesse materiais de sessões anteriores compartilhados pelos mentores
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: '0.5rem 0 0 0',
            paddingLeft: '64px'
          }}>
            Explore, pesquise e baixe documentos, slides, códigos e mais recursos educacionais
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%)',
            border: '1px solid rgba(107, 114, 128, 0.3)',
            color: '#6b7280',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Filter size={16} />
          {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
        </Button>
      </header>

      {/* Stats */}
      <section className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Documentos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Download size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDownloads}</div>
            <div className="stat-label">Total Downloads</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalViews}</div>
            <div className="stat-label">Visualizações</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{sessionsWithDocs.length}</div>
            <div className="stat-label">Sessões com Docs</div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: showFilters ? '1.5rem' : 0 }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              pointerEvents: 'none'
            }} 
          />
          <input
            type="text"
            placeholder="Buscar por título, descrição ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{
              paddingLeft: '3rem',
              width: '100%',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            {/* Tipo de Arquivo */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Tipo de Arquivo
              </label>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  outline: 'none'
                }}
              >
                <option value="all">Todos os tipos</option>
                <option value="pdf">PDF</option>
                <option value="pptx">PowerPoint</option>
                <option value="docx">Word</option>
                <option value="xlsx">Excel</option>
                <option value="zip">ZIP</option>
                <option value="code">Código</option>
                <option value="image">Imagem</option>
                <option value="video">Vídeo</option>
              </select>
            </div>

            {/* Mentor */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Mentor
              </label>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  outline: 'none'
                }}
              >
                <option value="all">Todos os mentores</option>
                {mentorsWithDocs.map(mentor => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sessão */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Sessão
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  outline: 'none'
                }}
              >
                <option value="all">Todas as sessões</option>
                {sessionsWithDocs.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  outline: 'none'
                }}
              >
                <option value="all">Todas as tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  outline: 'none'
                }}
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Populares</option>
                <option value="downloads">Mais Baixados</option>
                <option value="views">Mais Visualizados</option>
              </select>
            </div>

            {/* Limpar Filtros */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  style={{ 
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <X size={16} />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
              Filtros ativos:
            </span>
            {searchTerm && (
              <Badge variant="secondary">
                Busca: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')} 
                  style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {selectedFileType !== 'all' && (
              <Badge variant="secondary">
                Tipo: {selectedFileType}
                <button 
                  onClick={() => setSelectedFileType('all')} 
                  style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {selectedMentor !== 'all' && (
              <Badge variant="secondary">
                Mentor: {mentorsWithDocs.find(m => m.id === selectedMentor)?.name}
                <button 
                  onClick={() => setSelectedMentor('all')} 
                  style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {selectedTag !== 'all' && (
              <Badge variant="secondary">
                Tag: {selectedTag}
                <button 
                  onClick={() => setSelectedTag('all')} 
                  style={{ marginLeft: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
        </p>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '20px',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <Search size={64} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Nenhum documento encontrado
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Tente ajustar os filtros ou termo de busca
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredDocuments.map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsLibrary;

