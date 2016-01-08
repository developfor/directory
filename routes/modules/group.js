"use strict";
var secret_key = require('../../config/secret.js');
var passport = require('../../config/passport.js');
var  ensureAuthenticated = function(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	 res.redirect('/login')
  	}

var mongoose = require('mongoose');
var _ = require('underscore');


var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })


var Hub = require('../../models/hub.js');
var Group = require('../../models/group.js');
var Person = require('../../models/person.js');


var upload = require('./../../helpers/upload.js').upload;
var imageProcessor = require('./../../helpers/image_processor.js');
var deleteImgFile = require('./../../helpers/delete_img_file.js')


var Person_group_join = require('../../models/person_group_join.js');

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

module.exports = function(app) {

	var groupController = require('./../../controllers/group.js')(null, app)



	app.all('/hub/:id/add_group', ensureAuthenticated);
	app.all('/hub/:id/groups', ensureAuthenticated);
    app.all('/group', ensureAuthenticated);
	app.all('/hub/:id/group/*', ensureAuthenticated);



	
	// ADD GROUP
	app.get('/@/:id/add_group', csrfProtection,  groupController.addGroup)

	app.post('/@/:id/add_group', upload.single('image'), csrfProtection, groupController.addGroupPost)

	app.get('/@/:id/groups',  groupController.groups);

	app.get('/@/:id/group/:group_id', groupController.group);

	app.delete('/@/:id/group/:group_id', groupController.deleteGroup);

	app.get('/@/:id/group/:group_id/update',   csrfProtection,  groupController.groupUpdate);

	app.post('/@/:id/group/:group_id/update', upload.single('image'),  csrfProtection,  groupController.groupUpdatePost);
				
	//**************** ADD PERSONS **********************
	app.get('/@/:id/group/:group_id/add_persons',  groupController.addPerson);
	//**************** ADD PERSONS POST
	app.post('/@/:id/group/:group_id/add_persons', groupController.addPersonPost);

	app.delete('/@/:id/group/:group_id/add_persons',  groupController.removePersonPost);

	// app.delete('/hub/:id/group/:group_id/add_persons', function (req, res,  next) {

	// 	 // Person_group_join.find()
	// 	 //      .and([
	// 	 //          { $and : [ { group_id : req.params.group_id} ] },

	// 	 //          { $and : [ { person_id : req.body.person_id} ] },
		         
	// 	 //          { $and : [ { hub_id : req.params.id} ] }
	// 	 //      ])
	// 	 //      .exec(function (err, results) {
	// 	 //          console.log(results)
	// 		// 	next();
	// 	 //      });
		
	// 	console.log(req.body.person_id)

	// 	Person_group_join.remove( {

	// 		group_id: req.params.group_id,
	// 		hub_id: req.params.id,
	// 		person_id: req.body.person_id,

	// 	    // $and : [

	// 	    // 	{group_id: {$eq: mongoose.Types.ObjectId(req.params.group_id)}},
	// 	    // 	{person_id: {$eq: mongoose.Types.ObjectId(req.body.person_id)}},
	// 	    // 	{hub_id: {$eq: mongoose.Types.ObjectId(req.params.id)}}
		      
	// 	    // ]
	// 	}, function(err, hub){
	// 			console.log(hub)
	// 			res.send('Completed remove person');

	// 	} )

	// 	// return Person_group_join.find({ $and : [{hub_id: req.params.id}, {group_id: req.params.group_id}, {person_id: req.body.person_id}]}, function(err, hub){
	// 	// 		console.log(hub)
	// 	// 		next()
	// 	// 			// if(err || hub === null){ 	
	// 	// 			// 	req.flash('info', "Hub not found.")
	// 	// 			// 	res.redirect('/hubs');
	// 	// 			// 	return console.log("err++: " + err) 	
	// 	// 			// }
	// 	// 			// return method			
	// 	// 	})	

	// 	var group_remove = function(){


			



	// 	// 	var person_group_join = new Person_group_join();

	// 	// 	person_group_join.hub_id = mongoose.Types.ObjectId(req.params.id);
	// 	// 	person_group_join.group_id = mongoose.Types.ObjectId(req.params.group_id);
	// 	// 	person_group_join.person_id = mongoose.Types.ObjectId(req.body.person_id);

	// 	// 	console.dir(person_group_join)



	// 	// 	Person_group_join.remove({hub_id: person_group_join.hub_id, group_id: person_group_join.group_id, person_id: person_group_join.person_id}, function(err){	
	// 	// 			// 	if(err){ return console.log("err: " + err) }
	// 	// 			console.log("remove person <<<<<<<<<<<<<<")
	// 	// 		res.send('Completed remove person');

	// 	// 				// res.redirect('/hub/' + req.params.id);
	// 	// 			});



	// 	// 	person_group_join.remove(function (err, person_group) {
	// 	// 		if(err || group === null){ 	
	// 	// 			req.flash('info', "Did not save group.")
	// 	// 			res.redirect('/hub/' + req.params.id+ '/add_group');
	// 	// 			return console.log("err++: " + err) 	
	// 	// 		}	
	// 	// 		// res.redirect('/hub/' + req.params.id+ '/groups');
	// 	// 		// console.log("add person <<<<<<<<<<<<<<")
	// 	// 		// res.send('Completed add person');

	// 	// 	});	

	// 	// }


	// 	// var hubId = function(method){

	// 	// 	return Hub.find(req.params.id, function(err, hub){
	// 	// 			if(err || hub === null){ 	
	// 	// 				req.flash('info', "Hub not found.")
	// 	// 				res.redirect('/hubs');
	// 	// 				return console.log("err++: " + err) 	
	// 	// 			}
	// 	// 			return method			
	// 	// 		})	
	// 	// }

	// 	//  hubId(group_remove());

	// 	//    // if(err){ return console.log("err: " + err) }
	// 	//     res.send('Completed remove person');
	// 	// console.log("remove person <<<<<<<<<<<<<<")
	// 	// // next(); 
	// 	}

	// })










	// function personAdd(req,res,next){
	// 	var person = req.body.person;

	// 	if(person === undefined){
	// 		person = [];
	// 	}

	// 	if(person.constructor !== Array && person.constructor !== undefined){
	// 		person = [req.body.person];
	// 	}



	// 	Group.findById(req.params.id, function(err, originA){
	// 	    if(err){ return console.log("err: " + err) }

	// 		var originA = originA;
	// 		console.log("originA " + originA.persons);
			
	// 		Group.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){
	// 			if(err){ return console.log("err: " + err) }

	// 				var affected = affected;

	// 			Group.findById(req.params.id, function(err, originB){
	// 				console.log("originB " + originB.persons);

	// 				var removeArray = _.difference(originA.persons, originB.persons);
	// 				// console.log(removeArray);
	// 				removeArray.forEach(function(element){
	// 					// console.log("element: " +element)
	// 					Person.findById(element, function(err, entry){
	// 						console.log(entry.group)
	// 						var result = _.without(entry.group, req.params.id);
	// 						console.log(result)

	// 						if(result === undefined){
	// 							result = [];
	// 						}
	// 						if(result.constructor !== Array && result.constructor !== undefined){
	// 							result = [result];
	// 						}

	// 						Person.findByIdAndUpdate(element, { $set: {group: result}}, function(err, entryNext){
						
	// 						})

	// 					})

	// 				})

					
	// 			})


	// 			person.forEach(function(entry){
					


	// 				Person.findByIdAndUpdate(entry, { $addToSet: {group: req.params.id}}, function(err, entry){
						
	// 				})
	// 			});//end of for each
	//     		res.redirect('/group/'+req.params.id+'/add_persons' );
	// 		});	

	// 	})
	// 	next();
	// }

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

