var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

module.exports = function(schema) {

    schema.add({
    	resume :{
  		fullname: String,
      about: String,
  		skills: [{
        content: String,
      }],
  		educations: [{
        year: String,
        school: String
      }],
      phoneNumber: String
  		}
	});

}
