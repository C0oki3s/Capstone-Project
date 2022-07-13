const express = require("express");
const User = require("../models/users");
const Algorithm = require("../models/Algorithms");
const { verify_api } = require("../controller/verify-api");
const fs = require("fs");
const getUserInfo = require("./checkFile");
const route = express.Router();

route.post(
  [
    "/random_forest",
    "/logistic_regression",
    "/k_nearest_neighbors",
    "/xgboost",
  ],
  async (req, res) => {
    let is_vaild = false;
    const { apikey, secret } = req.body;
    const verify = await User.find({ "Keypairs.publickey": apikey });
    verify.forEach(({ Keypairs }) => {
      Keypairs.forEach((element) => {
        is_vaild = element.publickey == apikey && element.privatekey == secret;
      });
    });
    if (is_vaild) {
      const { _id } = verify[0];
      const Algodata = await Algorithm.find({ user_id: _id });
      console.log(Algodata);
      const data = await getUserInfo(
        Algodata[0].user_id,
        req.path.split("/")[1]
      );
      if (data[1]) {
        res.json({
          status: true,
          message: data[0],
        });
      } else {
        res.json({
          status: true,
          message: { error: "Database does not exists for this algorithm" },
        });
      }
    }
  }
);

module.exports = route;
