require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'carbike_super_secret_chave_privada_aqui';
const BASE_URL = 'http://localhost:3000/uploads/'; // Alterado para local conforme pedido

// Helper para converter hashes do PHP ($2y$) para Formato que o Node aceita com 100% de sucesso ($2a$)
const sanitizePhpHash = (hash) => hash.replace(/^\$2y\$/, "$2a$");

// ==========================================
// AUTENTICAÇÃO
// ==========================================

// Rota de Login (Lojistas e Particulares)
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, mensagem: 'Preencha todos os campos.' });
    }

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

// Login Admin
app.post('/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: true, mensagem: 'Preencha tudo.' });

    const [rows] = await db.execute('SELECT id, password, region FROM Administrador WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: true, mensagem: 'Admin não encontrado.' });

    const admin = rows[0];
    const nodeHash = sanitizePhpHash(admin.password);
    const isMatch = await bcrypt.compare(password, nodeHash);

    if (!isMatch) return res.status(401).json({ error: true, mensagem: 'Credenciais inválidas.' });

    const token = jwt.sign({ idUser: admin.id, region: admin.region, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ error: false, mensagem: 'sucesso', token, admin: { id: admin.id, region: admin.region } });
  } catch (error) {
    return res.status(500).json({ error: true, mensagem: 'Erro admin login.' });
  }
});

// Middleware de Segurança para Administradores
const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: true, mensagem: 'Não autorizado.' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: true, mensagem: 'Acesso restrito.' });
    }
    req.admin = decoded; // { idUser, region, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: true, mensagem: 'Sessão inválida.' });
  }
};

// Cadastro Simples
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: true, mensagem: 'Preencha tudo.' });

    const [existing] = await db.execute('SELECT id FROM Usuario WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: true, mensagem: 'E-mail já existe.' });

    const hash = await bcrypt.hash(password, 10);
    const today = new Date().toISOString().slice(0, 10);
    const [result] = await db.execute(
      'INSERT INTO Usuario (email, name, password, person_type, active, paid, creation_date, file_path_user) VALUES (?, ?, ?, ?, 1, 1, ?, ?)',
      [email, 'Usuário Teste React', hash, 'FISICA', today, 'user_default.png']
    );
    return res.json({ error: false, mensagem: 'Cadastrado!', userId: result.insertId });
  } catch (error) {
    return res.status(500).json({ error: true, mensagem: 'Erro registro.' });
  }
});

// ==========================================
// PAINEL ADMINISTRATIVO (ADMIN)
// ==========================================

// 1. Sumário e Estatísticas
app.get('/admin/summary', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let usersQuery = 'SELECT COUNT(*) as total FROM Usuario WHERE active = 1 AND paid = 1';
    let carsQuery = 'SELECT COUNT(*) as total FROM Carro WHERE active = 1';
    let params = [];

    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      const placeholders = cities.map(() => '?').join(',');
      usersQuery += ` AND city IN (${placeholders})`;
      carsQuery += ` AND responsible IN (SELECT id FROM Usuario WHERE city IN (${placeholders}))`;
      params = [...cities];
    }

    const [uRows] = await db.execute(usersQuery, params);
    const [cRows] = await db.execute(carsQuery, params);

    // Motivos de venda (Global)
    const [vendas] = await db.execute('SELECT id, motivo FROM Venda');

    res.json({
      error: false,
      totalUsers: uRows[0].total,
      totalCars: cRows[0].total,
      vendas: vendas.reduce((acc, curr) => {
        acc[curr.id] = curr.motivo;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: true, mensagem: error.message });
  }
});

// 2. Listagem de Usuários (Lojas/Particulares)
app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let query = 'SELECT * FROM Usuario WHERE paid = 1';
    let params = [];

    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      query += ` AND city IN (${cities.map(() => '?').join(',')})`;
      params = cities;
    }

    const [rows] = await db.execute(query + ' ORDER BY id DESC', params);
    res.json({ error: false, users: rows });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 3. Listagem de Veículos
app.get('/admin/vehicles', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let query = `
      SELECT c.*, u.name as owner_name, u.email as owner_email, u.city as owner_city 
      FROM Carro c 
      JOIN Usuario u ON c.responsible = u.id 
      WHERE c.active IN (1, 2)
    `;
    let params = [];

    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      query += ` AND u.city IN (${cities.map(() => '?').join(',')})`;
      params = cities;
    }

    const [rows] = await db.execute(query + ' ORDER BY c.id DESC', params);
    res.json({ error: false, vehicles: rows });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 4. Solicitações Pendentes (Novos Usuários e Carros)
