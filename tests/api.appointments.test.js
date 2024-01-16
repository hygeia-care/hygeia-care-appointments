const app = require('../app');
const request = require('supertest');
const Appointment = require('../models/appointment');

describe("Appointment API", () => {

    describe("GET /appointments", () => {

        const appointments = [
            new Appointment({
                nameDoctor: 'Doctor1',
                lastnameDoctor: 'ApellidoDoctor1',
                idPatient: '123',
                namePatient: 'Paciente1',
                lastnamePatient: 'ApellidoPaciente1',
                date: new Date('2024-01-15T09:00:00.000Z'),
                subject: 'Asunto1'
            }),
            new Appointment({
                nameDoctor: 'Doctor2',
                lastnameDoctor: 'ApellidoDoctor2',
                idPatient: '456',
                namePatient: 'Paciente2',
                lastnamePatient: 'ApellidoPaciente2',
                date: new Date('2024-01-16T14:30:00.000Z'),
                subject: 'Asunto2'
            }),
            // Agrega más citas según sea necesario
        ];

        var dbFind;

        beforeEach(() => {
            dbFind = jest.spyOn(Appointment, "find");
        });

        it("Should return all appointments", () => {
            dbFind.mockImplementation(async () => Promise.resolve(appointments));

            return request(app).get("/api/v1/appointments").then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveLength(appointments.length);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem when retrieving all appointments", () => {
            dbFind.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).get("/api/v1/appointments").then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe("POST /appointments", () => {

        const appointment = new Appointment({
            nameDoctor: 'DoctorNuevo',
            lastnameDoctor: 'ApellidoNuevoDoctor',
            idPatient: '123',
            namePatient: 'PacienteNuevo',
            lastnamePatient: 'ApellidoNuevoPaciente',
            date: new Date('2024-01-17T10:00:00.000Z'),
            subject: 'NuevoAsunto'
        });

        var dbSave;

        beforeEach(() => {
            dbSave = jest.spyOn(Appointment.prototype, "save");
        });

        it("Should add a new appointment if everything is fine", () => {
            dbSave.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api/v1/appointments").send(appointment).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection", () => {
            dbSave.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).post("/api/v1/appointments").send(appointment).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
    });

    describe("DELETE /appointments/date/:date/patient/:idPatient", () => {
        const appointment = new Appointment({ 
            nameDoctor: 'DoctorEliminar',
            lastnameDoctor: 'ApellidoDoctorEliminar',
            idPatient: '123',
            namePatient: 'PacienteEliminar',
            lastnamePatient: 'ApellidoPacienteEliminar',
            date: new Date('2024-01-19T18:30:00.000Z'),
            subject: 'AsuntoEliminar'
        });
    
        var dbDeleteOne;
    
        beforeEach(() => {
            dbDeleteOne = jest.spyOn(Appointment, "deleteOne");
        });
    
        it("Should delete appointment given date and patient ID", () => {
            dbDeleteOne.mockImplementation(async () => Promise.resolve({ deletedCount: 1 }));
    
            return request(app).delete(`/api/v1/appointments/date/${appointment.date.toISOString()}/patient/${appointment.idPatient}`).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.message).toEqual("Appointment successfully deleted");
                expect(dbDeleteOne).toBeCalled();
            });
        });
    
        it("Should return 404 if the appointment does not exist for the given date and patient ID", () => {
            dbDeleteOne.mockImplementation(async () => Promise.resolve({ deletedCount: 0 }));
    
            return request(app).delete(`/api/v1/appointments/date/${appointment.date.toISOString()}/patient/${appointment.idPatient}`).then((response) => {
                expect(response.statusCode).toBe(404);
                expect(response.body.error).toEqual("Appointment not found for the given date and patient ID");
                expect(dbDeleteOne).toBeCalled();
            });
        });
    
        it("Should return 500 if there is a problem when deleting an appointment ", () => {
            dbDeleteOne.mockImplementation(async () => Promise.reject("Connection failed"));
    
            return request(app).delete(`/api/v1/appointments/date/${appointment.date.toISOString()}/patient/${appointment.idPatient}`).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteOne).toBeCalled();
            });
        });
    });
    
    
});