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
		var postPerson = function(hub){

			var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
			var randomString = token;

			var requestBody = req.body;
			var person = new Person();
			
			person.hub_id = hub._id;

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

			person.birthday = new Date(requestBody.birth_month + " " + requestBody.birth_day + " " + requestBody.birth_year)

			person.short_description = requestBody.short_description;
			person.description = requestBody.description;

			person.email = requestBody.email;
			person.primary_phone = requestBody.primary_phone;
			person.mobile_phone = requestBody.mobile_phone;
			person.fax = requestBody.fax;

			person.street = requestBody.street;
			person.city = requestBody.city;
			person.state_province_region= requestBody.state_province_region;
			person.postal_code = requestBody.postal_code;
			person.country = requestBody.country;

			person.web_address = requestBody.web_address;



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
			console.log("persons")

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			console.log(req.query.first_name)
			console.log(req.query.last_name)

			
			if(_.isEqual(userId, hubOwner)){

				var firstName = req.query.first_name || ""
				var lastName = req.query.last_name || ""


				firstName = firstName.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");
				lastName = lastName.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");

				 if(firstName.length <= 0  && lastName.length <= 0){
				 	var sort = {sort: {update_date: -1} } 
				 	console.log("empty")
				 }else{
				 	var sort = {sort: { lowercase_last_name: 1, lowercase_first_name: 1}} 
					console.log("full")
				 }


				Person.find({hub_id: hub.id, lowercase_first_name: new RegExp('^'+firstName.toLowerCase(), "i"), lowercase_last_name: new RegExp('^'+lastName.toLowerCase(), "i")}, null, sort, function(err, persons){
					if(err){ 
						res.redirect('/');
					    console.log("err: " + err) 
					}
					
					return res.render('person/persons', {hub: hub, persons: persons, query: req.query, user: user});
					console.log(person) 
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




					var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;

					res.render('person/person', {title: title, user: user, person : person, hub: hub, updateDate: updateDate, creationDate: creationDate   });
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
					
					var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;


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
							var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;
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
			var user = req.user

			Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
			
				Group.find({hub_id: hub.id}, function(err, groups){

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
					console.log(hub)
					res.send('Completed remove person');

			});
		}
		return hubchecker(req, res, removeGroup);
	}


	







	var personUpdate = function (req, res) {

		var readPerson = function(hub){
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
						res.redirect('/@/:id/persons');
						return console.log("err++: " + err);
					}	

					var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
					var randomString = token;
					var requestBody = req.body;
					


					// var person = new Person();
					
					person.hub_id = hub.id;
					person.update_date = Date.now();

			
				    person.title = requestBody.title;
			

					person.first_name = requestBody.first_name.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");
					person.middle_name = requestBody.middle_name.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");
					person.last_name = requestBody.last_name.replace(/[^a-zA-Z0-9\s]/gi, "").replace(/ +$/, "");
					person.lowercase_first_name = person.first_name.toLowerCase();
					person.lowercase_middle_name = person.middle_name.toLowerCase();
					person.lowercase_last_name = person.last_name.toLowerCase();


					person.suffix = requestBody.suffix;
					person.job_title = requestBody.job_title;
					person.gender = requestBody.gender;
					person.birthday = new Date(requestBody.birth_month + " " + requestBody.birth_day + " " + requestBody.birth_year)



					person.short_description = requestBody.short_description;
					person.description = requestBody.description;

					person.email = requestBody.email;
					person.primary_phone = requestBody.primary_phone;
					person.mobile_phone = requestBody.mobile_phone;
					person.fax = requestBody.fax;

					person.street = requestBody.street;
					person.city = requestBody.city;
					person.state_province_region= requestBody.state_province_region;
					person.postal_code = requestBody.postal_code;
					person.country = requestBody.country;

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