app.get('/admin/requests', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let userQuery = 'SELECT * FROM Usuario WHERE active = 0 AND paid = 0';
    let carQuery = `
      SELECT c.*, u.name as owner_name, u.city as owner_city 
      FROM Carro c 
      JOIN Usuario u ON c.responsible = u.id 
      WHERE c.active = 0 AND u.active = 1 AND u.paid = 1
    `;
    let params = [];

    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      userQuery += ` AND city IN (${cities.map(() => '?').join(',')})`;
      carQuery += ` AND u.city IN (${cities.map(() => '?').join(',')})`;
      params = cities;
    }

    const [users] = await db.execute(userQuery, params);
    const [cars] = await db.execute(carQuery, params);
    res.json({ error: false, pendingUsers: users, pendingCars: cars });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 5. Ações Operacionais
app.post('/admin/users/:id/approve', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { days = 30 } = req.body;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const finish = new Date();
    finish.setDate(finish.getDate() + parseInt(days));
    const finishDateStr = finish.toISOString().slice(0, 10);

    await db.execute(
      'UPDATE Usuario SET active = 1, paid = 1, start_date = ?, finish_date = ? WHERE id = ?',
      [today, finishDateStr, id]
    );
    res.json({ error: false, mensagem: 'Aprovado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.post('/admin/users/:id/pause', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE Usuario SET active = 0 WHERE id = ?', [id]);
    res.json({ error: false, mensagem: 'Acesso pausado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.post('/admin/users/:id/unpause', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE Usuario SET active = 1 WHERE id = ?', [id]);
    res.json({ error: false, mensagem: 'Acesso reativado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.put('/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
        name, email, phone_number, phone_number2, 
        cep, state, city, district, street, number, complement 
    } = req.body;
    
    await db.execute(
      `UPDATE Usuario SET 
            name = ?, email = ?, phone_number = ?, phone_number2 = ?,
            cep = ?, state = ?, city = ?, district = ?, street = ?, number = ?, complement = ?
       WHERE id = ?`,
      [
        name, email, phone_number, phone_number2,
        cep, state, city, district, street, number, complement,
        id
      ]
    );
    res.json({ error: false, mensagem: 'Dados atualizados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.delete('/admin/users/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Opcional: deletar carros vinculados também? Como o DB está estruturado pode dar restrição de chave (FK constraint), então dependendo removemos só o usuário.
    await db.execute('DELETE FROM Usuario WHERE id = ?', [id]);
    res.json({ error: false, mensagem: 'Parceiro excluído excluída!' });
  } catch (error) {
    // Se der erro por chave estrangeira (FK), vamos apenas inativar
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      await db.execute('UPDATE Usuario SET active = 0, paid = 0 WHERE id = ?', [id]);
      return res.json({ error: false, mensagem: 'O parceiro possuía veículos, então foi apenas desativado.' });
    }
    res.status(500).json({ error: true });
  }
});

app.post('/admin/vehicles/:id/approve', isAdmin, async (req, res) => {
  try {
    await db.execute('UPDATE Carro SET active = 1 WHERE id = ?', [req.params.id]);
    res.json({ error: false, mensagem: 'Veículo ativado!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.post('/admin/vehicles/:id/pause', isAdmin, async (req, res) => {
  try {
    await db.execute('UPDATE Carro SET active = 2 WHERE id = ?', [req.params.id]);
    res.json({ error: false, mensagem: 'Veículo pausado!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.post('/admin/vehicles/:id/unpause', isAdmin, async (req, res) => {
  try {
    await db.execute('UPDATE Carro SET active = 1 WHERE id = ?', [req.params.id]);
    res.json({ error: false, mensagem: 'Veículo reativado!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.delete('/admin/vehicles/:id', isAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM Carro WHERE id = ?', [req.params.id]);
    // Lógica futura: Deletar imagens associadas do servidor de arquivos.
    res.json({ error: false, mensagem: 'Veículo apagado definitivamente.' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.put('/admin/vehicles/:id', isAdmin, async (req, res) => {
  try {
    const { brand, model, year, price, mileage, fuel, color, info } = req.body;
    await db.execute(
      `UPDATE Carro SET 
            brand = ?, model = ?, year = ?, price = ?, 
            mileage = ?, fuel = ?, color = ?, info = ? 
       WHERE id = ?`,
      [brand, model, year, price, mileage, fuel, color, info, req.params.id]
    );
    res.json({ error: false, mensagem: 'Veículo editado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

app.put('/admin/vehicles/:id/highlight', isAdmin, async (req, res) => {
  try {
    const { highlight } = req.body;
    await db.execute('UPDATE Carro SET highlight = ? WHERE id = ?', [highlight, req.params.id]);
    res.json({ error: false });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 6. Simulações de Financiamento
app.get('/admin/simulations', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let query = `
      SELECT f.*, u.name as store_name, c.model as car_name, c.price as car_price
      FROM Financiamento f
      JOIN Carro c ON f.id_carro = c.id
      JOIN Usuario u ON c.responsible = u.id
    `;
    let params = [];
    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      query += ` WHERE u.city IN (${cities.map(() => '?').join(',')})`;
      params = cities;
    }
    const [rows] = await db.execute(query + ' ORDER BY f.id DESC', params);
    res.json({ error: false, simulations: rows });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 7. Destaques por Cidade
app.get('/admin/stats/highlights', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    const cities = region === 'Todas' ? [] : region.split(';').filter(c => c);

    // Pegar cidades que tem carros
    let cityQuery = 'SELECT DISTINCT city FROM Usuario';
    let cityParams = [];
    if (cities.length > 0) {
      cityQuery += ` WHERE city IN (${cities.map(() => '?').join(',')})`;
      cityParams = cities;
    }
    const [cRows] = await db.execute(cityQuery, cityParams);

    let highlights = [];
    for (const row of cRows) {
      const [countRows] = await db.execute(
        'SELECT COUNT(*) as total FROM Carro c JOIN Usuario u ON c.responsible = u.id WHERE c.highlight = 1 AND c.active = 1 AND u.city = ?',
        [row.city]
      );
      highlights.push({ city: row.city, count: countRows[0].total });
    }
    res.json({ error: false, highlights });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 8. Planos Vencidos
app.get('/admin/users/expired', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let query = 'SELECT * FROM Usuario WHERE active = 1 AND (paid = 0 OR finish_date < CURDATE())';
    let params = [];
    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      query += ` AND city IN (${cities.map(() => '?').join(',')})`;
      params = cities;
    }
    const [rows] = await db.execute(query + ' ORDER BY finish_date ASC', params);
    res.json({ error: false, users: rows });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 9. Administradores (Só Super Admin)
app.get('/admin/admins', isAdmin, async (req, res) => {
  if (req.admin.region !== 'Todas') return res.status(403).json({ error: true });
  try {
    const [rows] = await db.execute('SELECT id, email, name, phone_number, region FROM Administrador');
    res.json({ error: false, admins: rows });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// 10. Propagandas
app.get('/admin/ads', isAdmin, async (req, res) => {
  try {
    const { region } = req.admin;
    let query = 'SELECT * FROM Propaganda';
    let params = [];
    if (region !== 'Todas') {
      const cities = region.split(';').filter(c => c);
      query += ` WHERE city IN (${cities.map(() => '?').join(',')})`;
      params = cities;
    }
    const [rows] = await db.execute(query + ' ORDER BY id DESC', params);
    res.json({ error: false, ads: rows });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// ==========================================
// UPLOADS
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'carbike-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ==========================================
// LOJAS
// ==========================================
app.get('/lojas', async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name AS nome, city AS cidade, file_path_user AS logo FROM Usuario WHERE person_type = 'JURIDICA' AND active = 1 ORDER BY name ASC LIMIT 30");
    const lojas = rows.map(l => ({ ...l, logoUrl: l.logo && l.logo !== 'user_default.png' ? BASE_URL + l.logo : null }));
    return res.json({ error: false, lojas });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
});

app.get('/lojas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Dados da Loja
    const [lojaRows] = await db.execute("SELECT id, name AS nome, city AS cidade, file_path_user AS logo FROM Usuario WHERE id = ? AND active = 1", [id]);
    if (lojaRows.length === 0) return res.status(404).json({ error: true, mensagem: 'Loja não encontrada' });

    const loja = {
      ...lojaRows[0],
      logoUrl: lojaRows[0].logo && lojaRows[0].logo !== 'user_default.png' ? BASE_URL + lojaRows[0].logo : null
    };

    // 2. Estoque da Loja
    const [stockRows] = await db.execute(`
      SELECT c.*, c.brand AS marca, c.model AS modelo, c.year AS ano, c.price AS preco, c.mileage AS km, c.sector AS tipo, u.person_type AS tipoVendedor, u.city AS cidade, u.file_path_user AS logoLoja
      FROM Carro c 
      LEFT JOIN Usuario u ON c.responsible = u.id 
      WHERE c.responsible = ? AND c.active = 1 
      ORDER BY c.creation_date DESC
    `, [id]);

    const veiculos = stockRows.map(v => {
      const cover = v.file_path ? v.file_path.split(',')[0] : 'carro_default.png';
      return {
        ...v,
        idLoja: v.responsible,
        logoLoja: v.logoLoja && v.logoLoja !== 'user_default.png' ? BASE_URL + v.logoLoja : null,
        fotoUrl: cover !== 'carro_default.png' ? BASE_URL + cover : null
      };
    });

    return res.json({ error: false, loja, veiculos });
  } catch (error) {
    console.error("Erro /lojas/:id:", error);
    return res.status(500).json({ error: true });
  }
});

// ==========================================
// VEÍCULOS
// ==========================================

// Meus Veículos (Painel)
app.get('/veiculos/meus', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: true });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await db.execute(`
      SELECT c.*, c.brand AS marca, c.model AS modelo, c.version AS versao, c.year AS ano, c.price AS preco, c.mileage AS km, c.sector AS tipo 
      FROM Carro c WHERE c.responsible = ? ORDER BY c.creation_date DESC
    `, [decoded.idUser]);

    const veiculos = rows.map(v => {
      const fotosRaw = v.file_path ? v.file_path.split(',') : [];
      const fotosList = fotosRaw.map(f => f && f !== 'carro_default.png' ? BASE_URL + f : null).filter(Boolean);
      return {
        ...v,
        fotoUrl: fotosList[0] || null, // Apenas a capa para os cards
        fotos: fotosList // Todas as fotos para o editor
      };
    });

    return res.json({ error: false, veiculos });
  } catch (error) {
    console.error("Erro /veiculos/meus:", error);
    return res.status(500).json({ error: true, mensagem: 'Sessão expirada ou erro.' });
  }
});

// Listar Veículos (Home)
app.get('/veiculos', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT c.*, c.brand AS marca, c.model AS modelo, c.version AS versao, c.year AS ano, c.price AS preco, c.mileage AS km, c.sector AS tipo, 
             u.name AS nomeVendedor, u.person_type AS tipoVendedor, u.city AS cidade, u.file_path_user AS logoLoja
      FROM Carro c 
      LEFT JOIN Usuario u ON c.responsible = u.id 
      WHERE c.active = 1 
      ORDER BY c.highlight DESC, c.creation_date DESC 
      LIMIT 50
    `);

    const veiculos = rows.map(v => {
      const cover = v.file_path ? v.file_path.split(',')[0] : 'carro_default.png';
      return {
        ...v,
        idLoja: v.responsible,
        logoLoja: v.logoLoja && v.logoLoja !== 'user_default.png' ? BASE_URL + v.logoLoja : null,
        fotoUrl: cover !== 'carro_default.png' ? BASE_URL + cover : null
      };
    });
    return res.json({ error: false, veiculos });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
});

// Detalhes de um Veículo Único
app.get('/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`
      SELECT c.*, c.brand AS marca, c.model AS modelo, c.version AS versao, c.year AS ano, c.price AS preco, c.mileage AS km, c.sector AS tipo, 
             u.name AS nomeVendedor, u.person_type AS tipoVendedor, u.city AS cidade, u.file_path_user AS logoLoja
      FROM Carro c 
      LEFT JOIN Usuario u ON c.responsible = u.id 
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: true, mensagem: 'Veículo não encontrado' });

    const v = rows[0];
    const fotosRaw = v.file_path ? v.file_path.split(',') : [];
    const fotosList = fotosRaw.map(f => f && f !== 'carro_default.png' ? BASE_URL + f : null).filter(Boolean);
    if (fotosList.length === 0) fotosList.push(BASE_URL + 'carro_default.png');

    const veiculo = {
      ...v,
      imagens: fotosList,
      preco: Number(v.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      km: v.km,
      loja: {
        id: v.responsible,
        nome: v.nomeVendedor,
        logo: v.logoLoja && v.logoLoja !== 'user_default.png' ? BASE_URL + v.logoLoja : null,
        telefone: '5500000000000' // Placeholder até termos coluna de whatsapp
      }
    };

    return res.json({ error: false, veiculo });
  } catch (error) {
    console.error("Erro /veiculos/:id:", error);
    return res.status(500).json({ error: true });
  }
});

// Cadastro de Veículo
app.post('/veiculos', upload.array('fotos', 10), async (req, res) => {
  console.log("POST /veiculos - Iniciando cadastro...");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: true });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { sector, brand, model, version, year, price, mileage, transmission, info } = req.body;

    const priceClean = (typeof price === 'string') ? parseFloat(price.replace(/\./g, '').replace(',', '.')) : price;
    const isActive = decoded.tipoPessoa === 'JURIDICA' ? 1 : 0;
    const currentDate = new Date().toISOString().slice(0, 10);

    // Salva todos os nomes de arquivo separados por vírgula
    let fileNames = [];
    if (req.files && req.files.length > 0) {
      fileNames = req.files.map(f => f.filename);
    }
    const filePathStr = fileNames.length > 0 ? fileNames.join(',') : 'carro_default.png';

    const [result] = await db.execute(
      `INSERT INTO Carro (responsible, sector, brand, model, version, year, mileage, transmission, fuel, color, price, licensed, info, number_images, used, active, highlight, creation_date, file_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Flex', 'Cor Padrão', ?, 1, ?, ?, 1, ?, 0, ?, ?)`,
      [decoded.idUser, sector, brand, model, version, year, mileage, transmission, priceClean, info, fileNames.length, isActive, currentDate, filePathStr]
    );

    console.log("Sucesso no POST! Total Fotos:", fileNames.length);
    return res.json({ error: false, mensagem: 'Veículo cadastrado!', veiculoId: result.insertId });
  } catch (error) {
    console.error("ERRO NO POST /veiculos:", error);
    return res.status(500).json({ error: true, mensagem: 'Erro ao cadastrar.' });
  }
});

// Exclusão de Veículo
app.delete('/veiculos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: true });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [veiculo] = await db.execute('SELECT responsible FROM Carro WHERE id = ?', [id]);
    if (veiculo.length === 0) return res.status(404).json({ error: true });
    if (veiculo[0].responsible !== decoded.idUser && decoded.role !== 'ADMIN') return res.status(403).json({ error: true });

    await db.execute('DELETE FROM Carro WHERE id = ?', [id]);
    return res.json({ error: false, mensagem: 'Excluído!' });
  } catch (error) {
    console.error("ERRO NO DELETE:", error);
    return res.status(500).json({ error: true });
  }
});

// Edição de Veículo (PATCH)
app.patch('/veiculos/:id', upload.array('fotos', 10), async (req, res) => {
  const { id } = req.params;
  console.log(`PATCH /veiculos/${id} - Atualizando...`);
  try {
    const { sector, brand, model, version, year, price, mileage, transmission, info, keepFotos } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: true });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [veiculo] = await db.execute('SELECT responsible, file_path FROM Carro WHERE id = ?', [id]);
    if (veiculo.length === 0) return res.status(404).json({ error: true });
    if (veiculo[0].responsible !== decoded.idUser && decoded.role !== 'ADMIN') return res.status(403).json({ error: true });

    const priceClean = (typeof price === 'string') ? parseFloat(price.replace(/\./g, '').replace(',', '.')) : price;

    // Lógica rica de fotos na Edição
    // 1. Fotos que o usuário manteve (URL -> Filename)
    let finalFotos = [];
    if (keepFotos) {
      const kept = Array.isArray(keepFotos) ? keepFotos : [keepFotos];
      finalFotos = kept.map(url => url.replace(BASE_URL, ''));
    }

    // 2. Novas fotos enviadas
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => finalFotos.push(f.filename));
    }

    const filePathStr = finalFotos.length > 0 ? finalFotos.join(',') : veiculo[0].file_path;

    await db.execute(
      `UPDATE Carro SET sector=?, brand=?, model=?, version=?, year=?, price=?, mileage=?, transmission=?, info=?, file_path=?, number_images=? WHERE id=?`,
      [sector || null, brand, model, version, year, priceClean, mileage, transmission, info, filePathStr, finalFotos.length, id]
    );

    console.log("Sucesso no PATCH! Total Fotos:", finalFotos.length);
    return res.json({ error: false, mensagem: 'Atualizado!' });
  } catch (error) {
    console.error("ERRO NO PATCH:", error);
    return res.status(500).json({ error: true, mensagem: error.message });
  }
});

// Erros Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Erro Multer:", err.message);
    return res.status(400).json({ error: true, mensagem: err.message });
  }
  if (err) {
    console.error("Erro Global:", err.message);
    return res.status(500).json({ error: true, mensagem: err.message });
  }
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
