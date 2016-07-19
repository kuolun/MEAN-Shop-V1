// Front-End

//建立ShopApp
//dependencies: mean-retail.components/ngRoute
var app = angular.module('routerRoutes', ['ngRoute']);

//注入$routeProvider
app.config(function($routeProvider) {
    // 移除FB驗證後url會加上#_=_
    if (window.location.hash == '#_=_') {
        history.replaceState ?
            history.replaceState(null, null, window.location.href.split('#')[0]) :
            window.location.hash = '';
    }
    $routeProvider
    //首頁(只出現search bar)
    //改成要出現products 但不顯示購買button，登入後才顯示，user.logged=true
        .when('/', {
            template: '<category-products></category-products>'
        })
        //購物車頁面
        .when('/cart', {
            template: '<cart></cart>'
        })
        //--done
        //User Profile頁面
        .when('/profile', {
            template: '<profile></profile>'
        })
        // 產品detail頁 
        .when('/product/:productid', {
            template: '<product></product>'
        })
        // 實際為 www.example.com/#/products/xxxxx
        //取得分類下所有產品
        .when('/products/:categoryid', {
            template: '<category-products></category-products>'
        });
});