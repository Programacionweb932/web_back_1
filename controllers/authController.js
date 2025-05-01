const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Login con email
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Correo no registrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      message: 'Inicio de sesión exitoso',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Registro usuario (revisa solo por correo ya registrado)
const postRegistro = async (req, res) => {
  console.log('Body recibido:', req.body);
  const { username, email, password, phone, city, country } = req.body;

  if (!username || !email || !password || !phone || !city || !country ) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      city,
      country,
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
  }
};

// Registro administrador (igual, verifica solo por correo)
const postRegistroAdmin = async (req, res) => {
  console.log('Body recibido:', req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Administrador registrado exitosamente' });
  } catch (error) {
    console.error('Error al guardar el administrador:', error);
    res.status(500).json({ error: 'Error en el servidor al guardar el administrador' });
  }
};

module.exports = {
  postLogin,
  postRegistro,
  postRegistroAdmin,
};
