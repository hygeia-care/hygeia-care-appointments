const express = require('express');
const router = express.Router();
var Appointment = require('../models/appointment');
var debug = require('debug')('appointments-2:server');

const axios = require('axios');
const moment = require('moment');


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


// Obtener una cita específica según su ID
router.get('/:id', async function(req, res, next) {
  const appointmentId = req.params.id;

  try {
    const result = await Appointment.findById(appointmentId);
    if (!result) {
      return res.status(404).send("Appointment not found");
    }
    res.send(result.cleanup());
  } catch(e) {
    debug("DB problem", e);
    res.sendStatus(500);
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

// Crear nueva cita
router.post('/', async function(req, res, next) {
  const { nameDoctor, lastnameDoctor, idPatient, namePatient, lastnamePatient, date } = req.body;

  const appointment = new Appointment({
    nameDoctor,
    lastnameDoctor,
    idPatient,
    namePatient,
    lastnamePatient,
    date
  });

  try {
    await appointment.save();

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




// Eliminar una cita por su id
router.delete('/:id', async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const result = await Appointment.deleteOne({ _id: appointmentId });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Appointment successfully deleted' });
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (e) {
    debug("DB problem", e);
    res.sendStatus(500);
  }
});

// Editar una cita según el id de la cita
router.put('/:id', async function(req, res, next) {
  const appointmentId = req.params.id;
  const updateData = req.body;

  try {
    const result = await Appointment.findByIdAndUpdate(appointmentId, updateData, { new: true });

    if (!result) {
      return res.status(404).send("Appointment not found");
    }

    res.send(result.cleanup()); 
  } catch(e) {
    
    if (e.errors) {
      debug("Validation problem when updating appointment");
      return res.status(400).send({ error: e.message });
    } else {
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