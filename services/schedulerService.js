const axios = require('axios');
//const urlJoin = require('url-join');
const debug = require('debug')('scheduler-service:scheduler');

const SCHEDULER_SERVICE = process.env.SCHEDULER_SERVICE || 'http://localhost:3336';
const API_VERSION = "/api/v1/schedulers";

//codigo de acceso, funcion asincrona
const getScheduler = async function(name){
    try{
        //const url = urlJoin(SCHEDULER_SERVICE, API_VERSION);
        const url = SCHEDULER_SERVICE + API_VERSION;
        //console.log("URL-llamada a SchedulerService:" , url);
        const response = await axios.get(url) ; // variable espera la respuesta de axios
        debug("response: " + response);
        return response.data;
    }catch (error){
        console.error("error en la llamada al MS Scheduler: ", error);
        return null;
    }
}

module.exports = {
    "getScheduler": getScheduler
}