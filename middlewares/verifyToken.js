// middlewares/verifyToken.js
const jwt = require('jsonwebtoken');
const { verifyCaptcha } = require('./verifyCaptcha');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const captchaToken = req.body.captchaToken;

    if (!token) return res.status(403).json({ msg: 'Token no proporcionado.' });
    if (!captchaToken) return res.status(400).json({ msg: 'Captcha no proporcionado.' });

    // Verificar el token JWT primero
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ msg: 'Token inválido o expirado.' });

      // Validar Captcha después de que el token sea válido
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) return res.status(400).json({ msg: 'Captcha inválido.' });

      req.userId = decoded.userId;
      next();
    });
  } catch (err) {
    console.error('Error en la verificación de token o captcha:', err);
    res.status(500).json({ msg: 'Error interno del servidor' });
  }
};

module.exports = verifyToken;
