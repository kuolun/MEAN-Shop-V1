angular.module('userService', [])
  .factory('$User', function($http) {
    // create a new object
    var userFactory = {};

    userFactory.loadUser = function() {
      //$http使用XHR,採promise
      //送request到API取user資料
      $http.
      get('/me').
      success(function(data) {
        //data為回傳的json object
        //回傳資料中的user property
        // 改？userFactory =  data.user
        // 改名userService
        userFactory.user = data.user;
        console.log("load User completely!");
      }).
      error(function(data, status) { //取得data--錯誤回傳的資料{ error: 'User Not logged in!' }
        if (status === 401) {
          userFactory.user = null;
          console.log(data.error);
        }
      });
    };

    userFactory.loadUser();


    return userFactory;


  });