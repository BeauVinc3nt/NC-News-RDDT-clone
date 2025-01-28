const db = require("../db/connection");

function fetchArticleByID(article_id) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        //  Prev error: if rejected promise isn't correctly passed into error-handling mw => return 500 error when 404 expected.s
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return rows[0]; // Returns single article obj to send array \
    });
}

module.exports = { fetchArticleByID };
