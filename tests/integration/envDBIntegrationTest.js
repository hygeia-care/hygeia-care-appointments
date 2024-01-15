const mongoose = require('mongoose');

const DB_URL_TEST = 'mongodb+srv://assurance_db_user:Q1zgoIFMyIEjAoAs@cluster0.miuwv1w.mongodb.net/bills_db_test?retryWrites=true&w=majority';

const connectToTestDatabase = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        await mongoose.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to the test database:", DB_URL_TEST);
    } catch (error) {
        console.error("Error connecting to the test database:", error.message);
        throw error;
    }
};

const closeTestDatabase = async () => {
    await mongoose.connection.close();
    console.log("Closed connection to the test database");
};

module.exports = {
    connectToTestDatabase,
    closeTestDatabase
};
