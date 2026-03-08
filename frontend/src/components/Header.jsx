import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="mobile-header">
      
      <button onClick={toggleSidebar} className="menu-hamburguer">
        <Menu size={28} />
      </button>

      <div className="mobile-logo-container">
        <img 
          src="/logo.png" 
          alt="Carbike" 
          className="mobile-logo"
          onClick={() => window.scrollTo(0, 0)}
          style={{ cursor: 'pointer' }}
        />
      </div>

    </header>
  );
};

export default Header;
