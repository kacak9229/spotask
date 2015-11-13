var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var JobSchema = Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  company: { type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  body: String,
  category: String,
  salary: String,
  candidates: [{ type: Schema.Types.ObjectId, ref: 'User'}],
	candMax: Number,
	totalCandidates: {type: Number, default: 0}
});

JobSchema.plugin(timestamps);
module.exports = mongoose.model('Job', JobSchema);
