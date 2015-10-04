"use strict";
var secret_key = require('../../config/secret.js');
var passport = require('../../config/passport.js');
var  ensureAuthenticated = function(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	 res.redirect('/login')
  	}




var mongoose = require('mongoose');
var _ = require('underscore');


var Hub = require('../../models/hub.js');

// var Hub = require('../../models/hub.js');

module.exports = function(app) {

	app.all('/hub', ensureAuthenticated);
	app.all('/hub/*', ensureAuthenticated);

	app.all('/hubs', ensureAuthenticated);
	

	app.get('/hubs', function (req, res) {
			return Hub.find({user_owner_id: req.user._id}, null, function(err, hubs){
				if(err){ return console.log("err: " + err) }
				// console.log(hubs);
				res.render('hub/hubs', {hubs: hubs});
			})
	})

	app.get('/hub/create', function (req, res) {
			res.render('hub/create');
	})

	app.post('/hub/create', function (req, res) {
		console.log( req.user)
		console.log( req.body.title)
		var hub = new Hub();
		hub.title = req.body.title
		hub.description = req.body.description
		hub.user_owner_id = req.user._id

		hub.save(function (err, person) {
		  if (err) return console.error(err);
		  res.redirect('/hubs');
		});	
	})

	app.get('/hub', function (req, res) {
		res.redirect('/hubs');		
	})

	app.get('/hub/:id', function (req, res) {
		// console.log(req.params.id)


			return Hub.findOne({short_id: req.params.id}, null, function(err, hub){
				var hubOnwer = hub.user_owner_id
				var user = req.user._id
				// console.log(hub.user_owner_id)
				// console.log(req.user._id)
				// console.log(_.isEqual(hub.user_owner_id, req.user._id));

				if(err){ return console.log("err: " + err) }
				if(_.isEqual(user, hubOnwer)){
				  return res.render('hub/hub', {hub: hub});
				  console.log("equals")
				} else {
					console.log("not equals")
					// console.log(req);
				  return res.redirect('/hubs');
				}
			
			})
	})


}