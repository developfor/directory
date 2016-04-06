'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Contact_group_join = new Schema({
	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Hub"
	},
	group_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Event"
	},
	contact_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Contact"
	}
});
Contact_group_join.index({ hub_id: 1, group_id: 1, contact_id: 1 }, { unique: true });

module.exports = mongoose.model('Contact_group_join', Contact_group_join);