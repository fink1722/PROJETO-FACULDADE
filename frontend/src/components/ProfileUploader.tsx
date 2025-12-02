// src/components/ProfileUploader.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Button } from './ui/Button';
import { Upload, AlertCircle, Loader, Check } from 'lucide-react';

/**
 * Converte um arquivo de imagem para uma string Base64.
 * Isso nos permite salvar a imagem no localStorage 100% frontend.
 */
const toBase64 = (file: File): Promise<string> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ProfileUploader: React.FC = () => {
  const { user, updateUser } = useAuth(); // Pegamos a função do context
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para criar o preview da imagem selecionada
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    // Limpa a URL do objeto da memória quando o componente for desmontado
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // Lida com a seleção do arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Opcional: Limite de tamanho (ex: 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Imagem muito grande. Limite de 2MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
      setError('Arquivo inválido. Por favor, selecione uma imagem.');
    }
  };

  /**
   * Salva a imagem de perfil usando a API
   */
  const handleSaveImage = async () => {
    if (!selectedFile || !user) {
      setError('Nenhum arquivo selecionado.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Converte a imagem para Base64
      const base64Image = await toBase64(selectedFile);

      // 2. Envia para a API
      const response = await authService.updateProfile({ profileImageUrl: base64Image });

      // 3. Atualiza o estado local do AuthContext
      updateUser({ profileImageUrl: base64Image });

      alert('Foto de perfil atualizada com sucesso!');
      setSelectedFile(null); // Limpa a seleção
      setPreview(null); // Limpa o preview

    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível atualizar a foto de perfil.');
      console.error('Erro ao salvar foto:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
      {/* O "botão" de upload estilizado */}
      <label 
        htmlFor="file-upload" 
        style={{
          display: 'block',
          padding: '0.75rem 1rem',
          backgroundColor: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#f97316';
          e.currentTarget.style.backgroundColor = '#fff7ed';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }}
      >
        <input 
          id="file-upload"
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }} // Esconde o input feio
          disabled={isLoading}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#374151' }}>
          <Upload size={18} />
          <span>{selectedFile ? 'Trocar imagem' : 'Escolher imagem'}</span>
        </div>
      </label>

      {/* Preview */}
      {preview && (
        <img 
          src={preview} 
          alt="Preview" 
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginTop: '1rem', border: '3px solid #eee' }} 
        />
      )}
      
      {/* Botão de Salvar (só aparece se uma imagem for selecionada) */}
      {selectedFile && (
        <Button
          variant="primary"
          onClick={handleSaveImage}
          disabled={isLoading}
          style={{ 
            width: '100%', 
            marginTop: '1rem', 
            display: 'flex', 
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Botão verde "Salvar"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
        >
          {isLoading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {isLoading ? 'Salvando...' : 'Salvar Imagem'}
        </Button>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <p style={{ color: 'red', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
};

export default ProfileUploader;