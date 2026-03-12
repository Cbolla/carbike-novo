import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import '../custom.css';

import API_URL from '../api';

const Ofertas = () => {
  const [searchParams] = useSearchParams();
  const initialVendedor = searchParams.get('vendedor') || '';
  
  const [isFilterOpen, setIsFilterOpen] = useState(window.innerWidth > 1024); // Aberto por padrão em telas grandes
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // FIPE States
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [brandCode, setBrandCode] = useState('');

  // Estados para os filtros
  const [filters, setFilters] = useState({
    status: '',
    cidade: '',
    classe: '',
    marca: '',
    modelo: '',
    cor: '',
    anoDe: '',
    anoAte: '',
    combustivel: '',
    kmDe: '',
    kmAte: '',
    valorDe: '',
    valorAte: '',
    tipoVendedor: initialVendedor
  });

  const typeMap = { 'Carro': 'carros', 'Moto': 'motos', 'Caminhão': 'caminhoes' };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fipeType = typeMap[filters.classe] || 'carros';
    fetch(`https://parallelum.com.br/fipe/api/v1/${fipeType}/marcas`)
      .then(res => res.json())
      .then(data => setMarcas(data))
      .catch(err => console.error("Erro marcas:", err));
  }, [filters.classe]);

  const loadBrandModels = async (code, fipeTypeParam) => {
    const fipeType = fipeTypeParam || typeMap[filters.classe] || 'carros';
    if (!code) {
      setModelos([]);
      return;
    }
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${fipeType}/marcas/${code}/modelos`);
      const data = await res.json();
      setModelos(data.modelos || []);
    } catch (err) {
      console.error("Erro modelos:", err);
    }
  };

  const handleNumberFilterChange = (field, value) => {
    const onlyNumbers = value.replace(/\D/g, '');
    setFilters(prev => ({ ...prev, [field]: onlyNumbers }));
  };

  const formatNumber = (numStr) => {
    if (!numStr) return '';
    return Number(numStr).toLocaleString('pt-BR');
  };

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

  const filteredVeiculos = veiculos.filter(v => {
    // Search
    const matchSearch = v.marca?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       v.modelo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;

    if (filters.status && v.used !== undefined) {
      if (filters.status === 'Novo' && Number(v.used) !== 0) return false;
      if (filters.status === 'Usado' && Number(v.used) !== 1) return false;
    }
    
    // O campo no banco é 'tipo' (sector)
    const vehicleType = v.tipo || v.sector;
    if (filters.classe && vehicleType?.toLowerCase() !== filters.classe.toLowerCase()) return false;
    
    if (filters.cidade && v.cidade?.toLowerCase() !== filters.cidade.toLowerCase()) return false;
    
    // Marca and Modelo
    if (filters.marca && v.marca?.trim().toLowerCase() !== filters.marca.trim().toLowerCase()) return false;
    if (filters.modelo && v.modelo?.trim().toLowerCase() !== filters.modelo.trim().toLowerCase()) return false;
    
    if (filters.cor && v.color?.toLowerCase() !== filters.cor.toLowerCase()) return false;
    if (filters.combustivel && v.fuel?.toLowerCase() !== filters.combustivel.toLowerCase()) return false;

    // Number ranges
    if (filters.anoDe && Number(v.ano) < Number(filters.anoDe)) return false;
    if (filters.anoAte && Number(v.ano) > Number(filters.anoAte)) return false;

    if (filters.kmDe && Number(v.km) < Number(filters.kmDe)) return false;
    if (filters.kmAte && Number(v.km) > Number(filters.kmAte)) return false;

    if (filters.valorDe && Number(v.preco) < Number(filters.valorDe)) return false;
    if (filters.valorAte && Number(v.preco) > Number(filters.valorAte)) return false;

    // Filtro por Vendedor (FISICA = Particulares, JURIDICA = Lojas/CNPJ)
    if (filters.tipoVendedor && v.tipoVendedor?.toUpperCase() !== filters.tipoVendedor.toUpperCase()) return false;

    return true;
  });

  return (
    <div className="ofertas-container">
      <div className={`main-ofertas-content ${!isFilterOpen ? 'no-sidebar' : ''}`}>
        <div className="ofertas-header mb-8">
          <div className="search-wrapper w-full relative">
            <input 
              type="text" 
              className="input-search" 
              placeholder="Pesquise por marca ou modelo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="search-icon" />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10 text-[var(--primary-color)] font-bold">
            Carregando veículos...
          </div>
        )}

        {!loading && filteredVeiculos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-lg font-bold">Nenhum veículo encontrado para a busca.</p>
          </div>
        )}

        <div className="ofertas-grid">
          {filteredVeiculos.map(v => (
            <VehicleCard key={v.id} {...mapVeiculo(v)} />
          ))}
        </div>
      </div>

      {/* Sidebar Direita de Filtros */}
      <>
        <div className={`filter-overlay ${isFilterOpen ? 'active' : ''}`} onClick={toggleFilters} />
        <div className={`sidebar-filters ${isFilterOpen ? 'open' : 'closed'}`}>
          <div className="filter-header-mobile md:hidden">
            <h3>Filtros</h3>
            <button onClick={toggleFilters} className="close-filter-btn"><X size={20} /></button>
          </div>

          <div className="filter-header-desktop hidden md:flex justify-center py-6">
            <div className="btn-sidebar-toggle" onClick={toggleFilters}>
              <Filter size={16} />
              <span>{isFilterOpen ? 'Ocultar Filtros' : 'Filtrar'}</span>
            </div>
          </div>

          <form className="filter-form" onSubmit={(e) => { e.preventDefault(); if(window.innerWidth < 768) toggleFilters(); }}>
            <div className="search-wrapper w-full mb-4">
              <input 
                type="text" 
                className="input-search" 
                placeholder="Pesquise por marca ou modelo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <Search className="search-icon" />
            </div>

            <select className="custom-select mb-3" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="">Status (Novo/Usado)</option>
              <option value="Novo">Novo</option>
              <option value="Usado">Usado</option>
            </select>

            <select className="custom-select mb-3" value={filters.tipoVendedor} onChange={(e) => handleFilterChange('tipoVendedor', e.target.value)}>
              <option value="">Tipo de Vendedor</option>
              <option value="FISICA">Particulares (CPF)</option>
              <option value="JURIDICA">Lojas (CNPJ)</option>
            </select>

            <select className="custom-select mb-3" value={filters.cidade} onChange={(e) => handleFilterChange('cidade', e.target.value)}>
              <option value="">Cidade</option>
              <option value="São Paulo">São Paulo</option>
              <option value="Campinas">Campinas</option>
              <option value="Rio de Janeiro">Rio de Janeiro</option>
              <option value="Porto Alegre">Porto Alegre</option>
            </select>

            <select className="custom-select mb-3" value={filters.classe} onChange={(e) => {
              handleFilterChange('classe', e.target.value);
              handleFilterChange('marca', '');
              handleFilterChange('modelo', '');
              setBrandCode('');
              setModelos([]);
            }}>
              <option value="">Classe do Veículo</option>
              <option value="Carro">Carro</option>
              <option value="Motocicleta">Motocicleta</option>
              <option value="Caminhao">Caminhão</option>
            </select>

            <select className="custom-select mb-3" value={brandCode} onChange={(e) => {
              const code = e.target.value;
              const name = marcas.find(m => m.codigo === code)?.nome || '';
              setBrandCode(code);
              handleFilterChange('marca', name);
              handleFilterChange('modelo', ''); // Resetar modelo ao trocar de marca
              loadBrandModels(code, typeMap[filters.classe] || 'carros');
            }}>
              <option value="">Selecione a Marca</option>
              {marcas.map(m => (
                <option key={m.codigo} value={m.codigo}>{m.nome}</option>
              ))}
            </select>

            <select className="custom-select mb-3" value={filters.modelo} onChange={(e) => handleFilterChange('modelo', e.target.value)} disabled={modelos.length === 0}>
              <option value="">Modelo {modelos.length === 0 ? '(Selecione a Marca antes)' : ''}</option>
              {modelos.map(m => (
                <option key={m.codigo} value={m.nome}>{m.nome}</option>
              ))}
            </select>

            <select className="custom-select mb-3" value={filters.cor} onChange={(e) => handleFilterChange('cor', e.target.value)}>
              <option value="">Cor</option>
              <option value="Branco">Branco</option>
              <option value="Preto">Preto</option>
              <option value="Prata">Prata</option>
              <option value="Cinza">Cinza</option>
              <option value="Vermelho">Vermelho</option>
              <option value="Azul">Azul</option>
            </select>

            <div className="filter-row mb-3">
              <div className="filter-col">
                <label>Ano</label>
                <input type="number" placeholder="de" value={filters.anoDe} onChange={(e) => handleFilterChange('anoDe', e.target.value)} className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="number" placeholder="até" value={filters.anoAte} onChange={(e) => handleFilterChange('anoAte', e.target.value)} className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
            </div>

            <select className="custom-select mb-3" value={filters.combustivel} onChange={(e) => handleFilterChange('combustivel', e.target.value)}>
              <option value="">Combustível</option>
              <option value="Flex">Flex</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Etanol">Etanol</option>
            </select>

            <div className="filter-row mb-3">
              <div className="filter-col">
                <label>Quilometragem</label>
                <input type="text" placeholder="de" value={formatNumber(filters.kmDe)} onChange={(e) => handleNumberFilterChange('kmDe', e.target.value)} className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" value={formatNumber(filters.kmAte)} onChange={(e) => handleNumberFilterChange('kmAte', e.target.value)} className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
            </div>

            <div className="filter-row mb-6">
              <div className="filter-col">
                <label>Valor (R$)</label>
                <input type="text" placeholder="de" value={formatNumber(filters.valorDe)} onChange={(e) => handleNumberFilterChange('valorDe', e.target.value)} className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
              <div className="filter-col">
                <label>&nbsp;</label>
                <input type="text" placeholder="até" value={formatNumber(filters.valorAte)} onChange={(e) => handleNumberFilterChange('valorAte', e.target.value)} className="input-search" style={{ borderRadius: '5px', padding: '8px 10px' }} />
              </div>
            </div>

            <div className="w-full flex justify-center mb-6">
              <button type="submit" className="btn-fipe" style={{ width: '150px', justifyContent: 'center' }}>Aplicar Filtros</button>
            </div>
          </form>
        </div>
        
        {/* Botao de Filtrar (Unificado) - Colocado aqui para o CSS sibling selector funcionar */}
        <div className="btn-mobile-filters" onClick={toggleFilters}>
          <Filter size={16} />
          <span>Filtrar</span>
        </div>
      </>
    </div>
  );
};

export default Ofertas;
