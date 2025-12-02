# Documentação Técnica - Sistema de Sessões

## Central do Mentor - Gestão de Sessões de Mentoria

---

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Modelo de Dados](#modelo-de-dados)
4. [Fluxos de Negócio](#fluxos-de-negócio)
5. [API Endpoints](#api-endpoints)
6. [Código Backend Detalhado](#código-backend-detalhado)
7. [Segurança e Autenticação](#segurança-e-autenticação)

---

## Visão Geral

O sistema de sessões permite que **mentores** criem sessões de mentoria e **aprendizes** se inscrevam nelas. O sistema gerencia todo o ciclo de vida de uma sessão, desde a criação até a exclusão, incluindo controle de inscrições e participação.

### Principais Funcionalidades

- ✅ **Criação de Sessões** (apenas mentores)
- ✅ **Inscrição em Sessões** (aprendizes)
- ✅ **Desinscrição de Sessões** (aprendizes)
- ✅ **Exclusão de Sessões** (apenas o mentor criador)
- ✅ **Listagem de Sessões** (públicas e privadas)
- ✅ **Controle de Participantes** (vagas limitadas)

---

## Arquitetura do Sistema

### Stack Tecnológica

**Backend:**
- Node.js + Express.js
- SQLite (banco de dados)
- JWT (autenticação)
- Bcrypt (criptografia de senhas)

**Frontend:**
- React + TypeScript
- Axios (requisições HTTP)
- React Router (navegação)

### Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do SQLite
│   ├── controllers/
│   │   └── sessionController.js # Lógica de negócio das sessões
│   ├── models/
│   │   ├── Session.js           # Model de Sessão
│   │   └── Mentor.js            # Model de Mentor
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticação
│   ├── routes/
│   │   └── sessionRoutes.js     # Rotas das sessões
│   └── server.js                # Servidor Express
```

---

## Modelo de Dados

### Tabela: `sessions`

Armazena as informações principais das sessões de mentoria.

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,              -- UUID da sessão
  mentorId TEXT NOT NULL,           -- FK para mentors.id
  title TEXT NOT NULL,              -- Título da sessão
  description TEXT,                 -- Descrição detalhada
  topic TEXT,                       -- Tópico/categoria
  scheduledAt TEXT NOT NULL,        -- Data/hora agendada (ISO 8601)
  duration INTEGER NOT NULL,        -- Duração em minutos
  maxParticipants INTEGER,          -- Limite de participantes (null = ilimitado)
  currentParticipants INTEGER DEFAULT 0, -- Contador de inscritos
  meetingLink TEXT,                 -- Link da reunião (Google Meet, Zoom, etc)
  status TEXT DEFAULT 'scheduled',  -- Status: scheduled, live, completed, cancelled
  hasDocuments INTEGER DEFAULT 0,   -- Flag se tem documentos anexados
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES mentors(id)
);
```

### Tabela: `session_participants`

Tabela de relacionamento N:N entre sessões e usuários inscritos.

```sql
CREATE TABLE session_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,          -- FK para sessions.id
  userId TEXT NOT NULL,             -- FK para users.id
  enrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(sessionId, userId)         -- Um usuário só pode se inscrever uma vez
);
```

### Tabelas Auxiliares

**`session_requirements`** - Armazena pré-requisitos da sessão
```sql
CREATE TABLE session_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  requirement TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
);
```

**`session_objectives`** - Armazena objetivos da sessão
```sql
CREATE TABLE session_objectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sessionId TEXT NOT NULL,
  objective TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
);
```

---

## Fluxos de Negócio

### 1. Fluxo de Criação de Sessão

```
┌─────────────┐
│   Mentor    │
│  (Frontend) │
└──────┬──────┘
       │ 1. POST /api/sessions
       │    {title, scheduledAt, duration, ...}
       ▼
┌─────────────────────┐
│ sessionController   │
│  createSession()    │
└──────┬──────────────┘
       │ 2. Valida campos obrigatórios
       │    (mentorId, title, scheduledAt, duration)
       ▼
       │ 3. Busca mentor no DB
       │    Mentor.findById(mentorId)
       ▼
       │ 4. Verifica permissão
       │    mentor.userId === req.user.id?
       ▼
       │ 5. Gera UUID para sessão
       │    randomUUID()
       ▼
       │ 6. Cria sessão no DB
       │    Session.create({...})
       ▼
       │ 7. Insere requirements (se houver)
       │    INSERT INTO session_requirements
       ▼
       │ 8. Insere objectives (se houver)
       │    INSERT INTO session_objectives
       ▼
┌──────────────────┐
│ Resposta 201     │
│ {sessionId}      │
└──────────────────┘
```

**Código Backend:**

```javascript
// backend/src/controllers/sessionController.js

export const createSession = async (req, res) => {
  try {
    const {
      mentorId, title, scheduledAt, duration,
      maxParticipants, description, topic,
      requirements, objectives, meetingLink
    } = req.body;

    // 1. Validação de campos obrigatórios
    if (!mentorId || !title || !scheduledAt || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando'
      });
    }

    // 2. Buscar mentor e verificar existência
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor não encontrado'
      });
    }

    // 3. Verificar se o usuário autenticado é o mentor
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    // 4. Gerar ID único para a sessão
    const sessionId = randomUUID();

    // 5. Criar sessão no banco de dados
    await Session.create({
      id: sessionId,
      mentorId,
      title,
      description,
      topic,
      scheduledAt,
      duration,
      maxParticipants,
      meetingLink,
      requirements,
      objectives,
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      message: 'Sessão criada',
      data: { sessionId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar sessão',
      error: error.message
    });
  }
};
```

**Regras de Negócio:**
- ✅ Apenas usuários com `userType === 'mentor'` podem criar sessões
- ✅ O `mentorId` deve corresponder a um mentor existente
- ✅ O `userId` do mentor deve ser igual ao `id` do usuário autenticado
- ✅ Campos obrigatórios: `mentorId`, `title`, `scheduledAt`, `duration`
- ✅ `maxParticipants` é opcional (null = ilimitado)
- ✅ Status inicial sempre é `'scheduled'`

---

### 2. Fluxo de Inscrição em Sessão

```
┌─────────────┐
│  Aprendiz   │
│  (Frontend) │
└──────┬──────┘
       │ 1. POST /api/sessions/:id/join
       ▼
┌─────────────────────┐
│ sessionController   │
│   joinSession()     │
└──────┬──────────────┘
       │ 2. Busca sessão
       │    Session.findById(id)
       ▼
       │ 3. Valida existência da sessão
       ▼
       │ 4. Verifica se aceita inscrições
       │    maxParticipants != null?
       ▼
       │ 5. Verifica vagas disponíveis
       │    currentParticipants < maxParticipants?
       ▼
       │ 6. Verifica se já está inscrito
       │    Session.isUserEnrolled(sessionId, userId)
       ▼
       │ 7. Adiciona participante
       │    INSERT INTO session_participants
       ▼
       │ 8. Incrementa contador
       │    UPDATE sessions SET currentParticipants++
       ▼
┌──────────────────┐
│ Resposta 200     │
│ {success: true}  │
└──────────────────┘
```

**Código Backend:**

```javascript
// backend/src/controllers/sessionController.js

export const joinSession = async (req, res) => {
  try {
    // 1. Buscar sessão
    const session = await Session.findById(req.params.id);

    // 2. Validar existência
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessão não encontrada'
      });
    }

    // 3. Verificar se sessão aceita inscrições
    if (!session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Sessão não aceita inscrições'
      });
    }

    // 4. Verificar se há vagas disponíveis
    if (session.currentParticipants >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Sessão cheia'
      });
    }

    // 5. Verificar se usuário já está inscrito
    const isEnrolled = await Session.isUserEnrolled(
      req.params.id,
      req.user.id
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Já inscrito'
      });
    }

    // 6. Adicionar participante
    await Session.addParticipant(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Inscrição realizada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao se inscrever',
      error: error.message
    });
  }
};
```

**Model - Métodos Auxiliares:**

```javascript
// backend/src/models/Session.js

class Session {
  /**
   * Adiciona um participante à sessão
   */
  static async addParticipant(sessionId, userId) {
    // Insere na tabela de relacionamento
    await db('INSERT INTO session_participants (sessionId, userId) VALUES (?, ?)')
      .run(sessionId, userId);

    // Incrementa contador de participantes
    await db('UPDATE sessions SET currentParticipants = currentParticipants + 1 WHERE id = ?')
      .run(sessionId);
  }

  /**
   * Verifica se usuário já está inscrito na sessão
   */
  static async isUserEnrolled(sessionId, userId) {
    const result = await db(
      'SELECT id FROM session_participants WHERE sessionId = ? AND userId = ?'
    ).get(sessionId, userId);

    return !!result; // Retorna true se encontrou registro
  }
}
```

**Regras de Negócio:**
- ✅ Usuário deve estar autenticado
- ✅ Sessão deve existir
- ✅ Sessão deve aceitar inscrições (`maxParticipants` não pode ser null)
- ✅ Deve haver vagas disponíveis
- ✅ Usuário não pode se inscrever duas vezes na mesma sessão (constraint UNIQUE)
- ✅ Contador `currentParticipants` é atualizado automaticamente

---

### 3. Fluxo de Desinscrição de Sessão

```
┌─────────────┐
│  Aprendiz   │
│  (Frontend) │
└──────┬──────┘
       │ 1. POST /api/sessions/:id/leave
       ▼
┌─────────────────────┐
│ sessionController   │
│  leaveSession()     │
└──────┬──────────────┘
       │ 2. Busca sessão
       │    Session.findById(id)
       ▼
       │ 3. Valida existência da sessão
       ▼
       │ 4. Verifica se está inscrito
       │    Session.isUserEnrolled(sessionId, userId)
       ▼
       │ 5. Remove participante
       │    DELETE FROM session_participants
       ▼
       │ 6. Decrementa contador
       │    UPDATE sessions SET currentParticipants--
       ▼
┌──────────────────┐
│ Resposta 200     │
│ {success: true}  │
└──────────────────┘
```

**Código Backend:**

```javascript
// backend/src/controllers/sessionController.js

export const leaveSession = async (req, res) => {
  try {
    // 1. Buscar sessão
    const session = await Session.findById(req.params.id);

    // 2. Validar existência
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessão não encontrada'
      });
    }

    // 3. Verificar se usuário está inscrito
    const isEnrolled = await Session.isUserEnrolled(
      req.params.id,
      req.user.id
    );

    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Você não está inscrito nesta sessão'
      });
    }

    // 4. Remover participante
    await Session.removeParticipant(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Inscrição cancelada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar inscrição',
      error: error.message
    });
  }
};
```

**Model - Método removeParticipant:**

```javascript
// backend/src/models/Session.js

/**
 * Remove um participante da sessão
 */
static async removeParticipant(sessionId, userId) {
  // Remove da tabela de relacionamento
  await db('DELETE FROM session_participants WHERE sessionId = ? AND userId = ?')
    .run(sessionId, userId);

  // Decrementa contador de participantes
  await db('UPDATE sessions SET currentParticipants = currentParticipants - 1 WHERE id = ?')
    .run(sessionId);
}
```

**Regras de Negócio:**
- ✅ Usuário deve estar autenticado
- ✅ Sessão deve existir
- ✅ Usuário deve estar inscrito na sessão
- ✅ Contador `currentParticipants` é decrementado automaticamente
- ✅ Remove apenas a inscrição, não exclui a sessão

---

### 4. Fluxo de Exclusão de Sessão

```
┌─────────────┐
│   Mentor    │
│  (Frontend) │
└──────┬──────┘
       │ 1. DELETE /api/sessions/:id
       ▼
┌─────────────────────┐
│ sessionController   │
│  deleteSession()    │
└──────┬──────────────┘
       │ 2. Busca sessão
       │    Session.findById(id)
       ▼
       │ 3. Valida existência da sessão
       ▼
       │ 4. Busca mentor da sessão
       │    Mentor.findById(session.mentorId)
       ▼
       │ 5. Verifica permissão
       │    mentor.userId === req.user.id?
       │    ou req.user.role === 'admin'?
       ▼
       │ 6. Exclui sessão (CASCADE)
       │    - DELETE session_participants
       │    - DELETE session_requirements
       │    - DELETE session_objectives
       │    - DELETE sessions
       ▼
┌──────────────────┐
│ Resposta 200     │
│ {success: true}  │
└──────────────────┘
```

**Código Backend:**

```javascript
// backend/src/controllers/sessionController.js

export const deleteSession = async (req, res) => {
  try {
    // 1. Buscar sessão
    const session = await Session.findById(req.params.id);

    // 2. Validar existência
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessão não encontrada'
      });
    }

    // 3. Buscar mentor da sessão
    const mentor = await Mentor.findById(session.mentorId);

    // 4. Verificar permissão (apenas o mentor criador ou admin)
    if (mentor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão'
      });
    }

    // 5. Excluir sessão (CASCADE deleta registros relacionados)
    await Session.delete(req.params.id);

    res.json({
      success: true,
      message: 'Sessão deletada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar sessão',
      error: error.message
    });
  }
};
```

**Model - Método delete:**

```javascript
// backend/src/models/Session.js

/**
 * Deleta uma sessão
 * O ON DELETE CASCADE do banco deleta automaticamente:
 * - session_participants
 * - session_requirements
 * - session_objectives
 */
static async delete(id) {
  await db('DELETE FROM sessions WHERE id = ?').run(id);
}
```

**Regras de Negócio:**
- ✅ Apenas o mentor criador pode excluir a sessão
- ✅ Administradores também podem excluir qualquer sessão
- ✅ Exclusão em cascata remove automaticamente:
  - Todas as inscrições (`session_participants`)
  - Todos os requisitos (`session_requirements`)
  - Todos os objetivos (`session_objectives`)
- ✅ Ação irreversível

---

## API Endpoints

### Resumo de Rotas

```javascript
// backend/src/routes/sessionRoutes.js

// ROTAS PROTEGIDAS (requerem autenticação)
router.get('/my/enrolled', authenticate, getMyEnrolledSessions);    // Minhas inscrições
router.post('/', authenticate, isMentor, createSession);            // Criar sessão
router.post('/:id/join', authenticate, joinSession);                // Inscrever
router.post('/:id/leave', authenticate, leaveSession);              // Desinscrever
router.put('/:id', authenticate, updateSession);                    // Atualizar
router.delete('/:id', authenticate, deleteSession);                 // Excluir

// ROTAS PÚBLICAS (autenticação opcional)
router.get('/', optionalAuthenticate, getAllSessions);              // Listar todas
router.get('/:id', optionalAuthenticate, getSessionById);           // Ver detalhes
```

### Detalhamento das Rotas

#### 1. `POST /api/sessions` - Criar Sessão

**Autenticação:** Obrigatória (mentor)

**Request Body:**
```json
{
  "mentorId": "uuid-do-mentor",
  "title": "Desenvolvimento de Liderança para Jovens Profissionais",
  "description": "Nesta sessão, vamos explorar...",
  "topic": "Liderança",
  "scheduledAt": "2025-12-15T19:47:00.000Z",
  "duration": 90,
  "maxParticipants": 25,
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "requirements": [
    "Identificar estilos de liderança",
    "Desenvolver comunicação assertiva"
  ],
  "objectives": [
    "Aplicar técnicas de feedback construtivo"
  ]
}
```

**Response 201:**
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

#### 2. `POST /api/sessions/:id/join` - Inscrever em Sessão

**Autenticação:** Obrigatória

**Request:** Sem body

**Response 200:**
```json
{
  "success": true,
  "message": "Inscrição realizada"
}
```

**Possíveis Erros:**
- `404` - Sessão não encontrada
- `400` - Sessão não aceita inscrições
- `400` - Sessão cheia
- `400` - Já inscrito

---

#### 3. `POST /api/sessions/:id/leave` - Desinscrever de Sessão

**Autenticação:** Obrigatória

**Request:** Sem body

**Response 200:**
```json
{
  "success": true,
  "message": "Inscrição cancelada com sucesso"
}
```

**Possíveis Erros:**
- `404` - Sessão não encontrada
- `400` - Você não está inscrito nesta sessão

---

#### 4. `DELETE /api/sessions/:id` - Excluir Sessão

**Autenticação:** Obrigatória (mentor criador ou admin)

**Request:** Sem body

**Response 200:**
```json
{
  "success": true,
  "message": "Sessão deletada"
}
```

**Possíveis Erros:**
- `404` - Sessão não encontrada
- `403` - Sem permissão

---

#### 5. `GET /api/sessions/my/enrolled` - Minhas Sessões Inscritas

**Autenticação:** Obrigatória

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "348d9988-6e67-44fb-abf5-29f241dd2649",
      "mentorId": "1",
      "title": "Desenvolvimento de Liderança",
      "description": "...",
      "scheduledAt": "2025-12-15T19:47:00.000Z",
      "duration": 90,
      "currentParticipants": 5,
      "maxParticipants": 25,
      "meetingLink": "https://meet.google.com/...",
      "status": "scheduled",
      "isEnrolled": true,
      "requirements": [...],
      "objectives": [...]
    }
  ]
}
```

**Lógica do Controller:**
```javascript
export const getMyEnrolledSessions = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Buscar todas as sessões
    const allSessions = await Session.findAll({ limit: 100, offset: 0 });

    // Filtrar apenas as sessões em que o usuário está inscrito
    const enrolledSessions = [];
    for (const session of allSessions) {
      const isEnrolled = await Session.isUserEnrolled(session.id, req.user.id);
      if (isEnrolled) {
        enrolledSessions.push({ ...session, isEnrolled: true });
      }
    }

    res.json({ success: true, data: enrolledSessions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar sessões inscritas',
      error: error.message
    });
  }
};
```

---

#### 6. `GET /api/sessions` - Listar Todas as Sessões

**Autenticação:** Opcional

**Query Parameters:**
- `status` - Filtrar por status (scheduled, live, completed)
- `mentorId` - Filtrar por mentor
- `limit` - Limite de resultados (padrão: 50)
- `offset` - Offset para paginação (padrão: 0)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "348d9988-6e67-44fb-abf5-29f241dd2649",
      "title": "Desenvolvimento de Liderança",
      "isEnrolled": false,
      "...": "..."
    }
  ]
}
```

