const Ticket = require('../models/ticket');
const User = require('../models/user');

// Crear ticket
const postTicket = async (req, res) => {
  const { description, subject, email, name } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const newTicket = new Ticket({
      userId: user._id,
      description,
      subject,
      email,
      name,
      status: 'Pendiente',
      response: '',
      date: new Date(),
    });

    await newTicket.save();
    res.status(201).json({ message: 'Ticket generado exitosamente', ticket: newTicket });
  } catch (error) {
    console.error('Error al generar el ticket:', error);
    res.status(500).json({ error: 'Error en el servidor al generar el ticket' });
  }
};

// Obtener historial
const fetchHistorialTicket = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El email es obligatorio.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const tickets = await Ticket.find({ userId: user._id }).sort({ date: -1 });
    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el historial de tickets.' });
  }
};

// Obtener todos los tickets
const getallticket = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los tickets.' });
  }
};

// Actualizar estado
const ActualizarEstadoTicket = async (req, res) => {
  const { ticketId, status, adminDescription } = req.body;
  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado.' });

    ticket.status = status;
    ticket.adminDescription = adminDescription || ticket.adminDescription;

    await ticket.save();
    res.json({ message: 'El ticket fue actualizado exitosamente.', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el estado del ticket.' });
  }
};

module.exports = {
  postTicket,
  fetchHistorialTicket,
  getallticket,
  ActualizarEstadoTicket,
};
