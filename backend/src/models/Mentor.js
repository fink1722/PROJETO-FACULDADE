import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

class Mentor {
  /**
   * Busca mentor por ID
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  static async findById(id) {
    const mentor = await db('SELECT * FROM mentors WHERE id = ?').get(id);

    if (mentor) {
      // Buscar especialidades
      const specialties = await db('SELECT specialty FROM mentor_specialties WHERE mentorId = ?').all(id);
      mentor.specialties = specialties.map(s => s.specialty);

      // Buscar disponibilidade
      mentor.availability = await db('SELECT * FROM mentor_availability WHERE mentorId = ?').all(id);

      // Parsear arrays JSON
      mentor.languages = mentor.languages ? JSON.parse(mentor.languages) : [];
      mentor.certifications = mentor.certifications ? JSON.parse(mentor.certifications) : [];
    }

    return mentor;
  }

  /**
   * Busca mentor por userId
   * @param {string} userId
   * @returns {Promise<Object|undefined>}
   */
  static async findByUserId(userId) {
    const mentor = await db('SELECT * FROM mentors WHERE userId = ?').get(userId);

    if (mentor) {
      const specialties = await db('SELECT specialty FROM mentor_specialties WHERE mentorId = ?').all(mentor.id);
      mentor.specialties = specialties.map(s => s.specialty);
      mentor.availability = await db('SELECT * FROM mentor_availability WHERE mentorId = ?').all(mentor.id);
      mentor.languages = mentor.languages ? JSON.parse(mentor.languages) : [];
      mentor.certifications = mentor.certifications ? JSON.parse(mentor.certifications) : [];
    }

    return mentor;
  }

  /**
   * Lista todos os mentores com filtros
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const { search, specialty, minRating, limit = 50, offset = 0 } = filters;

    let query = 'SELECT DISTINCT m.* FROM mentors m';
    const params = [];
    const conditions = [];

    if (specialty) {
      query += ' INNER JOIN mentor_specialties ms ON m.id = ms.mentorId';
      conditions.push('ms.specialty = ?');
      params.push(specialty);
    }

    if (search) {
      conditions.push('(m.name LIKE ? OR m.bio LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minRating) {
      conditions.push('m.rating >= ?');
      params.push(minRating);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.rating DESC, m.totalSessions DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const mentors = await db(query).all(...params);

    // Buscar especialidades para cada mentor
    for (let mentor of mentors) {
      const specialties = await db('SELECT specialty FROM mentor_specialties WHERE mentorId = ?').all(mentor.id);
      mentor.specialties = specialties.map(s => s.specialty);
      mentor.languages = mentor.languages ? JSON.parse(mentor.languages) : [];
      mentor.certifications = mentor.certifications ? JSON.parse(mentor.certifications) : [];
    }

    return mentors;
  }

  /**
   * Cria um novo mentor
   * @param {Object} mentorData
   * @returns {Promise<Object>}
   */
  static async create(mentorData) {
    const {
      id, userId, name, email, avatar, profileImageUrl, bio,
      experience, rating, totalSessions, hourlyRate,
      specialties, languages, certifications
    } = mentorData;

    await db(`INSERT INTO mentors (id, userId, name, email, avatar, profileImageUrl, bio, experience, rating, totalSessions, hourlyRate, languages, certifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id, userId, name, email, avatar || null, profileImageUrl || null,
        bio || '', experience || 0, rating || 0, totalSessions || 0,
        hourlyRate || 0, JSON.stringify(languages || []),
        JSON.stringify(certifications || [])
      );

    // Inserir especialidades
    if (specialties && Array.isArray(specialties)) {
      for (let specialty of specialties) {
        await db('INSERT INTO mentor_specialties (mentorId, specialty) VALUES (?, ?)').run(id, specialty);
      }
    }

    return { id };
  }

  /**
   * Atualiza um mentor
   * @param {string} id
   * @param {Object} mentorData
   * @returns {Promise<void>}
   */
  static async update(id, mentorData) {
    const { bio, experience, hourlyRate, specialties, languages, certifications, avatar, profileImageUrl } = mentorData;

    await db(`UPDATE mentors
      SET bio = ?, experience = ?, hourlyRate = ?, languages = ?, certifications = ?, avatar = ?, profileImageUrl = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .run(
        bio, experience, hourlyRate,
        JSON.stringify(languages),
        JSON.stringify(certifications),
        avatar,
        profileImageUrl,
        id
      );

    // Atualizar especialidades
    if (specialties && Array.isArray(specialties)) {
      await db('DELETE FROM mentor_specialties WHERE mentorId = ?').run(id);
      for (let specialty of specialties) {
        await db('INSERT INTO mentor_specialties (mentorId, specialty) VALUES (?, ?)').run(id, specialty);
      }
    }
  }

  /**
   * Deleta um mentor
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await db('DELETE FROM mentors WHERE id = ?').run(id);
  }

  /**
   * Lista todas as especialidades únicas
   * @returns {Promise<Array>}
   */
  static async getAllSpecialties() {
    const result = await db('SELECT DISTINCT specialty FROM mentor_specialties ORDER BY specialty').all();
    return result.map(r => r.specialty);
  }

  /**
   * Incrementa o contador de sessões do mentor
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async incrementTotalSessions(id) {
    await db('UPDATE mentors SET totalSessions = totalSessions + 1 WHERE id = ?').run(id);
  }
}

export default Mentor;
