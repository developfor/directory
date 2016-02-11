"use strict";

// 
// var secret_key = require('../../config/secret.js');
// var passport = require('../../config/passport.js');
// passport = require('passport')
// var LocalStrategy = require('passport-local').Strategy



var mongoose = require('mongoose');
var User = require('../../models/user.js');
var Hub = require('../../models/hub.js');

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var csrf = require('csurf')
// var bodyParser = require('body-parser')
  

// var mailGunCred = require('../../config/mail.js');
var mailGunCred = {
          api_key: 'key-14065a8c4ab3a3f5a259e979c8d7402e',
          domain: 'sandboxa2ac611e09064938a4ab79a8e722006f.mailgun.org'
        }

// passport crap begin
var express = require('express')
var app = express();

// csrf
var bodyParser = require('body-parser');
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: true})


var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var SALT_WORK_FACTOR = 10;
var flash = require('express-flash');



var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === '1' && user.pass === '1') {
    return next();
  } else {
    return unauthorized(res);
  };
};



// // Bcrypt middleware
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });

// passport.use(new LocalStrategy({usernameField: 'email'},function(email, password, done) {
  
//   User.findOne({ email: email }, function(err, user) {
//     if (err) { return done(err); }
//     if (!user) { return done(null, false, { message: 'Unknown user ' + email }); }
//     user.comparePassword(password, function(err, isMatch) {
//       if (err) return done(err);
//       if(isMatch) {
//         console.log("match")
//         return done(null, user);
//       } else {
//         return done(null, false, { message: 'Invalid password' });
//       }
//     });
//   });
// }));



// passport crap end


