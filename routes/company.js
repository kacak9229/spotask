var app = require('express');
var router = app.Router();
var async = require('async');
var passportConf = require('../config/passport');
var User = require('../models/user');
var Job = require('../models/job');
var Category = require('../models/category');

var http = require('http').Server(app);
var io = require('socket.io')(http);

router.use(function(req, res, next) {
	Job.find({ company: req.user._id}, function(err, jobs) {
		res.locals.jobs = jobs;
		next();
	});
});

router.get('/create-job', function(req, res, next) {


});

router.post('/create-job', function(req, res, next) {

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
		return res.redirect('/company-jobs');
	});
});


router.get('/company-profile', passportConf.requireRole('company'), function(req, res, next) {

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
					.populate('candidates.user')
					.exec(function(err, found) {
						if (err) return next(err);
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

router.get('/company-jobs', passportConf.requireRole('company'), function(req, res) {
	res.render('company/company-jobs');
});

router.get('/company-single-job/:job_id', passportConf.requireRole('company'), function(req, res) {

	Job.findById({ _id: req.params.job_id })
		.populate('candidates.user')
		.exec(function(err, listCandidates) {
			res.render('company/company-single-job', {
				list: listCandidates,
				success: req.flash('success'),
				error: req.flash('error')
			});
		});
});

router.get('/resume/candidates/:job_id/:user_id', passportConf.requireRole('company'), function(req, res) {

	User.findById({ _id: req.params.user_id }, function(err, user) {

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
						'candidates.user': req.params.user_id
					},
					{
						$set: {'candidates.$.status': 'Accepted'},
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

	Job.update(
		{
			_id: req.params.job_id,
			'candidates.user': req.params.user_id
		},
		{
			$set: { 'candidates.$.status': 'Declined' },
		}, function(err, count) {
			if (err) return next(err);

			req.flash('error', 'Successfully Declined');
			res.redirect('/company-single-job/' + req.params.job_id);
		});

});


module.exports = router;
