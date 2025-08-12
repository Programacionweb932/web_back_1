const express = require('express');
const router = express.Router();
const { postLogin, postRegistro, postRegistroAdmin } = require('../controllers/authController');

// Rutas protegidas por verificación de CAPTCHA
router.post('/login', postLogin);  // El middleware se ejecuta antes del controlador
router.post('/register', postRegistro);
router.post('/registeradmin', postRegistroAdmin);

module.exports = router;
