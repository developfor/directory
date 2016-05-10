"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');

var crypto = require('crypto');

var Contact = require('../../models/contact.js');
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

	var contactController = require('./../../controllers/contact.js')(null, app)

	app.use(bodyParser.urlencoded({
	    extended: true
	}));



	app.all('/@', ensureAuthenticated, nocache);
	app.all('/@/*', ensureAuthenticated, nocache);
	app.all('/@/:id/add_contact', ensureAuthenticated, nocache);
	app.all('/@/:id/contacts',ensureAuthenticated, nocache);
	app.all('/@/:id/contact',ensureAuthenticated, nocache);
	app.all('/@/:id/contact/*',ensureAuthenticated, nocache);


	// READ CREATE 
	app.get('/@/:id/add_contact', csrfProtection, contactController.add_contact);

	// POST CREATE parseForm, csrfProtection,
	app.post('/@/:id/add_contact', upload.single('image'), csrfProtection,  contactController.add_contact_post);

	// READ PERSONS
	app.get('/@/:id/contacts', contactController.contacts);

	// READ PERSON
	app.get('/@/:id/contact/:contact_id',  contactController.contactInfo);

	// READ INFO
	app.get('/@/:id/contact/:contact_id/info', contactController.contactInfo);


	// READ Note
	app.get('/@/:id/contact/:contact_id/notes', contactController.contactNotes);


	// READ GROUPS
	app.get('/@/:id/contact/:contact_id/groups', contactController.contactGroups);

	// READ ADD GROUPS
	app.get('/@/:id/contact/:contact_id/add_groups', contactController.addGroups);

	//**************** ADD PERSONS POST
	app.post('/@/:id/contact/:contact_id/add_groups', contactController.addGroupsPost);
	
	//**************** REMOVE PERSONS POST
	app.delete('/@/:id/contact/:contact_id/add_groups', contactController.removeGroupPost);

	// READ UPDATE 
	app.get('/@/:id/contact/:contact_id/update', csrfProtection, contactController.contactUpdate);
	
    // POST UPDATE
	app.post('/@/:id/contact/:contact_id/update', upload.single('image'), csrfProtection, contactController.contactUpdatePost);

	// DELETE
	app.delete('/@/:id/contact/:contact_id', contactController.contactDelete);


}

