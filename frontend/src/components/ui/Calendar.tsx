import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Session } from '../../types';
import { formatTime } from '../../utils/sessionUtils';

interface CalendarProps {
  sessions: Session[];
  onDateClick?: (date: Date, sessions: Session[]) => void;
  onSessionClick?: (session: Session) => void;
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: Session[];
}

const Calendar: React.FC<CalendarProps> = ({ 
  sessions, 
  onDateClick,
  onSessionClick,
  className = '' 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Nomes dos meses em português
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Nomes dos dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Função para obter o primeiro dia do mês
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Função para obter o último dia do mês
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Função para verificar se duas datas são do mesmo dia
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Função para verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Função para obter sessões de um dia específico
  const getSessionsForDay = (date: Date): Session[] => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledAt);
      return isSameDay(sessionDate, date);
    });
  };

  // Função para obter cor baseada no status da sessão
  const getSessionColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'scheduled':
        return '#3b82f6'; // azul
      case 'live':
      case 'in-progress':
        return '#10b981'; // verde
      case 'completed':
        return '#6b7280'; // cinza
      case 'cancelled':
        return '#ef4444'; // vermelho
      default:
        return '#3b82f6';
    }
  };

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Primeiro domingo

    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);

    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      const daySessions = getSessionsForDay(currentDay);
      
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
        isToday: isToday(currentDay),
        sessions: daySessions
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [currentDate, sessions]);

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Voltar para hoje
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Lidar com clique em um dia
  const handleDateClick = (day: CalendarDay) => {
    if (onDateClick) {
      onDateClick(day.date, day.sessions);
    }
  };

  // Lidar com clique em uma sessão
  const handleSessionClick = (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  // Agrupar sessões por status para exibir apenas um indicador
  const getMainSessionStatus = (sessions: Session[]) => {
    if (sessions.length === 0) return null;
    
    // Prioridade: live > upcoming > scheduled > completed > cancelled
    if (sessions.some(s => s.status === 'live' || s.status === 'in-progress')) {
      return { status: 'live', count: sessions.filter(s => s.status === 'live' || s.status === 'in-progress').length };
    }
    if (sessions.some(s => s.status === 'upcoming')) {
      return { status: 'upcoming', count: sessions.filter(s => s.status === 'upcoming').length };
    }
    if (sessions.some(s => s.status === 'scheduled')) {
      return { status: 'scheduled', count: sessions.filter(s => s.status === 'scheduled').length };
    }
    if (sessions.some(s => s.status === 'completed')) {
      return { status: 'completed', count: sessions.filter(s => s.status === 'completed').length };
    }
    
    return { status: sessions[0].status, count: sessions.length };
  };

  return (
    <div className={`calendar-container ${className}`} style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header do Calendário */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={20} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
              fontWeight: '700', 
              color: '#111827', 
              margin: '0 0 0.25rem 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#64748b', 
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {sessions.length} sessão(ões) no mês
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={goToToday}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            Hoje
          </button>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextMonth}
            style={{
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        width: '100%'
      }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#6b7280',
              padding: '0.5rem'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: '0.5rem',
        width: '100%'
      }}>
        {calendarDays.map((day, index) => {
          const mainSession = getMainSessionStatus(day.sessions);
          const sessionColor = mainSession ? getSessionColor(mainSession.status) : null;

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              style={{
                minHeight: '100px',
                border: day.isToday ? '2px solid #f97316' : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '0.5rem',
                backgroundColor: day.isCurrentMonth ? 'white' : '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                opacity: day.isCurrentMonth ? 1 : 0.5,
                overflow: 'hidden',
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (day.isCurrentMonth) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = day.isToday ? '#f97316' : '#d1d5db';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = day.isCurrentMonth ? 'white' : '#f9fafb';
                e.currentTarget.style.borderColor = day.isToday ? '#f97316' : '#e5e7eb';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Número do dia */}
              <div style={{
                fontSize: '0.875rem',
                fontWeight: day.isToday ? '700' : '500',
                color: day.isToday ? '#f97316' : day.isCurrentMonth ? '#111827' : '#9ca3af',
                marginBottom: '0.25rem'
              }}>
                {day.date.getDate()}
              </div>

              {/* Indicadores de sessões */}
              {day.sessions.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.25rem',
                  maxHeight: '60px',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}>
                  {day.sessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      onClick={(e) => handleSessionClick(e, session)}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.375rem',
                        borderRadius: '6px',
                        backgroundColor: getSessionColor(session.status) + '20',
                        color: getSessionColor(session.status),
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: `1px solid ${getSessionColor(session.status)}40`,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.2s',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 2px 4px ${getSessionColor(session.status)}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={`${formatTime(new Date(session.scheduledAt))} - ${session.title}`}
                    >
                      {formatTime(new Date(session.scheduledAt))} - {session.title.length > 20 ? session.title.substring(0, 20) + '...' : session.title}
                    </div>
                  ))}
                  {day.sessions.length > 3 && (
                    <div style={{
                      fontSize: '0.65rem',
                      color: '#6b7280',
                      fontWeight: '500',
                      textAlign: 'center',
                      padding: '0.125rem'
                    }}>
                      +{day.sessions.length - 3} mais
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '4px',
            backgroundColor: '#3b82f6'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Próximas/Agendadas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '4px',
            backgroundColor: '#10b981'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ao Vivo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '4px',
            backgroundColor: '#6b7280'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Concluídas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '4px',
            backgroundColor: '#ef4444'
          }} />
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Canceladas</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

