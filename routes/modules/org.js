"use strict";

var mongoose = require('mongoose');
var Org = require('../../models/org.js');


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
			  res.redirect('org/orgs');

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

			org._id = req.params.id
			org.name = req.body.name;
			org.description = req.body.description;
		

			org.save(function (err) {
				if (err) return handleError(err);
				res.redirect('/org/'+req.params.id );
			});
		});


			
	});


}

