const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  device: String,
  otp: String
});

module.exports = mongoose.model("User", UserSchema);