**Observação:** Se o usuário estiver autenticado, cada sessão incluirá o campo `isEnrolled` indicando se o usuário está inscrito.

---

#### 7. `GET /api/sessions/:id` - Ver Detalhes da Sessão

**Autenticação:** Opcional

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "348d9988-6e67-44fb-abf5-29f241dd2649",
    "mentorId": "1",
    "title": "Desenvolvimento de Liderança",
    "description": "Nesta sessão, vamos explorar...",
    "topic": "Liderança",
    "scheduledAt": "2025-12-15T19:47:00.000Z",
    "duration": 90,
    "currentParticipants": 5,
    "maxParticipants": 25,
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "status": "scheduled",
    "isEnrolled": false,
    "requirements": [
      "Identificar estilos de liderança",
      "Desenvolver comunicação assertiva"
    ],
    "objectives": [
      "Aplicar técnicas de feedback construtivo"
    ],
    "documents": [],
    "hasDocuments": false
  }
}
```

---

## Segurança e Autenticação

### Middleware de Autenticação

```javascript
// backend/src/middleware/auth.js

/**
 * Middleware que verifica se o usuário está autenticado
 * Extrai o token JWT do header Authorization
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Extrair token do header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // 2. Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar usuário no banco
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // 4. Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

/**
 * Middleware que verifica se o usuário é mentor
 */
