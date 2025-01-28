// Requiring in endpoint funcs from controller
const express = require("express");
const {
  getEndpoints,
  getTopicsEndpoint,
} = require("./Controllers/controllers");
const app = express(); // Creating  an instance of express to serve data from.

// Forming url using endpoints + funcs.
app.get("/api", getEndpoints);
app.get("/api/topics", getTopicsEndpoint);

// Error handling middlewares goes here
// This handler matches any endpoint req/ type of req - below endpoints to prevent error overriding  handling
// app.all(("*", (req, res) => {
//     res.status(404).send({error: "Endpoint not found"});
// }));

app.use((err, req, res, next) => {
  if (err.message === "Post not found!") {
    res.status(404).send({ error: "Not found" });
  }
});
module.exports = app;
