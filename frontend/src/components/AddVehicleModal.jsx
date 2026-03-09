import React, { useState, useRef } from 'react';
import { X, UploadCloud, Car, Info, Camera, CheckCircle, Trash2 } from 'lucide-react';

const AddVehicleModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('basico');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fotos, setFotos] = useState([]); // Preview das fotos selecionadas
  const [fotoError, setFotoError] = useState('');

  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  // Avança para a aba de fotos validando os campos obrigatórios primeiro
  const handleAvancar = () => {
    if (!formRef.current.reportValidity()) return; // Dispara o aviso nativo do HTML5
    setActiveTab('fotos');
  };

  // Trata a seleção de fotos e gera o preview
  const handleFotoChange = (e) => {
    setFotoError('');
    const arquivos = Array.from(e.target.files);
    const previews = arquivos.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setFotos(prev => [...prev, ...previews]);
  };

  // Remove uma foto do preview
  const removerFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Foto é obrigatória
    if (fotos.length === 0) {
      setFotoError('Por favor, selecione ao menos 1 foto do veículo antes de publicar.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData(formRef.current);
    // Remove qualquer arquivo antigo do input e adiciona as fotos do state
    formData.delete('fotos');
    fotos.forEach(f => formData.append('fotos', f.file));

    const token = localStorage.getItem('carbike_token');

    try {
       const response = await fetch('/veiculos', {
          method: 'POST',
          headers: {
             'Authorization': `Bearer ${token}`
          },
          body: formData
       });

       const result = await response.json();

       if (!response.ok || result.error) {
          throw new Error(result.mensagem || 'Falha ao conectar na API.');
       }

       setSuccess(true);
       setTimeout(() => {
          onClose();
          window.location.reload();
       }, 2000);

    } catch (error) {
       console.error(error);
       alert("Erro ao cadastrar: " + error.message);
    } finally {
       setIsLoading(false);
    }
  };

  if (success) {
     return (
        <div className="premium-modal-overlay fadeIn">
           <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-2xl slideUp text-center">
              <CheckCircle size={60} className="text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-[#001f44]">Anúncio Publicado!</h2>
              <p className="text-gray-500 mt-2">O veículo foi enviado com {fotos.length} foto(s) anexada(s).</p>
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
                 <h2>Novo Anúncio</h2>
                 <p>Preencha os detalhes do seu veículo</p>
              </div>
           </div>
           <button onClick={onClose} className="pm-close-btn" title="Fechar aba" disabled={isLoading}>
              <X size={24} />
           </button>
        </div>

        {/* Body */}
        <div className="premium-modal-body">

           {/* Tabs */}
           <div className="pm-tabs">
              <button
                type="button"
                onClick={() => setActiveTab('basico')}
                className={`pm-tab-btn ${activeTab === 'basico' ? 'active' : ''}`}
                disabled={isLoading}
              >
                 <Info size={16} /> Dados Principais
              </button>
              <button
                type="button"
                onClick={() => handleAvancar()}
                className={`pm-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
                disabled={isLoading}
              >
                 <Camera size={16} /> Fotos da Galeria
                 {fotos.length > 0 && (
                   <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">{fotos.length}</span>
                 )}
              </button>
           </div>

           <form id="vehicleFormPremium" ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">

              {activeTab === 'basico' && (
                 <div className="pm-form-grid fadeIn">

                    <div className="pm-form-row col-span-2">
                       <div className="pm-input-group">
                          <label>Tipo de Veículo <span className="req">*</span></label>
                          <select name="sector" required className="pm-input">
                             <option value="">Selecione...</option>
                             <option value="Carro">Carro</option>
                             <option value="Motocicleta">Motocicleta</option>
                             <option value="Caminhao">Caminhão</option>
                          </select>
                       </div>
                       <div className="pm-input-group">
                          <label>Marca <span className="req">*</span></label>
                          <select name="brand" required className="pm-input">
                             <option value="">Selecione...</option>
                             <option value="CHEVROLET">Chevrolet</option>
                             <option value="FIAT">Fiat</option>
                             <option value="VOLKSWAGEN">Volkswagen</option>
                             <option value="HONDA">Honda</option>
                             <option value="TOYOTA">Toyota</option>
                             <option value="JEEP">Jeep</option>
                          </select>
                       </div>
                    </div>

                    <div className="pm-input-group">
                       <label>Modelo do Veículo <span className="req">*</span></label>
                       <input name="model" type="text" placeholder="Ex: Onix LT" required className="pm-input" />
                    </div>

                    <div className="pm-input-group">
                       <label>Versão Completa <span className="req">*</span></label>
                       <input name="version" type="text" placeholder="Ex: 1.0 Flex Manual 5p" required className="pm-input" />
                    </div>

                    <div className="pm-form-row">
                       <div className="pm-input-group">
                          <label>Ano <span className="req">*</span></label>
                          <input name="year" type="text" placeholder="Ex: 2023/2024" required className="pm-input" />
                       </div>
                       <div className="pm-input-group">
                          <label>Preço Sugerido (R$) <span className="req">*</span></label>
                          <input name="price" type="text" placeholder="65.000,00" required className="pm-input pm-input-highlight" />
                       </div>
                    </div>

                    <div className="pm-form-row">
                       <div className="pm-input-group">
                          <label>Quilometragem <span className="req">*</span></label>
                          <input name="mileage" type="number" placeholder="Ex: 15000" required className="pm-input" />
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
                       <label>Descrição e Opcionais <span className="req">*</span></label>
                       <textarea name="info" rows="4" placeholder="Fale da conservação, revisões ou opcionais do veículo..." required className="pm-input pm-textarea"></textarea>
                    </div>

                 </div>
              )}

              {activeTab === 'fotos' && (
                 <div className="pm-upload-area fadeIn">

                    {/* Área de Upload */}
                    <div className="flex flex-col items-center mb-4">
                       <div className="pm-upload-icon">
                          <UploadCloud size={40} />
                       </div>
                       <h3>Envie as fotos originais do veículo</h3>
                       <p className="text-sm text-gray-500 mb-3">A primeira imagem será a capa do anúncio. <span className="text-red-500 font-bold">*Obrigatório</span></p>
                       <label className="pm-btn pm-btn-upload cursor-pointer">
                          {fotos.length > 0 ? `Adicionar mais fotos (${fotos.length} selecionada${fotos.length > 1 ? 's' : ''})` : 'Selecionar do Dispositivo'}
                          <input
                            ref={fileInputRef}
                            name="fotos"
                            type="file"
                            multiple
                            accept="image/*"
                            hidden
                            onChange={handleFotoChange}
                          />
                       </label>
                       {fotoError && (
                         <p className="text-red-500 text-sm font-bold mt-3 text-center">{fotoError}</p>
                       )}
                    </div>

                    {/* Preview das Fotos */}
                    {fotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2 w-full">
                        {fotos.map((foto, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                            <img src={foto.url} alt={foto.name} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-[#001f44] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">CAPA</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removerFoto(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-4 text-center">(Você pode selecionar vários arquivos de até 5MB cada)</p>
                 </div>
              )}

           </form>
        </div>

        {/* Footer */}
        <div className="premium-modal-footer">
           <button onClick={onClose} type="button" className="pm-btn pm-btn-cancelar" disabled={isLoading}>
              Descartar
           </button>

           {activeTab === 'basico' ? (
              <button onClick={handleAvancar} type="button" className="pm-btn pm-btn-avancar" disabled={isLoading}>
                 Avançar para Fotos &nbsp;&rarr;
              </button>
           ) : (
              <button form="vehicleFormPremium" type="submit" className="pm-btn pm-btn-submit flex items-center justify-center min-w-[200px]" disabled={isLoading}>
                 {isLoading ? 'Enviando ao Servidor...' : `Publicar Anúncio ${fotos.length > 0 ? `(${fotos.length} foto${fotos.length > 1 ? 's' : ''})` : ''}`}
              </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default AddVehicleModal;
