var router = require('express').Router();
var async = require('async');
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

	job.save(function(err, job) {
		if (err) return next(err);
		req.flash('success', 'Successfully create a job');
		return res.json({
			message: "Success",
			job: job
		});
	});
});


router.get('/company-profile', function(req, res, next) {

  if (req.user) {
		async.waterfall([
			function(callback) {
				Category.find({}, function(err, categories) {
						if (err) return next(err);
						callback(null, categories);
				});
			},

			function(categories, callback) {
				Job.find({ company: req.user._id })
					.populate('candidates')
					.exec(function(err, found) {
						if (err) return next(err);
						console.log();
						return res.render('company/company-profile', {
							categories: categories,
							jobs: found
						});
					});
			}
		]);
  } else {
    res.redirect('/login', { message: 'Please log in!', title: 'Profile' });
  }
});

router.get('/company-jobs', function(req, res) {
	res.render('company/company-jobs');
});

router.get('/company-single-job/:job_id', function(req, res) {

	Job.findById({ _id: req.params.job_id })
		.populate('candidates')
		.exec(function(err, listCandidates) {
			res.render('company/company-single-job', {
				list: listCandidates,
				success: req.flash('success'),
				error: req.flash('error')
			});
		});
});

router.get('/resume/candidates/:job_id/:user_id', function(req, res) {

	User.findById({ _id: req.params.user_id }, function(err, user) {
		console.log(user);
		res.render('company/candidates-resume', {
			candidate: user,
			userId: req.params.user_id,
			jobId: req.params.job_id
		});
	});
});


router.post('/accept/candidates/:job_id/:user_id', function(req, res, next) {

	async.waterfall([
		function(callback) {
			Job.findOne({ _id: req.params.job_id }, function(err, found) {
				if (err) return next(err);
				callback(err, found);
			});
		},

		function(found, callback) {
				Job.update(
					{
						_id: found._id,
						accept: { $ne: req.params.user_id }
					},
					{
						$push: { accept: req.params.user_id },
						$inc: { totalAccept: 1}
					}, function(err, count) {
						if (err) return next(err);
						callback(err, count);
					});

			}
		], function (err, count) {
			req.flash('success', 'Successfully Accept');
			res.redirect('/company-single-job/' + req.params.job_id);
		});
});

router.post('/decline/candidates/:job_id/:user_id', function(req, res, next) {

	async.waterfall([
		function(callback) {
			Job.findOne({ _id: req.params.job_id }, function(err, found) {
				if (err) return next(err);
				callback(err, found);
			});
		},

		function(found, callback) {
				Job.update(
					{
						_id: found._id,
						accept: { $ne: req.params.user_id }
					},
					{
						$push: { decline: req.params.user_id },
						$inc: { totalDecline: 1}
					}, function(err, count) {
						if (err) return next(err);
						callback(null, count);
					});

			}
		], function (err, count) {
			req.flash('error', 'Successfully Declined');
			res.redirect('/company-single-job/' + req.params.job_id);
		});
});


module.exports = router;
