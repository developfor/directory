'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Group = new Schema({
	title: {
		type: String,
		require: true,
		validate: /\S+/
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
		// validate: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,})?$/,
		// default: null
	},

	group_type:{
		type: String
	},
	industry:{
		type: String
	},

	creation_day: {
		type: String,
		default: ""
	},

	primary_phone: {
		type: String,
	},
	fax: {
		type: String,
	},
	
	// ----- Address info -------
	street: {
		type: String,
		default: ""
	},
	city: {
		type: String,
		default: ""
	},
	state_province_region: {
		type: String,
		default: ""
	},
	postal_code: {
		type: String,
		default: ""
	},
	country: {
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


module.exports = mongoose.model('Group', Group);