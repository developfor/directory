"use strict";
var  ensureAuthenticated = function(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	 res.redirect('/login');
  	}
  	
var nocache = function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}




var mongoose = require('mongoose');
var _ = require('underscore');

var User = require('../../models/user.js');
var Hub = require('../../models/hub.js');
var Person = require('../../models/person.js');
var Group = require('../../models/group.js');
var Event = require('../../models/event.js');

module.exports = function(app) {

	app.all('/hub', ensureAuthenticated, nocache);
	app.all('/hub/*', ensureAuthenticated, nocache);




	app.all('/@', ensureAuthenticated, nocache);
	app.all('/@/*', ensureAuthenticated, nocache);



	// app.all('/hubs', ensureAuthenticated, nocache);

	// app.get('/hubs', function (req, res) {
	// 		return Hub.find({user_owner_id: req.user._id}, null, function(err, hubs){
	// 			if(err){ return console.log("err: " + err) }
	// 			// console.log(hubs);
	// 			res.render('hub/hubs', {hubs: hubs});
	// 		});
	// });

	// app.get('/hub/create', function (req, res) {
	// 	return Hub.find({user_owner_id: req.user._id}, null, function(err, hubs){
	// 		if(hubs.length > 2){
	// 			console.log("too many hubs")
	// 		}
	// 		res.render('hub/hub_create');
	// 	});
	// });

	// app.post('/hub/create', function (req, res) {
	// 	console.log( req.user);
	// 	// console.log( req.body.title);
	// 	var hub = new Hub();
	// 	// hub.title = req.body.title
	// 	hub.description = req.body.description
	// 	hub.user_owner_id = req.user._id

	// 	hub.save(function (err, person) {
	// 	  if (err) return console.error(err);
	// 	  res.redirect('/hubs');
	// 	});	
	// });

	// app.get('/short/:id', function (req, res) {
	// 	Hub.findOne({ 'short_id': req.params.id }, function(err, hub){
	// 		console.log(hub)
	// 	    res.redirect('/');
	// 	})
			
	// });



	// @ routing
	app.get('/@', function (req, res) {
		res.redirect('/');		
	});


	app.get('/hub', function (req, res) {
		res.redirect('/');		
	});
	app.get('/hubs', function (req, res) {
		res.redirect('/');		
	});




// @ test begin
	app.get('/@/:user', function (req, res) {
		// console.log(req.params.id)

			var userLowerCase = req.params.user.toLowerCase();

			User.findOne({username: userLowerCase}, function(err, user) {
				
				

				if(err  || user === null){ 
					res.send('no user by that name');
					return console.log("err: " + err) 
				}
				Hub.findOne({user_owner_id: user._id}, function(err, hub){
					console.log("user_____________")
					console.log(user)
					console.log("hub_____________")
					console.log(hub)

					if(_.isEqual(user._id, hub.user_owner_id)){
					  	var sort = {sort: {update_date: -1} } 

						Person.find({hub_id: hub.id}, null, sort, function(err, persons){
							Group.find({hub_id: hub.id},  null, sort, function(err, groups){	
								var funct = function(arg){return arg}


								Event.find({hub_id: hub.id}, null, {}, function(err, events){
									return res.render('hub/hub', {funct: funct, user: req.user, hub: hub, persons: persons, groups: groups, events: events});
								  	console.log("equals")
							  	}).limit(5);	
						  	}).limit(5);
						}).limit(5);

		  
					} else {
						console.log("not equals");
						// console.log(req);
					  return res.redirect('/');
					}

				})



				
			})


			// return Hub.findById(req.params.user, function(err, hub){
			// 	if(err  || hub === null){ 
			// 		res.redirect('/');
			// 		return console.log("err: " + err) 
			// 	}

			// 	var hubOnwer = hub.user_owner_id 
			// 	var user = req.user._id

			// 	// console.log(hub.user_owner_id)
			// 	// console.log(req.user._id)
			// 	// console.log(_.isEqual(hub.user_owner_id, req.user._id));

				
			// 	if(_.isEqual(user, hubOnwer)){
			// 		var sort = {sort: {update_date: -1} } 

			// 		Person.find({hub_id: hub.id}, null, sort, function(err, persons){
			// 			Group.find({hub_id: hub.id},  null, {}, function(err, groups){	
			// 				Event.find({hub_id: hub.id}, null, {}, function(err, events){
			// 					return res.render('hub/hub', {user: req.user, hub: hub, persons: persons, groups: groups, events: events});
			// 				  	console.log("equals")
			// 			  	}).limit(5);	
			// 		  	}).limit(5);
			// 		}).limit(5);

		  
			// 	} else {
			// 		console.log("not equals");
			// 		// console.log(req);
			// 	  return res.redirect('/hubs');
			// 	}
			
			// });
	});

	// @ test





	app.get('/hub/:id', function (req, res) {
		// console.log(req.params.id)


			return Hub.findById(req.params.id, function(err, hub){
				if(err  || hub === null){ 
					res.redirect('/hubs');
					return console.log("err: " + err) 
				}

				var hubOnwer = hub.user_owner_id 
				var user = req.user._id

				// console.log(hub.user_owner_id)
				// console.log(req.user._id)
				// console.log(_.isEqual(hub.user_owner_id, req.user._id));

				
				if(_.isEqual(user, hubOnwer)){
					var sort = {sort: {update_date: -1} } 

					Person.find({hub_id: hub.id}, null, sort, function(err, persons){
						Group.find({hub_id: hub.id},  null, {}, function(err, groups){	
							Event.find({hub_id: hub.id}, null, {}, function(err, events){
								return res.render('hub/hub', {user: req.user, hub: hub, persons: persons, groups: groups, events: events});
							  	console.log("equals")
						  	}).limit(5);	
					  	}).limit(5);
					}).limit(5);

		  
				} else {
					console.log("not equals");
					// console.log(req);
				  return res.redirect('/hubs');
				}
			
			});
	});

	// app.get('/hub/:id/update', function (req, res) {
	// 		res.render('hub/hub_update');
	// });


	app.get('/hub/:id/update', function (req, res) {
		return Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			console.log(hub)
			var hubOnwer = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOnwer)){
				return res.render('hub/hub_update', {hub: hub});
	  
			} else {
				console.log("not equals");

			  return res.redirect('/hubs');
			}
		
		});
	});

	app.post('/hub/:id/update', function (req, res) {

		return Hub.findById(req.params.id, function(err, hub){
					if(err){ 
						res.redirect('/hubs');
						return console.log("err: " + err) 
					}

					var hubOwner = hub.user_owner_id
					var user = req.user._id

					if(_.isEqual(user, hubOwner)){
					
						hub.title = req.body.title;
						hub.description = req.body.description;

						hub.save(function (err) {
							if (err) {
								res.redirect('/hub/'+ req.params.id +'/update' );
								return console.log(err); 
							}
							res.redirect('/hub/' + req.params.id);
						});
	  
					} else {
						console.log("not equals");
					  	return res.redirect('/hubs');
					}	
		});

	});

	// app.delete('/hub/:id',  function (req, res) {
	// 	return Hub.findById(req.params.id, function(err, hub){
	// 		if(err){ 
	// 			res.redirect('/hubs');
	// 			return console.log("err: " + err) 
	// 		}

	// 		var hubOwner = hub.user_owner_id
	// 		var user = req.user._id

	// 		if(_.isEqual(user, hubOwner)){

	// 			// return Person.remove({_id: req.params.id}, function(err){
	// 			// 	// console.log("err: " + err);
	// 			// 	if(err){ 	
	// 			// 		req.flash('info', "Person not found.")
	// 			// 		res.redirect('/persons');
	// 			// 		return console.log("err++: " + err) 	
	// 			// 	}			
	// 			// 	console.log("delete");
	// 			// 	res.redirect('/persons');
	// 			// });

	// 			hub.remove(function (err) {
	// 				if (err) {
	// 					res.redirect('/hub/'+ req.params.id +'/update' );
	// 					return console.log(err); 
	// 				}
	// 				res.redirect('/hub/' + req.params.id);
	// 			});

	// 			// return Person.remove({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
	// 			// 	if(err || person === null){ 	
	// 			// 		req.flash('info', "Person not found.")
	// 			// 		res.redirect('/hub/:id');
	// 			// 		return console.log("err++: " + err) 	
	// 			// 	}
	// 			// 	console.log(person);
	// 			// 	return res.redirect('/hub/'+ hub.id + '/persons' );

	// 			// 	// res.render('person/person', {person : person});
	// 			// })

	  
	// 		} else {
	// 			console.log("not equals");
	// 			// console.log(req);
	// 		  return res.redirect('/hubs');
	// 		}
			
	// 	});



		
	// });


}