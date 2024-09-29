const mongoose = require('mongoose');
const validator = require('validator');

// User Schema definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Entered email address not valid!']
  },
  autoEnabled: {
    type: Boolean,
    default: false // Set default to false
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
