const endpointsJson = require("../endpoints.json");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js"); // Grabbing data from index.js storing all data.
const app = require("../app.js");
const request = require("supertest"); // Enables testing
// const { fetchAllUsers } = require("../Models/users.model.js");

// Before each test: seed the database with the collective data from index
beforeEach(() => {
  return seed(testData);
});

// After each test is executed: close the db connection
afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of objects with slugs & description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true); // Check that topics value is an array.
        body.topics.forEach((topic) => {
          // Checking each individual topic to ensure property rules are consistent.
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article by its article id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  test("400: Responds with error for an invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-a-number") // Testing with a data type that is not the expected number
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid article ID");
      });
  });

  test("404: Responds with an error for non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles, sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(Array.isArray(articles)).toBe(true);

        // Checks each article to have all properties
        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article.body).toBeUndefined(); // body should not be present in objects
        });
      });
  });

  test("200: Articles should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        for (let i = 1; i < articles.length; i++) {
          const prevArticleTime = new Date(
            articles[i - 1].created_at
          ).getTime(); // Converts Date object to timestamp
          const currArticleTime = new Date(articles[i].created_at).getTime();

          expect(prevArticleTime).toBeGreaterThanOrEqual(currArticleTime);
        }
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: returns an array of comments from the appropriate article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true); // Checking that comments are stored as an array
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            article_id: 1,
          });
        });
      });
  });

  test("200: comments should be served with the most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        for (let i = 1; i < comments.length; i++) {
          const prevCommentTime = new Date(
            comments[i - 1].created_at
          ).getTime(); // Converts Date object to timestamp
          const currCommentTime = new Date(comments[i].created_at).getTime();

          expect(prevCommentTime).toBeGreaterThanOrEqual(currCommentTime);
        }
      });
  });

  test("200: Should return an empty array of comments for an article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the newly created comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is a new comment!",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "This is a new comment!",
          article_id: 1,
        });
      });
  });

  test("400: Missing fields username and body required", () => {
    const newComment = {
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "Missing fields: username and body are required!"
        );
      });
  });

  test("404: Article not found", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This comment should fail because the article doesn't exist.",
    };

    return request(app)
      .post("/api/articles/999/comments") // Assuming article 999 does not exist
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });

  test("404: User not found", () => {
    const newComment = {
      username: "nonexistent_user", // Assuming this user doesn't exist
      body: "This comment should fail because the user doesn't exist.",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("User not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Updates article votes when valid params are passed (valid ID + vote count is a number)", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          votes: expect.any(Number),
        });
      });
  });

  test("400: Responds with error when inc_votes is missing", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request: inc_votes is required");
      });
  });

  test("400: Responds with error when inc_votes is not a number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "ten" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request: inc_votes must be a number");
      });
  });

  test("400: Responds with error when article_id is not a number", () => {
    return request(app)
      .patch("/api/articles/not-a-number")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid article ID");
      });
  });

  test("404: Non-existent article_id", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes the specified comment and returns no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        // Check response has no content
        expect(response.body).toEqual({});

        // Verify comment is actually deleted from database
        return db.query("SELECT * FROM comments WHERE comment_id = 1");
      })
      .then(({ rows }) => {
        expect(rows.length).toBe(0);
      });
  });

  test("404: Returns appropriate error when comment_id does not exist", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment not found");
      });
  });

  test("400: Returns appropriate error when comment_id is invalid", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid comment ID");
      });
  });

  test("404: Confirms other comments remain unchanged after deletion", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        // Run query to check other comments exist after comment deletion
        return db.query("SELECT * FROM comments WHERE comment_id != 1;");
      })
      .then(({ rows }) => {
        // Checks that all other comments were collected and not only deleted comment
        expect(rows.length).toBeGreaterThan(0);
      });
  });
});
describe("GET /api/users", () => {
  test("200: Responds with an array of user objects with correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body; // Checking users format
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);

        users.forEach((user) => {
          // Checking user obj properties match
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
  // Sorting usernames in alphabetical order
  test("Checks users are sorted alphabetically by username", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        const usernames = users.map((user) => user.username); // Creating new arr for format
        expect(usernames).toEqual([...usernames].sort());
      });
  });
  // Returning error when incorrect endpoint attempts to make request
  test("404: Returns appropriate error for non-existent endpoint", () => {
    return request(app)
      .get("/api/incorrectendpoint") // Random endpoint
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Endpoint not found");
      });
  });
});
describe("200: Return an empty arr when there are no users on the db", () => {
  beforeEach(() => {
    return db.query(`
      DELETE FROM comments;
      DELETE FROM articles;
      DELETE FROM users;
    `); // PREV ERROR: foreign key constraint from old query using: DELETE FROM users
  });
  test("200: Responds with empty arr when the db has no users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toEqual([]); // After db query has removed users => check empty arr is given
      });
  });
});
describe("GET /api/articles (sorting queries)", () => {
  test("200: Returns articles sorted by created_at (default)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        // console.log(body); // USED FOR DEBUGGING
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: Returns articles sorted by votes in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { ascending: true });
      });
  });

  test("400: Responds with an error when given an invalid sort column", () => {
    return request(app)
      .get("/api/articles?sort_by=not_a_column")
      .expect(400)
      .then(({ body }) => {
        // console.log(body);
        expect(body.message).toBe(`Invalid sort column query: not_a_column`); // Changed ${body.sort_by} => not_a_column as the API returns this. Initial value was undefined causing err
      });
  });

  test("400: Responds with an error when given an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalidOrder")
      .expect(400)
      .then(({ body }) => {
        // console.log(body);
        expect(body.message).toBe(
          `Invalid order query: invalidOrder. Order can only be 'asc' or 'desc'.` // Changed ${body.order} => invalidOrder as the API returns this. Initial value was undefined causing err
        );
      });
  });

  test("200: Returns an empty array when a valid topic has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]); //No articles under 'paper' topic => return empty arr
      });
  });

  // Testing each of the valid topics work:
  test("200: Returns articles filtered by a valid topic (mitch)", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("200: Returns articles filtered by a valid topic (cats)", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });

  test("200: Returns articles filtered by a valid topic (paper)", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        expect(body.articles).toBeInstanceOf(Array);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("paper");
        });
      });
  });

  test("404: Returns an error when passed a non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=topic_that_doesnt_exist") // When unknown topic query given => return 404
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Topic not found");
      });
  });
});
