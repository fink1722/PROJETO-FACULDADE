import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

class Session {
  /**
   * Busca sessão por ID
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  static async findById(id) {
    const session = await db('SELECT * FROM sessions WHERE id = ?').get(id);

    if (session) {
      session.requirements = (await db('SELECT requirement FROM session_requirements WHERE sessionId = ?').all(id)).map(r => r.requirement);
      session.objectives = (await db('SELECT objective FROM session_objectives WHERE sessionId = ?').all(id)).map(o => o.objective);
      session.documents = (await db('SELECT id FROM documents WHERE sessionId = ?').all(id)).map(d => d.id);
      session.hasDocuments = session.hasDocuments === 1;
    }

    return session;
  }

  /**
   * Lista todas as sessões com filtros
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const { status, mentorId, menteeId, limit = 50, offset = 0 } = filters;

    let query = 'SELECT * FROM sessions WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (mentorId) {
      query += ' AND mentorId = ?';
      params.push(mentorId);
    }
    if (menteeId) {
      query += ' AND menteeId = ?';
      params.push(menteeId);
    }

    query += ' ORDER BY scheduledAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const sessions = await db(query).all(...params);

    // Buscar requirements e objectives para cada sessão
    for (let session of sessions) {
      session.requirements = (await db('SELECT requirement FROM session_requirements WHERE sessionId = ?').all(session.id)).map(r => r.requirement);
      session.objectives = (await db('SELECT objective FROM session_objectives WHERE sessionId = ?').all(session.id)).map(o => o.objective);
      session.hasDocuments = session.hasDocuments === 1;
    }

    return sessions;
  }

  /**
   * Cria uma nova sessão
   * @param {Object} sessionData
   * @returns {Promise<Object>}
   */
  static async create(sessionData) {
    const {
      id, mentorId, menteeId, title, description, topic,
      scheduledAt, duration, maxParticipants, status,
      meetingLink, requirements, objectives
    } = sessionData;

    await db(`INSERT INTO sessions (id, mentorId, menteeId, title, description, topic, scheduledAt, duration, maxParticipants, currentParticipants, status, meetingLink)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id, mentorId, menteeId || null, title, description || '',
        topic || '', scheduledAt, duration, maxParticipants || null,
        0, status || 'scheduled', meetingLink || null
      );

    // Inserir requirements
    if (requirements && Array.isArray(requirements)) {
      for (let req of requirements) {
        await db('INSERT INTO session_requirements (sessionId, requirement) VALUES (?, ?)').run(id, req);
      }
    }

    // Inserir objectives
    if (objectives && Array.isArray(objectives)) {
      for (let obj of objectives) {
        await db('INSERT INTO session_objectives (sessionId, objective) VALUES (?, ?)').run(id, obj);
      }
    }

    return { id };
  }

  /**
   * Atualiza uma sessão
   * @param {string} id
   * @param {Object} sessionData
   * @returns {Promise<void>}
   */
  static async update(id, sessionData) {
    const { title, description, topic, scheduledAt, duration, status, meetingLink, maxParticipants } = sessionData;

    await db(`UPDATE sessions
      SET title = ?, description = ?, topic = ?, scheduledAt = ?, duration = ?, status = ?, meetingLink = ?, maxParticipants = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .run(title, description, topic, scheduledAt, duration, status, meetingLink, maxParticipants, id);
  }

  /**
   * Deleta uma sessão
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await db('DELETE FROM sessions WHERE id = ?').run(id);
  }

  /**
   * Adiciona um participante à sessão
   * @param {string} sessionId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async addParticipant(sessionId, userId) {
    await db('INSERT INTO session_participants (sessionId, userId) VALUES (?, ?)').run(sessionId, userId);
    await db('UPDATE sessions SET currentParticipants = currentParticipants + 1 WHERE id = ?').run(sessionId);
  }

  /**
   * Verifica se usuário já está inscrito na sessão
   * @param {string} sessionId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  static async isUserEnrolled(sessionId, userId) {
    const result = await db('SELECT id FROM session_participants WHERE sessionId = ? AND userId = ?').get(sessionId, userId);
    return !!result;
  }

  /**
   * Remove um participante da sessão
   * @param {string} sessionId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async removeParticipant(sessionId, userId) {
    await db('DELETE FROM session_participants WHERE sessionId = ? AND userId = ?').run(sessionId, userId);
    await db('UPDATE sessions SET currentParticipants = currentParticipants - 1 WHERE id = ?').run(sessionId);
  }

  /**
   * Atualiza o status de hasDocuments
   * @param {string} sessionId
   * @param {boolean} hasDocuments
   * @returns {Promise<void>}
   */
  static async updateHasDocuments(sessionId, hasDocuments) {
    await db('UPDATE sessions SET hasDocuments = ? WHERE id = ?').run(hasDocuments ? 1 : 0, sessionId);
  }
}

export default Session;
