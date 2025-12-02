import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware para verificar resultados da validação
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validação para criar mentor
 */
export const validateCreateMentor = [
  body('userId')
    .optional()
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser um endereço válido')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Biografia deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('experience')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Anos de experiência deve ser entre 0 e 100'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Taxa por hora deve ser entre 0 e 10000'),
  
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Especialidades deve ser um array')
    .custom((value) => {
      if (value.length > 20) {
        throw new Error('Máximo de 20 especialidades permitidas');
      }
      return value.every(spec => typeof spec === 'string' && spec.length >= 2 && spec.length <= 50);
    }),
  
  body('languages')
    .optional()
    .isArray()
    .withMessage('Idiomas deve ser um array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Máximo de 10 idiomas permitidos');
      }
      return value.every(lang => typeof lang === 'string' && lang.length >= 2 && lang.length <= 50);
    }),
  
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certificações deve ser um array')
    .custom((value) => {
      if (value.length > 50) {
        throw new Error('Máximo de 50 certificações permitidas');
      }
      return value.every(cert => typeof cert === 'string' && cert.length >= 2 && cert.length <= 200);
    }),
  
  body('avatar')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Avatar deve ter no máximo 10 caracteres'),
  
  body('profileImageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem de perfil deve ser uma URL válida'),
  
  validate
];

/**
 * Validação para atualizar mentor
 */
export const validateUpdateMentor = [
  param('id')
    .isUUID()
    .withMessage('ID do mentor deve ser um UUID válido'),
  
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Biografia deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('experience')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Anos de experiência deve ser entre 0 e 100'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Taxa por hora deve ser entre 0 e 10000'),
  
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Especialidades deve ser um array')
    .custom((value) => {
      if (value.length > 20) {
        throw new Error('Máximo de 20 especialidades permitidas');
      }
      return value.every(spec => typeof spec === 'string' && spec.length >= 2 && spec.length <= 50);
    }),
  
  body('languages')
    .optional()
    .isArray()
    .withMessage('Idiomas deve ser um array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Máximo de 10 idiomas permitidos');
      }
      return value.every(lang => typeof lang === 'string' && lang.length >= 2 && lang.length <= 50);
    }),
  
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certificações deve ser um array')
    .custom((value) => {
      if (value.length > 50) {
        throw new Error('Máximo de 50 certificações permitidas');
      }
      return value.every(cert => typeof cert === 'string' && cert.length >= 2 && cert.length <= 200);
    }),
  
  body('avatar')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Avatar deve ter no máximo 10 caracteres'),
  
  body('profileImageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem de perfil deve ser uma URL válida'),
  
  validate
];

/**
 * Validação para buscar mentor por ID
 */
export const validateGetMentorById = [
  param('id')
    .isUUID()
    .withMessage('ID do mentor deve ser um UUID válido'),
  
  validate
];

/**
 * Validação para deletar mentor
 */
export const validateDeleteMentor = [
  param('id')
    .isUUID()
    .withMessage('ID do mentor deve ser um UUID válido'),
  
  validate
];

/**
 * Validação para listar mentores (query params)
 */
export const validateListMentors = [
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Busca deve ter entre 2 e 100 caracteres'),
  
  query('specialty')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Especialidade deve ter entre 2 e 50 caracteres'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating mínimo deve ser entre 0 e 5'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve ser entre 1 e 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser um número positivo'),
  
  validate
];

