var router = require('express').Router();
var passportConf = require('../config/passport');
var User = require('../models/user');
var Job = require('../models/job');
var Category = require('../models/category');

router.use(function(req, res, next) {
	Job.find({ company: req.user._id}, function(err, jobs) {
		res.locals.jobs = jobs;
		next();
	});
});

router.get('/create-job', function(req, res, next) {
	Category.find({}, function(err, categories) {
			res.render('company/create-job', {
				error: req.flash('error'),
				success: req.flash('success'),
				categories: categories
			});
	});
});

router.post('/create-job', function(req, res, next) {
	console.log(req.body.title === '');
	var job = new Job();

	if (req.body.title === '' || req.body.body === '' || req.body.salary === '') {
		req.flash('error', 'You forgot to enter one of the fields');
		return res.redirect('/create-job');
	} else {
		job.title =  req.body.title;
		job.body = req.body.body;
		job.company = req.user._id;
	  job.salary = req.body.salary;
	}

	if (req.body.category === "Select Categories" ) {
		req.flash('error', 'Select a category');
		return res.redirect('/create-job');
	} else {
		job.category =  req.body.category;
		job.candMax = parseInt(req.body.candMax);
	}

	job.save(function(err) {
		if (err) return next(err);
		req.flash('success', 'Successfully create a job');
		return res.redirect('/create-job')
	});
});

router.get('/company-profile', function(req, res) {
  console.log(req.user);
  if (req.user) {
    User.findById({_id: req.user._id}, function(err, found) {
      if (err) return next(err);
      res.render('accounts/company-profile', {
        user: req.user
      });
    })
  } else {
    res.redirect('/login', { message: 'Please log in!', title: 'Profile' });
  }
});

router.get('/company-jobs', function(req, res) {
	res.render('company/company-jobs');
});

router.get('/single-job', function(req, res) {
	res.render('home');
});


module.exports = router;
