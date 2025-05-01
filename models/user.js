const mongoose = require('mongoose');

// Esquema para los usuarios
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,  
    },
    email: {
        type: String,
        required: true,
        unique: true,  
        lowercase: true,  
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],  
        default: 'user',  
    },
    phone: { 
        type: String, 
        required: true 
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
}, {
});

// Crear el modelo de User
const User = mongoose.model('User', userSchema);

module.exports = User;