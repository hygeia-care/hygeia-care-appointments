const axios = require('axios');
const debug = require('debug')('scheduler-service:scheduler');

const SCHEDULER_SERVICE = process.env.SCHEDULER_SERVICE || 'http://localhost:3336';
const API_VERSION = "/api/v1/schedulers";

// Función modificada para obtener la lista de schedulers
const getScheduler = async function() {
    try {
        const url = `${SCHEDULER_SERVICE}${API_VERSION}`;
        const response = await axios.get(url);

        debug("Response from Scheduler Service: ", response.data);
        return response.data; // Devuelve los datos obtenidos del servicio Scheduler
    } catch (error) {
        console.error("Error in Scheduler Service call: ", error);
        return null; // Devuelve null en caso de error
    }
};

module.exports = {
    getScheduler
};
