const express = require('express');
const router = express.Router();
const {
  postAgenda,
  getHorasDisponibles,
  fetchMisCitas,
  fetchHistorialCitas
} = require('../controllers/agendaController');
const verifyToken = require('../middlewares/verifyToken');

// Crear cita
router.post('/agenda', postAgenda);

// Ver horas disponibles
router.get('/agenda/hours', getHorasDisponibles);

// Citas del usuario
router.post('/agenda/my-appointments', fetchMisCitas);

// Todas las citas (requiere autenticación)
router.get('/agenda/historial-citas', fetchHistorialCitas);

module.exports = router;
