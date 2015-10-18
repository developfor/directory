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

var Person_group_join = require('../../models/person_group_join.js');

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
		

		var group_save = function(){

			var group = new Group();

			group.hub_id = mongoose.Types.ObjectId(req.params.id);
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

		hubId(group_save());













		// return Hub.find(req.params.id, function(err, hub){
		// 	if(err || hub === null){ 	
		// 		req.flash('info', "Hub not found.")
		// 		res.redirect('/hubs');
		// 		return console.log("err++: " + err) 	
		// 	}


		// 	var group = new Group();

		// 	group.hub_id = mongoose.Types.ObjectId(req.params.id);
		// 	group.title = req.body.title;
		// 	group.description = req.body.description;

		// 	group.save(function (err, group) {
		// 		if(err || group === null){ 	
		// 			req.flash('info', "Did not save group.")
		// 			res.redirect('/hub/' + req.params.id+ '/add_group');
		// 			return console.log("err++: " + err) 	
		// 		}	
		// 		res.redirect('/hub/' + req.params.id+ '/groups');

		// 	});		
		// })	


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
						res.redirect('/hub/' + req.params.id);
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

	app.delete('/hub/:id/group/:group_id', function (req, res) {

		Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				Group.findById( req.params.group_id , function(err, group){
					console.log(group);

					if(err || group === null){ 	
						req.flash('info', "Group not found.")
						res.redirect('/hub/' + req.params.id+ '/groups');
						return console.log("err++: " + err) 	
					}	

					var persons = group.persons
					persons.forEach(function(element){
						Person.findById(element, function(err, entry){
							if(err || entry === null){ 	
									req.flash('info', "Entry not found.")
									res.redirect('/hub/' + req.params.id+ '/groups');
									return console.log("err++: " + err) 	
								}	

								var result = _.without(entry.group, req.params.group_id);
								console.log("---------> " + result );
								Person.findByIdAndUpdate(element, { $set: {group: result}}, function(err, entryNext){

								})
							})
						})

						Group.remove({_id: req.params.group_id, hub_id: hub.id}, function(err){	
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
	app.get('/hub/:id/group/:group_id/update', function (req, res) {
		return Group.findById(req.params.group_id, function(err, group){
			if(err){ return console.log("err: " + err) }
			// console.log(group);
			res.render('group/group_update', {group : group});
		})
	});
	// todo end

	app.post('/hub/:id/group/:group_id/update', function (req, res) {

		Hub.findById(req.params.id, function(err, hub){
			console.log("update group")
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


				var group = new Group();
				console.log(req.params.id)
				group.hub_id = req.params.id;

				// Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function (err, person) {
				// 	console.log(group)
				// 	if(err || group === null){ 	
				// 		req.flash('info', "Person not found.")
				// 		res.redirect('/hub/:id/persons');
				// 		return console.log("err++: " + err) 	
				// 	}	
				// 	group._id = req.params.person_id
				// 	group.first_name = req.body.first_name;
				// 	group.last_name = req.body.last_name;
				// 	group.description = req.body.description;
				// 	group.email = req.body.email;

				// 	group.save(function (err) {
				// 		if (err) return console.log(err);
				// 		res.redirect('/hub/' + req.params.id + "/group/" +  req.params.person_id);
				// 	});
				// });
				Group.findOne({_id: req.params.group_id, hub_id: group.hub_id}, function (err, group) {
					// console.log(group)
					if (err) return handleError(err);

					// group._id = req.params.id;
					group.title = req.body.title;
					group.description = req.body.description;
				

					group.save(function (err) {
						if (err) return handleError(err);
						res.redirect('/hub/' + req.params.id+ '/group/'+req.params.group_id );
					});
				});


			} else {
			  console.log("not equals");
			  return res.redirect('/hub/' + req.params.id);
			}
			
		});
					
		// Group.findById(req.params.id, function (err, group) {
		// 	// console.log(group)
		// 	if (err) return handleError(err);

		// 	group._id = req.params.id;
		// 	group.title = req.body.title;
		// 	group.description = req.body.description;
		

		// 	group.save(function (err) {
		// 		if (err) return handleError(err);
		// 		res.redirect('/group/'+req.params.id );
		// 	});
		// });
		
	});


	//**************** ADD PERSONS **********************
	app.get('/hub/:id/group/:group_id/add_persons', function (req, res) {
			
		var group = function(){
			Group.findById(req.params.group_id, function (err, group) {	
				return Person.find({}, null, function(err, persons){
				  if(err){ return console.log("err: " + err) }
					// console.log(persons);
				   res.render('group/add_persons', {group : group, persons : persons});
					// res.send(persons)
				});
				// console.log(group);	

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

		hubId(group());


	});

	app.post('/hub/:id/group/:group_id/add_persons', function (req, res,  next) {
		   // if(err){ return console.log("err: " + err) }
		    // res.set('Connection', 'close');

		var group_save = function(){

			var person_group_join = new Person_group_join();

			person_group_join.hub_id = mongoose.Types.ObjectId(req.params.id);
			person_group_join.group_id = mongoose.Types.ObjectId(req.params.group_id);
			person_group_join.person_id = mongoose.Types.ObjectId(req.body.person_id);

			console.dir(person_group_join)

			person_group_join.save(function (err, person_group) {
				if(err || person_group === null){ 	
					req.flash('info', "Did not save group.")
					res.redirect('/hub/' + req.params.id+ '/add_group');
					return console.log("err++: " + err) 	
				}	
				// res.redirect('/hub/' + req.params.id+ '/groups');
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

		hubId(group_save());
		    

		
		// next(); 

	})

	app.delete('/hub/:id/group/:group_id/add_persons', function (req, res,  next) {

		 // Person_group_join.find()
		 //      .and([
		 //          { $and : [ { group_id : req.params.group_id} ] },

		 //          { $and : [ { person_id : req.body.person_id} ] },
		         
		 //          { $and : [ { hub_id : req.params.id} ] }
		 //      ])
		 //      .exec(function (err, results) {
		 //          console.log(results)
			// 	next();
		 //      });
		
		console.log(req.body.person_id)

		Person_group_join.remove( {

			group_id: req.params.group_id,
			hub_id: req.params.id,
			person_id: req.body.person_id,

		    // $and : [

		    // 	{group_id: {$eq: mongoose.Types.ObjectId(req.params.group_id)}},
		    // 	{person_id: {$eq: mongoose.Types.ObjectId(req.body.person_id)}},
		    // 	{hub_id: {$eq: mongoose.Types.ObjectId(req.params.id)}}
		      
		    // ]
		}, function(err, hub){
				console.log(hub)
				res.send('Completed remove person');

		} )

		// return Person_group_join.find({ $and : [{hub_id: req.params.id}, {group_id: req.params.group_id}, {person_id: req.body.person_id}]}, function(err, hub){
		// 		console.log(hub)
		// 		next()
		// 			// if(err || hub === null){ 	
		// 			// 	req.flash('info', "Hub not found.")
		// 			// 	res.redirect('/hubs');
		// 			// 	return console.log("err++: " + err) 	
		// 			// }
		// 			// return method			
		// 	})	

		var group_remove = function(){


			



		// 	var person_group_join = new Person_group_join();

		// 	person_group_join.hub_id = mongoose.Types.ObjectId(req.params.id);
		// 	person_group_join.group_id = mongoose.Types.ObjectId(req.params.group_id);
		// 	person_group_join.person_id = mongoose.Types.ObjectId(req.body.person_id);

		// 	console.dir(person_group_join)



		// 	Person_group_join.remove({hub_id: person_group_join.hub_id, group_id: person_group_join.group_id, person_id: person_group_join.person_id}, function(err){	
		// 			// 	if(err){ return console.log("err: " + err) }
		// 			console.log("remove person <<<<<<<<<<<<<<")
		// 		res.send('Completed remove person');

		// 				// res.redirect('/hub/' + req.params.id);
		// 			});



		// 	person_group_join.remove(function (err, person_group) {
		// 		if(err || group === null){ 	
		// 			req.flash('info', "Did not save group.")
		// 			res.redirect('/hub/' + req.params.id+ '/add_group');
		// 			return console.log("err++: " + err) 	
		// 		}	
		// 		// res.redirect('/hub/' + req.params.id+ '/groups');
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

		//  hubId(group_remove());

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

	// app.post('/hub/:id/group/:group_id/add_persons', function (req, res) {

	// 	var person_group_join = new Person_group_join();
	// 	person_group_join.group_id = req.params.group_id;
	// 	person_group_join.person_id = req.params.group_id;

	// 	// Instructions: Creating a person_group_join
	// 	// get group_id by just looking at the request params :group_id
	// 	// get person_id by when person check mark it will js request ?person_id=UniqueId_1234 to this add_person under the particular group :group_id
	// 	// save both ids (group_id & person_id) to the person_group_join




	// 	// res.redirect('/group/'+req.params.id+'/add_persons' );

	// 	// var person = req.body.person;

	// 	// if(person === undefined){
	// 	// 	person = [];
	// 	// }

	// 	// if(person.constructor !== Array && person.constructor !== undefined){
	// 	// 	person = [req.body.person];
	// 	// }

	// 	// Group.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){

	// 	// 	person.forEach(function(entry){
	// 	// 		Person.findByIdAndUpdate(entry, { $push: {group: req.params.id}}, function(err, entry){
					
	// 	// 		})
	// 	// 	});//end of for each
 //  //   		// res.redirect('/group/'+req.params.id+'/add_persons' );
	// 	// });
	// });


}

