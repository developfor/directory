"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');

var crypto = require('crypto');
var forEachAsync = require('forEachAsync').forEachAsync;

var Person = require('../models/person.js');
var Group = require('../models/group.js');
var Hub = require('../models/hub.js');
var PersonGroupJoin = require('../models/person_group_join.js');
var csrf = require('csurf')

var bodyParser = require('body-parser')


var upload = require('./../helpers/upload.js').upload;
var imageProcessor = require('./../helpers/image_processor.js');
var deleteImgFile = require('./../helpers/delete_img_file.js')

var moment = require('moment');


// Private Functions
var hubchecker = function(req, res, method){
	Hub.findById(req.params.id, function(err, hub){
		if(err){ 
			res.redirect('/hubs');
			return console.log("err: " + err) 
		}
		console.log("hubchecked")

		return method(hub);

	});
}




// Public Functions
var personController = function(personService, app ){

	var add_person = function (req, res) {

		var render = function(){
			res.render('person/add_person', {csrfToken: req.csrfToken(), person : ""})
		}

		// running the hubchecker
		hubchecker(req, res, render)
		
	}


	// ADD Person
	var add_person_post = function (req, res) {
		var postPerson = function(){

			var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
			var randomString = token;

			var requestBody = req.body;
			var person = new Person();
			
			person.hub_id = mongoose.Types.ObjectId(req.params.id);

	
		    person.title = requestBody.title;
			person.first_name = requestBody.first_name.replace(/[^a-zA-Z0-9\s]/gi, "");
			person.middle_name = requestBody.middle_name.replace(/[^a-zA-Z0-9\s]/gi, "");
			person.last_name = requestBody.last_name.replace(/[^a-zA-Z0-9\s]/gi, "");
			person.lowercase_first_name = requestBody.first_name.toLowerCase();
			person.lowercase_middle_name = requestBody.middle_name.toLowerCase();
			person.lowercase_last_name = requestBody.last_name.toLowerCase();
			person.suffix = requestBody.suffix;
			person.job_title = requestBody.job_title;
			person.gender = requestBody.gender;
			person.birthday = requestBody.birthday;

			person.short_description = requestBody.short_description;
			person.description = requestBody.description;

			person.email = requestBody.email;
			person.primary_phone = requestBody.primary_phone;
			person.mobile_phone = requestBody.mobile_phone;
			person.address = requestBody.address;
			person.web_address = requestBody.web_address;


			var save = function(){
				person.save(function(err,person){
					if(err){
						console.log('Error while saving image: ' + err);
						// res.send({ error:err });
						// res.send();
						req.flash('message','something went wrong');
						return res.redirect("/hub/"+req.params.id+"/add_person" );
					} else {
						console.log(person)
						return res.redirect("/hub/"+req.params.id+"/person/"+person._id );
					}	
				});
			}

			if(req.file !== undefined){
			
			    person.img_originalname = req.file.originalname;
				person.img_foldername = randomString;
				person.img_icon = "icon_" + randomString +".jpg";
				person.img_thumbnail = "thumb_" + randomString +".jpg";
				person.img_normal = "normal_" + randomString+".jpg";

			    imageProcessor(req,res, randomString, function(){
					return save()
			    })

			     
			}else{
				return save()
			}
		}
			// running the hubchecker
		return hubchecker(req, res, postPerson)
	}





	// Read Persons
	var persons = function (req, res) {
		var readPersons = function(hub){
			console.log("persons")

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			console.log(req.query.first_name)
			console.log(req.query.last_name)

			
			if(_.isEqual(userId, hubOwner)){

				var firstName = req.query.first_name || ""
				var lastName = req.query.last_name || ""


				firstName = firstName.replace(/[^a-zA-Z0-9\s]/gi, "")
				lastName = lastName.replace(/[^a-zA-Z0-9\s]/gi, "")

				 if(firstName.length <= 0  && lastName.length <= 0){
				 	var sort = {sort: {update_date: -1} } 
				 	console.log("empty")
				 }else{
				 	var sort = {sort: { lowercase_last_name: 1, lowercase_first_name: 1}} 
					console.log("full")
				 }


				Person.find({hub_id: hub.id, lowercase_first_name: new RegExp('^'+firstName.toLowerCase(), "i"), lowercase_last_name: new RegExp('^'+lastName.toLowerCase(), "i")}, null, sort, function(err, persons){
					if(err){ 
						res.redirect('/hubs');
					    console.log("err: " + err) 
					}
					
					return res.render('person/persons', {hub: hub, persons: persons, query: req.query, user: user});
					console.log(person) 
				}).limit(20).skip(req.query.skip*20);
				return;

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/hubs');
			}		
			
		}

		return hubchecker(req, res, readPersons)
      
    }
	




	// Read Person
	var person = function (req, res) {
		var readPerson = function(hub){
			console.log("person id")
			
			
			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				return Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					if(err || person === null){ 	
						req.flash('info', "Person not found.")
						res.redirect('/hub/:id');
						return console.log("err++: " + err) 	
					}
					console.log(person);
					var updateDate = moment(person.update_date).format('ll @ h:mma');
					var creationDate = moment(person.creation_date).format('ll @ h:mma');


					var ptitle = person.title || "";
					var pmiddle = person.middle_name || "";	
					var psuffix = person.suffix || "";

					var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;

					res.render('person/person', {title: title, person : person, hub: hub, updateDate: updateDate, creationDate: creationDate   });
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}			
		}
		return hubchecker(req, res, readPerson)
	}






	var personInfo = function (req, res) {

		var readPerson = function(hub){

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				return Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					if(err || person === null){ 	
						req.flash('info', "Person not found.")
						res.redirect('/hub/:id');
						return console.log("err++: " + err) 	
					}
					console.log(person);
					var creationDate = moment(person.creation_date).format('ll @ h:mma');
					var updateDate = moment(person.update_date).format('ll @ h:mma');


					var ptitle = person.title || "";
					var pmiddle = person.middle_name || "";	
					var psuffix = person.suffix || "";

					var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;


					res.render('person/info', {title: title, person : person, hub: hub, updateDate: updateDate, creationDate: creationDate   });
				})

			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}

		}

		return hubchecker(req, res, readPerson)
	}









	var personGroups = function (req, res) {

		var readPerson = function(hub){

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				PersonGroupJoin.find({person_id: req.params.person_id, hub_id: hub.id}, function(err, groupJoins){		

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
					    

						Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
							if(err || person === null){ 	
								req.flash('info', "Person not found.")
								res.redirect('/hub/:id');
								return console.log("err++: " + err) 	
							}
							// console.log(person);
							var creationDate = moment(person.creation_date).format('ll @ h:mma');
							var updateDate = moment(person.update_date).format('ll @ h:mma');


							var ptitle = person.title || "";
							var pmiddle = person.middle_name || "";	
							var psuffix = person.suffix || "";
							console.log(groupArray);
							var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;
							res.render('person/groups', {title: title, person : person, hub: hub, updateDate: updateDate, creationDate: creationDate, groupArray: groupArray });


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

		return hubchecker(req, res, readPerson)
	}










	var personUpdate = function (req, res) {

		var readPerson = function(hub){
			return Person.findById(req.params.person_id, function(err, person){
				if(err || person === null){ 	
					req.flash('info', "Person not found.")
					res.redirect('/hub/:id');
					return console.log("err++: " + err) 	
				}	
				console.log(person);
				res.render('person/person_update', {person : person, csrfToken: req.csrfToken()});
			})


		}
		return hubchecker(req, res, readPerson)
	}





	var personUpdatePost = function (req, res) {

		var postPerson = function(hub){

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){


				Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function (err, person) {
					console.log(person.img_foldername)
					var oldPersonImg = person.img_foldername;

					if(err || person === null){ 	
						req.flash('info', "Person not found.");
						res.redirect('/hub/:id/persons');
						return console.log("err++: " + err);
					}	

					var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
					var randomString = token;
					var requestBody = req.body;
					


					// var person = new Person();
					
					person.hub_id = req.params.id;
					person.update_date = Date.now();

			
				    person.title = requestBody.title;
			

					person.first_name = requestBody.first_name.replace(/[^a-zA-Z0-9\s]/gi, "");
					person.middle_name = requestBody.middle_name.replace(/[^a-zA-Z0-9\s]/gi, "");
					person.last_name = requestBody.last_name.replace(/[^a-zA-Z0-9\s]/gi, "");
					person.lowercase_first_name = requestBody.first_name.toLowerCase();
					person.lowercase_middle_name = requestBody.middle_name.toLowerCase();
					person.lowercase_last_name = requestBody.last_name.toLowerCase();


					person.suffix = requestBody.suffix;
					person.job_title = requestBody.job_title;
					person.gender = requestBody.gender;
					person.birthday = requestBody.birthday;


					person.short_description = requestBody.short_description;
					person.description = requestBody.description;

					person.email = requestBody.email;
					person.primary_phone = requestBody.primary_phone;
					person.mobile_phone = requestBody.mobile_phone;
					person.address = requestBody.address;
					person.web_address = requestBody.web_address;

					console.log("_____________________");
					console.log(requestBody);
					console.log("_____________________");
					
					var save = function(){

							person.save(function(err){
								if(err){
									console.log('Error while saving: ' + err);
									res.send({ error:err });

									return;
								} else {
									console.log("2 second call")
									return res.redirect("/hub/"+req.params.id+"/person/"+person._id );

								}	
							});

					}

					if(req.file !== undefined){
					
					    person.img_originalname = req.file.originalname;
						person.img_foldername = randomString;
						person.img_icon = "icon_" + randomString +".jpg";
						person.img_thumbnail = "thumb_" + randomString +".jpg";
						person.img_normal = "normal_" + randomString+".jpg";

					    imageProcessor(req,res, randomString, function(){
							save();
							console.log("++++++++++++++++++++++++");

							console.log(person.img_foldername);

							console.log(oldPersonImg);
							console.log("++++++++++++++++++++++++");
							deleteImgFile(oldPersonImg);
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

		return hubchecker(req, res, postPerson);

	}












	var personDelete = function (req, res) {

		var postPerson = function(hub){


			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){

					console.log("-----------------");
					console.log(person.first_name);
					console.log("-----------------");
					deleteImgFile(person.img_foldername);
				
				      if(!person) {
				        res.statusCode = 404;
				        return res.send({ error: 'Not found' });
				      }

				      return Person.remove({_id: req.params.person_id, hub_id: hub.id}, function(err) {
				        if(!err) {
				          console.log('Removed person');
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
			  return res.redirect('/hubs');
			}

		}
		return hubchecker(req, res, postPerson);
	}











	








	return{
		add_person: add_person,
		add_person_post: add_person_post,
		persons: persons,
		person: person,
		personInfo: personInfo,
		personGroups: personGroups,
		personUpdate: personUpdate,
		personUpdatePost: personUpdatePost,
		personDelete: personDelete
	}


}


module.exports = personController;






