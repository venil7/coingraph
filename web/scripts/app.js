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

coingraph.factory('chartAdapter', function() {
  return {
    options: {
        pointDot: false,
        animation: false,
        bezierCurve: false,
        scaleLabel: "<%=value%>",
        scaleFontFamily: "'Arial'",
        scaleFontSize: 12
    },
    prepare: function(data) {
      var ret = {};
      ret.labels = data.map(function(x) { return x.value.time; });
      ret.datasets = [
        {
          fillColor : "rgba(251,187,205,0)",
          strokeColor : "MediumBlue",
          pointColor : "rgba(151,187,205,0)",
          pointStrokeColor : "MediumBlue",
          data : data.map(function(x) { return x.value.avg; })
        },
        {
          fillColor : "rgba(151,187,205,0)",
          strokeColor : "DarkOrange",
          pointColor : "rgba(151,187,205,0)",
          pointStrokeColor : "DarkOrange",
          data : data.map(function(x) { return x.value.high; })
        },
        {
          fillColor : "rgba(151,187,205,0)",
          strokeColor : "DarkCyan",
          pointColor : "rgba(151,187,205,0)",
          pointStrokeColor : "DarkCyan",
          data : data.map(function(x) { return x.value.low; })
        }
      ];
      return ret;
    }
  };
});

coingraph.controller('chartController', ['$scope', 'Socket', 'chartAdapter', function($scope, Socket, chartAdapter) {

    var socket = Socket($scope);

    $scope.chartOptions = chartAdapter.options;

    socket.on('welcome', function(data) {
      $scope.symbols = data.symbols;
      $scope.ranges = data.ranges;

      // defaulting to first symbol and range:
      $scope.state = { 
        symbol: $scope.symbol || $scope.symbols[0],
        range: $scope.range || $scope.ranges[0]
      };
    });

    socket.on('update', function(data) {
      // console.log("data came back", data);
      $scope.chartData = chartAdapter.prepare(data);
    });

    var stateChanged = function(newVal, oldVal) {
      if ($scope.state) {
        // console.log("time to update", $scope.state);
        socket.emit('update', $scope.state);
      }
    };

    $scope.$watch('state', stateChanged, true);

}]);