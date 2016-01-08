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

	// app.all('/hub', ensureAuthenticated, nocache);
	// app.all('/hub/*', ensureAuthenticated, nocache);
	// app.all('/hub/:id/add_person', ensureAuthenticated, nocache);
	// app.all('/hub/:id/persons',ensureAuthenticated, nocache);
	// app.all('/hub/:id/person',ensureAuthenticated, nocache);
	// app.all('/hub/:id/person/*',ensureAuthenticated, nocache);


	app.all('/@', ensureAuthenticated, nocache);
	app.all('/@/*', ensureAuthenticated, nocache);
	app.all('/@/:id/add_person', ensureAuthenticated, nocache);
	app.all('/@/:id/persons',ensureAuthenticated, nocache);
	app.all('/@/:id/person',ensureAuthenticated, nocache);
	app.all('/@/:id/person/*',ensureAuthenticated, nocache);


	// // READ CREATE 
	// app.get('/hub/:id/add_person', csrfProtection, personController.add_person);

	// // POST CREATE parseForm, csrfProtection,
	// app.post('/hub/:id/add_person', upload.single('image'), csrfProtection,  personController.add_person_post);

	// // READ PERSONS
	// app.get('/hub/:id/persons', personController.persons);

	// // READ PERSON
	// app.get('/hub/:id/person/:person_id', personController.person);

	// // READ INFO
	// app.get('/hub/:id/person/:person_id/info', personController.personInfo);

	// // READ GROUPS
	// app.get('/hub/:id/person/:person_id/groups', personController.personGroups);

	// // READ ADD GROUPS
	// app.get('/hub/:id/person/:person_id/add_groups', personController.addGroups);

	// //**************** ADD PERSONS POST
	// app.post('/hub/:id/person/:person_id/add_groups', personController.addGroupsPost);
	// //**************** REMOVE PERSONS POST
	// app.delete('/hub/:id/person/:person_id/add_groups', personController.removeGroupPost);


	// // READ UPDATE 
	// app.get('/hub/:id/person/:person_id/update', csrfProtection, personController.personUpdate);
	
 //    // POST UPDATE
	// app.post('/hub/:id/person/:person_id/update', upload.single('image'), csrfProtection, personController.personUpdatePost);

	// // DELETE
	// app.delete('/hub/:id/person/:person_id', personController.personDelete);






	// READ CREATE 
	app.get('/@/:id/add_person', csrfProtection, personController.add_person);

	// POST CREATE parseForm, csrfProtection,
	app.post('/@/:id/add_person', upload.single('image'), csrfProtection,  personController.add_person_post);

	// READ PERSONS
	app.get('/@/:id/persons', personController.persons);

	// READ PERSON
	app.get('/@/:id/person/:person_id', personController.person);

	// READ INFO
	app.get('/@/:id/person/:person_id/info', personController.personInfo);

	// READ GROUPS
	app.get('/@/:id/person/:person_id/groups', personController.personGroups);

	// READ ADD GROUPS
	app.get('/@/:id/person/:person_id/add_groups', personController.addGroups);

	//**************** ADD PERSONS POST
	app.post('/@/:id/person/:person_id/add_groups', personController.addGroupsPost);
	
	//**************** REMOVE PERSONS POST
	app.delete('/@/:id/person/:person_id/add_groups', personController.removeGroupPost);

	// READ UPDATE 
	app.get('/@/:id/person/:person_id/update', csrfProtection, personController.personUpdate);
	
    // POST UPDATE
	app.post('/@/:id/person/:person_id/update', upload.single('image'), csrfProtection, personController.personUpdatePost);

	// DELETE
	app.delete('/@/:id/person/:person_id', personController.personDelete);


}

