"use strict";
var secret_key = require('../../config/secret.js');
var passport = require('../../config/passport.js');


var mongoose = require('mongoose');
var _ = require('underscore');

var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

var Hub = require('../../models/hub.js');
var Event = require('../../models/event.js');
var Person = require('../../models/person.js');

var PersonEventJoin = require('../../models/person_event_join.js');


var  ensureAuthenticated = function(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		res.redirect('/login')
  	}
var nocache = function (req, res, next) {
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.header('Expires', '-1');
		res.header('Pragma', 'no-cache');
		next();
	}

module.exports = function(app) {

	var eventController = require('./../../controllers/event.js')(null, app)
	// app.get('/', function (req, res) {
	//   res.send('Hello World!');
	// });

	app.all('/hub/:id/add_event', ensureAuthenticated);
	app.all('/hub/:id/events', ensureAuthenticated);
	app.all('/event', ensureAuthenticated);
	app.all('/hub/:id/event/*', ensureAuthenticated);

	app.all('/@', ensureAuthenticated, nocache);
	app.all('/@/*', ensureAuthenticated, nocache);


	// app.get('/@/:id/add_event', function (req, res) {
	// 	return Hub.findById(req.params.id, function(err, hub){
	// 		if(err){ 
	// 			res.redirect('/hubs');
	// 			return console.log("err: " + err) 
	// 		}
	// 		res.render('event/add_event');
	// 	})
	// })







	app.get('/@/:id/add_event', csrfProtection, eventController.addEvent)








	// app.post('/@/:id/add_group', upload.single('image'), csrfProtection, groupController.addGroupPost)



	app.post('/@/:id/add_event', csrfProtection, eventController.addEventPost)

	app.get('/hub/:id/events', function (req, res) {
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

				Event.find({hub_id: hub.id}, function(err, events){
					if(err){ return console.log("err: " + err) }
					// console.log(events);
					res.render('event/events', {hub: hub, events : events});
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/hubs');
			}
			
		});
	});




	app.get('/@/:id/event/:event_id',  eventController.event);






	app.delete('/hub/:id/event/:event_id', function (req, res) {

		Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				Event.findById( req.params.event_id , function(err, event){
					console.log(event);

					if(err || event === null){ 	
						req.flash('info', "Event not found.")
						res.redirect('/hub/' + req.params.id+ '/events');
						return console.log("err++: " + err) 	
					}	

					var persons = event.persons
					persons.forEach(function(element){
						Person.findById(element, function(err, entry){
							if(err || entry === null){ 	
									req.flash('info', "Entry not found.")
									res.redirect('/hub/' + req.params.id+ '/events');
									return console.log("err++: " + err) 	
								}	

								var result = _.without(entry.event, req.params.event_id);
								console.log("---------> " + result );
								Person.findByIdAndUpdate(element, { $set: {event: result}}, function(err, entryNext){

								})
							})
						})

						Event.remove({_id: req.params.event_id, hub_id: hub.id}, function(err){	
					// 	if(err){ return console.log("err: " + err) }

						res.redirect('/hub/' + req.params.id);
					});

				})

			} else {
				console.log("not equals");
				// console.log(req);
				// return res.redirect('/hubs');
				res.send('404: Page not Found', 404);
			}

		});
	
	});


	// todo
	app.get('/hub/:id/event/:event_id/update', function (req, res) {
		return Event.findById(req.params.event_id, function(err, event){
			if(err){ return console.log("err: " + err) }
			// console.log(event);
			res.render('event/event_update', {event : event});
		})
	});
	// todo end

	app.post('/hub/:id/event/:event_id/update', function (req, res) {

		Hub.findById(req.params.id, function(err, hub){
			console.log("update event")
			console.log(hub)
			if(err || hub === null){ 
			// if(err ){ 		
				req.flash('info', "Hub not found.")
				res.redirect('/hubs');
				return console.log("err++: " + err) 	
			}


			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){


				var event = new Event();
				console.log(req.params.id)
				event.hub_id = req.params.id;

				// Event.findOne({_id: req.params.event_id, hub_id: hub.id}, function (err, person) {
				// 	console.log(event)
				// 	if(err || event === null){ 	
				// 		req.flash('info', "Person not found.")
				// 		res.redirect('/hub/:id/persons');
				// 		return console.log("err++: " + err) 	
				// 	}	
				// 	event._id = req.params.person_id
				// 	event.first_name = req.body.first_name;
				// 	event.last_name = req.body.last_name;
				// 	event.description = req.body.description;
				// 	event.email = req.body.email;

				// 	event.save(function (err) {
				// 		if (err) return console.log(err);
				// 		res.redirect('/hub/' + req.params.id + "/event/" +  req.params.person_id);
				// 	});
				// });
				Event.findOne({_id: req.params.event_id, hub_id: event.hub_id}, function (err, event) {
					// console.log(event)
					if (err) return handleError(err);

					// event._id = req.params.id;
					event.title = req.body.title;
					event.description = req.body.description;
				

					event.save(function (err) {
						if (err) return handleError(err);
						res.redirect('/hub/' + req.params.id+ '/event/'+req.params.event_id );
					});
				});


			} else {
			  console.log("not equals");
			  return res.redirect('/hub/' + req.params.id);
			}
			
		});
					
		// Event.findById(req.params.id, function (err, event) {
		// 	// console.log(event)
		// 	if (err) return handleError(err);

		// 	event._id = req.params.id;
		// 	event.title = req.body.title;
		// 	event.description = req.body.description;
		

		// 	event.save(function (err) {
		// 		if (err) return handleError(err);
		// 		res.redirect('/event/'+req.params.id );
		// 	});
		// });
		
	});


	//**************** ADD PERSONS **********************
	app.get('/hub/:id/event/:event_id/add_persons', function (req, res) {
			
		var event = function(){
			Event.findById(req.params.event_id, function (err, event) {	
				return Person.find({}, null, function(err, persons){
				  if(err){ return console.log("err: " + err) }
					// console.log(persons);
				   res.render('event/add_persons', {event : event, persons : persons});
					// res.send(persons)
				});
				// console.log(event);	

			});
		}


		var hubId = function(method){

			return Hub.find(req.params.id, function(err, hub){
					if(err || hub === null){ 	
						req.flash('info', "Hub not found.")
						res.redirect('/hubs');
						return console.log("err++: " + err) 	
					}
					return method			
				})	
		}

		hubId(event());


	});

	app.post('/hub/:id/event/:event_id/add_persons', function (req, res,  next) {
		   // if(err){ return console.log("err: " + err) }
		    // res.set('Connection', 'close');

		var event_save = function(){

			var person_event_join = new Person_event_join();

			person_event_join.hub_id = mongoose.Types.ObjectId(req.params.id);
			person_event_join.event_id = mongoose.Types.ObjectId(req.params.event_id);
			person_event_join.person_id = mongoose.Types.ObjectId(req.body.person_id);

			console.dir(person_event_join)

			person_event_join.save(function (err, person_event) {
				if(err || person_event === null){ 	
					req.flash('info', "Did not save event.")
					res.redirect('/hub/' + req.params.id+ '/add_event');
					return console.log("err++: " + err) 	
				}	
				// res.redirect('/hub/' + req.params.id+ '/events');
				console.log("add person <<<<<<<<<<<<<<")
				res.send('Completed add person');

			});	

		}


		var hubId = function(method){

			return Hub.find(req.params.id, function(err, hub){
					if(err || hub === null){ 	
						req.flash('info', "Hub not found.")
						res.redirect('/hubs');
						return console.log("err++: " + err) 	
					}
					return method			
				})	
		}

		hubId(event_save());
		    

		
		// next(); 

	})

	app.delete('/hub/:id/event/:event_id/add_persons', function (req, res,  next) {

		 // Person_event_join.find()
		 //      .and([
		 //          { $and : [ { event_id : req.params.event_id} ] },

		 //          { $and : [ { person_id : req.body.person_id} ] },
		         
		 //          { $and : [ { hub_id : req.params.id} ] }
		 //      ])
		 //      .exec(function (err, results) {
		 //          console.log(results)
			// 	next();
		 //      });
		
		console.log(req.body.person_id)

		Person_event_join.remove( {

			event_id: req.params.event_id,
			hub_id: req.params.id,
			person_id: req.body.person_id,

		    // $and : [

		    // 	{event_id: {$eq: mongoose.Types.ObjectId(req.params.event_id)}},
		    // 	{person_id: {$eq: mongoose.Types.ObjectId(req.body.person_id)}},
		    // 	{hub_id: {$eq: mongoose.Types.ObjectId(req.params.id)}}
		      
		    // ]
		}, function(err, hub){
				console.log(hub)
				res.send('Completed remove person');

		} )

		// return Person_event_join.find({ $and : [{hub_id: req.params.id}, {event_id: req.params.event_id}, {person_id: req.body.person_id}]}, function(err, hub){
		// 		console.log(hub)
		// 		next()
		// 			// if(err || hub === null){ 	
		// 			// 	req.flash('info', "Hub not found.")
		// 			// 	res.redirect('/hubs');
		// 			// 	return console.log("err++: " + err) 	
		// 			// }
		// 			// return method			
		// 	})	

		var event_remove = function(){


			



		// 	var person_event_join = new Person_event_join();

		// 	person_event_join.hub_id = mongoose.Types.ObjectId(req.params.id);
		// 	person_event_join.event_id = mongoose.Types.ObjectId(req.params.event_id);
		// 	person_event_join.person_id = mongoose.Types.ObjectId(req.body.person_id);

		// 	console.dir(person_event_join)



		// 	Person_event_join.remove({hub_id: person_event_join.hub_id, event_id: person_event_join.event_id, person_id: person_event_join.person_id}, function(err){	
		// 			// 	if(err){ return console.log("err: " + err) }
		// 			console.log("remove person <<<<<<<<<<<<<<")
		// 		res.send('Completed remove person');

		// 				// res.redirect('/hub/' + req.params.id);
		// 			});



		// 	person_event_join.remove(function (err, person_event) {
		// 		if(err || event === null){ 	
		// 			req.flash('info', "Did not save event.")
		// 			res.redirect('/hub/' + req.params.id+ '/add_event');
		// 			return console.log("err++: " + err) 	
		// 		}	
		// 		// res.redirect('/hub/' + req.params.id+ '/events');
		// 		// console.log("add person <<<<<<<<<<<<<<")
		// 		// res.send('Completed add person');

		// 	});	

		// }


		// var hubId = function(method){

		// 	return Hub.find(req.params.id, function(err, hub){
		// 			if(err || hub === null){ 	
		// 				req.flash('info', "Hub not found.")
		// 				res.redirect('/hubs');
		// 				return console.log("err++: " + err) 	
		// 			}
		// 			return method			
		// 		})	
		// }

		//  hubId(event_remove());

		//    // if(err){ return console.log("err: " + err) }
		//     res.send('Completed remove person');
		// console.log("remove person <<<<<<<<<<<<<<")
		// // next(); 
		}

	})










	function personAdd(req,res,next){
		var person = req.body.person;

		if(person === undefined){
			person = [];
		}

		if(person.constructor !== Array && person.constructor !== undefined){
			person = [req.body.person];
		}



		Event.findById(req.params.id, function(err, originA){
		    if(err){ return console.log("err: " + err) }

			var originA = originA;
			console.log("originA " + originA.persons);
			
			Event.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){
				if(err){ return console.log("err: " + err) }

					var affected = affected;

				Event.findById(req.params.id, function(err, originB){
					console.log("originB " + originB.persons);

					var removeArray = _.difference(originA.persons, originB.persons);
					// console.log(removeArray);
					removeArray.forEach(function(element){
						// console.log("element: " +element)
						Person.findById(element, function(err, entry){
							console.log(entry.event)
							var result = _.without(entry.event, req.params.id);
							console.log(result)

							if(result === undefined){
								result = [];
							}
							if(result.constructor !== Array && result.constructor !== undefined){
								result = [result];
							}

							Person.findByIdAndUpdate(element, { $set: {event: result}}, function(err, entryNext){
						
							})

						})

					})

					
				})


				person.forEach(function(entry){
					


					Person.findByIdAndUpdate(entry, { $addToSet: {event: req.params.id}}, function(err, entry){
						
					})
				});//end of for each
	    		res.redirect('/event/'+req.params.id+'/add_persons' );
			});	

		})
		next();
	}

	// app.post('/hub/:id/event/:event_id/add_persons', function (req, res) {

	// 	var person_event_join = new Person_event_join();
	// 	person_event_join.event_id = req.params.event_id;
	// 	person_event_join.person_id = req.params.event_id;

	// 	// Instructions: Creating a person_event_join
	// 	// get event_id by just looking at the request params :event_id
	// 	// get person_id by when person check mark it will js request ?person_id=UniqueId_1234 to this add_person under the particular event :event_id
	// 	// save both ids (event_id & person_id) to the person_event_join




	// 	// res.redirect('/event/'+req.params.id+'/add_persons' );

	// 	// var person = req.body.person;

	// 	// if(person === undefined){
	// 	// 	person = [];
	// 	// }

	// 	// if(person.constructor !== Array && person.constructor !== undefined){
	// 	// 	person = [req.body.person];
	// 	// }

	// 	// Event.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){

	// 	// 	person.forEach(function(entry){
	// 	// 		Person.findByIdAndUpdate(entry, { $push: {event: req.params.id}}, function(err, entry){
					
	// 	// 		})
	// 	// 	});//end of for each
 //  //   		// res.redirect('/event/'+req.params.id+'/add_persons' );
	// 	// });
	// });


}

