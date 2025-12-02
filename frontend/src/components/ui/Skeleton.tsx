import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '8px',
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        backgroundColor: '#e5e7eb',
        backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
  showButton?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  lines = 3,
  showButton = true,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        {showAvatar && (
          <Skeleton width={48} height={48} borderRadius="50%" />
        )}
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={16} borderRadius="4px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="40%" height={14} borderRadius="4px" />
        </div>
      </div>

      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '80%' : '100%'}
          height={14}
          borderRadius="4px"
          style={{ marginBottom: index < lines - 1 ? '0.5rem' : '1rem' }}
        />
      ))}

      {showButton && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Skeleton width={120} height={36} borderRadius="8px" />
          <Skeleton width={36} height={36} borderRadius="8px" />
        </div>
      )}
    </div>
  );
};

export const SkeletonSessionCard: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header com avatar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Skeleton width={48} height={48} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height={18} borderRadius="4px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="50%" height={14} borderRadius="4px" />
        </div>
        <Skeleton width={60} height={24} borderRadius="12px" />
      </div>

      {/* Título */}
      <Skeleton width="90%" height={20} borderRadius="4px" />

      {/* Descrição */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="100%" height={14} borderRadius="4px" />
        <Skeleton width="85%" height={14} borderRadius="4px" />
      </div>

      {/* Informações */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Skeleton width={100} height={16} borderRadius="4px" />
        <Skeleton width={80} height={16} borderRadius="4px" />
        <Skeleton width={120} height={16} borderRadius="4px" />
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Skeleton width={140} height={36} borderRadius="8px" />
        <Skeleton width={36} height={36} borderRadius="8px" />
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number; CardComponent?: React.FC }> = ({
  count = 3,
  CardComponent = SkeletonCard,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </div>
  );
};

