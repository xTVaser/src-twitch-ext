const jwt = require("jsonwebtoken");
require("dotenv").config();

var tokenPayload = {
  user_id: process.env.TWITCH_EXT_ID,
  role: "external",
};
const token = jwt.sign(
  tokenPayload,
  Buffer.from(process.env.TWITCH_SECRET, "base64"),
  { expiresIn: "1d" },
);
console.log("Bearer " + token);
