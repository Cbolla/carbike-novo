import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShieldCheck } from 'lucide-react';

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
    <div className="login-admin-page w-full h-screen overflow-hidden flex flex-col relative bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Logos & Fechar */}
      <img src="/img/logo.png" alt="Carbike Logo" className="absolute top-5 left-1/2 -translate-x-1/2 w-[100px] z-20 cursor-pointer drop-shadow-lg" onClick={() => navigate('/')} />
      <button onClick={() => navigate('/')} className="absolute top-5 right-8 z-20 text-gray-400 hover:text-red-500 transition-colors">
        <X size={35} />
      </button>

      {/* Main Split Layout */}
      <div className="flex w-full h-full flex-col md:flex-row-reverse" style={{ height: 'calc(100vh - env(safe-area-inset-bottom))' }}>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 h-full flex justify-center items-center mt-20 md:mt-0 px-6 z-10">
          <form onSubmit={handleLoginSubmit} className="flex flex-col items-center w-full max-w-[450px] bg-white/10 p-10 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
             
             <div className="bg-[#1c9be9] p-4 rounded-full mb-6">
                <ShieldCheck size={40} className="text-white" />
             </div>
             
             <h1 className="text-3xl text-white font-bold mb-8 tracking-wide">Acesso Restrito</h1>
             
             <div className="flex flex-col w-full mb-4 relative">
               <label className="text-sm text-gray-300 font-bold mb-1 ml-4">Email Corporativo</label>
               <input 
                 type="email" 
                 required 
                 className="w-full h-[50px] rounded-full px-5 bg-white/5 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-[#1c9be9] transition-colors"
                 placeholder="admin@carbike.com"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
               />
             </div>
             
             <div className="flex flex-col w-full mb-8 relative">
               <label className="text-sm text-gray-300 font-bold mb-1 ml-4">Senha</label>
               <input 
                 type="password" 
                 required 
                 className="w-full h-[50px] rounded-full px-5 bg-white/5 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-[#1c9be9] transition-colors"
                 placeholder="••••••••"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
             </div>

             <button type="submit" disabled={isLoading} className="w-full h-[50px] rounded-full bg-[#1c9be9] hover:bg-[#157eba] text-white font-bold text-lg transition-colors shadow-lg flex justify-center items-center">
                {isLoading ? 'Verificando Hash...' : 'Autenticar Painel'}
             </button>

             {errorMsg && <p className="text-red-400 text-sm mt-4 font-bold text-center bg-black/40 p-2 rounded-lg">{errorMsg}</p>}
             
             <Link to="/login" className="mt-6 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white">
                Voltar para Login de Lojistas
             </Link>
          </form>
        </div>

        {/* Left Side - Background Overlay */}
        <div className="hidden md:flex w-1/2 h-full justify-center items-center relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
        </div>

      </div>
    </div>
  );
};

export default LoginAdmin;
