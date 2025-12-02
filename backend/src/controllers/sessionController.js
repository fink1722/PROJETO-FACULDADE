import { randomUUID } from 'crypto';
import { Session, Mentor } from '../models/index.js';

/**
 * GET /api/sessions
 * Lista todas as sessões com filtros opcionais
 * 
 * Query Params:
 * - status: Filtrar por status (scheduled, in-progress, completed, cancelled, upcoming, live)
 * - mentorId: Filtrar por mentor específico
 * - limit: Limite de resultados (padrão: 50, máximo: 100)
 * - offset: Offset para paginação (padrão: 0)
 * 
 * Resposta: Array de sessões com informações completas
 */
export const getAllSessions = async (req, res) => {
  try {
    const { status, mentorId, limit = 50, offset = 0 } = req.query;
    
    const sessions = await Session.findAll({ 
      status, 
      mentorId, 
      limit: Math.min(parseInt(limit) || 50, 100), 
      offset: parseInt(offset) || 0 
    });

    // Adicionar isEnrolled para cada sessão (se usuário autenticado)
    if (req.user) {
      const sessionsWithEnrollment = await Promise.all(
        sessions.map(async (session) => {
          const isEnrolled = await Session.isUserEnrolled(session.id, req.user.id);
          return { ...session, isEnrolled };
        })
      );
      return res.json({ 
        success: true, 
        data: sessionsWithEnrollment,
        count: sessionsWithEnrollment.length,
        pagination: {
          limit: parseInt(limit) || 50,
          offset: parseInt(offset) || 0
        }
      });
    }

    res.json({ 
      success: true, 
      data: sessions,
      count: sessions.length,
      pagination: {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar sessões', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/sessions/:id
 * Busca uma sessão específica por ID
 * 
 * Params:
 * - id: UUID da sessão
 * 
 * Resposta: Objeto com dados completos da sessão
 */
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada',
        data: null
      });
    }

    // Buscar informações do mentor
    const mentor = await Mentor.findById(session.mentorId);
    const mentorInfo = mentor ? {
      id: mentor.id,
      name: mentor.name,
      avatar: mentor.avatar,
      profileImageUrl: mentor.profileImageUrl,
      bio: mentor.bio
    } : null;

    // Verificar se usuário está inscrito (se autenticado)
    let isEnrolled = false;
    if (req.user) {
      isEnrolled = await Session.isUserEnrolled(id, req.user.id);
    }

    res.json({ 
      success: true, 
      data: { 
        ...session, 
        isEnrolled,
        mentor: mentorInfo
      } 
    });
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar sessão', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/sessions
 * Cria uma nova sessão de mentoria
 * 
 * Body (obrigatório):
 * - mentorId: UUID do mentor
 * - title: Título da sessão (5-200 caracteres)
 * - scheduledAt: Data/hora agendada (ISO 8601, mínimo 6h de antecedência)
 * - duration: Duração em minutos (15-480)
 * 
 * Body (opcional):
 * - description: Descrição da sessão (máx 1000 caracteres)
 * - topic: Tópico da sessão (máx 100 caracteres)
 * - maxParticipants: Número máximo de participantes (1-1000)
 * - meetingLink: URL da reunião
 * - requirements: Array de requisitos (máx 10 itens)
 * - objectives: Array de objetivos (máx 10 itens)
 * 
 * Requer autenticação: Sim (mentor ou admin)
 * 
 * Resposta: ID da sessão criada
 */
export const createSession = async (req, res) => {
  try {
    const { 
      mentorId, 
      title, 
      scheduledAt, 
      duration, 
      maxParticipants, 
      description, 
      topic, 
      requirements, 
      objectives,
      meetingLink
    } = req.body;

    // Verificar se mentor existe
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mentor não encontrado' 
      });
    }

    // Verificar permissão (apenas o próprio mentor ou admin pode criar sessão)
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Você não tem permissão para criar sessões para este mentor' 
      });
    }

    // Validar data (mínimo 6 horas de antecedência - já validado pelo validator)
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const minDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    
    if (scheduledDate < minDate) {
      return res.status(400).json({
        success: false,
        message: 'A sessão deve ser agendada com no mínimo 6 horas de antecedência'
      });
    }

    const sessionId = randomUUID();

    await Session.create({
      id: sessionId,
      mentorId,
      title: title.trim(),
      description: description?.trim() || '',
      topic: topic?.trim() || '',
      scheduledAt,
      duration: parseInt(duration),
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      requirements: requirements || [],
      objectives: objectives || [],
      status: 'scheduled',
      meetingLink: meetingLink || null
    });

    // Buscar sessão criada para retornar dados completos
    const createdSession = await Session.findById(sessionId);

    res.status(201).json({ 
      success: true, 
      message: 'Sessão criada com sucesso', 
      data: createdSession
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar sessão', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/sessions/:id
 * Atualiza uma sessão existente
 * 
 * Params:
 * - id: UUID da sessão
 * 
 * Body (todos opcionais):
 * - title: Título da sessão
 * - description: Descrição
 * - topic: Tópico
 * - scheduledAt: Nova data/hora (mínimo 6h de antecedência)
 * - duration: Duração em minutos
 * - status: Novo status
 * - maxParticipants: Número máximo de participantes
 * - meetingLink: Link da reunião
 * 
 * Requer autenticação: Sim (mentor dono da sessão ou admin)
 * 
 * Resposta: Dados atualizados da sessão
 */
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, duration, status, topic, maxParticipants, meetingLink } = req.body;

    // Buscar sessão
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }

    // Verificar permissão
    const mentor = await Mentor.findById(session.mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor não encontrado'
      });
    }

    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar esta sessão'
      });
    }

    // Validar nova data se fornecida
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();
      const minDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      
      if (scheduledDate < minDate) {
        return res.status(400).json({
          success: false,
          message: 'A sessão deve ser agendada com no mínimo 6 horas de antecedência'
        });
      }
    }

    // Validar status se fornecido
    if (status && !['scheduled', 'in-progress', 'completed', 'cancelled', 'upcoming', 'live'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    // Preparar dados para atualização
    const updateData = {
      title: title?.trim() || session.title,
      description: description?.trim() !== undefined ? description.trim() : session.description,
      topic: topic?.trim() !== undefined ? topic.trim() : session.topic,
      scheduledAt: scheduledAt || session.scheduledAt,
      duration: duration ? parseInt(duration) : session.duration,
      status: status || session.status,
      maxParticipants: maxParticipants !== undefined ? parseInt(maxParticipants) : session.maxParticipants,
      meetingLink: meetingLink !== undefined ? meetingLink : session.meetingLink
    };

    await Session.update(id, updateData);

    // Buscar sessão atualizada
    const updatedSession = await Session.findById(id);

    res.json({ 
      success: true, 
      message: 'Sessão atualizada com sucesso',
      data: updatedSession
    });
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar sessão', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/sessions/:id
 * Deleta uma sessão
 * 
 * Params:
 * - id: UUID da sessão
 * 
 * Requer autenticação: Sim (mentor dono da sessão ou admin)
 * 
 * Observação: Sessões com participantes podem ter restrições de exclusão
 * 
 * Resposta: Confirmação de exclusão
 */
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }

    // Verificar permissão
    const mentor = await Mentor.findById(session.mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor não encontrado'
      });
    }

    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar esta sessão'
      });
    }

    // Verificar se sessão já foi iniciada ou completada
    if (session.status === 'in-progress' || session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar uma sessão que já foi iniciada ou completada'
      });
    }

    // Deletar sessão (cascade delete remove requirements, objectives e participants)
    await Session.delete(id);

    res.json({ 
      success: true, 
      message: 'Sessão deletada com sucesso',
      data: { sessionId: id }
    });
  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar sessão', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/sessions/:id/join
 * Inscreve o usuário autenticado em uma sessão
 * 
 * Params:
 * - id: UUID da sessão
 * 
 * Requer autenticação: Sim
 * 
 * Validações:
 * - Sessão deve existir
 * - Sessão deve aceitar participantes (maxParticipants definido)
 * - Sessão não deve estar cheia
 * - Usuário não deve estar já inscrito
 * 
 * Resposta: Confirmação de inscrição
 */
