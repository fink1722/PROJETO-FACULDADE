# Documentação Completa de CRUDs - Central do Mentor

## Índice
1. [Visão Geral](#visão-geral)
2. [CRUD de Usuários](#crud-de-usuários)
3. [CRUD de Mentores](#crud-de-mentores)
4. [CRUD de Sessões](#crud-de-sessões)
5. [CRUD de Metas (Goals)](#crud-de-metas-goals)
6. [CRUD de Documentos](#crud-de-documentos)
7. [Fluxos Detalhados](#fluxos-detalhados)
8. [Segurança e Validações](#segurança-e-validações)

---

## Visão Geral

O sistema Central do Mentor possui **5 CRUDs principais**:

| CRUD | Entidade | Finalidade |
|------|----------|------------|
| 1 | **Usuários** | Gerenciar contas de usuários (mentores e aprendizes) |
| 2 | **Mentores** | Gerenciar perfis de mentores com especialidades |
| 3 | **Sessões** | Gerenciar sessões de mentoria e inscrições |
| 4 | **Metas** | Gerenciar objetivos e metas dos usuários |
| 5 | **Documentos** | Gerenciar materiais e documentos das sessões |

---

## CRUD de Usuários

### Descrição
Gerencia o ciclo completo de vida dos usuários do sistema, incluindo registro, autenticação e perfil.

### Tabela no Banco de Dados

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID do usuário
  name TEXT NOT NULL,               -- Nome completo
  email TEXT UNIQUE NOT NULL,       -- Email (único)
  password TEXT NOT NULL,           -- Senha criptografada (bcrypt)
  role TEXT DEFAULT 'user',         -- Papel: 'user', 'mentor', 'admin'
  userType TEXT NOT NULL,           -- Tipo: 'mentor' ou 'learner'
  avatar TEXT,                      -- Iniciais do nome (ex: "JS")
  profileImageUrl TEXT,             -- URL da imagem de perfil
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Operações CRUD

#### CREATE - Registrar Usuário

**Endpoint:** `POST /api/auth/register`

**Controller:** [authController.js:6-71](../backend/src/controllers/authController.js#L6-L71)

**Fluxo:**

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. POST /api/auth/register
       │    {name, email, password, userType}
       ▼
┌──────────────────────┐
│  authController      │
│   register()         │
└──────┬───────────────┘
       │ 2. Valida campos obrigatórios
       │    (name, email, password, userType)
       ▼
       │ 3. Verifica se email já existe
       │    User.findByEmail(email)
       ▼
       │ 4. Criptografa senha
       │    bcrypt.hash(password, 10)
       ▼
       │ 5. Gera UUID e avatar (iniciais)
       │    randomUUID()
       ▼
       │ 6. Cria usuário no DB
       │    User.create({...})
       ▼
       │ 7. Se userType='mentor', cria perfil mentor
       │    Mentor.create({...})
       ▼
       │ 8. Gera token JWT
       │    jwt.sign({id, email, role, userType})
       ▼
┌──────────────────┐
│ Resposta 201     │
│ {user, token}    │
└──────────────────┘
```

**Código:**

```javascript
export const register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Validação
    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando'
      });
    }

    // Verifica duplicidade
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    // Define role
    const role = userType === 'mentor' ? 'mentor' : 'user';

    // Gera avatar (iniciais)
    const avatar = name.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

    // Cria usuário
    await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      userType,
      avatar
    });

    // Se for mentor, cria perfil de mentor
    if (userType === 'mentor') {
      const mentorId = randomUUID();
      await Mentor.create({
        id: mentorId,
        userId,
        name,
        email,
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

    // Gera token JWT
    const token = jwt.sign(
      { id: userId, email, role, userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: { user: { id: userId, name, email, role, userType, avatar }, token }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message
    });
  }
};
```

**Model - User.create():** [User.js:28-36](../backend/src/models/User.js#L28-L36)

```javascript
static async create(userData) {
  const { id, name, email, password, role, userType, avatar, profileImageUrl } = userData;

  await db(`INSERT INTO users (id, name, email, password, role, userType, avatar, profileImageUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, email, password, role || 'user', userType, avatar || null, profileImageUrl || null);

  return { id };
}
```

**Validações:**
- ✅ Campos obrigatórios: `name`, `email`, `password`, `userType`
- ✅ Email único (constraint no banco)
- ✅ Senha criptografada com bcrypt (10 rounds)
- ✅ Avatar gerado automaticamente a partir do nome
- ✅ Se `userType='mentor'`, cria perfil de mentor automaticamente

---

#### READ - Buscar Usuário Autenticado

**Endpoint:** `GET /api/auth/me`

**Autenticação:** Obrigatória

**Controller:** [authController.js:113-127](../backend/src/controllers/authController.js#L113-L127)

**Fluxo:**

```javascript
export const me = async (req, res) => {
  try {
    // req.user vem do middleware de autenticação
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Remove senha antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};
```

**Model - User.findById():** [User.js:19-21](../backend/src/models/User.js#L19-L21)

```javascript
static async findById(id) {
  return await db('SELECT * FROM users WHERE id = ?').get(id);
}
```

---

#### UPDATE - Atualizar Perfil

**Endpoint:** `PUT /api/auth/profile`

**Autenticação:** Obrigatória

**Controller:** [authController.js:129-167](../backend/src/controllers/authController.js#L129-L167)

**Fluxo:**

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. PUT /api/auth/profile
       │    {name, email, profileImageUrl}
       ▼
┌──────────────────────┐
│  authController      │
│   updateProfile()    │
└──────┬───────────────┘
       │ 2. Busca usuário atual
       │    User.findById(req.user.id)
       ▼
       │ 3. Se email mudou, verifica duplicidade
       │    User.findByEmail(newEmail)
       ▼
       │ 4. Atualiza dados
       │    User.update(userId, {...})
       ▼
       │ 5. Retorna usuário atualizado
       │    (sem senha)
       ▼
┌──────────────────┐
│ Resposta 200     │
│ {user}           │
└──────────────────┘
```

**Código:**

```javascript
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, profileImageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se o email mudou, verificar se já existe
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
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
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};
```

**Model - User.update():** [User.js:44-51](../backend/src/models/User.js#L44-L51)

```javascript
static async update(id, userData) {
  const { name, email, avatar, profileImageUrl } = userData;

  await db(`UPDATE users
    SET name = ?, email = ?, avatar = ?, profileImageUrl = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?`)
    .run(name, email, avatar, profileImageUrl, id);
}
```

**Validações:**
- ✅ Apenas o próprio usuário pode atualizar seu perfil
- ✅ Se email mudar, valida unicidade
- ✅ Campos opcionais: mantém valores antigos se não fornecidos

---

#### DELETE - Deletar Usuário

**Endpoint:** `DELETE /api/users/:id`

**Autenticação:** Obrigatória (admin)

**Model - User.delete():** [User.js:58-60](../backend/src/models/User.js#L58-L60)

```javascript
static async delete(id) {
  await db('DELETE FROM users WHERE id = ?').run(id);
}
```

**Nota:** Esta operação não está exposta via API REST por questões de segurança. Apenas administradores podem deletar usuários diretamente no banco.

---

## CRUD de Mentores

### Descrição
Gerencia perfis de mentores, incluindo especialidades, experiência, avaliações e disponibilidade.

### Tabela no Banco de Dados

```sql
CREATE TABLE mentors (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,      -- FK para users.id
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  profileImageUrl TEXT,
  bio TEXT,                         -- Biografia do mentor
  experience INTEGER DEFAULT 0,     -- Anos de experiência
  rating REAL DEFAULT 0,            -- Avaliação média (0-5)
  totalSessions INTEGER DEFAULT 0,  -- Contador de sessões realizadas
  hourlyRate REAL DEFAULT 0,        -- Taxa por hora (R$)
  languages TEXT,                   -- JSON array de idiomas
  certifications TEXT,              -- JSON array de certificações
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela auxiliar para especialidades (N:N)
CREATE TABLE mentor_specialties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentorId TEXT NOT NULL,
  specialty TEXT NOT NULL,
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
);

-- Tabela auxiliar para disponibilidade
CREATE TABLE mentor_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentorId TEXT NOT NULL,
  dayOfWeek TEXT NOT NULL,          -- Segunda, Terça, etc.
  startTime TEXT NOT NULL,          -- HH:MM
  endTime TEXT NOT NULL,            -- HH:MM
  FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
);
```

### Operações CRUD

#### CREATE - Criar Perfil de Mentor

**Criado automaticamente** durante o registro de usuário quando `userType='mentor'`.

Ver: [authController.js:36-52](../backend/src/controllers/authController.js#L36-L52)

**Model - Mentor.create():** [Mentor.js:101-125](../backend/src/models/Mentor.js#L101-L125)

```javascript
static async create(mentorData) {
  const {
    id, userId, name, email, avatar, profileImageUrl, bio,
    experience, rating, totalSessions, hourlyRate,
    specialties, languages, certifications
  } = mentorData;

  // Insere mentor
  await db(`INSERT INTO mentors (id, userId, name, email, avatar, profileImageUrl, bio, experience, rating, totalSessions, hourlyRate, languages, certifications)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      id, userId, name, email, avatar || null, profileImageUrl || null,
      bio || '', experience || 0, rating || 0, totalSessions || 0,
      hourlyRate || 0, JSON.stringify(languages || []),
      JSON.stringify(certifications || [])
    );

  // Inserir especialidades
  if (specialties && Array.isArray(specialties)) {
    for (let specialty of specialties) {
      await db('INSERT INTO mentor_specialties (mentorId, specialty) VALUES (?, ?)').run(id, specialty);
    }
  }

  return { id };
}
```

---

#### READ - Listar Todos os Mentores

**Endpoint:** `GET /api/mentors`

**Autenticação:** Opcional

**Query Parameters:**
- `search` - Busca por nome ou bio
- `specialty` - Filtra por especialidade
- `minRating` - Rating mínimo
- `limit` - Limite de resultados (padrão: 50)
- `offset` - Offset para paginação

**Controller:** [mentorController.js:3-11](../backend/src/controllers/mentorController.js#L3-L11)

```javascript
export const getAllMentors = async (req, res) => {
  try {
    const { search, specialty, minRating, limit, offset } = req.query;
    const mentors = await Mentor.findAll({ search, specialty, minRating, limit, offset });
    res.json({ success: true, data: mentors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mentores',
      error: error.message
    });
  }
};
```

**Model - Mentor.findAll():** [Mentor.js:53-94](../backend/src/models/Mentor.js#L53-L94)

```javascript
static async findAll(filters = {}) {
  const { search, specialty, minRating, limit = 50, offset = 0 } = filters;

  let query = 'SELECT DISTINCT m.* FROM mentors m';
  const params = [];
  const conditions = [];

  // Filtro por especialidade (JOIN)
  if (specialty) {
    query += ' INNER JOIN mentor_specialties ms ON m.id = ms.mentorId';
    conditions.push('ms.specialty = ?');
    params.push(specialty);
  }

  // Filtro por busca textual
  if (search) {
    conditions.push('(m.name LIKE ? OR m.bio LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  // Filtro por rating mínimo
  if (minRating) {
    conditions.push('m.rating >= ?');
    params.push(minRating);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY m.rating DESC, m.totalSessions DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const mentors = await db(query).all(...params);

  // Buscar especialidades para cada mentor
  for (let mentor of mentors) {
    const specialties = await db('SELECT specialty FROM mentor_specialties WHERE mentorId = ?').all(mentor.id);
    mentor.specialties = specialties.map(s => s.specialty);
    mentor.languages = mentor.languages ? JSON.parse(mentor.languages) : [];
    mentor.certifications = mentor.certifications ? JSON.parse(mentor.certifications) : [];
  }

  return mentors;
}
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-do-mentor",
      "userId": "uuid-do-usuario",
      "name": "Dr. João Silva",
      "email": "joao@example.com",
      "avatar": "JS",
      "profileImageUrl": "https://...",
      "bio": "Especialista em desenvolvimento de carreira...",
      "experience": 10,
      "rating": 4.8,
      "totalSessions": 150,
      "hourlyRate": 120.00,
      "specialties": ["Liderança", "Gestão de Projetos"],
      "languages": ["Português", "Inglês"],
      "certifications": ["PMP", "Scrum Master"]
    }
  ]
}
```

---

#### READ - Buscar Mentor por ID

**Endpoint:** `GET /api/mentors/:id`

**Controller:** [mentorController.js:13-22](../backend/src/controllers/mentorController.js#L13-L22)

```javascript
export const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor não encontrado'
      });
    }

    res.json({ success: true, data: mentor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mentor',
      error: error.message
    });
  }
};
```

**Model - Mentor.findById():** [Mentor.js:10-27](../backend/src/models/Mentor.js#L10-L27)

```javascript
static async findById(id) {
  const mentor = await db('SELECT * FROM mentors WHERE id = ?').get(id);

  if (mentor) {
    // Buscar especialidades
    const specialties = await db('SELECT specialty FROM mentor_specialties WHERE mentorId = ?').all(id);
    mentor.specialties = specialties.map(s => s.specialty);

    // Buscar disponibilidade
    mentor.availability = await db('SELECT * FROM mentor_availability WHERE mentorId = ?').all(id);

    // Parsear arrays JSON
    mentor.languages = mentor.languages ? JSON.parse(mentor.languages) : [];
    mentor.certifications = mentor.certifications ? JSON.parse(mentor.certifications) : [];
  }

  return mentor;
}
```

---

#### UPDATE - Atualizar Perfil de Mentor

**Endpoint:** `PUT /api/mentors/:id`

**Autenticação:** Obrigatória (mentor dono ou admin)

**Controller:** [mentorController.js:24-49](../backend/src/controllers/mentorController.js#L24-L49)

**Fluxo:**

```
┌─────────────┐
│   Mentor    │
└──────┬──────┘
       │ 1. PUT /api/mentors/:id
       │    {bio, experience, hourlyRate, specialties, ...}
       ▼
┌──────────────────────┐
│  mentorController    │
│   updateMentor()     │
└──────┬───────────────┘
       │ 2. Busca mentor
       │    Mentor.findById(id)
       ▼
       │ 3. Verifica permissão
       │    mentor.userId === req.user.id?
       ▼
       │ 4. Atualiza dados
       │    Mentor.update(id, {...})
       ▼
       │ 5. Se specialties fornecidas:
       │    - DELETE antigas
       │    - INSERT novas
       ▼
┌──────────────────┐
│ Resposta 200     │
│ {success: true}  │
└──────────────────┘
```

**Código:**

```javascript
export const updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor não encontrado'
      });
    }

    // Verificar permissão
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    const { bio, experience, hourlyRate, specialties, languages, certifications, avatar, profileImageUrl } = req.body;

    await Mentor.update(req.params.id, {
      bio: bio || mentor.bio,
      experience: experience !== undefined ? experience : mentor.experience,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : mentor.hourlyRate,
      specialties,
      languages,
      certifications,
      avatar,
      profileImageUrl
    });

    res.json({ success: true, message: 'Mentor atualizado' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar mentor',
      error: error.message
    });
  }
};
```

**Model - Mentor.update():** [Mentor.js:133-155](../backend/src/models/Mentor.js#L133-L155)

```javascript
static async update(id, mentorData) {
  const { bio, experience, hourlyRate, specialties, languages, certifications, avatar, profileImageUrl } = mentorData;

  // Atualiza mentor
  await db(`UPDATE mentors
    SET bio = ?, experience = ?, hourlyRate = ?, languages = ?, certifications = ?, avatar = ?, profileImageUrl = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?`)
    .run(
      bio, experience, hourlyRate,
      JSON.stringify(languages),
      JSON.stringify(certifications),
      avatar,
      profileImageUrl,
      id
    );

  // Atualizar especialidades (deleta e recria)
  if (specialties && Array.isArray(specialties)) {
    await db('DELETE FROM mentor_specialties WHERE mentorId = ?').run(id);
    for (let specialty of specialties) {
      await db('INSERT INTO mentor_specialties (mentorId, specialty) VALUES (?, ?)').run(id, specialty);
    }
  }
}
```

**Validações:**
- ✅ Apenas o mentor dono ou admin pode atualizar
- ✅ Especialidades: deleta todas antigas e recria (evita duplicatas)
- ✅ Arrays JSON: `languages` e `certifications` são serializados

---

#### DELETE - Deletar Mentor

**Model - Mentor.delete():** [Mentor.js:162-164](../backend/src/models/Mentor.js#L162-L164)

```javascript
static async delete(id) {
  await db('DELETE FROM mentors WHERE id = ?').run(id);
}
```

**Nota:** Não exposto via API. Quando um usuário é deletado, o mentor é deletado automaticamente por `ON DELETE CASCADE`.

---

## CRUD de Sessões

### Descrição
Gerencia sessões de mentoria, incluindo criação, inscrições e exclusão. Documentado em detalhes em [DOCUMENTACAO_SESSOES.md](./DOCUMENTACAO_SESSOES.md).

### Tabelas no Banco de Dados

```sql
-- Tabela principal de sessões
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  mentorId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  scheduledAt TEXT NOT NULL,
  duration INTEGER NOT NULL,
  maxParticipants INTEGER,
  currentParticipants INTEGER DEFAULT 0,
  meetingLink TEXT,
  status TEXT DEFAULT 'scheduled',
  hasDocuments INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES mentors(id)
);

-- Tabela de participantes (N:N)
CREATE TABLE session_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  userId TEXT NOT NULL,
  enrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(sessionId, userId)
);
```

### Operações CRUD

#### CREATE - Criar Sessão

**Endpoint:** `POST /api/sessions`

**Autenticação:** Obrigatória (mentor)

**Request Body:**

```json
{
  "mentorId": "uuid-do-mentor",
  "title": "Desenvolvimento de Liderança",
  "description": "Nesta sessão...",
  "topic": "Liderança",
  "scheduledAt": "2025-12-15T19:47:00.000Z",
  "duration": 90,
  "maxParticipants": 25,
  "meetingLink": "https://meet.google.com/...",
  "requirements": ["Pré-requisito 1", "Pré-requisito 2"],
  "objectives": ["Objetivo 1"]
}
```

**Validações:**
- ✅ Campos obrigatórios: `mentorId`, `title`, `scheduledAt`, `duration`
- ✅ Apenas mentores podem criar sessões
- ✅ O `userId` do mentor deve ser igual ao `req.user.id`

**Resposta:**

```json
{
  "success": true,
  "message": "Sessão criada",
  "data": {
    "sessionId": "348d9988-6e67-44fb-abf5-29f241dd2649"
  }
}
```

---

#### READ - Listar Sessões

**Endpoint:** `GET /api/sessions`

**Query Parameters:**
- `status` - Filtrar por status (scheduled, live, completed)
- `mentorId` - Filtrar por mentor
- `limit` - Limite (padrão: 50)
- `offset` - Offset

**Resposta:** Lista de sessões com flag `isEnrolled` se usuário autenticado.

---

#### UPDATE - Inscrever em Sessão

**Endpoint:** `POST /api/sessions/:id/join`

**Autenticação:** Obrigatória

**Validações:**
- ✅ Sessão deve existir
- ✅ Deve aceitar inscrições (`maxParticipants` não null)
- ✅ Deve haver vagas disponíveis
- ✅ Usuário não pode se inscrever duas vezes

**Efeitos:**
- Insere registro em `session_participants`
- Incrementa `currentParticipants`

---

#### UPDATE - Desinscrever de Sessão

**Endpoint:** `POST /api/sessions/:id/leave`

**Autenticação:** Obrigatória

**Validações:**
- ✅ Usuário deve estar inscrito

**Efeitos:**
- Remove registro de `session_participants`
- Decrementa `currentParticipants`

---

#### DELETE - Excluir Sessão

**Endpoint:** `DELETE /api/sessions/:id`

**Autenticação:** Obrigatória (mentor criador ou admin)

**Validações:**
- ✅ Apenas o mentor criador ou admin pode excluir

**Efeitos:**
- Deleta sessão
- `ON DELETE CASCADE` remove automaticamente:
  - Inscrições (`session_participants`)
  - Requisitos (`session_requirements`)
  - Objetivos (`session_objectives`)

---

## CRUD de Metas (Goals)

### Descrição
Gerencia metas e objetivos pessoais dos usuários (principalmente aprendizes).

### Tabela no Banco de Dados

```sql
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,             -- FK para users.id
  title TEXT NOT NULL,              -- Título da meta
  description TEXT,                 -- Descrição detalhada
  category TEXT NOT NULL,           -- Categoria: 'career', 'skill', 'personal'
  priority TEXT DEFAULT 'medium',   -- Prioridade: 'low', 'medium', 'high'
  status TEXT DEFAULT 'not-started', -- Status: 'not-started', 'in-progress', 'completed', 'abandoned'
  progress INTEGER DEFAULT 0,       -- Progresso (0-100%)
  targetDate TEXT,                  -- Data alvo (ISO 8601)
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Operações CRUD

#### CREATE - Criar Meta

**Endpoint:** `POST /api/goals`

**Autenticação:** Obrigatória

**Controller:** [goalController.js:40-58](../backend/src/controllers/goalController.js#L40-L58)

**Request Body:**

```json
{
  "title": "Aprender TypeScript",
  "description": "Dominar TypeScript para projetos profissionais",
  "category": "skill",
  "priority": "high",
  "progress": 0,
  "targetDate": "2025-12-31T23:59:59.000Z"
}
```

**Código:**

```javascript
export const createGoal = async (req, res) => {
  try {
    const { title, description, category, priority, progress, targetDate } = req.body;

    // Validação
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Título e categoria são obrigatórios'
      });
    }

    const goalId = randomUUID();

    // Inserir meta
    await db(`INSERT INTO goals (id, userId, title, description, category, priority, status, progress, targetDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        goalId,
        req.user.id,
        title,
        description || '',
        category,
        priority || 'medium',
        'not-started',
        progress || 0,
        targetDate || null
      );

    res.status(201).json({
      success: true,
      message: 'Meta criada',
      data: { goalId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar meta',
      error: error.message
    });
  }
};
```

**Validações:**
- ✅ Campos obrigatórios: `title`, `category`
- ✅ Status inicial sempre `'not-started'`
- ✅ Progresso inicial padrão: 0
- ✅ Prioridade padrão: `'medium'`

---

#### READ - Listar Metas do Usuário

**Endpoint:** `GET /api/goals`

**Autenticação:** Obrigatória

**Query Parameters:**
- `status` - Filtrar por status
- `limit` - Limite (padrão: 50)
- `offset` - Offset

**Controller:** [goalController.js:5-24](../backend/src/controllers/goalController.js#L5-L24)

```javascript
export const getAllGoals = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM goals WHERE userId = ?';
    const params = [req.user.id];

    // Filtro por status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Ordenação: prioridade DESC, data criação DESC
    query += ' ORDER BY priority DESC, createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const goals = await db(query).all(...params);

    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar metas',
      error: error.message
    });
  }
};
```

**Resposta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-da-meta",
      "userId": "uuid-do-usuario",
      "title": "Aprender TypeScript",
      "description": "Dominar TypeScript...",
      "category": "skill",
      "priority": "high",
      "status": "in-progress",
      "progress": 45,
      "targetDate": "2025-12-31T23:59:59.000Z",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-02-01T14:30:00.000Z"
    }
  ]
}
```

---

#### READ - Buscar Meta por ID

**Endpoint:** `GET /api/goals/:id`

**Autenticação:** Obrigatória

**Controller:** [goalController.js:26-38](../backend/src/controllers/goalController.js#L26-L38)

```javascript
export const getGoalById = async (req, res) => {
  try {
    const goal = await db('SELECT * FROM goals WHERE id = ?').get(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada'
      });
    }

    // Verificar permissão
    if (goal.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar meta',
      error: error.message
    });
  }
};
```

**Validações:**
- ✅ Apenas o dono da meta ou admin pode visualizar

---

#### UPDATE - Atualizar Meta

**Endpoint:** `PUT /api/goals/:id`

**Autenticação:** Obrigatória

**Controller:** [goalController.js:60-77](../backend/src/controllers/goalController.js#L60-L77)

**Request Body:**

```json
{
  "title": "Aprender TypeScript (atualizado)",
  "description": "Nova descrição",
  "category": "skill",
  "priority": "high",
  "status": "in-progress",
  "progress": 65,
  "targetDate": "2025-12-31T23:59:59.000Z"
}
```

**Código:**

```javascript
export const updateGoal = async (req, res) => {
  try {
    const { title, description, category, priority, status, progress, targetDate } = req.body;

    // Buscar meta
    const goal = await db('SELECT * FROM goals WHERE id = ?').get(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada'
      });
    }

    // Verificar permissão
    if (goal.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    // Atualizar
    await db(`UPDATE goals SET
      title = ?,
      description = ?,
      category = ?,
      priority = ?,
      status = ?,
      progress = ?,
      targetDate = ?,
      updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`)
      .run(
        title || goal.title,
        description || goal.description,
        category || goal.category,
        priority || goal.priority,
        status || goal.status,
        progress !== undefined ? progress : goal.progress,
        targetDate || goal.targetDate,
        req.params.id
      );

    res.json({ success: true, message: 'Meta atualizada' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar meta',
      error: error.message
    });
  }
};
```

**Validações:**
- ✅ Apenas o dono ou admin pode atualizar
- ✅ Campos não fornecidos mantêm valores antigos
- ✅ `updatedAt` atualizado automaticamente

---

#### DELETE - Deletar Meta

**Endpoint:** `DELETE /api/goals/:id`

**Autenticação:** Obrigatória

**Controller:** [goalController.js:79-92](../backend/src/controllers/goalController.js#L79-L92)

```javascript
export const deleteGoal = async (req, res) => {
  try {
    const goal = await db('SELECT userId FROM goals WHERE id = ?').get(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Meta não encontrada'
      });
    }

    // Verificar permissão
    if (goal.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    await db('DELETE FROM goals WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Meta deletada' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar meta',
      error: error.message
    });
  }
};
```

**Validações:**
- ✅ Apenas o dono ou admin pode deletar

---

## CRUD de Documentos

### Descrição
Gerencia documentos e materiais anexados às sessões de mentoria.

### Tabelas no Banco de Dados

```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,          -- FK para sessions.id
  mentorId TEXT NOT NULL,           -- FK para mentors.id
  title TEXT NOT NULL,              -- Título do documento
  description TEXT,                 -- Descrição
  fileUrl TEXT NOT NULL,            -- URL do arquivo
  fileName TEXT NOT NULL,           -- Nome do arquivo
  fileType TEXT NOT NULL,           -- Tipo: 'pdf', 'pptx', 'docx', 'xlsx', etc.
  fileSize INTEGER DEFAULT 0,       -- Tamanho em bytes
  isPublic INTEGER DEFAULT 1,       -- 1=público, 0=privado
  language TEXT,                    -- Idioma do documento
  thumbnailUrl TEXT,                -- URL da thumbnail
  viewCount INTEGER DEFAULT 0,      -- Contador de visualizações
  downloadCount INTEGER DEFAULT 0,  -- Contador de downloads
  uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (mentorId) REFERENCES mentors(id)
);

-- Tabela auxiliar para tags (N:N)
CREATE TABLE document_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  documentId TEXT NOT NULL,
  tag TEXT NOT NULL,
  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
);
```

### Operações CRUD

#### CREATE - Criar Documento

**Endpoint:** `POST /api/documents`

**Autenticação:** Obrigatória (mentor)

**Controller:** [documentController.js:27-65](../backend/src/controllers/documentController.js#L27-L65)

**Request Body:**

```json
{
  "sessionId": "uuid-da-sessao",
  "mentorId": "uuid-do-mentor",
  "title": "Slides da Sessão de Liderança",
  "description": "Material de apoio...",
  "fileUrl": "https://storage.example.com/docs/slides.pdf",
  "fileName": "slides-lideranca.pdf",
  "fileType": "pdf",
  "fileSize": 2048000,
  "tags": ["liderança", "gestão", "slides"],
  "isPublic": true,
  "language": "pt-BR",
  "thumbnailUrl": "https://..."
}
```

**Fluxo:**

```
┌─────────────┐
│   Mentor    │
└──────┬──────┘
       │ 1. POST /api/documents
       │    {sessionId, mentorId, title, fileUrl, ...}
       ▼
┌──────────────────────┐
│  documentController  │
│   createDocument()   │
└──────┬───────────────┘
       │ 2. Valida campos obrigatórios
       │    (sessionId, mentorId, title, fileUrl, fileName, fileType)
       ▼
       │ 3. Busca mentor
       │    Mentor.findById(mentorId)
       ▼
       │ 4. Verifica permissão
       │    mentor.userId === req.user.id?
       ▼
       │ 5. Gera UUID do documento
       │    randomUUID()
       ▼
       │ 6. Cria documento no DB
       │    Document.create({...})
       ▼
       │ 7. Insere tags (se houver)
       │    INSERT INTO document_tags
       ▼
       │ 8. Marca sessão como tendo documentos
       │    Session.updateHasDocuments(sessionId, true)
       ▼
┌──────────────────┐
│ Resposta 201     │
│ {documentId}     │
└──────────────────┘
```

**Código:**

```javascript
export const createDocument = async (req, res) => {
  try {
    const {
      sessionId, mentorId, title, fileUrl, fileName, fileType,
      tags, description, isPublic, language, thumbnailUrl, fileSize
    } = req.body;

    // Validação
    if (!sessionId || !mentorId || !title || !fileUrl || !fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando'
      });
    }

    // Buscar mentor e verificar permissão
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor não encontrado'
      });
    }

    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    const documentId = randomUUID();

    // Criar documento
    await Document.create({
      id: documentId,
      sessionId,
      mentorId,
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      tags,
      isPublic: isPublic !== false,
      language,
      thumbnailUrl
    });

    // Marcar sessão como tendo documentos
    await Session.updateHasDocuments(sessionId, true);

    res.status(201).json({
      success: true,
      message: 'Documento criado',
      data: { documentId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar documento',
      error: error.message
    });
  }
};
```

**Model - Document.create():** [Document.js:68-90](../backend/src/models/Document.js#L68-L90)

```javascript
static async create(documentData) {
  const {
    id, sessionId, mentorId, title, description, fileUrl,
    fileName, fileType, fileSize, tags, isPublic, language, thumbnailUrl
  } = documentData;

  // Inserir documento
  await db(`INSERT INTO documents (id, sessionId, mentorId, title, description, fileUrl, fileName, fileType, fileSize, isPublic, language, thumbnailUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      id, sessionId, mentorId, title, description || '', fileUrl,
      fileName, fileType, fileSize || 0, isPublic ? 1 : 0,
      language || null, thumbnailUrl || null
    );

  // Inserir tags
  if (tags && Array.isArray(tags)) {
    for (let tag of tags) {
      await db('INSERT INTO document_tags (documentId, tag) VALUES (?, ?)').run(id, tag);
    }
  }

  return { id };
}
```

**Validações:**
- ✅ Campos obrigatórios: `sessionId`, `mentorId`, `title`, `fileUrl`, `fileName`, `fileType`
- ✅ Apenas o mentor dono ou admin pode criar
- ✅ Tags são armazenadas em tabela separada (N:N)
- ✅ Flag `hasDocuments` da sessão é atualizada

---

#### READ - Listar Documentos

**Endpoint:** `GET /api/documents`

**Query Parameters:**
- `sessionId` - Filtrar por sessão
- `mentorId` - Filtrar por mentor
- `fileType` - Filtrar por tipo de arquivo
- `search` - Busca textual (título ou descrição)
- `limit` - Limite (padrão: 50)
- `offset` - Offset

**Controller:** [documentController.js:4-12](../backend/src/controllers/documentController.js#L4-L12)

```javascript
export const getAllDocuments = async (req, res) => {
  try {
    const { sessionId, mentorId, fileType, search, limit, offset } = req.query;
    const documents = await Document.findAll({ sessionId, mentorId, fileType, search, limit, offset });
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar documentos',
      error: error.message
    });
  }
};
```

**Model - Document.findAll():** [Document.js:26-61](../backend/src/models/Document.js#L26-L61)

```javascript
static async findAll(filters = {}) {
  const { sessionId, mentorId, fileType, search, limit = 50, offset = 0 } = filters;

  let query = 'SELECT * FROM documents WHERE 1=1';
  const params = [];

  // Filtros
  if (sessionId) {
    query += ' AND sessionId = ?';
    params.push(sessionId);
  }
  if (mentorId) {
    query += ' AND mentorId = ?';
    params.push(mentorId);
  }
  if (fileType) {
    query += ' AND fileType = ?';
    params.push(fileType);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY uploadedAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const documents = await db(query).all(...params);

  // Buscar tags para cada documento
  for (let doc of documents) {
    doc.tags = (await db('SELECT tag FROM document_tags WHERE documentId = ?').all(doc.id)).map(t => t.tag);
    doc.isPublic = doc.isPublic === 1;
  }

  return documents;
}
```

---

#### READ - Buscar Documento por ID

**Endpoint:** `GET /api/documents/:id`

**Controller:** [documentController.js:14-25](../backend/src/controllers/documentController.js#L14-L25)

```javascript
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    // Incrementa contador de visualizações
    await Document.incrementViewCount(req.params.id);

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar documento',
      error: error.message
    });
  }
};
```

**Efeito colateral:** Incrementa automaticamente `viewCount`.

---

#### UPDATE - Atualizar Documento

**Endpoint:** `PUT /api/documents/:id`

**Autenticação:** Obrigatória (mentor dono ou admin)

**Controller:** [documentController.js:67-88](../backend/src/controllers/documentController.js#L67-L88)

```javascript
export const updateDocument = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    // Verificar permissão
    const mentor = await Mentor.findById(document.mentorId);
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    await Document.update(req.params.id, {
      title: title || document.title,
      description: description || document.description,
      isPublic: isPublic !== undefined ? isPublic : document.isPublic
    });

    res.json({ success: true, message: 'Documento atualizado' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar documento',
      error: error.message
    });
  }
};
```

**Validações:**
- ✅ Apenas o mentor dono ou admin pode atualizar
- ✅ Apenas campos: `title`, `description`, `isPublic` podem ser atualizados
- ✅ Não permite alterar `fileUrl`, `fileName`, etc. (imutáveis após criação)

---

#### DELETE - Deletar Documento

**Endpoint:** `DELETE /api/documents/:id`

**Autenticação:** Obrigatória (mentor dono ou admin)

**Controller:** [documentController.js:90-105](../backend/src/controllers/documentController.js#L90-L105)

```javascript
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    // Verificar permissão
    const mentor = await Mentor.findById(document.mentorId);
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    await Document.delete(req.params.id);

    res.json({ success: true, message: 'Documento deletado' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar documento',
      error: error.message
    });
  }
};
```

**Efeitos:**
- Deleta documento
- `ON DELETE CASCADE` remove automaticamente tags (`document_tags`)

---

#### UPDATE - Incrementar Contador de Downloads

**Endpoint:** `POST /api/documents/:id/download`

**Controller:** [documentController.js:107-117](../backend/src/controllers/documentController.js#L107-L117)

```javascript
export const incrementDownloadCount = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }

    await Document.incrementDownloadCount(req.params.id);

    res.json({ success: true, message: 'Download contado' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro',
      error: error.message
    });
  }
};
```

**Model - Document.incrementDownloadCount():** [Document.js:128-130](../backend/src/models/Document.js#L128-L130)

```javascript
static async incrementDownloadCount(id) {
  await db('UPDATE documents SET downloadCount = downloadCount + 1 WHERE id = ?').run(id);
}
```

---

## Fluxos Detalhados

### Fluxo de Registro e Login

```
┌─────────────────────────────────────────────────────────┐
│                  REGISTRO DE USUÁRIO                     │
└─────────────────────────────────────────────────────────┘

1. Frontend envia POST /api/auth/register
   {
     name: "João Silva",
     email: "joao@example.com",
     password: "senha123",
     userType: "mentor"
   }

2. authController.register()
   ├─ Valida campos obrigatórios
   ├─ Verifica se email já existe (User.findByEmail)
   ├─ Criptografa senha (bcrypt.hash)
   ├─ Gera UUID e avatar
   ├─ Cria usuário (User.create)
   ├─ SE userType='mentor':
   │  └─ Cria perfil mentor (Mentor.create)
   └─ Gera token JWT

3. Resposta: { user, token }

4. Frontend armazena token no localStorage

┌─────────────────────────────────────────────────────────┐
│                       LOGIN                              │
└─────────────────────────────────────────────────────────┘

1. Frontend envia POST /api/auth/login
   { email: "joao@example.com", password: "senha123" }

2. authController.login()
   ├─ Busca usuário por email (User.findByEmail)
   ├─ Valida senha (bcrypt.compare)
   └─ Gera token JWT

3. Resposta: { user, token }

4. Frontend armazena token no localStorage
```

---

### Fluxo de Criação de Sessão e Inscrição

```
┌─────────────────────────────────────────────────────────┐
│              MENTOR CRIA SESSÃO                          │
└─────────────────────────────────────────────────────────┘

1. Frontend envia POST /api/sessions
   Headers: { Authorization: "Bearer <token>" }
   Body: {
     mentorId: "uuid-mentor",
     title: "Liderança para Iniciantes",
     scheduledAt: "2025-12-15T19:00:00Z",
     duration: 90,
     maxParticipants: 25
   }

2. Middleware authenticate() extrai req.user do token

3. sessionController.createSession()
   ├─ Valida campos obrigatórios
   ├─ Busca mentor (Mentor.findById)
   ├─ Verifica se mentor.userId === req.user.id
   ├─ Gera sessionId (UUID)
   ├─ Cria sessão (Session.create)
   └─ Insere requirements e objectives

4. Resposta: { sessionId }

┌─────────────────────────────────────────────────────────┐
│          APRENDIZ SE INSCREVE EM SESSÃO                  │
└─────────────────────────────────────────────────────────┘

1. Frontend envia POST /api/sessions/:id/join
   Headers: { Authorization: "Bearer <token>" }

2. sessionController.joinSession()
   ├─ Busca sessão (Session.findById)
   ├─ Verifica se maxParticipants !== null
   ├─ Verifica se currentParticipants < maxParticipants
   ├─ Verifica se já está inscrito (Session.isUserEnrolled)
   ├─ Insere em session_participants
   └─ Incrementa currentParticipants

3. Resposta: { success: true, message: "Inscrição realizada" }

┌─────────────────────────────────────────────────────────┐
│          MENTOR CRIA DOCUMENTO PARA SESSÃO               │
└─────────────────────────────────────────────────────────┘

1. Frontend faz upload do arquivo (não implementado no código)
   - Retorna fileUrl

2. Frontend envia POST /api/documents
   {
     sessionId: "uuid-sessao",
     mentorId: "uuid-mentor",
     title: "Slides da Sessão",
     fileUrl: "https://...",
     fileName: "slides.pdf",
     fileType: "pdf",
     tags: ["liderança", "slides"]
   }

3. documentController.createDocument()
   ├─ Valida campos
   ├─ Verifica permissão (mentor.userId === req.user.id)
   ├─ Cria documento (Document.create)
   ├─ Insere tags
   └─ Marca sessão com hasDocuments=true

4. Resposta: { documentId }
```

---

## Segurança e Validações

### Middleware de Autenticação

**Arquivo:** [auth.js](../backend/src/middleware/auth.js)

```javascript
export const authenticate = async (req, res, next) => {
  try {
    // 1. Extrai token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // 2. Verifica e decodifica token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Busca usuário no banco
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado' });
    }

    // 4. Adiciona usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
  }
};
```

---

### Validações de Permissão

#### Propriedade de Recursos

Todos os CRUDs verificam propriedade antes de permitir UPDATE/DELETE:

```javascript
// Exemplo: goalController.deleteGoal
const goal = await db('SELECT userId FROM goals WHERE id = ?').get(req.params.id);

if (goal.userId !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ success: false, message: 'Sem permissão' });
}
```

#### Hierarquia de Permissões

| Role | Permissões |
|------|------------|
| `user` | CRUD próprios recursos (metas, inscrições) |
| `mentor` | CRUD próprios recursos + criar sessões e documentos |
| `admin` | CRUD todos os recursos |

---

### Validações de Integridade

#### Foreign Keys

Todas as tabelas possuem constraints de FK:

```sql
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (mentorId) REFERENCES mentors(id) ON DELETE CASCADE
FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
```

**Efeito:** Quando um usuário/mentor/sessão é deletado, todos os registros relacionados são deletados automaticamente.

---

#### Constraints Unique

Previnem duplicatas:

```sql
-- Usuário não pode se inscrever duas vezes na mesma sessão
UNIQUE(sessionId, userId) -- em session_participants

-- Email único
email TEXT UNIQUE NOT NULL -- em users
```

---

### Criptografia

#### Senhas

```javascript
// Registro
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValidPassword = await bcrypt.compare(password, user.password);
```

**Algoritmo:** bcrypt com 10 rounds (sal automático).

---

### Tokens JWT

```javascript
const token = jwt.sign(
  { id: userId, email, role, userType },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Payload:**
- `id` - UUID do usuário
- `email` - Email do usuário
- `role` - Papel (user, mentor, admin)
- `userType` - Tipo (mentor, learner)

**Expiração:** 7 dias

---

## Considerações Finais

### Pontos Fortes

✅ **Separação de Responsabilidades**
- Controllers: lógica de negócio
- Models: acesso ao banco
- Middleware: autenticação e validações

✅ **Segurança**
- Senhas criptografadas com bcrypt
- Autenticação JWT em rotas protegidas
- Validação de permissões em nível de controller
- Proteção contra SQL injection (prepared statements)

✅ **Integridade de Dados**
- Foreign keys com CASCADE
- Constraints UNIQUE
- Validações de campos obrigatórios

✅ **Escalabilidade**
- Paginação implementada (`limit` e `offset`)
- Índices em PKs e FKs
- Queries otimizadas

---

### Melhorias Futuras

1. **Testes Automatizados**
   - Unit tests para models
   - Integration tests para controllers
   - E2E tests

2. **Rate Limiting**
   - Prevenir abuso de APIs
   - Express-rate-limit

3. **Logs de Auditoria**
   - Registrar todas as operações CRUD
   - Timestamps e usuários responsáveis

4. **Upload de Arquivos**
   - Implementar upload direto para cloud storage (S3, Cloudinary)
   - Validação de tipos de arquivo
   - Limite de tamanho

5. **Cache**
   - Redis para sessões frequentemente acessadas
   - Cache de listagens

6. **Webhooks/Notificações**
   - Email quando sessão criada
   - Push notifications para inscrições

---

**Desenvolvido para:** Central do Mentor
**Versão:** 1.0.0
**Data:** Dezembro 2025
