const User = require("../models/users");
exports.verify_api = async (req, res, next) => {
  const { apikey, secret } = req.body || req.headers;
  let is_vaild = false;
  if (!apikey || !secret) {
    return res.status(400).json({
      error: {
        message: "Send Apikey and Secret",
      },
    });
  }
  const verify = await User.findById(req.payload.sub);
  const { Keypairs } = verify;
  Keypairs.forEach((element) => {
    is_vaild = element.publickey == apikey && element.privatekey == secret;
  });
  req.is_validkey = is_vaild;
  req.userApi = verify;
  next();
};
