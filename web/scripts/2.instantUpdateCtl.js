coingraph.controller('instantUpdateCtl',
  ['$scope', 'Socket', 'exchange',
    function($scope, Socket, exchange) {
      var socket = Socket($scope);

      socket.on('latest', function(latest) {
        $scope.latest = latest;
        exchange.update('latest', $scope.latest);
      });
    }
  ]);