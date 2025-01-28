// models/topics.models.js
const db = require("../db/connection");

function fetchAllTopics() {
  // Use SQL to capture all from topics
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
}

module.exports = { fetchAllTopics };
