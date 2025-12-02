import { randomUUID } from 'crypto';
import { Mentor, User } from '../models/index.js';

export const getAllMentors = async (req, res) => {
  try {
    const { search, specialty, minRating, limit, offset } = req.query;
    const mentors = await Mentor.findAll({ search, specialty, minRating, limit, offset });
    res.json({ success: true, data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar mentores', error: error.message });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor não encontrado' });

    res.json({ success: true, data: mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar mentor', error: error.message });
  }
};

export const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mentor não encontrado' 
      });
    }

    // Verificar permissão
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Você não tem permissão para atualizar este perfil de mentor' 
      });
    }

    const { 
      bio, 
      experience, 
      hourlyRate, 
      specialties, 
      languages, 
      certifications, 
      avatar, 
      profileImageUrl 
    } = req.body;

    // Validar dados
    if (experience !== undefined && (experience < 0 || experience > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Anos de experiência deve ser entre 0 e 100'
      });
    }

    if (hourlyRate !== undefined && (hourlyRate < 0 || hourlyRate > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Taxa por hora deve ser entre 0 e 10000'
      });
    }

    if (specialties && Array.isArray(specialties) && specialties.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 20 especialidades permitidas'
      });
    }

    if (languages && Array.isArray(languages) && languages.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 10 idiomas permitidos'
      });
    }

    if (certifications && Array.isArray(certifications) && certifications.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 50 certificações permitidas'
      });
    }

    await Mentor.update(id, {
      bio: bio !== undefined ? bio : mentor.bio,
      experience: experience !== undefined ? parseInt(experience) : mentor.experience,
      hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : mentor.hourlyRate,
      specialties: specialties !== undefined ? specialties : mentor.specialties,
      languages: languages !== undefined ? languages : mentor.languages,
      certifications: certifications !== undefined ? certifications : mentor.certifications,
      avatar: avatar !== undefined ? avatar : mentor.avatar,
      profileImageUrl: profileImageUrl !== undefined ? profileImageUrl : mentor.profileImageUrl
    });

    // Buscar mentor atualizado
    const updatedMentor = await Mentor.findById(id);

    res.json({ 
      success: true, 
      message: 'Perfil de mentor atualizado com sucesso',
      data: updatedMentor
    });
  } catch (error) {
    console.error('Erro ao atualizar mentor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar perfil de mentor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMentorsBySpecialties = async (req, res) => {
  try {
    const specialties = await Mentor.getAllSpecialties();
    res.json({ success: true, data: specialties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro', error: error.message });
  }
};

/**
 * POST /api/mentors
 * Cria um novo perfil de mentor
 * 
 * Requer autenticação: Sim (usuário deve estar autenticado e ser do tipo mentor)
 * 
 * Body:
 * - userId: UUID do usuário (opcional, usa req.user.id se não fornecido)
 * - name: Nome do mentor
 * - email: Email do mentor
 * - bio: Biografia (opcional)
 * - experience: Anos de experiência (opcional, padrão: 0)
 * - hourlyRate: Taxa por hora (opcional, padrão: 0)
 * - specialties: Array de especialidades (opcional)
 * - languages: Array de idiomas (opcional, padrão: ['Português'])
 * - certifications: Array de certificações (opcional)
 * - avatar: Avatar inicial (opcional)
 * - profileImageUrl: URL da imagem de perfil (opcional)
 */
export const createMentor = async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      email, 
      bio, 
      experience, 
      hourlyRate, 
      specialties, 
      languages, 
      certifications,
      avatar,
      profileImageUrl
    } = req.body;

    // Usar userId do body ou do usuário autenticado
    const targetUserId = userId || req.user.id;

    // Verificar se usuário existe
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Verificar permissão (apenas o próprio usuário ou admin pode criar perfil de mentor)
    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Você não tem permissão para criar perfil de mentor para este usuário' 
      });
    }

    // Verificar se usuário já tem perfil de mentor
    const existingMentor = await Mentor.findByUserId(targetUserId);
    if (existingMentor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este usuário já possui um perfil de mentor' 
      });
    }

    // Verificar se usuário é do tipo mentor
    if (user.userType !== 'mentor' && req.user.role !== 'admin') {
      return res.status(400).json({ 
        success: false, 
        message: 'Apenas usuários do tipo mentor podem ter perfil de mentor' 
      });
    }

    const mentorId = randomUUID();

    await Mentor.create({
      id: mentorId,
      userId: targetUserId,
      name: name || user.name,
      email: email || user.email,
      avatar: avatar || user.avatar,
      profileImageUrl: profileImageUrl || user.profileImageUrl,
      bio: bio || '',
      experience: experience || 0,
      rating: 0,
      totalSessions: 0,
      hourlyRate: hourlyRate || 0,
      specialties: specialties || [],
      languages: languages || ['Português'],
      certifications: certifications || []
    });

    // Buscar mentor criado
    const createdMentor = await Mentor.findById(mentorId);

    res.status(201).json({ 
      success: true, 
      message: 'Perfil de mentor criado com sucesso',
      data: createdMentor
    });
  } catch (error) {
    console.error('Erro ao criar mentor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar perfil de mentor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/mentors/:id
 * Deleta um perfil de mentor
 * 
 * Requer autenticação: Sim (mentor dono do perfil ou admin)
 * 
 * Observação: 
 * - Deleta o perfil de mentor, mas não o usuário
 * - Cascade delete remove especialidades e disponibilidade relacionadas
 * - Verifica se há sessões ativas antes de deletar
 */
export const deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;

    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mentor não encontrado' 
      });
    }

    // Verificar permissão
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Você não tem permissão para deletar este perfil de mentor' 
      });
    }

    // Verificar se mentor tem sessões futuras agendadas
    const db = (await import('../config/database.js')).default.prepare;
    const futureSessions = await db(`
      SELECT COUNT(*) as count 
      FROM sessions 
      WHERE mentorId = ? 
      AND status IN ('scheduled', 'upcoming', 'live')
    `).get(id);

    if (futureSessions && futureSessions.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar o perfil de mentor com sessões futuras agendadas. Cancele ou conclua as sessões primeiro.'
      });
    }

    // Deletar mentor (cascade delete remove specialties e availability)
    await Mentor.delete(id);

    res.json({ 
      success: true, 
      message: 'Perfil de mentor deletado com sucesso',
      data: { mentorId: id }
    });
  } catch (error) {
    console.error('Erro ao deletar mentor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar perfil de mentor', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
