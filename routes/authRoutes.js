const express = require('express');
const router = express.Router();
const { postLogin, postRegistro, postRegistroAdmin } = require('../controllers/authController');

router.post('/login', postLogin);
router.post('/register', postRegistro);
router.post('/adminregister', postRegistroAdmin);

module.exports = router;
