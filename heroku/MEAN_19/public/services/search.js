angular.module('searchService', [])
    .factory('searchService', function($http) {
        var searchService = {};
        searchService.addResult = function(result) {
            console.log("changing service data...");
            searchService.result = result;
        };
        return searchService;
    });