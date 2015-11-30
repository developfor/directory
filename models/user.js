'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var secret = require('./../config/secret.js');
var crypto= require('crypto')
// var bcrypt = require('bcrypt')
// var SALT_WORK_FACTOR = 10;


var userSchema = new Schema({
  displayname: { 
  	type: String, 
  	required: true
  },
  email: { 
  	type: String, 
  	required: true, 
  	unique: true,
    lowercase: true
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




userSchema.pre('save', function(next) {
  var user = this;

  if(!user.isModified('password')) return next();

  crypto.pbkdf2(user.password, secret.secret, 4096, 64, 'sha256', function(err, key) {
    if(err) return next(err);
    // console.log(secret.secret)
    console.log(key.toString('hex'));  // 'c5e478d...1469e50'
    user.password = key.toString('hex');
    next();
  });

  // bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
  //   if(err) return next(err);

  //   bcrypt.hash(user.password, salt, function(err, hash) {
  //     if(err) return next(err);
  //     user.password = hash;
  //     next();
  //   });
  // });
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  console.log( "candidatePassword: " + candidatePassword)
  console.log("+ " + this.password)
  // console.log("+ " + user.password)
    var userdbPass = this.password;

  crypto.pbkdf2(candidatePassword, secret.secret, 4096, 64, 'sha256', function(err, key) {
    if(err) return cb(err);
    console.log(key.toString('hex') == this.password)
    console.log("+ " + key.toString('hex'))

    if(key.toString('hex') === userdbPass){
      console.log("pass")
      cb(null, true);
      // next();
    }else{
       console.log("fail")
      cb(null, false);

    }

    // console.log(secret.secret)
   //console.log(key.toString('hex'));  // 'c5e478d...1469e50'
   // user.password = key.toString('hex');
    // next();
  });


  // bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
  //   if(err) return cb(err);
  //   cb(null, isMatch);
  // });


  // cb(null, true);
};



var User = mongoose.model('User', userSchema);



module.exports = User;