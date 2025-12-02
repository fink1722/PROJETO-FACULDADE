import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

class User {
  /**
   * Busca usuário por email
   * @param {string} email
   * @returns {Promise<Object|undefined>}
   */
  static async findByEmail(email) {
    return await db('SELECT * FROM users WHERE email = ?').get(email);
  }

  /**
   * Busca usuário por ID
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  static async findById(id) {
    return await db('SELECT * FROM users WHERE id = ?').get(id);
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const { id, name, email, password, role, userType, avatar, profileImageUrl } = userData;

    await db(`INSERT INTO users (id, name, email, password, role, userType, avatar, profileImageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, email, password, role || 'user', userType, avatar || null, profileImageUrl || null);

    return { id };
  }

  /**
   * Atualiza um usuário
   * @param {string} id
   * @param {Object} userData
   * @returns {Promise<void>}
   */
  static async update(id, userData) {
    const { name, email, avatar, profileImageUrl } = userData;

    await db(`UPDATE users
      SET name = ?, email = ?, avatar = ?, profileImageUrl = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .run(name, email, avatar, profileImageUrl, id);
  }

  /**
   * Deleta um usuário
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await db('DELETE FROM users WHERE id = ?').run(id);
  }

  /**
   * Lista todos os usuários
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  static async findAll(options = {}) {
    const { limit = 50, offset = 0 } = options;
    return await db('SELECT id, name, email, role, userType, avatar, profileImageUrl, createdAt FROM users LIMIT ? OFFSET ?')
      .all(limit, offset);
  }
}

export default User;
