import jwt from 'jsonwebtoken';
import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db('SELECT id, name, email, role, userType FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    next();
  };
};

export const isMentor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  if (req.user.userType !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas mentores podem acessar este recurso.'
    });
  }

  next();
};

// Middleware de autenticação opcional (não retorna erro se não houver token)
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db('SELECT id, name, email, role, userType FROM users WHERE id = ?').get(decoded.id);

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignora erros de autenticação no modo opcional
  }

  next();
};
