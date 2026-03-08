import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Ofertas from './pages/Ofertas';
import VeiculoDetalhes from './pages/VeiculoDetalhes';
import Login from './pages/Login';
import LoginAdmin from './pages/LoginAdmin';
import Cadastrar from './pages/Cadastrar';
import './custom.css';
import './responsive.css';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Rotas que não devem exibir o Header, Footer ou Sidebar padrão
  const noLayoutRoutes = ['/login', '/admin', '/cadastrar'];
  const showLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <>
      {showLayout && <Header toggleSidebar={() => setIsSidebarOpen(true)} />}
      {showLayout && <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/veiculo/:tipo/:id" element={<VeiculoDetalhes />} />
        
        {/* Rotas de Autenticação Edge-to-Edge */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/cadastrar" element={<Cadastrar />} />
      </Routes>
    </>
  );
}

function App() {
  // Envolvido aqui pro useLocation funcionar dentro do Router
  return <AppContent />;
}

export default App;
