'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person = new Schema({
	title: {
		type: String
	},
	first_name: {
		type: String,
		require: true,
		validate: /\S+$/
	},
	middle_name: {
		type: String,
		require: true,
		validate: /\S+/
	},
	last_name: {
		type: String,
		require: true,
		validate: /\S+$/
	},
	suffix: {
		type: String
	},
	gender: {
		type: String,
		// require: true,
		validate: /\S+/
	},
	description: {
		type: String
	},
	email: {
		type: String,
		validate: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,})?$/
	},
	group: {
		type: Array,
		default: []
	},
	hub_id: {
		type: String,
		require: true,
		validate: /\S+$/
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('Person', Person);