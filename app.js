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

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/api/v1/appointments', appointmentsRouter);

//setup connection to mongo
const mongoose = require('mongoose');
const DB_URL = (process.env.DB_URL || 'mongodb+srv://celia_Appointment:celia_Appointment@cluster0.miuwv1w.mongodb.net/appointments')
console.log("Connection to database: %s", DB_URL)

mongoose.connect(DB_URL);
const db = mongoose.connection;

//recover from errors
db.on('error', console.error.bind(console, 'db connection error'));

module.exports = app;
