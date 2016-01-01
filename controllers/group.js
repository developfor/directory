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

var groupController = function(personService, app ){

	var groups = function (req, res) {
		var readGroups = function(hub){
			var hubOwner = hub.user_owner_id
			var user = req.user._id
			
			if(_.isEqual(user, hubOwner)){
				Group.find({hub_id: hub.id}, function(err, groups){
					if(err){ return console.log("err: " + err) }
					// console.log(groups);
					res.render('group/groups', {hub: hub, groups : groups});
				})
			} else {
				console.log("not equals");
		
			  return res.redirect('/hubs');
			}
		}


		return hubchecker(req, res, readGroups)

	}



























	var add_group = function (req, res) {
		var render = function(){
			res.render('group/add_group', {csrfToken: req.csrfToken()});
		}
		hubchecker(req, res, render)
	}

	var add_group_post = function (req, res) {
		var postGroup = function(){

			var token = crypto.randomBytes(8).toString('hex') + "_" + Date.now(); 
			var randomString = token;

			console.log(req.body)

			var requestBody = req.body;
			var group = new Group();
			
			group.hub_id = mongoose.Types.ObjectId(req.params.id);

	
		    group.title = requestBody.title;
			
									
			group.short_description = requestBody.short_description;
			group.description = requestBody.description;

			group.email = requestBody.email;
			group.primary_phone = requestBody.primary_phone;
			
			group.address = requestBody.address;
			group.web_address = requestBody.web_address;


			var save = function(){
				group.save(function(err,group){
					if(err){
						console.log('Error while saving image: ' + err);
						// res.send({ error:err });
						// res.send();
						req.flash('message','something went wrong');
						return res.redirect("/hub/"+req.params.id+"/add_group" );
					} else {
						console.log(group)
						return res.redirect("/hub/"+req.params.id+"/group/"+group._id );
					}	
				});
			}

			if(req.file !== undefined){
			
			    group.img_originalname = req.file.originalname;
				group.img_foldername = randomString;
				group.img_icon = "icon_" + randomString +".jpg";
				group.img_thumbnail = "thumb_" + randomString +".jpg";
				group.img_normal = "normal_" + randomString+".jpg";

			    imageProcessor(req,res, randomString, function(){
					return save()
			    })

			     
			}else{
				return save()
			}
		}
			// running the hubchecker
		return hubchecker(req, res, postGroup)
	}




	var groupUpdate = function (req, res) {

		var readGroup = function(hub){
			return Group.findById(req.params.group_id, function(err, group){
				if(err || group === null){ 	
					req.flash('info', "Group not found.")
					res.redirect('/hub/:id');
					return console.log("err++: " + err) 	
				}	
				console.log(group);
				res.render('group/group_update', {group : group, csrfToken: req.csrfToken()});
			})


		}
		return hubchecker(req, res, readGroup)
	}



	var groupUpdatePost = function (req, res) {

		var postGroup = function(hub){

			var hubOwner = hub.user_owner_id
			var user = req.user._id

			if(_.isEqual(user, hubOwner)){


				Group.findOne({_id: req.params.group_id, hub_id: hub.id}, function (err, group) {
					console.log(group.img_foldername)
					var oldGroupImg = group.img_foldername;

					if(err || group === null){ 	
						req.flash('info', "Group not found.");
						res.redirect('/hub/:id/groups');
						return console.log("err++: " + err);
					}	

					var token = crypto.randomBytes(8).toString('hex') + "_" +Date.now(); 
					var randomString = token;
					var requestBody = req.body;
					


					// var group = new Group();
					
					group.hub_id = req.params.id;
					group.update_date = Date.now();

			
				   	group.title = requestBody.title;
			
									
					group.short_description = requestBody.short_description;
					group.description = requestBody.description;

					group.email = requestBody.email;
					group.primary_phone = requestBody.primary_phone;
					
					group.address = requestBody.address;
					group.web_address = requestBody.web_address;

					console.log("_____________________");
					console.log(requestBody);
					console.log("_____________________");
					
					var save = function(){

							group.save(function(err){
								if(err){
									console.log('Error while saving: ' + err);
									res.send({ error:err });

									return;
								} else {
									console.log("2 second call")
									return res.redirect("/hub/"+req.params.id+"/group/"+group._id );

								}	
							});

					}

					if(req.file !== undefined){
					
					    group.img_originalname = req.file.originalname;
						group.img_foldername = randomString;
						group.img_icon = "icon_" + randomString +".jpg";
						group.img_thumbnail = "thumb_" + randomString +".jpg";
						group.img_normal = "normal_" + randomString+".jpg";

					    imageProcessor(req,res, randomString, function(){
							save();
							console.log("++++++++++++++++++++++++");

							console.log(group.img_foldername);

							console.log(oldGroupImg);
							console.log("++++++++++++++++++++++++");
							deleteImgFile(oldGroupImg);
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
		return hubchecker(req, res, postGroup);


	}







	return{
		groups: groups,
		add_group: add_group,
		add_group_post: add_group_post,
		groupUpdate: groupUpdate,
		groupUpdatePost: groupUpdatePost

	}

}


module.exports = groupController;