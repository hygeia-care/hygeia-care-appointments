const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');  // Asegúrate de importar correctamente tu aplicación
const router = require('../routes/appointments.js');  // Asegúrate de importar tu router de citas
const Appointment = require('../models/appointment.js');  // Asegúrate de importar tu modelo de cita

describe("Citas API", () => {

  // Limpiar la base de datos de mongo antes de ejecutar las pruebas
  beforeEach(async () => {
      await Appointment.deleteMany({});
  });

  describe("GET /api/v1/appointments", () => {
    it("Debería retornar todas las citas", async () => {
      // Insertar algunas citas directamente en la base de datos
      await Appointment.create([
        { nameDoctor: 'NombreDoctor1', lastnameDoctor: 'ApellidoDoctor1', idPatient: '123', namePatient: 'NombrePaciente1', lastnamePatient: 'ApellidoPaciente1', date: new Date('2024-01-15T09:00:00.000Z'), subject: 'Asunto1' },
        { nameDoctor: 'NombreDoctor2', lastnameDoctor: 'ApellidoDoctor2', idPatient: '364', namePatient: 'NombrePaciente2', lastnamePatient: 'ApellidoPaciente2', date: new Date('2024-01-16T14:30:00.000Z'), subject: 'Asunto2' },
        // ... otras citas ...
      ]);
  
      // Realizar la solicitud GET a la ruta de citas
      const response = await request(app).get("/api/v1/appointments");
  
      // Asegurarse de que la respuesta sea exitosa y tenga el formato esperado
      expect(response.statusCode).toBe(200);
  
      // Ajustar el número esperado según la cantidad de citas en tu base de datos
      const expectedCitasEnBaseDeDatos = await Appointment.find({});
      expect(response.body).toHaveLength(expectedCitasEnBaseDeDatos.length);
  
      // Puedes realizar otras aserciones según tus necesidades
    });
  });
  
  // Obtener una cita específica según su ID
  describe("GET /api/v1/appointments/:id", () => {
    it("Debería retornar una cita específica por su ID", async () => {
      // Inserta una cita en la base de datos
      const cita = await Appointment.create({
        nameDoctor: 'NombreDoctor1',
        lastnameDoctor: 'ApellidoDoctor1',
        idPatient: '123',
        namePatient: 'NombrePaciente1',
        lastnamePatient: 'ApellidoPaciente1',
        date: new Date('2024-01-15T09:00:00.000Z'),
        subject: 'Asunto1'
      });

      // Realizar la solicitud GET a la ruta de la cita específica
      const response = await request(app).get(`/api/v1/appointments/${cita._id}`);

      // Asegurarse de que la respuesta sea exitosa y tenga el formato esperado
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('nameDoctor', 'NombreDoctor1');
      // Ajustar la expectativa para que coincida con el tipo correcto (string en este caso)
      expect(response.body).toHaveProperty('idPatient', '123');
      // Puedes realizar otras aserciones según tus necesidades
    });
  });
  
  describe("GET /api/v1/appointments/patients/:idPatient", () => {
    it("Debería retornar las citas de un paciente específico por su ID", async () => {
      // Insertar algunas citas directamente en la base de datos asociadas a un paciente específico
      const patientId = "123"; // Reemplaza con el ID de un paciente existente en tu base de datos
      await Appointment.create([
        { nameDoctor: 'NombreDoctor1', lastnameDoctor: 'ApellidoDoctor1', idPatient: patientId,  namePatient: 'NombrePaciente1', lastnamePatient: 'ApellidoPaciente1', date: new Date('2024-01-15T09:00:00.000Z'), subject: 'Asunto1' },
        { nameDoctor: 'NombreDoctor2', lastnameDoctor: 'ApellidoDoctor2', idPatient: patientId, namePatient: 'NombrePaciente2', lastnamePatient: 'ApellidoPaciente2', date: new Date('2024-01-16T14:30:00.000Z'), subject: 'Asunto2' },
        // ... otras citas asociadas al mismo paciente ...
      ]);
  
      // Realizar la solicitud GET a la ruta de citas para el paciente específico
      const response = await request(app).get(`/api/v1/appointments/patients/${patientId}`);
  
      // Asegurarse de que la respuesta sea exitosa y tenga el formato esperado
      expect(response.statusCode).toBe(200);
  
      // Ajustar el número esperado según la cantidad de citas asociadas al paciente en tu base de datos
      const expectedCitasEnBaseDeDatos = await Appointment.find({ idPatient: patientId });
      expect(response.body).toHaveLength(expectedCitasEnBaseDeDatos.length);
  
      // Puedes realizar otras aserciones según tus necesidades
    });
  
    it("Debería retornar un error 404 si el paciente no tiene citas", async () => {
      // Generar un ID de paciente que no tenga citas asociadas
      const nonExistentPatientId = "non_existent_patient_id";
  
      // Realizar la solicitud GET a la ruta de citas para el paciente no existente
      const response = await request(app).get(`/api/v1/appointments/patients/${nonExistentPatientId}`);
  
      // Asegurarse de que la respuesta sea un error 404
      expect(response.statusCode).toBe(404);
  
      // Puedes realizar otras aserciones según tus necesidades
    });
  });
  
  describe("POST /api/v1/appointments", () => {
    it("Debería crear una nueva cita", async () => {
      // Datos de la nueva cita a ser creada
      const newAppointmentData = {
        nameDoctor: 'NombreNuevoDoctor',
        lastnameDoctor: 'ApellidoNuevoDoctor',
        idPatient: '123', // Reemplaza con un ID de paciente existente en tu base de datos
        namePatient: 'NombreNuevoPaciente',
        lastnamePatient: 'ApellidoNuevoPaciente',
        date: new Date('2024-01-17T10:00:00.000Z'),
        subject: 'NuevoAsunto'
      };
  
      // Realizar la solicitud POST a la ruta de citas para crear una nueva cita
      const response = await request(app)
        .post('/api/v1/appointments')
        .send(newAppointmentData);
  
      // Asegurarse de que la respuesta sea exitosa y tenga el formato esperado
      expect(response.statusCode).toBe(201);
  
      // Puedes realizar otras aserciones según tus necesidades
    });
  
    it("Debería retornar un error 409 si se intenta crear una cita duplicada", async () => {
      // Datos de una cita existente en la base de datos
      const existingAppointmentData = {
        nameDoctor: 'NombreDoctorExistente',
        lastnameDoctor: 'ApellidoDoctorExistente',
        idPatient: '123', // Reemplaza con un ID de paciente existente en tu base de datos
        namePatient: 'NombrePacienteExistente',
        lastnamePatient: 'ApellidoPacienteExistente',
        date: new Date('2024-01-18T14:00:00.000Z'),
        subject: 'AsuntoExistente'
      };
  
      // Insertar la cita existente directamente en la base de datos
      await Appointment.create(existingAppointmentData);
  
      // Realizar la solicitud POST intentando crear una cita con la misma información
      const response = await request(app)
        .post('/api/v1/appointments')
        .send(existingAppointmentData);
  
      // Asegurarse de que la respuesta sea un error 409
      expect(response.statusCode).toBe(409);
  
      // Puedes realizar otras aserciones según tus necesidades
    });
  
    it("Debería retornar un error 400 si se envían datos de cita incompletos", async () => {
      // Datos de una cita con información incompleta
      const incompleteAppointmentData = {
        nameDoctor: 'NombreIncompletoDoctor',
        // Faltan otros campos necesarios para crear una cita completa
      };
  
      // Realizar la solicitud POST intentando crear una cita con información incompleta
      const response = await request(app)
        .post('/api/v1/appointments')
        .send(incompleteAppointmentData);
  
      // Asegurarse de que la respuesta sea un error 400
      expect(response.statusCode).toBe(400);
  
      // Puedes realizar otras aserciones según tus necesidades
    });
  
    it("Debería retornar un error 500 si hay un problema con la base de datos", async () => {
      // Mockear una función de mongoose para simular un error en la base de datos
      jest.spyOn(Appointment, 'findOne').mockImplementationOnce(() => {
        throw new Error('Simulated DB error');
      });
  
      // Datos de una cita a ser creada
      const newAppointmentData = {
        nameDoctor: 'NombreNuevoDoctor',
        lastnameDoctor: 'ApellidoNuevoDoctor',
        idPatient: '123', // Reemplaza con un ID de paciente existente en tu base de datos
        namePatient: 'NombreNuevoPaciente',
        lastnamePatient: 'ApellidoNuevoPaciente',
        date: new Date('2024-01-17T10:00:00.000Z'),
        subject: 'NuevoAsunto'
      };
  
      // Realizar la solicitud POST a la ruta de citas para crear una nueva cita
      const response = await request(app)
        .post('/api/v1/appointments')
        .send(newAppointmentData);
  
      // Asegurarse de que la respuesta sea un error 500
      expect(response.statusCode).toBe(500);
  
      // Puedes realizar otras aserciones según tus necesidades
  
      // Restaurar la función de mongoose después de la prueba
      jest.restoreAllMocks();
    });
  });
  
  // Eliminar una cita por fecha y ID del paciente
describe("DELETE /api/v1/appointments/date/:date/patient/:idPatient", () => {
  it("Debería eliminar una cita por fecha y ID del paciente", async () => {
    // Insertar una cita en la base de datos para ser eliminada
    const cita = await Appointment.create({
      nameDoctor: 'NombreDoctorEliminar',
      lastnameDoctor: 'ApellidoDoctorEliminar',
      idPatient: '123', // Reemplaza con un ID de paciente existente en tu base de datos
      namePatient: 'NombrePacienteEliminar',
      lastnamePatient: 'ApellidoPacienteEliminar',
      date: new Date('2024-01-19T18:30:00.000Z'),
      subject: 'AsuntoEliminar'
    });

    // Realizar la solicitud DELETE a la ruta de la cita específica por fecha y ID del paciente
    const response = await request(app).delete(`/api/v1/appointments/date/${cita.date.toISOString()}/patient/${cita.idPatient}`);

    // Asegurarse de que la respuesta sea exitosa y tenga el formato esperado
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Appointment successfully deleted');

    // Verificar que la cita ha sido eliminada de la base de datos
    const citaEnBaseDeDatos = await Appointment.findById(cita._id);
    expect(citaEnBaseDeDatos).toBeNull();

    // Puedes realizar otras aserciones según tus necesidades
  });

  it("Debería retornar un error 404 si intenta eliminar una cita que no existe", async () => {
    // Generar un ID no existente
    const idNoExistente = new mongoose.Types.ObjectId();
  
    // Realizar la solicitud DELETE a la ruta de una cita inexistente
    const response = await request(app).delete(`/api/v1/appointments/date/${new Date().toISOString()}/patient/${idNoExistente}`);
  
    // Asegurarse de que la respuesta sea un error 404
    expect(response.statusCode).toBe(404);
    // Puedes realizar otras aserciones según tus necesidades
  });

  it("Debería retornar un error 500 si hay un problema con la base de datos al eliminar", async () => {
    // Mockear una función de mongoose para simular un error en la base de datos
    jest.spyOn(Appointment, 'deleteOne').mockImplementationOnce(() => {
      throw new Error('Simulated DB error');
    });

    // Insertar una cita en la base de datos para intentar eliminarla
    const cita = await Appointment.create({
      nameDoctor: 'NombreDoctorEliminar',
      lastnameDoctor: 'ApellidoDoctorEliminar',
      idPatient: '123', // Reemplaza con un ID de paciente existente en tu base de datos
      namePatient: 'NombrePacienteEliminar',
      lastnamePatient: 'ApellidoPacienteEliminar',
      date: new Date('2024-01-19T18:30:00.000Z'),
      subject: 'AsuntoEliminar'
    });

    // Realizar la solicitud DELETE a la ruta de la cita específica por fecha y ID del paciente
    const response = await request(app).delete(`/api/v1/appointments/date/${cita.date.toISOString()}/patient/${cita.idPatient}`);

    // Asegurarse de que la respuesta sea un error 500
    expect(response.statusCode).toBe(500);

    // Puedes realizar otras aserciones según tus necesidades

    // Restaurar la función de mongoose después de la prueba
    jest.restoreAllMocks();
  });
});

  // Eliminar todas las citas
  describe("DELETE /api/v1/appointments/", () => {
    it("Debería eliminar todas las citas", async () => {
      // Insertar algunas citas directamente en la base de datos
      await Appointment.create([
        { nameDoctor: 'NombreDoctor1', lastnameDoctor: 'ApellidoDoctor1', idPatient: 123,  namePatient: 'NombrePaciente1', lastnamePatient: 'ApellidoPaciente1', date: new Date('2024-01-15T09:00:00.000Z'), subject: 'Asunto1' },
        { nameDoctor: 'NombreDoctor2', lastnameDoctor: 'ApellidoDoctor2', idPatient: 364, namePatient: 'NombrePaciente2', lastnamePatient: 'ApellidoPaciente2', date: new Date('2024-01-16T14:30:00.000Z'), subject: 'Asunto2' },
        // ... otras citas ...
      ]);

      // Realizar la solicitud DELETE a la ruta de citas
      const response = await request(app).delete("/api/v1/appointments");

      // Asegurarse de que la respuesta sea exitosa y tenga el formato esperado
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'All appointments successfully deleted');
      // Puedes realizar otras aserciones según tus necesidades
    });
  });

  

});
