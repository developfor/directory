"use strict";
module.exports = function(app) {
	require('./modules/profile.js')(app);
	require('./modules/org.js')(app);
}