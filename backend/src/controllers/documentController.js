import { randomUUID } from 'crypto';
import { Document, Mentor, Session } from '../models/index.js';

export const getAllDocuments = async (req, res) => {
  try {
    const { sessionId, mentorId, fileType, search, limit, offset } = req.query;
    const documents = await Document.findAll({ 
      sessionId, 
      mentorId, 
      fileType, 
      search, 
      limit: Math.min(parseInt(limit) || 50, 100), 
      offset: parseInt(offset) || 0 
    });
    res.json({ 
      success: true, 
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar documentos', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Documento não encontrado' });

    await Document.incrementViewCount(req.params.id);

    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar documento', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const createdDocument = await Document.findById(documentId);

    res.status(201).json({ 
      success: true, 
      message: 'Documento criado com sucesso', 
      data: createdDocument
    });
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar documento', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const updatedDocument = await Document.findById(req.params.id);

    res.json({ 
      success: true, 
      message: 'Documento atualizado com sucesso',
      data: updatedDocument
    });
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar documento', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    res.json({ 
      success: true, 
      message: 'Documento deletado com sucesso',
      data: { documentId: req.params.id }
    });
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar documento', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
