import express from 'express';
import {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  getMentorsBySpecialties
} from '../controllers/mentorController.js';
import { authenticate, isMentor, authorize } from '../middleware/auth.js';
import {
  validateCreateMentor,
  validateUpdateMentor,
  validateGetMentorById,
  validateDeleteMentor,
  validateListMentors
} from '../validators/mentorValidator.js';

const router = express.Router();

// Rotas públicas
router.get('/', validateListMentors, getAllMentors);
router.get('/specialties', getMentorsBySpecialties);
router.get('/:id', validateGetMentorById, getMentorById);

// Rotas protegidas
router.post('/', validateCreateMentor, authenticate, createMentor);
router.put('/:id', validateUpdateMentor, authenticate, updateMentor);
router.delete('/:id', validateDeleteMentor, authenticate, deleteMentor);

export default router;
