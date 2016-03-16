"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');


var crypto = require('crypto');


var forEachAsync = require('forEachAsync').forEachAsync;

var Person = require('../models/person.js');
var Group = require('../models/group.js');
var Hub = require('../models/hub.js');
var User = require('../models/user.js');
var PersonGroupJoin = require('../models/person_group_join.js');
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
var personController = function(personService, app ){

	var add_person = function (req, res) {


		var render = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			res.render('person/add_person', {csrfToken: req.csrfToken(), person : "", user: user, hub: hub})
		}

		// running the hubchecker
		return hubchecker(req, res, render)
		
	}


	// ADD Person
	var add_person_post = function (req, res) {
		var postPerson = function(hub){

			var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
			var randomString = token;

			var requestBody = req.body;
			var intials = requestBody.first_name.replace(/\s+/g, '').charAt(0).toUpperCase()

			var person = new Person();
			
			person.hub_id = hub._id;

			person.obj_type = sanitize(requestBody.obj_type).personEntity();

			person.defaultSmallThumb = canvasThumbnail(intials).smallTextThumb()
			person.defaultBigThumb = canvasThumbnail(intials).bigTextThumb()

		  
			person.first_name = sanitize(requestBody.first_name).cleanedHTMLCHAR();
			
			person.lowercase_first_name = sanitize(requestBody.first_name.toLowerCase()).cleanedHTMLCHAR();

			person.job_title = sanitize(requestBody.job_title).noTagsCleanedHTML();
			person.gender = sanitize(requestBody.gender).cleanedHTMLCHAR();

			person.birthday = new Date(requestBody.birth_month + " " + requestBody.birth_day + " " + requestBody.birth_year)

			person.short_description = sanitize(requestBody.short_description).noTagsCleanedHTML();
			person.description = sanitize(requestBody.description).cleanedHTML();

			person.email = sanitize(requestBody.email).noTagsCleanedHTML();

			person.primary_phone = sanitize(requestBody.primary_phone).noTagsCleanedHTML();
			person.mobile_phone = sanitize(requestBody.mobile_phone).noTagsCleanedHTML();
			person.fax = sanitize(requestBody.fax).noTagsCleanedHTML();

			person.street = sanitize(requestBody.street).noTagsCleanedHTML();
			person.city = sanitize(requestBody.city).noTagsCleanedHTML();
			person.state_province_region = sanitize(requestBody.state_province_region).noTagsCleanedHTML();
			person.postal_code = sanitize(requestBody.postal_code).noTagsCleanedHTML();
			person.country = sanitize(requestBody.country).noTagsCleanedHTML();

			person.web_address = sanitize(requestBody.web_address).noTagsCleanedHTML();



			var color = [ "222222", "333333", "444444", "555555", "666666", "777777", "888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE"]
			person.hex_color = color[Math.floor( Math.random() * ( color.length ) ) ] //(Math.random()*0xFFFFFF<<0).toString(16);


			var save = function(){
				person.save(function(err,person){
					if(err){
						console.log('Error while saving image: ' + err);
						// res.send({ error:err });
						// res.send();
						req.flash('message','something went wrong');
						return res.redirect("/@/"+req.params.id+"/add_person" );
					} else {
						console.log(person)
						return res.redirect("/@/"+req.params.id+"/person/"+person._id );
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
			// console.log("persons")

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user
			
			if(_.isEqual(userId, hubOwner)){

				var firstName = req.query.first_name || ""

				var objType = req.query.obj_type  || ""

				if(objType === "all" ){
				 	objType = ""
				 }

				 if(objType === "people" ){
				 	objType = "person"
				 }

				 if(objType === "entities" ){
				 	objType = "entity"
				 }

				console.log(objType)
				// firstName = firstName.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");

				 // if(req.query.obj_type != undefined){
				 // 	console.log("all")
				 // 	req.query.obj_type =  ""
				 // }

				 if(firstName.length <= 0){
				 	if( objType === "" ){
				 		var findText = {
					 		hub_id: hub.id, 
					 		first_name: new RegExp('^'+firstName.toLowerCase(), "i")
				 		} // , obj_type: "entity"
					 }else{
				 		var findText = {
					 		hub_id: hub.id, 
					 		first_name: new RegExp('^'+firstName.toLowerCase(), "i"), 
					 		obj_type: objType  
				 		}

					 	}
				 	var sort = {sort: {update_date: -1} } 
				 	// console.log("empty")
				 }else{
				 	// var findText =  {hub_id: hub.id, first_name:{    $regex : ".*"+firstName+"*"}} //firstName.toLowerCase() }
				 	// var findText =  {hub_id: hub.id, first_name:{ $text: { $search: firstName } }}
				 	if(objType === "" ){
					 	var findText =  {
					 		hub_id: hub.id, 
					 		$text : { $search: "\"" +firstName.toLowerCase() +"\""  }
					        }
					}else{
						var findText =  {
					 		hub_id: hub.id, 
					 		$text : { $search: "\"" +firstName.toLowerCase() +"\""  },
					 		obj_type: objType
					        }

					}
				 	var sort = {sort: {lowercase_first_name: 1}} 
					// console.log("full")
				 }

				if(objType === "" ){
					var findTextAgain = {
						hub_id: hub.id, 
						first_name : new RegExp('^'+firstName.toLowerCase(), "i")
						// $text :/.* firstName .*/
					}
				}else{
					var findTextAgain = {
						hub_id: hub.id, 
						first_name : new RegExp('^'+firstName.toLowerCase(), "i"),
						obj_type: objType 
					}
				}
				// if(req.query.obj_type === "all" ){
				 // 	console.log("all")


				 // }

				
				 console.log(res)

				// Person.find({hub_id: hub.id, lowercase_first_name: new RegExp('^'+firstName.toLowerCase(), "i")}, null, sort, function(err, persons){
				Person.find(findText, null, sort, function(err, persons){
					console.log(persons.length === 0)

					if(err){ 
						res.redirect('/');
					    console.log("err: " + err) 
					}

					if(persons.length === 0){


						// Person.find( {hub_id: hub.id, lowercase_first_name:  new RegExp('^'+firstName.toLowerCase(), "i") }, null, sort, function(err, persons){
						Person.find( findTextAgain, null, sort, function(err, persons){
						    // console.log("}}}}}}}}}}}}}}}}}}}}}}}}}length")
						    return res.render('person/persons', {hub: hub, persons: persons, query: req.query, user: user});
						})
					}else{
						return res.render('person/persons', {hub: hub, persons: persons, query: req.query, user: user});

					}
					
					// console.log(person) 
				}).limit(20).skip(req.query.skip*20);
				return;

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/');
			}		
			
		}

		return hubchecker(req, res, readPersons)
      
    }
	








	// Read Person
	var person = function (req, res) {
		var readPerson = function(hub){
			console.log("person id")
			
			
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				return Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					if(err || person === null){ 	
						req.flash('info', "Person not found.")
						res.redirect('/@/:id');
						return console.log("err++: " + err) 	
					}

					var updateDate = person.update_date.getTime();
					var creationDate = person.creation_date.getTime();

					var ptitle = person.title || "";
					var pmiddle = person.middle_name || "";	
					var psuffix = person.suffix || "";

					var title = person.first_name;

					res.render('person/person', {title: title, user: user, person: person, hub: hub, updateDate: updateDate, creationDate: creationDate   });
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
			var userID = req.user._id
			var user = req.user

			if(_.isEqual(userID, hubOwner)){

				return Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					if(err || person === null){ 	
						req.flash('info', "Person not found.")
						res.redirect('/@/:id');
						return console.log("err++: " + err) 	
					}
					console.log(person);
					var updateDate = person.update_date.getTime();
					var creationDate = person.creation_date.getTime();

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

					person.age = getAge(new Date(person.birthday))


					var ptitle = person.title || "";
					var pmiddle = person.middle_name || "";	
					var psuffix = person.suffix || "";


					var commaCountry = ""
					if(person.country !== undefined){ commaCountry = ","} 

					person.address = person.street  +" "+  person.city +" "+ person.state_province_region +" "+ person.postal_code +" "+  person.country;


					if(person.birthday){ 
						person.birthday = moment(person.birthday).format("LL")
					}
					
					var title = person.first_name;


					res.render('person/info', {title: title, person : person, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate   });
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
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

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
								res.redirect('/@/:id');
								return console.log("err++: " + err) 	
							}
							// console.log(person);
							var updateDate = person.update_date.getTime();
							var creationDate = person.creation_date.getTime();

							var ptitle = person.title || "";
							var pmiddle = person.middle_name || "";	
							var psuffix = person.suffix || "";
							console.log(groupArray);
							var title = person.first_name;
							res.render('person/groups', {title: title, person : person, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate, groupArray: groupArray });


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







	var addGroups = function (req, res) {

		var getGroups = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
			
				Group.find({hub_id: hub.id}, null,  {sort: {update_date: -1} },  function(err, groups){

					forEachAsync(groups, function (next, element, index, array) {
						PersonGroupJoin.find({hub_id: element.hub_id, group_id: element._id, person_id: req.params.person_id }, function(err, personGroup){

								if(personGroup.length > 0){
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
					    res.render('person/add_groups', {groups : groups, user:user, person: person});
					     // console.log(groups);

					});
				});

			});

		}
		return hubchecker(req, res, getGroups);
	}









	var addGroupsPost = function (req, res) {
		var groupPost = function(hub){

			var personGroupJoin = new PersonGroupJoin();

			personGroupJoin.hub_id = mongoose.Types.ObjectId(hub._id);
			personGroupJoin.group_id = mongoose.Types.ObjectId(req.body.group_id);
			personGroupJoin.person_id = mongoose.Types.ObjectId(req.params.person_id);

			// console.dir(person_group_join)

			personGroupJoin.save(function (err, person_group) {
				if(err || person_group === null){ 	
					req.flash('info', "Did not save group.")
					res.redirect('/@/' + req.params.id+ '/add_group');
					return console.log("err++: " + err) 	
				}	
				// res.redirect('/hub/' + req.params.id+ '/groups');
				console.log("add person <<<<<<<<<<<<<<")
				res.send('Completed add person');

			});	
		}
		return hubchecker(req, res, groupPost);
	}





	var removeGroupPost = function(req, res){
		

		var removeGroup = function(hub){
			PersonGroupJoin.remove( {

				group_id: req.body.group_id,
				hub_id: hub._id,
				person_id: req.params.person_id,

			}, function(err, hub){
					// console.log(hub)
					console.log("remove person <<<<<<<<<<<<<<")

					res.send('Completed remove person');

			});
		}
		return hubchecker(req, res, removeGroup);
	}


	







	var personUpdate = function (req, res) {

		var readPerson = function(hub){
			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			return Person.findById(req.params.person_id, function(err, person){
				if(err || person === null){ 	
					req.flash('info', "Person not found.")
					res.redirect('/@/:id');
					return console.log("err++: " + err) 	
				}	
				

				person.birth_month = moment(new Date(person.birthday)).format('MMMM').toLowerCase();
				person.birth_day = moment(new Date( person.birthday)).format('D')
				person.birth_year = moment(new Date(person.birthday)).format('YYYY')

				console.log(person);

				res.render('person/person_update', {person : person, csrfToken: req.csrfToken(), user: user, hub: hub});
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
						res.redirect('/@/:id/persons');
						return console.log("err++: " + err);
					}	

					var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
					var randomString = token;
					var requestBody = req.body;

					var intials = requestBody.first_name.replace(/\s+/g, '').charAt(0).toUpperCase()

				
					
					person.hub_id = hub.id;
					person.update_date = Date.now();

			
				    
			
					person.defaultSmallThumb = canvasThumbnail(intials).smallTextThumb();
					person.defaultBigThumb = canvasThumbnail(intials).bigTextThumb();

					person.obj_type = sanitize(requestBody.obj_type).personEntity();


					person.first_name = sanitize(requestBody.first_name).cleanedHTMLCHAR();
					person.lowercase_first_name = sanitize(requestBody.first_name.toLowerCase()).cleanedHTMLCHAR();

					person.job_title = sanitize(requestBody.job_title).noTagsCleanedHTML();
					person.gender = sanitize(requestBody.gender).cleanedHTMLCHAR();

					person.birthday = new Date(requestBody.birth_month + " " + requestBody.birth_day + " " + requestBody.birth_year)

					person.short_description = sanitize(requestBody.short_description).noTagsCleanedHTML();
					person.description = sanitize(requestBody.description).cleanedHTML();

					person.email = sanitize(requestBody.email).noTagsCleanedHTML();
					person.primary_phone = sanitize(requestBody.primary_phone).noTagsCleanedHTML();
					person.mobile_phone = sanitize(requestBody.mobile_phone).noTagsCleanedHTML();
					person.fax = sanitize(requestBody.fax).noTagsCleanedHTML();


					person.street = sanitize(requestBody.street).noTagsCleanedHTML();
					person.city = sanitize(requestBody.city).noTagsCleanedHTML();
					person.state_province_region = sanitize(requestBody.state_province_region).noTagsCleanedHTML();
					person.postal_code = sanitize(requestBody.postal_code).noTagsCleanedHTML();
					person.country = sanitize(requestBody.country).noTagsCleanedHTML();

					person.web_address = sanitize(requestBody.web_address).noTagsCleanedHTML();
					
					
					var save = function(){

							person.save(function(err){
								if(err){
									console.log('Error while saving: ' + err);
									res.send({ error:err });

									return;
								} else {
									console.log("2 second call")
									return res.redirect("/@/"+req.params.id+"/person/"+person._id );

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
			  return res.redirect('/');
			}



		}

		return hubchecker(req, res, postPerson);

	}













	var personDelete = function (req, res) {

		var postPerson = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					 if(!person) {
				        res.statusCode = 404;
				        return res.send({ error: 'Not found' });
				      }


					console.log("-----------------");
					console.log(person.first_name);
					console.log("-----------------");
					deleteImgFile(person.img_foldername);
				
				     
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
			  return res.redirect('/');
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
		addGroupsPost: addGroupsPost,
		removeGroupPost: removeGroupPost,
		addGroups: addGroups,
		personUpdate: personUpdate,
		personUpdatePost: personUpdatePost,
		personDelete: personDelete
	}


}


module.exports = personController;






