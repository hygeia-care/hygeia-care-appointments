const Appointment = require('../../models/appointment');
const dbConnectTest = require('./envDBIntegrationTest');
//jest
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
            const createResponse = await Appointment.create(appointmentData);
            expect(createResponse).toHaveProperty('_id');
        });

        it("Retrieves appointments for a specific patient", async () => {
            const getResponse = await Appointment.find({ "idPatient": appointmentData.idPatient });
            expect(getResponse).toHaveLength(1);
            expect(getResponse[0].nameDoctor).toEqual(appointmentData.nameDoctor);
        });

        it("Reads appointment from the DB", async () => {
            const result = await Appointment.findOne({ "nameDoctor": appointmentData.nameDoctor });
            expect(result).not.toBeNull();
            expect(result.nameDoctor).toEqual(appointmentData.nameDoctor);
        });

        it("Deletes appointment from the DB", async () => {
            const deleteResponse = await Appointment.deleteOne({ "date": new Date(appointmentData.date), "idPatient": appointmentData.idPatient });
            expect(deleteResponse.deletedCount).toBe(1);
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
