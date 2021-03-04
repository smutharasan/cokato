// require mongoose and setup the Schema
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const Schema = mongoose.Schema;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the user schema
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  user_password: {
    type: String,
    required: true,
  },
  user_name_user: {
    type: String,
    required: true,
    unique: true,
  },
  user_name_fist: {
    type: String,
    required: true,
  },
  user_name_last: String,
  user_name_phone: String,
  user_created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  user_visit_last: {
    type: Date,
    default: Date.now,
    required: true,
  },
  following: [{ user: { type: Schema.ObjectId, ref: "User" } }],
  followers: [{ user: { type: Schema.ObjectId, ref: "User" } }],
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Users", UserSchema);
