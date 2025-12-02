import { randomUUID } from 'crypto';
import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

export const getAllGoals = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM goals WHERE userId = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY priority DESC, createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const goals = await db(query).all(...params);
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar metas', error: error.message });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const goal = await db('SELECT * FROM goals WHERE id = ?').get(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Meta não encontrada' });
    if (goal.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar meta', error: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, description, category, priority, progress, targetDate } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Título e categoria são obrigatórios' });
    }

    const goalId = randomUUID();

    await db(`INSERT INTO goals (id, userId, title, description, category, priority, status, progress, targetDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(goalId, req.user.id, title, description || '', category, priority || 'medium', 'not-started', progress || 0, targetDate || null);

    res.status(201).json({ success: true, message: 'Meta criada', data: { goalId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao criar meta', error: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { title, description, category, priority, status, progress, targetDate } = req.body;
    const goal = await db('SELECT * FROM goals WHERE id = ?').get(req.params.id);

    if (!goal) return res.status(404).json({ success: false, message: 'Meta não encontrada' });
    if (goal.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    await db(`UPDATE goals SET title = ?, description = ?, category = ?, priority = ?, status = ?, progress = ?, targetDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(title || goal.title, description || goal.description, category || goal.category, priority || goal.priority, status || goal.status, progress !== undefined ? progress : goal.progress, targetDate || goal.targetDate, req.params.id);

    res.json({ success: true, message: 'Meta atualizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar meta', error: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await db('SELECT userId FROM goals WHERE id = ?').get(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Meta não encontrada' });
    if (goal.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão' });
    }

    await db('DELETE FROM goals WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Meta deletada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar meta', error: error.message });
  }
};
