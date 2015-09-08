"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');

var Group = require('../../models/group.js');
var Person = require('../../models/person.js');

module.exports = function(app) {
	// app.get('/', function (req, res) {
	//   res.send('Hello World!');
	// });


	app.get('/add_group', function (req, res) {
		// console.log("rout") 
			res.render('group/add_group');
		})

	app.post('/add_group', function (req, res) {
			// console.log(req.body);
			var group = new Group(req.body);

			group.save(function (err, group) {
				 // console.log("message");
			  if (err) return console.error(err);
			  res.redirect('/groups');

			});		
		})

	app.get('/groups', function (req, res) {
		return Group.find({}, null, function(err, groups){
			if(err){ return console.log("err: " + err) }
			// console.log(groups);
			res.render('group/groups', {groups : groups});
		})
	});

	app.get('/group/:id', function (req, res) {
		return Group.findById(req.params.id, function(err, group){
			if(err){ return console.log("err: " + err) }
			// console.log(group);
			res.render('group/group', {group : group});
		})
	});

	app.delete('/group/:id', function (req, res) {

		Group.findById( req.params.id , function(err, group){
			console.log(group);
			var persons = group.persons
			persons.forEach(function(element){
				Person.findById(element, function(err, entry){
					
				    var result = _.without(entry.group, req.params.id);
				    console.log("---------> " + result );
				    Person.findByIdAndUpdate(element, { $set: {group: result}}, function(err, entryNext){
						
					})
				})
			})


			Group.remove({_id: req.params.id}, function(err){	
			// 	if(err){ return console.log("err: " + err) }

			res.redirect('/groups');
			});

		})
	
	});



	app.get('/group/:id/update', function (req, res) {
		return Group.findById(req.params.id, function(err, group){
			if(err){ return console.log("err: " + err) }
			// console.log(group);
			res.render('group/group_update', {group : group});
		})
	});

	app.post('/group/:id/update', function (req, res) {
			
		Group.findById(req.params.id, function (err, group) {
			// console.log(group)
			if (err) return handleError(err);

			group._id = req.params.id;
			group.name = req.body.name;
			group.description = req.body.description;
		

			group.save(function (err) {
				if (err) return handleError(err);
				res.redirect('/group/'+req.params.id );
			});
		});
		
	});


	//**************** ADD PERSONS **********************
	app.get('/group/:id/add_persons', function (req, res) {
			

		Group.findById(req.params.id, function (err, group) {	


			return Person.find({}, null, function(err, persons){
			  if(err){ return console.log("err: " + err) }
				// console.log(persons);
			   res.render('group/add_persons', {group : group, persons : persons});
				// res.send(persons)
			});


			// console.log(group);
			

		});


	});

	function personAdd(req,res,next){
		var person = req.body.person;

		if(person === undefined){
			person = [];
		}

		if(person.constructor !== Array && person.constructor !== undefined){
			person = [req.body.person];
		}



		Group.findById(req.params.id, function(err, originA){
		    if(err){ return console.log("err: " + err) }

			var originA = originA;
			console.log("originA " + originA.persons);
			
			Group.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){
				if(err){ return console.log("err: " + err) }

					var affected = affected;

				Group.findById(req.params.id, function(err, originB){
					console.log("originB " + originB.persons);

					var removeArray = _.difference(originA.persons, originB.persons);
					// console.log(removeArray);
					removeArray.forEach(function(element){
						// console.log("element: " +element)
						Person.findById(element, function(err, entry){
							console.log(entry.group)
							var result = _.without(entry.group, req.params.id);
							console.log(result)

							if(result === undefined){
								result = [];
							}
							if(result.constructor !== Array && result.constructor !== undefined){
								result = [result];
							}

							Person.findByIdAndUpdate(element, { $set: {group: result}}, function(err, entryNext){
						
							})

						})

					})

					
				})


				person.forEach(function(entry){
					


					Person.findByIdAndUpdate(entry, { $addToSet: {group: req.params.id}}, function(err, entry){
						
					})
				});//end of for each
	    		res.redirect('/group/'+req.params.id+'/add_persons' );
			});	

		})
		next();
	}

	app.post('/group/:id/add_persons',[personAdd], function (req, res) {

		// res.redirect('/group/'+req.params.id+'/add_persons' );

		// var person = req.body.person;

		// if(person === undefined){
		// 	person = [];
		// }

		// if(person.constructor !== Array && person.constructor !== undefined){
		// 	person = [req.body.person];
		// }

		// Group.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){

		// 	person.forEach(function(entry){
		// 		Person.findByIdAndUpdate(entry, { $push: {group: req.params.id}}, function(err, entry){
					
		// 		})
		// 	});//end of for each
  //   		// res.redirect('/group/'+req.params.id+'/add_persons' );
		// });
	});


}

