const express = require("express");
const User = require("../models/users");
const { escapeHtml } = require("../helpers/htmlescape");
const { verify_api } = require("../controller/verify-api");
const router = express.Router();

router.post("/", async (req, res) => {
  const { apiname } = req.body;
  const Checkapiname = await User.findById(req.payload.sub);
  let lengthofapis = Checkapiname?.Keypairs.length;
  for (let i = 0; i < lengthofapis; i++) {
    if (Checkapiname.Keypairs[i].apiname == apiname) {
      return res.status(200).json({
        message: "Apiname already taken",
      });
    }
  }

  const safename = escapeHtml(apiname);
  const LOWER_POOL = "abcdefghijklmnopqrstuvwxyz";
  const UPPER_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUM_POOL = "0123456789";
  const SPECIAL_POOL = "-._~+/^&#$!@";
  const { email, sub, iat, keypairs } = req.payload;
  const CHARS_POOL = `${LOWER_POOL}${UPPER_POOL}${NUM_POOL}${SPECIAL_POOL}`;
  const KEY_POOL = `${LOWER_POOL}${NUM_POOL}${UPPER_POOL}${sub}${email}${iat}${SPECIAL_POOL}`;
  function generatekey(length) {
    var result = "";
    var charactersLength = CHARS_POOL.length;
    for (var i = 0; i < length; i++) {
      result += CHARS_POOL.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${result}.fraud_detention`;
  }
  function apikey(length) {
    var result = "";
    var charactersLength = KEY_POOL.length;
    for (var i = 0; i < length; i++) {
      result += KEY_POOL.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${result}`;
  }

  const PublicKey = generatekey(40);
  const APIKEY = apikey(30);

  if (keypairs == 0) {
    const UpdateKeys = await User.findByIdAndUpdate(sub, {
      $set: {
        Keypairs: {
          apiname: safename,
          publickey: "ccfd_" + PublicKey,
          privatekey: APIKEY,
        },
      },
    });
    if (UpdateKeys) {
      res.status(201).json({
        apiname: safename,
        publickey: PublicKey,
        privatekey: APIKEY,
      });
    }
  } else {
    const PushKeys = await User.findByIdAndUpdate(sub, {
      $push: {
        Keypairs: {
          apiname: safename,
          publickey: "ccfd_" + PublicKey,
          privatekey: APIKEY,
        },
      },
    });
    if (PushKeys) {
      res.status(201).json({
        apiname: safename,
        publickey: "ccfd_" + PublicKey,
        privatekey: APIKEY,
      });
    }
  }
});

router.get("/", async (req, res) => {
  const { sub } = req.payload;
  const Getkeys = await User.findById(sub);
  if (Getkeys.Keypairs.length) {
    return res.status(200).json({
      keys: Getkeys.Keypairs,
    });
  }
  return res.status(200).json({
    keys: null,
  });
});
router.delete("/", async (req, res) => {
  const { apiname } = req.body;
  const Checkapiname = await User.findById(req.payload.sub);
  let key_array = Checkapiname.Keypairs;
  key_array.forEach(async (api_name) => {
    if (api_name.apiname == apiname) {
      const Deleteapi = await User.updateOne(
        { apiname: apiname },
        {
          $pull: {
            Keypairs: {
              apiname: apiname,
            },
          },
        },
        { new: true }
      );
      if (Deleteapi.acknowledged) {
        return res.status(201).json({
          status: true,
          message: `ApikeyDeleted`,
        });
      }
    }
  });
  return res.json({
    status: false,
    message: "Key Not Found",
  });
});

router.post("/verify", verify_api, async (req, res) => {
  if (req.is_validkey) {
    return res.json({
      status: true,
      is_working: true,
    });
  }
  return res.json({
    status: true,
    is_working: req.is_validkey,
  });
});

module.exports = router;
