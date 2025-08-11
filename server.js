const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ticketsRoutes = require('./routes/ticketsRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: ['https://elmundodelatecnologiaf.vercel.app'],
  credentials: true,
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', ticketsRoutes);
app.use('/api', agendaRoutes);

// Conexión a Mongo (solo si no está conectada)
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error('❌ MONGO_URI no está definida');
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

module.exports = app; // 👈 Exportamos la app
