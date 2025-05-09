const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true // Normalize to lowercase
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);