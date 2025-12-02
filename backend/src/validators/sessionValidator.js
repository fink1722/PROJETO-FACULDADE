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
 * Validação para criar sessão
 */
export const validateCreateSession = [
  body('mentorId')
    .notEmpty()
    .withMessage('ID do mentor é obrigatório')
    .isUUID()
    .withMessage('ID do mentor deve ser um UUID válido'),
  
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('topic')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Tópico deve ter no máximo 100 caracteres')
    .trim(),
  
  body('scheduledAt')
    .notEmpty()
    .withMessage('Data e hora agendada são obrigatórias')
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      const minDate = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 horas a partir de agora
      
      if (scheduledDate < minDate) {
        throw new Error('A sessão deve ser agendada com no mínimo 6 horas de antecedência');
      }
      
      if (scheduledDate < now) {
        throw new Error('A data agendada não pode ser no passado');
      }
      
      return true;
    }),
  
  body('duration')
    .notEmpty()
    .withMessage('Duração é obrigatória')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duração deve ser entre 15 e 480 minutos (8 horas)'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Número máximo de participantes deve ser entre 1 e 1000'),
  
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Link da reunião deve ser uma URL válida'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requisitos deve ser um array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Máximo de 10 requisitos permitidos');
      }
      return value.every(req => typeof req === 'string' && req.length <= 200);
    }),
  
  body('objectives')
    .optional()
    .isArray()
    .withMessage('Objetivos deve ser um array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Máximo de 10 objetivos permitidos');
      }
      return value.every(obj => typeof obj === 'string' && obj.length <= 200);
    }),
  
  validate
];

/**
 * Validação para atualizar sessão
 */
export const validateUpdateSession = [
  param('id')
    .isUUID()
    .withMessage('ID da sessão deve ser um UUID válido'),
  
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres')
    .trim(),
  
  body('topic')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Tópico deve ter no máximo 100 caracteres')
    .trim(),
  
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      const minDate = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      
      if (scheduledDate < minDate) {
        throw new Error('A sessão deve ser agendada com no mínimo 6 horas de antecedência');
      }
      
      return true;
    }),
  
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duração deve ser entre 15 e 480 minutos'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'in-progress', 'completed', 'cancelled', 'upcoming', 'live'])
    .withMessage('Status inválido'),
  
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Número máximo de participantes deve ser entre 1 e 1000'),
  
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Link da reunião deve ser uma URL válida'),
  
  validate
];

/**
 * Validação para buscar sessão por ID
 */
export const validateGetSessionById = [
  param('id')
    .isUUID()
    .withMessage('ID da sessão deve ser um UUID válido'),
  
  validate
];

/**
 * Validação para deletar sessão
 */
export const validateDeleteSession = [
  param('id')
    .isUUID()
    .withMessage('ID da sessão deve ser um UUID válido'),
  
  validate
];

/**
 * Validação para listar sessões (query params)
 */
export const validateListSessions = [
  query('status')
    .optional()
    .isIn(['scheduled', 'in-progress', 'completed', 'cancelled', 'upcoming', 'live'])
    .withMessage('Status inválido'),
  
  query('mentorId')
    .optional()
    .isUUID()
    .withMessage('ID do mentor deve ser um UUID válido'),
  
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

/**
 * Validação para inscrever-se em sessão
 */
export const validateJoinSession = [
  param('id')
    .isUUID()
    .withMessage('ID da sessão deve ser um UUID válido'),
  
  validate
];

