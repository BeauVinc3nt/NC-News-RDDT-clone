const db = require("../db/connection");

function fetchArticleByID(article_id) {
  return db
    .query(
      // Selecting all cols from articles table, counting the n.o comments & joining a comments column to the table where there are matched rows to its article
      `SELECT articles.*,
       COUNT(comments.comment_id) AS comment_count
       FROM articles
       LEFT JOIN comments ON articles.article_id = comments.article_id
       WHERE articles.article_id = $1
       GROUP BY articles.article_id`,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        //  Prev error: if rejected promise isn't correctly passed into error-handling mw => return 500 error when 404 expected.s
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return result.rows[0]; // Returns single article obj to send array
    })
    .catch((err) => {
      return Promise.reject(err); // Passing error back to controller
    });
}

function fetchAllArticles() {
  // Selecting and joining the comments with their associated article (article_id) & passing the comment count
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

function updateArticleVoteCount(article_id, inc_votes) {
  return db
    .query(
      `UPDATE articles 
    SET votes = votes + $1 
    WHERE article_id = $2 
    RETURNING *;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return result.rows[0]; // Returns single article obj
    })
    .catch((err) => {
      return Promise.reject(err); // Passing error back to controller
    });
}

// Setting queries
function fetchAllArticlesByQuery(
  sort_by = "created_at",
  order = "desc",
  topic = null,
  totalComments = "comment_count"
) {
  const validSortingQueries = [
    // Specifying accepted query params for sorting in db (SQL INJECTION PREVENTION)
    "created_at",
    "article_id", // Array of article table keys:
    "title",
    "topic",
    "author",
    "votes",
    "comment_count",
  ];
  // If a query is given outside of specified params => reject promise
  if (!validSortingQueries.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      message: `Invalid sort column query: ${sort_by}`,
    });
  }
  // Specifying accepted order params (ascending or descending)
  const validOrders = ["asc", "desc"];

  // Convert order query to lowercase to run sql query
  if (!validOrders.includes(order.toLowerCase())) {
    return Promise.reject({
      status: 400,
      message: `Invalid order query: ${order}. Order can only be 'asc' or 'desc'.`,
    });
  }

  // If sort by isn't comment count => set to articles to sort
  const sortColumn =
    sort_by === "comment_count" ? "comment_count" : `articles.${sort_by}`;

  // Creating SQL query to append if queries increase (defaulting to fething all articles)
  let queryString = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id`;

  // Storing query params for positional placeholders in seperate arr. If query => push query to arr
  const givenQueryParams = [];

  // Checking for topic query param
  if (topic) {
    queryString += " WHERE articles.topic = $1"; // PREVENTING SQL INJECTION USING ALIAS
    givenQueryParams.push(topic);
  }

  queryString += `
    GROUP BY articles.article_id
    ORDER BY ${sortColumn} ${order.toUpperCase()}; 
  `; // Converting from arr check for lower case => SQL query syntax

  // If no topc queries given => no positional placeholder ( [] )
  return db.query(queryString, givenQueryParams).then(({ rows }) => {
    if (topic && rows.length === 0) {
      // Testing checked topic is in database topic table
      return db
        .query("SELECT * FROM topics WHERE slug = $1;", [topic])
        .then(({ rows: topicRows }) => {
          if (topicRows.length === 0) {
            return Promise.reject({ status: 404, message: "Topic not found" });
          }
          return []; // Return empty arr if topic exists but has no articles
        });
    }
    return rows.map((article) => ({
      ...article,
      comment_count: Number(article.comment_count), // Convert comment count to num
    }));
  });
}

// Export funcs to controller
module.exports = {
  fetchArticleByID,
  fetchAllArticles,
  updateArticleVoteCount,
  fetchAllArticlesByQuery,
};
