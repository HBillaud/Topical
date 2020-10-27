const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  bio: {
    type: String,
    required: [false, 'Bio is not required'],
    max: 512
  },
  picture: {
    type: String,
    required: [false, 'Picture is not required']
  },
  created: {
    type: Date,
    required: [true, 'Created date is required']
  },
  resetPasswordToken: {
    type: String,
    required: false
  },

  resetPasswordExpires: {
    type: Date,
    required: false
  }
}, {timestamps: true});

userSchema.methods.generatePasswordReset = function() {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

module.exports = mongoose.model('User', userSchema);  // export userSchema