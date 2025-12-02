import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, UserCircle, GraduationCap } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        navigate('/');
      } else {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setIsLoading(true);

    try {
      const success = await login(userEmail, userPassword);

      if (success) {
        navigate('/');
      } else {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err: any) {
      console.error('Erro no login rápido:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remover scroll da página quando o componente montar
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div style={{ 
      height: '100vh', 
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex', 
      backgroundColor: 'white' 
    }}>
      
      {/* Left Side - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'center', 
        padding: '1.5rem 2rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '28rem', paddingBottom: '0.5rem' }}>
          
          {/* Logo */}
          <div style={{ marginBottom: '1rem' }}>
            <img 
              src="/src/assets/images/logo-central-do-mentor.png" 
              alt="Central do Mentor" 
              style={{ height: '5rem', marginBottom: '0.5rem', display: 'block' }}
            />
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '0.125rem',
              letterSpacing: '-0.025em'
            }}>
              Bem-vindo de volta
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Entre para acessar sua conta
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            
            {/* Email Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.375rem'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '0.875rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Mail size={20} style={{ color: '#9ca3af' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
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

            {/* Password Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.375rem'
              }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '0.875rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Lock size={20} style={{ color: '#9ca3af' }} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.75rem 0.75rem 2.75rem',
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={20} style={{ color: '#9ca3af' }} />
                  ) : (
                    <Eye size={20} style={{ color: '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(to right, #f97316, #ea580c)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #c2410c)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #ea580c)';
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: '1.25rem', height: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <Link 
                to="/recuperar-senha" 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#6b7280',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f97316'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                right: 0, 
                top: '50%', 
                borderTop: '1px solid #e5e7eb' 
              }}></div>
              <span style={{ 
                position: 'relative', 
                backgroundColor: 'white', 
                padding: '0 1rem', 
                fontSize: '0.875rem', 
                color: '#6b7280' 
              }}>ou</span>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                Não tem uma conta?{' '}
                <Link 
                  to="/cadastro" 
                  style={{ 
                    fontWeight: '600', 
                    color: '#f97316',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#f97316'}
                >
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Login - Acesso Rápido */}
          <div style={{ 
            marginTop: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: '1px solid #e5e7eb' 
          }}>
            <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
              <p style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151',
                margin: 0
              }}>
                🚀 Acesso Rápido para Testes
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Botão Login Aprendiz */}
              <button
                type="button"
                onClick={() => handleQuickLogin('lucas@email.com', '123456')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                }}
              >
                <GraduationCap size={18} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>Entrar como Aprendiz</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Lucas Oliveira</div>
                </div>
              </button>

              {/* Botão Login Mentor */}
              <button
                type="button"
                onClick={() => handleQuickLogin('joao@email.com', '123456')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                }}
              >
                <UserCircle size={18} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>Entrar como Mentor</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>João Silva</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1" 
           style={{ overflow: 'hidden' }}
           onLoad={(e: any) => { 
             e.target.style.background = 'linear-gradient(to bottom right, #f97316, #ea580c, #c2410c)';
           }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          background: 'linear-gradient(to bottom right, #f97316, #ea580c, #c2410c)',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '28rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              marginBottom: '2rem'
            }}>
              <LogIn size={32} style={{ color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Conecte-se com mentores experientes
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#fed7aa',
              lineHeight: 1.75
            }}>
              Acesse sessões de mentoria em grupo, aprenda com profissionais qualificados e acelere seu crescimento.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Sessões abertas e colaborativas',
                'Mentores especializados e certificados',
                '100% gratuito para estudantes'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 1024px) {
          .lg\\:block {
            display: block !important;
          }
        }
        
        .hidden {
          display: none;
        }
        
        .relative {
          position: relative;
        }
        
        .w-0 {
          width: 0;
        }
        
        .flex-1 {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default Login;