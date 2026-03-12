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
import { Link } from 'react-router-dom';
import '../custom.css';

import API_URL from '../api';


const Home = () => {
  const [isLogged, setIsLogged] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showDashboard, setShowDashboard] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [vehicleToEdit, setVehicleToEdit] = React.useState(null);
  const [veiculos, setVeiculos] = React.useState([]);
  const [loadingVeiculos, setLoadingVeiculos] = React.useState(true);
  const [lojas, setLojas] = React.useState([]);
  const [loadingLojas, setLoadingLojas] = React.useState(true);
  const [lojaFilter, setLojaFilter] = React.useState('');

  React.useEffect(() => {
    // Verifica se existem credenciais
    const token = localStorage.getItem('carbike_token');
    const userStr = localStorage.getItem('carbike_user');
    if (token && userStr) {
      setIsLogged(true);
      setUserData(JSON.parse(userStr));
    }

    // Busca apenas veículos Premium para a Home
    fetch(API_URL + '/veiculos?highlight=1')
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
  const mapVeiculo = (v) => {
    const rawPhotos = (v.file_path || '').split(/[;,]/);
    const cover = rawPhotos[0]?.trim() || 'carro_default.png';
    const finalFoto = cover !== 'carro_default.png' ? `${API_URL}/uploads/veiculo/${encodeURIComponent(cover)}` : '';

    // Logo da loja/vendedor
    const rawLogo = v.logoLoja ? v.logoLoja.split('/').pop() : null;
    const finalLogo = rawLogo && rawLogo !== 'user_default.png' ? `${API_URL}/uploads/empresas/${encodeURIComponent(rawLogo)}` : null;

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

  return (
    <div className="main-wrapper">

      {/* Painel de Boas Vindas se Logado */}
      {isLogged && userData && (
        <div className="bg-gradient-to-r from-[#001f44] to-[#144275] rounded-[3rem] mb-12 text-white shadow-2xl relative overflow-hidden fade-in px-8 py-12 sm:p-14 border border-white/10">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                Olá, {userData.name || userData.nome || userData.user?.nome || userData.user?.name || 'Parceiro'} 👋
              </h2>
              <p className="text-blue-100/70 text-lg sm:text-2xl max-w-2xl leading-relaxed mx-auto">
                Seu painel administrativo está pronto. Gerencie seus anúncios e acompanhe o desempenho em tempo real.
              </p>
            </div>
            
            <div className="flex flex-col gap-6 w-full items-center">
              <button 
                onClick={() => setShowDashboard(true)} 
                className="w-fit min-w-[220px] flex items-center justify-center gap-3 bg-[#1c9be9] hover:bg-[#157eba] px-12 py-6 rounded-full font-black text-[17px] transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-white"
              >
                Meu Painel
              </button>
              <button 
                onClick={handleLogout} 
                className="w-fit min-w-[180px] flex items-center justify-center gap-3 bg-white/5 hover:bg-red-500/20 px-10 py-5 rounded-full font-bold text-[16px] transition-all border border-white/10 active:scale-95 text-white"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 opacity-10 blur-3xl w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
      )}

      {/* Painel de Gerenciamento */}
      {isLogged && showDashboard && (
        <div className="fixed inset-0 z-[60] bg-[#001f44]/80 backdrop-blur-sm flex items-center justify-center p-6 md:p-14 fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden slideUp">
            <div className="flex justify-between items-center border-b border-gray-100 bg-gray-50/50" style={{ padding: '16px 24px' }}>
              <h2 className="text-xl font-bold text-[#001f44]">Painel de Gerenciamento</h2>
              <button onClick={() => setShowDashboard(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 relative" style={{ padding: '24px' }}>
              <MyVehiclesList onOpenAddModal={(v) => {
                setVehicleToEdit(v || null);
                setShowAddModal(true);
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inclusão/Edição de Veículos */}
      {showAddModal && (
        <AddVehicleModal
          vehicleToEdit={vehicleToEdit}
          onClose={() => {
            setShowAddModal(false);
            setVehicleToEdit(null);
          }}
        />
      )}

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
            spaceBetween={10}
            slidesPerView={2.1}
            breakpoints={{
              320: { slidesPerView: 2.1, spaceBetween: 10 },
              480: { slidesPerView: 1.2, spaceBetween: 15 },
              768: { slidesPerView: 2.2, spaceBetween: 15 },
              1024: { slidesPerView: 3.2, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 }
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
          >
            {linha1.map(v => (
              <SwiperSlide key={v.id}>
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
            spaceBetween={10}
            slidesPerView={2.1}
            breakpoints={{
              320: { slidesPerView: 2.1, spaceBetween: 10 },
              480: { slidesPerView: 1.2, spaceBetween: 15 },
              768: { slidesPerView: 2.2, spaceBetween: 15 },
              1024: { slidesPerView: 3.2, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 }
            }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
          >
            {linha2.map(v => (
              <SwiperSlide key={v.id}>
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
              <rect x="4" y="6" width="16" height="3" fill="currentColor" />
              <rect x="4" y="11" width="16" height="3" fill="currentColor" />
              <rect x="4" y="16" width="10" height="3" fill="currentColor" />
            </svg>
            Tabela Fipe
          </button>
        </a>
      </div>

      {/* Seção de Lojas Parceiras */}
      {!loadingLojas && (
        <div className="lojas-section pt-4">
          <h2 className="page-title">Lojas</h2>
          <div className="search-wrapper mb-6">
            <input
              type="text"
              className="input-search"
              placeholder="Pesquisar loja..."
              value={lojaFilter}
              onChange={(e) => setLojaFilter(e.target.value)}
            />
            <Search className="search-icon" />
          </div>
          <div className="flex gap-x-6 gap-y-10 flex-wrap justify-center pb-6">
            {/* Botão Particulares */}
            <Link to="/ofertas?vendedor=FISICA" className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group no-underline">
              <div className="w-[80px] h-[80px] rounded-full border border-[var(--cinza-texto)] flex items-center justify-center bg-[#f0f0f0] shadow-sm group-hover:shadow-md group-hover:border-[var(--azul-carbike)] transition-all overflow-hidden p-2 text-center">
                <span className="text-[11px] text-[var(--azul-carbike)] font-bold">Particulares</span>
              </div>
              <span className="text-[12px] font-bold text-[var(--azul-carbike)]">Particulares</span>
            </Link>

            {/* Lojas reais da API filtradas */}
            {lojas.filter(l => l.nome.toLowerCase().includes(lojaFilter.toLowerCase())).map(loja => (
              <Link to={`/loja/${loja.id}`} key={loja.id} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group no-underline">
                <div className="w-[80px] h-[80px] rounded-full border border-[var(--borda-cinza)] flex items-center justify-center bg-white shadow-sm group-hover:shadow-md group-hover:border-[var(--azul-carbike)] transition-all overflow-hidden">
                  {(() => {
                    const fileName = loja.logo ? loja.logo.split('/').pop() : null;
                    const finalLogoUrl = fileName && fileName !== 'user_default.png' ? `${API_URL}/uploads/empresas/${encodeURIComponent(fileName)}` : null;

                    return finalLogoUrl ? (
                      <img src={finalLogoUrl} alt={loja.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[14px] text-[var(--cinza-texto)] font-bold text-center px-1">{loja.nome.charAt(0)}</span>
                    );
                  })()}
                </div>
                <span className="text-[11px] font-bold text-[var(--cinza-texto)] group-hover:text-[var(--azul-carbike)] transition-colors text-center no-underline" style={{ width: '80px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2', marginTop: '2px' }}>{loja.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
