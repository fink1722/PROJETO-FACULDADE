// EXEMPLO: Como buscar e listar mentores do backend

import { useState, useEffect } from 'react';
import { mentorService } from '../services';

const MentorListExample = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);

      // Buscar mentores do backend
      const response = await mentorService.getAll();

      if (response.success) {
        console.log('✅ Mentores carregados:', response.data);
        setMentors(response.data);
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar mentores:', err);
      setError('Erro ao carregar mentores');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando mentores...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="mentor-list">
      <h1>Mentores Disponíveis</h1>

      <div className="mentors-grid">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card">
            <div className="mentor-avatar">{mentor.avatar}</div>
            <h3>{mentor.name}</h3>
            <p>{mentor.bio}</p>

            <div className="mentor-info">
              <span>⭐ {mentor.rating}</span>
              <span>📚 {mentor.totalSessions} sessões</span>
              <span>💼 {mentor.experience} anos</span>
            </div>

            <div className="mentor-specialties">
              {mentor.specialties.map((spec: string, index: number) => (
                <span key={index} className="specialty-tag">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorListExample;