export const joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[joinSession] Tentativa de inscrição - SessionId: ${id}, UserId: ${req.user?.id}`);
    
    // Verificar se usuário está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Você precisa estar autenticado para se inscrever em uma sessão'
      });
    }
    
    const session = await Session.findById(id);
    if (!session) {
      console.log(`[joinSession] Sessão não encontrada: ${id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Sessão não encontrada' 
      });
    }

    console.log(`[joinSession] Sessão encontrada:`, {
      id: session.id,
      title: session.title,
      maxParticipants: session.maxParticipants,
      currentParticipants: session.currentParticipants,
      status: session.status
    });

    // Verificar se sessão está em status válido para inscrição
    if (!['scheduled', 'upcoming'].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: `Não é possível se inscrever em uma sessão com status "${session.status}". Apenas sessões agendadas ou próximas aceitam inscrições.`
      });
    }

    // Verificar se sessão aceita inscrições
    if (!session.maxParticipants || session.maxParticipants === 0) {
      console.log(`[joinSession] Sessão não aceita inscrições: maxParticipants = ${session.maxParticipants}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Esta sessão não aceita inscrições' 
      });
    }

    // Verificar se sessão está cheia
    if (session.currentParticipants >= session.maxParticipants) {
      console.log(`[joinSession] Sessão cheia: ${session.currentParticipants}/${session.maxParticipants}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Sessão cheia. Não há vagas disponíveis.' 
      });
    }

    // Verificar se usuário já está inscrito
    const isEnrolled = await Session.isUserEnrolled(id, req.user.id);
    if (isEnrolled) {
      console.log(`[joinSession] Usuário já inscrito: ${req.user.id}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Você já está inscrito nesta sessão' 
      });
    }

    // Verificar se usuário não é o mentor da sessão
    const mentor = await Mentor.findById(session.mentorId);
    if (mentor && mentor.userId === req.user.id) {
      console.log(`[joinSession] Mentor tentando se inscrever na própria sessão`);
      return res.status(400).json({
        success: false,
        message: 'O mentor não pode se inscrever em sua própria sessão'
      });
    }

    // Inscrever usuário
    console.log(`[joinSession] Inscrendo usuário ${req.user.id} na sessão ${id}`);
    await Session.addParticipant(id, req.user.id);

    // Buscar sessão atualizada
    const updatedSession = await Session.findById(id);

    console.log(`[joinSession] Inscrição realizada com sucesso. Participantes: ${updatedSession.currentParticipants}/${updatedSession.maxParticipants}`);

    res.json({ 
      success: true, 
      message: 'Inscrição realizada com sucesso',
      data: {
        sessionId: id,
        currentParticipants: updatedSession.currentParticipants,
        maxParticipants: updatedSession.maxParticipants,
        isEnrolled: true
      }
    });
  } catch (error) {
    console.error('[joinSession] Erro ao inscrever-se na sessão:', error);
    console.error('[joinSession] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao se inscrever na sessão', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
