const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { isEmail, isStrongPassword } = require('validator');

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
    validate: [isEmail, 'Entered email address not valid!']
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
