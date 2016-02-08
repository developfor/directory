"use strict";



module.exports = function(app) {
	var passport = require('passport')
	var LocalStrategy = require('passport-local').Strategy
	// var SALT_WORK_FACTOR = 10;
	var flash = require('express-flash');
	app.use(passport.initialize());
    app.use(passport.session());

	// var loggedIn = function(req, res, next) {
	// console.log(req.user)
	//     // if (req.user) {
	//     // 	console.log("logged in")     
	//     // } else {
	//     //     // res.redirect('/login');
	//     //   console.log("not logged in")
	//     // }
	//     next();
	// }

	// app.all('*', loggedIn);

	var  loggedIn = function(req, res, next) {
	 //  if (req.isAuthenticated()) { return next(); }
	 // res.redirect('/login')
	  // if (req.isAuthenticated()) { 
	  // 	console.log("logged in")
	  // }else{
	  // 	console.log("not logged in")
	  // }
	  res.locals.login = req.isAuthenticated()
	  next();
  	}
  	app.all('*', loggedIn);
	

	require('./modules/user.js')(app);
	require('./modules/hub.js')(app);
	require('./modules/person.js')(app);
	require('./modules/group.js')(app);
}