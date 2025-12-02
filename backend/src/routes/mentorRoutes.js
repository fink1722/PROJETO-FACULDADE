import express from 'express';
import {
  getAllMentors,
  getMentorById,
  updateMentor,
  getMentorsBySpecialties
} from '../controllers/mentorController.js';
import { authenticate, isMentor } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getAllMentors);
router.get('/specialties', getMentorsBySpecialties);
router.get('/:id', getMentorById);

// Rotas protegidas (apenas mentores)
router.put('/:id', authenticate, isMentor, updateMentor);

export default router;
