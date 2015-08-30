"use strict";

var mongoose = require('mongoose');
var Org = require('../../models/org.js');
var Profile = require('../../models/profile.js');

module.exports = function(app) {
	// app.get('/', function (req, res) {
	//   res.send('Hello World!');
	// });


	app.get('/add_org', function (req, res) {
		// console.log("rout") 
			res.render('org/add_org');
		})

	app.post('/add_org', function (req, res) {
			console.log(req.body);
			var org = new Org(req.body);

			org.save(function (err, org) {
				 console.log("message");
			  if (err) return console.error(err);
			  res.redirect('/orgs');

			});		
		})

	app.get('/orgs', function (req, res) {
		return Org.find({}, null, function(err, orgs){
			if(err){ return console.log("err: " + err) }
			console.log(orgs);
			res.render('org/orgs', {orgs : orgs});
		})
	});

	app.get('/org/:id', function (req, res) {
		return Org.findById(req.params.id, function(err, org){
			if(err){ return console.log("err: " + err) }
			console.log(org);
			res.render('org/org', {org : org});
		})
	});

	app.delete('/org/:id', function (req, res) {
		console.log("deleted");
		return Org.remove({_id: req.params.id}, function(err){
			
			if(err){ return console.log("err: " + err) }
			console.log("delete");
			res.redirect('/orgs');
		});
	});



	app.get('/org/:id/update', function (req, res) {
		return Org.findById(req.params.id, function(err, org){
			if(err){ return console.log("err: " + err) }
			console.log(org);
			res.render('org/org_update', {org : org});
		})
	});

	app.post('/org/:id/update', function (req, res) {
			
		Org.findById(req.params.id, function (err, org) {
			console.log(org)
			if (err) return handleError(err);

			org._id = req.params.id;
			org.name = req.body.name;
			org.description = req.body.description;
		

			org.save(function (err) {
				if (err) return handleError(err);
				res.redirect('/org/'+req.params.id );
			});
		});
		
	});


	//**************** ADD PROFILES **********************
	app.get('/org/:id/add_profiles', function (req, res) {
			

		Org.findById(req.params.id, function (err, org) {	


			return Profile.find({}, null, function(err, profiles){
			  if(err){ return console.log("err: " + err) }
				console.log(profiles);
			   res.render('org/add_profiles', {org : org, profiles : profiles});
				// res.send(profiles)
			});


			// console.log(org);
			

		});


	});





	app.post('/org/:id/add_profiles', function (req, res) {

		// var temp = req.body.profile;

		// profileHub.Org.update(
		// 	{profiles: [] }
		// )

		// Org.update(req.params.id, { $unset: { profiles: "" }});


		// Org.update(req.params.id, {profiles : undefined}, function(){
		// 	console.log('undefined');
		// });

		// Org.findByIdAndUpdate(req.params.id,{ $set: { profiles: [] }}, function(err, affected){
  //   		Org.findByIdAndUpdate(req.params.id, {$set: {"profiles": req.body.profile}},
		// 	    {safe: true, upsert: true},
		// 	    function(err, model) {
		// 	        console.log(err);
		// 	        res.redirect('/org/'+req.params.id+'/add_profiles' );
		// 	    }
		// 	);
		// });


		Org.findByIdAndUpdate(req.params.id,{ $set: { profiles: req.body.profile }}, function(err, affected){
    		res.redirect('/org/'+req.params.id+'/add_profiles' );
		});



			// Org.findByIdAndUpdate(req.params.id, {$push: {"profiles": req.body.profile}},
			//     {safe: true, upsert: true},
			//     function(err, model) {
			//         console.log(err);
			//     }
			// );

		

		
		// Org.findById(req.params.id, function (err, org) {
		// 	console.log(org)
		// 	if (err) return handleError(err);

		// 	org._id = req.params.id;
		// 	org.name = req.body.name;
		// 	org.description = req.body.description;
		

		// 	org.save(function (err) {
		// 		if (err) return handleError(err);
		// 		res.redirect('/org/'+req.params.id );
		// 	});
		// });



		console.log(req.body)
		// res.redirect('/org/'+req.params.id+'/add_profiles' );
	});



}

