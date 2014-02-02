coingraph.controller('instantUpdateCtl',
  ['$scope', 'Socket', 'exchange', function($scope, Socket, chartAdapter, storage, exchange) {
      var socket = Socket($scope);

      socket.on('latest', function(data) {
        $scope.latest = data;
      });
    }
  ]);