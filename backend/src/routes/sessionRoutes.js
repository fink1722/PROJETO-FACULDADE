import express from 'express';
import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  joinSession
} from '../controllers/sessionController.js';
import { authenticate, isMentor, optionalAuthenticate } from '../middleware/auth.js';
import {
  validateCreateSession,
  validateUpdateSession,
  validateGetSessionById,
  validateDeleteSession,
  validateListSessions,
  validateJoinSession
} from '../validators/sessionValidator.js';

const router = express.Router();

// Rotas públicas (com autenticação opcional para mostrar isEnrolled)
router.get('/', validateListSessions, optionalAuthenticate, getAllSessions);
router.get('/:id', validateGetSessionById, optionalAuthenticate, getSessionById);

// Rotas protegidas
router.post('/', validateCreateSession, authenticate, isMentor, createSession);
router.put('/:id', validateUpdateSession, authenticate, updateSession);
router.delete('/:id', validateDeleteSession, authenticate, deleteSession);
router.post('/:id/join', validateJoinSession, authenticate, joinSession);

export default router;
