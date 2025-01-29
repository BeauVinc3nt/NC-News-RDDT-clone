const db = require("../db/connection");

function fetchCommentsByArticleId(article_id) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((foundArticle) => {
      // Check using promises => if article doesn't exist (before checking for article specific comment), check article exists.
      if (foundArticle.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      // Locating comments for specific checked post
      return db.query(
        `SELECT comment_id, votes, created_at, author, body, article_id
     FROM comments
     WHERE article_id = $1
     ORDER BY created_at DESC;`,
        [article_id]
      );
    })
    .then((articleComment) => {
      return articleComment.rows; // Returns the article comments
    });
}

module.exports = { fetchCommentsByArticleId };
