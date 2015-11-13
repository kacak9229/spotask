var router = require('express').Router();
var async = require('async');
var Job = require('../models/job');
var User = require('../models/user');
var Category = require('../models/category');
var passportConf = require('../config/passport');

router.get('/', function(req, res) {
	res.render('main/home');
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

router.get('/jobs/:job_id', function(req, res) {
	Job.findOne({ _id: req.params.job_id }, function(err, job) {
		res.render('main/job-single', {
			job: job,
		});
	});
});

router.post('/jobs/:job_id', function(req, res, next) {

	async.waterfall([
		function(callback) {
			Job.findOne({ _id: req.params.job_id}, function(err, found) {
				if (err) return next(err);
				callback(err, found);
			});
		},

		function(found) {
			if (found.totalCandidates >= found.candMax) {
				req.flash('error', 'It is full');
				return res.redirect('/jobs/' + found._id);
			} else {
				Job.update(
					{
						_id: found._id,
						candidates: { $ne: req.user._id }
					},
					{
						$push: { candidates: req.user._id },
						$inc: { totalCandidates: 1}
					}, function(err) {
						if (err) return next(err);
						return res.redirect('/jobs');
					});
				}
			}
		]);
	});

module.exports = router;
