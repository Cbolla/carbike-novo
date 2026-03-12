// Configuração de API para fácil mudança entre Local e Produção
// Para Local: 'http://localhost:3000'
// Para Hostinger: 'https://api.seudominio.com.br' (ou o endereço que você configurar)

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://backend.carbike.com.br'; 

export default API_URL;
