const express = require("express");
const User = require("../models/users");
const router = express.Router();

router.get("/", async (req, res) => {
  const user_data = await User.findById(req.payload.sub);
  if (user_data == null) {
    return res.status(500).json({
      status: false,
      error: "JWT Expired",
    });
  }
  res.json({
    username: user_data.username,
    email: user_data.email,
    dob: user_data.dob,
    location: user_data.location,
    phone: user_data.phone,
  });
});

module.exports = router;
