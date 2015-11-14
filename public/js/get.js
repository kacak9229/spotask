$(function() {


  $.ajax({
    type: 'GET',
    url: '',
    success: function(peoples) {
      $.each(orders, function(i, people) {
        $people.append('');
      });
    }

  });


});



// router.post('/update-resume', function(req, res, next) {
// 	User.findById(req.user._id, function(err, user) {
// 		console.log(req.body.data);
// 		var json = JSON.stringify(req.body.data);
// 		var parsed = JSON.parse(json);
//
// 		// updated and remove
// 		var results = user
// 			.resume
// 			.educations
// 			.filter(function(item) {
// 				return parsed.some(function(input) {
// 					return input.id === item.id;
// 				});
// 			})
// 			.map(function(item) {
// 				var related = getRelated(item.id, parsed);
// 				return { content: related.value };
// 			});
//
// 			// Add new items
// 			user.resume.educations = results
// 			.concat(parsed.reduce(function(prev, curr) {
// 				if (!getRelated(curr.id, results)) {
// 					prev.push({ content: curr.value });
// 				}
// 				return prev;
// 			}, []));
//
// 			user.save(function(err) {
// 				console.log(err);
// 				if (err) return next(err);
// 				res.json({ success: true});
// 			});
// 	});
// });
