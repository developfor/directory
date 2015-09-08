"use strict";
module.exports = function(app) {
	require('./modules/person.js')(app);
	require('./modules/group.js')(app);
}