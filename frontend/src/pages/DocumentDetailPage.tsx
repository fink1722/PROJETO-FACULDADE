import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { mockDocuments, mockMentors, mockSessions } from '../data/mockData';
import {
  ArrowLeft,
  Download,
  Eye,
  Share2,
  Heart,
  Calendar,
  User,
  FileText,
  File,
  FileSpreadsheet,
  FileArchive,
  Code,
  Image as ImageIcon,
  Video,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Lock,
  Globe,
  Tag,
  ChevronRight
} from 'lucide-react';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewCount, setViewCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  // Encontrar o documento
  const document = mockDocuments.find(d => d.id === id);
  const mentor = document ? mockMentors.find(m => m.id === document.mentorId) : null;
  const session = document ? mockSessions.find(s => s.id === document.sessionId) : null;

  // Atualizar contadores ao carregar
  React.useEffect(() => {
    if (document) {
      setViewCount(document.viewCount + 1);
      // Simular incremento de view
      document.viewCount += 1;
    }
  }, [document]);

  if (!document) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertCircle size={64} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Documento não encontrado
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            O documento que você está procurando não existe ou foi removido.
          </p>
          <Button variant="primary" onClick={() => navigate('/documents')}>
            Voltar para Documentos
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloadCount(downloadCount + 1);
    document.downloadCount += 1;
    window.open(document.fileUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: document.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: typeof document.fileType) => {
    const iconProps = { size: 64, strokeWidth: 1.5 };
    
    switch (fileType) {
      case 'pdf':
        return <FileText {...iconProps} style={{ color: '#ef4444' }} />;
      case 'pptx':
        return <File {...iconProps} style={{ color: '#f97316' }} />;
      case 'docx':
        return <FileText {...iconProps} style={{ color: '#3b82f6' }} />;
      case 'xlsx':
        return <FileSpreadsheet {...iconProps} style={{ color: '#10b981' }} />;
      case 'zip':
        return <FileArchive {...iconProps} style={{ color: '#6b7280' }} />;
      case 'code':
        return <Code {...iconProps} style={{ color: '#8b5cf6' }} />;
      case 'image':
        return <ImageIcon {...iconProps} style={{ color: '#ec4899' }} />;
      case 'video':
        return <Video {...iconProps} style={{ color: '#f59e0b' }} />;
      default:
        return <File {...iconProps} style={{ color: '#6b7280' }} />;
    }
  };

  const relatedDocuments = mockDocuments.filter(
    d => d.sessionId === document.sessionId && d.id !== document.id
  ).slice(0, 3);

  return (
    <div className="dashboard-container">
      
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/documents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280'
          }}
        >
          <ArrowLeft size={20} />
          Voltar para Documentos
        </Button>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem'
      }}
      className="document-detail-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ padding: '2rem' }}>
              {/* File Icon */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb'
                }}>
                  {getFileIcon(document.fileType)}
                </div>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {document.title}
              </h1>

              {/* Description */}
              {document.description && (
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: '1.7',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  padding: '0 1rem'
                }}>
                  {document.description}
                </p>
              )}

              {/* Main Actions */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                justifyContent: 'center'
              }}>
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 2rem'
                  }}
                >
                  <Download size={20} />
                  Baixar Documento
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Share2 size={18} />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  style={{
                    padding: '0.875rem'
                  }}
                >
                  <Heart size={18} />
                </Button>
              </div>

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                      Tags
                    </span>
                  </div>
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Session Info Card */}
          {session && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                  margin: 0
                }}>
                  Sessão Relacionada
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  {session.title}
                </h4>
                {session.topic && (
                  <Badge variant="info" size="sm" style={{ marginBottom: '1rem' }}>
                    {session.topic}
                  </Badge>
                )}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1rem'
                }}>
                  {session.description}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/sessions/${session.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Ver Sessão Completa
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}

          {/* Related Documents */}
          {relatedDocuments.length > 0 && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                  margin: 0
                }}>
                  Documentos Relacionados
                </h3>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9a3412',
                  margin: '0.25rem 0 0 0'
                }}>
                  Outros materiais da mesma sessão
                </p>
              </div>
              <div style={{ padding: '1rem' }}>
                {relatedDocuments.map(doc => {
                  const docMentor = mockMentors.find(m => m.id === doc.mentorId);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <FileText size={20} style={{ color: '#f97316', flexShrink: 0, marginTop: '0.125rem' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '0.25rem'
                          }}>
                            {doc.title}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            margin: 0
                          }}>
                            {docMentor?.name} • {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                        <ChevronRight size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* File Info Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: '1rem'
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
                margin: 0
              }}>
                Informações do Arquivo
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {/* File Name */}
                <div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Nome do Arquivo
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    fontWeight: '500',
                    wordBreak: 'break-all'
                  }}>
                    {document.fileName}
                  </p>
                </div>

                {/* File Type */}
                <div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Tipo
                  </p>
                  <Badge variant="info">
                    {document.fileType.toUpperCase()}
                  </Badge>
                </div>

                {/* File Size */}
                <div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Tamanho
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>

                {/* Uploaded Date */}
                <div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Enviado em
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {new Date(document.uploadedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Visibility */}
                <div>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    Visibilidade
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {document.isPublic ? (
                      <>
                        <Globe size={16} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                          Público
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} style={{ color: '#ef4444' }} />
                        <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '600' }}>
                          Privado
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Card */}
          <Card style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                margin: 0
              }}>
                Estatísticas
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <Download size={24} style={{ color: '#2563eb', margin: '0 auto 0.5rem' }} />
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#2563eb',
                    margin: 0
                  }}>
                    {downloadCount || document.downloadCount}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#1e40af',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Downloads
                  </p>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <Eye size={24} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                  <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#10b981',
                    margin: 0
                  }}>
                    {viewCount || document.viewCount}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#15803d',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Visualizações
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Mentor Card */}
          {mentor && (
            <Card style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
                  margin: 0
                }}>
                  Compartilhado por
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Avatar name={mentor.name} size="lg" />
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {mentor.name}
                    </h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {mentor.experience} anos de experiência
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/mentors/${mentor.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Ver Perfil
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .document-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default DocumentDetailPage;

