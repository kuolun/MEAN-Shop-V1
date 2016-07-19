//include mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create Category schema
var Categoryschema = Schema({
  name:{ type:String,unique:true,lowercase:true}
});


//export Category model
module.exports = mongoose.model('Category', Categoryschema);