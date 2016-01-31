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
	// end_date:{
	// 	type: Date
	// },
	short_description: {
		type: String
	},
	description: {
		type: String
	},
	where: {
		type: String
	},
	

	start_date_time: {
		type: Date,
		default: Date.now
	},






	// core details
	hex_color: {
		// require: true,
		type: String,
		default: "363636"
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
	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Hub"
	}
});

module.exports = mongoose.model('Event', Event);