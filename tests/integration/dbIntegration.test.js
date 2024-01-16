const Appointment = require('../../models/appointment');
const dbConnectTest = require('./envDBIntegrationTest');
const request = require('supertest');
const app = require('../../app'); 
jest.setTimeout(3000);

describe("Integration Tests for Appointments API", () => {

    beforeAll((done) => {
        if (dbConnectTest.readyState == 1) {
            done();
        } else {
            dbConnectTest.on("connected", () => done());
        }
    });

    describe("Assurance DB connection", () => {
        const appointmentData = {
            "nameDoctor": "Dr. Test",
            "lastnameDoctor": "Tester",
            "idPatient": "123",
            "namePatient": "John",
            "lastnamePatient": "Doe",
            "date": "2024-01-20T10:00:00.000Z",
            "subject": "Test appointment"
        };

        beforeAll(async () => {
            await Appointment.deleteMany({});
        });

        it("Creates an appointment in the DB", async () => {
            const createResponse = await request(app)
                .post('/api/v1/appointments')
                .send(appointmentData);

            expect(createResponse.status).toBe(201);

            const result = await Appointment.find();
            expect(result).toHaveLength(1);
        });

        it("Retrieves appointments for a specific patient", async () => {
          const getResponse = await request(app)
              .get(`/api/v1/appointments/patients/${appointmentData.idPatient}`);
      
          console.log("GET /api/v1/appointments/patients/:idPatient response:", getResponse.body);
      
          
          expect(getResponse.status).toBe(200); 
          expect(getResponse.body).toHaveLength(1); 
          expect(getResponse.body[0].nameDoctor).toEqual(appointmentData.nameDoctor);
        });

        it("Reads appointment from the DB", async () => {
            const result = await Appointment.findOne({ "nameDoctor": appointmentData.nameDoctor });
            expect(result).not.toBeNull();
            expect(result.nameDoctor).toEqual(appointmentData.nameDoctor);
        });

        it("Deletes appointment from the DB", async () => {
            const deleteResponse = await request(app)
                .delete(`/api/v1/appointments/date/${appointmentData.date}/patient/${appointmentData.idPatient}`);

            expect(deleteResponse.status).toBe(200);

            const result = await Appointment.findOne({ "nameDoctor": appointmentData.nameDoctor });
            expect(result).toBeNull();
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

