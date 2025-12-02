import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User as UserIcon, GraduationCap, Briefcase, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'mentor' | 'aprendiz'>('aprendiz');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeSelection = (type: 'mentor' | 'aprendiz') => {
    setUserType(type);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    const success = await register(name, email, password, userType);

    if (success) {
      navigate('/');
    } else {
      setError('Este email já está cadastrado');
    }

    setIsLoading(false);
  };

  const passwordStrength = password.length >= 8 ? 'forte' : password.length >= 6 ? 'média' : 'fraca';
  // Removido passwordStrengthColor não utilizado

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'white' }}>
      
      {/* Left Side - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem' 
      }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          
          {/* Logo */}
          <div style={{ marginBottom: '2.5rem' }}>
            <img 
              src="/src/assets/images/logo-central-do-mentor.png" 
              alt="Central do Mentor" 
              style={{ height: '2.5rem', marginBottom: '2rem' }}
            />
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '0.5rem',
              letterSpacing: '-0.025em'
            }}>
              {step === 1 ? 'Como você quer começar?' : 'Criar sua conta'}
            </h1>
            <p style={{ fontSize: '1rem', color: '#6b7280' }}>
              {step === 1 ? 'Escolha o perfil que melhor se adequa a você' : 'Complete seus dados para começar'}
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  backgroundColor: step >= 1 ? '#f97316' : '#e5e7eb',
                  color: step >= 1 ? 'white' : '#6b7280',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}>
                  {step > 1 ? <Check size={20} /> : '1'}
                </div>
                <div style={{
                  width: '6rem',
                  height: '0.25rem',
                  backgroundColor: step >= 2 ? '#f97316' : '#e5e7eb',
                  transition: 'all 0.3s',
                  margin: '0 0.5rem'
                }}></div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  backgroundColor: step >= 2 ? '#f97316' : '#e5e7eb',
                  color: step >= 2 ? 'white' : '#6b7280',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}>
                  2
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', color: step >= 1 ? '#111827' : '#6b7280', fontWeight: step >= 1 ? '500' : '400' }}>
                Escolher perfil
              </span>
              <span style={{ fontSize: '0.875rem', color: step >= 2 ? '#111827' : '#6b7280', fontWeight: step >= 2 ? '500' : '400' }}>
                Criar conta
              </span>
            </div>
          </div>

          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                
                {/* Aprendiz Card */}
                <button
                  onClick={() => handleTypeSelection('aprendiz')}
                  style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    border: '2px solid #e5e7eb',
                    padding: '2rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#8b5cf6';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      backgroundColor: '#ede9fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <GraduationCap size={24} style={{ color: '#8b5cf6' }} />
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                    Sou Aprendiz
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Busco mentoria e orientação para desenvolver minhas habilidades.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      'Participar de sessões abertas',
                      'Conectar com mentores',
                      'Receber feedbacks'
                    ].map((text, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={16} style={{ color: '#16a34a' }} />
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Mentor Card */}
                <button
                  onClick={() => handleTypeSelection('mentor')}
                  style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    border: '2px solid #e5e7eb',
                    padding: '2rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      backgroundColor: '#fed7aa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}>
                      <Briefcase size={24} style={{ color: '#f97316' }} />
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
                    Sou Mentor
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Quero compartilhar conhecimento e ajudar outros a crescerem.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      'Criar sessões em grupo',
                      'Gerenciar participantes',
                      'Impactar carreiras'
                    ].map((text, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={16} style={{ color: '#16a34a' }} />
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '28rem', margin: '0 auto' }}>
              
              {/* Selected Type Badge */}
              <div style={{
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {userType === 'aprendiz' ? (
                    <>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#ede9fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <GraduationCap size={20} style={{ color: '#8b5cf6' }} />
                      </div>
                      <span style={{ fontWeight: '500', color: '#111827' }}>Cadastro como Aprendiz</span>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#fed7aa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Briefcase size={20} style={{ color: '#f97316' }} />
                      </div>
                      <span style={{ fontWeight: '500', color: '#111827' }}>Cadastro como Mentor</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Alterar
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Name */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '0.375rem'
                  }}>
                    Nome completo
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '0.875rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }}>
                      <UserIcon size={20} style={{ color: '#9ca3af' }} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Seu nome completo"
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

                {/* Email */}
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

                {/* Password */}
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
                      placeholder="Mínimo 6 caracteres"
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
                  {password && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '0.375rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div 
                            style={{
                              height: '100%',
                              backgroundColor: passwordStrength === 'forte' ? '#16a34a' : passwordStrength === 'média' ? '#d97706' : '#dc2626',
                              borderRadius: '9999px',
                              transition: 'all 0.3s',
                              width: password.length >= 8 ? '100%' : password.length >= 6 ? '66%' : '33%'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Força: {passwordStrength}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: '#374151',
                    marginBottom: '0.375rem'
                  }}>
                    Confirmar senha
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
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Digite a senha novamente"
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      {showConfirmPassword ? (
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
                    <svg style={{ width: '1rem', height: '1rem', color: '#dc2626', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#374151',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1,
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
                        Criando conta...
                      </>
                    ) : (
                      <>
                        Criar conta
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Link para Login */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  Já tem uma conta?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      fontWeight: '600', 
                      color: '#f97316',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ea580c'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#f97316'}
                  >
                    Entrar
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          background: 'linear-gradient(to bottom right, #f97316, #ea580c, #c2410c)'
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
              <UserPlus size={32} style={{ color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Junte-se à nossa comunidade
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#fed7aa',
              lineHeight: 1.75
            }}>
              Conecte-se com mentores experientes e acelere seu crescimento profissional. 
              Faça parte de uma rede de aprendizado colaborativo.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Mentoria gratuita para estudantes',
                'Comunidade ativa e colaborativa',
                'Acesso a profissionais qualificados'
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
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

export default Register;