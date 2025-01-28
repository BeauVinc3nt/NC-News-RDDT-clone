const endpointsJson = require("../endpoints.json");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index"); // Grabbing data from index.js storing all data.
const app = require("../app");
const request = require("supertest"); // Enables testinf

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
