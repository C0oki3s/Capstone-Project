const express = require("express");
const User = require("../models/users");
const { Randomkey } = require("../helpers/makerandomid");
const AWS = require("aws-sdk");
let s3bucket = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
  region: process.env.AWS_REGION,
});
const multer = require("multer");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype === "text/csv"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: 15082875200,
  fileFilter: fileFilter,
});

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

router.post("/", upload.single("csv_upload"), async (req, res) => {
  let data = await User.findById(req.payload.sub);
  let [files] = data.file_urls;
  if (files?.originalfile_name) {
    if (files.originalfile_name == req.file.originalname) {
      return res.json({
        status: false,
        message: "Filename must be unique",
      });
    }
  } else {
    const random = Randomkey(20);
    var params = {
      Bucket: "creditcardfrauddetectionsystem",
      Key: `${req.payload.sub}_${random}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    s3bucket.upload(params, async (err, result) => {
      if (err) {
        console.log("Error", err);
      } else {
        let filedata = {
          url: result.Location,
          file_name_hash: `${req.payload.sub}_${random}_${req.file.originalname}`,
          originalfile_name: req.file.originalname,
        };
        const updateDb = await User.findByIdAndUpdate(req.payload.sub, {
          file_urls: filedata,
        });
        if (updateDb) {
          res.json({
            status: true,
            message: "File uploaded sucessfully",
          });
        } else {
          res.json({
            status: false,
            message: "File upload failed",
          });
        }
      }
    });
  }
});

module.exports = router;
