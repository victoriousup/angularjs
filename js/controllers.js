	
	var mainController = angular.module('mainController', []);
		
	mainApp.controller('mainController', ['$sce','$scope', '$http', function($sce,$scope, $http) {
		$http.get('js/questions.json').success(function(data) {
			$scope.questions = data.questions;
			$scope.aptitudes = data.aptitudes;
		});
	}]);
	
	