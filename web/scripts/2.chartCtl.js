coingraph.controller('chartCtl',
  ['$scope', 'Socket', 'chartAdapter', 'storage', 'exchange',
    function($scope, Socket, chartAdapter, storage, exchange) {

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
      exchange.update('symbol', $scope.state.symbol);
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