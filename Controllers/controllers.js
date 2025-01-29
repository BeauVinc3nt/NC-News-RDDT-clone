const { fetchAllTopics } = require("../Models/topics.model");
const {
  fetchArticleByID,
  fetchAllArticles,
} = require("../Models/articles.model");
const {
  fetchCommentsByArticleId,
  insertCommentToArticleID,
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

  // If article isn't a number => retunr err message
  if (isNaN(article_id)) {
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
  fetchCommentsByArticleId(article_id)
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

// Exporting controller funcs for APIs
module.exports = {
  getEndpoints,
  getTopicsEndpoint,
  getArticleIDEndpoint,
  getAllArticlesEndpoint,
  getArticleIDCommentsEndpoint,
  postCommentToArticleEndpoint,
};
