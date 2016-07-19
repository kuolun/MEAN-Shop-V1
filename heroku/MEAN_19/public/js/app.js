//使用ShopApp module
// 注入相關Service
var app = angular.module('ShopApp', ['userService', 'routerRoutes', 'searchService']);

//done
// 某分類下所有產品
app.controller('CategoryProductsController', function($scope, $routeParams, $http, searchService) {
    //done
    // 如果search result存在
    console.log('in controller...');
    console.log(searchService.result);

    // watch service的variable
    $scope.$watch(function() {
        return searchService.result;
    }, function(newValue, oldValue) {
        console.log('oldValue:');
        console.log(oldValue);
        console.log('newValue:');
        console.log(newValue);
        if (newValue != "undefined" && newValue.length == 0) {
            getAllProduct();
        } else {
            $scope.products = newValue;
        }
    }, true);


    //$routeParams為service用來取得 /detail/:id類route資訊
    //$routeParams.id
    if ($routeParams.categoryid) {
        $http.get('/products/' + $routeParams.categoryid)
            .success(function(data) {
                console.log("trying get data");
                $scope.products = data.products;
                console.log($scope.products);
            })
            .error(function(err, status) {
                console.log(err);
                console.log(status);
            });
    } else {
        getAllProduct();
    }

    function getAllProduct() {
        $http.get('/productsall')
            .success(function(data) {
                console.log("trying get main page data");
                $scope.products = data.products;
                console.log($scope.products);
            })
            .error(function(err, status) {
                console.log(err);
                console.log(status);
            });
    }


});

//Navbar+user登入狀態列
//需inject userFactory, factory回傳object:$User.user有使用者資料
app.controller('NavBarController', function($scope, $User) {
    console.info("NavBarBar Ctrl loading...$User:");
    console.info($User);
    $scope.user = $User;
    // 計算cart內item數量
    $scope.sum = function() {
        var result = 0;
        angular.forEach($scope.user.user.data.cart, function(item, idx) {
            result += item.quantity;
        });

        return result;
    }
});

//結帳
app.controller('CheckoutController', function($scope, $User) {
    $scope.user = $User;
});


//user profile
app.controller('userController', function($scope, $User) {
    // console.log($User.user);
    $scope.user = $User.user;
});


//done
//下拉分類目錄選單
app.controller('dropdownCategoriesController', function($scope, $http) {
    $http.get('/categories/all')
        .success(function(data) {
            console.log(data);
            $scope.categories = data.categories;
            console.log('categories:' + $scope.categories[0].name);
        });
});

//done
//產品detail頁
app.controller('ProductController', function($scope, $routeParams, $User, $http) {
    //$routeParams為service用來取得 /product/:id 
    //$routeParams.id
    if ($routeParams.productid) {
        $http.get('/product/' + $routeParams.productid)
            .success(function(data) {
                $scope.product = data.product;
            })
            .error(function(err, status) {
                console.error(err);
                console.info(status);
            });
    } else {
        console.log('no product id');
        return
    }

    // totalCount為購買數量，預設為1
    $scope.totalCount = 1;



    //+ - 調整數量
    $scope.addQty = function(num) {
        $scope.totalCount = $scope.totalCount + num;

        //防止數量小於1
        if ($scope.totalCount < 1) {
            $scope.totalCount = 1;
        }
    };





    // 加到購物車
    $scope.addToCart = function(product) {
        // 小計function
        $scope.subtotal = function() {
            // price x 數量
            return (product.price * $scope.totalCount);
        };

        console.info('quantity:' + quantity);
        console.info('subtotal:' + $scope.subtotal());
        console.info('product.price:' + product.price);
        console.info('$scope.totalCount:' + $scope.totalCount);



        // 把product，數量，總金額push到serveice
        var item = {
            productid: product._id,
            quantity: $scope.totalCount,
            subtotal: $scope.subtotal()
        };
        //更新service
        $User.user.data.cart.push(item);
        console.info($User);


        //更新DB(async)
        //傳入的資料為item，會放在req.body內
        $http.
        put('/updateCart', item).
        success(function(data) {
            console.info("addToCart complete!");

        });

    };


});

//購物車頁面
app.controller('cartController', function($scope, $User, $http, $location) {

    // 到DB取得cart的資料
    $http.get('/cart').success(function(data) {
        $scope.user = data.user;
        console.info('get cart from DB done!');
        // 計算cart內item總金額totalValue
        console.info("Counting subtotal...");
        var result = 0;
        angular.forEach($scope.user.data.cart, function(item, idx) {
            console.info(idx + ': ' + item.subtotal);
            // 每個item會有自己的subtoral，加總起來
            result += item.subtotal;
        });
        $scope.totalValue = result;

        console.info('totalValue:');
        console.info($scope.totalValue);
    });

    //刪除item
    $scope.removeItem = function(idx) {
        console.info('要remove的id:');
        console.info($scope.user.data.cart[idx]._id);
        // 建立要移除的item資料
        var item = {
            itemid: $scope.user.data.cart[idx]._id,
            subtotal: $scope.user.data.cart[idx].subtotal,
            quantity: $scope.user.data.cart[idx].quantity
        };
        // 更新totalValue
        $scope.totalValue = ($scope.totalValue - $scope.user.data.cart[idx].subtotal);
        console.info('totalValue after remove:');
        console.info($scope.totalValue);


        //更新DB,要傳資料
        $http.put('/remove', item)
            .success(function(data) {
                // 拿到傳回資料後去重抓user資料
                console.info("remove DB success!");

            });

        // 更新$scope.user資料
        $scope.user.data.cart.splice(idx, 1);

        // 更新Navbar購物車($User)
        $User.user.data.cart.splice(idx, 1);

        console.info("remove item success!");

    };

    //Stripe付款
    // For checkout
    Stripe.setPublishableKey('pk_test_gYmq7G71sVayHcy4J8SjZHKA');


    // $scope.stripeToken = {
    //     number: '4242424242424242',
    //     cvc: '123',
    //     exp_month: '12',
    //     exp_year: '2016'
    // };


    // 點pay button觸發，送出post request
    $scope.pay = function() {
        // 建立stripeToken
        console.log($scope.cardNumber);
        $scope.stripeToken = {
            number: $scope.cardNumber,
            cvc: $scope.cvc,
            exp_month: $scope.expMonth,
            exp_year: $scope.expYear
        };
        $scope.error = null;
        Stripe.card.createToken($scope.stripeToken, function(status, response) {
            if (status.error) {
                $scope.error = status.error;
                return;
            }
            //用建立token回傳的id去發post
            $http.
            post('/payment', {
                    stripeToken: response.id
                })
                .success(function(data) {
                    $scope.checkedOut = true;
                    // 清空購物車
                    $User.user.data.cart = [];
                    $scope.user.data.cart = [];
                    window.location.href = '/';
                });
        });
    };
});

// search bar
app.controller('SearchBarController', function($scope, $http, searchService) {
    $scope.update = function(searchText) {
        $http.get('/search/:' + searchText).
        success(function(data) {
            console.log(searchText);
            //這邊取回的是products array
            // $scope.result = data.result;
            searchService.addResult(data.result);
        });
    };
});