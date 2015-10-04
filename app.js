"use strict";

var express = require('express');
// var http = require('http');

var path = require('path');
var app = express();
var logger = require('morgan')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('express-flash');
var passport = require('passport')

var mongoose = require('mongoose');
var route = require('./routes/index.js');

var connect = require('connect');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// var passport = require('passport');
// var flash = require('connect-flash');
// var LocalStrategy = require('passport-local').Strategy;
// var cookieParser = require('cookie-parser');


var db = require('./config/db');
var secret_key = require('./config/secret.js');
var passport = require('./config/passport.js');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app.use(bodyParser.urlencoded({ extended: false }))

// app.use(logger('combined'));
app.use(methodOverride('_method'))
app.use(cookieParser());
app.use(bodyParser());

app.use(methodOverride());
app.use(session({ secret: secret_key.secret }));
app.use(flash());

app.use(express.static(__dirname + '/../../public'));




mongoose.connect(db.url);

passport(app);

route(app);





// Handle 404
app.use(function(req, res) {
 res.send('404: Page not Found', 404);
});

// Handle 500
// app.use(function(error, req, res, next) {
//  res.send('500: Internal Server Error', 500);
// });

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
