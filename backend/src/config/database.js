import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', '..', 'database.sqlite');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Criar tabelas
const createTables = () => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      profileImageUrl TEXT,
      role TEXT CHECK(role IN ('admin', 'user', 'mentor')) DEFAULT 'user',
      userType TEXT CHECK(userType IN ('mentor', 'aprendiz')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de mentores
  db.run(`
    CREATE TABLE IF NOT EXISTS mentors (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      profileImageUrl TEXT,
      bio TEXT,
      experience INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      totalSessions INTEGER DEFAULT 0,
      hourlyRate REAL DEFAULT 0,
      languages TEXT,
      certifications TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabela de especialidades dos mentores
  db.run(`
    CREATE TABLE IF NOT EXISTS mentor_specialties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentorId TEXT NOT NULL,
      specialty TEXT NOT NULL,
      FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
    )
  `);

  // Tabela de disponibilidade dos mentores
  db.run(`
    CREATE TABLE IF NOT EXISTS mentor_availability (
      id TEXT PRIMARY KEY,
      mentorId TEXT NOT NULL,
      dayOfWeek INTEGER CHECK(dayOfWeek >= 0 AND dayOfWeek <= 6),
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      timezone TEXT DEFAULT 'America/Sao_Paulo',
      FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
    )
  `);

  // Tabela de aprendizes (mentees)
  db.run(`
    CREATE TABLE IF NOT EXISTS mentees (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      profileImageUrl TEXT,
      bio TEXT,
      currentLevel TEXT CHECK(currentLevel IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
      preferredLanguages TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabela de objetivos (goals) dos aprendizes
  db.run(`
    CREATE TABLE IF NOT EXISTS mentee_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menteeId TEXT NOT NULL,
      goal TEXT NOT NULL,
      FOREIGN KEY (menteeId) REFERENCES mentees(id) ON DELETE CASCADE
    )
  `);

  // Tabela de interesses dos aprendizes
  db.run(`
    CREATE TABLE IF NOT EXISTS mentee_interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menteeId TEXT NOT NULL,
      interest TEXT NOT NULL,
      FOREIGN KEY (menteeId) REFERENCES mentees(id) ON DELETE CASCADE
    )
  `);

  // Tabela de sessões
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      mentorId TEXT NOT NULL,
      menteeId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      topic TEXT,
      scheduledAt DATETIME NOT NULL,
      duration INTEGER NOT NULL,
      maxParticipants INTEGER,
      currentParticipants INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'upcoming', 'live')) DEFAULT 'scheduled',
      meetingLink TEXT,
      notes TEXT,
      rating REAL,
      feedback TEXT,
      hasDocuments INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE,
      FOREIGN KEY (menteeId) REFERENCES mentees(id) ON DELETE SET NULL
    )
  `);

  // Tabela de requisitos das sessões
  db.run(`
    CREATE TABLE IF NOT EXISTS session_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      requirement TEXT NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  // Tabela de objetivos das sessões
  db.run(`
    CREATE TABLE IF NOT EXISTS session_objectives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      objective TEXT NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  // Tabela de participantes de sessões públicas
  db.run(`
    CREATE TABLE IF NOT EXISTS session_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT NOT NULL,
      userId TEXT NOT NULL,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(sessionId, userId)
    )
  `);

  // Tabela de documentos
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      mentorId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      fileUrl TEXT NOT NULL,
      fileName TEXT NOT NULL,
      fileType TEXT CHECK(fileType IN ('pdf', 'pptx', 'docx', 'xlsx', 'zip', 'code', 'image', 'video', 'other')),
      fileSize INTEGER,
      downloadCount INTEGER DEFAULT 0,
      viewCount INTEGER DEFAULT 0,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      isPublic INTEGER DEFAULT 1,
      language TEXT,
      thumbnailUrl TEXT,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
    )
  `);

  // Tabela de tags dos documentos
  db.run(`
    CREATE TABLE IF NOT EXISTS document_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentId TEXT NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
    )
  `);

  // Tabela de metas (goals) do sistema
  db.run(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT CHECK(category IN ('career', 'leadership', 'communication', 'technical', 'personal')),
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('not-started', 'in-progress', 'completed', 'paused')) DEFAULT 'not-started',
      progress INTEGER DEFAULT 0,
      targetDate DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabela de avaliações
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      reviewerId TEXT NOT NULL,
      revieweeId TEXT NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      communication INTEGER CHECK(communication >= 1 AND communication <= 5),
      expertise INTEGER CHECK(expertise >= 1 AND expertise <= 5),
      helpfulness INTEGER CHECK(helpfulness >= 1 AND helpfulness <= 5),
      punctuality INTEGER CHECK(punctuality >= 1 AND punctuality <= 5),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (revieweeId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tabelas criadas com sucesso!');
};

// Funções auxiliares para usar com async/await
const dbPrepare = (sql) => {
  return {
    run: (...params) => new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }),
    get: (...params) => new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),
    all: (...params) => new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    })
  };
};

// Inicializar banco de dados
setTimeout(createTables, 100);

export default { prepare: dbPrepare, db };
export { db, dbPrepare };
