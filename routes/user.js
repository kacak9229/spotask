var _ = require('lodash');
var secret = require('../config/secret');
var router = require('express').Router();
var passport = require('passport');
var passportConf = require('../config/passport');
var User = require('../models/user');

router.get('/login', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('accounts/login', {
      message: req.flash('success'),
      errors: req.flash('errors')
    });
});

router.get('/login/company', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('company/company-login', {
      message: req.flash('success'),
      errors: req.flash('errors')
    });
});

/*
Post Login
*/
router.post('/login', function(req, res, next) {

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local-login', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
});

router.post('/login/company', passport.authenticate('local-login', {
    successRedirect : '/company-profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));


/*
Log out
*/

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

/*
Signup
*/

router.get('/signup', function(req, res) {
  // if (req.user) return res.redirect('/');
  res.render('accounts/signup', {
    title: 'Create your account',
    message: req.flash('errors')
  });
});


router.post('/signup', function(req, res, next) {

  var user = new User();
  user.role = "user";
  user.profile.name = req.body.name;
  user.profile.picture = user.gravatar();
  user.email = req.body.email;
  user.password = req.body.password;
  console.log(user);
  if (user === '') {
    req.flash('error', 'Please fill up all the details');
    return res.redirect('/signup')
  }

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors',  'Account with that email address already exists.');
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/profile');
      });

    });
  });
});

router.get('/signup/company', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('company/company-signup', {
    title: 'Create your account',
    message: req.flash('errors')
  });
});


router.post('/signup/company', function(req, res, next) {

  var user = new User();
  user.role = "company";
  user.profile.name = req.body.name;
  user.profile.picture = user.gravatar();
  user.email = req.body.email;
  user.password = req.body.password;

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors',  'Account with that email address already exists.');
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/company-profile');
      });
    });
  });
});

router.get('/profile', passportConf.checkResume, function(req, res) {
  if (req.user) {
    User.findById({_id: req.user._id}, function(err, found) {
      if (err) return next(err);
      res.render('accounts/user-profile', {
        message: req.flash('success'),
        user: req.user
      });
    })
  } else {
    res.redirect('/login', { message: 'Please log in!', title: 'Profile' });
  }
});

// Facebook login
// send to facebook to do the authentication
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
          successRedirect : '/profile',
          failureRedirect : '/'
}));

module.exports = router;
