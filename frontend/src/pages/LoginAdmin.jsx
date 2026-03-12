import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Mail, Lock, ArrowRight, Car, ArrowLeft } from 'lucide-react';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.error) {
        setErrorMsg(data.mensagem);
      } else {
        localStorage.setItem('carbike_admin_token', data.token);
        localStorage.setItem('carbike_admin', JSON.stringify(data.admin));

        navigate('/admin-panel');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão com Admin Endpoint API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen w-full bg-[#0a0f1d] overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Logos & Fechar */}
      <div className="absolute top-6 left-6 z-20 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Car size={24} className="text-white" />
          </div>
          <span className="text-white font-extrabold tracking-[0.2em] text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">CARBIKE</span>
        </div>
      </div>
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm group"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Main Container */}
      <div className="z-10 w-full max-w-[480px] px-6">
        <form 
          onSubmit={handleLoginSubmit} 
          className="relative flex flex-col items-center w-full bg-white/5 p-10 sm:p-12 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
        >
          {/* Header */}
          <div className="relative mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center p-0.5 mb-6 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
              <div className="w-full h-full bg-[#0a0f1d]/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck size={32} className="text-white drop-shadow-md" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              Acesso Restrito
            </h1>
            <p className="text-sm text-gray-400">
              Painel de Administração Carbike
            </p>
          </div>

          {/* Form Fields */}
          <div className="w-full space-y-6">
            <div className="flex flex-col relative">
              <label htmlFor="emailAdmin" className="text-sm font-semibold text-gray-300 ml-2 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-blue-400" />
                Email Corporativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="emailAdmin"
                  required
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/80 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="admin@carbike.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col relative">
              <label htmlFor="passwordAdmin" className="text-sm font-semibold text-gray-300 ml-2 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-blue-400" />
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="passwordAdmin"
                  required
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/80 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium tracking-widest"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-14 mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex justify-center items-center group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Verificando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Autenticar Painel
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="w-full mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center animate-pulse">
              <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full flex justify-center">
            <Link 
              to="/login" 
              className="flex items-center gap-2 group px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 text-sm font-semibold text-blue-300 hover:text-white transition-all duration-300"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar para Login de Lojistas
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;
