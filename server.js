// server.js o index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/authRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

// Orígenes permitidos
const allowedOrigins = [
  'https://elmundodelatecnologiaf.vercel.app',
  'http://localhost:5173'
];

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// CORS global antes de todo
app.use(cors(corsOptions));
// Manejo de preflight requests para todos los endpoints
app.options('*', cors(corsOptions));

// Middleware para parsear JSON y formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', agendaRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('✅ Servidor funcionando correctamente');
});

// Conexión MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error('❌ MONGO_URI no está definida en el archivo .env');
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Exportar para Vercel
module.exports = app;

// Servidor local
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
}
