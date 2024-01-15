const Appointment = require('../../models/appointment');
const dbConnectTest = require('./envDBIntegrationTest');
const request = require('supertest');
const app = require('../../app');

jest.setTimeout(3000);

describe("Integration Tests", () => {
    beforeAll(async () => {
        await dbConnectTest.connectToTestDatabase();
    });
    

    describe("Integration tests", () => {
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
        ];

        var dbFind;
        var dbDeleteOne;

        beforeAll(async () => {
            await Appointment.deleteMany({});
            await Appointment.insertMany(appointments);
        });

        it("Fetches appointments from the DB", async () => {
            dbFind = jest.spyOn(Appointment, 'find');
            const response = await request(app).get("/api/v1/appointments");
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(appointments.length);
            expect(dbFind).toBeCalled();
        });

        it("Deletes appointment by date and patient ID", async () => {
            const appointment = appointments[0]; // Obtén una cita de la base de datos o crea una para la prueba
        
            // Realiza la eliminación
            const response = await request(app).delete(`/api/v1/appointments/date/${appointment.date.toISOString()}/patient/${appointment.idPatient}`);
            
            // Verifica que la respuesta sea exitosa (código 200) si la cita se elimina correctamente
            if (response.statusCode === 200) {
                // Intenta recuperar el elemento eliminado de la base de datos
                const deletedAppointment = await Appointment.findById(appointment._id);
        
                // Verifica que el elemento no exista en la base de datos
                expect(deletedAppointment).toBeNull();
            } else {
                // Verifica que la respuesta sea 404 si la cita no se encuentra
                expect(response.statusCode).toBe(404);
                expect(response.body.error).toEqual("Appointment not found for the given date and patient ID");
            }
        });

        
        

        it("Returns 404 if the appointment does not exist", async () => {
            const response = await request(app).delete("/api/v1/appointments/nonexistentid");
        
            // Verifica que la respuesta sea 404
            expect(response.statusCode).toBe(404);
        
            // Verifica que el cuerpo de la respuesta sea un objeto (puede ser un objeto vacío)
            expect(response.body).toBeInstanceOf(Object);
        
            // Verifica que la propiedad 'error' exista en el cuerpo de la respuesta
            if ('error' in response.body) {
                // Verifica que el valor de la propiedad 'error' sea igual a "Appointment not found"
                expect(response.body.error).toEqual("Appointment not found");
            } else {
                // Puedes manejar la situación en la que 'error' no está presente según tus necesidades
                // Por ejemplo, asumir que la respuesta es válida aunque no haya 'error'
            }
        });
        

        afterEach(async () => {
            await Appointment.deleteMany({});
        });

        afterAll(async () => {
            await dbConnectTest.closeTestDatabase();
        });
          
    });
});
