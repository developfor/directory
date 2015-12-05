"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');

var crypto = require('crypto');

var Person = require('../../models/person.js');
var Hub = require('../../models/hub.js');
var csrf = require('csurf')

var secret_key = require('../../config/secret.js');


var passport = require('../../config/passport.js');
var flash = require('express-flash');

var csrfProtection = csrf({ cookie: true })





var upload = require('./../../helpers/upload.js').upload;
var imageProcessor = require('./../../helpers/image_processor.js');
var deleteImgFile = require('./../../helpers/delete_img_file.js')






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




	app.all('/hub', ensureAuthenticated, nocache);
	app.all('/hub/*', ensureAuthenticated, nocache);
	app.all('/hub/:id/add_person', ensureAuthenticated, nocache);
	app.all('/hub/:id/persons',ensureAuthenticated, nocache);
	app.all('/hub/:id/person',ensureAuthenticated, nocache);
	app.all('/hub/:id/person/*',ensureAuthenticated, nocache);





	// CREATE 
	app.get('/hub/:id/add_person', csrfProtection, function (req, res) {
		// console.log("rout")

		return Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			res.render('person/add_person', {csrfToken: req.csrfToken()});

		});
	})







	// CREATE parseForm, csrfProtection,
	app.post('/hub/:id/add_person', upload.single('image'), csrfProtection,  function (req, res) {
		console.log("yay!!!")

		
		return Hub.find(req.params.id, function(err, hub){

			// console.log(req.body)

			if(err || hub === null){ 	
				req.flash('info', "Hub not found.")
				res.redirect('/hubs');
				return console.log("err++: " + err) 	
			}

		


			var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
			var randomString = token;
			
			var	uploadImage = function(){
				console.log("uploading img")

					var person = new Person();
			
					person.hub_id = mongoose.Types.ObjectId(req.params.id);

					person.title = req.body.title;
					person.first_name = req.body.first_name;
					person.last_name = req.body.last_name;
					person.suffix = req.body.suffix;

					person.job_title = req.body.job_title;
					person.gender = req.body.gender;
					person.birthday = req.body.birthday;

					person.short_description = req.body.short_description;
					person.description = req.body.description;

					person.email = req.body.email;
					person.primary_phone = req.body.primary_phone;
					person.mobile_phone = req.body.mobile_phone;
					person.address = req.body.address;
					person.web_address_a = req.body.web_address;
		
					person.img_originalname = req.file.originalname;
					person.img_foldername = randomString;
					person.img_icon = "icon_" + randomString +".jpg";
					person.img_thumbnail = "thumb_" + randomString +".jpg";
					person.img_normal = "normal_" + randomString+".jpg";
				

				person.save(function(err){
					if(err){
						console.log('Error while saving image: ' + err);
						res.send({ error:err });

						return;
					} else {
						return res.redirect("/");
						// console.log("Image created");
						// ImageUpload.find(function(err, imageuploads) {

						// if(!err) {  
						//         return res.redirect("/");
						//     } else {
						//     	res.statusCode = 500;
						//     	console.log('Internal error(%d): %s',res.statusCode,err.message);
						//     	return res.send({ error: 'Server error' });
						//     }

						// });
					}	
				});
			}

			var	uploadtext = function(){

				console.log("uploading txt")
				var person = new Person();
			
					person.hub_id = mongoose.Types.ObjectId(req.params.id);

					person.title = req.body.title;
					person.first_name = req.body.first_name;
					person.last_name = req.body.last_name;
					person.suffix = req.body.suffix;

					person.job_title = req.body.job_title;
					person.gender = req.body.gender;
					person.birthday = req.body.birthday;

					person.short_description = req.body.short_description;
					person.description = req.body.description;

					person.email = req.body.email;
					person.primary_phone = req.body.primary_phone;
					person.mobile_phone = req.body.mobile_phone;
					person.address = req.body.address;
					person.web_address_a = req.body.web_address_a;
					person.web_address_b = req.body.web_address_b;
					person.web_address_c = req.body.web_address_c;

				person.save(function(err){
					if(err){
						console.log('Error while saving image: ' + err);
						res.send({ error:err });
						return;
					} else {
						console.log("Image created");
						 return res.redirect("/");
						// ImageUpload.find(function(err, imageuploads) {

						// if(!err) {  
						//         return res.redirect("/");
						//     } else {
						//     	res.statusCode = 500;
						//     	console.log('Internal error(%d): %s',res.statusCode,err.message);
						//     	return res.send({ error: 'Server error' });
						//     }

						// });
					}	
				});
			}



			if(req.file === undefined){
				// check if the file is there or not
				console.log("file undefined")
				uploadtext()

			}else{
				upload.single('image')(req, res, function (err) {

				    if (err) {
				    	console.log("err")
				    	return res.redirect('/'); 
				      // An error occurred when uploading
				    }
				    imageProcessor(req,res, uploadImage, randomString)
				    // Everything went fine
			     })
			}



























			// person.save(function (err, person) {
			// 	if(err){ 	
			// 		req.flash('info', "Did not save person.")
			// 		// res.redirect('/hub/:id/add_person');
			// 		// res.render('person/add_person');
			// 			res.redirect('/hub/' + req.params.id + '/add_person');
			// 		return console.log("err++: " + err) 	
			// 	}	
			// 	res.redirect('/hub/' + req.params.id +"/person/" + person.id);
			// });		


		})


		// var person = new Person(req.body);

		// person.save(function (err, person) {
		// 	if(err || person === null){ 	
		// 		req.flash('info', "Did not save person.")
		// 		res.redirect('/persons');
		// 		return console.log("err++: " + err) 	
		// 	}	
		//   res.redirect('persons');
		// });		
	})

	// READ
	app.get('/hub/:id/persons', function (req, res) {
		return Hub.findById(req.params.id, function(err, hub){
			if(err || hub === null){ 	
				req.flash('info', "Hub not found.")
				res.redirect('/hubs');
				return console.log("err++: " + err) 	
			}

			// console.log(hub)
			var hubOwner = hub.user_owner_id
			var user = req.user._id
			// console.log(hub.user_owner_id)
			// console.log(req.user._id)
			// console.log(_.isEqual(hub.user_owner_id, req.user._id));

			
			if(_.isEqual(user, hubOwner)){

				Person.find({hub_id: hub.id}, function(err, persons){					
						return res.render('person/persons', {hub: hub, persons: persons});
					  	console.log("equals")		
				});

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/hubs');
			}
			
		});
	})
	// READ
	app.get('/hub/:id/person/:person_id', function (req, res) {
		return Hub.findById(req.params.id, function(err, hub){
					if(err || hub === null){ 	
						req.flash('info', "Hub not found.")
						res.redirect('/hubs');
						return console.log("err++: " + err) 	
					}

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
							res.render('person/person', {person : person, hub: hub });
						})

			  
					} else {
						console.log("not equals");
						// console.log(req);
					  // return res.redirect('/hubs');
					  res.send('404: Page not Found', 404);
					}

			
		});
	});



	// UPDATE
	app.get('/hub/:id/person/:person_id/update', csrfProtection, function (req, res) {
		return Person.findById(req.params.person_id, function(err, person){
			if(err || person === null){ 	
				req.flash('info', "Person not found.")
				res.redirect('/hub/:id');
				return console.log("err++: " + err) 	
			}	
			console.log(person);
			res.render('person/person_update', {person : person, csrfToken: req.csrfToken()});
		})
	});

	app.post('/hub/:id/person/:person_id/update', csrfProtection, function (req, res) {
		console.log("update")
		return Hub.findById(req.params.id, function(err, hub){
					if(err){ 
						res.redirect('/hubs');
						return console.log("err: " + err) 
					}

					var hubOwner = hub.user_owner_id
					var user = req.user._id

					if(_.isEqual(user, hubOwner)){


						var person = new Person(req.body);
						console.log(req.params.id)
						person.hub_id = req.params.id;

						// Person.findById(req.params.person_id, function (err, person) {

						Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function (err, person) {
							console.log(person)
							if(err || person === null){ 	
								req.flash('info', "Person not found.")
								res.redirect('/hub/:id/persons');
								return console.log("err++: " + err) 	
							}	
							person._id = req.params.person_id
							person.first_name = req.body.first_name;
							person.last_name = req.body.last_name;
							person.description = req.body.description;
							person.email = req.body.email;

							person.save(function (err) {
								if (err) return console.log(err);
								res.redirect('/hub/' + req.params.id + "/person/" +  req.params.person_id);
							});
						});
						// Person.update({_id: req.params.person_id, hub_id: hub.id}, { first_name: req.body.first_name, last_name: req.body.last_name, description: req.body.description, email: req.body.email }, options, callback)








						// person.save(function (err, person) {
						// 	if(err){ 	
						// 		req.flash('info', "Did not save person.")
						// 		// res.redirect('/hub/:id/add_person');
						// 		// res.render('person/add_person');
						// 			res.redirect('/hub/' + req.params.id + '/add_person');
						// 		return console.log("err++: " + err) 	
						// 	}	
						// 	res.redirect('/hub/' + req.params.id);
						// });		




						// return Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
						// 	if(err || person === null){ 	
						// 		req.flash('info', "Person not found.")
						// 		res.redirect('/hub/:id');
						// 		return console.log("err++: " + err) 	
						// 	}
						// 	console.log(person);
						// 	res.render('person/person', {person : person, hub: hub });
						// })

			  
					} else {
						console.log("not equals");
						// console.log(req);
					  return res.redirect('/hubs');
					}

			
		});

			
		console.log("update person")

		// Person.findById(req.params.id, function (err, person) {
		// 	console.log(person)
		// 	if(err || person === null){ 	
		// 		req.flash('info', "Person not found.")
		// 		res.redirect('/persons');
		// 		return console.log("err++: " + err) 	
		// 	}	
		// 	person._id = req.params.id
		// 	person.first_name = req.body.first_name;
		// 	person.last_name = req.body.last_name;
		// 	person.description = req.body.description;
		// 	person.email = req.body.email;

		// 	person.save(function (err) {
		// 		if (err) return handleError(err);
		// 		res.redirect('/person/'+req.params.id );
		// 	});
		// });
			
	});

	app.delete('/hub/:id/person/:person_id',  function (req, res) {
		return Hub.findById(req.params.id, function(err, hub){
			if(err){ 
				res.redirect('/hubs');
				return console.log("err: " + err) 
			}

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){

				// return Person.remove({_id: req.params.id}, function(err){
				// 	// console.log("err: " + err);
				// 	if(err){ 	
				// 		req.flash('info', "Person not found.")
				// 		res.redirect('/persons');
				// 		return console.log("err++: " + err) 	
				// 	}			
				// 	console.log("delete");
				// 	res.redirect('/persons');
				// });



				return Person.remove({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					if(err || person === null){ 	
						req.flash('info', "Person not found.")
						res.redirect('/hub/:id');
						return console.log("err++: " + err) 	
					}
					console.log(person);
					return res.redirect('/hub/'+ hub.id + '/persons' );

					// res.render('person/person', {person : person});
				})

	  
			} else {
				console.log("not equals");
				// console.log(req);
			  return res.redirect('/hubs');
			}
			
		});



		
	});


	// app.post('/', function (req, res) {
	// 		// console.log(req.body);
	// 		var person = new Person(req.body);

	// 		person.save(function (err, person) {
	// 		  if (err) return console.error(err);
	// 		  res.redirect('persons');
	// 		});		
	// 	})


	// app.get('/add_person', function (req, res) {
	// 	console.log("rout")
	// 		res.render('person/add_person');
	// 	})

	

	// app.post('/add_person', function (req, res) {
	// 		console.log(req.body);
	// 		var person = new Person(req.body);

	// 		person.save(function (err, person) {
	// 			if(err || person === null){ 	
	// 				req.flash('info', "Did not save person.")
	// 				res.redirect('/persons');
	// 				return console.log("err++: " + err) 	
	// 			}	
	// 		  res.redirect('persons');
	// 		});		
	// 	})
	// ZZZZZZZZZZZZZZZZZZZZZZZZZZZZ
	// app.get('/persons', function (req, res) {
	// 	return Person.find({}, null, function(err, persons){
	// 		if(err){ return console.log("err: " + err) }
	// 		console.log(persons);
	// 		res.render('person/persons', {persons : persons});
	// 		// res.send(persons)
	// 	})
	// });

	// app.get('/person/:id', function (req, res) {
	// 	return Person.findById(req.params.id, function(err, person){
	// 		if(err || person === null){ 	
	// 			req.flash('info', "Person not found.")
	// 			res.redirect('/persons');
	// 			return console.log("err++: " + err) 	
	// 		}
	// 		console.log(person);
	// 		res.render('person/person', {person : person});
	// 	})
	// });

	// app.delete('/person/:id', function (req, res) {
	// 	console.log("deleted");
	// 	return Person.remove({_id: req.params.id}, function(err){
	// 		// console.log("err: " + err);
	// 		if(err){ 	
	// 			req.flash('info', "Person not found.")
	// 			res.redirect('/persons');
	// 			return console.log("err++: " + err) 	
	// 		}			
	// 		console.log("delete");
	// 		res.redirect('/persons');
	// 	});
	// });



	// app.get('/person/:id/update', function (req, res) {
	// 	return Person.findById(req.params.id, function(err, person){
	// 		if(err || person === null){ 	
	// 			req.flash('info', "Person not found.")
	// 			res.redirect('/persons');
	// 			return console.log("err++: " + err) 	
	// 		}	
	// 		console.log(person);
	// 		res.render('person/person_update', {person : person});
	// 	})
	// });

	// app.post('/person/:id/update', function (req, res) {
			
	// 	Person.findById(req.params.id, function (err, person) {
	// 		console.log(person)
	// 		if(err || person === null){ 	
	// 			req.flash('info', "Person not found.")
	// 			res.redirect('/persons');
	// 			return console.log("err++: " + err) 	
	// 		}	
	// 		person._id = req.params.id
	// 		person.first_name = req.body.first_name;
	// 		person.last_name = req.body.last_name;
	// 		person.description = req.body.description;
	// 		person.email = req.body.email;

	// 		person.save(function (err) {
	// 			if (err) return handleError(err);
	// 			res.redirect('/person/'+req.params.id );
	// 		});
	// 	});
			
	// });


}

