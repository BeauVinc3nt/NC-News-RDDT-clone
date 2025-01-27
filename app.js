const express = require("express");
const { getEndpoints } = require("./Controllers/controllers");
const app = express(); // Creating  an instance of express to serve data from.

app.get("/api", getEndpoints);

module.exports = app;
