"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');


var crypto = require('crypto');


var forEachAsync = require('forEachAsync').forEachAsync;

var Contacts = require('../models/contact.js');
var Group = require('../models/group.js');
var Hub = require('../models/hub.js');
var User = require('../models/user.js');
var ContactsGroupJoin = require('../models/contact_group_join.js');
var csrf = require('csurf')

var bodyParser = require('body-parser')


var upload = require('./../helpers/upload.js').upload;
var imageProcessor = require('./../helpers/image_processor.js');
var deleteImgFile = require('./../helpers/delete_img_file.js')
var sanitize = require('./../helpers/sanitizer.js');

var canvasThumbnail = require('./../helpers/canvas_thumbnail.js');

var moment = require('moment');


// Private Functions
var hubchecker = function(req, res, method){

	var userLowerCase = req.params.id.toLowerCase();

	User.findOne({username: userLowerCase}, function(err, user) {
		// console.log("checking hub")
		if(err  || user === null){ 
			res.send('no user by that name');
			return console.log("err: " + err) 
		}

		Hub.findOne({user_owner_id: user._id}, function(err, hub){
			if(err){ 
				res.redirect('/');
				return console.log("err: " + err) 
			}
			// console.log("hubchecked")

			return method(hub);
		});
	});
}




// Public Functions
var contactController = function(contactService, app ){

	var add_contact = function (req, res) {


		var render = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			res.render('contact/add_contact', {csrfToken: req.csrfToken(), contact : "", user: user, hub: hub})
		}

		// running the hubchecker
		return hubchecker(req, res, render)
		
	}


	// ADD Contacts
	var add_contact_post = function (req, res) {
		var postContacts = function(hub){

			var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
			var randomString = token;

			var requestBody = req.body;
			requestBody.name = requestBody.name || ""
			var intials = requestBody.name.replace(/\s+/g, '').charAt(0).toUpperCase()

			var contact = new Contacts();
			
			contact.hub_id = hub._id;

			contact.obj_type = sanitize(requestBody.obj_type).personEntity();

			contact.defaultSmallThumb = canvasThumbnail(intials).smallTextThumb()
			contact.defaultBigThumb = canvasThumbnail(intials).bigTextThumb()

		  
			contact.name = sanitize(requestBody.name).cleanedHTMLCHAR();
			
			contact.lowercase_name = sanitize(requestBody.name.toLowerCase()).cleanedHTMLCHAR();

			contact.job_title = sanitize(requestBody.job_title).noTagsCleanedHTML();
			contact.gender = sanitize(requestBody.gender).cleanedHTMLCHAR();

			contact.birthday = new Date(requestBody.birth_month + " " + requestBody.birth_day + " " + requestBody.birth_year)

			contact.short_description = sanitize(requestBody.short_description).noTagsCleanedHTML();
			contact.description = sanitize(requestBody.description).cleanedHTML();

			contact.email = sanitize(requestBody.email).noTagsCleanedHTML();

			contact.primary_phone = sanitize(requestBody.primary_phone).noTagsCleanedHTML();
			contact.mobile_phone = sanitize(requestBody.mobile_phone).noTagsCleanedHTML();
			contact.fax = sanitize(requestBody.fax).noTagsCleanedHTML();

			contact.street = sanitize(requestBody.street).noTagsCleanedHTML();
			contact.city = sanitize(requestBody.city).noTagsCleanedHTML();
			contact.state_province_region = sanitize(requestBody.state_province_region).noTagsCleanedHTML();
			contact.postal_code = sanitize(requestBody.postal_code).noTagsCleanedHTML();
			contact.country = sanitize(requestBody.country).noTagsCleanedHTML();

			contact.web_address = sanitize(requestBody.web_address).noTagsCleanedHTML();



			var color = [ "222222", "333333", "444444", "555555", "666666", "777777", "888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE"]
			contact.hex_color = color[Math.floor( Math.random() * ( color.length ) ) ] //(Math.random()*0xFFFFFF<<0).toString(16);


			var save = function(){
				contact.save(function(err,contact){
					if(err){
						console.log('Error while saving image: ' + err);
						// res.send({ error:err });
						// res.send();
						req.flash('message','something went wrong');
						return res.redirect("/@/"+req.params.id+"/add_contact" );
					} else {
						console.log(contact)
						return res.redirect("/@/"+req.params.id+"/contact/"+contact._id );
					}	
				});
			}

			if(req.file !== undefined){
			
			    contact.img_originalname = req.file.originalname;
				contact.img_foldername = randomString;
				contact.img_icon = "icon_" + randomString +".jpg";
				contact.img_thumbnail = "thumb_" + randomString +".jpg";
				contact.img_normal = "normal_" + randomString+".jpg";

			    imageProcessor(req,res, randomString, function(){
					return save()
			    })

			     
			}else{
				return save()
			}
		}
			// running the hubchecker
		return hubchecker(req, res, postContacts)
	}








	// Read Contactss
	var contacts = function (req, res) {
		var readContactss = function(hub){
			// console.log("contacts")

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user
			
			if(_.isEqual(userId, hubOwner)){

				var name = req.query.name || ""

				var objType = req.query.obj_type  || ""

				if(objType === "all" ){
				 	objType = ""
				 }

				 if(objType === "people" ){
				 	objType = "contact"
				 }

				 if(objType === "entities" ){
				 	objType = "entity"
				 }

				console.log(objType)

				 // if(req.query.obj_type != undefined){
				 // 	console.log("all")
				 // 	req.query.obj_type =  ""
				 // }

				 if(name.length <= 0){
				 	if( objType === "" ){
				 		var findText = {
					 		hub_id: hub.id, 
					 		name: new RegExp('^'+name.toLowerCase(), "i")
				 		} // , obj_type: "entity"
					 }else{
				 		var findText = {
					 		hub_id: hub.id, 
					 		name: new RegExp('^'+name.toLowerCase(), "i"), 
					 		obj_type: objType  
				 		}

					 	}
				 	var sort = {sort: {update_date: -1} } 
				 	// console.log("empty")
				 }else{
				 	
				 	if(objType === "" ){
					 	var findText =  {
					 		hub_id: hub.id, 
					 		$text : { $search: "\"" +name.toLowerCase() +"\""  }
					        }
					}else{
						var findText =  {
					 		hub_id: hub.id, 
					 		$text : { $search: "\"" +name.toLowerCase() +"\""  },
					 		obj_type: objType
					        }

					}
				 	var sort = {sort: {lowercase_name: 1}} 
					// console.log("full")
				 }

				if(objType === "" ){
					var findTextAgain = {
						hub_id: hub.id, 
						name : new RegExp('^'+name.toLowerCase(), "i")
						// $text :/.* name .*/
					}
				}else{
					var findTextAgain = {
						hub_id: hub.id, 
						name : new RegExp('^'+name.toLowerCase(), "i"),
						obj_type: objType 
					}
				}
				// if(req.query.obj_type === "all" ){
				 // 	console.log("all")


				 // }

				
				 console.log(res)

				// Contacts.find({hub_id: hub.id, lowercase_name: new RegExp('^'+name.toLowerCase(), "i")}, null, sort, function(err, contacts){
				Contacts.find(findText, null, sort, function(err, contacts){
					console.log(contacts.length === 0)

					if(err){ 
						res.redirect('/');
					    console.log("err: " + err) 
					}

					if(contacts.length === 0){


						// Contacts.find( {hub_id: hub.id, lowercase_name:  new RegExp('^'+name.toLowerCase(), "i") }, null, sort, function(err, contacts){
						Contacts.find( findTextAgain, null, sort, function(err, contacts){
						    // console.log("}}}}}}}}}}}}}}}}}}}}}}}}}length")
						    return res.render('contact/contacts', {hub: hub, contacts: contacts, query: req.query, user: user});
						})
					}else{
						return res.render('contact/contacts', {hub: hub, contacts: contacts, query: req.query, user: user});

					}
					
					// console.log(contact) 
				}).limit(20).skip(req.query.skip*20);
				return;

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/');
			}		
			
		}

		return hubchecker(req, res, readContactss)
      
    }
	








	// Read Contacts
	var contact = function (req, res) {
		var readContacts = function(hub){
			console.log("contact id")
			
			
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				return Contacts.findOne({_id: req.params.contact_id, hub_id: hub.id}, function(err, contact){
					if(err || contact === null){ 	
						req.flash('info', "Contacts not found.")
						res.redirect('/@/:id');
						return console.log("err++: " + err) 	
					}

					var updateDate = contact.update_date.getTime();
					var creationDate = contact.creation_date.getTime();

					var ptitle = contact.title || "";
					var pmiddle = contact.middle_name || "";	
					var psuffix = contact.suffix || "";

					var title = contact.name;

					res.render('contact/contact', {title: title, user: user, contact: contact, hub: hub, updateDate: updateDate, creationDate: creationDate   });
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}			
		}
		return hubchecker(req, res, readContacts)
	}










	var contactInfo = function (req, res) {

		var readContacts = function(hub){

			var hubOwner = hub.user_owner_id
			var userID = req.user._id
			var user = req.user

			if(_.isEqual(userID, hubOwner)){

				return Contacts.findOne({_id: req.params.contact_id, hub_id: hub.id}, function(err, contact){
					if(err || contact === null){ 	
						req.flash('info', "Contacts not found.")
						res.redirect('/@/:id');
						return console.log("err++: " + err) 	
					}
					console.log(contact);
					var updateDate = contact.update_date.getTime();
					var creationDate = contact.creation_date.getTime();

					var getAge = function(dateString) {
					    var today = new Date();
					    var birthDate = new Date(dateString);
					    var age = today.getFullYear() - birthDate.getFullYear();
					    var m = today.getMonth() - birthDate.getMonth();
					    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
					        age--;
					    }
					    return age;
					}

					contact.age = getAge(new Date(contact.birthday))


					var ptitle = contact.title || "";
					var pmiddle = contact.middle_name || "";	
					var psuffix = contact.suffix || "";


					var commaCountry = ""
					if(contact.country !== undefined){ commaCountry = ","} 

					contact.address = contact.street  +" "+  contact.city +" "+ contact.state_province_region +" "+ contact.postal_code +" "+  contact.country;


					if(contact.birthday){ 
						contact.birthday = moment(contact.birthday).format("LL")
					}
					
					var title = contact.name;


					res.render('contact/info', {title: title, contact : contact, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate   });
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}

		}

		return hubchecker(req, res, readContacts)
	}










	var contactGroups = function (req, res) {

		var readContacts = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				ContactsGroupJoin.find({contact_id: req.params.contact_id, hub_id: hub.id}, function(err, groupJoins){		

					// console.log(groupJoins)
					var groupArray = [];


					forEachAsync(groupJoins, function (next, element, index, array) {
						Group.find({_id: element.group_id, hub_id: element.hub_id}, function(err, group){
							// console.log(group);
							groupArray.push(group[0])
							// console.log(groupArray)
							next()
						})


					   	
					}).then(function () {
					    

						Contacts.findOne({_id: req.params.contact_id, hub_id: hub.id}, function(err, contact){
							if(err || contact === null){ 	
								req.flash('info', "Contacts not found.")
								res.redirect('/@/:id');
								return console.log("err++: " + err) 	
							}
							// console.log(contact);
							var updateDate = contact.update_date.getTime();
							var creationDate = contact.creation_date.getTime();

							var ptitle = contact.title || "";
							var pmiddle = contact.middle_name || "";	
							var psuffix = contact.suffix || "";
							console.log(groupArray);
							var title = contact.name;
							res.render('contact/groups', {title: title, contact : contact, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate, groupArray: groupArray });


						})

					    console.log('All requests have finished');
					    
					});

				    // _.each(groupJoins, function(){}, console.log("complete"));
					// groupJoins.forEach(function(entry){	
					// 	console.log(entry.group_id);	 
					// 	Group.find({_id: entry.group_id, hub_id: entry.hub_id}, function(err, group){
					// 		console.log(group);
					// 	})
					// })

		
					
				})
			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}

		}

		return hubchecker(req, res, readContacts)
	}







	var addGroups = function (req, res) {

		var getGroups = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			Contacts.findOne({_id: req.params.contact_id, hub_id: hub.id}, function(err, contact){
			
				Group.find({hub_id: hub.id}, null,  {sort: {update_date: -1} },  function(err, groups){

					forEachAsync(groups, function (next, element, index, array) {
						ContactsGroupJoin.find({hub_id: element.hub_id, group_id: element._id, contact_id: req.params.contact_id }, function(err, contactGroup){

								if(contactGroup.length > 0){
									// console.log("true")
							  	 	groups[index].checked = true;
							  	 	
							  	} else {
							  		// console.log("false")
							  	 	groups[index].checked = false;
							  	}

							  		next()

						});
					}).then(function () {
					    console.log('All requests have finished');
						   // console.log(groups); 
						   console.log(groups)
					    res.render('contact/add_groups', {groups : groups, user:user, contact: contact});
					     // console.log(groups);

					});
				});

			});

		}
		return hubchecker(req, res, getGroups);
	}









	var addGroupsPost = function (req, res) {
		var groupPost = function(hub){

			var contactGroupJoin = new ContactsGroupJoin();

			contactGroupJoin.hub_id = mongoose.Types.ObjectId(hub._id);
			contactGroupJoin.group_id = mongoose.Types.ObjectId(req.body.group_id);
			contactGroupJoin.contact_id = mongoose.Types.ObjectId(req.params.contact_id);

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





	var removeGroupPost = function(req, res){
		

		var removeGroup = function(hub){
			ContactsGroupJoin.remove( {

				group_id: req.body.group_id,
				hub_id: hub._id,
				contact_id: req.params.contact_id,

			}, function(err, hub){
					// console.log(hub)
					console.log("remove contact <<<<<<<<<<<<<<")

					res.send('Completed remove contact');

			});
		}
		return hubchecker(req, res, removeGroup);
	}


	







	var contactUpdate = function (req, res) {

		var readContacts = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			return Contacts.findById(req.params.contact_id, function(err, contact){
				if(err || contact === null){ 	
					req.flash('info', "Contacts not found.")
					res.redirect('/@/:id');
					return console.log("err++: " + err) 	
				}	
				

				contact.birth_month = moment(new Date(contact.birthday)).format('MMMM').toLowerCase();
				contact.birth_day = moment(new Date( contact.birthday)).format('D')
				contact.birth_year = moment(new Date(contact.birthday)).format('YYYY')

				console.log(contact);

				res.render('contact/contact_update', {contact : contact, csrfToken: req.csrfToken(), user: user, hub: hub});
			})


		}
		return hubchecker(req, res, readContacts)
	}







	var contactUpdatePost = function (req, res) {

		var postContacts = function(hub){

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){


				Contacts.findOne({_id: req.params.contact_id, hub_id: hub.id}, function (err, contact) {
					console.log(contact.img_foldername)
					var oldContactsImg = contact.img_foldername;

					if(err || contact === null){ 	
						req.flash('info', "Contacts not found.");
						res.redirect('/@/:id/contacts');
						return console.log("err++: " + err);
					}	

					var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
					var randomString = token;
					var requestBody = req.body;
					requestBody.name = requestBody.name || ""
					var intials = requestBody.name.replace(/\s+/g, '').charAt(0).toUpperCase()

				
					
					contact.hub_id = hub.id;
					contact.update_date = Date.now();

			
				    
			
					contact.defaultSmallThumb = canvasThumbnail(intials).smallTextThumb();
					contact.defaultBigThumb = canvasThumbnail(intials).bigTextThumb();

					contact.obj_type = sanitize(requestBody.obj_type).personEntity();


					contact.name = sanitize(requestBody.name).cleanedHTMLCHAR();
					contact.lowercase_name = sanitize(requestBody.name.toLowerCase()).cleanedHTMLCHAR();

					contact.job_title = sanitize(requestBody.job_title).noTagsCleanedHTML();
					contact.gender = sanitize(requestBody.gender).cleanedHTMLCHAR();

					contact.birthday = new Date(requestBody.birth_month + " " + requestBody.birth_day + " " + requestBody.birth_year)

					contact.short_description = sanitize(requestBody.short_description).noTagsCleanedHTML();
					contact.description = sanitize(requestBody.description).cleanedHTML();
					

					// contact.headline = sanitize(requestBody.headline).noTagsCleanedHTML();
					// contact.about = sanitize(requestBody.about).cleanedHTML();


					contact.email = sanitize(requestBody.email).noTagsCleanedHTML();
					contact.primary_phone = sanitize(requestBody.primary_phone).noTagsCleanedHTML();
					contact.mobile_phone = sanitize(requestBody.mobile_phone).noTagsCleanedHTML();
					contact.fax = sanitize(requestBody.fax).noTagsCleanedHTML();


					contact.street = sanitize(requestBody.street).noTagsCleanedHTML();
					contact.city = sanitize(requestBody.city).noTagsCleanedHTML();
					contact.state_province_region = sanitize(requestBody.state_province_region).noTagsCleanedHTML();
					contact.postal_code = sanitize(requestBody.postal_code).noTagsCleanedHTML();
					contact.country = sanitize(requestBody.country).noTagsCleanedHTML();

					contact.web_address = sanitize(requestBody.web_address).noTagsCleanedHTML();
					
					
					var save = function(){

							contact.save(function(err){
								if(err){
									console.log('Error while saving: ' + err);
									res.send({ error:err });

									return;
								} else {
									console.log("2 second call")
									return res.redirect("/@/"+req.params.id+"/contact/"+contact._id );

								}	
							});

					}

					if(req.file !== undefined){
					
					    contact.img_originalname = req.file.originalname;
						contact.img_foldername = randomString;
						contact.img_icon = "icon_" + randomString +".jpg";
						contact.img_thumbnail = "thumb_" + randomString +".jpg";
						contact.img_normal = "normal_" + randomString+".jpg";

					    imageProcessor(req,res, randomString, function(){
							save();
							console.log("++++++++++++++++++++++++");

							console.log(contact.img_foldername);

							console.log(oldContactsImg);
							console.log("++++++++++++++++++++++++");
							deleteImgFile(oldContactsImg);
							return; 
					    })

					     
					}else{
						return save()
					}

				});

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/');
			}



		}

		return hubchecker(req, res, postContacts);

	}













	var contactDelete = function (req, res) {

		var postContacts = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				Contacts.findOne({_id: req.params.contact_id, hub_id: hub.id}, function(err, contact){
					 if(!contact) {
				        res.statusCode = 404;
				        return res.send({ error: 'Not found' });
				      }


					console.log("-----------------");
					console.log(contact.name);
					console.log("-----------------");
					deleteImgFile(contact.img_foldername);
				
				     
				      return Contacts.remove({_id: req.params.contact_id, hub_id: hub.id}, function(err) {
				        if(!err) {
				          console.log('Removed contact');
				          return res.redirect('/');
				        } else {
				          res.statusCode = 500;
				          console.log('Internal error(%d): %s',res.statusCode,err.message);
				          return res.send({ error: 'Server error' });
				        }
				      })

				})
						
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/');
			}

		}
		return hubchecker(req, res, postContacts);
	}











	








	return{
		add_contact: add_contact,
		add_contact_post: add_contact_post,
		contacts: contacts,
		contact: contact,
		contactInfo: contactInfo,
		contactGroups: contactGroups,
		addGroupsPost: addGroupsPost,
		removeGroupPost: removeGroupPost,
		addGroups: addGroups,
		contactUpdate: contactUpdate,
		contactUpdatePost: contactUpdatePost,
		contactDelete: contactDelete
	}


}


module.exports = contactController;






