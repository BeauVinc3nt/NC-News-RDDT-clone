const { fetchAllTopics } = require("../Models/topics.model");
const {
  fetchArticleByID,
  fetchAllArticles,
} = require("../Models/articles.model");
const endpointsJson = require("../endpoints.json");
const articles = require("../db/data/test-data/articles");

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

// Exporting controller funcs for APIs
module.exports = {
  getEndpoints,
  getTopicsEndpoint,
  getArticleIDEndpoint,
  getAllArticlesEndpoint,
};
