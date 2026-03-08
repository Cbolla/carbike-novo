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

const MOCK_VEHICLES_LINE1 = [
  { id: 1, marca: 'Chevrolet', modelo: 'Onix 1.0 MT LT', ano: '2020/2020', preco: '62.500', km: '35000', local: 'Campinas - SP', tipo: 'particular', img: '/img/21.png' },
  { id: 2, marca: 'Toyota', modelo: 'Corolla XEI 2.0', ano: '2022/2023', preco: '145.000', km: '15000', local: 'São Paulo - SP', tipo: 'loja', img: '/img/22.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=T' },
  { id: 3, marca: 'Volkswagen', modelo: 'Nivus Highline', ano: '2023/2024', preco: '128.900', km: '5000', local: 'Mogi Mirim - SP', tipo: 'loja', img: '/img/23.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=V' },
  { id: 4, marca: 'Honda', modelo: 'Civic LXR 2.0 Flex', ano: '2015/2016', preco: '75.900', km: '85000', local: 'Mogi Guaçu - SP', tipo: 'loja', img: '/img/20.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=H' },
  { id: 5, marca: 'Hyundai', modelo: 'HB20 1.0 Comfort', ano: '2019/2019', preco: '55.000', km: '42000', local: 'Americana - SP', tipo: 'particular', img: '' },
  { id: 6, marca: 'Jeep', modelo: 'Compass Longitude', ano: '2021/2022', preco: '135.000', km: '28000', local: 'Piracicaba - SP', tipo: 'loja', img: '', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=J' }
];

const MOCK_VEHICLES_LINE2 = [
  { id: 7, marca: 'Fiat', modelo: 'Toro Volcano Diesel', ano: '2022/2023', preco: '175.000', km: '22000', local: 'Jundiaí - SP', tipo: 'loja', img: '', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=F' },
  { id: 8, marca: 'Ford', modelo: 'Ka 1.0 SE Plus', ano: '2019/2020', preco: '48.900', km: '52000', local: 'Sumaré - SP', tipo: 'particular', img: '/img/23.png' },
  { id: 9, marca: 'Renault', modelo: 'Kwid Zen 1.0', ano: '2021/2022', preco: '45.500', km: '31000', local: 'Valinhos - SP', tipo: 'loja', img: '/img/21.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=R' },
  { id: 10, marca: 'BMW', modelo: '320i Sport GP', ano: '2020/2020', preco: '215.000', km: '29000', local: 'São Paulo - SP', tipo: 'loja', img: '/img/22.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=B' },
  { id: 11, marca: 'Nissan', modelo: 'Kicks Advance', ano: '2023/2024', preco: '118.000', km: '12000', local: 'Indaiatuba - SP', tipo: 'loja', img: '/img/20.png', logoLoja: 'https://dummyimage.com/100x100/e0e0e0/555&text=N' },
  { id: 12, marca: 'Volkswagen', modelo: 'Polo Track', ano: '2023/2024', preco: '82.000', km: '8000', local: 'Campinas - SP', tipo: 'particular', img: '' }
];

const Home = () => {
  const [isLogged, setIsLogged] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showDashboard, setShowDashboard] = React.useState(false);
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    // Verifica se existem credenciais (Token de Cliente ou Vendedor)
    const token = localStorage.getItem('carbike_token');
    const userStr = localStorage.getItem('carbike_user');
    
    if (token && userStr) {
       setIsLogged(true);
       setUserData(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carbike_token');
    localStorage.removeItem('carbike_user');
    window.location.reload(); // Recarrega para voltar à visão Pública
  };

  return (
    <div className="main-wrapper">
      
      {/* Exibe o Painel de Boas Vindas se Lojista/Particular estiver Logado */}
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
            {/* Elemento Decorativo */}
            <div className="absolute top-0 right-0 opacity-10 blur-xl w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
         </div>
      )}

      {/* Painel de Gerenciamento do Lojista (Abre como Modal sobre a Home) */}
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

      {/* Modal de Inclusão de Veículos (Sobrepõe os demais elementos) */}
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

      <div className="swiper-section">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={15}
          slidesPerView="auto"
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
        >
          {MOCK_VEHICLES_LINE1.map(v => (
            <SwiperSlide key={v.id} style={{ width: 'auto' }}>
              <VehicleCard {...v} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="swiper-section" style={{ marginTop: '15px' }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={15}
          slidesPerView="auto"
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
        >
          {MOCK_VEHICLES_LINE2.map(v => (
            <SwiperSlide key={v.id} style={{ width: 'auto' }}>
              <VehicleCard {...v} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

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

      {/* Banner Publicidade Exclusivo Mobile Carrossel (Fica acima das lojas) */}
      <div className="ad-mobile-full md:hidden bg-[#f8f9fa] border-y border-dashed border-[var(--borda-cinza)] flex flex-col items-center justify-center text-center mb-8 py-2">
         <span className="text-[10px] text-[var(--cinza-texto)] font-bold uppercase tracking-widest mb-2">Publicidade</span>
         <div className="w-full">
           <Swiper
             modules={[Autoplay, Pagination]}
             spaceBetween={0}
             slidesPerView={1}
             autoplay={{ delay: 4000, disableOnInteraction: false }}
             pagination={{ clickable: true, dynamicBullets: true }}
             className="w-full"
           >
             <SwiperSlide>
               <img 
                  src="https://dummyimage.com/600x120/002b5e/ffffff&text=Anuncie+Sua+Loja+Aqui" 
                  alt="Banner Publicidade 1" 
                  className="w-full h-[120px] object-cover cursor-pointer"
               />
             </SwiperSlide>
             <SwiperSlide>
               <img 
                  src="https://dummyimage.com/600x120/e5e5e5/333333&text=Compre+Seguro+Carbike" 
                  alt="Banner Publicidade 2" 
                  className="w-full h-[120px] object-cover cursor-pointer"
               />
             </SwiperSlide>
             <SwiperSlide>
               <img 
                  src="https://dummyimage.com/600x120/ffcc00/000000&text=Mega+Feirao+de+Fim+de+Ano" 
                  alt="Banner Publicidade 3" 
                  className="w-full h-[120px] object-cover cursor-pointer"
               />
             </SwiperSlide>
           </Swiper>
         </div>
      </div>

      <div className="lojas-section pt-4">
          <h2 className="page-title">Lojas</h2>
          
          <div className="search-wrapper mb-6">
            <input type="text" className="input-search" placeholder="" />
            <Search className="search-icon" />
          </div>

          <div className="lojas-mock up-container flex gap-4 overflow-x-auto pb-6" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
             
             {/* Particulars (Primeiro Item Fixo) */}
             <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-[80px] h-[80px] rounded-full border border-[var(--cinza-texto)] flex items-center justify-center bg-[#f0f0f0] shadow-sm group-hover:border-[var(--azul-carbike)] transition-all overflow-hidden p-2 text-center">
                   <span className="text-[11px] text-[var(--azul-carbike)] font-bold">Particulares</span>
                </div>
                <span className="text-[12px] font-bold text-[var(--azul-carbike)]">Particulares</span>
             </div>

             {/* Outras Lojas Fake */}
             {[1,2,3,4,5,6].map(i => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-[80px] h-[80px] rounded-full border border-[var(--borda-cinza)] flex items-center justify-center bg-white shadow-sm group-hover:border-[var(--azul-carbike)] transition-all overflow-hidden">
                     <span className="text-[10px] text-[var(--cinza-texto)] font-bold">Logo {i}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[var(--azul-carbike)]">Loja Fake {i}</span>
                </div>
             ))}
          </div>
      </div>

    </div>
  );
};

export default Home;
