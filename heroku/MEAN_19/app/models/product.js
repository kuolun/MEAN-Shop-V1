//include mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//create product schema
var schema = Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    name: String,
    price: Number,
    image: String
});


//建立索引for text serach功能
// 設定找name欄位
schema.index({
    name: 'text'
});




//export product model
module.exports = mongoose.model('Product', schema);