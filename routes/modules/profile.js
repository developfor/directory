"use strict";

var mongoose = require('mongoose');
var Profile = require('../../models/profile.js');


module.exports = function(app) {
	// app.get('/', function (req, res) {
	//   res.send('Hello World!');
	// });

	app.get('/', function (req, res) {
		console.log("rout")
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

	app.get('/add_profile', function (req, res) {
		console.log("rout")
			res.render('profile/add_profile');
		})

	app.post('/add_profile', function (req, res) {
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
			res.render('profile/profiles', {profiles : profiles});
			// res.send(profiles)
		})
	});

	app.get('/profile/:id', function (req, res) {
		return Profile.findById(req.params.id, function(err, profile){
			if(err){ return console.log("err++: " + err) }
			console.log(profile);
			res.render('profile/profile', {profile : profile});
		})
	});

	app.delete('/profile/:id', function (req, res) {
		console.log("deleted");
		return Profile.remove({_id: req.params.id}, function(err){
			// console.log("err: " + err);
			if(err){ return console.log("err: " + err) }
			console.log("delete");
			res.redirect('/profiles');
		});
	});



	app.get('/profile/:id/update', function (req, res) {
		return Profile.findById(req.params.id, function(err, profile){
			if(err){ return console.log("err: " + err) }
			console.log(profile);
			res.render('profile/profile_update', {profile : profile});
		})
	});

	app.post('/profile/:id/update', function (req, res) {
			
		Profile.findById(req.params.id, function (err, profile) {
			console.log(profile)
			if (err) return handleError(err);

			profile._id = req.params.id
			profile.first_name = req.body.first_name;
			profile.last_name = req.body.last_name;
			profile.description = req.body.description;
			profile.email = req.body.email;

			profile.save(function (err) {
				if (err) return handleError(err);
				res.redirect('/profile/'+req.params.id );
			});
		});


			
	});


}

