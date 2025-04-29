const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes'); // corregido nombre
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

// Middleware para parsear JSON y formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', agendaRoutes);

// Validar existencia de URI de Mongo
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('❌ Error: MONGO_URI no está definida en el archivo .env');
  process.exit(1);
}

// Conexión a MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
  process.exit(1);
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;
