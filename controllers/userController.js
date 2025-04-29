/*const { ObjectId } = require('mongodb');
const pool = require('../mongo');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const Ticket = require('../models/ticket');
const Admin = require('../models/Admin');
const Agenda = require('../models/agenda');



//                        Ruta de login
const postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.error('Error: Campos vacíos:', { username, password });
      return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });
    }

    console.log('Request received for login:', { username, password });

    // Buscar el usuario por nombre de usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    // Compara las contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'secret',
      { expiresIn: '1h' }
    );

    // Enviar token y datos del usuario en la respuesta
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


const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Obtener el token después de "Bearer"

  if (!token) {
    return res.status(403).json({ msg: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ msg: 'Token inválido o expirado.' });
    }
    req.userId = decoded.userId; // Guardar el userId del token en la solicitud
    next(); // Continuar con la siguiente función
  });
};

//     REGISTRO USUARIO 

const postRegistro = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      return res.status(400).json({ error: 'El nombre de usuario, email y la contraseña son obligatorios' });
  }

  try {
      // Verificamos si el nombre de usuario o el email ya existen
      const userExists = await User.findOne({ $or: [{ username }, { email }] });
      if (userExists) {
          return res.status(400).json({ message: 'El nombre de usuario o el email ya existen' });
      }

      // Hasheamos la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creamos un nuevo usuario con el rol 'user' (por defecto)
      const newUser = new User({
          username,
          email,  // Guardamos el email
          password: hashedPassword,
          role: 'user',  // Asignamos el rol 'user' por defecto
      });

      // Guardamos el nuevo usuario en la colección users
      await newUser.save();

      res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
  }
};
  //            Registro Administrador

  const postRegistroAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ error: 'El nombre de usuario, correo electrónico y contraseña son obligatorios' });
    }

    try {
        // Verificamos si el nombre de usuario o correo ya existe
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res
                .status(400)
                .json({ message: 'El nombre de usuario o correo electrónico ya existe' });
        }

        // Hasheamos la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creamos un nuevo usuario con el rol 'admin'
        const newAdmin = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin', // Asignamos el rol 'admin'
        });

        // Guardamos el nuevo administrador en la colección users
        await newAdmin.save();

        res.status(201).json({ message: 'Administrador registrado exitosamente' });
    } catch (error) {
        console.error('Error al guardar el administrador:', error);
        return res.status(500).json({ error: 'Error en el servidor al guardar el administrador' });
    }
};


  //               Creacion de Ticket usuario
  const postTicket = async (req, res) => {
    const { description, subject, email, name } = req.body;
  
    try {
      // Buscar al usuario en la base de datos por su email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Crear el ticket con el userId extraído del usuario
      const newTicket = new Ticket({
        userId: user._id,  // Asigna el _id del usuario
        description,
        subject,
        email,
        name,
        status: 'Pendiente', // Estado inicial del ticket
        response: '', // Inicialmente sin respuesta
        date: new Date(),
      });
  
      // Guardar el ticket en la base de datos
      await newTicket.save();
  
      res.status(201).json({ message: 'Ticket generado exitosamente', ticket: newTicket });
    } catch (error) {
      console.error('Error al generar el ticket:', error);
      res.status(500).json({ error: 'Error en el servidor al generar el ticket' });
    }
  };
  const getTicketHistory = async (email) => {
    try {
      
     
  // Buscar al usuario por su email para obtener su userId
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
  
      // Obtener todos los tickets asociados al userId
      const tickets = await Ticket.find({ userId: user._id }).sort({ date: -1 }); // Ordenar por fecha descendente
  
      return tickets;
    } catch (error) {
      throw new Error(error.message);
    }
  };


//        Historila de Tickets

  const fetchHistorialTicket = async (req, res) => {
    const { email } = req.body;  // Obtén el email de la solicitud
  
    // Verifica si el email está presente
    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio.' });
    }
  
    try {
   
      const tickets = await getTicketHistory(email); // Obtén los tickets para el usuario
  
      if (tickets && tickets.length > 0) {
        return res.status(200).json({ tickets });  // Devuelve los tickets si los encuentra
      } else {
        return res.status(404).json({ message: 'No se encontraron tickets para este usuario.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el historial de tickets.' });
    }
  };
  
  

//               Creacion de cita usuario
const postAgenda = async (req, res) => {
  const { hora, date, email, name, tipoServicio } = req.body;

  console.log('Datos recibidos en el backend:', { hora, date, email, name, tipoServicio }); 

  // Función para validar que la hora esté entre las 8:00 AM y las 4:30 PM
  const isValidTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    // Rango válido: de 8:00 AM (480 minutos) a 4:30 PM (990 minutos)
    return totalMinutes >= 480 && totalMinutes <= 990;
  };

  try {
    // Verificar si la hora está dentro del rango permitido
    if (!isValidTime(hora)) {
      return res.status(400).json({
        error: 'La hora debe estar entre 8:00 AM y 4:30 PM',
      });
    }

    // Verificar si la cita ya está reservada para esa fecha y hora
    const existingAgenda = await Agenda.findOne({ date, hora });
    if (existingAgenda) {
      return res.status(400).json({
        error: 'La hora seleccionada ya está reservada. Elija otra hora.',
      });
    }

    // Buscar al usuario en la base de datos por su email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que tipoServicio sea válido
    const validServicios = [
      'Mantenimiento Preventivo y Correctivo',
      'Instalación de Sistemas Operativos',
      'Reparación de Portátiles y PC',
      'Asistencia Técnica y Remota',
      'Instalación de Paquetes Microsoft Office',
      'Otro',
    ];

    if (!validServicios.includes(tipoServicio)) {
      return res.status(400).json({ error: 'Tipo de servicio no válido' });
    }

    // Crear la cita con el userId extraído del usuario
    const newAgenda = new Agenda({
      userId: user._id, // Asigna el _id del usuario
      hora,
      date,
      email,
      name,
      tipoServicio,
      status: 'reservada', // Marca la cita como reservada
    });

    // Guardar la cita en la base de datos
    await newAgenda.save();

    res
      .status(201)
      .json({ message: 'Cita generada exitosamente', agenda: newAgenda });
  } catch (error) {
    console.error('Error al generar la cita:', error);
    res.status(500).json({ error: 'Error en el servidor al generar la cita' });
  }
};


const getHorasDisponibles = async (req, res) => {
  const { date } = req.query; // La fecha será enviada como parámetro en la URL

  try {
    // Obtener las horas reservadas para la fecha específica
    const reservedHours = await Agenda.find({ date }).select('hora'); 
    const reservedSet = new Set(reservedHours.map((agenda) => agenda.hora)); // Convertir a un Set para búsqueda rápida

    // Generar todas las horas posibles de 8:00 AM a 4:30 PM en intervalos de 20 minutos
    const allHours = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute of [0, 20, 40]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (hour === 16 && minute > 30) break; // Limitar hasta 4:30 PM
        if (!reservedSet.has(time)) { // Si la hora no está reservada, la agregamos
          allHours.push(time);
        }
      }
    }

    res.status(200).json({ availableHours: allHours });
  } catch (error) {
    console.error('Error al obtener las horas disponibles:', error);
    res.status(500).json({ error: 'Error al obtener las horas disponibles' });
  }
};

//               todos los tickets 


const getallticket = async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Obtener todos los tickets de todos los usuarios

    if (tickets.length > 0) {
      return res.json({ tickets }); // Enviar los tickets en la respuesta
    } else {
      return res.status(404).json({ message: 'No se encontraron tickets en la base de datos.' }); // No hay tickets
    }
  } catch (error) {
    console.error(error); // Imprimir el error en la consola para depuración
    return res.status(500).json({ error: 'Error al obtener los tickets.' }); // Error del servidor
  }
};


//              Actualizar ticket 

const ActualizarEstadoTicket = async (req, res) => {
  const { ticketId, status, adminDescription } = req.body;

  try {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado.' });
    }

    ticket.status = status;
    ticket.adminDescription = adminDescription || ticket.adminDescription; // Actualiza o deja la existente

    await ticket.save();

    return res.json({ message: 'El ticket fue actualizado exitosamente.', ticket });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al actualizar el estado del ticket.' });
  }
};

// Controlador para obtener el historial de citas
const fetchHistorialCitas = async (req, res) => {
  try {
    const agendas = await Agendas.find();

    if (agendas.length > 0) {
      return res.json({ appointments: agendas }); // Cambia la clave a `appointments` para coincidir con el frontend
    } else {
      return res.status(404).json({ message: 'No se encontraron citas en la base de datos.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener las citas.' });
  }
};

module.exports = { fetchHistorialCitas };

// Ruta para que los usuarios vean sus propias citas agendadas
const fetchMisCitas = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener las citas asociadas al usuario logueado
    const citas = await Agenda.find({ userId: user._id }).sort({ date: -1 }); // Ordenar por fecha descendente

    if (citas && citas.length > 0) {
      return res.status(200).json({ citas });
    } else {
      return res.status(404).json({ message: 'No se encontraron citas para este usuario.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener las citas del usuario.' });
  }
};

module.exports = {

  postLogin,
  postRegistro,
  postRegistroAdmin,
  postTicket,
  getHorasDisponibles,
  postAgenda,
  fetchHistorialTicket,
  getTicketHistory,
  verifyToken,
  getallticket,
  ActualizarEstadoTicket,
}*/
