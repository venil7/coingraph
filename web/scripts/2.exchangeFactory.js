coingraph.factory('exchange', ['$rootScope', function($rootScope) {
  var scope = $rootScope.$new();
  return {
    update: function(name, value) {
      scope.$emit(name, value);
    },
    on: function(name, func) {
      scope.$on(name, func);
    }
  };
}]);