const express = require('express');
const router = express.Router();
var Appointment = require('../models/appointment');
var debug = require('debug')('appointments-2:server');
var axios = require('axios');
//const moment = require('moment');
const { getScheduler } = require('../services/schedulerService');
var verifyJWTToken = require('../verifyJWTToken');


// Obtener una cita específica según su ID de cita
router.get('/:id', async function(req, res, next) {
  const appointmentId = req.params.id;

  try {
    await verifyJWTToken.verifyToken(req, res, next);
  } catch (e){
    console.error(e);
    return true;
  }

  try {
    const result = await Appointment.findById(appointmentId);
    if (!result) {
      // Si no se encuentra la cita, enviar un código de estado 404
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.send(result.cleanup());
  } catch(e) {
    debug("DB problem", e);
    res.sendStatus(500);
  }
});

// Obtener todas las citas 
router.get('/', async function(req, res, next) {
  try {
    const result = await Appointment.find();

    result.forEach(appointment => {
      console.log("Fetching appointment with ID:", appointment._id);
    });

    res.send(result.map((a) => a.cleanup()));
  } catch(e) {
    debug("DB problem", e);
    res.sendStatus(500);
  }
});

// Crear cita llamando a scheduler
router.post('/create', async function(req, res, next) {
  const { nameDoctor, lastnameDoctor, idPatient, namePatient, lastnamePatient, date, subject } = req.body;

  try {
    // Obtiene todas las schedulers del servicio Scheduler
    const schedulers = await getScheduler();

    // Comprueba si hay una scheduler que coincida con el nombre del doctor y la fecha
    const isDoctorAvailable = schedulers.some(scheduler => 
      scheduler.name === nameDoctor &&
      scheduler.lastname === lastnameDoctor &&
      new Date(scheduler.date).getTime() === new Date(date).getTime());

    if (!isDoctorAvailable) {
      return res.status(400).json({ error: "Doctor is not available at the specified time" });
    }

    // Verificar si ya existe una cita con la misma información
    const existingAppointment = await Appointment.findOne({
      nameDoctor,
      lastnameDoctor,
      idPatient,
      namePatient,
      lastnamePatient,
      date,
      subject
    });

    if (existingAppointment) {
      debug("Duplicate appointment detected");
      return res.status(409).send({ error: "Duplicate appointment detected" });
    }

    // Crear y guardar la nueva cita
    const newAppointment = new Appointment({
      nameDoctor,
      lastnameDoctor,
      idPatient,
      namePatient,
      lastnamePatient,
      date,
      subject
    });

    await newAppointment.save();
    res.sendStatus(201);
  } catch(e) {
    console.error(e);
    if (e.errors) {
      debug("Validation problem when saving appointment");
      res.status(400).send({ error: e.message });
    } else {
      debug("DB problem", e);
      res.sendStatus(500);
    }
  }
});

// Obtener las citas de un paciente específico por su ID
router.get('/patients/:idPatient', async function(req, res, next) {
  const patientId = req.params.idPatient;

  try {
    const foundAppointments = await Appointment.find({ idPatient: patientId });

    if (foundAppointments.length > 0) {
      res.status(200).json(foundAppointments.map((a) => a.cleanup()));
    } else {
      res.status(404).json({ error: 'Appointments not found for the specified patient' });
    }
  } catch(e) {
    debug("DB problem", e);
    res.sendStatus(500);
  }
});


router.put('/:id', async function(req, res) {
  const appointmentId = req.params.id;
  const { nameDoctor, lastnameDoctor, date } = req.body; 

  try {
    await verifyJWTToken.verifyToken(req, res, next);

    // Obtén las schedulers del servicio Scheduler
    const schedulers = await getScheduler();

    // Comprueba si el doctor está disponible en la fecha dada
    const isDoctorAvailable = schedulers.some(scheduler => 
      scheduler.name === nameDoctor &&
      scheduler.lastname === lastnameDoctor &&
      new Date(scheduler.date).getTime() === new Date(date).getTime());

    if (!isDoctorAvailable) {
      return res.status(400).json({ error: "Doctor is not available at the specified time" });
    }

    // Si el doctor está disponible, procede con la actualización
    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, req.body, { new: true });

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (e) {
    console.error(e);
    if (e.errors) {
      debug("Validation problem when updating appointment");
      res.status(400).send({ error: e.message });
    } else {
      debug("DB problem", e);
      res.sendStatus(500);
    }
  }
});

// Eliminar una cita por fecha y ID del paciente
router.delete('/date/:date/patient/:idPatient', async (req, res) => {
  const appointmentDate = req.params.date;
  const patientId = req.params.idPatient;

  try {
    const result = await Appointment.deleteOne({ date: new Date(appointmentDate), idPatient: patientId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Appointment successfully deleted' });
    } else {
      res.status(404).json({ error: 'Appointment not found for the given date and patient ID' });
    }
  } catch (e) {
    debug("DB problem", e);
    res.sendStatus(500);
  }
});

// Crear nueva cita
router.post('/', async function(req, res, next) {
  const { nameDoctor, lastnameDoctor, idPatient, namePatient, lastnamePatient, date, subject } = req.body;

  try {
    // Verificar si ya existe una cita con la misma información
    const existingAppointment = await Appointment.findOne({
      nameDoctor,
      lastnameDoctor,
      idPatient,
      namePatient,
      lastnamePatient,
      date,
      subject
    });

    if (existingAppointment) {
      // Si ya existe una cita con la misma información, enviar una respuesta con el código de estado 409 (Conflict)
      debug("Duplicate appointment detected");
      return res.status(409).send({ error: "Duplicate appointment detected" });
    }

    // Si no hay citas existentes con la misma información, crear y guardar la nueva cita
    const newAppointment = new Appointment({
      nameDoctor,
      lastnameDoctor,
      idPatient,
      namePatient,
      lastnamePatient,
      date,
      subject
    });

    await newAppointment.save();

    return res.sendStatus(201);
  } catch(e) {
    if (e.errors) {
      // Si hay errores de validación, enviar una respuesta con el código de estado 400 (Bad Request)
      debug("Validation problem when saving appointment");
      return res.status(400).send({ error: e.message });
    } else {
      // Si hay otros errores, como problemas con la base de datos, enviar una respuesta con el código de estado 500 (Internal Server Error)
      debug("DB problem", e);
      return res.sendStatus(500);
    }
  }
});
//Eliminar todas las citas
router.delete('/', async (req, res) => {
  try {
    const result = await Appointment.deleteMany({});

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'All appointments successfully deleted' });
    } else {
      res.status(404).json({ error: 'No appointments found' });
    }
  } catch (e) {
    debug("DB problem", e);
    res.sendStatus(500);
  }
});


module.exports = router;