'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person = new Schema({
	// ----- name info -------
	obj_type: {
		type: String,
		default: "person"
	},
	title: {
		type: String
	},
	first_name: {
		type: String,
		require: true,
		validate: /\S+$/
	},
	middle_name: {
		type: String
		
		// validate: /\S+/
	},
	last_name: {
		type: String,
		require: true,
		validate: /\S+$/
	},
	suffix: {
		type: String
	},

	// ----- general info -------
	job_title: {
		type: String,
		// require: true,
		// validate: /\S+/
	},
	gender: {
		type: String,
		// require: true,
		// validate: /\S+/
	},
	birthday: {
		type: Date,
	},

	// ----- description info -------
	short_description: {
		type: String
	},

	description: {
		type: String
	},



	// ----- contact info -------
	email: {
		type: String,
		// default: "",
		validate: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,})?$/
	},
	primary_phone: {
		type: String,
	},
	mobile_phone: {
		type: String,
	},
	address: {
		type: String,
	},

	// ----- online presence info -------
	web_address: {
		type: String,
	},

	// images 

	img_foldername:{
		type: String,
	},
	img_originalname:{
		type: String,
	},
	img_icon: {
		type: String,
	},
	img_thumbnail: {
		type: String,
	},
	img_normal: {
		type: String,
	},

	// core details

	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Hub"
	},
	update_date: {
		type: Date,
		default: Date.now
	},
	creation_date: {
		type: Date,
		default: Date.now
	}
});

// Person.pre('save', function(next) {
// 	// var validate = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,})?$/.test(Person.email)
// 	// if(validate === false){
// 	// 	// Person.email
// 	// // }else{
// 	// 	Person.email = null;
// 	// }
// 	// if Person.email === 
// 	next();
//   // var user = this;

//   // if(!user.isModified('password')) return next();

//   // crypto.pbkdf2(user.password, secret.secret, 4096, 64, 'sha256', function(err, key) {
//   //   if(err) return next(err);
//   //   // console.log(secret.secret)
//   //   console.log(key.toString('hex'));  // 'c5e478d...1469e50'
//   //   user.password = key.toString('hex');
//   //   next();
//   // });

//   // bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//   //   if(err) return next(err);

//   //   bcrypt.hash(user.password, salt, function(err, hash) {
//   //     if(err) return next(err);
//   //     user.password = hash;
//   //     next();
//   //   });
//   // });
// });

module.exports = mongoose.model('Person', Person);