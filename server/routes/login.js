const express = require("express");
const bcrypt = require("bcryptjs");
const redis = require("redis");
const redis_client = redis.createClient();
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({
      error: {
        status: false,
        password: "email is required",
      },
    });
  } else if (!password) {
    return res.status(400).json({
      error: {
        status: false,
        password: "password is required",
      },
    });
  } else {
    const data = await User.findOne({ email: email });
    if (data) {
      const decrypt = await bcrypt.compare(password, data.password);
      if (decrypt) {
        try {
          const Find_data = await User.findOne({ email: email });
          if (Find_data?.is_verified) {
            let sub = Find_data._id.toString();
            redis_client.get(sub, (err, data) => {
              if (err) throw err;
              let parsed_data = JSON.parse(data);
              if (parsed_data) {
                res.json({
                  status: true,
                  authorization: parsed_data["token"],
                });
              } else {
                let jwtd = jwt.sign(
                  {
                    sub: Find_data._id,
                    email: Find_data.email,
                    Keypairs: Find_data.Keypairs.length,
                  },
                  process.env.JWT_SECRET,
                  { expiresIn: process.env.JWT_ACCESS_TIME }
                );
                redis_client.set(
                  sub,
                  JSON.stringify({ token: jwtd }),
                  "EX",
                  24 * 60 * 60
                );
                res.json({
                  status: true,
                  authorization: jwtd,
                });
              }
            });
          } else {
            res.json({ status: false, error: "Please verify Email" });
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        res.json({ status: false, error: "Password Incorrect" });
      }
    } else {
      res.json({ status: false, error: "Email Not registred" });
    }
  }
});

module.exports = router;
