const express = require("express");
const mongoose = require("mongoose");

const { Auth, cookie_strip } = require("./middleware/Auth_user");

require("dotenv").config();
const app = express();
app.use(express.json(), express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/creditcard", (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Connected to MongoDB");
});

const signup = require("./routes/signup");
app.use("/signup", signup);

const login = require("./routes/login");
app.use("/login", login);

const get_user = require("./routes/users");
app.use("/users", Auth, get_user);

const apikey = require("./routes/Api");
app.use("/apikey", Auth, apikey);

const fileupload = require("./routes/fileupload");
app.use("/fileupload", cookie_strip, fileupload);

const getfiles = require("./routes/getfiles");
app.use("/getfiles", Auth, getfiles);

const algorithms = require("./routes/algorithms");
app.use("/algorithm", Auth, algorithms);

const frontend = require("./routes/frontend");
app.use("/frontend", frontend);

app.listen(5000, (err) => {
  if (err) {
    console.log("error", err);
  }
  console.log("http://localhost:5000");
});
