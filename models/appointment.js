const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    nameDoctor: {
        type: String,
        required: true
    },
    lastnameDoctor: {
        type: String,
        required: true
    },
    idPatient: {
        type: String,
        required: true
    },
    namePatient: {
        type: String,
        required: true
    },
    lastnamePatient: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

appointmentSchema.methods.cleanup = function() {
    return {
        nameDoctor: this.nameDoctor,
        lastnameDoctor: this.lastnameDoctor,
        idPatient: this.idPatient,
        namePatient: this.namePatient,
        lastnamePatient: this.lastnamePatient,
        date: this.date
    };
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
