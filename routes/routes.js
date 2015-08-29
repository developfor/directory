"use strict";

var mongoose = require('mongoose');
var Profile = require('../models/profile.js');


module.exports = function(app) {

	app.get('/', function (req, res) {
			res.render('index');
		})

	app.post('/', function (req, res) {
			console.log(req.body);
			var profile = new Profile(req.body);

			profile.save(function (err, profile) {
			  if (err) return console.error(err);
			  res.redirect('profiles');
			});		
		})




	app.get('/profiles', function (req, res) {
		return Profile.find({}, null, function(err, profiles){
			if(err){ return console.log("err: " + err) }
			console.log(profiles);
			res.render('profiles', {profiles : profiles});
			// res.send(profiles)
		})
	});

	app.get('/profile/:id', function (req, res) {
		return Profile.findById(req.params.id, function(err, profile){
			if(err){ return console.log("err: " + err) }
			console.log(profile);
			res.render('profile', {profile : profile});
		})
	});

	app.get('/profile/:id/delete', function (req, res) {
		console.log("delete");
		return Profile.remove({_id: req.params.id}, function(err){
			// console.log("err: " + err);
			if(err){ return console.log("err: " + err) }
			console.log("delete");
			res.redirect('/profiles');
		});


		// .findById(req.params.id).exec(function(err, profile){
		// 	// profile.remove()
		// 	console.log("err: " + err);
		// 	console.log(profile);
		// 	res.redirect('/profiles');
		// })
		// return Profile.findOne({_id: req.params.id}, null, function(err, profile){
		// 	console.log("err: " + err);
		// 	console.log("delete");
		// 	res.render('profile', {profile : profile});
		// })
	});


	// // app.get('/profiles', function (req, res) {
 // //  		// res.send('this is');
	// // });

}

