'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Profile = new Schema({
	first_name: {
		type: String,
		require: true
	},
	last_name: {
		type: String,
		require: true
	},
	description: {
		type: String
	},
	email: {
		type: String
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('Profile', Profile);