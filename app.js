"use strict";

var express = require('express');
// var http = require('http');

var path = require('path');
var app = express();
var logger = require('morgan')

var mongoose = require('mongoose');
var route = require('./routes/index.js');
var connect = require('connect')

var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var passport = require('passport')
var flash = require('connect-flash')
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser')


var db = require('./config/db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app.use(bodyParser.urlencoded({ extended: false }))

// app.use(logger('combined'));
app.use(methodOverride('_method'))
app.use(bodyParser());



mongoose.connect(db.url);

route(app);

// Handle 404
app.use(function(req, res) {
 res.send('404: Page not Found', 404);
});

// Handle 500
app.use(function(error, req, res, next) {
 res.send('500: Internal Server Error', 500);
});



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
