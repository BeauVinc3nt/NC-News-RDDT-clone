//const devData = require("../data/development-data/index.js");   //Uncomment when developing data for development
const testData = require("../data/test-data/index.js"); // WHEN TESTING, UNCOMMENT ''testData' AND COMMENT DEV DATA + PAS S IN DEV DATA TO RUN-SEED + TESTING "BEFOREEACH"
const seed = require("./seed.js");
const db = require("../connection.js");

const runSeed = () => {
  //return seed(devData).then(() => db.end()); // Seeding dev data
  return seed(testData).then(() => db.end()); // Seeding test data (USE WHEN TESTING)
};

runSeed(); // Exporting seeding func
