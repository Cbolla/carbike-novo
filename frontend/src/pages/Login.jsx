import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'esqueceu' | 'mudar' | null
  const [modalForm, setModalForm] = useState({ email: '', senhaAtual: '', senhaNova: '', senhaRepetir: '' });
  
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // URL da API — localhost pra testes locais, URL real para produção
    const API_URL = '';

    try {
      console.log('[Carbike] Tentando login em:', API_URL + '/auth/login');

      const response = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('[Carbike] Resposta HTTP status:', response.status);
      const data = await response.json();
      console.log('[Carbike] Dados recebidos:', data);

      if (data.error) {
         setErrorMsg(data.mensagem);
      } else {
         // Salva o Token e navega o usuário
         localStorage.setItem('carbike_token', data.token);
         localStorage.setItem('carbike_user', JSON.stringify(data.user));
         
         navigate('/'); // Volta para a tela inicial (Dashboard do Site)
      }
    } catch (err) {
       console.error('[Carbike] ERRO COMPLETO:', err);
       console.error('[Carbike] Tipo do erro:', err.name);
       console.error('[Carbike] Mensagem:', err.message);
       setErrorMsg('Erro de rede: O servidor API possivelmente está offline.');
    } finally {
       setIsLoading(false);
    }
  };

  const submitEsqueciSenha = (e) => {
    e.preventDefault();
    alert(`E-mail de recuperação enviado para: ${modalForm.email}`);
    setActiveModal(null);
  };

  const submitMudarSenha = (e) => {
    e.preventDefault();
    if(modalForm.senhaNova !== modalForm.senhaRepetir) {
      alert("A nova senha não confere com a repetição.");
      return;
    }
    alert(`Alteração de senha processada para: ${modalForm.email}`);
    setActiveModal(null);
  };

  return (
    <div className="login-page-container w-full h-screen overflow-hidden flex flex-col relative bg-white">
      {/* Logos & Fechar */}
      <img src="./img/logo.png" alt="Carbike Logo" className="absolute top-5 left-1/2 -translate-x-1/2 w-[100px] z-20 cursor-pointer" onClick={() => navigate('/')} />
      <button onClick={() => navigate('/')} className="absolute top-5 right-8 z-20 text-gray-500 hover:text-red-500 transition-colors">
        <X size={35} />
      </button>

      {/* Main Split Layout */}
      <div className="flex w-full h-full flex-col md:flex-row-reverse" style={{ height: 'calc(100vh - env(safe-area-inset-bottom))' }}>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 h-full flex justify-center items-center mt-20 md:mt-0 px-6">
          <form onSubmit={handleLoginSubmit} className="flex flex-col items-center w-full max-w-[450px]">
             <h1 className="text-4xl text-[var(--h1-color)] font-bold mb-8">Login</h1>
             
             <div className="flex flex-col w-full px-5 mb-4">
               <label className="font-bold mb-2">Email*</label>
               <input 
                 type="email" 
                 required 
                 className="w-full h-[50px] rounded-full px-5 border border-black focus:outline-none focus:border-[var(--h1-color)] transition-colors"
                 placeholder="Insira seu email"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
               />
             </div>
             
             <div className="flex flex-col w-full px-5 mb-2">
               <label className="font-bold mb-2">Senha*</label>
               <input 
                 type="password" 
                 required 
                 className="w-full h-[50px] rounded-full px-5 border border-black focus:outline-none focus:border-[var(--h1-color)] transition-colors"
                 placeholder="Insira sua senha"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
             </div>
             
             {/* Lado a Lado Links */}
             <div className="flex justify-between w-[90%] md:w-[80%] mt-2 text-[var(--h1-color)] text-sm cursor-pointer font-medium">
                <span className="hover:underline" onClick={() => setActiveModal('esqueceu')}>Esqueci a senha</span>
                <span className="hover:underline" onClick={() => setActiveModal('mudar')}>Alterar a senha</span>
             </div>

             <button type="submit" disabled={isLoading} className="mt-8 w-[200px] h-[45px] rounded-full bg-[var(--h1-color)] hover:bg-[#001f44] text-white border border-black font-bold text-lg transition-colors flex justify-center items-center">
                {isLoading ? 'Autenticando...' : 'Login'}
             </button>
             
             {errorMsg && <p className="text-red-500 text-sm mt-4 font-bold text-center">{errorMsg}</p>}
             
             <Link to="/admin" className="mt-4 font-bold cursor-pointer text-[#1c9be9] hover:underline">
                Acesso do Administrador
             </Link>
             <Link to="/cadastrar" className="mt-2 text-sm text-gray-600 hover:text-[var(--h1-color)] hover:underline">
                Não tem conta? Cadastre-se rápido
             </Link>
          </form>
        </div>

        {/* Left Side - Image (Hidden in mobile by CSS/Tailwind) */}
        <div className="hidden md:flex w-1/2 h-full justify-center items-center relative overflow-hidden">
           {/* Placeholder if SVG is missing, using generic vehicle image approach */}
           <img src="./img/carro-lateral.svg" alt="Illustration" className="w-[80%] max-w-[600px] object-contain" onError={(e) => e.target.style.display='none'} />
        </div>

      </div>

      {/* Modals Extras (Esqueci / Mudar Senha) */}
      {activeModal === 'esqueceu' && (
         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4">
             <div className="relative bg-white w-full max-w-[500px] rounded-[30px] p-8 flex flex-col items-center animate-fade-in shadow-2xl">
                 <button onClick={() => setActiveModal(null)} className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors">
                     <X size={28} />
                 </button>
                 <h2 className="text-3xl font-bold mb-8 text-[var(--h1-color)]">Esqueceu a senha?</h2>
                 
                 <form onSubmit={submitEsqueciSenha} className="w-full flex flex-col">
                    <div className="mb-6 flex flex-col">
                       <label className="font-bold mb-2">Email</label>
                       <input type="email" required placeholder="Digite seu Email" 
                         className="h-[50px] rounded-full px-5 border border-[var(--h1-color)] w-full"
                         value={modalForm.email} onChange={e => setModalForm({...modalForm, email: e.target.value})} />
                    </div>
                    <button type="submit" className="self-center bg-[var(--h1-color)] text-white w-[150px] h-[45px] rounded-full font-bold hover:bg-[#001f44]">Enviar</button>
                 </form>
             </div>
         </div>
      )}

      {activeModal === 'mudar' && (
         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4">
             <div className="relative bg-white w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[30px] p-8 flex flex-col items-center animate-fade-in shadow-2xl">
                 <button onClick={() => setActiveModal(null)} className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors">
                     <X size={28} />
                 </button>
                 <h2 className="text-3xl font-bold mb-8 text-[var(--h1-color)] text-center">Mudar a Senha?</h2>
                 
                 <form onSubmit={submitMudarSenha} className="w-full flex flex-col">
                    <div className="mb-4 flex flex-col">
                       <label className="font-bold mb-2">Email</label>
                       <input type="email" required placeholder="Digite seu Email" 
                         className="h-[50px] w-full rounded-full px-5 border border-[var(--h1-color)]"
                         value={modalForm.email} onChange={e => setModalForm({...modalForm, email: e.target.value})} />
                    </div>
                    <div className="mb-4 flex flex-col">
                       <label className="font-bold mb-2">Senha Atual</label>
                       <input type="password" required placeholder="Digite sua Senha Atual" 
                         className="h-[50px] w-full rounded-full px-5 border border-[var(--h1-color)]"
                         value={modalForm.senhaAtual} onChange={e => setModalForm({...modalForm, senhaAtual: e.target.value})} />
                    </div>
                    <div className="mb-4 flex flex-col">
                       <label className="font-bold mb-2">Senha Nova</label>
                       <input type="password" required placeholder="Digite sua Senha Nova" 
                         className="h-[50px] w-full rounded-full px-5 border border-[var(--h1-color)]"
                         value={modalForm.senhaNova} onChange={e => setModalForm({...modalForm, senhaNova: e.target.value})} />
                    </div>
                    <div className="mb-8 flex flex-col">
                       <label className="font-bold mb-2">Repita a Senha Nova</label>
                       <input type="password" required placeholder="Repita sua Senha Nova" 
                         className="h-[50px] w-full rounded-full px-5 border border-[var(--h1-color)]"
                         value={modalForm.senhaRepetir} onChange={e => setModalForm({...modalForm, senhaRepetir: e.target.value})} />
                    </div>
                    <button type="submit" className="self-center bg-[var(--h1-color)] text-white w-[150px] h-[45px] rounded-full font-bold hover:bg-[#001f44]">Atualizar</button>
                 </form>
             </div>
         </div>
      )}
    </div>
  );
};

export default Login;
