coingraph.directive('coinTitle',
  ['exchange', function(exchange) {
      return {
        scope: {
          title: '@coinTitle'
        },
        restrict: "A",
        template: "{{symbol.name}} - {{title}}",
        link: function(scope, elem, attr){
          scope.symbol = exchange.symbol;
          exchange.on('symbol', function(undefined, symbol){
            scope.symbol = symbol;
          });
        }
      };
    }
  ]);