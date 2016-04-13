"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');

var crypto = require('crypto');
var forEachAsync = require('forEachAsync').forEachAsync;
var async = require('async')

var Contact = require('../models/contact.js');
var Group = require('../models/group.js');
var Hub = require('../models/hub.js');
var User = require('../models/user.js');
var ContactGroupJoin = require('../models/contact_group_join.js');

var csrf = require('csurf')

var bodyParser = require('body-parser')


var upload = require('./../helpers/upload.js').upload;
var imageProcessor = require('./../helpers/image_processor.js');
var deleteImgFile = require('./../helpers/delete_img_file.js')
var canvasThumbnail = require('./../helpers/canvas_thumbnail.js');
var sanitize = require('./../helpers/sanitizer.js');


var moment = require('moment');


// Private Functions
var hubchecker = function(req, res, method){

	var userLowerCase = req.params.id.toLowerCase();

	User.findOne({username: userLowerCase}, function(err, user) {
		console.log("checking hub")
		if(err  || user === null){ 
			res.send('no user by that name');
			return console.log("err: " + err) 
		}

		Hub.findOne({user_owner_id: user._id}, function(err, hub){
			if(err){ 
				res.redirect('/');
				return console.log("err: " + err) 
			}
			console.log("hubchecked")

			return method(hub);
		});
	});
}




