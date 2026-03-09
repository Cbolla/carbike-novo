import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, Car, User, ShoppingCart, ShieldCheck, AlertTriangle } from 'lucide-react';
import '../custom.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/ofertas', label: 'Ver Ofertas', icon: Car },
    { path: '/login', label: 'Login', icon: User },
    { path: '/cadastro', label: 'Anuncie aqui', icon: ShoppingCart },
  ];

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      />

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-area" style={{ position: 'relative' }}>
          <img src="./logo.png" alt="Carbike Logo" className="sidebar-logo" />
          
          <button className="close-sidebar-btn" onClick={closeSidebar}>
            <X size={24} />
          </button>
        </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              {item.label}
            </Link>
          );
        })}
        
        <button 
          onClick={() => {
            setIsModalOpen(true);
            if (window.innerWidth < 768) closeSidebar(); // Fecha a drawer pra ver o modal
          }} 
          className="sidebar-link" 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
        >
          <ShieldCheck className="sidebar-icon" />
          <span>Compre<br/>Seguro</span>
        </button>

        {/* Espaço reservado para publicidade futura */}
        <div className="hidden md:block mt-auto mb-6 mx-4" />
      </nav>
      </aside>

      {/* Modal Compre Seguro embutido na arvore */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
           <div className="modal-box" onClick={e => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
              
              <h3 className="modal-title">
                <AlertTriangle color="#ffcc00" size={24} />
                Dicas de Segurança Carbike
              </h3>
              
              <div className="modal-text">
                <p style={{ marginBottom: '10px' }}>
                  <strong>⚠️ Compre Seguro:</strong> Fique atento a golpes! Navegar com atenção evita grandes dores de cabeça.
                </p>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Nunca deposite qualquer tipo de pagamento ou sinal antecipadamente.</li>
                  <li>Sempre vá ver o veículo pessoalmente com algum mecânico de confiança em local público ou movimentado.</li>
                  <li>Desconfie de preços muito abaixo do valor da Tabela Fipe ou histórias emocionantes.</li>
                  <li>Sempre confira os documentos do veículo no Detran do seu Estado antes de fechar negócio.</li>
                </ul>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
