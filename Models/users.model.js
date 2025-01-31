const db = require("../db/connection");

function fetchAllUsers() {
  return db
    .query(
      // Formatting user collection into ascending order.
      `SELECT username, name, avatar_url FROM users ORDER BY username ASC`
    )
    .then(({ rows }) => {
      return rows; // Return the users.
    });
}

module.exports = { fetchAllUsers };
