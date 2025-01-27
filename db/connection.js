// Setting up connection pooling for dealing with multiple requests.
const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development"; // Change to "test" when testing endpoints.

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set");
}

module.exports = new Pool();
