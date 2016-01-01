'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Group = new Schema({
	title: {
		type: String,
		require: true,
		validate: /\S+/
	},



	group_type:{
		type: String
	},
	industry:{
		type: String
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
	web_address_a: {
		type: String,
	},
	web_address_b: {
		type: String,
	},
	web_address_c: {
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





	creation_date: {
		type: Date,
		default: Date.now
	},
	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Hub"
	},
});


module.exports = mongoose.model('Group', Group);