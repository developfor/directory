"use strict";

var mongoose = require('mongoose');
var Profile = require('../models/profile.js');

var profile = new Profile({ first_name: 'fluffy_b', 
							last_name: 'cat_b', 
							description: 'This is a stupid fluffy cat.'
						});

profile.save(function (err, profile) {
  if (err) return console.error(err);
});



module.exports = function(app) {

	app.get('/', function (req, res) {
		return Profile.find({}, null, function(err, profiles){
			console.log("err: " + err);
			console.log(profiles);
			res.send(profiles)
		})

		
	// 	// Profile.find({}).exec(function(err, profile){
	// 	// 	console.log(profile)
	// 	// })
	// // 	// return Profile.find({},null,function(err, profiles) {
	// //  //      if(!err) {
	// //  //      	console.log('profiles: ' + profiles);
	// //  //        return res.send(profiles);

	// //  //        // return res.render('index', {
	// //  //        //   title:('Lots of T-Shirts'),
	// //  //        //   tshirts: tshirts
	// //  //        // })
	// //  //      } else {
	// //  //        res.statusCode = 500;
	// //  //        console.log('Internal error(%d): %s',res.statusCode,err.message);
	// //  //        return res.send({ error: 'Server error' });
	// //  //      }
	// //  //    });
 // //  		// res.send('one two three');
	});

	// // app.get('/profiles', function (req, res) {
 // //  		// res.send('this is');
	// // });

}

