const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const sender = require("../controller/mail");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const client = redis.createClient();
const router = express.Router();

router.post("/", (req, res) => {
  let body = [];
  body.push(req.body);
  body.map(
    async ({
      username = "",
      password = "",
      email = "",
      location = "",
      dob = "",
      phone = "",
    }) => {
      if (username == "") {
        return res.status(400).json({
          error: {
            username: "username is required",
          },
        });
      } else if (password == "") {
        return res.status(400).json({
          error: {
            status: false,
            password: "password is required",
          },
        });
      } else if (email == "") {
        return res.status(400).json({
          status: false,
          error: {
            email: "email is required",
          },
        });
      } else if (location == "") {
        return res.status(400).json({
          status: false,
          error: {
            location: "location is required",
          },
        });
      } else if (dob == "") {
        return res.status(400).json({
          status: false,
          error: {
            dob: "Date of birth is required",
          },
        });
      } else if (phone == "") {
        return res.status(400).json({
          status: false,
          error: {
            phone: "phone number is required",
          },
        });
      } else {
        const retrive_data = await User.findOne({ email: body[0].email });
        if (retrive_data) {
          return res.json({
            error: {
              status: false,
              email: "Email Already Exists",
            },
          });
        } else {
          var salt = bcrypt.genSaltSync(7);
          let salted = await bcrypt.hash(body[0].password, salt);
          const insertdata = new User({
            username: body[0].username,
            password: salted,
            email: body[0].email,
            dob: body[0].dob,
            location: body[0].location,
            phone: body[0].phone,
          });
          let jwt_data = jwt.sign(
            {
              username: body[0].username,
              server: "real-time-credit-card-faurd",
              email: body[0].email,
            },
            process.env.JWT_SECRET
          );

          client.hset(jwt_data, "email", body[0].email, async (err, result) => {
            var data = {
              templateName: "email_confirm",
              sender: process.env.EMAIL,
              receiver: body[0].email,
              user_name: body[0].username,
              verify_account: `http://localhost:5000/signup?verify=${jwt_data}`,
            };
            sender(data)
              .then((data) => {
                if (data) {
                  insertdata.save((err, data) => {
                    if (err) {
                      return res.status(400).json({
                        error: err,
                      });
                    } else {
                      res.status(201).json({
                        status: true,
                        message: "Email has sent check your mail and spam",
                      });
                    }
                  });
                } else {
                  res.status(400).json({
                    status: false,
                    error: "Error while sending Email Try again",
                  });
                }
              })
              .catch((err) => {
                res.status(400).json({
                  status: false,
                  error: "Error while sending Email Try again",
                });
              });
          });
        }
      }
    }
  );
});

router.get("/", (req, res) => {
  let { verify } = req.query;
  client.hexists(verify, "email", (err, isExits) => {
    if (err) throw err;
    if (isExits) {
      jwt.verify(verify, process.env.JWT_SECRET, async (err, results) => {
        if (err) throw err;
        try {
          const Find_data = await User.findOne({
            email: results.email,
          });
          if (Find_data?.isVerified) {
            return res.json({
              status: true,
              message: "Email already verified",
            });
          }
          const new_data = User.findOneAndUpdate(
            { email: results.email },
            { is_verified: true },
            (err, results) => {
              if (err) {
                return res.json({
                  status: false,
                  error: "Error updating",
                });
              }
              res.json({ status: true, error: "Email successfully verified" });
            }
          );
        } catch (error) {
          console.log(error);
        }
      });
    } else {
      res.json({ status: false, error: "Error" });
    }
  });
});
module.exports = router;
