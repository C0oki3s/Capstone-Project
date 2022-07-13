const express = require("express");
const User = require("../models/users");
const Algorithm = require("../models/Algorithms");
const { execSync } = require("child_process");
const getUserInfo = require("./checkFile");
const router = express();

async function filecheck(userid, file_name, path) {
  let is_true = false;
  const data = await User.findById(userid);
  let [file_urls] = data.file_urls;
  [file_urls].forEach(({ file_name_hash }) => {
    if (file_name != file_name_hash) {
      is_true = false;
    } else {
      is_true = true;
    }
  });
  if (is_true) {
    return `node ${process.env.PATH} ${userid} ${path} ${file_name}`;
  } else {
    return false;
  }
}

function execute(script) {
  execSync(script, { stdio: "inherit" });
}

router.post("/xgboost", async (req, res) => {
  const { file_name } = req.body;
  const script_for = await filecheck(
    req.payload.sub,
    file_name,
    req.path.split("/")[1]
  );

  const data = await getUserInfo(req.payload.sub, req.path.split("/")[1]);
  if (data[1]) {
    res.json({
      status: true,
      message: data[0],
    });
  } else {
    res.json({
      status: true,
      message: "we are cooking",
    });
    if (script_for != false) {
      execute(script_for);
    } else {
      res.status(500).json({
        status: false,
        message: "File Doesn't Exits",
      });
    }
  }
});

router.post("/logistic_regression", async (req, res) => {
  const { file_name } = req.body;
  const script_for = await filecheck(
    req.payload.sub,
    file_name,
    req.path.split("/")[1]
  );
  const data = await getUserInfo(req.payload.sub, req.path.split("/")[1]);
  if (data[1]) {
    res.json({
      status: true,
      message: data[0],
    });
  } else {
    res.json({
      status: true,
      message: "we are cooking",
    });
    execute(script_for);
  }
});

router.post("/k_nearest_neighbors", async (req, res) => {
  const { file_name } = req.body;

  const script_for = await filecheck(
    req.payload.sub,
    file_name,
    req.path.split("/")[1]
  );
  const data = await getUserInfo(req.payload.sub, req.path.split("/")[1]);
  if (data[1]) {
    res.json({
      status: true,
      message: data[0],
    });
  } else {
    res.json({
      status: true,
      message: "we are cooking",
    });
    execute(script_for);
  }
});

router.post("/random_forest", async (req, res) => {
  const { file_name } = req.body;
  const script_for = await filecheck(
    req.payload.sub,
    file_name,
    req.path.split("/")[1]
  );
  const data = await getUserInfo(req.payload.sub, req.path.split("/")[1]);
  if (data[1]) {
    res.json({
      status: true,
      message: data[0],
    });
  } else {
    res.json({
      status: true,
      message: "we are cooking",
    });
    execute(script_for);
  }
});

module.exports = router;
