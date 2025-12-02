import { randomUUID } from 'crypto';
import { Session, Mentor } from '../models/index.js';

export const getAllSessions = async (req, res) => {
  try {
    const { status, mentorId, limit, offset } = req.query;
    const sessions = await Session.findAll({ status, mentorId, limit, offset });

    // Adicionar isEnrolled para cada sessão (se usuário autenticado)
    if (req.user) {
      const sessionsWithEnrollment = await Promise.all(
        sessions.map(async (session) => {
          const isEnrolled = await Session.isUserEnrolled(session.id, req.user.id);
          return { ...session, isEnrolled };
        })
      );
      return res.json({ success: true, data: sessionsWithEnrollment });
    }

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar sessões', error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada' });

    // Verificar se usuário está inscrito (se autenticado)
    let isEnrolled = false;
    if (req.user) {
      isEnrolled = await Session.isUserEnrolled(req.params.id, req.user.id);
    }

    res.json({ success: true, data: { ...session, isEnrolled } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar sessão', error: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    const { mentorId, title, scheduledAt, duration, maxParticipants, description, topic, requirements, objectives, meetingLink } = req.body;

    if (!mentorId || !title || !scheduledAt || !duration) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor não encontrado' });
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    const sessionId = randomUUID();

    await Session.create({
      id: sessionId,
      mentorId,
      title,
      description,
      topic,
      scheduledAt,
      duration,
      maxParticipants,
      meetingLink,
      requirements,
      objectives,
      status: 'scheduled'
    });

    res.status(201).json({ success: true, message: 'Sessão criada', data: { sessionId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao criar sessão', error: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, duration, status, topic, maxParticipants } = req.body;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada' });

    const mentor = await Mentor.findById(session.mentorId);
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    await Session.update(id, {
      title: title || session.title,
      description: description || session.description,
      topic: topic || session.topic,
      scheduledAt: scheduledAt || session.scheduledAt,
      duration: duration || session.duration,
      status: status || session.status,
      maxParticipants: maxParticipants !== undefined ? maxParticipants : session.maxParticipants
    });

    res.json({ success: true, message: 'Sessão atualizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar sessão', error: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada' });

    const mentor = await Mentor.findById(session.mentorId);
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    await Session.delete(req.params.id);
    res.json({ success: true, message: 'Sessão deletada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar sessão', error: error.message });
  }
};

export const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada' });
    if (!session.maxParticipants) return res.status(400).json({ success: false, message: 'Sessão não aceita inscrições' });
    if (session.currentParticipants >= session.maxParticipants) return res.status(400).json({ success: false, message: 'Sessão cheia' });

    const isEnrolled = await Session.isUserEnrolled(req.params.id, req.user.id);
    if (isEnrolled) return res.status(400).json({ success: false, message: 'Já inscrito' });

    await Session.addParticipant(req.params.id, req.user.id);

    res.json({ success: true, message: 'Inscrição realizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao se inscrever', error: error.message });
  }
};

export const getMyEnrolledSessions = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Buscar todas as sessões
    const allSessions = await Session.findAll({ limit: 100, offset: 0 });

    // Filtrar apenas as sessões em que o usuário está inscrito
    const enrolledSessions = [];
    for (const session of allSessions) {
      const isEnrolled = await Session.isUserEnrolled(session.id, req.user.id);
      if (isEnrolled) {
        enrolledSessions.push({ ...session, isEnrolled: true });
      }
    }

    res.json({ success: true, data: enrolledSessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar sessões inscritas', error: error.message });
  }
};

export const leaveSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada' });

    const isEnrolled = await Session.isUserEnrolled(req.params.id, req.user.id);
    if (!isEnrolled) return res.status(400).json({ success: false, message: 'Você não está inscrito nesta sessão' });

    await Session.removeParticipant(req.params.id, req.user.id);

    res.json({ success: true, message: 'Inscrição cancelada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao cancelar inscrição', error: error.message });
  }
};
