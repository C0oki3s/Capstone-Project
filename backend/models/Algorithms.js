var mongoose = require("mongoose");
var users = require("./users");

var Algorithms = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: users,
  },
  algorithm: {
    type: Array,
    trim: true,
  },
});

const mongooseSchema = mongoose.model("algorithm", Algorithms);
module.exports = mongooseSchema;
