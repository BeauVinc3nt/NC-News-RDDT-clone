// Requiring in endpoint funcs from controller
const express = require("express");
const {
  getEndpoints,
  getTopicsEndpoint,
  getArticleIDEndpoint,
  getAllArticlesEndpoint,
  getArticleIDCommentsEndpoint,
  postCommentToArticleEndpoint,
  patchArticleIDEndpoint,
  deleteCommentEndpoint,
} = require("./Controllers/controllers");

const app = express(); // Creating  an instance of express to serve data from.
app.use(express.json()); // Used to parse requests

// Forming url using endpoints + funcs.
// GET REQUESTS
app.get("/api", getEndpoints);
app.get("/api/topics", getTopicsEndpoint);
app.get("/api/articles/:article_id", getArticleIDEndpoint);
app.get("/api/articles", getAllArticlesEndpoint);
app.get("/api/articles/:article_id/comments", getArticleIDCommentsEndpoint);

// POST REQUESTS
app.post("/api/articles/:article_id/comments", postCommentToArticleEndpoint);

// PATCH REQUESTS
app.patch("/api/articles/:article_id", patchArticleIDEndpoint);

// DELETE REQUESTS
app.delete("/api/comments/:comment_id", deleteCommentEndpoint);

// TO ADD:
// app.get("/api/users", getUsersEndpoint);
// app.get("/api/articles (queries)", getArticleByQuerysEndpoint);
// app.get(
//   "/api/articles/:article_id (commentcount)",
//   getArticleIDCommentCountEndpoint
// );

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
