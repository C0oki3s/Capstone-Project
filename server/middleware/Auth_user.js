const jwt = require("jsonwebtoken");
const User = require("../models/users");

exports.Auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(400).json({
      error: {
        error: "Please send Authorization token",
      },
    });
  }
  const token =
    req.headers.authorization || req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    //create type of error
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return next(
          res.status(400).json({
            error: "Unauthorization",
          })
        );
      } else {
        return next(
          res.status(401).json({
            error: err.message,
          })
        );
      }
    }
    req.payload = payload;

    next();
  });
};

exports.cookie_strip = (req, res, next) => {
  if (!req.headers?.cookie) {
    return res.status(400).json({
      error: {
        error: "Please send Authorization token",
      },
    });
  }
  const split_token = req.headers.cookie.split("=")[1];

  jwt.verify(split_token, process.env.JWT_SECRET, (err, payload) => {
    //create type of error
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return next(
          res.status(400).json({
            error: "Unauthorization",
          })
        );
      } else {
        return next(
          res.status(401).json({
            error: err.message,
          })
        );
      }
    }
    req.payload = payload;

    next();
  });
};
