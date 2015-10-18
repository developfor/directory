'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Group = new Schema({
	title: {
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
	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Hub"
	},
});


module.exports = mongoose.model('Group', Group);