const endpointsJson = require("../endpoints.json");

// Get hold of all controllers
function getEndpoints(req, res) {
  res.status(200).send({ endpoints: endpointsJson });
}

module.exports = { getEndpoints };
