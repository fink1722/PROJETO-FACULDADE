import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

class Goal {
  /**
   * Busca meta por ID
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  static async findById(id) {
    return await db('SELECT * FROM goals WHERE id = ?').get(id);
  }

  /**
   * Lista todas as metas de um usuário com filtros
   * @param {string} userId
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findByUserId(userId, filters = {}) {
    const { status, category, limit = 50, offset = 0 } = filters;

    let query = 'SELECT * FROM goals WHERE userId = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY priority DESC, createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    return await db(query).all(...params);
  }

  /**
   * Cria uma nova meta
   * @param {Object} goalData
   * @returns {Promise<Object>}
   */
  static async create(goalData) {
    const { id, userId, title, description, category, priority, status, progress, targetDate } = goalData;

    await db(`INSERT INTO goals (id, userId, title, description, category, priority, status, progress, targetDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id, userId, title, description || '', category,
        priority || 'medium', status || 'not-started',
        progress || 0, targetDate || null
      );

    return { id };
  }

  /**
   * Atualiza uma meta
   * @param {string} id
   * @param {Object} goalData
   * @returns {Promise<void>}
   */
  static async update(id, goalData) {
    const { title, description, category, priority, status, progress, targetDate } = goalData;

    await db(`UPDATE goals
      SET title = ?, description = ?, category = ?, priority = ?, status = ?, progress = ?, targetDate = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .run(title, description, category, priority, status, progress, targetDate, id);
  }

  /**
   * Deleta uma meta
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await db('DELETE FROM goals WHERE id = ?').run(id);
  }

  /**
   * Atualiza o progresso de uma meta
   * @param {string} id
   * @param {number} progress
   * @returns {Promise<void>}
   */
  static async updateProgress(id, progress) {
    await db('UPDATE goals SET progress = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(progress, id);
  }

  /**
   * Lista todas as metas (admin)
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const { limit = 50, offset = 0 } = filters;
    return await db('SELECT * FROM goals ORDER BY createdAt DESC LIMIT ? OFFSET ?').all(limit, offset);
  }
}

export default Goal;
