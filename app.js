"use strict";

var express = require('express');
// var multer  = require('multer');

// var http = require('http');

var path = require('path');
var app = express();
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var passport = require('passport');
// var auth = require('basic-auth')

var moment = require('moment');

var mongoose = require('mongoose');
var route = require('./routes/index.js');

// var connect = require('connect');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// var passport = require('passport');
// var flash = require('connect-flash');
// var LocalStrategy = require('passport-local').Strategy;
// var cookieParser = require('cookie-parser');
var multer  = require('multer');



var db = require('./config/db');
var secret_key = require('./config/secret.js');
var passport = require('./config/passport.js');





app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


String.prototype.trunc = String.prototype.trunc || function(n){
    return (this.length > n) ? this.substr(0,n-1)+'...' : this;
};
String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};


// app.use(bodyParser.urlencoded({ extended: false }))

// app.use(logger('combined'));
app.use(methodOverride('_method'))
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(methodOverride());
app.use(session({ secret: secret_key.secret }));
app.use(flash());

app.use(express.static(__dirname + '/public'));




// app.use(multer({ 
//       dest: './public/tmp/',
//       limits: {
//          // fieldNameSize: 100,
//             // fileSize: 5242880,
//             // fileSize: 428,
//             files: 1,
//             fields: 1
//       },
//         fileFilter: function (req, file, cb) {
//         console.log(req);
//           if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
//             cb(null, false)

//           } else {
//             // console.log(file)
//             console.log(file.originalname + ' is starting ...');
//             cb(null, true)
//             console.log("what !!!!")
//           }

//        }

//     }).single("image"));




mongoose.connect(db.url);

passport(app);

route(app);


// Handle 404
app.use(function(req, res) {
 res.send('404: Page not Found', 404);
});



////////////////////////
// error handler
////////////////////////
app.use(function (err, req, res, next) {
	// console.log(req.file)
  if (err.code === 'LIMIT_FILE_SIZE') {
     //res.send('File is too big')
     res.redirect("..?error=1")
     // res.redirect("..")
    return 
  }
  // Handle any other errors
})




// Handle 500
app.use(function(error, req, res, next) {
 // res.send('500: Internal Server Error', 500);




 
 res.send('Uh-oh :(', 500);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  

  console.log('App listening at http://%s:%s', host, port);
});




