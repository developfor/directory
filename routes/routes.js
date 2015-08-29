"use strict";

var mongoose = require('mongoose');
var Profile = require('../models/profile.js');

Profile.find({}, null, function(err, profiles){
	console.log("err: " + err);
	console.log(profiles);

})

module.exports = function(app) {

	// app.get('/', function (req, res) {

	// 	res.send('hi')
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
	// });

	// // app.get('/profiles', function (req, res) {
 // //  		// res.send('this is');
	// // });

}

