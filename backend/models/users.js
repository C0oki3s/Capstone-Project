const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    min: 6,
    max: 32,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: String,
    default: null,
  },
  Keypairs: {
    type: Array,
  },
  location: {
    type: String,
    trim: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: Number,
    trim: true,
  },
  file_urls: {
    type: Array,
    trim: true,
  },
  is_done: {
    type: Array,
    trim: true,
  },
});

const mongooseSchema = mongoose.model("users", UserSchema);
module.exports = mongooseSchema;
