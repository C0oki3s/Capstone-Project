const User = require("../models/users");
const Algorithm = require("../models/Algorithms");
const fs = require("fs");

function algoExists(algorithm, command) {
  return algorithm.some(function (el) {
    return el.algorithm_name === command;
  });
}

const getUserInfo = async (id, command) => {
  let database = [];
  const user_data = await Algorithm.findOne({ user_id: id });
  if (user_data == null) {
    return database.push("Database Dont Exists", false);
  }
  await fs.writeFileSync("data.json", JSON.stringify(user_data));
  const readFile = await fs.readFileSync("data.json", { encoding: "utf8" });
  const data = algoExists(JSON.parse(readFile)?.algorithm, command);
  const parse_data = JSON.parse(readFile);
  let user_data_algo = parse_data.algorithm;
  let length = parse_data.algorithm.length;
  for (let i = 0; i < length; i++) {
    if (user_data_algo[i].algorithm_name == command) {
      database.push(user_data_algo[i], data);
    }
  }
  console.log(database);
  return database;
};

module.exports = getUserInfo;
