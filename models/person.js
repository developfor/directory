'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person = new Schema({
	first_name: {
		type: String,
		require: true,
		validate: /\S+/
	},
	last_name: {
		type: String,
		require: true,
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
	creation_date: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('Person', Person);