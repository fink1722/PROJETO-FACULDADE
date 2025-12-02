import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import goalRoutes from './routes/goalRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar banco de dados (cria tabelas)
import './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Central do Mentor funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      mentors: '/api/mentors',
      sessions: '/api/sessions',
      documents: '/api/documents',
      goals: '/api/goals'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/goals', goalRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor rodando!');
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/`);
  console.log('\n✨ Endpoints disponíveis:');
  console.log('  - POST   /api/auth/register');
  console.log('  - POST   /api/auth/login');
  console.log('  - GET    /api/auth/me');
  console.log('  - GET    /api/mentors');
  console.log('  - GET    /api/mentors/:id');
  console.log('  - GET    /api/sessions');
  console.log('  - POST   /api/sessions');
  console.log('  - GET    /api/documents');
  console.log('  - POST   /api/documents');
  console.log('  - GET    /api/goals');
  console.log('  - POST   /api/goals');
});

export default app;
