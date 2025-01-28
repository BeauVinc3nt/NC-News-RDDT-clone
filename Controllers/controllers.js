const db = require("../db/connection");
const topics = require("../db/data/test-data/topics");
const endpointsJson = require("../endpoints.json");

// Get hold of all controllers
function getEndpoints(req, res) {
  res.status(200).send({ endpoints: endpointsJson }); // On success => send enpoints data
}

function getTopicsEndpoint(req, res, next) {
  return db
    .query("SELECT * FROM topics;") // Use SQL to capture all from topics
    .then(({ rows }) => {
      res.status(200).send({ topics: rows }); // Send as an obj where "topics" is the key and rows is the "value"
    })
    .catch(next);
}

// Exporting controller funcs for APIs
module.exports = { getEndpoints, getTopicsEndpoint };
