'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Org = new Schema({
	name: {
		type: String,
		require: true,
		validate: /\S+/
	},
	description: {
		type: String
	},
	creation_date: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('Org', Org);