var router = require('express').Router();
var async = require('async');
var Job = require('../models/job');
var User = require('../models/user');
var Category = require('../models/category');
var passportConf = require('../config/passport');

router.get('/', function(req, res) {
		if (req.user && req.user.role === 'user') {
			Job.find({}, function(err, jobs) {
				res.render('main/job', {
					jobs: jobs,
					message: req.flash('message')
				});
			});
		} else if (req.user && req.user.role === 'company'){
			return res.redirect('/company-profile');
		} else {
			res.render('main/home');
		}
});

// List of jobs
router.get('/jobs', function(req, res) {
	Job.find({}, function(err, jobs) {
		res.render('main/job', {
			jobs: jobs,
			message: req.flash('message')
		});
	});
});

router.get('/jobs/:job_id', passportConf.checkResume,function(req, res) {
	Job
		.findOne({ _id: req.params.job_id })
		.populate('company')
		.exec(function(err, job) {
			console.log(job);
			res.render('main/job-single', {
				job: job,
			});
		});
});

router.post('/jobs/apply/:job_id',  function(req, res, next) {

	async.waterfall([
		function(callback) {
			Job.findOne({ _id: req.params.job_id }, function(err, found) {
				if (err) return next(err);

				callback(err, found);
			});
		},

		function(found, callback) {
			if (found.totalCandidates >= found.candMax) {
				req.flash('error', 'It is full');
				return res.json('error');
			} else {
				Job.update(
					{
						_id: found._id,
						candidates: { $ne: req.user._id }
					},
					{
						$push: { candidates: { user: req.user._id } },
						$inc: { totalCandidates: 1}
					}, function(err, count) {
						if (err) return next(err);

						callback(null, count);
					});
				}
			}
		], function (err, count) {
			if (count > 1) {
				res.json("success");
			} else {
				res.json("error");
			}
		});
	});


	router.post('/jobs/unapply/:job_id', function(req, res, next) {

		async.waterfall([
			function(callback) {
				Job.findOne({ _id: req.params.job_id }, function(err, found) {
					if (err) return next(err);
					callback(err, found);
				});
			},

			function(found, callback) {
				if (found.totalCandidates >= found.candMax) {
					req.flash('error', 'It is full');
					return res.json('error');
				} else {
					Job.update(
						{
							_id: found._id,
						},
						{
							$pull: { candidates: { user: req.user._id} },
							$inc: { totalCandidates: -1}
						}, function(err, count) {

							if (err) return next(err);
							callback(null, count);
						});
					}
				}
			], function (err, count) {
				if (count > 1) {
					res.json("success");
				} else {
					res.json("error");
				}
			});
		});


		router.get('/inbox', function(req, res) {
			res.render('main/inbox');
		});

		router.get('/jobs-applied', function(req, res) {
			Job.find({ 'candidates': req.user._id }, function(err, found) {
				console.log(found);
				found.forEach(function(candidate) {
					console.log(candidate.title);
				})
			});

		});


module.exports = router;
