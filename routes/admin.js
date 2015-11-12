var router = require('express').Router();
var Category = require('../models/category');
var User = require('../models/user');
var passportConf = require('../config/passport');

// for getting category
router.get('/admin/add-category', passportConf.requireRole('admin'), function(req, res, next) {
	res.render('admin/category', { message: req.flash('success')});
});

router.post('/admin/add-category', function(req, res, next) {
	var category = new Category();
	category.name = req.body.name;
	category.save(function(err) {
		if (err) return next(err);
		req.flash('success', 'Added ' + category.name + ' !');
		return res.redirect('/admin/add-category');
	});
});

router.get('/admin/create/user', function(req, res, next) {
  var user = new User();
  user.email = "naufal9229@gmail.com";
  user.profile.name = "admin";
  user.password = "anjing2004";
  user.role = "admin";

  user.save(function(err,user) {
    res.json(user);
  });

});

router.get('/company/create/user', function(req, res, next) {
  var user = new User();
  user.email = "spotask@gmail.com";
  user.profile.name = "spotask";
  user.password = "abc123";
  user.role = "company";

  user.save(function(err,user) {
    res.json(user);
  });

});

router.get('/admin/check', passportConf.requireRole('admin'), function(req, res, next) {
  User.find({}, function(err, user) {
    res.json(user);
  });
});

module.exports = router;
