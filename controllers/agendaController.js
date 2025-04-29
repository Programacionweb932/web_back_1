const Agenda = require('../models/agenda');
const User = require('../models/user');

// Crear cita
const postAgenda = async (req, res) => {
  const { hora, date, email, name, tipoServicio } = req.body;

  const isValidTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480 && totalMinutes <= 990;
  };

  try {
    if (!isValidTime(hora)) {
      return res.status(400).json({ error: 'La hora debe estar entre 8:00 AM y 4:30 PM' });
    }

    const existingAgenda = await Agenda.findOne({ date, hora });
    if (existingAgenda) {
      return res.status(400).json({ error: 'La hora seleccionada ya está reservada.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

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

    const newAgenda = new Agenda({
      userId: user._id,
      hora,
      date,
      email,
      name,
      tipoServicio,
      status: 'reservada',
    });

    await newAgenda.save();
    res.status(201).json({ message: 'Cita generada exitosamente', agenda: newAgenda });
  } catch (error) {
    console.error('Error al generar la cita:', error);
    res.status(500).json({ error: 'Error en el servidor al generar la cita' });
  }
};

// Horas disponibles
const getHorasDisponibles = async (req, res) => {
  const { date } = req.query;
  try {
    const reservedHours = await Agenda.find({ date }).select('hora');
    const reservedSet = new Set(reservedHours.map(a => a.hora));

    const allHours = [];
    for (let hour = 8; hour < 17; hour++) {
      for (let minute of [0, 20, 40]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (hour === 16 && minute > 30) break;
        if (!reservedSet.has(time)) allHours.push(time);
      }
    }

    res.status(200).json({ availableHours: allHours });
  } catch (error) {
    console.error('Error al obtener las horas disponibles:', error);
    res.status(500).json({ error: 'Error al obtener las horas disponibles' });
  }
};

// Citas del usuario
const fetchMisCitas = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const citas = await Agenda.find({ userId: user._id }).sort({ date: -1 });
    res.status(200).json({ citas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las citas del usuario.' });
  }
};

// Historial de todas las citas
const fetchHistorialCitas = async (req, res) => {
  try {
    const agendas = await Agenda.find();
    res.json({ appointments: agendas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las citas.' });
  }
};

module.exports = {
  postAgenda,
  getHorasDisponibles,
  fetchMisCitas,
  fetchHistorialCitas,
};
