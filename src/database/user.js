const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nationalId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
