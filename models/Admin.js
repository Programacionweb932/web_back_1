const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    maxlength: [30, 'El nombre de usuario debe tener un máximo de 30 caracteres'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin',
  },
}, { timestamps: true });

module.exports = mongoose.model('Admin', userSchema);
