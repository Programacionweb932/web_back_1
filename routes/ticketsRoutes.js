const express = require('express');
const router = express.Router();
const {
  postTicket,
  fetchHistorialTicket,
  getallticket,
  ActualizarEstadoTicket
} = require('../controllers/ticketsController');
const verifyToken = require('../middlewares/verifyToken');

// Crear ticket
router.post('/ticket', postTicket);

// Historial de tickets por email
router.post('/tickets/history', fetchHistorialTicket);

// Todos los tickets (requiere autenticación)
router.get('/tickets/all', verifyToken, getallticket);

// Actualizar estado del ticket (requiere autenticación)
router.put('/tickets/update-status', verifyToken, ActualizarEstadoTicket);

module.exports = router;
