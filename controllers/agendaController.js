const Agenda = require('../models/agenda');
const User = require('../models/user');
const validator = require('validator');

// Crear cita
const postAgenda = async (req, res) => {
  const { hora, date, email, name, tipoServicio, direccion, observacion } = req.body;

  const isValidTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480 && totalMinutes <= 990;
  };

  try {
    // Validar hora válida
    if (!isValidTime(hora)) {
      return res.status(400).json({ error: 'La hora debe estar entre 8:00 AM y 4:30 PM' });
    }

    // Validar email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }

    // Verificar existencia del usuario por email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Validar tipo de servicio
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

    // Validar que la fecha y hora no sea anterior a ahora
    const fechaHoraCita = new Date(`${date}T${hora}:00`);
    const ahora = new Date();
    if (fechaHoraCita <= ahora) {
      return res.status(400).json({ error: 'No puedes agendar en una fecha y hora pasada.' });
    }

    // Validar que la fecha no sea domingo o festivo (Colombia)
    // Definimos festivos 2025 en Colombia (puedes ampliar según necesites)
    const festivosColombia2025 = [
      '2025-01-01', // Año Nuevo
      '2025-01-06', // Reyes Magos (festivo trasladado)
      '2025-03-24', // Día de San José (trasladado)
      '2025-04-17', // Jueves Santo
      '2025-04-18', // Viernes Santo
      '2025-05-01', // Día del Trabajo
      '2025-06-02', // Corpus Christi (lunes festivo)
      '2025-06-09', // Sagrado Corazón (lunes festivo)
      '2025-07-20', // Día de la Independencia
      '2025-08-07', // Batalla de Boyacá
      '2025-08-18', // Asunción de la Virgen (lunes festivo)
      '2025-10-13', // Día de la Raza (lunes festivo)
      '2025-11-03', // Todos los Santos (lunes festivo)
      '2025-11-17', // Independencia de Cartagena (lunes festivo)
      '2025-12-08', // Inmaculada Concepción
      '2025-12-25', // Navidad
    ];

    const fechaISO = date; // debe venir en formato 'YYYY-MM-DD'

    // Validar domingo
    const diaSemana = fechaHoraCita.getDay(); // 0 = domingo
    if (diaSemana === 0) {
      return res.status(400).json({ error: 'No se pueden agendar citas los domingos.' });
    }

    // Validar festivos
    if (festivosColombia2025.includes(fechaISO)) {
      return res.status(400).json({ error: 'No se pueden agendar citas en días festivos.' });
    }

    // Verificar si ya existe cita en la misma hora y fecha (para cualquier usuario)
    const existingAgenda = await Agenda.findOne({ date, hora });
    if (existingAgenda) {
      return res.status(400).json({ error: 'La hora seleccionada ya está reservada.' });
    }

    const newAgenda = new Agenda({
      userId: user._id,
      hora,
      date,
      email,
      name,
      tipoServicio,
      direccion,
      observacion,
      status: 'reservada',
    });

    await newAgenda.save();
    res.status(201).json({ message: 'Cita generada exitosamente', agenda: newAgenda });
  } catch (error) {
    console.error('Error al generar la cita:', error);
    res.status(500).json({ error: 'Error en el servidor al generar la cita' });
  }
};

// Obtener horas disponibles
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

// Obtener citas de un usuario
const fetchMisCitas = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }

    // Buscar al usuario por su email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar las citas por userId, ordenadas de más recientes a más antiguas
    const citas = await Agenda.find({ userId: user._id })
      .sort({ date: -1, hora: -1 })
      .select('hora date tipoServicio status direccion observacion name email'); // ← Asegura incluir estos campos

    res.status(200).json({ citas });
  } catch (error) {
    console.error('Error al obtener las citas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener las citas del usuario.' });
  }
};

// Cancelar cita
const cancelarCita = async (req, res) => {
  try {
    const { citaId } = req.body;

    const cita = await Agenda.findById(citaId);
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' });

    if (cita.status === 'cancelada') {
      return res.status(400).json({ error: 'La cita ya está cancelada.' });
    }

    cita.status = 'cancelada';
    await cita.save();

    res.status(200).json({ message: 'Cita cancelada exitosamente', cita });
  } catch (error) {
    console.error('Error al cancelar la cita:', error);
    res.status(500).json({ error: 'Error en el servidor al cancelar la cita' });
  }
};

// Obtener historial completo de citas
const fetchHistorialCitas = async (req, res) => {
  try {
    const agendas = await Agenda.find();
    res.json({ appointments: agendas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las citas.' });
  }
};
const getHorasOcupadas = async (req, res) => {
  const { date } = req.query;
  try {
    if (!date) return res.status(400).json({ error: 'La fecha es requerida' });

    // Buscar todas las citas reservadas o activas (no canceladas) para esa fecha
    const citasOcupadas = await Agenda.find({ 
      date, 
      status: { $ne: 'cancelada' } 
    }).select('hora');

    const horasOcupadas = citasOcupadas.map(cita => cita.hora);

    res.status(200).json({ horasOcupadas });
  } catch (error) {
    console.error('Error al obtener horas ocupadas:', error);
    res.status(500).json({ error: 'Error al obtener horas ocupadas' });
  }
};

module.exports = {
  postAgenda,
  getHorasDisponibles,
  fetchMisCitas,
  cancelarCita,
  fetchHistorialCitas,
  getHorasOcupadas
};
