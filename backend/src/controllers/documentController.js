import { randomUUID } from 'crypto';
import { Document, Mentor, Session } from '../models/index.js';

export const getAllDocuments = async (req, res) => {
  try {
    const { sessionId, mentorId, fileType, search, limit, offset } = req.query;
    const documents = await Document.findAll({ sessionId, mentorId, fileType, search, limit, offset });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar documentos', error: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Documento não encontrado' });

    await Document.incrementViewCount(req.params.id);

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar documento', error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { sessionId, mentorId, title, fileUrl, fileName, fileType, tags, description, isPublic, language, thumbnailUrl, fileSize } = req.body;

    if (!sessionId || !mentorId || !title || !fileUrl || !fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor não encontrado' });
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    const documentId = randomUUID();

    await Document.create({
      id: documentId,
      sessionId,
      mentorId,
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      tags,
      isPublic: isPublic !== false,
      language,
      thumbnailUrl
    });

    await Session.updateHasDocuments(sessionId, true);

    res.status(201).json({ success: true, message: 'Documento criado', data: { documentId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao criar documento', error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Documento não encontrado' });

    const mentor = await Mentor.findById(document.mentorId);
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    await Document.update(req.params.id, {
      title: title || document.title,
      description: description || document.description,
      isPublic: isPublic !== undefined ? isPublic : document.isPublic
    });

    res.json({ success: true, message: 'Documento atualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar documento', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Documento não encontrado' });

    const mentor = await Mentor.findById(document.mentorId);
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    await Document.delete(req.params.id);
    res.json({ success: true, message: 'Documento deletado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar documento', error: error.message });
  }
};

export const incrementDownloadCount = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Documento não encontrado' });

    await Document.incrementDownloadCount(req.params.id);
    res.json({ success: true, message: 'Download contado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro', error: error.message });
  }
};
