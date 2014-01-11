var coingraph = angular.module("coingraph", ['n3-charts.linechart']);

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

coingraph.constant('moment', moment);

coingraph.factory('storage', function(){
  localStorage = localStorage || {};
  return {
    set: function(name, value) {
      if (typeof value === "object") {
        value = "\x00" + JSON.stringify(value);
      } else if (typeof value == "number") {
        value = "\x01" + value.toString();
      }
      localStorage[name] = value;
    },
    get: function(name) {
      var value = localStorage[name];
      if (value) {
        if (value[0] == "\x00") {
          value = value.substring(1);
          return JSON.parse(value);
        }
        if (value[0] == "\x01") {
          value = value.substring(1);
          return parseInt(value, 10);
        }
      }
      return value;
    }
  }
});

coingraph.factory('chartAdapter', ['moment', function(moment) {
  return {
    options: {
      axes: {
        x:  { key: 'time', labelFunction: function(x) { return moment(x).format("HH:mm"); }, type: 'linear'/*, tooltipFormatter: function(x) {return new Date(x); } */},
        y:  { type: 'linear'},
        y2: { type: 'linear'}
      },
      series: [
        { y: 'buy', color: 'red', type: 'line', label: 'Buy'},
        { y: 'sell', color: 'green', type: 'line', label: 'Sell'},
        { y: 'vol', color: 'SpringGreen', type: 'area', label: 'Volume', axis: 'y2'}
      ],
      lineMode: 'cardinal'
    },
    prepare: function(data) {
      // console.log(data);
      var ret = data.map(function(v) {
        v.value.time = new Date(v.value.time);
        return v.value;
      });
      // console.log(ret);
      return ret;
    }
  };
}]);

coingraph.controller('chartController',
  ['$scope', 'Socket', 'chartAdapter', 'storage',
    function($scope, Socket, chartAdapter, storage) {

    var socket = Socket($scope);

    $scope.chartOptions = chartAdapter.options;

    socket.on('welcome', function(data) {
      $scope.symbols = data.symbols;
      $scope.ranges = data.ranges;

      // defaulting to first symbol and range:
      var stateIdx = storage.get('stateIdx');
      var symbolIdx = stateIdx && ~stateIdx.symbol ? stateIdx.symbol : 0;
      var rangeIdx = stateIdx && ~stateIdx.range ? stateIdx.range : 0;
      $scope.state = {
        symbol: $scope.symbols[symbolIdx],
        range: $scope.ranges[rangeIdx],
      };
    });

    socket.on('update', function(data) {
      // console.log("data came back", data);
      $scope.chartData = chartAdapter.prepare(data);
    });

    var stateChanged = function(newVal, oldVal) {
      if ($scope.state) {
        storage.set('stateIdx', {
          symbol: $scope.symbols.indexOf($scope.state.symbol),
          range: $scope.ranges.indexOf($scope.state.range),
        });
        socket.emit('update', $scope.state);
      }
    };

    $scope.$watch('state', stateChanged, true);

}]);