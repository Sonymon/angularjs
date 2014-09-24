(function () {
    'use strict';
	var poc = angular.module('poc', ['apGdrive']);
    poc.controller('DemoCtrl',['$scope','$q', '$http', DemoCtrl]);
	function DemoCtrl($scope,$q, $http) {
	}
})();