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
	});

	app.get('/profile/:id/update', function (req, res) {
		return Profile.findById(req.params.id, function(err, profile){
			if(err){ return console.log("err: " + err) }
			console.log(profile);
			res.render('profile_update', {profile : profile});
		})
	});

	app.post('/profile/:id/update', function (req, res) {

		// return Profile.findById(req.params.id, function(err, profile){
		// 	if(err){ return console.log("err: " + err) }

				console.log(req.body);
				// if (req.body.first_name != null) { profile.first_name = req.body.first_name; }
				// if (req.body.last_name != null) { profile.last_name = req.body.last_name; }
				// if (req.body.description != null) { profile.description = req.body.description; }
				// if (req.body.email != null) { profile.email = req.body.email; }
				// profile._id = req.params.id
				// Profile.update(req.params.id, { $set: { first_name: profile.first_name   }}, options, function(){
				//   if (err) return console.error(err);
				//   res.redirect('profile/:id');
				// })

				Profile.findById(req.params.id, function (err, profile) {
					console.log(profile)
				  if (err) return handleError(err);
				  profile._id = req.params.id
				  profile.first_name = req.body.first_name;
				  profile.save(function (err) {
				    if (err) return handleError(err);
				    res.redirect('/profile/'+req.params.id );
				  });
				});


				// profile.save(function (err, profile) {
				//   if (err) return console.error(err);
				//   res.redirect('profile/:id');
				// });		
			// console.log(profile);
			// res.render('profile_update', {profile : profile});
		// })
	});



	// // app.get('/profiles', function (req, res) {
 // //  		// res.send('this is');
	// // });

}

