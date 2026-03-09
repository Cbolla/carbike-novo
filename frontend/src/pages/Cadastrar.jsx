import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../custom.css';

const Cadastrar = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://backend.carbike.com.br/auth/register', {
        email,
        password
      });

      if (!response.data.error) {
        alert(response.data.mensagem);
        // On success, redirect to login page so they can login.
        navigate('/login');
      } else {
        setError(response.data.mensagem);
      }
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container edge-to-edge">
      <div className="login-content">
        <h2 className="login-title">Cadastre-se</h2>
        <p className="login-subtitle">Preencha os dados abaixo rapidamente para testes</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label>E-mail test</label>
            <input 
              type="email" 
              placeholder="Digite seu e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              placeholder="Sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Repetir Senha</label>
            <input 
              type="password" 
              placeholder="Repita sua senha" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar e Testar Login'}
          </button>
        </form>

        <p className="cadastrar-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          Já tem conta? <a href="/login">Faça Login</a>
        </p>
      </div>
    </div>
  );
};

export default Cadastrar;
