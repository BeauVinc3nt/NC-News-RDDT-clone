const db = require("../db/connection");

function fetchCommentsByArticleID(article_id) {
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

function insertCommentToArticleID(article_id, username, body) {
  if (!body) {
    return Promise.reject({
      status: 400,
      message: "Missing fields: username and body are required!",
    });
  }

  return db
    .query(`SELECT * FROM articles WHERE article_id =$1`, [article_id])
    .then((foundArticle) => {
      if (foundArticle.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      // Checking user exists
      return db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    })
    .then((user) => {
      if (user.rows.length === 0) {
        return Promise.reject({ status: 404, message: "User not found" });
      }

      return db.query(
        `INSERT INTO comments(author, body, article_id) 
        VALUES ($1, $2, $3) RETURNING comment_id, votes, created_at,
        author, body, article_id;`,
        [username, body, article_id]
      );
    })
    .then((articleComment) => {
      return articleComment.rows[0]; // Return created comment
    });
}

function deleteCommentFromArticleID(comment_id) {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id, // Deleting the matching comment id to the vallue passed in.
    ])
    .then(({ rows }) => {
      // Destrucuring rows into an obj with arr of rows.
      if (rows.length === 0) {
        return null; // Sends 404 err
      }
      return rows[0]; // Return the deleted comment
    });
}

module.exports = {
  fetchCommentsByArticleID,
  insertCommentToArticleID,
  deleteCommentFromArticleID,
};
