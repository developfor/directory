// var mongoose = require('mongoose');

module.exports = function(app) {
	var passport = require('passport')
	var LocalStrategy = require('passport-local').Strategy
	var bcrypt = require('bcrypt')
	var SALT_WORK_FACTOR = 10;


	var User = require('../models/user.js');

	// Bcrypt middleware
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function (err, user) {
	    done(err, user);
	  });
	});

	passport.use(new LocalStrategy({usernameField: 'email'},function(email, password, done) {
	  console.log("email")
	  User.findOne({ email: email }, function(err, user) {
	    if (err) { return done(err); }
	    if (!user) { return done(null, false, { message: 'Unknown user ' + email }); }
	    user.comparePassword(password, function(err, isMatch) {
	      if (err) return done(err);
	      if(isMatch) {
	        return done(null, user);
	      } else {
	        return done(null, false, { message: 'Invalid password' });
	      }
	    });
	  });
	}));

	var  ensureAuthenticated = function(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	 res.redirect('/login')
	}

}