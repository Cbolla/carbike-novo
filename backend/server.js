require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'carbike_super_secret_chave_privada_aqui';

// Helper para converter hashes do PHP ($2y$) para Formato que o Node aceita com 100% de sucesso ($2a$)
const sanitizePhpHash = (hash) => hash.replace(/^\$2y\$/, "$2a$");

// Rota de Login (Lojistas e Particulares)
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, mensagem: 'Preencha todos os campos.' });
    }

    // Buscamos exatamente como no PHP loginBD.php
    const [rows] = await db.execute(
      'SELECT id, password, person_type, city FROM Usuario WHERE email = ? AND active = 1 AND paid = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: true, mensagem: 'E-mail ou Senha incorretos. (Ou conta inativa)' });
    }

    const user = rows[0];
    const nodeHash = sanitizePhpHash(user.password);
    const isMatch = await bcrypt.compare(password, nodeHash);

    if (!isMatch) {
      return res.status(401).json({ error: true, mensagem: 'E-mail ou Senha incorretos.' });
    }

    // Gerar Token JWT de sessão
    const token = jwt.sign(
      { idUser: user.id, tipoPessoa: user.person_type, city: user.city, role: 'USER' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({ error: false, mensagem: 'sucesso', token, user: { id: user.id, type: user.person_type, city: user.city } });
  } catch (error) {
    console.error("Erro na rota /auth/login:", error);
    return res.status(500).json({ error: true, mensagem: 'Erro interno no servidor de autenticação.' });
  }
});

// Rota de Login Administrador
app.post('/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, mensagem: 'Preencha todos os campos.' });
    }

    const [rows] = await db.execute(
      'SELECT id, password, region FROM Administrador WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: true, mensagem: 'Admin não encontrado.' });
    }

    const admin = rows[0];
    const nodeHash = sanitizePhpHash(admin.password);
    const isMatch = await bcrypt.compare(password, nodeHash);

    if (!isMatch) {
      return res.status(401).json({ error: true, mensagem: 'Credenciais de Administrador inválidas.' });
    }

    const token = jwt.sign(
      { idUser: admin.id, region: admin.region, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({ error: false, mensagem: 'sucesso', token, admin: { id: admin.id, region: admin.region } });
  } catch (error) {
    console.error("Erro na rota /auth/admin/login:", error);
    return res.status(500).json({ error: true, mensagem: 'Erro interno no servidor administrativo.' });
  }
});

// Route for simple user registration
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, mensagem: 'Preencha todos os campos.' });
    }

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM Usuario WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: true, mensagem: 'E-mail já está em uso.' });
    }

    // Hash the password with 10 salt rounds (so it matches the bcrypt default cost used previously if compatible, or standard node)
    // IMPORTANT: It needs to be recognizable by PHP or by Node login endpoint
    const hash = await bcrypt.hash(password, 10);
    
    // We insert as 'FISICA' and active = 1, paid = 1 just for testing so they can login directly
    const sql = `
      INSERT INTO Usuario (email, name, password, person_type, active, paid, creation_date, file_path_user) 
      VALUES (?, 'Usuário Teste React', ?, 'FISICA', 1, 1, ?, 'user_default.png')
    `;
    const today = new Date().toISOString().slice(0, 10);

    const [result] = await db.execute(sql, [email, hash, today]);

    return res.json({ error: false, mensagem: 'Cadastro realizado com sucesso!', userId: result.insertId });

  } catch (error) {
    console.error("Erro na rota /auth/register:", error);
    return res.status(500).json({ error: true, mensagem: 'Erro interno ao realizar cadastro.' });
  }
});

// ==========================================
// CONFIGURAÇÃO MULTER PARA UPLOAD DE IMAGENS
// ==========================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir)); // Expõe as imagens para o publico (URL/uploads/imagem.jpg)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'carbike-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// ==========================================
// CADASTRO DE VEÍCULOS
// ==========================================
app.post('/veiculos', upload.array('fotos', 10), async (req, res) => {
  try {
     // Apenas para simplificar a Validação, vamos ler o Header JWT pra ver quem está enviando
     const authHeader = req.headers.authorization;
     if (!authHeader) return res.status(401).json({ error: true, mensagem: 'Não autorizado.' });
     const token = authHeader.split(' ')[1];
     let decoded;
     try { decoded = jwt.verify(token, JWT_SECRET); } catch (e) { return res.status(401).json({ error: true, mensagem: 'Sessão expirada.' }); }

     const responsibleId = decoded.idUser;
     const typeUser = decoded.tipoPessoa;
     
     // Recupera os dados vindo do FormData do Frontend
     const { sector, brand, model, version, year, price, mileage, transmission, info } = req.body;
     
     // Converte para Float o Preço R$ 62.500,00 -> 62500.00
     const priceClean = price ? parseFloat(price.replace(/\./g, '').replace(',', '.')) : 0;
     
     // Regra Base: Loja = Ativo direto, Particular = Pendente de aprovação
     const isActive = typeUser === 'JURIDICA' ? 1 : 0;
     const currentDate = new Date().toISOString().slice(0, 10);
     
     // Trata Arquivos de Imagem
     let filePathStr = 'carro_default.png'; // Fallback Padrão
     const fileUrlList = [];
     
     if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
           // O PHP antigo parecia salvar no banco concatenado ou em tabelas separadas. 
           // Baseado no Inserts do banco: file_path tem 1 único texto mestre ou a capa (e.g. "carro_123.jpg")
           fileUrlList.push(file.filename); 
        });
        filePathStr = fileUrlList[0]; // Capa Oficial
     }

     const sql = `
       INSERT INTO Carro (
          responsible, sector, brand, model, version, year, 
          mileage, transmission, fuel, color, price, licensed, 
          info, number_images, used, active, highlight, creation_date, file_path
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Flex', 'Cor Padrão', ?, 1, ?, ?, 1, ?, 0, ?, ?)
     `;
     
     let params = [
        responsibleId, sector, brand, model, version, year, 
        mileage, transmission, priceClean, info, fileUrlList.length, 
        isActive, currentDate, filePathStr
     ];
     // Trata qualquer undefined vindo do form
     params = params.map(p => p === undefined ? null : p);

     const [result] = await db.execute(sql, params);

     return res.json({ 
         error: false, 
         mensagem: 'Veículo cadastrado com sucesso!', 
         veiculoId: result.insertId,
         status: isActive === 1 ? 'Publicado' : 'Pendente' 
     });

  } catch (error) {
     console.error("Erro na rota /veiculos:", error);
     return res.status(500).json({ error: true, mensagem: 'Falha ao gravar veículo no Banco de Dados.' });
  }
});

// Middleware Global de Tratamento de Erros para capturar limites Excedidos e falhas Multer (Evita retorno HTML)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
       return res.status(400).json({ error: true, mensagem: 'Uma ou mais imagens excederam o limite máximo de 20MB.' });
    }
    return res.status(400).json({ error: true, mensagem: `Erro de Upload: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ error: true, mensagem: `Erro Interno: ${err.message}` });
  }
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Carbike (Node.js) inicializada com sucesso na porta ${PORT}!`);
  console.log(`   Esperando conexões no MySQL para validar senhas...`);
});
