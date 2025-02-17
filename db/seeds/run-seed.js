//const devData = require("../data/development-data/index.js");   //Uncomment when developing data for development
const devData = require("../data/development-data/index.js"); // WHEN TESTING, UNCOMMENT ''testData' AND COMMENT DEV DATA + PAS S IN DEV DATA TO RUN-SEED + TESTING "BEFOREEACH"
const seed = require("./seed.js");
const db = require("../connection.js");

const runSeed = () => {
  //return seed(testData).then(() => db.end()); // Seeding test data
  return seed(devData).then(() => db.end()); // Seeding dev data (USE WHEN TESTING)
};

runSeed(); // Exporting seeding func
