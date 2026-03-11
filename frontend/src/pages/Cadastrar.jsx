import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Building2, Mail, Lock, Phone, MapPin,
  Car, Camera, UploadCloud, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, X, Info, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import './cadastrar.css';

const API_URL = 'http://localhost:3000';

const Cadastrar = () => {
  const navigate = useNavigate();
  const [personType, setPersonType] = useState('FISICA'); // FISICA (Particular) ou JURIDICA (Loja)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    state: '',
    city: '',
    document: '', // CPF ou CNPJ
    whatsapp: '',
    phone: '',
    // Veículo (se Particular)
    vehicleType: 'Carro',
    brand: '',
    model: '',
    version: '',
    year: '',
    km: '0',
    transmission: 'Manual',
    fuel: 'Flex',
    color: 'Branco',
    price: '',
    info: '',
    used: '1',
    licensed: 'nao'
  });

  // FIPE States
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [cities, setCities] = useState([]);
  const [fotos, setFotos] = useState([]); // Para uploads

  const typeMap = { 'Carro': 'carros', 'Motocicleta': 'motos', 'Caminhao': 'caminhoes' };

  // IBGE Cidades
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error("Erro cidades:", err));
  }, []);

  // FIPE Marcas
  useEffect(() => {
    const fipeType = typeMap[formData.vehicleType] || 'carros';
    fetch(`https://parallelum.com.br/fipe/api/v1/${fipeType}/marcas`)
      .then(res => res.json())
      .then(data => setMarcas(data))
      .catch(err => console.error("Erro marcas:", err));
  }, [formData.vehicleType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadBrandModels = async (brandCode) => {
    const fipeType = typeMap[formData.vehicleType] || 'carros';
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${fipeType}/marcas/${brandCode}/modelos`);
      const data = await res.json();
      setModelos(data.modelos || []);
    } catch (err) {
      console.error("Erro modelos:", err);
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          state: data.uf,
          city: data.localidade
        }));
      }
    } catch (err) {
      console.error("Erro CEP:", err);
    }
  };

  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 6) {
      alert("Máximo de 6 fotos permitido.");
      return;
    }
    const newFotos = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setFotos(prev => [...prev, ...newFotos]);
  };

  const removeFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Registro de Usuário
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        personType: personType,
        city: formData.city,
        whatsapp: formData.whatsapp,
        document: formData.document
      });

      if (registerRes.data.error) throw new Error(registerRes.data.mensagem);

      const userId = registerRes.data.userId;

      // 2. Se for Particular, cadastrar o veículo imediatamente (conforme sistema antigo)
      if (personType === 'FISICA' && fotos.length > 0) {
        const vehicleForm = new FormData();
        vehicleForm.append('responsible', userId);
        vehicleForm.append('sector', formData.vehicleType);
        vehicleForm.append('brand', formData.brand);
        vehicleForm.append('model', formData.model);
        vehicleForm.append('version', formData.version);
        vehicleForm.append('year', formData.year);
        vehicleForm.append('mileage', formData.km);
        vehicleForm.append('transmission', formData.transmission);
        vehicleForm.append('price', formData.price);
        vehicleForm.append('info', formData.info);
        vehicleForm.append('used', formData.used);

        fotos.forEach(f => {
          if (f.file) vehicleForm.append('fotos', f.file);
        });

        // Simulamos o cabeçalho de autorização para o novo usuário recém criado
        // No backend real, talvez precise de uma rota pública de "Anúncio Inicial"
        // Para este desafio, assumiremos que o backend aceita ou ajustaremos se der erro.
        // O sistema antigo fazia tudo junto.
        await axios.post(`${API_URL}/veiculos/public`, vehicleForm);
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.mensagem || err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.email || !formData.password || formData.password !== formData.confirmPassword)) {
      setError("Verifique os campos de login.");
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  if (success) {
    return (
      <div className="register-success-page">
        <div className="success-card">
          <CheckCircle2 size={80} className="text-green-500 mb-4 animate-bounce" />
          <h2>Cadastro Realizado!</h2>
          <p>Sua conta foi criada com sucesso. Você será redirecionado para o login em instantes.</p>
          <div className="loader-line"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      {/* Esquerda: Banner / Info */}
      <div className="register-banner">
        <div className="banner-content">
          <img src="./logo.png" alt="Carbike" className="banner-logo" />
          <h1>Venda seu veículo na maior plataforma da região.</h1>
          <p>Milhares de compradores procuram o seu carro ou moto todos os dias aqui.</p>

          <div className="benefits-list">
            <div className="benefit-item">
              <ShieldCheck size={20} />
              <span>Ambiente 100% Seguro</span>
            </div>
            <div className="benefit-item">
              <Car size={20} />
              <span>Anúncios Ilimitados para Lojas</span>
            </div>
            <div className="benefit-item">
              <Phone size={20} />
              <span>Contato Direto via WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direita: Form */}
      <div className="register-form-area">
        <div className="form-wrapper">
          <div className="form-header">
            <Link to="/" className="back-link"><ChevronLeft size={20} /> Voltar</Link>
            <h2>{step === 4 ? 'Quase lá...' : 'Criar Conta'}</h2>
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
              <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
              {personType === 'FISICA' && <div className={`step-dot ${step >= 4 ? 'active' : ''}`}></div>}
            </div>
          </div>

          <form onSubmit={step === (personType === 'FISICA' ? 4 : 3) ? handleSubmit : (e) => e.preventDefault()}>

            {error && <div className="error-alert"><AlertTriangle size={18} /> {error}</div>}

            {/* PASSO 1: Tipo e Login Básico */}
            {step === 1 && (
              <div className="form-step animate-fade-in">
                <p className="section-title">Como você quer anunciar?</p>
                <div className="type-selector">
                  <div
                    className={`type-card ${personType === 'FISICA' ? 'active' : ''}`}
                    onClick={() => setPersonType('FISICA')}
                  >
                    <User size={32} />
                    <span>Sou Particular</span>
                    <small>Vender meu carro agora</small>
                  </div>
                  <div
                    className={`type-card ${personType === 'JURIDICA' ? 'active' : ''}`}
                    onClick={() => setPersonType('JURIDICA')}
                  >
                    <Building2 size={32} />
                    <span>Sou Lojista</span>
                    <small>Vender vários veículos</small>
                  </div>
                </div>

                <div className="input-row mt-6">
                  <div className="input-group">
                    <label>E-mail</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="seu@email.com" />
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Senha</label>
                    <div className="input-with-icon">
                      <Lock size={18} />
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Repetir Senha</label>
                    <div className="input-with-icon">
                      <Lock size={18} />
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <button type="button" onClick={nextStep} className="btn-primary-register mt-4"> Continuar <ChevronRight size={20} /></button>
              </div>
            )}

            {/* PASSO 2: Dados Pessoais e Endereço */}
            {step === 2 && (
              <div className="form-step animate-fade-in">
                <p className="section-title">Dados e Endereço</p>
                <div className="input-row">
                  <div className="input-group col-span-2">
                    <label>Nome Completo / Razão Social</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>{personType === 'FISICA' ? 'CPF' : 'CNPJ'}</label>
                    <input type="text" name="document" value={formData.document} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label>WhatsApp</label>
                    <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>CEP</label>
                    <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} required />
                  </div>
                  <div className="input-group">
                    <label>Cidade</label>
                    <select name="city" value={formData.city} onChange={handleInputChange} required className="select-modern">
                      <option value="">Selecione...</option>
                      {cities.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Rua</label>
                    <input type="text" name="street" value={formData.street} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group" style={{ maxWidth: '100px' }}>
                    <label>Nº</label>
                    <input type="text" name="number" value={formData.number} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={prevStep} className="btn-secondary-register">Voltar</button>
                  <button type="button" onClick={nextStep} className="btn-primary-register">Continuar <ChevronRight size={20} /></button>
                </div>
              </div>
            )}

            {/* PASSO 3: Veículo (Particular) ou Finalização (Loja) */}
            {step === 3 && personType === 'FISICA' && (
              <div className="form-step animate-fade-in">
                <p className="section-title">Detalhes do Veículo</p>
                <div className="input-row">
                  <div className="input-group">
                    <label>Tipo</label>
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="select-modern">
                      <option value="Carro">Carro</option>
                      <option value="Motocicleta">Motocicleta</option>
                      <option value="Caminhao">Caminhão</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Marca</label>
                    <select
                      name="brand"
                      value={formData.brand_code}
                      onChange={(e) => {
                        const code = e.target.value;
                        const name = marcas.find(m => m.codigo === code)?.nome || '';
                        setFormData(prev => ({ ...prev, brand: name, brand_code: code }));
                        loadBrandModels(code);
                      }}
                      className="select-modern"
                    >
                      <option value="">Selecione...</option>
                      {marcas.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Modelo</label>
                    <select name="model" value={formData.model} onChange={handleInputChange} className="select-modern">
                      <option value="">Selecione...</option>
                      {modelos.map(m => <option key={m.codigo} value={m.nome}>{m.nome}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Preço</label>
                    <input type="text" name="price" value={formData.price} onChange={handleInputChange} placeholder="R$ 0,00" />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>Ano</label>
                    <input type="text" name="year" value={formData.year} onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>Km</label>
                    <input type="text" name="km" value={formData.km} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={prevStep} className="btn-secondary-register">Voltar</button>
                  <button type="button" onClick={nextStep} className="btn-primary-register">Continuar <ChevronRight size={20} /></button>
                </div>
              </div>
            )}

            {/* PASSO 3 (Loja): Finalização / Upload Logo */}
            {step === 3 && personType === 'JURIDICA' && (
              <div className="form-step animate-fade-in">
                <p className="section-title">Último Passo!</p>
                <div className="upload-box-register" onClick={() => document.getElementById('photo-input').click()}>
                  <UploadCloud size={40} />
                  <p>Arraste ou clique para enviar a logo da sua loja</p>
                  <input id="photo-input" type="file" hidden onChange={handleFotoChange} />
                </div>

                {fotos.length > 0 && (
                  <div className="photo-previews">
                    {fotos.map((f, i) => (
                      <div key={i} className="photo-item-register">
                        <img src={f.url} alt="" />
                        <button type="button" onClick={() => removeFoto(i)} className="remove-photo"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="info-box-legal mt-4">
                  <Info size={18} />
                  <p>Lojas parceiras passam por uma rápida conferência da nossa equipe antes da ativação do painel.</p>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={prevStep} className="btn-secondary-register">Voltar</button>
                  <button type="submit" className="btn-primary-register" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 4 (Particular): Fotos e Descrição */}
            {step === 4 && personType === 'FISICA' && (
              <div className="form-step animate-fade-in">
                <p className="section-title">Fotos e Descrição</p>
                <div className="upload-box-register" onClick={() => document.getElementById('photo-input').click()}>
                  <Camera size={40} />
                  <p>Adicione até 6 fotos do seu veículo</p>
                  <input id="photo-input" type="file" multiple hidden onChange={handleFotoChange} />
                </div>

                {fotos.length > 0 && (
                  <div className="photo-previews">
                    {fotos.map((f, i) => (
                      <div key={i} className="photo-item-register">
                        <img src={f.url} alt="" />
                        <button type="button" onClick={() => removeFoto(i)} className="remove-photo"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="input-group mt-4">
                  <label>Descrição Adicional (Opcional)</label>
                  <textarea name="info" value={formData.info} onChange={handleInputChange} rows="3" className="textarea-modern"></textarea>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={prevStep} className="btn-secondary-register">Voltar</button>
                  <button type="submit" className="btn-primary-register" disabled={isLoading}>
                    {isLoading ? 'Publicar Anúncio' : 'Publicar Anúncio'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="footer-auth-text">
            Já possui uma conta? <Link to="/login">Acesse agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastrar;
