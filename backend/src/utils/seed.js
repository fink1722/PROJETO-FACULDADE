import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import dbConfig from '../config/database.js';
const db = dbConfig.prepare;

console.log('🌱 Iniciando seed do banco de dados...\n');

// Aguardar banco inicializar
await new Promise(resolve => setTimeout(resolve, 500));

// Limpar tabelas
console.log('🗑️  Limpando tabelas existentes...');
await db('DELETE FROM document_tags').run();
await db('DELETE FROM documents').run();
await db('DELETE FROM session_participants').run();
await db('DELETE FROM session_objectives').run();
await db('DELETE FROM session_requirements').run();
await db('DELETE FROM sessions').run();
await db('DELETE FROM goals').run();
await db('DELETE FROM mentee_interests').run();
await db('DELETE FROM mentee_goals').run();
await db('DELETE FROM mentees').run();
await db('DELETE FROM mentor_availability').run();
await db('DELETE FROM mentor_specialties').run();
await db('DELETE FROM mentors').run();
await db('DELETE FROM users').run();
console.log('✅ Tabelas limpas!\n');

// Criar usuários
console.log('👤 Criando usuários...');
const hashedPassword = bcrypt.hashSync('123456', 10);

const users = [
  { id: 'user1', name: 'Lucas Oliveira', email: 'lucas@email.com', userType: 'aprendiz', role: 'user' },
  { id: 'user2', name: 'Maria Santos', email: 'maria@email.com', userType: 'aprendiz', role: 'user' },
  { id: 'user3', name: 'João Silva', email: 'joao@email.com', userType: 'mentor', role: 'mentor' },
  { id: 'admin1', name: 'Admin Sistema', email: 'admin@email.com', userType: 'mentor', role: 'admin' }
];

for (let user of users) {
  const avatar = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  await db('INSERT INTO users (id, name, email, password, role, userType, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(user.id, user.name, user.email, hashedPassword, user.role, user.userType, avatar);
}

console.log(`✅ ${users.length} usuários criados!\n`);

// Criar mentores
console.log('🎓 Criando mentores...');
const mentor1Id = randomUUID();
const mentor2Id = randomUUID();
const mentor3Id = randomUUID();

const mentors = [
  {
    id: mentor1Id, userId: 'user3', name: 'João Silva', email: 'joao@email.com',
    bio: 'Desenvolvedor Full Stack com 8 anos de experiência.',
    specialties: ['JavaScript', 'React', 'Node.js', 'Python'],
    experience: 8, rating: 4.9, totalSessions: 156
  },
  {
    id: mentor2Id, userId: 'admin1', name: 'Admin Sistema', email: 'admin@email.com',
    bio: 'Engenheiro de Software sênior.',
    specialties: ['Algoritmos', 'Java', 'C++', 'Liderança'],
    experience: 10, rating: 4.8, totalSessions: 203
  },
  {
    id: mentor3Id, userId: null, name: 'Maria Oliveira', email: 'maria.oliveira@example.com',
    bio: 'Especialista em UX/UI Design.',
    specialties: ['UX Design', 'UI Design', 'Figma'],
    experience: 6, rating: 4.9, totalSessions: 89
  }
];

for (let mentor of mentors) {
  const avatar = mentor.name.split(' ').map(n => n[0]).join('').toUpperCase();
  await db('INSERT INTO mentors (id, userId, name, email, avatar, bio, experience, rating, totalSessions, hourlyRate, languages, certifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(mentor.id, mentor.userId, mentor.name, mentor.email, avatar, mentor.bio, mentor.experience, mentor.rating, mentor.totalSessions, 0, JSON.stringify(['Português', 'Inglês']), JSON.stringify([]));

  for (let specialty of mentor.specialties) {
    await db('INSERT INTO mentor_specialties (mentorId, specialty) VALUES (?, ?)').run(mentor.id, specialty);
  }
}

console.log(`✅ ${mentors.length} mentores criados!\n`);

// Criar aprendizes
console.log('🎒 Criando aprendizes...');
const mentees = [
  {
    id: 'user1', userId: 'user1', name: 'Lucas Oliveira', email: 'lucas@example.com',
    bio: 'Estudante de Engenharia de Software.',
    goals: ['Aprender React avançado'],
    interests: ['JavaScript', 'React']
  }
];

for (let mentee of mentees) {
  const avatar = mentee.name.split(' ').map(n => n[0]).join('').toUpperCase();
  await db('INSERT INTO mentees (id, userId, name, email, avatar, bio, currentLevel, preferredLanguages) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(mentee.id, mentee.userId, mentee.name, mentee.email, avatar, mentee.bio, 'intermediate', JSON.stringify(['Português']));

  for (let goal of mentee.goals) {
    await db('INSERT INTO mentee_goals (menteeId, goal) VALUES (?, ?)').run(mentee.id, goal);
  }

  for (let interest of mentee.interests) {
    await db('INSERT INTO mentee_interests (menteeId, interest) VALUES (?, ?)').run(mentee.id, interest);
  }
}

console.log(`✅ ${mentees.length} aprendizes criados!\n`);

// Criar sessões
console.log('📅 Criando sessões...');
const sessions = [
  {
    id: randomUUID(), mentorId: mentor1Id, title: 'Desenvolvimento de Liderança',
    description: 'Sessão prática sobre liderança.',
    scheduledAt: '2025-09-05T14:00:00', duration: 90,
    maxParticipants: 20, currentParticipants: 20, status: 'completed'
  },
  {
    id: randomUUID(), mentorId: mentor2Id, title: 'Carreira em Tecnologia',
    description: 'Como construir carreira em tech.',
    scheduledAt: '2025-09-18T19:00:00', duration: 60,
    maxParticipants: 15, currentParticipants: 8, status: 'upcoming'
  },
  {
    id: randomUUID(), mentorId: mentor1Id, title: 'React Avançado: Hooks e Performance',
    description: 'Aprenda técnicas avançadas de React, incluindo hooks customizados e otimizações de performance.',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), duration: 90,
    maxParticipants: 25, currentParticipants: 5, status: 'upcoming'
  },
  {
    id: randomUUID(), mentorId: mentor1Id, title: 'Node.js e Express: Backend Moderno',
    description: 'Construa APIs RESTful robustas com Node.js e Express.',
    scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), duration: 120,
    maxParticipants: 20, currentParticipants: 3, status: 'scheduled'
  }
];

for (let session of sessions) {
  await db('INSERT INTO sessions (id, mentorId, title, description, scheduledAt, duration, maxParticipants, currentParticipants, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(session.id, session.mentorId, session.title, session.description, session.scheduledAt, session.duration, session.maxParticipants, session.currentParticipants, session.status);
}

console.log(`✅ ${sessions.length} sessões criadas!\n`);

// Criar metas
console.log('🎯 Criando metas...');
await db('INSERT INTO goals (id, userId, title, description, category, priority, status, progress, targetDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  .run('goal1', 'user1', 'Dominar React', 'Aprender hooks avançados', 'technical', 'high', 'in-progress', 65, '2025-12-31');

console.log('✅ 1 meta criada!\n');

console.log('✨ Seed concluído com sucesso!');
console.log('\n🔐 Credenciais de teste:');
console.log('   Email: lucas@email.com');
console.log('   Senha: 123456');
console.log('\n   Email: admin@email.com');
console.log('   Senha: 123456');

process.exit(0);
