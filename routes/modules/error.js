"use strict";



module.exports = function(app) {
	app.get('/error', function (req, res) {
		console.log("404 error")
			res.send('404 - error');
		})

}

