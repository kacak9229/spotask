var router = require('express').Router();
var async = require('async');
var User = require('../models/user');
var passportConf = require('../config/passport');

var updateResume = function(query, id, set, value,callback) {
    var Query = { };
    var update = { "$set": {} };

    Query[query] = id;
    update.$set[set] = value;

    User.update(Query, update, callback);
};

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
			return res.redirect('/resume');
		});
	})

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
			console.log(resume);
			if (resume == 1) {

				updateResume(
					'resume.educations._id', req.body.education_id,
					'resume.educations.$.school', req.body.education_school,
					function(err,result) {
						// do something in here
					});

			} else {
				for(var i=0; i < resume; i++) {
					updateResume(
	        'resume.educations._id', req.body.education_id[i],
	        'resume.educations.$.school', req.body.education_school[i],
	        function(err,result) {
	            // do something in here
	        });
				}
			}
			callback(null, user);
		},
		function(user, callback) {
			var resume = user.resume.skills.length;

			if (resume == 1) {

				updateResume(
				'resume.skills._id', req.body.skill_id,
				'resume.skills.$.content', req.body.skill_content,
				function(err,result) {
						// do something in here
				})

			} else {

				for(var i=0; i < resume; i++) {

					updateResume(
					'resume.skills._id', req.body.skill_id[i],
					'resume.skills.$.content', req.body.skill_content[i],
					function(err,result) {
							// do something in here
					});
				}
			}
			callback(null, user);

		},
		function(user) {
			req.flash('success', 'Resume updated');
			return res.redirect('/profile');
		}
	]);
});

router.get('/resume', passportConf.validateResume , function(req, res, next) {
	User.findById(req.user._id, function(err, user) {
		if (err) return next(err);
		res.render('accounts/resume', { user: user });
	});
});

router.get('/no-resume', passportConf.requireRole('user'), function(req, res, next) {
  if (req.user.resume.educations.length === 0 || req.user.resume.skills.length === 0) {
    res.render('accounts/no-resume');
  } else {
    return res.redirect('/');
  }
});


module.exports = router;
