import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Search, 
  User,
  BookOpen,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BottomNavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Definir itens de navegação baseado no tipo de usuário
  const getNavItems = (): BottomNavItem[] => {
    const commonItems = [
      { path: '/', label: 'Início', icon: Home },
      { path: '/sessions', label: 'Sessões', icon: Calendar },
    ];

    if (user?.userType === 'mentor') {
      return [
        ...commonItems,
        { path: '/create-session', label: 'Nova', icon: Plus },
        { path: '/sessions-feed', label: 'Abertas', icon: Search },
        { path: '/mentor-profile', label: 'Perfil', icon: User },
      ];
    } else {
      return [
        ...commonItems,
        { path: '/search-mentors', label: 'Tutores', icon: Search },
        { path: '/resources', label: 'Recursos', icon: BookOpen },
        { path: '/mentee-profile', label: 'Perfil', icon: User },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bottom-navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="bottom-nav-icon">
                <IconComponent 
                  size={20} 
                  className={isActive ? 'text-white' : 'text-gray-600'} 
                />
              </div>
              <span className={`bottom-nav-label ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
