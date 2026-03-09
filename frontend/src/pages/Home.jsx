import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Search, LogOut, X } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import MyVehiclesList from '../components/MyVehiclesList';
import AddVehicleModal from '../components/AddVehicleModal';
import '../custom.css';

const API_URL = '';


const Home = () => {
  const [isLogged, setIsLogged] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showDashboard, setShowDashboard] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [veiculos, setVeiculos] = React.useState([]);
  const [loadingVeiculos, setLoadingVeiculos] = React.useState(true);
  const [lojas, setLojas] = React.useState([]);
  const [loadingLojas, setLoadingLojas] = React.useState(true);

  React.useEffect(() => {
    // Verifica se existem credenciais
    const token = localStorage.getItem('carbike_token');
    const userStr = localStorage.getItem('carbike_user');
    if (token && userStr) {
      setIsLogged(true);
      setUserData(JSON.parse(userStr));
    }

    // Busca veículos reais da API
    fetch(API_URL + '/veiculos')
      .then(r => r.json())
      .then(data => { if (!data.error) setVeiculos(data.veiculos); })
      .catch(err => console.error('Erro ao buscar veículos:', err))
      .finally(() => setLoadingVeiculos(false));

    // Busca lojas reais da API
    fetch(API_URL + '/lojas')
      .then(r => r.json())
      .then(data => { if (!data.error) setLojas(data.lojas); })
      .catch(err => console.error('Erro ao buscar lojas:', err))
      .finally(() => setLoadingLojas(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carbike_token');
    localStorage.removeItem('carbike_user');
    window.location.reload();
  };

  // Divide os veículos em duas linhas para os dois Swipers
  const metade = Math.ceil(veiculos.length / 2);
  const linha1 = veiculos.slice(0, metade);
  const linha2 = veiculos.slice(metade);

  // Converte os dados da API para o formato que o VehicleCard espera
  const mapVeiculo = (v) => ({
    id: v.id,
    marca: v.marca,
    modelo: v.modelo,
    ano: v.ano,
    preco: Number(v.preco).toLocaleString('pt-BR'),
    km: v.km,
    local: v.cidade || 'Brasil',
    tipo: v.tipoVendedor === 'JURIDICA' ? 'loja' : 'particular',
    img: v.fotoUrl || ''
  });

  return (
    <div className="main-wrapper">

      {/* Painel de Boas Vindas se Logado */}
      {isLogged && userData && (
         <div className="bg-gradient-to-r from-[#001f44] to-[#144275] rounded-2xl mb-8 text-white shadow-xl relative overflow-hidden fade-in" style={{ padding: '24px' }}>
            <div className="relative z-10 flex justify-between items-center sm:flex-row flex-col gap-4 text-center sm:text-left">
               <div>
                 <h2 className="text-2xl font-bold">Olá, {userData.type === 'JURIDICA' ? 'Lojista Parceiro' : 'Usuário VIP'} 👋</h2>
                 <p className="text-blue-100 opacity-90 mt-1">Bem-vindo à Carbike! Acesse seu painel para gerenciar os anúncios.</p>
               </div>
               <div className="flex gap-3">
                 <button onClick={() => setShowDashboard(true)} className="flex items-center gap-2 bg-[#1c9be9] hover:bg-[#157eba] px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md text-white">
                   Meu Painel
                 </button>
                 <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-red-500/80 px-4 py-2.5 rounded-full font-bold text-sm transition-colors border border-white/20 text-white">
                   <LogOut size={16}/> Sair
                 </button>
               </div>
            </div>
            <div className="absolute top-0 right-0 opacity-10 blur-xl w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
         </div>
      )}

      {/* Painel de Gerenciamento */}
      {isLogged && showDashboard && (
         <div className="fixed inset-0 z-[60] bg-[#001f44]/80 backdrop-blur-sm flex items-center justify-center p-4 fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden slideUp">
               <div className="flex justify-between items-center border-b border-gray-100 bg-gray-50/50" style={{ padding: '16px 24px' }}>
                  <h2 className="text-xl font-bold text-[#001f44]">Painel de Gerenciamento</h2>
                  <button onClick={() => setShowDashboard(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                     <X size={24} />
                  </button>
               </div>
               <div className="overflow-y-auto custom-scrollbar flex-1 relative" style={{ padding: '24px' }}>
                  <MyVehiclesList onOpenAddModal={() => setShowAddModal(true)} />
               </div>
            </div>
         </div>
      )}

      {/* Modal de Inclusão de Veículos */}
      {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} />}

      <div>
         <h1 className="page-title">Destaques</h1>
         <div style={{ marginBottom: '20px' }}>
           <label htmlFor="regioes" className="input-label">Selecione sua Região</label>
           <select id="regioes" className="custom-select">
             <option value="todos">Todas</option>
             <option value="sp">São Paulo (SP)</option>
           </select>
         </div>
      </div>

      {/* Loading */}
      {loadingVeiculos && (
        <div className="flex justify-center items-center py-10 text-[var(--primary-color)] font-bold">
          Carregando anúncios...
        </div>
      )}

      {/* Swiper 1 — Primeira metade dos veículos */}
      {!loadingVeiculos && linha1.length > 0 && (
        <div className="swiper-section">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={15}
            slidesPerView="auto"
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
          >
            {linha1.map(v => (
              <SwiperSlide key={v.id} style={{ width: 'auto' }}>
                <VehicleCard {...mapVeiculo(v)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Swiper 2 — Segunda metade dos veículos */}
      {!loadingVeiculos && linha2.length > 0 && (
        <div className="swiper-section" style={{ marginTop: '15px' }}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={15}
            slidesPerView="auto"
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
          >
            {linha2.map(v => (
              <SwiperSlide key={v.id} style={{ width: 'auto' }}>
                <VehicleCard {...mapVeiculo(v)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Aviso se não houver veículos */}
      {!loadingVeiculos && veiculos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg font-bold">Nenhum veículo cadastrado ainda.</p>
          <p className="text-sm mt-1">Seja o primeiro a anunciar na Carbike!</p>
        </div>
      )}

      <div className="fipe-btn-container mb-10">
        <a href="https://veiculos.fipe.org.br/#carro-comum" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button className="btn-fipe">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <rect x="4" y="6" width="16" height="3" fill="currentColor"/>
               <rect x="4" y="11" width="16" height="3" fill="currentColor"/>
               <rect x="4" y="16" width="10" height="3" fill="currentColor"/>
            </svg>
            Tabela Fipe
          </button>
        </a>
      </div>

      {/* Seção de Lojas Parceiras */}
      {!loadingLojas && lojas.length > 0 && (
        <div className="lojas-section pt-4">
            <h2 className="page-title">Lojas</h2>
            <div className="search-wrapper mb-6">
              <input type="text" className="input-search" placeholder="" />
              <Search className="search-icon" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
               {/* Botão Particulares */}
               <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-[80px] h-[80px] rounded-full border border-[var(--cinza-texto)] flex items-center justify-center bg-[#f0f0f0] shadow-sm group-hover:border-[var(--azul-carbike)] transition-all overflow-hidden p-2 text-center">
                     <span className="text-[11px] text-[var(--azul-carbike)] font-bold">Particulares</span>
                  </div>
                  <span className="text-[12px] font-bold text-[var(--azul-carbike)]">Particulares</span>
               </div>
               {/* Lojas reais da API */}
               {lojas.map(loja => (
                  <div key={loja.id} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="w-[80px] h-[80px] rounded-full border border-[var(--borda-cinza)] flex items-center justify-center bg-white shadow-sm group-hover:border-[var(--azul-carbike)] transition-all overflow-hidden">
                       {loja.logoUrl
                         ? <img src={loja.logoUrl} alt={loja.nome} className="w-full h-full object-cover" />
                         : <span className="text-[10px] text-[var(--cinza-texto)] font-bold text-center px-1">{loja.nome.charAt(0)}</span>
                       }
                    </div>
                    <span className="text-[12px] font-bold text-[var(--azul-carbike)] text-center" style={{maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{loja.nome}</span>
                  </div>
               ))}
            </div>
        </div>
      )}

    </div>
  );
};

export default Home;
