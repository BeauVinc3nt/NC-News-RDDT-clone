const { fetchAllTopics } = require("../Models/topics.model");
const {
  fetchArticleByID,
  fetchAllArticles,
  updateArticleVoteCount,
} = require("../Models/articles.model");
const {
  fetchCommentsByArticleID,
  insertCommentToArticleID,
  deleteCommentFromArticleID,
} = require("../Models/comments.model");
const endpointsJson = require("../endpoints.json");

// Get hold of all controllers
function getEndpoints(req, res) {
  res.status(200).send({ endpoints: endpointsJson }); // On success => send enpoints data
}

function getTopicsEndpoint(req, res, next) {
  fetchAllTopics()
    .then((topics) => {
      res.status(200).send({ topics }); // Send as an obj where "topics" is the key.
    })
    .catch(next);
}

function getAllArticlesEndpoint(req, res, next) {
  fetchAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
}

function getArticleIDEndpoint(req, res, next) {
  const { article_id } = req.params;
  // console.log({ articles }); TESTING ARTICLE DESC ORDER MAINTAINED:

  // If article isn't a number => return error message
  if (isNaN(Number(article_id))) {
    return res.status(400).send({ message: "Invalid article ID" });
  }

  fetchArticleByID(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
}

// Finding an article's comments given it's ID. If no article found => reject promise + return appropriate err message.
function getArticleIDCommentsEndpoint(req, res, next) {
  const { article_id } = req.params;
  fetchCommentsByArticleID(article_id)
    .then((comments) => {
      res.status(200).send({ comments }); // If comments are found => success status + return comments.
    })
    .catch(next);
}

function postCommentToArticleEndpoint(req, res, next) {
  const { article_id } = req.params;
  const { username, body } = req.body;
  // If params are given => send comment obj
  insertCommentToArticleID(article_id, username, body)
    .then((article) => {
      // Checking username & body exist => reject
      if (!username || !body) {
        return res
          .status(400)
          .send({ message: "Missing fields username and body required!" });
      }
      return insertCommentToArticleID(article_id, username, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
}

function patchArticleIDEndpoint(req, res, next) {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  // Checking article exists + checking vote count is a number
  if (!Number.isInteger(Number(article_id))) {
    return res.status(400).send({ message: "Invalid article ID" });
  }

  if (inc_votes === undefined) {
    return res
      .status(400)
      .send({ message: "Bad request: inc_votes is required" });
  }

  if (typeof inc_votes !== "number") {
    return res
      .status(400)
      .send({ message: "Bad request: inc_votes must be a number" });
  }
  updateArticleVoteCount(article_id, inc_votes)
    .then((updatedArticle) => {
      if (!updatedArticle) {
        return res.status(404).send({ message: "Article not found" });
      }
      res.status(200).send({ article: updatedArticle }); // If successful => send update to article
    })
    .catch(next);
}

function deleteCommentEndpoint(req, res, next) {
  const { comment_id } = req.params;

  // Checking comment ID is in correct format (number)
  if (!Number.isInteger(Number(comment_id))) {
    return res.status(400).send({ message: "Invalid comment ID" }); // Output err status msg
  }

  // ONce comment ID exists => pass into delete func.
  deleteCommentFromArticleID(comment_id)
    .then((deletedComment) => {
      if (!deletedComment) {
        return res.status(404).send({ message: "Comment not found" });
      }
      res.status(204).send({ message: "Comment deleted" }); // Successfully deletes => return delete message
    })
    .catch(next); // Error handling dealt with in middleware (in app)
}

// Exporting controller funcs for APIs
module.exports = {
  getEndpoints,
  getTopicsEndpoint,
  getArticleIDEndpoint,
  getAllArticlesEndpoint,
  getArticleIDCommentsEndpoint,
  postCommentToArticleEndpoint,
  patchArticleIDEndpoint,
  deleteCommentEndpoint,
};
