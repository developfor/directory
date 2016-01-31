"use strict";

var mongoose = require('mongoose');
var _ = require('underscore');

var crypto = require('crypto');
var forEachAsync = require('forEachAsync').forEachAsync;
var async = require('async')

var Person = require('../models/person.js');
var Group = require('../models/group.js');
var Hub = require('../models/hub.js');
var User = require('../models/user.js');
var Event = require('../models/event.js');
var PersonGroupJoin = require('../models/person_group_join.js');
var PersonEventJoin = require('../models/person_group_join.js');


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


var eventController = function(){

	
	var addEvent = function (req, res) {
		var render = function(){
			res.render('event/add_event', {csrfToken: req.csrfToken()});
		}
		hubchecker(req, res, render)
	}







	var addEventPost = function (req, res) {

		var eventSave = function(hub){
			var requestBody = req.body;



			var event = new Event();


			event.hub_id = hub._id;
			event.title = requestBody.title;
			event.short_description = requestBody.short_description;
			event.description = requestBody.description;

			if(isNaN(requestBody.start_hour_time)){
				requestBody.start_hour_time  = 0
			}
			if(isNaN(requestBody.start_minute_time)){
				requestBody.start_hour_time  = 0
			}
			if( requestBody.start_hour_time === ""){
				requestBody.start_hour_time  = "AM"
			}
			 
			event.start_date_time = new Date(requestBody.start_month + " " + requestBody.start_day + " " + requestBody.start_year + " " )

			if( event.start_date_time === ""){
				requestBody.start_hour_time  = "AM"
			}

			event.save(function (err, event) {
				if(err || event === null){ 	
					req.flash('info', "Did not save event.")
					res.redirect('/@/' + req.params.id+ '/add_event');
					return console.log("err++: " + err) 	
				}	
				res.redirect('/@/' + req.params.id+ '/events');

			});	

		}
		hubchecker(req, res, eventSave)


	}






	var event = function(req, res){
		var readEvent = function(hub){

			var hubOwner = hub.user_owner_id
			var userId = req.user._id
			var user = req.user

			if(_.isEqual(userId, hubOwner)){

				return Event.findOne({_id: req.params.event_id, hub_id: hub.id}, function(err, event){
					if(err || event === null){ 	
						req.flash('info', "Event not found.")
						res.redirect('/@/' + req.params.id);
						return console.log("err++: " + err) 	
					}


					var updateDate = event.update_date.getTime();
					var creationDate = event.creation_date.getTime();


					res.render('event/event', {event : event, hub: hub, user: user, updateDate: updateDate, creationDate: creationDate});
				})
			} else {
				console.log("not equals");
				// console.log(req);
			  // return res.redirect('/hubs');
			  res.send('404: Page not Found', 404);
			}

		}
		hubchecker(req, res, readEvent)
	}







	return{
		event: event,
		addEvent: addEvent,
		addEventPost: addEventPost	
	}

}
module.exports = eventController;