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

}

