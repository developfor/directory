'use strict';
var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var Note = new Schema({
	details: {
		type: String,	
		minlength: 0, 
		maxlength: 500,
	},

	// the parent id relates to if the object is a child of a group or a contact
	contact_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Contact"
	},

	// core details
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
	},

});

module.exports = mongoose.model('Note', Note);