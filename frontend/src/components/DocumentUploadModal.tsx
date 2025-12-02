import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { mockDocuments, mockSessions } from '../data/mockData';
import type { Document } from '../types';
import {
  X,
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  FileArchive,
  Code,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Tag,
  Lock,
  Globe
} from 'lucide-react';

interface DocumentUploadModalProps {
  sessionId?: string;
  mentorId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  sessionId,
  mentorId,
  onClose,
  onSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSession, setSelectedSession] = useState(sessionId || '');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bloqueia scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      // Usar nome do arquivo como título inicial
      setTitle(file.name.split('.').slice(0, -1).join('.'));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getFileType = (file: File): Document['fileType'] => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'ppt':
      case 'pptx': return 'pptx';
      case 'doc':
      case 'docx': return 'docx';
      case 'xls':
      case 'xlsx': return 'xlsx';
      case 'zip':
      case 'rar': return 'zip';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c': return 'code';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg': return 'image';
      case 'mp4':
      case 'avi':
      case 'mov': return 'video';
      default: return 'other';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }

    if (!selectedFile) {
      newErrors.file = 'Selecione um arquivo para upload';
    }

    if (!selectedSession) {
      newErrors.session = 'Selecione uma sessão';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedFile) return;

    setIsUploading(true);

    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Criar novo documento
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      sessionId: selectedSession,
      mentorId,
      title,
      description: description || undefined,
      fileUrl: `https://example.com/documents/${selectedFile.name}`,
      fileName: selectedFile.name,
      fileType: getFileType(selectedFile),
      fileSize: selectedFile.size,
      downloadCount: 0,
      viewCount: 0,
      uploadedAt: new Date(),
      tags: tags.length > 0 ? tags : undefined,
      isPublic
    };

    // Adicionar aos dados mock
    mockDocuments.unshift(newDocument);

    setIsUploading(false);
    
    if (onSuccess) onSuccess();
    onClose();
  };

  const mentorSessions = mockSessions.filter(s => s.mentorId === mentorId);

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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
          maxWidth: '600px',
          width: 'calc(100% - 2rem)',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.4s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          padding: '2rem',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Fechar"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              color: 'white',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.75rem',
              transition: 'all 0.2s',
              zIndex: 10,
              width: '36px',
              height: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              padding: '0.875rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <Upload size={28} color="white" strokeWidth={2} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white',
                margin: 0
              }}>
                Upload de Documento
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0
              }}>
                Compartilhe materiais com seus aprendizes
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          
          {/* File Upload Area */}
          <div
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '2rem',
              border: isDragging ? '3px dashed #f97316' : '2px dashed #d1d5db',
              borderRadius: '16px',
              backgroundColor: isDragging ? '#fff7ed' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.rar,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.jpg,.jpeg,.png,.gif,.svg,.mp4,.avi,.mov"
            />
            
            {selectedFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fff7ed',
                  borderRadius: '12px'
                }}>
                  <FileText size={32} style={{ color: '#f97316' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {selectedFile.name}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  style={{ marginLeft: 'auto' }}
                >
                  <X size={18} />
                </Button>
              </div>
            ) : (
              <>
                <Upload size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Clique ou arraste o arquivo aqui
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.75rem'
                }}>
                  Formatos suportados: PDF, PowerPoint, Word, Excel, ZIP, Código, Imagens, Vídeos
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  Tamanho máximo: 50 MB
                </p>
              </>
            )}
          </div>

          {errors.file && (
            <p style={{
              fontSize: '0.875rem',
              color: '#ef4444',
              marginTop: '-1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              {errors.file}
            </p>
          )}

          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Título do Documento <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              type="text"
              placeholder="Ex: Guia de Liderança Estratégica"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              required
              style={{
                borderColor: errors.title ? '#ef4444' : undefined
              }}
            />
            {errors.title && (
              <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Descreva o conteúdo do documento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.3s',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316';
                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Session Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Sessão Relacionada <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value);
                if (errors.session) setErrors(prev => ({ ...prev, session: '' }));
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.session ? '2px solid #ef4444' : '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.3s',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Selecione uma sessão</option>
              {mentorSessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
            {errors.session && (
              <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                {errors.session}
              </p>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Tags (opcional)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Input
                type="text"
                placeholder="Ex: Liderança, Gestão..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                style={{ flex: 1 }}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Tag size={16} />
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        marginLeft: '0.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              Visibilidade
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: isPublic ? '2px solid #f97316' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: isPublic ? '#fff7ed' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Globe size={24} style={{
                  color: isPublic ? '#f97316' : '#9ca3af',
                  margin: '0 auto 0.5rem'
                }} />
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: isPublic ? '#f97316' : '#6b7280',
                  margin: 0
                }}>
                  Público
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0.25rem 0 0 0'
                }}>
                  Todos podem acessar
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: !isPublic ? '2px solid #f97316' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: !isPublic ? '#fff7ed' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Lock size={24} style={{
                  color: !isPublic ? '#f97316' : '#9ca3af',
                  margin: '0 auto 0.5rem'
                }} />
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: !isPublic ? '#f97316' : '#6b7280',
                  margin: 0
                }}>
                  Privado
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0.25rem 0 0 0'
                }}>
                  Só participantes
                </p>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUploading}
              style={{
                flex: 2,
                background: isUploading
                  ? 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
                  : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                opacity: isUploading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isUploading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Fazer Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default DocumentUploadModal;

