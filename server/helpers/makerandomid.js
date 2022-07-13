exports.Randomkey = (length) => {
  const LOWER_POOL = "abcdefghijklmnopqrstuvwxyz";
  const UPPER_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUM_POOL = "0123456789";
  const SPECIAL_POOL = "-.~+^#$!@";
  const CHARS_POOL = `${LOWER_POOL}${UPPER_POOL}${NUM_POOL}${SPECIAL_POOL}`;
  var result = "";
  var charactersLength = CHARS_POOL.length;
  for (var i = 0; i < length; i++) {
    result += CHARS_POOL.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
