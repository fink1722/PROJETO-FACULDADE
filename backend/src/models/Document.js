import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

class Document {
  /**
   * Busca documento por ID
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  static async findById(id) {
    const document = await db('SELECT * FROM documents WHERE id = ?').get(id);

    if (document) {
      document.tags = (await db('SELECT tag FROM document_tags WHERE documentId = ?').all(id)).map(t => t.tag);
      document.isPublic = document.isPublic === 1;
    }

    return document;
  }

  /**
   * Lista todos os documentos com filtros
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const { sessionId, mentorId, fileType, search, limit = 50, offset = 0 } = filters;

    let query = 'SELECT * FROM documents WHERE 1=1';
    const params = [];

    if (sessionId) {
      query += ' AND sessionId = ?';
      params.push(sessionId);
    }
    if (mentorId) {
      query += ' AND mentorId = ?';
      params.push(mentorId);
    }
    if (fileType) {
      query += ' AND fileType = ?';
      params.push(fileType);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const documents = await db(query).all(...params);

    // Buscar tags para cada documento
    for (let doc of documents) {
      doc.tags = (await db('SELECT tag FROM document_tags WHERE documentId = ?').all(doc.id)).map(t => t.tag);
      doc.isPublic = doc.isPublic === 1;
    }

    return documents;
  }

  /**
   * Cria um novo documento
   * @param {Object} documentData
   * @returns {Promise<Object>}
   */
  static async create(documentData) {
    const {
      id, sessionId, mentorId, title, description, fileUrl,
      fileName, fileType, fileSize, tags, isPublic, language, thumbnailUrl
    } = documentData;

    await db(`INSERT INTO documents (id, sessionId, mentorId, title, description, fileUrl, fileName, fileType, fileSize, isPublic, language, thumbnailUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id, sessionId, mentorId, title, description || '', fileUrl,
        fileName, fileType, fileSize || 0, isPublic ? 1 : 0,
        language || null, thumbnailUrl || null
      );

    // Inserir tags
    if (tags && Array.isArray(tags)) {
      for (let tag of tags) {
        await db('INSERT INTO document_tags (documentId, tag) VALUES (?, ?)').run(id, tag);
      }
    }

    return { id };
  }

  /**
   * Atualiza um documento
   * @param {string} id
   * @param {Object} documentData
   * @returns {Promise<void>}
   */
  static async update(id, documentData) {
    const { title, description, isPublic } = documentData;

    await db('UPDATE documents SET title = ?, description = ?, isPublic = ? WHERE id = ?')
      .run(title, description, isPublic ? 1 : 0, id);
  }

  /**
   * Deleta um documento
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    await db('DELETE FROM documents WHERE id = ?').run(id);
  }

  /**
   * Incrementa contador de visualizações
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async incrementViewCount(id) {
    await db('UPDATE documents SET viewCount = viewCount + 1 WHERE id = ?').run(id);
  }

  /**
   * Incrementa contador de downloads
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async incrementDownloadCount(id) {
    await db('UPDATE documents SET downloadCount = downloadCount + 1 WHERE id = ?').run(id);
  }

  /**
   * Busca documentos por sessionId
   * @param {string} sessionId
   * @returns {Promise<Array>}
   */
  static async findBySessionId(sessionId) {
    const documents = await db('SELECT * FROM documents WHERE sessionId = ? ORDER BY uploadedAt DESC').all(sessionId);

    for (let doc of documents) {
      doc.tags = (await db('SELECT tag FROM document_tags WHERE documentId = ?').all(doc.id)).map(t => t.tag);
      doc.isPublic = doc.isPublic === 1;
    }

    return documents;
  }
}

export default Document;
