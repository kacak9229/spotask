// Facebook, Github, Twitter Login
var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
// Google signup

var secret = require('./secret');
var User = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/*
 Sign in using Email and Password
*/
passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ email:  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.comparePassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));


/* Oauth overview

*/

/*
  Facebook Strategy
*/
passport.use(new FacebookStrategy(secret.facebook, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) {
      req.flash('errors', { msg: 'There is already a Facebook account that belongs to you.'});
      done(err);
      } else {
          User.findById(req.user.id, function(err, user) {
            user.role = 'user';
            user.facebook = profile.id;
            user.tokens.push({ kind: 'facebook', accessToken: accessToken });
            user.profile.name = user.profile.name || profile.displayName;
            user.profile.gender = user.profile.gender || profile._json.gender;
            user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
            user.save(function(err) {
              req.flash('info', { msg: 'Facebook account has been linked. '});
            });
          });
        }
    });
  } else {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address.'})
        } else {
          var user = new User();
          user.role = 'user';
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login');
}

exports.requireRole = function(role) {
   return function(req, res, next) {
        if(req.user && req.user.role === role)
            next();
        else
            res.send(403);
    }
}

exports.validateResume = function(req, res, next) {
  var skills = req.user.resume.skills.length === 0;
  var edu = req.user.resume.educations.length === 0;
  if (req.isAuthenticated() && (edu && skills ) && req.user.role === 'user') {
    return res.redirect('/no-resume');
  } else {
    next();
  }
}

exports.checkResume = function(req, res, next) {
  var skills = req.user.resume.skills.length === 0;
  var edu = req.user.resume.educations.length === 0;
  if (req.isAuthenticated() && (edu && skills ) && req.user.role === 'user') {
    return res.redirect('/no-resume');
  } else if (req.isAuthenticated() && req.user.role === 'user'){
    return next();
  } else if (req.user.role === 'company'){
    return res.redirect('/company-login');
  } else {
    return res.redirect('/login');
  }
}
