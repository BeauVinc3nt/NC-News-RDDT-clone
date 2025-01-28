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

//
describe("GET /api/topics", () => {
  test("200: Responds with arr of objs with slugs & description properies", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(Array.isArray(topics)).toBe(true); // Check that topics value is an arr.
        topics.forEach((topic) => {
          // Checking each indidual topic to ensure property rules are consistent.
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe('GET api/topics/author_id', () => {
  test('should ', () => {
    
  });
});
