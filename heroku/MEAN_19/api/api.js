var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../app/models/category');
var Product = require('../app/models/product');

//輸入網址為: www.ex.com/api/foods
//給一個存在的category去產生fake products
router.get('/:name', function(req, res, next) {

    async.waterfall([
        function(callback) {
            Category.findOne({
                name: req.params.name
            }, function(err, category) {
                if (err) return next(err);
                callback(null, category); //err為null,category傳入下一個function
            });
        },
        function(category, callback) {
            //建立30個product
            for (var i = 0; i < 10; i++) {
                var product = new Product();
                product.category = category._id;
                //check faker api
                product.name = faker.commerce.productName();
                product.price = faker.commerce.price();
                product.image = faker.image.image();

                product.save();
            }

        }
    ]);

    res.json({
        message: 'Success'
    });
});


module.exports = router;