'use strict';
var mongoose = require('mongoose');
var shortid = require('shortid');
var Schema = mongoose.Schema;

var Hub = new Schema({
	title: {
		type: String,
		require: true,
		validate: /\S+/
	},
	description: {
		type: String
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