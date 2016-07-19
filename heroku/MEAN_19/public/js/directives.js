//使用ShopApp module
var app = angular.module('ShopApp');

// 1.分類下的所有產品(含price排序)
app.directive('categoryProducts', function() {
    return {
        controller: 'CategoryProductsController',
        templateUrl: 'views/pages/category.html'
    };
});

// 3.search bar
app.directive('searchBar', function() {
    return {
        controller: 'SearchBarController',
        templateUrl: 'views/pages/search_bar.html'
    };
});



// 4.Navbar+user登入狀態列
app.directive('navBar', function() {
    return {
        controller: 'NavBarController',
        templateUrl: 'views/pages/nav_bar.html'
    };
});


// 5.Stripe結帳
app.directive('checkout', function() {
    return {
        controller: 'CheckoutController',
        templateUrl: 'views/pages/checkout.html'
    };
});

// 6.User Profile
app.directive('profile', function() {
    return {
        controller: 'userController',
        templateUrl: 'views/pages/profile.html'
    };
});


//7. Product Detail
//產品detail頁
app.directive('product', function() {
    return {
        controller: 'ProductController',
        templateUrl: 'views/pages/product.html'
    };
});

//8.下拉目錄選單
app.directive('dropdownCategories', function() {
    return {
        controller: 'dropdownCategoriesController',
        templateUrl: 'views/pages/dropdown_categories.html'
    };
});


//9.購物車頁面
app.directive('cart', function() {
    return {
        controller: 'cartController',
        templateUrl: 'views/pages/cart.html'
    };
});