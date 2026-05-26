const mongoose = require("mongoose");
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");

const signupSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    required: true,
  },
});

signupSchema.plugin(passportLocalMongoose, {
  usernameField: "email", //this is the field that defines the username
});
module.exports = mongoose.model("Signup", signupSchema);
