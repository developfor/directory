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


var bodyParser = require('body-parser')


var upload = require('./../../helpers/upload.js').upload;
var imageProcessor = require('./../../helpers/image_processor.js');
var deleteImgFile = require('./../../helpers/delete_img_file.js')





var moment = require('moment');


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

	var personController = require('./../../controllers/person.js')(null, app)

	app.use(bodyParser.urlencoded({
	    extended: true
	}));


	app.all('/hub', ensureAuthenticated, nocache);
	app.all('/hub/*', ensureAuthenticated, nocache);
	app.all('/hub/:id/add_person', ensureAuthenticated, nocache);
	app.all('/hub/:id/persons',ensureAuthenticated, nocache);
	app.all('/hub/:id/person',ensureAuthenticated, nocache);
	app.all('/hub/:id/person/*',ensureAuthenticated, nocache);


	// var fname = ""
	// var lname = "w"
	// return Person.find({first_name: new RegExp('^'+fname, "i"), last_name: new RegExp('^'+lname, "i")}, function(err, person){
	// 	if(err){ 
	// 		res.redirect('/hubs');
	// 		return console.log("err: " + err) 
	// 	}
	// 	return console.log(person) 
	// });


	// CREATE 
	app.get('/hub/:id/add_person', csrfProtection, personController.add_person)



	// CREATE parseForm, csrfProtection,
	app.post('/hub/:id/add_person', upload.single('image'), csrfProtection,  personController.add_person_post)

	// READ Persons
	app.get('/hub/:id/persons', personController.persons)

	// READ Person
	app.get('/hub/:id/person/:person_id', personController.person)

	
	app.get('/hub/:id/person/:person_id/info', personController.personInfo)

	// app.get('/hub/:id/person/:person_id/info', function (req, res) {
		
	// 		return Hub.findById(req.params.id, function(err, hub){

	// 					if(err || hub === null){ 	
	// 						req.flash('info', "Hub not found.")
	// 						res.redirect('/hubs');
	// 						return console.log("err++: " + err) 	
	// 					}

	// 					var hubOwner = hub.user_owner_id
	// 					var user = req.user._id

	// 					if(_.isEqual(user, hubOwner)){

	// 						return Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
	// 							if(err || person === null){ 	
	// 								req.flash('info', "Person not found.")
	// 								res.redirect('/hub/:id');
	// 								return console.log("err++: " + err) 	
	// 							}
	// 							console.log(person);
	// 							var creationDate = moment(person.creation_date).format('ll @ h:mma');
	// 							var updateDate = moment(person.update_date).format('ll @ h:mma');


	// 							var ptitle = person.title || "";
	// 							var pmiddle = person.middle_name || "";	
	// 							var psuffix = person.suffix || "";

	// 							var title = ptitle  +" "+  person.first_name +" "+ pmiddle +" "+ person.last_name +" "+ psuffix;


	// 							res.render('person/info', {title: title, person : person, hub: hub, updateDate: updateDate, creationDate: creationDate   });
	// 						})

				  
	// 					} else {
	// 						console.log("not equals");
	// 						// console.log(req);
	// 					  // return res.redirect('/hubs');
	// 					  res.send('404: Page not Found', 404);
	// 					}

				
	// 		});
	// });




	// UPDATE
	app.get('/hub/:id/person/:person_id/update', csrfProtection, personController.personUpdate)

	// app.get('/hub/:id/person/:person_id/update', csrfProtection, function (req, res) {
	// 	return Person.findById(req.params.person_id, function(err, person){
	// 		if(err || person === null){ 	
	// 			req.flash('info', "Person not found.")
	// 			res.redirect('/hub/:id');
	// 			return console.log("err++: " + err) 	
	// 		}	
	// 		console.log(person);
	// 		res.render('person/person_update', {person : person, csrfToken: req.csrfToken()});
	// 	})
	// });

	app.post('/hub/:id/person/:person_id/update', upload.single('image'), csrfProtection, personController.personUpdatePost);

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
				
				// deleteImgFile(person.img_foldername);
				Person.findOne({_id: req.params.person_id, hub_id: hub.id}, function(err, person){

					console.log("-----------------");
					console.log(person.first_name);
					console.log("-----------------");
					deleteImgFile(person.img_foldername);
					// var rmdir = require( 'rmdir' );
					// var path = 'public/uploads/img/' + person.img_foldername
					
					// rmdir( path, function ( err, dirs, files ){
					// 	console.log(err)
					//   console.log( dirs );
					//   console.log( files );
					//   console.log( 'all files are removed' );
					// });

					 // if(person.img_foldername !== undefined){
					  	
						// }
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




					// return person.remove({_id: req.params.person_id, hub_id: hub.id}, function(err, person){
					// 		if(err || person === null){ 	
					// 			req.flash('info', "Person not found.")
					// 			res.redirect('/hub/:id');
					// 			return console.log("err++: " + err) 	
					// 		}
					// 		console.log("-----------------");
					// 		console.log(person);
					// 		console.log("-----------------");
					// 		// if(person.img_foldername !== null){
							  	
					// 		// }
					// 		return res.redirect('/hub/'+ hub.id + '/persons' );

					// 		// res.render('person/person', {person : person});
					// 	})


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

