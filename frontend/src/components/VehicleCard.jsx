import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Activity } from 'lucide-react';
import '../custom.css';

const VehicleCard = ({ id, imagem, marca, modelo, ano, preco, km, local, tipoAnuncio = 'loja', logoLoja, idLoja }) => {
  return (
    <Link to={`/veiculo/${tipoAnuncio}/${id}`} className="vehicle-card">
      <div className="vc-image-wrapper">
        {imagem && (
          <img 
            src={imagem} 
            alt={`${marca} ${modelo}`} 
            className="vc-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="vc-badge">
          {tipoAnuncio === 'particular' ? 'PARTICULAR' : 'LOJA'}
        </div>
        
        {tipoAnuncio === 'loja' && (
          <div 
             className="vc-logo-loja" 
             onClick={(e) => {
                e.preventDefault(); 
                if (idLoja) window.location.href = `/loja/${idLoja}`;
             }}
             title="Ver página da loja"
          >
             {logoLoja ? (
                <img src={logoLoja} alt="Logo Loja" />
             ) : (
                <span style={{fontSize: '10px', color: '#999', fontWeight: 'bold'}}>LOJA</span>
             )}
          </div>
        )}
      </div>

      <div className="vc-content">
        <h3 className="vc-title">{marca} {modelo}</h3>
        
        <div className="vc-info-row">
          <div className="vc-info-item">
            <Calendar className="vc-info-icon" /> {ano}
          </div>
          <div className="vc-info-item">
            <Activity className="vc-info-icon" /> {km} km
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
           <span className="vc-price-label">Preço Sugerido</span>
           <div className="vc-price">R$ {preco}</div>
        </div>

        <div className="vc-btn-wrapper">
          <div className="vc-btn">Ver Detalhes</div>
        </div>
      </div>

      <div className="vc-footer">
         <MapPin className="vc-footer-icon" /> {local}
      </div>
    </Link>
  );
};

export default VehicleCard;
