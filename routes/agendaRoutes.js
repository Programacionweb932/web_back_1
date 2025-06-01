const express = require('express');
const router = express.Router();
const {
  postAgenda,
  getHorasDisponibles,
  fetchMisCitas,
  cancelarCita,
  fetchHistorialCitas,
  getHorasOcupadas
} = require('../controllers/agendaController');
const verifyToken = require('../middlewares/verifyToken');
const verifyCaptcha = require('../middlewares/verifyCaptcha');


// Crear cita
router.post('/agenda', postAgenda);

// Ver horas disponibles
router.get('/agenda/hours', getHorasDisponibles);

// Citas del usuario
router.post('/agenda/my-appointments', fetchMisCitas);

// Todas las citas (requiere autenticación)
router.get('/agenda/historial-citas', fetchHistorialCitas);

router.post('/agenda/cancel', cancelarCita);

// Obtener horas ocupadas
router.get('/agenda/occupied-hours', getHorasOcupadas);

module.exports = router;