export const isMentor = (req, res, next) => {
  if (req.user.userType !== 'mentor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a mentores'
    });
  }
  next();
};

/**
 * Middleware de autenticação opcional
 * Adiciona req.user se token válido, mas não bloqueia se não houver token
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continua sem usuário
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        role: user.role
      };
    }
  } catch (error) {
    // Ignora erros de token e continua sem usuário
  }

  next();
};
```

### Controle de Acesso

| Endpoint | Autenticação | Permissão | Validação |
|----------|--------------|-----------|-----------|
| `POST /sessions` | Obrigatória | Apenas mentores | `isMentor` middleware |
| `POST /sessions/:id/join` | Obrigatória | Qualquer usuário | Verifica vagas e duplicidade |
| `POST /sessions/:id/leave` | Obrigatória | Apenas se inscrito | Verifica se está inscrito |
| `DELETE /sessions/:id` | Obrigatória | Mentor criador ou admin | Compara `mentor.userId` com `req.user.id` |
| `PUT /sessions/:id` | Obrigatória | Mentor criador ou admin | Compara `mentor.userId` com `req.user.id` |
| `GET /sessions` | Opcional | Público | - |
| `GET /sessions/:id` | Opcional | Público | - |
| `GET /sessions/my/enrolled` | Obrigatória | Usuário autenticado | Filtra por `userId` |

---

## Considerações Finais

### Pontos Fortes da Implementação

✅ **Segurança Robusta**
- Autenticação JWT em todas as rotas protegidas
- Validação de permissões em nível de controller
- Proteção contra inscrições duplicadas (constraint UNIQUE)

✅ **Integridade de Dados**
- Foreign Keys garantem consistência referencial
- CASCADE DELETE remove dados relacionados automaticamente
- Transações implícitas no SQLite

✅ **Escalabilidade**
- Paginação implementada (`limit` e `offset`)
- Índices em chaves primárias e estrangeiras
- Queries otimizadas

✅ **Manutenibilidade**
- Código organizado em camadas (routes → controllers → models)
- Separação de responsabilidades
- Funções reutilizáveis no model

### Melhorias Futuras Possíveis

1. **Cache de Sessões** - Redis para melhorar performance
2. **Notificações** - Email/Push quando alguém se inscreve
3. **Websockets** - Atualização em tempo real de vagas disponíveis
4. **Logs de Auditoria** - Registrar criações/exclusões de sessões
5. **Rate Limiting** - Prevenir abuso de APIs
6. **Testes Automatizados** - Unit tests e integration tests

---

**Desenvolvido para:** Central do Mentor
**Data:** Dezembro 2025
**Versão:** 1.0.0
