import React, { useState, useRef } from 'react';
import { X, UploadCloud, Car, Info, Camera, CheckCircle, Trash2, Star, ArrowLeft, ArrowRight } from 'lucide-react';

const AddVehicleModal = ({ onClose, vehicleToEdit = null }) => {
   const isEditing = !!vehicleToEdit;
   const [activeTab, setActiveTab] = useState('basico');
   const [isLoading, setIsLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [fotos, setFotos] = useState([]); // Preview das fotos (Novas e Antigas)
   const [fotoError, setFotoError] = useState('');

   const formRef = useRef(null);
   const fileInputRef = useRef(null);

   const typeMap = { 'Carro': 'carros', 'Motocicleta': 'motos', 'Caminhao': 'caminhoes' };

   // Estados para FIPE
   const [marcas, setMarcas] = useState([]);
   const [modelos, setModelos] = useState([]);
   const [selectedType, setSelectedType] = useState('carros');
   const [selectedBrand, setSelectedBrand] = useState('');
   const [selectedModel, setSelectedModel] = useState('');

   // Busca Marcas da FIPE
   const fetchMarcas = async (type) => {
      try {
         const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${type}/marcas`);
         const data = await res.json();
         setMarcas(data);
      } catch (err) {
         console.error("Erro marcas:", err);
      }
   };

   // Busca Modelos da FIPE
   const fetchModelos = async (type, brandCode) => {
      try {
         const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${type}/marcas/${brandCode}/modelos`);
         const data = await res.json();
         setModelos(data.modelos || []);
      } catch (err) {
         console.error("Erro modelos:", err);
      }
   };

   // Initial load for brands
   React.useEffect(() => {
      fetchMarcas(selectedType);
   }, [selectedType]);

   // Preenche os campos se estiver editando
   React.useEffect(() => {
      if (isEditing && vehicleToEdit && formRef.current) {
         const type = typeMap[vehicleToEdit.sector] || 'carros';
         setSelectedType(type);

         // Carregamos as marcas primeiro
         fetch(`https://parallelum.com.br/fipe/api/v1/${type}/marcas`)
            .then(r => r.json())
            .then(marcasData => {
               setMarcas(marcasData);
               const brandObj = marcasData.find(m => m.nome.toUpperCase() === (vehicleToEdit.brand || '').toUpperCase());
               if (brandObj) {
                  setSelectedBrand(brandObj.codigo);
                  // Carregamos modelos desta marca
                  return fetch(`https://parallelum.com.br/fipe/api/v1/${type}/marcas/${brandObj.codigo}/modelos`);
               }
            })
            .then(r => r ? r.json() : null)
            .then(modelosData => {
               if (modelosData) {
                  setModelos(modelosData.modelos);
                  const modelObj = modelosData.modelos.find(m => m.nome.toUpperCase() === (vehicleToEdit.model || '').toUpperCase());
                  if (modelObj) setSelectedModel(modelObj.nome);
               }
            });

         const fields = ['sector', 'version', 'year', 'price', 'mileage', 'transmission', 'info'];
         fields.forEach(field => {
            if (formRef.current[field]) {
               let value = vehicleToEdit[field];
               if (field === 'price') value = Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
               formRef.current[field].value = value;
            }
         });

         // Se houver fotos já cadastradas, vamos inicializá-las no editor
         const rawPath = (vehicleToEdit.file_path || '');
         const fotosExistentesRaw = rawPath.split(/[;,]/).map(f => f.trim()).filter(f => f !== '' && f !== 'carro_default.png');

         if (fotosExistentesRaw.length > 0) {
            const fotosExistentes = fotosExistentesRaw.map(name => ({
               url: `http://localhost:3000/uploads/veiculo/${encodeURIComponent(name)}`,
               isExisting: true
            }));
            setFotos(fotosExistentes);
         }
      }
   }, [isEditing, vehicleToEdit]);

   const handleAvancar = () => {
      if (!formRef.current.reportValidity()) return;
      setActiveTab('fotos');
   };

   const handleFotoChange = (e) => {
      setFotoError('');
      const arquivos = Array.from(e.target.files);
      const previews = arquivos.map(file => ({
         file,
         url: URL.createObjectURL(file),
         name: file.name,
         isExisting: false
      }));
      setFotos(prev => [...prev, ...previews]);
   };

   const removerFoto = (index) => {
      setFotos(prev => prev.filter((_, i) => i !== index));
   };

   const moverFoto = (index, direcao) => {
      const novaLista = [...fotos];
      const targetIndex = index + direcao;
      if (targetIndex < 0 || targetIndex >= novaLista.length) return;
      [novaLista[index], novaLista[targetIndex]] = [novaLista[targetIndex], novaLista[index]];
      setFotos(novaLista);
   };

   const definirCapa = (index) => {
      const novaLista = [...fotos];
      const [item] = novaLista.splice(index, 1);
      novaLista.unshift(item);
      setFotos(novaLista);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (fotos.length === 0) {
         setFotoError('Por favor, selecione ao menos 1 foto do veículo.');
         return;
      }

      setIsLoading(true);

      const formData = new FormData(formRef.current);
      formData.delete('fotos');

      // Separamos o que é foto nova do que é manter foto antiga
      fotos.forEach(f => {
         if (f.file) {
            formData.append('fotos', f.file);
         } else if (f.isExisting) {
            formData.append('keepFotos', f.url); // Informamos ao backend quais fotos manter
         }
      });

      const token = localStorage.getItem('carbike_token');

      try {
         const baseUrl = 'http://localhost:3000';
         const url = isEditing ? `${baseUrl}/veiculos/${vehicleToEdit.id}` : `${baseUrl}/veiculos`;
         const method = isEditing ? 'PATCH' : 'POST';

         // Como mudamos para selects controlados, precisamos injetar manualmente se não pegou do FormData
         // Na verdade é melhor injetar no formData direto o NOME da marca selecionada
         const brandName = marcas.find(m => m.codigo === selectedBrand)?.nome || '';
         formData.set('brand', brandName);
         formData.set('model', selectedModel);

         const response = await fetch(url, {
            method: method,
            headers: {
               'Authorization': `Bearer ${token}`
               // FormData não precisa de Content-Type manual
            },
            body: formData
         });

         const result = await response.json();
         if (!response.ok || result.error) throw new Error(result.mensagem || 'Erro na API');

         setSuccess(true);
         setTimeout(() => {
            onClose();
            window.location.reload();
         }, 2000);

      } catch (error) {
         console.error(error);
         alert("Erro: " + error.message);
      } finally {
         setIsLoading(false);
      }
   };

   if (success) {
      return (
         <div className="premium-modal-overlay fadeIn">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-2xl slideUp text-center">
               <CheckCircle size={60} className="text-green-500 mb-4" />
               <h2 className="text-2xl font-bold text-[#001f44]">{isEditing ? 'Anúncio Atualizado!' : 'Anúncio Publicado!'}</h2>
            </div>
         </div>
      );
   }

   return (
      <div className="premium-modal-overlay fadeIn">
         <div className="premium-modal-box slideUp">

            {/* Header */}
            <div className="premium-modal-header">
               <div className="pm-header-title">
                  <div className="pm-icon-wrap">
                     <Car size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                     <h2>{isEditing ? 'Editar Anúncio' : 'Novo Anúncio'}</h2>
                     <p>{isEditing ? 'Atualize os detalhes' : 'Comece seu anúncio agora'}</p>
                  </div>
               </div>
               <button onClick={onClose} className="pm-close-btn" disabled={isLoading}>
                  <X size={24} />
               </button>
            </div>

            {/* Body */}
            <div className="premium-modal-body">
               <div className="pm-tabs">
                  <button type="button" onClick={() => setActiveTab('basico')} className={`pm-tab-btn ${activeTab === 'basico' ? 'active' : ''}`}>
                     <Info size={16} /> Dados Principais
                  </button>
                  <button type="button" onClick={handleAvancar} className={`pm-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}>
                     <Camera size={16} /> Fotos ({fotos.length})
                  </button>
               </div>

               <form id="vehicleFormPremium" ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">

                  {/* TAB BÁSICO */}
                  <div className={`pm-form-grid fadeIn ${activeTab !== 'basico' ? 'hidden' : ''}`}>
                     <div className="pm-form-row col-span-2">
                        <div className="pm-input-group">
                           <label>Tipo de Veículo <span className="req">*</span></label>
                           <select
                              name="sector"
                              required
                              className="pm-input"
                              value={Object.keys(typeMap).find(key => typeMap[key] === selectedType) || ''}
                              onChange={(e) => {
                                 setSelectedType(typeMap[e.target.value] || 'carros');
                                 setSelectedBrand('');
                                 setSelectedModel('');
                                 setModelos([]);
                              }}
                           >
                              <option value="">Selecione...</option>
                              <option value="Carro">Carro</option>
                              <option value="Motocicleta">Motocicleta</option>
                              <option value="Caminhao">Caminhão</option>
                           </select>
                        </div>
                        <div className="pm-input-group">
                           <label>Marca <span className="req">*</span></label>
                           <select
                              name="brand_code"
                              required
                              className="pm-input"
                              value={selectedBrand}
                              onChange={(e) => {
                                 setSelectedBrand(e.target.value);
                                 setSelectedModel('');
                                 fetchModelos(selectedType, e.target.value);
                              }}
                           >
                              <option value="">Selecione...</option>
                              {marcas.map(m => (
                                 <option key={m.codigo} value={m.codigo}>{m.nome}</option>
                              ))}
                           </select>
                        </div>
                     </div>
                     <div className="pm-input-group">
                        <label>Modelo <span className="req">*</span></label>
                        <select
                           name="model"
                           required
                           className="pm-input"
                           value={selectedModel}
                           onChange={(e) => setSelectedModel(e.target.value)}
                        >
                           <option value="">Selecione...</option>
                           {modelos.map(m => (
                              <option key={m.codigo} value={m.nome}>{m.nome}</option>
                           ))}
                        </select>
                     </div>
                     <div className="pm-input-group">
                        <label>Versão <span className="req">*</span></label>
                        <input name="version" type="text" required className="pm-input" placeholder="Ex: 1.6 Flex Manual" />
                     </div>
                     <div className="pm-form-row">
                        <div className="pm-input-group">
                           <label>Ano <span className="req">*</span></label>
                           <input name="year" type="text" required className="pm-input" />
                        </div>
                        <div className="pm-input-group">
                           <label>Preço <span className="req">*</span></label>
                           <input name="price" type="text" required className="pm-input pm-input-highlight" />
                        </div>
                     </div>
                     <div className="pm-form-row">
                        <div className="pm-input-group">
                           <label>Quilometragem <span className="req">*</span></label>
                           <input name="mileage" type="number" required className="pm-input" />
                        </div>
                        <div className="pm-input-group">
                           <label>Câmbio <span className="req">*</span></label>
                           <select name="transmission" required className="pm-input">
                              <option value="Automático">Automático</option>
                              <option value="Manual">Manual</option>
                           </select>
                        </div>
                     </div>
                     <div className="pm-input-group col-span-2">
                        <label>Descrição <span className="req">*</span></label>
                        <textarea name="info" rows="3" required className="pm-input pm-textarea"></textarea>
                     </div>
                  </div>

                  {/* TAB FOTOS */}
                  <div className={`pm-upload-area fadeIn ${activeTab !== 'fotos' ? 'hidden' : ''}`}>

                     <div className="flex flex-col items-center mb-6">
                        <div className="pm-upload-icon"><UploadCloud size={40} /></div>
                        <h3>Gerenciar Galeria</h3>
                        <p className="text-sm text-gray-500 mb-4">A primeira imagem será a capa do anúncio</p>
                        <label className="pm-btn pm-btn-upload cursor-pointer">
                           Adicionar Fotos
                           <input ref={fileInputRef} type="file" multiple accept="image/*" hidden onChange={handleFotoChange} />
                        </label>
                        {fotoError && <p className="text-red-500 text-sm font-bold mt-2">{fotoError}</p>}
                     </div>

                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {fotos.map((foto, idx) => (
                           <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-[#1c9be9]' : 'border-gray-100'}`}>
                              <img src={foto.url} className="w-full h-32 object-cover" alt="" />

                              {idx === 0 && (
                                 <div className="absolute top-2 left-2 bg-[#1c9be9] text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Star size={10} fill="white" /> CAPA
                                 </div>
                              )}

                              {/* Barra de Ações Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                 <button type="button" onClick={() => definirCapa(idx)} className="text-white text-xs bg-[#1c9be9] px-3 py-1 rounded-full font-bold hover:scale-105 transition-transform">
                                    Tornar Capa
                                 </button>
                                 <div className="flex gap-2">
                                    <button type="button" onClick={() => moverFoto(idx, -1)} disabled={idx === 0} className="p-1 bg-white/20 text-white rounded-full hover:bg-white/40 disabled:opacity-30">
                                       <ArrowLeft size={16} />
                                    </button>
                                    <button type="button" onClick={() => moverFoto(idx, 1)} disabled={idx === fotos.length - 1} className="p-1 bg-white/20 text-white rounded-full hover:bg-white/40 disabled:opacity-30">
                                       <ArrowRight size={16} />
                                    </button>
                                    <button type="button" onClick={() => removerFoto(idx)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </form>
            </div>

            <div className="premium-modal-footer">
               <button onClick={onClose} type="button" className="pm-btn pm-btn-cancelar" disabled={isLoading}>Descartar</button>
               {activeTab === 'basico' ? (
                  <button onClick={handleAvancar} type="button" className="pm-btn pm-btn-avancar" disabled={isLoading}>Avançar &rarr;</button>
               ) : (
                  <button form="vehicleFormPremium" type="submit" className="pm-btn pm-btn-submit flex items-center justify-center min-w-[200px]" disabled={isLoading}>
                     {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar Dados' : 'Publicar Agora')}
                  </button>
               )}
            </div>
         </div>
      </div>
   );
};

export default AddVehicleModal;
