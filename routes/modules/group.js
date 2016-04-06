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
var Contact = require('../../models/contact.js');


var upload = require('./../../helpers/upload.js').upload;
var imageProcessor = require('./../../helpers/image_processor.js');
var deleteImgFile = require('./../../helpers/delete_img_file.js')


var Contact_group_join = require('../../models/contact_group_join.js');

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

	app.get('/@/:id/groups',  groupController.groups); //groupController.groupDescription

	app.get('/@/:id/group/:group_id', groupController.groupContacts);
	
	app.get('/@/:id/group/:group_id/info', groupController.groupInfo);

	// READ GROUPS
	app.get('/@/:id/group/:group_id/description', groupController.groupDescription);



	app.delete('/@/:id/group/:group_id', groupController.deleteGroup);

	app.get('/@/:id/group/:group_id/update',   csrfProtection,  groupController.groupUpdate);

	app.post('/@/:id/group/:group_id/update', upload.single('image'),  csrfProtection,  groupController.groupUpdatePost);
				
	//**************** ADD PERSONS **********************
	app.get('/@/:id/group/:group_id/add_contacts',  groupController.addContact);
	//**************** ADD PERSONS POST
	app.post('/@/:id/group/:group_id/add_contacts', groupController.addContactPost);

	app.delete('/@/:id/group/:group_id/add_contacts',  groupController.removeContactPost);

	// app.delete('/hub/:id/group/:group_id/add_contacts', function (req, res,  next) {

	// 	 // Contact_group_join.find()
	// 	 //      .and([
	// 	 //          { $and : [ { group_id : req.params.group_id} ] },

	// 	 //          { $and : [ { contact_id : req.body.contact_id} ] },
		         
	// 	 //          { $and : [ { hub_id : req.params.id} ] }
	// 	 //      ])
	// 	 //      .exec(function (err, results) {
	// 	 //          console.log(results)
	// 		// 	next();
	// 	 //      });
		
	// 	console.log(req.body.contact_id)

	// 	Contact_group_join.remove( {

	// 		group_id: req.params.group_id,
	// 		hub_id: req.params.id,
	// 		contact_id: req.body.contact_id,

	// 	    // $and : [

	// 	    // 	{group_id: {$eq: mongoose.Types.ObjectId(req.params.group_id)}},
	// 	    // 	{contact_id: {$eq: mongoose.Types.ObjectId(req.body.contact_id)}},
	// 	    // 	{hub_id: {$eq: mongoose.Types.ObjectId(req.params.id)}}
		      
	// 	    // ]
	// 	}, function(err, hub){
	// 			console.log(hub)
	// 			res.send('Completed remove contact');

	// 	} )

	// 	// return Contact_group_join.find({ $and : [{hub_id: req.params.id}, {group_id: req.params.group_id}, {contact_id: req.body.contact_id}]}, function(err, hub){
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


			



	// 	// 	var contact_group_join = new Contact_group_join();

	// 	// 	contact_group_join.hub_id = mongoose.Types.ObjectId(req.params.id);
	// 	// 	contact_group_join.group_id = mongoose.Types.ObjectId(req.params.group_id);
	// 	// 	contact_group_join.contact_id = mongoose.Types.ObjectId(req.body.contact_id);

	// 	// 	console.dir(contact_group_join)



	// 	// 	Contact_group_join.remove({hub_id: contact_group_join.hub_id, group_id: contact_group_join.group_id, contact_id: contact_group_join.contact_id}, function(err){	
	// 	// 			// 	if(err){ return console.log("err: " + err) }
	// 	// 			console.log("remove contact <<<<<<<<<<<<<<")
	// 	// 		res.send('Completed remove contact');

	// 	// 				// res.redirect('/hub/' + req.params.id);
	// 	// 			});



	// 	// 	contact_group_join.remove(function (err, contact_group) {
	// 	// 		if(err || group === null){ 	
	// 	// 			req.flash('info', "Did not save group.")
	// 	// 			res.redirect('/hub/' + req.params.id+ '/add_group');
	// 	// 			return console.log("err++: " + err) 	
	// 	// 		}	
	// 	// 		// res.redirect('/hub/' + req.params.id+ '/groups');
	// 	// 		// console.log("add contact <<<<<<<<<<<<<<")
	// 	// 		// res.send('Completed add contact');

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
	// 	//     res.send('Completed remove contact');
	// 	// console.log("remove contact <<<<<<<<<<<<<<")
	// 	// // next(); 
	// 	}

	// })










	// function contactAdd(req,res,next){
	// 	var contact = req.body.contact;

	// 	if(contact === undefined){
	// 		contact = [];
	// 	}

	// 	if(contact.constructor !== Array && contact.constructor !== undefined){
	// 		contact = [req.body.contact];
	// 	}



	// 	Group.findById(req.params.id, function(err, originA){
	// 	    if(err){ return console.log("err: " + err) }

	// 		var originA = originA;
	// 		console.log("originA " + originA.contacts);
			
	// 		Group.findByIdAndUpdate(req.params.id,{ $set: { contacts: contact }}, function(err, affected){
	// 			if(err){ return console.log("err: " + err) }

	// 				var affected = affected;

	// 			Group.findById(req.params.id, function(err, originB){
	// 				console.log("originB " + originB.contacts);

	// 				var removeArray = _.difference(originA.contacts, originB.contacts);
	// 				// console.log(removeArray);
	// 				removeArray.forEach(function(element){
	// 					// console.log("element: " +element)
	// 					Contact.findById(element, function(err, entry){
	// 						console.log(entry.group)
	// 						var result = _.without(entry.group, req.params.id);
	// 						console.log(result)

	// 						if(result === undefined){
	// 							result = [];
	// 						}
	// 						if(result.constructor !== Array && result.constructor !== undefined){
	// 							result = [result];
	// 						}

	// 						Contact.findByIdAndUpdate(element, { $set: {group: result}}, function(err, entryNext){
						
	// 						})

	// 					})

	// 				})

					
	// 			})


	// 			contact.forEach(function(entry){
					


	// 				Contact.findByIdAndUpdate(entry, { $addToSet: {group: req.params.id}}, function(err, entry){
						
	// 				})
	// 			});//end of for each
	//     		res.redirect('/group/'+req.params.id+'/add_contacts' );
	// 		});	

	// 	})
	// 	next();
	// }

	// app.post('/hub/:id/group/:group_id/add_contacts', function (req, res) {

	// 	var contact_group_join = new Contact_group_join();
	// 	contact_group_join.group_id = req.params.group_id;
	// 	contact_group_join.contact_id = req.params.group_id;

	// 	// Instructions: Creating a contact_group_join
	// 	// get group_id by just looking at the request params :group_id
	// 	// get contact_id by when contact check mark it will js request ?contact_id=UniqueId_1234 to this add_contact under the particular group :group_id
	// 	// save both ids (group_id & contact_id) to the contact_group_join




	// 	// res.redirect('/group/'+req.params.id+'/add_contacts' );

	// 	// var contact = req.body.contact;

	// 	// if(contact === undefined){
	// 	// 	contact = [];
	// 	// }

	// 	// if(contact.constructor !== Array && contact.constructor !== undefined){
	// 	// 	contact = [req.body.contact];
	// 	// }

	// 	// Group.findByIdAndUpdate(req.params.id,{ $set: { contacts: contact }}, function(err, affected){

	// 	// 	contact.forEach(function(entry){
	// 	// 		Contact.findByIdAndUpdate(entry, { $push: {group: req.params.id}}, function(err, entry){
					
	// 	// 		})
	// 	// 	});//end of for each
 //  //   		// res.redirect('/group/'+req.params.id+'/add_contacts' );
	// 	// });
	// });


}

