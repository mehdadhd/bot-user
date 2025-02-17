const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  nationalCode: String,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
