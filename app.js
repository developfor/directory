"use strict";

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var route = require('./routes/routes.js');

var db = require('./config/db');

app.set('view engine', 'ejs');

mongoose.connect(db.url);

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

route(app);

// app.get('/', routes.findAllProfiles);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
