module.exports = function(app, passport) {

    //取得category model
    var Category = require('./models/category');

    //取得product model
    var Product = require('./models/product');

    //取得user model
    var User = require('./models/user');

    //Stripe結帳
    var Stripe = require('stripe')('sk_test_ZPTLcTtpDPvz3ZNkLt707GU4');

    var status = require('http-status');

    // =====================================
    // Search SECTION ======================
    // =====================================
    //text search
    app.get('/search/:query', function(req, res) {
        console.log("in api...");
        console.log(req.params.query);
        Product.
        find({ // schema有設定$text對應name欄位
                $text: {
                    $search: req.params.query
                }
            }, { // 設定$meta
                score: {
                    $meta: 'textScore'
                }
            })
            // 替換category
            .populate('category')
            // 設定照textScore排序
            .sort({
                score: {
                    $meta: 'textScore'
                }
            }).
        limit(10).
        exec(function(err, result) {
            // 回傳result為array
            console.info('search result:');
            console.log(result);

            //no error,回傳json物件，有property屬性
            var json = {};
            //建立一個products陣列，儲存特定目錄的product
            json['result'] = result;
            res.json(json);
        });
    });


    // =====================================
    // Check out with stripe SECTION =======
    // =====================================
    app.post('/payment', function(req, res) {
        // 購物車先populate product
        // req.user.populate({
        //     path: 'data.cart.product',
        //     model: 'Product'
        // }, function(error, user) {
        // 建立charge
        Stripe.charges.create({
                //Stripe的價格要用cents所以x100且四捨五入
                amount: Math.ceil(req.user.data.totalValue * 100),
                currency: 'usd',
                source: req.body.stripeToken, //取得stripeToken
                description: 'Example charge from kuolun'
            },
            //成功的話會拿到charge object
            function(err, charge) {
                if (err && err.type === 'StripeCardError') {
                    return res.
                    status(status.BAD_REQUEST).
                    json({
                        error: err.toString()
                    });
                }
                if (err) {
                    console.log(err);
                    return res.
                    status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: err.toString()
                    });
                }
                // 清空購物車
                req.user.data.cart = [];
                req.user.data.totalValue = 0;
                req.user.save(function() {
                    // Ignore any errors - if we failed to empty the user's
                    // cart, that's not necessarily a failure

                    // 成功的話回傳id及狀態
                    return res.json({
                        id: charge.id,
                        status: charge.status
                    });
                });
            });
    });



    //用id找出特定目錄
    app.get('/category/id/:id', function(req, res) {
        Category.findOne({
            _id: req.params.id
        }, function(error, cat) {
            //錯誤處理
            if (error) {
                return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({
                    error: error.toString()
                });
            }
            //category不存在
            if (!cat) {
                return res
                    .status(status.NOT_FOUND)
                    .json({
                        error: 'Not found'
                    });
            }

            //回傳json
            res.json({
                category: cat
            });
        });
    });


    // =====================================
    // Product Detail SECTION ==============
    // =====================================
    //用id找特定product
    app.get('/product/:id', function(req, res) {
        Product.findById({
            _id: req.params.id
        }, function(err, product) {
            if (err) return next(err);
            //回傳json
            res.json({
                product: product
            });
        })
    });

    //put傳進來的資料，會在req.body
    // app.put('/test', function(req, res) {
    //     console.log(req.body);
    //     res.json(req.body);
    //     return res.status(200);
    // });

    // =====================================
    // Update Cart SECTION ==============
    // =====================================
    //更新DB中User的Cart內容 (for <addToCart>)
    app.put('/updateCart', function(req, res, next) {
        console.log(req.user);
        User.findById({
            _id: req.user._id
        }, function(err, user) {
            user.data.cart.push({
                //put傳來的
                product: req.body.productid,
                quantity: parseInt(req.body.quantity),
                subtotal: parseInt(req.body.subtotal)
            });
            console.log(user);
            console.log(req.body);
            // req.body內為JSON，是string(透過bodyParser處理)
            user.data.totalValue = (user.data.totalValue + parseInt(req.body.subtotal));

            // save後導到購物車頁面
            user.save(function(err, user) {
                if (err) return next(err);
                // 回傳save後的user
                return res.json({
                    user: user
                });
            });
        });

    });


    // done
    // =====================================
    // Get Cart Page SECTION ==============
    // =====================================
    //取出User的Cart資料 (for <cart>)
    app.get('/cart', function(req, res, next) {
        User
            .findOne({
                _id: req.user._id
            })
            .populate('data.cart.product')
            .exec(function(err, user) {
                if (err) return next(err);
                res.json({
                    user: user
                });
            });
    });


    // done
    // =====================================
    // Remove item in Cart  SECTION ========
    // =====================================
    //移除Cart內資料 (for <cart>)
    app.put('/remove', function(req, res, next) {
        console.info('/remove........');
        console.info(req.user);

        User.findOne({
            // 有登入的傳進來的req會帶有user資料(req.user)
            _id: req.user._id
        }, function(err, foundUser) {
            console.info('foundUser:........');
            console.warn(foundUser);
            console.info('req.body:........');
            console.warn(req.body);

            // 利用ObjectId移除該item
            foundUser.data.cart.pull(String(req.body.itemid));

            console.info('foundUser.data.totalValue before:........');
            console.warn(foundUser.data.totalValue);

            foundUser.data.totalValue = (foundUser.data.totalValue - parseInt(req.body.subtotal));

            console.info('foundUser.data.totalValue after:........');
            console.warn(foundUser.data.totalValue);

            foundUser.save(function(err, found) {
                if (err) return next(err);
                res.json(found);
                // req.flash('remove', 'Successfully removed');
                // res.redirect('/cart');
            });
        });
    });


    //id對應category，取得某一目錄下所有products
    app.get('/products/:id', function(req, res, next) {
        Product
            .find({
                category: req.params.id
            })
            .populate('category')
            .exec(function(err, products) {
                if (err) return next(err);
                // 取得的話就回傳json給angular
                res.json({
                    products: products
                });
            });
    });

    //--done
    //Load目前登入user的購物車資料
    app.get('/me', function(req, res) {
        //check是否有user登入
        if (!req.user) {
            console.log('req.user');
            console.log(req.user); //會是undefined
            return res.
            status(status.UNAUTHORIZED).
            json({
                error: 'User Not logged in!'
            });
        }

        //user已登入,req.user存在
        //替換user objct中data.cart.product資料
        req.user.populate({
            path: 'data.cart.product',
            model: 'Product'
        }, function(error, user) {
            //錯誤處理
            if (error) {
                return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({
                    error: error.toString()
                });
            } //資料找不到
            if (!user) {
                return res.
                status(status.NOT_FOUND).
                json({
                    error: 'Not found'
                });
            }
            //有資料user
            //建立一Object，把找到的result設定為該Object的屬性，然後用res回傳
            var result = {};
            result['user'] = user;
            res.json(result);
        });
    });

    //--done
    //取得所有目錄for dropdown
    app.get('/categories/all', function(req, res) {
        //空{}代表傳回Category下所有document
        Category.find({}, function(error, categories) {
            if (error) {
                return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({
                    error: error.toString()
                });
            }
            console.log("categories got!");
            res.json({
                categories: categories
            });
        });
    });

    //--done
    //取得所有product
    app.get('/productsall/', function(req, res) {
        //空{}代表傳回Category下所有document
        Product.find({})
            .populate('category')
            .exec(function(error, products) {
                if (error) {
                    return res.
                    status(status.INTERNAL_SERVER_ERROR).
                    json({
                        error: error.toString()
                    });
                }
                console.log("products got!");
                res.json({
                    products: products
                });
            });
    });



    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // app.get('/profile', isLoggedIn, function (req, res) {
    //     // res.render('../client/templates/profile.html', {
    //     //     user: req.user // get the user out of session and pass to template
    //     // });
    //     res.redirect('../client/templates/templates/checkout.html');
    // });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login(middleware為passport.authenticate)
    // 因為strategy那邊沒有給name，所以預設是facebook
    // scope :要求更多權限
    //--done
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: 'email'
    }));

    // handle the callback after facebook has authenticated the user
    // 送request到/profile時，req.user會有FB profile資料
    // 一旦user成功通過fb認證 整個session都可存取req.user
    //--done
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        // successRedirect: '/#profile', //走angular的route ()
        successRedirect: '/',
        failureRedirect: '/'
    }));



    // =====================================
    // LOGOUT ==============================
    // =====================================
    //--done
    app.get('/logout', function(req, res) {
        req.logout(); // provided by passport.
        res.redirect('/');
    });



    // =====================================
    // Stripe CHECKOUT ============================
    // =====================================
    //結帳
    app.post('/payment', function(req, res, next) {
        //取得client傳來的stripeToken
        var stripeToken = req.body.stripToken;

        //取得要結帳的總金額,stripe是用cent計算
        //所以結帳金額要x100
        var currentCharge = Math.round(req.body.stripeMoney * 100);

        //用stripe服務，傳入token
        //建立customer後得到promise(內有customer)
        stripe.customers.create({
            source: stripeToken
        }).then(function(customer) {
            return stripe.charges.create({
                amount: currentCharge,
                currency: 'usd',
                customer: customer.id //要charge的user
            });
        });
    });


    //直接連http://localhost:3000/#/profile
    //藥用isLoggedIn 去 check


    //回傳特定目錄下的所有產品(含子目錄)--利用ancestors欄位
    //例如找Electronics目錄下的所有產品
    //http://localhost:3000/#/product/category/electronics
    app.get('/product/category/:id', function(req, res) {

        //預設用name 遞增 sort
        //1為遞增,-1為遞減
        var sort = {
            name: 1
        };

        //待處理 用price sort
        //如果query string 如 Phones?price=1
        if (req.query.price === "1") {
            //則價格遞增排序
            sort = {
                'price.amount': 1
            };
        } else if (req.query.price === "-1") {
            //則價格遞減排序
            sort = {
                'price.amount': -1
            };
        }

        //Product model 找多筆products (array)
        Product.find({
                'category': req.params.id
            }).
            //加sort條件
        sort(sort).
        exec(function(error, prods) {
            //錯誤處理
            if (error) {
                return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({
                    error: error.toString()
                });
            }
            //products不存在
            if (!prods) {
                return res
                    .status(status.NOT_FOUND)
                    .json({
                        error: 'Not found'
                    });
            }

            //回傳的prods會是array
            res.json({
                products: prods
            });
        });
    })


};

// route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {
//     console.log(req.isAuthenticated());
//     // if user is authenticated in the session, carry on 
//     if (req.isAuthenticated())
//         return next();

//     // if they aren't redirect them to the home page
//     res.redirect('/');
// }



//user profile(用ejs做)
// app.get('/profile', function (req, res, next) {
//     User.findOne({_id:req.user._id},function(err,user){
//         if(err) return next(err);
//         res.render('profile',{user:user});
//     })

// });