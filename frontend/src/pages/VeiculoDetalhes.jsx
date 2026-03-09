import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { X } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import '../custom.css';

// Mock de Detalhes Completo
const MOCK_VEHICLE_DETAILS = {
  id: 1,
  marca: 'Chevrolet',
  modelo: 'Onix 1.0 MT LT',
  versao: '1.0 MPFI LT 8V FLEX 4P MANUAL',
  ano: '2020 / 2020',
  preco: '62.500,00',
  km: '35000',
  cambio: 'Manual',
  carroceria: 'Hatchback',
  combustivel: 'Flex',
  cor: 'Branco',
  placa: '***-***9',
  local: 'Campinas - SP',
  dataAnuncio: '05/03/2026',
  tipoAnuncio: 'loja',
  descricao: 'Veículo super conservado, único dono, todas as revisões na concessionária. Completo de fábrica: Ar condicionado, Direção Elétrica, Vidros e Travas Elétricas, Central Multimídia MyLink original, Android Auto/Apple CarPlay, Computador de bordo, Câmera e Sensor de Ré. Laudo cautelar 100% aprovado.',
  imagens: ['./img/21.png', './img/22.png', './img/23.png', './img/20.png'],
  loja: {
    id: 15,
    nome: 'Campinas Autos',
    logo: 'https://dummyimage.com/200x200/e0e0e0/555&text=CA',
    telefone: '5511999999999'
  }
};

