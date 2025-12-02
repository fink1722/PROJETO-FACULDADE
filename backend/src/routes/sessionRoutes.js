import express from 'express';
import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  getMyEnrolledSessions
} from '../controllers/sessionController.js';
import { authenticate, isMentor, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// Rotas protegidas (devem vir ANTES das rotas com :id)
router.get('/my/enrolled', authenticate, getMyEnrolledSessions);
router.post('/', authenticate, isMentor, createSession);
router.post('/:id/join', authenticate, joinSession);
router.post('/:id/leave', authenticate, leaveSession);
router.put('/:id', authenticate, updateSession);
router.delete('/:id', authenticate, deleteSession);

// Rotas públicas (com autenticação opcional para mostrar isEnrolled)
router.get('/', optionalAuthenticate, getAllSessions);
router.get('/:id', optionalAuthenticate, getSessionById);

export default router;
