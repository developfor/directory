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
var Group = require('../../models/group.js');
var Person = require('../../models/person.js');

module.exports = function(app) {
	// app.get('/', function (req, res) {
	//   res.send('Hello World!');
	// });

	app.all('/hub/:id/add_group', ensureAuthenticated);
	app.all('/hub/:id/groups', ensureAuthenticated);
	// app.all('/group', ensureAuthenticated);
	app.all('/hub/:id/group/*', ensureAuthenticated);


	app.get('/hub/:id/add_group', function (req, res) {
		return Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}
			res.render('group/add_group');
		})
	})

	app.post('/hub/:id/add_group', function (req, res) {
		

		return Hub.find(req.params.id, function(err, hub){
			if(err || hub === null){ 	
				req.flash('info', "Hub not found.")
				res.redirect('/hubs');
				return console.log("err++: " + err) 	
			}


			var group = new Group();

			group.hub_id = req.params.id;
			group.title = req.body.title;
			group.description = req.body.description;

			group.save(function (err, group) {
				if(err || group === null){ 	
					req.flash('info', "Did not save group.")
					res.redirect('/hub/' + req.params.id+ '/add_group');
					return console.log("err++: " + err) 	
				}	
				res.redirect('/hub/' + req.params.id+ '/groups');

			});		
		})	


	})

	app.get('/hub/:id/groups', function (req, res) {
		return Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			// console.log(hub)
			var hubOwner = hub.user_owner_id
			var user = req.user._id
			// console.log(hub.user_owner_id)
			// console.log(req.user._id)
			// console.log(_.isEqual(hub.user_owner_id, req.user._id));

			
			if(_.isEqual(user, hubOwner)){

				Group.find({hub_id: hub.id}, function(err, groups){
					if(err){ return console.log("err: " + err) }
					// console.log(groups);
					res.render('group/groups', {hub: hub, groups : groups});
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/hubs');
			}
			
		});
	});

	app.get('/hub/:id/group/:group_id', function (req, res) {
		// return Group.findById(req.params.id, function(err, group){
		// 	if(err || group === null){ 	
		// 		req.flash('info', "Group not found.")
		// 		res.redirect('/groups');
		// 		return console.log("err++: " + err) 	
		// 	}	
		// 	// console.log(group);
		// 	res.render('group/group', {group : group});
		// })

		return Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				return Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function(err, group){
					if(err || group === null){ 	
						req.flash('info', "Group not found.")
						res.redirect('/hub/:id');
						return console.log("err++: " + err) 	
					}
					res.render('group/group', {group : group, hub: hub});
				})


			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}

		});
	});

	app.delete('/group/:id', function (req, res) {

		Group.findById( req.params.id , function(err, group){
			console.log(group);
			if(err || group === null){ 	
				req.flash('info', "Group not found.")
				res.redirect('/groups');
				return console.log("err++: " + err) 	
			}	
			var persons = group.persons
			persons.forEach(function(element){
				Person.findById(element, function(err, entry){
					if(err || entry === null){ 	
						req.flash('info', "Entry not found.")
						res.redirect('/groups');
						return console.log("err++: " + err) 	
					}	
					
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
			group.title = req.body.title;
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

