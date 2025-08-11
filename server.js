const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/authRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

// Middleware para parsear JSON y formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración CORS
const allowedOrigins = [
  'https://elmundodelatecnologiaf.vercel.app', // Producción
  'http://localhost:5173' // Desarrollo local
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true
}));

// Manejo de preflight (OPTIONS) para todas las rutas
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', agendaRoutes);

// Conexión a MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error('❌ MONGO_URI no está definida');
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Exportar para Vercel
module.exports = app;

// Si es local, levantar servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  });
}
