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
router.get('/job', function(req, res) {
	Job.find({}, function(err, job) {
		res.render('job', {
			jobs: job,
			message: req.flash('message')
		});
	});
});

router.get('/job/:title', function(req, res) {
	Job.find({ title: req.params.title }, function(err, job) {
		res.render('job-single', {
			job: job,
		});
	});
});


module.exports = router;
