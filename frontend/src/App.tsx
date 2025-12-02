import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CalendarDays,
  Plus, 
  Search, 
  User, 
  GraduationCap,
  Bell,
  LogOut,
  CheckCircle,
  Info,
  BookOpen
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import BottomNavigation from './components/ui/BottomNavigation';
import OnboardingTour from './components/OnboardingTour';
import WelcomeModal from './components/WelcomeModal';


// Lazy load page components for better performance
const Dashboard = lazy(() => import('./pages/Home'));
const MentorProfile = lazy(() => import('./pages/MentorProfile'));
const MenteeProfile = lazy(() => import('./pages/MenteeProfile'));
const MentorSearch = lazy(() => import('./pages/MentorSearch'));
const SessionsPage = lazy(() => import('./pages/SessionsPage'));
const SessionDetailPage = lazy(() => import('./pages/SessionDetailPage'));
const SessionsFeed = lazy(() => import('./pages/SessionsFeed'));
const CreateSessionPage = lazy(() => import('./pages/CreateSessionPage'));
const DocumentsLibrary = lazy(() => import('./pages/DocumentsLibrary'));
const DocumentDetailPage = lazy(() => import('./pages/DocumentDetailPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth(); // 'user' agora pode ter 'profileImageUrl'
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/sessions', label: 'Sessões', icon: Calendar },
    { path: '/calendar', label: 'Calendário', icon: CalendarDays },
  ];

  // Itens de navegação específicos para Mentores
  const mentorNavItems = [
    { path: '/sessions-feed', label: 'Sessões Abertas', icon: Search },
    { path: '/create-session', label: 'Nova Sessão', icon: Plus },
  ];

  // Itens de navegação específicos para Aprendizes
  const aprendizNavItems = [
    { path: '/sessions-feed', label: 'Sessões Abertas', icon: Search },
    { path: '/search-mentors', label: 'Buscar Mentores', icon: User },
  ];

  // Determinar qual item de perfil mostrar baseado no tipo de usuário
  const getProfileItem = () => {
    if (user?.userType === 'mentor') {
      return { path: '/mentor-profile', label: 'Meu Perfil', icon: User };
    } else {
      return { path: '/mentee-profile', label: 'Meu Perfil', icon: GraduationCap };
    }
  };

  const profileItem = getProfileItem();
  const mentoringItems = user?.userType === 'mentor' ? mentorNavItems : aprendizNavItems;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-container">
          <img 
            src="/src/assets/images/logo-central-do-mentor.png" 
            alt="Central do Mentor" 
            className="sidebar-logo-image"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Main Navigation */}
        <div className="nav-section">
          <p className="nav-section-title">Principal</p>
          <div className="nav-items">
            {mainNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mentoring Section */}
        <div className="nav-section">
          <p className="nav-section-title">Mentoria</p>
          <div className="nav-items">
            {mentoringItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Profile Section */}
        <div className="nav-section">
          <p className="nav-section-title">Perfil</p>
          <div className="nav-items">
            {(() => {
              const IconComponent = profileItem.icon;
              return (
                <Link
                  to={profileItem.path}
                  className={`sidebar-nav-item ${location.pathname === profileItem.path ? 'active' : ''}`}
                >
                  <IconComponent size={18} />
                  <span>{profileItem.label}</span>
                </Link>
              );
            })()}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div style={{
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(249, 115, 22, 0.2)',
        position: 'relative',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)';
          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)';
          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.2)';
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden', // Importante para a imagem
            boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
          }}>
            {/* Se o usuário tiver foto, mostre a <img>, senão, mostre as iniciais */}
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Perfil" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              user ? user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U'
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 0.125rem 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user ? user.name : 'Usuário'}
            </h4>
            <p style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.userType === 'mentor' ? 'Mentor' : user?.userType === 'aprendiz' ? 'Aprendiz' : 'Usuário'}
            </p>
          </div>
        </div>
        
        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
};

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = 3; // Simulando 3 notificações

  // Mock de notificações
  const notifications = [
    {
      id: '1',
      title: 'Nova sessão agendada',
      message: 'Sua sessão de mentoria foi confirmada para amanhã às 14:00',
      time: 'há 5 minutos',
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Inscrição confirmada',
      message: 'Você foi inscrito na sessão "UX Design para Iniciantes"',
      time: 'há 1 hora',
      type: 'success',
      read: false
    },
    {
      id: '3',
      title: 'Lembrete de sessão',
      message: 'Sua sessão começa em 30 minutos',
      time: 'há 2 horas',
      type: 'warning',
      read: true
    }
  ];

  const handleUserClick = () => {
    if (user?.userType === 'mentor') {
      navigate('/mentor-profile');
    } else if (user?.userType === 'aprendiz') {
      navigate('/mentee-profile');
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Fechar notificações ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="header">
      {/* Search Section - Expanded */}
      <div className="flex-1" style={{ maxWidth: '700px' }}>
        <div className="header-search">
          <input
            type="text"
            placeholder="Buscar..."
            className="header-search-input"
          />
          <div className="header-search-icon">
            <Search size={18} />
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="header-actions">
        {/* Notifications with Badge */}
        <div className="notification-container" style={{ position: 'relative' }}>
          <button 
            className="header-action-btn"
            title="Notificações"
            onClick={handleNotificationClick}
            style={{
              backgroundColor: showNotifications ? '#f9fafb' : '#ffffff',
              borderColor: showNotifications ? '#f97316' : '#e5e7eb'
            }}
          >
          <Bell size={20} />
          {notificationCount > 0 && (
              <span className="header-badge">
              {notificationCount}
            </span>
          )}
        </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  color: '#111827', 
                  margin: 0 
                }}>
                  Notificações
                </h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}>
                  {notificationCount} novas
                </span>
              </div>

              <div className="notification-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => {
                      // Aqui você pode adicionar a lógica para marcar como lida ou navegar
                      console.log('Notification clicked:', notification.id);
                    }}
                  >
                    <div className="notification-icon">
                      {notification.type === 'success' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircle size={16} style={{ color: 'white' }} />
                        </div>
                      )}
                      {notification.type === 'warning' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Bell size={16} style={{ color: 'white' }} />
                        </div>
                      )}
                      {notification.type === 'info' && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Info size={16} style={{ color: 'white' }} />
                        </div>
                      )}
                    </div>
                    <div className="notification-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#f97316',
                            marginLeft: '0.5rem',
                            flexShrink: 0,
                            marginTop: '0.25rem'
                          }}></div>
                        )}
                      </div>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        margin: '0 0 0.25rem 0',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notification-footer">
                <button style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>
                  Ver todas as notificações
        </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu with Dropdown */}
        <div className="relative">
          <div 
            className="header-avatar"
            onClick={handleUserClick}
            title={`Ir para perfil ${user?.userType === 'mentor' ? 'do mentor' : 'do aprendiz'}`}
          >
            {/* Se o usuário tiver foto, mostre a <img>, senão, mostre as iniciais */}
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Perfil" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              user ? user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'US'
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout principal com sidebar e header
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Verificar se é o primeiro login do usuário
    const userKey = `onboarding_${user.id}`;
    const hasSeenWelcome = localStorage.getItem(`${userKey}_welcome`);
    const onboardingCompleted = localStorage.getItem(`${userKey}_completed`);
    const onboardingSkipped = localStorage.getItem(`${userKey}_skipped`);

    if (!hasSeenWelcome && !onboardingCompleted && !onboardingSkipped) {
      // Mostrar modal de boas-vindas após um delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage.setItem(`${userKey}_welcome`, 'true');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
      <BottomNavigation />
      
      {/* Onboarding Tour */}
      <OnboardingTour />
      
      {/* Welcome Modal */}
      {showWelcome && user && (
        <WelcomeModal
          userType={user.userType as 'mentor' | 'aprendiz'}
          userName={user.name.split(' ')[0]}
          userId={user.id}
          onClose={handleCloseWelcome}
        />
      )}
    </div>
  );
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <Routes>
        {/* Rotas públicas */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/cadastro" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />

        {/* Rotas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sessions" element={<SessionsPage />} />
                  <Route path="/sessions/:id" element={<SessionDetailPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/sessions-feed" element={<SessionsFeed />} />
                  <Route path="/create-session" element={<CreateSessionPage />} />
                  <Route path="/documents" element={<DocumentsLibrary />} />
                  <Route path="/documents/:id" element={<DocumentDetailPage />} />
                  <Route path="/mentor-profile" element={<MentorProfile />} />
                  <Route path="/mentee-profile" element={<MenteeProfile />} />
                  <Route path="/search-mentors" element={<MentorSearch />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
