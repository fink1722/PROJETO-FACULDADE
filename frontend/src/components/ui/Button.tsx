import React from 'react';

interface ButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error' | 'default' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    outline: 'bg-transparent text-orange-600 border border-orange-600 hover:bg-orange-600 hover:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent transition-all duration-200',
    error: 'bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    default: 'bg-gray-500 hover:bg-gray-600 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    success: 'bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    info: 'bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export { Button };