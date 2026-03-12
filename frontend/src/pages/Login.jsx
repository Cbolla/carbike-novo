import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, ChevronRight, ChevronLeft, 
  ShieldCheck, Car, Phone, AlertTriangle, X 
} from 'lucide-react';
import axios from 'axios';
import './login.css';

import API_URL from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'esqueceu'
  const [modalForm, setModalForm] = useState({ email: '' });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const data = response.data;

      if (data.error) {
        setErrorMsg(data.mensagem);
      } else {
        localStorage.setItem('carbike_token', data.token);
        localStorage.setItem('carbike_user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err) {
      console.error('[Carbike] Erro no login:', err);
      setErrorMsg(err.response?.data?.mensagem || 'Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitEsqueciSenha = (e) => {
    e.preventDefault();
    alert(`E-mail de recuperação enviado para: ${modalForm.email}`);
    setActiveModal(null);
  };

  return (
    <div className="register-container">
      {/* Esquerda: Banner / Info (Idêntico ao cadastro) */}
      <div className="register-banner">
        <div className="banner-content">
          <img src="./logo.png" alt="Carbike" className="banner-logo" />
          <h1>Sua próxima conquista começa aqui.</h1>
          <p>Acesse a maior plataforma de veículos da região e gerencie seus anúncios.</p>

          <div className="benefits-list">
            <div className="benefit-item">
              <ShieldCheck size={20} />
              <span>Acesso 100% Seguro</span>
            </div>
            <div className="benefit-item">
              <Car size={20} />
              <span>Gerencie seus veículos em um só lugar</span>
            </div>
            <div className="benefit-item">
              <Phone size={20} />
              <span>Suporte especializado Carbike</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direita: Form (Estrutura idêntica ao cadastro) */}
      <div className="register-form-area">
        <div className="form-wrapper">
          <div className="form-header">
            <Link to="/" className="back-link"><ChevronLeft size={20} /> Voltar</Link>
            <h2>Entrar</h2>
            <div className="step-indicator">
              <div className="step-dot active"></div>
              <div className="step-dot"></div>
              <div className="step-dot"></div>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit}>
            {errorMsg && (
              <div className="error-alert">
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            )}

            <div className="form-step animate-fade-in">
              <p className="section-title">Bem-vindo de volta!</p>
              
              <div className="input-row mt-6">
                <div className="input-group col-span-2">
                  <label>E-mail</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      placeholder="seu@email.com" 
                    />
                  </div>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label>Senha</label>
                    <span 
                      onClick={() => setActiveModal('esqueceu')}
                      className="text-xs font-bold text-blue-600 cursor-pointer hover:underline"
                    >
                      Esqueceu a senha?
                    </span>
                  </div>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary-register mt-4 w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar Agora'} 
                <ChevronRight size={20} />
              </button>
            </div>
          </form>

          <p className="footer-auth-text">
            Ainda não tem uma conta? <Link to="/cadastrar">Cadastre-se agora</Link>
          </p>
        </div>
      </div>

      {/* Modal Esqueci Senha */}
      {activeModal === 'esqueceu' && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white w-full max-w-[450px] rounded-[30px] p-8 flex flex-col items-center animate-fade-in shadow-2xl">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors">
              <X size={28} />
            </button>
            <h2 className="text-2xl font-black text-[#002b5e] mb-6">Recuperar Senha</h2>

            <form onSubmit={submitEsqueciSenha} className="w-full flex flex-col">
              <div className="mb-6 flex flex-col">
                <label className="font-bold text-sm text-gray-600 mb-2">E-mail</label>
                <input 
                  type="email" 
                  required 
                  placeholder="Digite seu e-mail cadastrado"
                  className="h-[50px] rounded-xl px-5 border border-gray-200 w-full focus:border-[#002b5e] focus:outline-none"
                  value={modalForm.email} 
                  onChange={e => setModalForm({ email: e.target.value })} 
                />
              </div>
              <button 
                type="submit" 
                className="bg-[#002b5e] text-white w-full h-[50px] rounded-xl font-bold hover:bg-[#001f44] transition-all"
              >
                Enviar Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

