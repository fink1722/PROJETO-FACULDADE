# 🔗 Guia de Integração Frontend com Backend

## ✅ Configuração Completa

A integração entre frontend e backend está **configurada e pronta para usar**!

## 📁 Arquivos Criados

```
frontend/
├── .env                          # Configuração da URL da API
├── src/
│   ├── config/
│   │   └── api.ts               # URLs e endpoints da API
│   └── services/
│       ├── index.ts             # Exporta todos os serviços
│       ├── api.ts               # Configuração do Axios
│       ├── authService.ts       # Serviços de autenticação
│       ├── mentorService.ts     # Serviços de mentores
│       ├── sessionService.ts    # Serviços de sessões
│       ├── documentService.ts   # Serviços de documentos
│       └── goalService.ts       # Serviços de metas
```

## 🚀 Como Usar nos Componentes

### 1. Login (Exemplo)

```typescript
import { authService } from '../services';

// No seu componente de Login
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password });

    if (response.success) {
      console.log('Usuário logado:', response.data.user);
      // Redirecionar para dashboard
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Email ou senha incorretos');
  }
};
```

### 2. Listar Mentores

```typescript
import { mentorService } from '../services';
import { useState, useEffect } from 'react';

const MentorList = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await mentorService.getAll();
        setMentors(response.data);
      } catch (error) {
        console.error('Erro ao buscar mentores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {mentors.map(mentor => (
        <div key={mentor.id}>{mentor.name}</div>
      ))}
    </div>
  );
};
```

### 3. Criar Sessão

```typescript
import { sessionService } from '../services';

const CreateSession = () => {
  const handleCreateSession = async (data: any) => {
    try {
      const response = await sessionService.create({
        mentorId: 'mentor-id',
        title: 'Nova Sessão',
        description: 'Descrição da sessão',
        scheduledAt: '2025-12-01T14:00:00',
        duration: 60,
      });

      if (response.success) {
        alert('Sessão criada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  };

  return <button onClick={handleCreateSession}>Criar Sessão</button>;
};
```

### 4. Verificar Autenticação

```typescript
import { authService } from '../services';

// Em um componente ProtectedRoute ou similar
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
```

### 5. Logout

```typescript
import { authService } from '../services';

const LogoutButton = () => {
  const handleLogout = () => {
    authService.logout();
    // Automaticamente redireciona para /login
  };

  return <button onClick={handleLogout}>Sair</button>;
};
```

## 🔧 Recursos Automáticos

### ✅ Token JWT Automático

O axios está configurado para **adicionar automaticamente** o token JWT em todas as requisições:

```typescript
// Você NÃO precisa fazer isso manualmente:
headers: { Authorization: `Bearer ${token}` }

// O interceptor faz isso automaticamente!
```

### ✅ Redirecionamento Automático em Erros 401

Se o token expirar ou for inválido, o usuário é **automaticamente redirecionado** para a página de login.

### ✅ LocalStorage Gerenciado

O token e dados do usuário são salvos automaticamente no `localStorage` após login/registro.

## 📋 Serviços Disponíveis

### **authService**
- `login(credentials)` - Fazer login
- `register(data)` - Registrar novo usuário
- `me()` - Buscar dados do usuário autenticado
- `logout()` - Fazer logout
- `isAuthenticated()` - Verificar se está autenticado
- `getUser()` - Obter dados do usuário do localStorage

### **mentorService**
- `getAll(params?)` - Listar mentores
- `getById(id)` - Buscar mentor por ID
- `update(id, data)` - Atualizar mentor
- `getSpecialties()` - Listar especialidades

### **sessionService**
- `getAll(params?)` - Listar sessões
- `getById(id)` - Buscar sessão por ID
- `create(data)` - Criar sessão
- `update(id, data)` - Atualizar sessão
- `delete(id)` - Deletar sessão
- `join(id)` - Inscrever-se em sessão

### **documentService**
- `getAll(params?)` - Listar documentos
- `getById(id)` - Buscar documento por ID
- `create(data)` - Criar documento
- `update(id, data)` - Atualizar documento
- `delete(id)` - Deletar documento
- `incrementDownload(id)` - Incrementar contador de downloads

### **goalService**
- `getAll(params?)` - Listar metas
- `getById(id)` - Buscar meta por ID
- `create(data)` - Criar meta
- `update(id, data)` - Atualizar meta
- `delete(id)` - Deletar meta

## 🌐 Variáveis de Ambiente

No arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Para produção, altere para a URL do seu servidor:

```env
VITE_API_URL=https://api.seusite.com/api
```

## 🧪 Testando a Integração

### 1. Certifique-se que o backend está rodando:
```bash
cd backend
npm run dev
```

### 2. Inicie o frontend:
```bash
cd frontend
npm run dev
```

### 3. Teste o login no console do navegador:

```javascript
// Abra o console (F12) e teste:
import { authService } from './services';

await authService.login({
  email: 'lucas@email.com',
  password: '123456'
});
```

## 🎯 Próximos Passos

1. **Substitua o mockData** pelos serviços reais nos componentes
2. **Adicione tratamento de erros** adequado em cada componente
3. **Implemente loading states** durante as requisições
4. **Adicione validação de formulários** antes de enviar ao backend

## 💡 Dicas

- Use `try/catch` em todas as chamadas de API
- Implemente loading states para melhor UX
- Trate erros de forma amigável para o usuário
- Use React Query ou SWR para cache e gerenciamento de estado (opcional)

## 🎉 Tudo Pronto!

A integração está **100% configurada**! Agora você pode usar os serviços em qualquer componente do seu frontend.
