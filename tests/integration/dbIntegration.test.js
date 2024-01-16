const Appointment = require('../../models/appointment');
const dbConnectTest = require('./envDBIntegrationTest');
const request = require('supertest');
const app = require('../../app');

jest.setTimeout(3000);

describe("Integration Tests", () => {

    beforeAll((done) => {
        if (dbConnectTest.readyState == 1) {
            done();
        } else {
            dbConnectTest.on("connected", () => done());
        }
    });

    describe("Appointments DB connection", () => {
        const appointmentData = {
            nameDoctor: 'DoctorName',
            lastnameDoctor: 'DoctorLastName',
            idPatient: '123',
            namePatient: 'PatientName',
            lastnamePatient: 'PatientLastName',
            date: new Date(),
            subject: 'AppointmentSubject'
        };

        var result;

        beforeAll(async () => {
            await Appointment.deleteMany({});
        });

        it("Writes an appointment in the DB", async () => {
            const appointment = new Appointment(appointmentData);
            await appointment.save();
            result = await Appointment.find();
            expect(result).toHaveLength(1);
        });

        it("Reads appointment from the DB", async () => {
            const appointment = new Appointment(appointmentData);
            await appointment.save();
            const savedAppointment = await Appointment.findById(appointment._id);
            expect(savedAppointment.nameDoctor).toEqual('DoctorName');
        });

        it("Deletes appointment from the DB", async () => {
            const appointment = new Appointment(appointmentData);
            await appointment.save();
        
            // Simular la eliminación utilizando la ruta específica
            const deleteResponse = await request(app)
                .delete(`/api/v1/appointments/date/${appointment.date.toISOString()}/patient/${appointment.idPatient}`);
        
            expect(deleteResponse.statusCode).toBe(200);
        });
        
        

        afterAll(async () => {
            await Appointment.deleteMany({});
        });
    });

    afterAll(async () => {
        if (dbConnectTest.readyState == 1) {
            await dbConnectTest.close();
        }
    });

});
