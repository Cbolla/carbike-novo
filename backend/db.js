require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuração com base no arquivo bd_hostinger.php legado
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u974737129_carbike',
  password: process.env.DB_PASSWORD || 'Psw141611@@',
  database: process.env.DB_NAME || 'u974737129_carbike',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Conexão com o Banco de Dados MySQL estabelecida com sucesso!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erro crítico ao conectar no MySQL:', err.message);
    console.error('DICA: Se o banco estiver na Hostinger, o Remote MySQL bloqueia conexões de fora. Use o IP da Hostinger em DB_HOST e libere seu IP no cPanel.');
  });

module.exports = pool;
