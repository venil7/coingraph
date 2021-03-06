var app = require("./app");

app.controller("chartCtl",
  ["$scope", "Socket", "chartAdapter", "storage", "exchange",
    function($scope, Socket, chartAdapter, storage, exchange) {

    var socket = Socket($scope);

    // $scope.chartOptions = chartAdapter.options;

    socket.on("welcome", function(data) {
      $scope.symbols = data.symbols;
      $scope.ranges = data.ranges;

      // defaulting to first symbol and range:
      var stateIdx = storage.get("stateIdx");
      var symbolIdx = stateIdx && ~stateIdx.symbol ? stateIdx.symbol : 0; /*default to first pair*/
      var rangeIdx = stateIdx && ~stateIdx.range ? stateIdx.range : (data.ranges.length - 1); /*default to shortest range*/
      $scope.state = {
        symbol: $scope.symbols[symbolIdx],
        range: $scope.ranges[rangeIdx],
      };
    });

    socket.on("update", function(data) {
      $scope.chartOptions = chartAdapter.options();
      $scope.chartData = chartAdapter.prepare(data);
    });

    var stateChanged = function(newVal, oldVal) {
      if ($scope.state) {
        storage.set("stateIdx", {
          symbol: $scope.symbols.indexOf($scope.state.symbol),
          range: $scope.ranges.indexOf($scope.state.range),
        });
        socket.emit("update", $scope.state);
        exchange.update("symbol", $scope.state.symbol);
        exchange.update("range", $scope.state.range);
      }
    };

    $scope.$watch("state", stateChanged, true);

}]);