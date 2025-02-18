// Requiring in endpoint funcs from controller
const express = require("express");
const cors = require("cors");
const {
  getEndpoints,
  getTopicsEndpoint,
  getArticleIDEndpoint,
  getArticleIDCommentsEndpoint,
  postCommentToArticleEndpoint,
  patchArticleIDEndpoint,
  deleteCommentEndpoint,
  getAllUsersEndpoint,
  getArticlesAndQuerysEndpoint,
} = require("./Controllers/controllers");

const app = express(); // Creating  an instance of express to serve data from.
app.use(cors());
app.use(express.json()); // Used to parse requests

// Forming url using endpoints + funcs.
// GET REQUESTS
app.get("/api", getEndpoints);
app.get("/api/topics", getTopicsEndpoint);
app.get("/api/articles/:article_id", getArticleIDEndpoint);
app.get("/api/articles", getArticlesAndQuerysEndpoint); // Combining both fetchAllArticles and the queries into one endpoint to do checks for if "sort_by" and "order" instances exist.
app.get("/api/articles/:article_id/comments", getArticleIDCommentsEndpoint);
app.get("/api/users", getAllUsersEndpoint);

// POST REQUESTS
app.post("/api/articles/:article_id/comments", postCommentToArticleEndpoint);

// PATCH REQUESTS
app.patch("/api/articles/:article_id", patchArticleIDEndpoint);

// DELETE REQUESTS
app.delete("/api/comments/:comment_id", deleteCommentEndpoint);

// This handler matches any endpoint req/ type of req - below endpoints to prevent error overriding  handling
// Correct syntax:
app.all("*", (req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

// Error handling middlewares
app.use((err, req, res, next) => {
  console.log(err);
  if (err.status && err.message) {
    // Takes in the error status + appropriate message for res status
    res.status(err.status).send({ message: err.message });
  } else {
    console.log(err.status);
    // If either of the 2 error conditions are missing => send 500 error.
    res.status(500).send({ message: "Internal Server Error" });
  }
});
module.exports = app;
