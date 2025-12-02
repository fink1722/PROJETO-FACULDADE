import express from 'express';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  incrementDownloadCount
} from '../controllers/documentController.js';
import { authenticate, isMentor } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);

// Rotas protegidas
router.post('/', authenticate, isMentor, createDocument);
router.put('/:id', authenticate, updateDocument);
router.delete('/:id', authenticate, deleteDocument);
router.post('/:id/download', authenticate, incrementDownloadCount);

export default router;
