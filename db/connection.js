// Setting up connection pooling for dealing with multiple requests.
const { config } = require("dotenv");
const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development"; //
// const ENV = process.env.NODE_ENV || "development"; // Change to "test" when testing endpoints.

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

// If the PGDATABASE (locally hosting) && Hosted DB on Supabase isn't set => throw err
if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2; // Setting N.O connections the pool will have availiable
}
module.exports = new Pool(config);
