// EXEMPLO: Como usar o authService no seu componente de Login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';

const LoginExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Chama o serviço de autenticação
      const response = await authService.login({ email, password });

      if (response.success) {
        console.log('✅ Login realizado com sucesso!');
        console.log('Usuário:', response.data.user);
        console.log('Token:', response.data.token);

        // Token e usuário já foram salvos automaticamente no localStorage
        // Redirecionar para a página inicial
        navigate('/');
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="test-credentials">
        <p>🔐 Credenciais de teste:</p>
        <p>Email: lucas@email.com</p>
        <p>Senha: 123456</p>
      </div>
    </div>
  );
};

export default LoginExample;