module.exports = function(app) {
  app.use(bodyParser.urlencoded({
      extended: true
  }));


  app.all('/login', csrfProtection, parseForm);
  app.all('/', csrfProtection, parseForm);

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', function(req, res){
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl)
    if(req.isAuthenticated()){
      Hub.find({user_owner_id: req.user.id}, function(err, hub){
        console.log(hub)
        res.redirect("/@/" + req.user.username)
        // return res.render('index', { hub: hub, user: req.user, csrfToken: req.csrfToken() })
      })
      return
    }
    // console.log(req.user.id)
    // res.render('index', { user: req.user });
   //canvasThumbnail.smallTextThumb("h")



    res.render('index', { user: req.user, csrfToken: req.csrfToken() })

  });

  app.get('/signup', auth, function(req, res){
    // console.log(res)
    if (res.locals.login){ return res.redirect('/')}
      res.render('signup', { user: req.user, message: req.session.messages });
    });

  app.post('/signup', function(req, res, next){
    
    if (res.locals.login){ return res.redirect('/')}


    var user = new User(req.body);
    // userName = user.username.toLowerCase();
    user.username = req.body.username.toLowerCase();

    console.log(user)

    if(/^(\w){1,20}$/.test(user.username)){ 
      console.log("good display name")
      // return res.redirect('/signup' );
    

      user.save(function(err) {

        


        if(err) {
          console.log(err);
          // req.session.messages =  "There was an error.";
          // if (err.code === 11000){
          //    req.session.messages =  "User already exists.";
          // }
         

          return res.redirect('/signup' );
        } else {

          // console.log('user: ' + user.email + " saved.");
          // return res.redirect('/account');
          // hub.save(function (err, person) {
        //   if (err) return console.error(err);
          
        // });

          



          passport.authenticate('local', function(err, user, info) {
             // console.log("this " +user)
             
            if (err) { return next(err) }
            if (!user) {
              // req.session.messages =  [info.message];
              req.flash('info', info.message)
              return res.redirect('/signup')
            }
            req.logIn(user, function(err) {
              if (err) { return next(err); }
                 console.log("logged in");
                 console.log( req.user);
                // console.log( req.body.title);
                var hub = new Hub();
                // hub.title = req.body.title
                // hub.description = req.body.description
                hub.user_owner_id = req.user._id

                hub.save(function (err, person) {
                  if (err) return console.error(err);
                  res.redirect('/');
                }); 

          


              // return res.redirect('/');
             
              
            });
          })(req, res, next);;

        }
      });

    }else{
      return res.redirect('/signup')
    }

    // res.render('signup', { user: req.user });
  });


  app.get('/account', ensureAuthenticated, function(req, res){

    res.render('account', { user: req.user });
  });

  app.get('/change_password', ensureAuthenticated, function(req, res){
    res.render('change_password', { user: req.user });
  });

  app.post('/change_password', ensureAuthenticated, function(req, res){
    console.log(req.body)
    console.log(req.user._id);
    User.findById(req.user._id, function (err, user) {
      // done(err, user);
      var checkPassword = req.body.check_password
      user.comparePassword(checkPassword, function(err, isMatch) {
        if (err) return err;
        if(isMatch) {
          // return done(null, user);
          console.log("they equal")
          user.password = req.body.password
          user.save()
          console.log("password changed")


          // passwordchanged

          var auth = {
            auth: mailGunCred 
          }

          var nodemailerMailgun = nodemailer.createTransport(mg(auth));

         
          var mailOptions = {
            to: user.email,
            from: 'no-reply@describing.it',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          nodemailerMailgun.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your password has been changed.');
            // return res.redirect('/');
          });





        } else {
          console.log("Non equal")

          // return done(null, false, { message: 'Invalid password' });
        }
      });



      // var serialized_password  = userSchema.methods.comparePassword(req.body.password)
      // if(serialized_password === user.password){
      //   console.log("they equal")
      // }else{
      //   console.log("Non equal")
      // }

      // user.password = req.body.password
      // user.save()
      console.log("password changed")

    });


    // do a find and update for password
    res.render('account', { user: req.user });
  });


  app.get('/change_email', ensureAuthenticated, function(req, res){
    res.render('change_email', { user: req.user });
  });

  app.post('/change_email', ensureAuthenticated, function(req, res){
    // res.render('change_email', { user: req.user });
     User.findById(req.user._id, function (err, user) {
         var oldEmail = user.email
         var newEmail = req.body.email
         user.email = req.body.email
         user.save()
         console.log("email changed")


         var auth = {
            auth: mailGunCred
          }

          var nodemailerMailgun = nodemailer.createTransport(mg(auth));

         
          var mailOptions = {
            to: oldEmail,
            from: 'no-reply@describing.it',
            subject: 'Your email address has been changed',
            text: 'Hello,\n\n' +
              'This is a confirmation that the email address for your account ' + oldEmail +  ' has just been changed to ' + newEmail +'.\n'
          };
           nodemailerMailgun.sendMail(mailOptions, function(err) {
            req.flash('success', 'Success! Your email address has been changed.');
            return res.redirect('/');
          });

     })

  });





  app.get('/login',  function(req, res){
    if (res.locals.login){ return res.redirect('/')}
    res.render('login', { user: req.user, message: req.flash('info'), email: req.flash('email'), csrfToken: req.csrfToken()  });
  });

  // POST /login
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  //
  //   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
  //   
  /***** This version has a problem with flash messages
  app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
      res.redirect('/');
    });
  */
    
  // POST /login
  //   This is an alternative implementation that uses a custom callback to
  //   acheive the same functionality.
  app.post('/login',function(req, res, next) {
                        
    passport.authenticate('local', function(err, user, info) {
      // console.log(user)
      if (err) { return next(err) 
         return res.redirect('/');
      }
      if (!user) {
        // req.session.messages =  [info.message];
        req.flash('info', info.message)
        req.flash('email', info.email)
        return res.redirect('/login')
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    })(req, res, next);
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });


  app.get('/forgot', function(req, res){
    if (res.locals.login){ return res.redirect('/')}

    res.render('forgot', {
      user: req.user
    });
  });





  app.post('/forgot', function(req, res, next) {
    if (res.locals.login){ return res.redirect('/')}

    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        // mailgun config
        var auth = {
          auth: mailGunCred
        }

        var nodemailerMailgun = nodemailer.createTransport(mg(auth));

        var mailOptions = {
          to: user.email,
          from: 'no-reply@describing.it',
          subject: 'Describing Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        nodemailerMailgun.sendMail(mailOptions, function(err) {
          req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });


  app.get('/reset/:token', function(req, res) {
    if (res.locals.login){ return res.redirect('/')}

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        user: req.user
      });
    });
  });


  app.post('/reset/:token', function(req, res) {
    if (res.locals.login){ return res.redirect('/')}
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {


         var auth = {
          auth: mailGunCred
        }

        var nodemailerMailgun = nodemailer.createTransport(mg(auth));

       
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@describing.it',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
         nodemailerMailgun.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });

  function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      res.redirect('/login')
  }

}