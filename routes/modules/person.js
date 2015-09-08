"use strict";

var mongoose = require('mongoose');
var Person = require('../../models/person.js');


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
			var person = new Person(req.body);

			person.save(function (err, person) {
			  if (err) return console.error(err);
			  res.redirect('persons');
			});		
		})

	app.get('/add_person', function (req, res) {
		console.log("rout")
			res.render('person/add_person');
		})

	app.post('/add_person', function (req, res) {
			console.log(req.body);
			var person = new Person(req.body);

			person.save(function (err, person) {
			  if (err) return console.error(err);
			  res.redirect('persons');
			});		
		})

	app.get('/persons', function (req, res) {
		return Person.find({}, null, function(err, persons){
			if(err){ return console.log("err: " + err) }
			console.log(persons);
			res.render('person/persons', {persons : persons});
			// res.send(persons)
		})
	});

	app.get('/person/:id', function (req, res) {
		return Person.findById(req.params.id, function(err, person){
			if(err){ return console.log("err++: " + err) }
			console.log(person);
			res.render('person/person', {person : person});
		})
	});

	app.delete('/person/:id', function (req, res) {
		console.log("deleted");
		return Person.remove({_id: req.params.id}, function(err){
			// console.log("err: " + err);
			if(err){ return console.log("err: " + err) }
			console.log("delete");
			res.redirect('/persons');
		});
	});



	app.get('/person/:id/update', function (req, res) {
		return Person.findById(req.params.id, function(err, person){
			if(err){ return console.log("err: " + err) }
			console.log(person);
			res.render('person/person_update', {person : person});
		})
	});

	app.post('/person/:id/update', function (req, res) {
			
		Person.findById(req.params.id, function (err, person) {
			console.log(person)
			if (err) return handleError(err);

			person._id = req.params.id
			person.first_name = req.body.first_name;
			person.last_name = req.body.last_name;
			person.description = req.body.description;
			person.email = req.body.email;

			person.save(function (err) {
				if (err) return handleError(err);
				res.redirect('/person/'+req.params.id );
			});
		});


			
	});


}

