'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person_group_join = new Schema({
	hub_id: {
		type: Schema.ObjectId,
		require: true,
		ref: "Person"
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
Person_group_join.index({ hub_id: 1, group_id: 1, person_id: 1 }, { unique: true });

module.exports = mongoose.model('Person_group_join', Person_group_join);