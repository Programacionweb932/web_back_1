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
    required: true, // Hora en formato HH:MM
  },
  date: {
    type: String,
    required: true, // Fecha como objeto Date
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tipoServicio: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['reservada', 'cancelada', 'completada'],
    default: 'reservada',
  },
});

const Agenda = mongoose.model('Agenda', agendaSchema);
module.exports = Agenda;
