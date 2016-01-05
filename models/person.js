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
		validate: /\S+$/,
		validator: function(v) {
	        return /\S+$/.test(v);
	      },
	     message: '{VALUE} is not a valid name!'
	},
	lowercase_first_name:{
		type: String,
		require: true,
		validate: /\S+$/,
		validator: function(v) {
	        return /\S+$/.test(v);
	      },
	     message: '{VALUE} is not a valid name!'

	},
	middle_name: {
		type: String
	},
	lowercase_middle_name:{
		type: String
	},
	last_name: {
		type: String,
		require: true,
		validate: /\S+$/,
		validator: function(v) {
	        return /\S+$/.test(v);
	      },
	      message: '{VALUE} is not a valid name!'
	},
	lowercase_last_name:{
		type: String,
		require: true,
		validate: /\S+$/,
		validator: function(v) {
	        return /\S+$/.test(v);
	      },
	     message: '{VALUE} is not a valid name!'

	},
	suffix: {
		type: String,
		default: ""
	},

	// ----- general info -------
	job_title: {
		type: String,
		default: ""
		// require: true,
		// validate: /\S+/
	},
	gender: {
		type: String,
		default: ""
		// require: true,
		// validate: /\S+/
	},
	birthday: {
		type: String,
		default: ""
		// type: Date,
		// default: null
	},

	// ----- description info -------
	short_description: {
		type: String,
		default: ""
	},

	description: {
		type: String,
		default: ""
	},



	// ----- contact info -------
	email: {
		type: String,
		default: "",
		validator: function(v) {
	        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,})?$/.test(v);
	      },
	      message: '{VALUE} is not a valid email!'
	    
	},
	primary_phone: {
		type: String,
		default: ""
	},
	mobile_phone: {
		type: String,
		default: ""
	},
	fax: {
		type: String,
		default: ""
	},
	address: {
		type: String,
		default: ""
	},

	// ----- online presence info -------
	web_address: {
		type: String,
		default: ""
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
		 // default: null
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
	hex_color: {
		// require: true,
		type: String,
		default: "363636"
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