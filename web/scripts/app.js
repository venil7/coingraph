var coingraph = angular.module("coingraph", ['angles']);

coingraph.factory('Socket', ['$rootScope', function($rootScope) {
  var socket = io.connect();

  // When injected into controllers, etc., Socket is a function
  // that takes a Scope and returns a ScopedSocket wrapping the
  // global Socket.IO `socket` object. When the scope is destroyed,
  // it will call `removeAllListeners` on that ScopedSocket.
  return function(scope) {
    var scopedSocket = new ScopedSocket(socket, $rootScope);
    scope.$on('$destroy', function() {
      scopedSocket.removeAllListeners();
    });
    return scopedSocket;
  };
}]);

coingraph.factory('dataAdapter', function() {
  return {
    adapt: function(data) {
      return data;
    }
  };
});

coingraph.controller('chartController', ['$scope', 'Socket', 'dataAdapter', function($scope, Socket, dataAdapter) {
    var socket = Socket($scope);

    socket.on('welcome', function(data) {
      console.log(data);
      $scope.symbols = data.symbols;
      $scope.ranges = data.ranges;
    });

    // $scope.options = {
    //     animation : false
    // }
    // $scope.chart = {
    //     //labels : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    //     //labels: ["one","","","","four","","","","eight","","","","twelve"],
    //     labels: new Array(1000),
    //     datasets : [
    //         {
    //             fillColor : "rgba(151,187,205,0.5)",
    //             strokeColor : "#e67e22",
    //             pointColor : "rgba(151,187,205,0)",
    //             pointStrokeColor : "#e67e22",
    //             data : new Array(1000),
    //         },
    //         {
    //             fillColor : "rgba(151,187,205,0.7)",
    //             strokeColor : "#f1c40f",
    //             pointColor : "rgba(151,187,205,0)",
    //             pointStrokeColor : "#f1c40f",
    //             data : new Array(1000),
    //         }
    //     ],
    // };
}]);