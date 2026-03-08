import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import '../custom.css';

// Mock de dados para preencher a pagina de ofertas (Baseado na Home + Extras)
const MOCK_OFERTAS = [
  { id: 1, marca: 'Chevrolet', modelo: 'Onix 1.0 MT LT', ano: '2020/2020', preco: '62.500', km: '35000', local: 'Campinas - SP', tipo: 'particular', img: '/img/21.png' },
  { id: 2, marca: 'Toyota', modelo: 'Corolla XEI 2.0', ano: '2022/2023', preco: '145.000', km: '15000', local: 'São Paulo - SP', tipo: 'loja', img: '/img/22.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=T' },
  { id: 3, marca: 'Volkswagen', modelo: 'Nivus Highline', ano: '2023/2024', preco: '128.900', km: '5000', local: 'Mogi Mirim - SP', tipo: 'loja', img: '/img/23.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=V' },
  { id: 4, marca: 'Honda', modelo: 'Civic LXR 2.0 Flex', ano: '2015/2016', preco: '75.900', km: '85000', local: 'Mogi Guaçu - SP', tipo: 'loja', img: '/img/20.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=H' },
  { id: 5, marca: 'Hyundai', modelo: 'HB20 1.0 Comfort', ano: '2019/2019', preco: '55.000', km: '42000', local: 'Americana - SP', tipo: 'particular', img: '' },
  { id: 6, marca: 'Jeep', modelo: 'Compass Longitude', ano: '2021/2022', preco: '135.000', km: '28000', local: 'Piracicaba - SP', tipo: 'loja', img: '', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=J' },
  { id: 7, marca: 'Fiat', modelo: 'Toro Volcano Diesel', ano: '2022/2023', preco: '175.000', km: '22000', local: 'Jundiaí - SP', tipo: 'loja', img: '', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=F' },
  { id: 8, marca: 'Ford', modelo: 'Ka 1.0 SE Plus', ano: '2019/2020', preco: '48.900', km: '52000', local: 'Sumaré - SP', tipo: 'particular', img: '/img/23.png' },
  { id: 9, marca: 'Renault', modelo: 'Kwid Zen 1.0', ano: '2021/2022', preco: '45.500', km: '31000', local: 'Valinhos - SP', tipo: 'loja', img: '/img/21.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=R' },
  { id: 10, marca: 'BMW', modelo: '320i Sport GP', ano: '2020/2020', preco: '215.000', km: '29000', local: 'São Paulo - SP', tipo: 'loja', img: '/img/22.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=B' },
  { id: 11, marca: 'Nissan', modelo: 'Kicks Advance', ano: '2023/2024', preco: '118.000', km: '12000', local: 'Indaiatuba - SP', tipo: 'loja', img: '/img/20.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=N' },
  { id: 12, marca: 'Volkswagen', modelo: 'Polo Track', ano: '2023/2024', preco: '82.000', km: '8000', local: 'Campinas - SP', tipo: 'particular', img: '' }
];

const Ofertas = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);

  return (
    <div className="ofertas-container">
      {/* Botao Flutuante Mobile para abrir os Filtros */}
      <div className="btn-mobile-filters md:hidden" onClick={toggleFilters}>
         <Filter size={16} />
         <span>Filtrar</span>
      </div>

      <div className="main-ofertas-content">
        <div className="ofertas-header">
           <div className="search-wrapper mb-6" style={{maxWidth: '500px', margin: '0 auto'}}>
             <input type="text" className="input-search" placeholder="Pesquise um Veículo" />
             <Search className="search-icon" />
           </div>
        </div>

        <div className="ofertas-grid">
           {MOCK_OFERTAS.map(v => (
             <VehicleCard key={v.id} {...v} />
           ))}
        </div>
      </div>

      {/* Sidebar Direita de Filtros */}
      <>
        <div className={`filter-overlay ${isFilterOpen ? 'active' : ''}`} onClick={toggleFilters} />
        <div className={`sidebar-filters ${isFilterOpen ? 'open' : ''}`}>
          <div className="filter-header-mobile md:hidden">
             <h3>Filtros</h3>
             <button onClick={toggleFilters} className="close-filter-btn"><X size={20} /></button>
          </div>
          
          <div className="filter-header hidden md:flex">
             <p>Filtros</p>
          </div>

          <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="search-wrapper w-full mb-4">
              <input type="text" className="input-search" placeholder="Pesquise um Veículo" />
              <Search className="search-icon" />
            </div>

            <select className="custom-select mb-3">
              <option value="">Todos os status</option>
              <option value="Novo">Novo</option>
              <option value="Usado">Usado</option>
            </select>

            <select className="custom-select mb-3">
              <option value="">Cidade</option>
              <option value="SP">São Paulo</option>
              <option value="CP">Campinas</option>
            </select>

            <select className="custom-select mb-3">
              <option value="">Classe do Veículo</option>
              <option value="Carro">Carro</option>
              <option value="Motocicleta">Motocicleta</option>
              <option value="caminhao">Caminhão</option>
            </select>

            <div className="custom-select mb-3 p-0" style={{border: 'none'}}>
              <input type="text" placeholder="Pesquise a Marca" className="input-search" style={{width: '100%', borderRadius: '20px'}} />
            </div>

            <select className="custom-select mb-3">
              <option value="">Marcas</option>
              <option value="CHEVROLET">CHEVROLET</option>
              <option value="FIAT">FIAT</option>
              <option value="FORD">FORD</option>
              <option value="HONDA">HONDA</option>
              <option value="HYUNDAI">HYUNDAI</option>
              <option value="TOYOTA">TOYOTA</option>
              <option value="VOLKSWAGEN">VOLKSWAGEN</option>
            </select>

            <select className="custom-select mb-3">
              <option value="">Modelo</option>
            </select>

            <select className="custom-select mb-3">
              <option value="">Cor</option>
              <option value="Branco">Branco</option>
              <option value="Preto">Preto</option>
              <option value="Prata">Prata</option>
            </select>

            <div className="filter-row mb-3">
              <div className="filter-col">
                <label>Ano</label>
                <input type="text" placeholder="de" className="input-search" style={{borderRadius: '5px', padding: '8px 10px'}} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" className="input-search" style={{borderRadius: '5px', padding: '8px 10px'}} />
              </div>
            </div>

            <select className="custom-select mb-3">
              <option value="">Combustível</option>
              <option value="Flex">Flex</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Híbrido">Híbrido</option>
            </select>

            <div className="filter-row mb-3">
              <div className="filter-col">
                <label>Quilometragem</label>
                <input type="text" placeholder="de" className="input-search" style={{borderRadius: '5px', padding: '8px 10px'}} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" className="input-search" style={{borderRadius: '5px', padding: '8px 10px'}} />
              </div>
            </div>

            <div className="filter-row mb-6">
              <div className="filter-col">
                <label>Valor</label>
                <input type="text" placeholder="de" className="input-search" style={{borderRadius: '5px', padding: '8px 10px'}} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" className="input-search" style={{borderRadius: '5px', padding: '8px 10px'}} />
              </div>
            </div>

            <div className="w-full flex justify-center mb-6">
              <button className="btn-fipe" style={{width: '150px', justifyContent: 'center'}}>Filtrar</button>
            </div>
          </form>
        </div>
      </>
    </div>
  );
};

export default Ofertas;
