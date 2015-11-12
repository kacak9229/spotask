var router = require('express').Router();
var async = require('async');
var User = require('../models/user');
var passportConf = require('../config/passport');


router.use(passportConf.requireRole('user'));

// For user's resume
router.get('/add-resume', passportConf.isAuthenticated, function(req, res, next) {
	res.render('resume/add-new-resume', { message: req.flash('message')});
});

router.post('/add-resume', function(req, res, next) {

	User.findById(req.user._id, function(err, foundUser) {
		foundUser.resume.fullname =  req.body.fullname;
		foundUser.resume.about = req.body.about;
		foundUser.resume.skills.push({ content: req.body.skills });
	  foundUser.resume.educations.push({ year: req.body.year, school: req.body.school });

		foundUser.save(function(err) {
			if (err) return next(err);
			req.flash('message', 'Successfully create a resume');
			return res.redirect('/add-resume')
		});
	})

});

router.get('/update-resume', function(req, res, next) {
	User.findById(req.user._id, function(err, user) {
		if (err) return next(err);
		res.render('resume/edit-resume', { user: user , message: req.flash('message')});
	});
});


router.post('/update-resume', function(req, res, next) {

	async.waterfall([
		function(callback) {
			User.findById(req.user._id, function(err, user) {
				if (err) return next(err);
				if (req.body.fullname) user.resume.fullname = req.body.fullname;
				if (req.body.about) user.resume.about = req.body.about;

				user.save(function(err, user) {
					if (err) return next(err);
					callback(null, user);
				});
			});
		},

		function(user, callback) {
			var resume = user.resume.educations.length;
			for(var i=0; i < resume; i++) {
				User.update({'resume.educations._id': req.body.education_id[i]}, {'$set': {
					'resume.educations.$.school': req.body.education_school[i],
					// 'resume.educations.$.year': req.body.education_year[i],
				}}, function(err) {
					// Running nothing
				});
			}
			callback(null, user);
		},
		function(user, callback) {
			var resume = user.resume.skills.length;
			for(var i=0; i < resume; i++) {
				User.update({'resume.skills._id': req.body.skill_id[i]}, {'$set': {
					'resume.skills.$.content': req.body.skill_content[i],
				}}, function(err) {
					// Running nothing
				});
			}
			callback(null, user);
		},
		function(user) {
			req.flash('message', 'Updated everything');
			return res.redirect('/resume');
		}
	]);
});

router.get('/resume', passportConf.validateResume , function(req, res, next) {
	User.findById(req.user._id, function(err, user) {
		if (err) return next(err);
		res.render('accounts/resume', { user: user });
	});
});

router.get('/no-resume', function(req, res, next) {
		res.render('accounts/no-resume');
});

module.exports = router;
