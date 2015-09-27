'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  displayname: { 
  	type: String, 
  	required: true
  },
  email: { 
  	type: String, 
  	required: true, 
  	unique: true 
  },
  password: { 
  	type: String, 
  	required: true
  },
  resetPasswordToken: { 
  	type: String
  },
  resetPasswordExpires: {
  	type: Date
  }
});

module.exports = mongoose.model('User', User);