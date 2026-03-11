import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { X, MapPin, Calendar, Activity, Cpu, Fuel, Palette, Hash, Car, Info } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import '../custom.css';

const VeiculoDetalhes = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalFinance, setModalFinance] = useState(false);
  const [modalZoom, setModalZoom] = useState({ open: false, src: '', index: 0 });

  // Estados para Simulação Daycoval
  const [simFormData, setSimFormData] = useState({
    nome: '', cpf: '', nascimento: '', telefone: '', entrada: '', parcelas: ''
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoadingSim, setIsLoadingSim] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/veiculos/${id}`);
        const data = await response.json();
        if (data.error) throw new Error(data.mensagem);

        const v = data.veiculo;
        if (v) {
          const API_BASE = 'http://localhost:3000';
          const fotosRaw = (v.file_path || '').split(/[;,]/);
          v.imagens = fotosRaw
            .map(f => {
              const name = f?.trim();
              if (name && name !== '' && name !== 'carro_default.png') {
                return `${API_BASE}/uploads/veiculo/${encodeURIComponent(name)}`;
              }
              return null;
            })
            .filter(Boolean);

          if (v.imagens.length === 0) v.imagens.push(`${API_BASE}/uploads/carro_default.png`);

          if (v.loja && (v.loja.logo || v.logoLoja)) {
            const logoToUse = v.loja.logo || v.logoLoja;
            const rawLogo = logoToUse.split('/').pop();
            v.loja.logo = rawLogo && rawLogo !== 'user_default.png' ? `${API_BASE}/uploads/empresas/${encodeURIComponent(rawLogo)}` : null;
          }
        }

        setVehicle(v);
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
        setError("Não foi possível carregar as informações deste veículo.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001f44] mb-4"></div>
      <p className="text-gray-500 font-bold">Carregando detalhes do veículo...</p>
    </div>
  );

  if (error || !vehicle) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-red-500 mb-2">Ops! 😕</h2>
      <p className="text-gray-600">{error || "Veículo não encontrado."}</p>
      <Link to="/" className="inline-block mt-4 bg-[#001f44] text-white px-6 py-2 rounded-full font-bold">Voltar para Home</Link>
    </div>
  );

  // Helper simulação
  const calculaParcelas = (valorEntrada, valorFinanciado, percentualEntrada, stringAno, valorCarro) => {
    const anoCarro = parseInt(String(stringAno).split('/')[0].trim()) || 2020;
    let novoFinanciado = (valorCarro - valorEntrada) + 1800;
    let pArt = 20;
    if (percentualEntrada < 30) pArt = 20;
    else if (percentualEntrada < 40) pArt = 30;
    else if (percentualEntrada < 50) pArt = 40;
    else if (percentualEntrada >= 50) pArt = 50;
    const dataObj = {
      20: [0.06103, 0.0459, 0.04325, 0.04087, 0.03815],
      30: [0.06038, 0.04521, 0.04253, 0.04012, 0.03735],
      40: [0.06005, 0.04453, 0.04146, 0.03901, 0.03617],
      50: [0.05947, 0.04412, 0.04139, 0.03894, 0.03609]
    };
    const d = dataObj[pArt];
    const format = (v) => parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return [
      { meses: 60, vl: format(d[4] * novoFinanciado) },
      { meses: 48, vl: format(d[3] * novoFinanciado) },
      { meses: 42, vl: format(d[2] * novoFinanciado) },
      { meses: 36, vl: format(d[1] * novoFinanciado) },
      { meses: 24, vl: format(d[0] * novoFinanciado) }
    ];
  };

  const parseCurrencyStr = (curr) => {
    if (typeof curr === 'number') return curr;
    return parseFloat(curr.replace(/[^\d\,]/g, '').replace(',', '.'));
  };

  const handleSimulate = (e) => {
    e.preventDefault();
    const carValue = parseCurrencyStr(vehicle.preco);
    let entrada = parseFloat(simFormData.entrada);
    const minEntrada = carValue * 0.2;
    if (isNaN(entrada) || entrada < minEntrada) {
      alert("A entrada mínima é de R$ " + minEntrada.toLocaleString('pt-br', { minimumFractionDigits: 2 }));
      entrada = minEntrada;
    }
    const loanAmount = carValue - entrada;
    const percentual = (entrada / carValue) * 100;
    const parcelList = calculaParcelas(entrada, loanAmount, percentual, vehicle.ano, carValue);
    setIsLoadingSim(true);
    setSimulationResult(null);
    setTimeout(() => {
      setSimulationResult({
        entradaFormatada: entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        financiadoFormatado: loanAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        percentualFormatado: percentual.toFixed(2),
        mesSelecionado: simFormData.parcelas,
        parcelas: parcelList
      });
      setIsLoadingSim(false);
    }, 8000);
  };

  return (
    <div className="veiculo-detalhes-page bg-[#f3f4f6] min-h-screen">
      <style>{`
        .veiculo-swiper {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .veiculo-swiper .swiper-wrapper {
          display: flex;
          align-items: center;
        }
        .veiculo-swiper .swiper-slide {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
        .veiculo-swiper .swiper-button-next, 
        .veiculo-swiper .swiper-button-prev {
          color: #1c9be9 !important;
        }
        .veiculo-swiper .swiper-pagination-bullet-active {
          background: #1c9be9 !important;
        }
      `}</style>
      {/* 1) TOPO : CARROSSEL SWIPER */}
      <section className="veiculo-gallery-section bg-[#f8f9fa] w-full">
        <div className="carousel-wrapper">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            className="veiculo-swiper"
            centeredSlides={true}
            centeredSlidesBounds={true}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 20 },
              1200: { slidesPerView: 3, spaceBetween: 30 }
            }}
          >
            {vehicle.imagens.map((img, idx) => (
              <SwiperSlide key={idx} className="flex items-center justify-center cursor-zoom-in" onClick={() => setModalZoom({ open: true, src: img, index: idx })}>
                <img src={img} alt={`Foto ${idx + 1}`} className="carousel-img" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 2) INFO PRINCIPAL */}
      <section className="veiculo-info-section flex flex-col items-center px-4">
        <div className="info-box max-w-6xl w-full bg-white rounded-3xl shadow-xl -mt-20 relative z-10 px-12 md:px-28 py-16 md:py-24 mb-20">
          <div className="info-header flex flex-col items-center mb-16">
            <Link to={`/loja/${vehicle.loja.id}`} className="info-profile-logo w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden -mt-32 md:-mt-44 bg-white mb-6 transition-transform hover:scale-105 flex items-center justify-center">
              {vehicle.loja.logo ? <img src={vehicle.loja.logo} alt={vehicle.loja.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-3xl">{vehicle.loja.nome?.charAt(0)}</div>}
            </Link>
            <h2 className="text-gray-500 font-bold uppercase tracking-widest text-sm">{vehicle.loja.nome || 'Vendedor Particular'}</h2>
          </div>

          <div className="flex flex-col items-center text-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#001f44] mb-3">{vehicle.marca} {vehicle.modelo}</h1>
              <p className="text-xl text-gray-400 font-medium">{vehicle.versao}</p>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Preço de Oferta</p>
              <p className="text-5xl md:text-6xl font-black text-[#1c9be9]">
                <span className="text-3xl mr-1 font-bold">R$</span>{vehicle.preco}
              </p>
            </div>
          </div>

          <hr className="my-12 border-gray-100" />

          {/* 3) GRUPO DE DADOS TÉCNICOS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Calendar size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Ano</span><span className="font-bold text-lg text-gray-800">{vehicle.ano}</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Activity size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Quilometragem</span><span className="font-bold text-lg text-gray-800">{Number(vehicle.km).toLocaleString('pt-BR')} km</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Cpu size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Câmbio</span><span className="font-bold text-lg text-gray-800">{vehicle.transmission || 'Manual'}</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Car size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Carroceria</span><span className="font-bold text-lg text-gray-800">{vehicle.tipo || 'Padrão'}</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Fuel size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Combustível</span><span className="font-bold text-lg text-gray-800">{vehicle.fuel || 'Flex'}</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Palette size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Cor Exterior</span><span className="font-bold text-lg text-gray-800">{vehicle.color || 'Branco'}</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><Hash size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Placa</span><span className="font-bold text-lg text-gray-800">Final {vehicle.licensed ? 'OK' : 'Pendente'}</span></div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 text-[#1c9be9] rounded-2xl shadow-sm"><MapPin size={28} /></div>
              <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Localização</span><span className="font-bold text-lg text-gray-800">{vehicle.cidade || 'São Paulo'}</span></div>
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center">
            <h2 className="text-2xl font-black text-[#001f44] mb-8 flex items-center gap-2">
              <Info className="text-[#1c9be9]" /> Descrição do Anúncio
            </h2>
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 text-gray-600 leading-relaxed border border-gray-100 whitespace-pre-wrap text-lg w-full text-center">
              {vehicle.info || "O vendedor não incluiu uma descrição detalhada."}
            </div>
          </div>

        </div>
      </section>

      {/* 5) CONTATO BAR */}
      <div className="fixed bottom-0 md:left-[220px] w-full md:w-[calc(100%-220px)] bg-transparent z-[16] p-6 flex justify-center gap-4 pointer-events-none">
        <button onClick={() => setModalFinance(true)} className="flex-1 md:max-w-xs bg-[#001f44] hover:bg-black text-white h-14 rounded-full font-bold transition-all shadow-xl flex items-center justify-center gap-2 pointer-events-auto">
          💰 Simular Parcelas
        </button>
        <a href={`https://wa.me/${vehicle.loja.telefone}?text=Olá! Vi o anúncio do ${vehicle.marca} ${vehicle.modelo} no Carbike e gostaria de mais informações.`} target="_blank" rel="noopener noreferrer" className="flex-1 md:max-w-xs bg-[#25D366] hover:bg-[#1db954] text-white h-14 rounded-full font-bold transition-all shadow-xl flex items-center justify-center gap-2 pointer-events-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.623 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp
        </a>
      </div>

      {modalZoom.open && (
        <div className="modal-zoom-overlay fixed inset-0 bg-black/95 z-[100] flex flex-col justify-center items-center p-4">
          <button
            className="absolute top-6 right-6 text-white hover:text-[#1c9be9] transition-colors z-[110]"
            onClick={() => setModalZoom({ open: false, src: '', index: 0 })}
          >
            <X size={48} strokeWidth={3} />
          </button>

          <div className="w-full h-full max-w-6xl max-h-[85vh] relative flex items-center justify-center">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ type: 'fraction' }}
              initialSlide={modalZoom.index}
              spaceBetween={0}
              slidesPerView={1}
              className="zoom-swiper w-full h-full"
            >
              {vehicle.imagens.map((img, idx) => (
                <SwiperSlide key={idx} className="!flex items-center !justify-center bg-transparent">
                  <img
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg pointer-events-none select-none shadow-2xl"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <style>{`
            .zoom-swiper .swiper-slide {
                width: 100% !important;
                margin-right: 0 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
            }
            .zoom-swiper .swiper-button-next,
            .zoom-swiper .swiper-button-prev {
              color: white !important;
              background: rgba(255,255,255,0.1);
              width: 60px;
              height: 60px;
              border-radius: 50%;
              backdrop-filter: blur(4px);
            }
            .zoom-swiper .swiper-button-next:after,
            .zoom-swiper .swiper-button-prev:after {
              font-size: 24px;
              font-weight: bold;
            }
            .zoom-swiper .swiper-pagination-fraction {
              color: white;
              font-size: 18px;
              font-weight: bold;
              bottom: -40px;
            }
          `}</style>
        </div>
      )}

      {modalFinance && (
        <div className="simulation-modal-overlay" onClick={(e) => e.target.className === 'simulation-modal-overlay' && setModalFinance(false)}>
          <div className="simulation-content-box animate-slideUp">
            <button className="close-simulation-btn" onClick={() => setModalFinance(false)}><X size={28} /></button>
            <img src="./img/bancoDaycoval.png" alt="Banco Daycoval" className="h-12 object-contain mx-auto mb-6" />
            <h2 className="text-2xl font-black text-[#001f44] mb-2">Simulação Express</h2>
            <p className="text-gray-500 mb-8">Receba uma pré-aprovação em instantes</p>

            <form className="simulation-form" onSubmit={handleSimulate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col text-left"><label className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">Nome</label><input type="text" className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#1c9be9] outline-none" required /></div>
                <div className="flex flex-col text-left"><label className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">CPF</label><input type="text" className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#1c9be9] outline-none" required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col text-left"><label className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">Entrada (R$)</label><input type="number" className="w-full bg-gray-50 font-bold text-[#1c9be9] border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#1c9be9] outline-none" placeholder="Ex: 20000" onChange={e => setSimFormData({ ...simFormData, entrada: e.target.value })} required /></div>
                <div className="flex flex-col text-left"><label className="text-xs font-bold text-gray-400 mb-1 ml-1 uppercase">Parcelas</label><select className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-[#1c9be9] outline-none" onChange={e => setSimFormData({ ...simFormData, parcelas: e.target.value })} required><option value="60">60x</option><option value="48">48x</option><option value="36">36x</option></select></div>
              </div>
              <button type="submit" className="w-full bg-[#1c9be9] hover:bg-[#157eba] text-white font-black h-16 rounded-xl mt-8 shadow-lg shadow-blue-200 transition-all">{isLoadingSim ? 'Analisando...' : 'Fazer Simulação Agora'}</button>
            </form>

            {simulationResult && (
              <div className="mt-10 pt-10 border-t border-gray-100 animate-fadeIn">
                <div className="bg-blue-50 p-6 rounded-2xl flex justify-between items-center mb-6">
                  <div className="text-left">
                    <p className="text-xs font-bold text-blue-400 uppercase">Parcela Estimada</p>
                    <p className="text-3xl font-black text-[#001f44]">R$ {simulationResult.parcelas.find(p => p.meses == simulationResult.mesSelecionado)?.vl || simulationResult.parcelas[0].vl}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-full font-bold text-[#1c9be9] shadow-sm">{simulationResult.mesSelecionado}x Fixas</div>
                </div>
                <a href={`https://wa.me/${vehicle.loja.telefone}`} className="block w-full bg-[#25D366] text-white font-bold p-5 rounded-xl text-lg hover:brightness-95 transition-all">Enviar para o Vendedor</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VeiculoDetalhes;
