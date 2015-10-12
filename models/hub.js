'use strict';
var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var Hub = new Schema({
	title: {
		type: String,
		require: true,
		validate: /\S+/,
		minlength: 1, 
		maxlength: 55
	},
	description: {
		type: String,
		validate: /\S+/,
		minlength: 0, 
		maxlength: 500
	},
	short_id:  {
		type: String,
	    unique: true,
	    'default': shortid.generate
	},
	user_owner_id: Schema.Types.ObjectId,
	creation_date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Hub', Hub);