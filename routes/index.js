"use strict";

// var profile = require('./modules/profile.js')(app);
// var org = require('./modules/org.js')(app);

module.exports = function(app) {
	// profile(app);
	// org(app);
	require('./modules/profile.js')(app);
	require('./modules/org.js')(app);
}

// var routes = function(){
//  require('./modules/profile.js');
//  require('./modules/404.js');
// 	}

// module.exports = routes;


// var exports = {};

// /** say hello. */
// exports.profile = function() {
//     return require('./modules/profile.js');
// };

// exports.profile = require('./modules/profile.js');
// exports.org = require('./modules/org.js');

// exports.error = require('./modules/error.js');