var axios = require('axios');
require('dotenv').config();

const apiEndpoint = process.env.USER_SERVICE_URL + 'users/check';
const authToken = process.env.USER_SERVICE_API_KEY;

const verifyToken = async function(req, res, next) {
  const token = req.headers['x-auth-token'];
  const requestBody = { token: token };

  try {
    await axios.post(apiEndpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Authorization': 'Bearer ' + authToken
      },
    });
    next(); // Llama a next() para pasar al siguiente middleware

  } catch (error) {
    if (error.response) {
      res.status(401).json({ error: "Error with authentication: " + error.response.data.error });
    } else if (error.request) {
      res.status(500).json({ error: "No response received from the authentication server." });
    } else {
      res.status(500).json({ error: "Error occurred during the request setup for authorization." });
    }
  }
}

module.exports = { verifyToken };