const axios = require('axios');

async function verifyCaptcha(req, res, next) {
  const captchaToken = req.body.captchaToken || req.query.captchaToken;

  if (!captchaToken) {
    return res.status(400).json({ msg: 'Captcha no enviado' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(
      verifyUrl,
      new URLSearchParams({
        secret: secretKey,
        response: captchaToken,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (!response.data.success) {
      return res.status(400).json({ msg: 'Captcha no válido' });
    }

    next();  // Si el CAPTCHA es válido, continúa con el flujo
  } catch (error) {
    console.error('Error al verificar el CAPTCHA:', error.message);
    return res.status(500).json({ msg: 'Error al verificar el CAPTCHA' });
  }
}

module.exports = { verifyCaptcha };
