import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import type { Document } from '../types';
import { mockMentors, mockSessions } from '../data/mockData';
import {
  FileText,
  File,
  FileSpreadsheet,
  FileArchive,
  Code,
  Image,
  Video,
  Download,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Lock
} from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
}

// Função para formatar tamanho de arquivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Função para obter ícone por tipo de arquivo
const getFileIcon = (fileType: Document['fileType']) => {
  const iconProps = { size: 32, strokeWidth: 1.5 };
  
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
      return <Image {...iconProps} style={{ color: '#ec4899' }} />;
    case 'video':
      return <Video {...iconProps} style={{ color: '#f59e0b' }} />;
    default:
      return <File {...iconProps} style={{ color: '#6b7280' }} />;
  }
};

// Função para obter cor de fundo por tipo
const getFileTypeColor = (fileType: Document['fileType']) => {
  switch (fileType) {
    case 'pdf':
      return { bg: '#fef2f2', border: '#fecaca' };
    case 'pptx':
      return { bg: '#fff7ed', border: '#fed7aa' };
    case 'docx':
      return { bg: '#eff6ff', border: '#bfdbfe' };
    case 'xlsx':
      return { bg: '#f0fdf4', border: '#bbf7d0' };
    case 'zip':
      return { bg: '#f9fafb', border: '#e5e7eb' };
    case 'code':
      return { bg: '#faf5ff', border: '#e9d5ff' };
    case 'image':
      return { bg: '#fdf4ff', border: '#f5d0fe' };
    case 'video':
      return { bg: '#fffbeb', border: '#fde68a' };
    default:
      return { bg: '#f9fafb', border: '#e5e7eb' };
  }
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const navigate = useNavigate();
  const mentor = mockMentors.find(m => m.id === document.mentorId);
  const session = mockSessions.find(s => s.id === document.sessionId);
  const colors = getFileTypeColor(document.fileType);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simular download
    window.open(document.fileUrl, '_blank');
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/documents/${document.id}`);
    }
  };

  // Verificar se o documento é novo (últimos 7 dias)
  const isNew = (new Date().getTime() - new Date(document.uploadedAt).getTime()) < (7 * 24 * 60 * 60 * 1000);
  const isPopular = document.downloadCount > 50;

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = colors.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      {/* Ícone do tipo de arquivo */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: colors.bg,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          {getFileIcon(document.fileType)}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!document.isPublic && (
            <div style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Lock size={12} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '0.625rem', fontWeight: '600', color: '#ef4444' }}>
                PRIVADO
              </span>
            </div>
          )}
          {isNew && (
            <Badge variant="success" size="sm">
              NOVO
            </Badge>
          )}
          {isPopular && (
            <Badge variant="warning" size="sm">
              POPULAR
            </Badge>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Título */}
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '0.5rem',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8em'
        }}>
          {document.title}
        </h3>

        {/* Descrição */}
        {document.description && (
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            lineHeight: '1.5',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1
          }}>
            {document.description}
          </p>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.375rem',
            marginBottom: '1rem'
          }}>
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" size="sm">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Mentor Info */}
        {mentor && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <Avatar name={mentor.name} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: '#374151',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {mentor.name}
              </p>
              {session && (
                <p style={{
                  fontSize: '0.6875rem',
                  color: '#9ca3af',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {session.title}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metadados */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          marginBottom: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Download size={14} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {document.downloadCount} downloads
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Eye size={14} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {document.viewCount} views
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            fontWeight: '500'
          }}>
            {formatFileSize(document.fileSize)}
          </span>
          <button
            onClick={handleDownload}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ea580c';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f97316';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Download size={14} />
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;

