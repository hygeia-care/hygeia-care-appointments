var cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var appointmentsRouter = require('./routes/appointments.js');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/api/v1/appointments', appointmentsRouter);

// setup connection to mongo
const mongoose = require('mongoose');
const DB_URL = process.env.DB_URL || 'mongodb+srv://celia_Appointment:celia_Appointment@cluster0.miuwv1w.mongodb.net/appointments';

// Lógica para conectar a la base de datos
const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to the database:", DB_URL);

        // Desconectar la base de datos después de 10 minutos (ajusta el tiempo según tus necesidades)
        const disconnectTimeout = 1 * 60 * 1000; // 10 minutos en milisegundos
        setTimeout(async () => {
            await mongoose.disconnect();
            console.log("Disconnected from the database");
        }, disconnectTimeout);
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        // Puedes lanzar una excepción para indicar que la conexión ha fallado
        throw new Error("Unable to connect to the database");
        // Otras opciones: cerrar la aplicación, enviar una notificación, etc.
    }
};



// Conectarse a la base de datos al iniciar la aplicación
connectToDatabase();

const db = mongoose.connection;

// recover from errors
db.on('error', console.error.bind(console, 'db connection error'));

module.exports = app;
