import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import '../custom.css';

const API_URL = 'http://localhost:3000';

const Ofertas = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL + '/veiculos')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setVeiculos(data.veiculos);
      })
      .catch(err => console.error('Erro ao buscar ofertas:', err))
      .finally(() => setLoading(false));
  }, []);

  const mapVeiculo = (v) => {
    const rawPhotos = (v.file_path || '').split(/[;,]/);
    const cover = rawPhotos[0]?.trim() || 'carro_default.png';
    const finalFoto = cover !== 'carro_default.png'
      ? `${API_URL}/uploads/veiculo/${encodeURIComponent(cover)}`
      : `${API_URL}/uploads/carro_default.png`;

    // Logo da loja/vendedor
    const rawLogo = v.logoLoja ? v.logoLoja.split('/').pop() : v.logo;
    const finalLogo = rawLogo && rawLogo !== 'user_default.png'
      ? `${API_URL}/uploads/empresas/${encodeURIComponent(rawLogo.split('/').pop())}`
      : null;

    return {
      id: v.id,
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      preco: Number(v.preco).toLocaleString('pt-BR'),
      km: v.km,
      local: v.cidade || 'Brasil',
      tipoAnuncio: v.tipoVendedor === 'JURIDICA' ? 'loja' : 'particular',
      imagem: finalFoto,
      logoLoja: finalLogo,
      idLoja: v.idLoja,
      used: v.used
    };
  };

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
          <div className="search-wrapper mb-6" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <input type="text" className="input-search" placeholder="Pesquise um Veículo" />
            <Search className="search-icon" />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10 text-[var(--primary-color)] font-bold">
            Carregando veículos...
          </div>
        )}

        {!loading && veiculos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-lg font-bold">Nenhum veículo disponível no momento.</p>
          </div>
        )}

        <div className="ofertas-grid">
          {veiculos.map(v => (
            <VehicleCard key={v.id} {...mapVeiculo(v)} />
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

            <div className="custom-select mb-3 p-0" style={{ border: 'none' }}>
              <input type="text" placeholder="Pesquise a Marca" className="input-search" style={{ width: '100%', borderRadius: '20px' }} />
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
                <input type="text" placeholder="de" className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
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
                <input type="text" placeholder="de" className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
            </div>

            <div className="filter-row mb-6">
              <div className="filter-col">
                <label>Valor</label>
                <input type="text" placeholder="de" className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
            </div>

            <div className="w-full flex justify-center mb-6">
              <button className="btn-fipe" style={{ width: '150px', justifyContent: 'center' }}>Filtrar</button>
            </div>
          </form>
        </div>
      </>
    </div>
  );
};

export default Ofertas;
