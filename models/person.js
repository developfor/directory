'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person = new Schema({
	// ----- name info -------
	title: {
		type: String
	},
	first_name: {
		type: String,
		require: true,
		// validate: /\S+$/
	},
	middle_name: {
		type: String,
		
		// validate: /\S+/
	},
	last_name: {
		type: String,
		require: true,
		// validate: /\S+$/
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
	web_address_a: {
		type: String,
	},
	web_address_b: {
		type: String,
	},
	web_address_c: {
		type: String,
	},






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

module.exports = mongoose.model('Person', Person);