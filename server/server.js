var express = require('express');
var db = require('./models/models');

//middleware
var parser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jwt-simple');
var cookieParser = require('cookie-parser');
var passwords = require('./passwords.js');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

//router
var router = require('./config/routes.js');

var app = express();

//set port and listen
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Listening on port:'+port);
});

//logging and parsing
app.use(morgan('dev'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use(cookieParser());

//set up routes
app.use('/api', router);

//serve client files
app.use(express.static(__dirname + '/../client'));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/***** FACEBOOK AUTH *****/
var User = db.User;
var FACEBOOK_APP_ID = passwords.appId;
var FACEBOOK_APP_SECRET = passwords.appSecret;

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName','email', 'cover']
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {
      User.findOrCreate({ where:{
        facebookID: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value
      }})
        .spread(function (user, created) {
          return cb(null, user);
      });
    });
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook', {scope: 'email'}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.cookie('userID', req.user.id);
    res.cookie('facebookID', req.user.facebookID);
    res.cookie('displayName', req.user.displayName);
    res.cookie('email', req.user.email);

    res.redirect('/');
  });

  var GOOGLE_CLIENT_ID = passwords.googleId;
  var GOOGLE_CLIENT_SECRET = passwords.googleSecret;

  // we will have to redo callbackURL once we deploy
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // console.log("google prof ",profile.emails[0].value);
      process.nextTick(function() {
        User.findOrCreate({ where:{
          googleID: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value
        }})
          .spread(function (user, created) {
            console.log("use crea ", user, created);
            return cb(null, user);
        });
      });
      //
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  ));

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['email'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      res.cookie('userID', req.user.id);
      res.cookie('googleID', req.user.googleID);
      res.cookie('displayName', req.user.displayName);
      res.cookie('email', req.user.email);
      res.redirect('/');
    });





//if we are being rung directly, run the server
if(!module.parent) {
  app.listen(app.get('port'));
  console.log('Listening on', app.get('port'));
}

module.exports.app = app;
