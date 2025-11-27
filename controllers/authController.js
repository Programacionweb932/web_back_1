const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin = require('../models/Admin');

// Login
const postLogin = async (req, res) => {
  console.log("Body recibido en login:", req.body);

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
    }

    // Buscar en User o Admin (por username o email)
    let user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) {
      user = await Admin.findOne({ $or: [{ username }, { email: username }] });
    }

    if (!user) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
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

// Registro usuario
const postRegistro = async (req, res) => {
  console.log('Body recibido:', req.body);
  const { username, email, password, phone, city, country } = req.body;

  if (!username || !email || !password || !phone || !city || !country) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    const adminExists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (userExists || adminExists) {
      return res.status(400).json({ message: 'El nombre de usuario o el email ya existen' });
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

// Registro administrador
const postRegistroAdmin = async (req, res) => {
  console.log('Body recibido:', req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });

    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: 'El nombre de usuario o correo electrónico ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
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
