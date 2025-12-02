import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { User, Mentor } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    const role = userType === 'mentor' ? 'mentor' : 'user';
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      userType,
      avatar
    });

    // Se for mentor, criar perfil de mentor
    if (userType === 'mentor') {
      const mentorId = randomUUID();
      await Mentor.create({
        id: mentorId,
        userId,
        name,
        email,
        avatar,
        bio: '',
        experience: 0,
        rating: 0,
        totalSessions: 0,
        hourlyRate: 0,
        specialties: [],
        languages: ['Português'],
        certifications: []
      });
    }

    const token = jwt.sign(
      { id: userId, email, role, userType },
      process.env.JWT_SECRET || 'seu_secret_jwt_muito_seguro_aqui_mude_em_producao',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: { id: userId, name, email, role, userType, avatar },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao registrar usuário', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, userType: user.userType },
      process.env.JWT_SECRET || 'seu_secret_jwt_muito_seguro_aqui_mude_em_producao',
      { expiresIn: '7d' }
    );

    // Remover password antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao fazer login', error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Remover password antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar usuário', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, profileImageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Se o email mudou, verificar se já existe
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email já está em uso' });
      }
    }

    // Atualizar dados
    await User.update(userId, {
      name: name || user.name,
      email: email || user.email,
      avatar: user.avatar,
      profileImageUrl: profileImageUrl !== undefined ? profileImageUrl : user.profileImageUrl
    });

    // Buscar usuário atualizado
    const updatedUser = await User.findById(userId);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar perfil', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/auth/account
 * Deleta a conta do usuário autenticado
 * 
 * Requer autenticação: Sim
 * 
 * Observação:
 * - Deleta o usuário e todos os dados relacionados (cascade delete)
 * - Se for mentor, deleta o perfil de mentor também
 * - Se for aprendiz, deleta o perfil de aprendiz também
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Se for mentor, verificar se tem sessões futuras
    if (user.userType === 'mentor') {
      const db = (await import('../config/database.js')).default.prepare;
      const mentor = await Mentor.findByUserId(userId);
      
      if (mentor) {
        const futureSessions = await db(`
          SELECT COUNT(*) as count 
          FROM sessions 
          WHERE mentorId = ? 
          AND status IN ('scheduled', 'upcoming', 'live')
        `).get(mentor.id);

        if (futureSessions && futureSessions.count > 0) {
          return res.status(400).json({
            success: false,
            message: 'Não é possível deletar a conta com sessões futuras agendadas. Cancele ou conclua as sessões primeiro.'
          });
        }
      }
    }

    // Deletar usuário (cascade delete remove mentor/mentee e dados relacionados)
    await User.delete(userId);

    res.json({ 
      success: true, 
      message: 'Conta deletada com sucesso',
      data: { userId }
    });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar conta', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
