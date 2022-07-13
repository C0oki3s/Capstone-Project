const express = require("express");
const User = require("../models/users");
const router = express.Router();

router.get("/", async (req, res) => {
  const data = await User.findById(req.payload.sub);
  const [file_urls] = data?.file_urls;
  if (file_urls == null) {
    return res.json({
      status: false,
      message: "Files not found",
    });
  }
  return res.json({
    file_url: file_urls.url,
    file_name: file_urls.file_name_hash,
  });
});

module.exports = router;
