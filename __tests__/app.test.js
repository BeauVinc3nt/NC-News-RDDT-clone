const endpointsJson = require("../endpoints.json");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index"); // Grabbing data from index.js storing all data.
const app = require("../app");
const request = require("supertest"); // Enables testing

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
  test("200: Responds with arr of objs with slugs & description properies", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true); // Check that topics value is an arr.
        body.topics.forEach((topic) => {
          // Checking each indidual topic to ensure property rules are consistent.
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

//"/api/articles/?article_id"
describe("GET api/articles/:article_id", () => {
  test("200: Responds with an article by it's article id ", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        // Checking fomratting of article obj reaches requirements.
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
  // ERROR HANDLING
  test("400: Responds with error for an invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-a-number") // Testing with a data type that is no the expected Number
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
  test("200: responds with an arr of articles, sorted by date in descending order", () => {
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
          expect(article.body).toBeUndefined(); // body should not be present in objs
        });
      });
  });

  test("200: Articles should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        // Looping through the articles and checking that prev article is greater than (posted later than) the current article.
        for (let i = 1; i < articles.length; i++) {
          const prevArticleTime = new Date(
            articles[i - 1].created_at
          ).getTime(); // Converts Date obj to timestamp (maintains a string)
          const currArticleTime = new Date(articles[i].created_at).getTime();

          expect(prevArticleTime).toBeGreaterThanOrEqual(currArticleTime);
        }
      });
  });
});

describe("GET /api/articles/article_id/comments", () => {
  test("200: returns an arr of comments from the appropriate article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true); // Checking that comments are stored as an arr
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            // Checking comment fromat is correct
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  // Ordering the comments in time order
  test("200: comments should be served with most recent first ", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        for (let i = 1; i < comments.length; i++) {
          const prevCommentTime = new Date(
            comments[i - 1].created_at
          ).getTime(); // Converts Date obj to timestamp (maintains a string)
          const currCommentTime = new Date(comments[i].created_at).getTime();

          expect(prevCommentTime).toBeGreaterThanOrEqual(currCommentTime);
        }
      });
  });
  // Testing an article with no comments.
  test("200: Should return empty arr of comments for an article with no comments ", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
});
