const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();


const allowedOrigins = [
  'https://elmundodelatecnologiaf.vercel.app', // Producción
  'http://localhost:5173' // Local
];

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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions), (req, res) => res.sendStatus(200));


// Middleware para parsear JSON y formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', agendaRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Kevin el servidor esta corriendo');
});

// Conexión MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) throw new Error('❌ MONGO_URI no está definida');

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
