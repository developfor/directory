'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Event = new Schema({
	title: {
		type: String,
		require: true,
		validate: /\S+/
	},
	start_date:{
		type: Date
	},
	end_date:{
		type: Date
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
	}
});

module.exports = mongoose.model('Event', Event);