var groupController = function(){


	var groupDescription =  function(req, res){
		var readGroup = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				return Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function(err, group){
					if(err || group === null){ 	
						req.flash('info', "Group not found.")
						res.redirect('/hub/' + req.params.id);
						return console.log("err++: " + err) 	
					}

					var updateDate = group.update_date.getTime();
					var creationDate = group.creation_date.getTime();

					res.render('group/description', {group : group, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate});
				})

			} else {
				console.log("not equals");
				// console.log(req);
			    // return res.redirect('/hubs');
				res.send('404: Page not Found', 404);
			}
		}
		return hubchecker(req, res, readGroup)
	}

	var groupInfo = function (req, res) {

		var readgroup = function(hub){

			var hubOwner = hub.user_owner_id
			var userID = req.user._id
			var user = req.user

			if(_.isEqual(userID, hubOwner)){

				return Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function(err, group){
					if(err || group === null){ 	
						req.flash('info', "group not found.")
						res.redirect('/@/:id');
						return console.log("err++: " + err) 	
					}
					console.log(group);
					var updateDate = group.update_date.getTime();
					var creationDate = group.creation_date.getTime();

					group.address = group.street  +" "+  group.city +" "+ group.state_province_region +" "+ group.postal_code +" "+  group.country;


					if(group.creation_day){ 
						group.creation_day = moment(new Date(group.creation_day)).format("LL")
					}
					


					res.render('group/info', {group : group, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate   });
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}

		}

		return hubchecker(req, res, readgroup)
	}













	var groupContacts = function (req, res) {

		var readGroup = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				ContactGroupJoin.find({group_id: req.params.group_id, hub_id: hub.id}, function(err, groupJoins){		
					var contactArray = [];


					forEachAsync(groupJoins, function (next, element, index, array) {
						Contact.find({_id: element.contact_id, hub_id: element.hub_id}, function(err, contact){

							contactArray.push(contact[0])
		
							next()
						})


					   	
					}).then(function () {
					    

						Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function(err, group){
							if(err || group === null){ 	
								req.flash('info', "Group not found.")
								res.redirect('/@/:id');
								return console.log("err++: " + err) 	
							}
							var updateDate = group.update_date.getTime();
							var creationDate = group.creation_date.getTime();

							group.name  = group.name || "";
						
							res.render('group/contacts', { group : group, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate, contactArray: contactArray });


						})

					    console.log('All requests have finished');
					    
					});
		
					
				})
			} else {
				console.log("not equals");
			  	res.send('404: Page not Found', 404);
			}

		}

		return hubchecker(req, res, readGroup)
	}













	var deleteGroup =  function(req, res){

		var readGroup = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id

			if(_.isEqual(userId, hubOwner)){

				Group.findById( req.params.group_id , function(err, group){
					// console.log(group);

					if(err || group === null){ 	
						req.flash('info', "Group not found.")
						res.redirect('/hub/' + req.params.id+ '/groups');
						return console.log("err++: " + err) 	
					}	

					ContactGroupJoin.find({group_id: req.params.group_id}, function(err, contactGroup){
						console.log(contactGroup)
						forEachAsync(contactGroup, function(next, element, index, array){
							ContactGroupJoin.remove({_id: element._id, hub_id: element.hub_id}, function(){})
							console.log("element: " + element)
							next()
						}).then(function(){
							Group.remove({_id: req.params.group_id, hub_id: hub.id}, function(err){	
								res.redirect('/hub/' + req.params.id);
							});
							console.log('All requests have finished');
						})
					})

				})

			} else {
				console.log("not equals");
				// console.log(req);
				// return res.redirect('/hubs');
				res.send('404: Page not Found', 404);
			}

		}
		return hubchecker(req, res, readGroup)
	}









	var groups = function (req, res) {
		var readGroups = function(hub){
			console.log(req.query)
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user
			if(_.isEqual(userId, hubOwner)){

				var name = req.query.name || ""

				name = name.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");

				 if(name.length <= 0){
				 	var sort = {sort: {update_date: -1} } 
				 	console.log("empty")
				 }else{
				 	var sort = {sort: { name: 1}} 
					console.log("full")
				 }


				Group.find({hub_id: hub.id, name: new RegExp('^'+name.toLowerCase(), "i")}, null, sort, function(err, groups){
					if(err){ return console.log("err: " + err) }
					// console.log(groups);
					res.render('group/groups', {hub: hub, groups : groups, user: user, query: req.query });
				}).limit(20).skip(req.query.skip*20);
			} else {
				console.log("not equals");
		
			  return res.redirect('/hubs');
			}
		}


		return hubchecker(req, res, readGroups)

	}

























	var addGroup = function (req, res) {
		var render = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user


			res.render('group/add_group', {csrfToken: req.csrfToken(), user: user, hub: hub});
		}
		hubchecker(req, res, render)
	}

	var addGroupPost = function (req, res) {
		var postGroup = function(hub){

			var token = crypto.randomBytes(8).toString('hex') + "_" + Date.now(); 
			var randomString = token;

			console.log(req.body)

			var requestBody = req.body;
			var intials = requestBody.name.replace(/\s+/g, '').charAt(0).toUpperCase()




			var group = new Group();
			
			group.hub_id =  hub._id;



			group.defaultSmallThumb = canvasThumbnail(intials).smallTextThumb()
			group.defaultBigThumb = canvasThumbnail(intials).bigTextThumb()

	
		    group.name = sanitize(requestBody.name).noTagsCleanedHTML();
		    group.lowercase_name = sanitize(requestBody.name.toLowerCase()).noTagsCleanedHTML();
			
									
			group.headline = sanitize(requestBody.headline).noTagsCleanedHTML();
			group.about= sanitize(requestBody.about).cleanedHTML();


			group.industry = sanitize(requestBody.industry).noTagsCleanedHTML();
			group.group_type = sanitize(requestBody.group_type).cleanedHTMLCHAR()

			// creation date stuff
			group.creation_date = new Date(requestBody.creation_month + " " + requestBody.creation_day + " " + requestBody.creation_year)


			group.email = sanitize(requestBody.email).noTagsCleanedHTML();
			group.primary_phone = sanitize(requestBody.primary_phone).noTagsCleanedHTML();
			group.fax = sanitize(requestBody.fax).noTagsCleanedHTML();

			// address stuff
			group.street = sanitize(requestBody.street).noTagsCleanedHTML();
			group.city = sanitize(requestBody.city).noTagsCleanedHTML();
			group.state_province_region= sanitize(requestBody.state_province_region).noTagsCleanedHTML();
			group.postal_code = sanitize(requestBody.postal_code).noTagsCleanedHTML();
			group.country = sanitize(requestBody.country).noTagsCleanedHTML();

			group.web_address = sanitize(requestBody.web_address).noTagsCleanedHTML();

			var color = [ "222222", "333333", "444444", "555555", "666666", "777777", "888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE"]
			group.hex_color = color[Math.floor( Math.random() * ( color.length ) ) ] //(Math.random()*0xFFFFFF<<0).toString(16);


			var save = function(){
				group.save(function(err,group){
					if(err){
						console.log('Error while saving image: ' + err);
						// res.send({ error:err });
						// res.send();
						req.flash('message','something went wrong');
						return res.redirect("/@/"+req.params.id+"/add_group" );
					} else {
						console.log(group)
						return res.redirect("/@/"+req.params.id+"/group/"+group._id );
					}	
				});
			}

			if(req.file !== undefined){
			
			    group.img_originalname = req.file.originalname;
				group.img_foldername = randomString;
				group.img_icon = "icon_" + randomString +".jpg";
				group.img_thumbnail = "thumb_" + randomString +".jpg";
				group.img_normal = "normal_" + randomString+".jpg";

			    imageProcessor(req,res, randomString, function(){
					return save()
			    })

			     
			}else{
				return save()
			}
		}
			// running the hubchecker
		return hubchecker(req, res, postGroup)
	}




	var groupUpdate = function (req, res) {

		var readGroup = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user


			return Group.findById(req.params.group_id, function(err, group){
				if(err || group === null){ 	
					req.flash('info', "Group not found.")
					res.redirect('/hub/:id');
					return console.log("err++: " + err) 	
				}	

				group.creation_month = moment(new Date(group.creation_day)).format('MMMM').toLowerCase();
				group.creation_day = moment(new Date( group.creation_day)).format('D')
				group.creation_year = moment(new Date(group.creation_day)).format('YYYY')


				console.log(group);
				res.render('group/group_update', {group : group, csrfToken: req.csrfToken(), hub: hub, user: user});
			})


		}
		return hubchecker(req, res, readGroup)
	}



	var groupUpdatePost = function (req, res) {

		var postGroup = function(hub){
			console.log("=============")
			console.log(req.params)
			console.log("=============")

			var hubOwner = hub.user_owner_id
			var userId = req.user._id


			if(_.isEqual(userId, hubOwner)){

				// var name = req.query.name || ""


				// name = name.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");

				//  if(name.length <= 0){
				//  	var sort = {sort: {update_date: -1} } 
				//  	console.log("empty")
				//  }else{
				//  	var sort = {sort: { name: 1}} 
				// 	console.log("full")
				//  }


				Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function (err, group) {
					console.log(group.img_foldername)
					var oldGroupImg = group.img_foldername;

					if(err || group === null){ 	
						req.flash('info', "Group not found.");
						res.redirect('/@/:id/groups');
						return console.log("err++: " + err);
					}	

					var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
					var randomString = token;
					var requestBody = req.body;
					var intials = requestBody.name.replace(/\s+/g, '').charAt(0).toUpperCase()

					
				
					// var group = new Group();
					
					// group.hub_id = req.params.id;
					group.update_date = Date.now();

			
					group.defaultSmallThumb = canvasThumbnail(intials).smallTextThumb()
					group.defaultBigThumb = canvasThumbnail(intials).bigTextThumb()
			
				    group.name = sanitize(requestBody.name).noTagsCleanedHTML();
				    group.lowercase_name = sanitize(requestBody.name.toLowerCase()).noTagsCleanedHTML();
					
											
					group.headline = sanitize(requestBody.headline).noTagsCleanedHTML();
					group.about = sanitize(requestBody.about).cleanedHTML();


					group.industry = sanitize(requestBody.industry).noTagsCleanedHTML();
					group.group_type = sanitize(requestBody.group_type).cleanedHTMLCHAR()

					// creation date stuff
					group.creation_date = new Date(requestBody.creation_month + " " + requestBody.creation_day + " " + requestBody.creation_year)


					group.email = sanitize(requestBody.email).noTagsCleanedHTML();
					group.primary_phone = sanitize(requestBody.primary_phone).noTagsCleanedHTML();
					group.fax = sanitize(requestBody.fax).noTagsCleanedHTML();

					// address stuff
					group.street = sanitize(requestBody.street).noTagsCleanedHTML();
					group.city = sanitize(requestBody.city).noTagsCleanedHTML();
					group.state_province_region= sanitize(requestBody.state_province_region).noTagsCleanedHTML();
					group.postal_code = sanitize(requestBody.postal_code).noTagsCleanedHTML();
					group.country = sanitize(requestBody.country).noTagsCleanedHTML();

					group.web_address = sanitize(requestBody.web_address).noTagsCleanedHTML();


					console.log("_____________________");
					console.log(requestBody);
					console.log("_____________________");
					
					var save = function(){

							group.save(function(err){
								if(err){
									console.log('Error while saving: ' + err);
									res.send({ error:err });

									return;
								} else {
									console.log("2 second call")
									return res.redirect("/@/"+req.params.id+"/group/"+group._id );

								}	
							});

					}

					if(req.file !== undefined){
					
					    group.img_originalname = req.file.originalname;
						group.img_foldername = randomString;
						group.img_icon = "icon_" + randomString +".jpg";
						group.img_thumbnail = "thumb_" + randomString +".jpg";
						group.img_normal = "normal_" + randomString+".jpg";

					    imageProcessor(req,res, randomString, function(){
							save();
							console.log("++++++++++++++++++++++++");

							console.log(group.img_foldername);

							console.log(oldGroupImg);
							console.log("++++++++++++++++++++++++");
							deleteImgFile(oldGroupImg);
							return; 
					    })

					     
					}else{
						return save()
					}

				});

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/hubs');
			}



		}
		return hubchecker(req, res, postGroup);


	}





	var addContact = function (req, res) {
		var group = function(hub){
			var contact_array = []
			var user = req.user
			Group.findById(req.params.group_id, function (err, group) {	
				return Contact.find({hub_id: hub.id}, null, function(err, contacts){
				  	if(err){ return console.log("err: " + err) }


				  	async.eachSeries(contacts, function (contact, callback) {
					  	  var p = contact.toJSON()
					  	  
					  	  p.checked = false;

						  ContactGroupJoin.find({hub_id: hub.id, contact_id: contact._id, group_id: req.params.group_id}, null, function(err, contact_group){
							  	 console.log(contact_group)
							  	if(contact_group.length > 0){
									console.log("true")
							  	 	p.checked = true;
							  	 	contact_array.push(p)
							  	} else {
							  		console.log("false")
							  	 	p.checked = false;
							  	 	contact_array.push(p)
							  	}
							  	
							  	callback(); 


						  
						  	});

					}, function (err) {
						
					  if (err) { throw err; }
					  return ContactGroupJoin.find({hub_id: hub.id}, null, function(err, contact_group){
				   		res.render('group/add_contacts', { contact_group: contact_group, group : group, contacts : contact_array, user: user});
				  	  });

					});

				});

			});
		}
		return hubchecker(req, res, group);

	}






	var addContactPost = function (req, res) {
		var groupPost = function(hub){

			var contactGroupJoin = new ContactGroupJoin();

			contactGroupJoin.hub_id = mongoose.Types.ObjectId(hub.id);
			contactGroupJoin.group_id = mongoose.Types.ObjectId(req.params.group_id);
			contactGroupJoin.contact_id = mongoose.Types.ObjectId(req.body.contact_id);

			// console.dir(contact_group_join)

			contactGroupJoin.save(function (err, contact_group) {
				if(err || contact_group === null){ 	
					req.flash('info', "Did not save group.")
					res.redirect('/@/' + req.params.id+ '/add_group');
					return console.log("err++: " + err) 	
				}	
				// res.redirect('/hub/' + req.params.id+ '/groups');
				console.log("add contact <<<<<<<<<<<<<<")
				res.send('Completed add contact');

			});	
		}
		return hubchecker(req, res, groupPost);
	}



	var removeContactPost = function(req, res){
		console.log(req.body.contact_id)

		var removeContact = function(hub){
			ContactGroupJoin.remove( {

				group_id: req.params.group_id,
				hub_id: hub.id,
				contact_id: req.body.contact_id,

			}, function(err, hub){
					console.log(hub)
					res.send('Completed remove contact');

			});
		}
		return hubchecker(req, res, removeContact);
	}





	return{
		groupDescription: groupDescription,
		groupInfo: groupInfo,
		groupContacts: groupContacts,
		deleteGroup: deleteGroup,
		groups: groups,
		addGroup: addGroup,
		addGroupPost: addGroupPost,
		addContact: addContact,
		addContactPost: addContactPost,
		removeContactPost: removeContactPost,
		groupUpdate: groupUpdate,
		groupUpdatePost: groupUpdatePost

	}

}


module.exports = groupController;