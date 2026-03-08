const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db.pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Rota basica de teste
app.get('/', (req, res) => {
    res.json({ message: 'API do Carbike (React Version) Online!' });
});

// Inicializando o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
