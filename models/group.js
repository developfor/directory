'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Group = new Schema({
	name: {
		type: String,
		require: true,
		validate: /\S+/
	},
	description: {
		type: String
	},
	persons: {
		type: Array
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('Group', Group);