const VeiculoDetalhes = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [modalFinance, setModalFinance] = useState(false);
  const [modalZoom, setModalZoom] = useState({ open: false, src: '' });
  
  // Estados para Simulação Daycoval
  const [simFormData, setSimFormData] = useState({
      nome: '', cpf: '', nascimento: '', telefone: '', entrada: '', parcelas: ''
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoadingSim, setIsLoadingSim] = useState(false);

  // Calcula parcelas nativo antigo
  const calculaParcelas = (valorEntrada, valorFinanciado, percentualEntrada, stringAno, valorCarro) => {
    // Parser no ano para inteiro
    const anoCarro = parseInt(stringAno.split('/')[0].trim());
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
    }; // Usando por padrão Data25/24 do sistema original
    
    // Matriz Fallback
    const d = dataObj[pArt];
    const format = (v) => parseFloat(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
    
    return [
       { meses: 60, vl: format(d[4] * novoFinanciado) },
       { meses: 48, vl: format(d[3] * novoFinanciado) },
       { meses: 42, vl: format(d[2] * novoFinanciado) },
       { meses: 36, vl: format(d[1] * novoFinanciado) },
       { meses: 24, vl: format(d[0] * novoFinanciado) }
    ];
  };

  const parseCurrencyStr = (curr) => parseFloat(curr.replace(/[^\d\,]/g,'').replace(',','.'));

  const handleSimulate = (e) => {
     e.preventDefault();
     const carValue = parseCurrencyStr(vehicle.preco);
     let entrada = parseFloat(simFormData.entrada);
     const minEntrada = carValue * 0.2;
     
     if(isNaN(entrada) || entrada < minEntrada) {
        alert("O valor de entrada não pode ser menor que 20% do veículo (R$ " + minEntrada.toLocaleString('pt-br',{minimumFractionDigits:2}) + ")");
        entrada = minEntrada;
     }
     
     const loanAmount = carValue - entrada;
     const percentual = (entrada/carValue) * 100;
     const parcelList = calculaParcelas(entrada, loanAmount, percentual, vehicle.ano, carValue);

     setIsLoadingSim(true);
     setSimulationResult(null);
     
     setTimeout(() => {
         setSimulationResult({
             entradaFormatada: entrada.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}),
             financiadoFormatado: loanAmount.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}),
             percentualFormatado: percentual.toFixed(2),
             mesSelecionado: simFormData.parcelas,
             parcelas: parcelList
         });
         setIsLoadingSim(false);
     }, 1000); // Exibir spinner rapido pro feedback do usuario
  };

  useEffect(() => {
    // Simulando fetch pela id da URL
    setVehicle(MOCK_VEHICLE_DETAILS);
    window.scrollTo(0, 0); // Sempre carregar a view no topo
  }, [id]);

  if (!vehicle) return <div className="p-10 text-center">Carregando detalhes...</div>;

  return (
    <div className="veiculo-detalhes-page">
      {/* 1) TOPO : CARROSSEL SWIPER FULL WIDTH */}
      <section className="veiculo-gallery-section bg-[var(--primary-color)] w-full">
         {/* Margin-left compensa a barra estática do layout main-wrapper */}
        <div className="carousel-wrapper">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            className="veiculo-swiper"
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 20 },
              1200: { slidesPerView: 3, spaceBetween: 30 }
            }}
          >
            {vehicle.imagens.map((img, idx) => (
              <SwiperSlide key={idx} className="flex justify-center cursor-zoom-in" onClick={() => setModalZoom({ open: true, src: img })}>
                <img src={img} alt={`Foto ${idx+1}`} className="carousel-img" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 2) BLOCO BRANCO SOBREPOSTO: INFO PRINCIPAL */}
      <section className="veiculo-info-section flex flex-col items-center">
        <div className="info-box">
          
          <div className="info-header flex flex-col items-center justify-center w-full px-4 text-center">
             {/* Logo Loja Elevada Isolada */}
             <Link to={`/loja/${vehicle.loja.id}`} className="info-profile-logo">
                 <img src={vehicle.loja.logo} alt={vehicle.loja.nome} />
             </Link>
          </div>
          
          <div className="info-carro-detalhe">
             {/* Textos: Carro (Esquerda) e Preço (Direita) */}
             <div className="info-carro-texto">
                <h1 className="nomeCarroTitulo">{vehicle.marca} {vehicle.modelo}</h1>
                <p className="versaoCarroTexto text-gray-500">{vehicle.versao}</p>
             </div>
             
             <div className="info-carro-preco">
                <p className="preco-valor">
                  R$ <span className="tracking-tighter">{vehicle.preco}</span>
                </p>
             </div>
          </div>
          
          <hr className="my-8 border-gray-200 w-11/12 mx-auto" />

          {/* 3) GRUPO DE DADOS TÉCNICOS (3 COLUNAS) */}
          <div className="container-dados">
             <div className="grupo-dado">
               <span className="dado-titulo">Ano</span>
               <span className="dado-valor">{vehicle.ano}</span>
             </div>
             <div className="grupo-dado">
               <span className="dado-titulo">Quilometragem</span>
               <span className="dado-valor">{Number(vehicle.km).toLocaleString('pt-BR')} km</span>
             </div>
             <div className="grupo-dado">
               <span className="dado-titulo">Câmbio</span>
               <span className="dado-valor">{vehicle.cambio}</span>
             </div>
             
             <div className="grupo-dado">
               <span className="dado-titulo">Carroceria</span>
               <span className="dado-valor">{vehicle.carroceria}</span>
             </div>
             <div className="grupo-dado">
               <span className="dado-titulo">Combustível</span>
               <span className="dado-valor">{vehicle.combustivel}</span>
             </div>
             <div className="grupo-dado">
               <span className="dado-titulo">Cor</span>
               <span className="dado-valor">{vehicle.cor}</span>
             </div>

             <div className="grupo-dado">
               <span className="dado-titulo">Final da Placa</span>
               <span className="dado-valor">{vehicle.placa}</span>
             </div>
             <div className="grupo-dado">
               <span className="dado-titulo">Cidade</span>
               <span className="dado-valor">{vehicle.local}</span>
             </div>
             <div className="grupo-dado">
               <span className="dado-titulo">Tipo do Anúncio</span>
               <span className="dado-valor uppercase">{vehicle.tipoAnuncio}</span>
             </div>
          </div>

          {/* 4) DESCRIÇÃO LONGA */}
          <div className="sobre-carro flex flex-col w-full px-6 md:px-12 mt-12 mb-24 md:mb-32 text-center md:text-left">
             <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Sobre o Veículo</h2>
             <div className="sobre-texto p-4 md:p-6 bg-gray-50 rounded-xl text-gray-700 text-sm md:text-base leading-relaxed border border-gray-100 h-[200px] overflow-y-auto">
                {vehicle.descricao}
             </div>
          </div>

        </div>
      </section>

      {/* 5) BARRA FLUTUANTE DE CONTATO INFERIOR */}
      <div className="buttons-contact-bar fixed bottom-0 left-0 md:left-[220px] w-full md:w-[calc(100%-220px)] h-[80px] md:h-[100px] bg-white border-t border-gray-200 z-[16] flex justify-center md:justify-around items-center px-4 md:px-10 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] gap-2 md:gap-4 flex-row">
         <button onClick={() => setModalFinance(true)} className="botao-simular w-[48%] md:w-[300px] h-[50px] md:h-[60px] bg-[#085391] hover:bg-[#05325a] text-white rounded-full flex items-center justify-center transition-colors">
            <span className="hidden md:flex bg-white rounded-full p-1 mr-3 w-[35px] h-[35px] items-center justify-center">
               💰
            </span>
            <p className="font-bold text-sm md:text-base">Simular Parcelas</p>
         </button>

         <a href={`https://wa.me/${vehicle.loja.telefone}?text=Olá! Gostaria de mais detalhes sobre o veículo ${vehicle.marca} ${vehicle.modelo} anunciado no Carbike.`} target="_blank" rel="noopener noreferrer" className="botao-whats w-[48%] md:w-[300px] h-[50px] md:h-[60px] bg-[#008000] hover:bg-[#006000] text-white rounded-full flex items-center justify-center transition-colors">
            <img src="./img/icon/whats.svg" alt="WhatsApp" className="w-[20px] md:w-[25px] mr-2" />
            <p className="font-bold text-sm md:text-base">Entre em Contato</p>
         </a>
      </div>

      {/* MODAL ZOOM DE FOTO */}
      {modalZoom.open && (
        <div className="modal-zoom-overlay bg-black/90 fixed w-full h-full top-0 left-0 z-[100] flex justify-center items-center cursor-pointer" onClick={() => setModalZoom({open: false, src: ''})}>
          <button className="absolute top-10 right-10 text-white hover:text-gray-300">
             <X size={40} />
          </button>
          <img src={modalZoom.src} className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl scale-125 transition-transform origin-center duration-300 pointer-events-none" alt="Zoomed" />
        </div>
      )}

      {/* MODAL DAYCOVAL FINANCEIRO REFINADO */}
      {modalFinance && (
         <div className="simulation-modal-overlay" onClick={(e) => {
             if (e.target.className === 'simulation-modal-overlay') setModalFinance(false);
         }}>
            <div className="simulation-content-box pt-10">
              <button className="close-simulation-btn" onClick={() => setModalFinance(false)}>
                <X size={28} />
              </button>
              
              <img src="./img/bancoDaycoval.png" alt="Banco Daycoval" className="bancoSimuladorImg" />
              <h2>Simule com Banco Daycoval</h2>
              
              <form className="simulation-form" onSubmit={handleSimulate}>
                 <div className="simulation-form-group">
                    <label>Nome Completo:</label>
                    <input type="text" value={simFormData.nome} onChange={e=>setSimFormData({...simFormData, nome: e.target.value})} required />
                 </div>
                 
                 <div className="simulation-form-group">
                    <label>CPF:</label>
                    <input type="text" placeholder="000.000.000-00" value={simFormData.cpf} onChange={e=>setSimFormData({...simFormData, cpf: e.target.value})} required />
                 </div>
                 
                 <div className="simulation-form-group">
                    <label>Data de Nascimento:</label>
                    <input type="date" value={simFormData.nascimento} onChange={e=>setSimFormData({...simFormData, nascimento: e.target.value})} required />
                 </div>
                 
                 <div className="simulation-form-group">
                    <label>Telefone:</label>
                    <input type="tel" placeholder="(XX) XXXXX-XXXX" value={simFormData.telefone} onChange={e=>setSimFormData({...simFormData, telefone: e.target.value})} required />
                 </div>
                 
                 <div className="vehicle-simulation-info">
                    <p><strong>Carro:</strong> <span>{vehicle.marca} {vehicle.modelo}</span></p>
                    <p><strong>Valor do Carro:</strong> R$ <span>{vehicle.preco}</span></p>
                    <p><strong>Entrada Mínima:</strong> <span>20%</span></p>
                 </div>
                 
                 <div className="simulation-form-group">
                    <label>Valor de Entrada (R$):</label>
                    <input type="number" min="0" placeholder="Ex: 15000" value={simFormData.entrada} onChange={e=>setSimFormData({...simFormData, entrada: e.target.value})} required />
                 </div>
                 
                 <div className="simulation-form-group">
                    <label>Número de parcelas:</label>
                    <select required value={simFormData.parcelas} onChange={e=>setSimFormData({...simFormData, parcelas: e.target.value})}>
                        <option value="">Selecione...</option>
                        <option value="24">24x</option>
                        <option value="36">36x</option>
                        <option value="42">42x</option>
                        <option value="48">48x</option>
                        <option value="60">60x</option>
                    </select>
                 </div>
                 
                 {!simulationResult && <button type="submit" className="btn-simular-daycoval">{isLoadingSim ? 'Calculando...' : 'Simular'}</button>}
              </form>

              {/* CARD DE RESULTADOS DA SIMULAÇÃO (CARDS ORIGINAIS DAYCOVAL) */}
              {simulationResult && (
                  <div className="simulation-results-display w-full mt-6 flex flex-col items-center animate-fade-in" style={{display: 'block', opacity: 1}}>
                      
                      <div className="simulation-header w-full flex flex-col md:flex-row pb-6">
                          <div className="header-item w-full md:w-1/3 bg-[#4CAF50] text-white p-3 text-center md:rounded-l-lg mb-1 md:mb-0 box-border border-b border-white">
                              <p className="text-xs uppercase">Valor de Entrada</p>
                              <p className="text-lg font-bold">R$ {simulationResult.entradaFormatada}</p>
                          </div>
                          <div className="header-item percentage-box w-full md:w-1/3 bg-[#6699CC] text-white flex items-center justify-center p-3 mb-1 md:mb-0 border-b border-white">
                              <p className="percentage text-xl font-bold">{simulationResult.percentualFormatado}%</p>
                          </div>
                          <div className="header-item released-value w-full md:w-1/3 bg-[#336699] text-white p-3 text-center md:rounded-r-lg border-b border-white">
                              <p className="text-xs uppercase">Valor Financiado</p>
                              <p className="text-lg font-bold">R$ {simulationResult.financiadoFormatado}</p>
                          </div>
                      </div>

                      <p className="define-installments-text font-bold text-gray-700 mt-2 mb-4">Veja as opções de parcelas disponíveis</p>
                      
                      <div className="installment-options w-full">
                           {simulationResult.parcelas.map(p => (
                               <label key={p.meses} className={`installment-card ${String(p.meses) === String(simulationResult.mesSelecionado) ? 'selected' : ''}`}>
                                    <input type="radio" name="plan" value={p.meses} 
                                      checked={String(p.meses) === String(simulationResult.mesSelecionado)} 
                                      onChange={(e) => {
                                          setSimulationResult({...simulationResult, mesSelecionado: e.target.value});
                                          setSimFormData({...simFormData, parcelas: e.target.value});
                                      }} 
                                    />
                                    <div className="card-content">
                                       <p>{p.meses}x de</p>
                                       <p className="price">R$ {p.vl}</p>
                                    </div>
                               </label>
                           ))}
                      </div>

                      <a href={`https://wa.me/${vehicle.loja.telefone}?text=Olá! Fiz uma simulação de financiamento no site para o veículo ${vehicle.marca} ${vehicle.modelo}. Entrada de R$ ${simulationResult.entradaFormatada} e ${simulationResult.mesSelecionado}x de R$ ${simulationResult.parcelas.find(x => String(x.meses) === String(simulationResult.mesSelecionado))?.vl}. Como prossigo?`}  
                         target="_blank" rel="noopener noreferrer" 
                         className="w-full text-center bg-[#25D366] text-white font-bold p-3 rounded-lg hover:bg-[#1ebf58]">
                         Aprovar com Atendentes no WhatsApp
                      </a>
                  </div>
              )}
            </div>
         </div>
      )}

    </div>
  );
};

export default VeiculoDetalhes;
