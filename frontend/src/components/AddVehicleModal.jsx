import React, { useState, useRef } from 'react';
import { X, UploadCloud, Car, Info, Camera, CheckCircle } from 'lucide-react';

const AddVehicleModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('basico');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(formRef.current);
    const token = localStorage.getItem('carbike_token');

    try {
       const response = await fetch('http://localhost:3000/veiculos', {
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
          window.location.reload(); // Recarrega para ver o novo anúncio na tabela
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
              <p className="text-gray-500 mt-2">O veículo foi enviado para o banco de dados e as fotos foram processadas com sucesso.</p>
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
                onClick={() => setActiveTab('fotos')}
                className={`pm-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
                disabled={isLoading}
              >
                 <Camera size={16} /> Fotos da Galeria
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
                    <div className="pm-upload-icon">
                       <UploadCloud size={40} />
                    </div>
                    <h3>Envie as fotos originais do veículo</h3>
                    <p>A primeira imagem enviada será estabelecida como a Capa do Anúncio.</p>
                    <label className="pm-btn pm-btn-upload cursor-pointer">
                       Selecionar do Dispositivo
                       <input name="fotos" type="file" multiple accept="image/*" hidden />
                    </label>
                    <p className="text-xs text-gray-400 mt-4">(Você pode selecionar vários arquivos de até 5MB)</p>
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
              <button onClick={() => setActiveTab('fotos')} type="button" className="pm-btn pm-btn-avancar" disabled={isLoading}>
                 Avançar para Fotos &nbsp;&rarr;
              </button>
           ) : (
              <button form="vehicleFormPremium" type="submit" className="pm-btn pm-btn-submit flex items-center justify-center min-w-[200px]" disabled={isLoading}>
                 {isLoading ? 'Enviando ao Servidor...' : 'Publicar Anúncio Agora'}
              </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default AddVehicleModal;
