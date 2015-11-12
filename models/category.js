var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = Schema({
  name: { type: String, unique: true, lowercase: true}
});


module.exports = mongoose.model('Category', CategorySchema);
