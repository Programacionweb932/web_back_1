const mongoose = require('mongoose');

// Definir el esquema de la agenda
const agendaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo de usuario
    required: true,
  },
  hora: {
    type: String,
    required: true,
    match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // Validación para formato HH:MM (24 horas)
  },
  date: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, // Validación de correo
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tipoServicio: {
    type: String,
    required: true,
    trim: true,
  },
  direccion: {
    type: String,
    required: true,
    trim: true,
  },  
  observacion: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['reservada', 'cancelada', 'completada'],
    default: 'reservada',
  },
});

const Agenda = mongoose.model('Agenda', agendaSchema);
module.exports = Agenda;
