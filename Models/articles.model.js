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

function fetchAllArticles() {
  // Selecting and joining comments to articles table
  return db
    .query(
      `SELECT 
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows.map((article) => ({
        // Map into an arr
        ...article,
        comment_count: Number(article.comment_count),
      }));
    });
}
// Export funcs to controller
module.exports = { fetchArticleByID, fetchAllArticles };
