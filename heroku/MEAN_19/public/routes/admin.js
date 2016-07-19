var router = require('express').Router();
// ../../代表上兩層目錄
var Category = require('../../app/models/category');

// 取得操作畫面
router.get('/add-category', function(req, res, next) {
  res.render('admin/add-category', { message: req.flash('success') });
});


//新增目錄
router.post('/add-category', function(req, res, next) {
  var category = new Category();
  category.name = req.body.name;

  category.save(function(err) {
    if (err) return next(err);
    req.flash('success', 'Successfully added a category');
    return res.redirect('/add-category');
  });
})


module.exports = router;