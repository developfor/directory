'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person_event_join = new Schema({
	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Hub"
	},
	group_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Group"
	},
	person_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Person"
	}
});
Person_event_join.index({ hub_id: 1, event_id: 1, person_id: 1 }, { unique: true });

module.exports = mongoose.model('Person_event_join', Person_event_join);