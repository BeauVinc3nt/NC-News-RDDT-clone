const { fetchAllTopics } = require("../Models/topics.model");
const { fetchArticleByID } = require("../Models/articles.model");
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

function getArticleID(req, res, next) {
  const { article_id } = req.params;

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
module.exports = { getEndpoints, getTopicsEndpoint, getArticleID };
