var coingraph = angular.module("coingraph", ['angles']);

coingraph.factory('comm', function() {
  return {

  };
});

coingraph.controller('chartController', function($scope, comm) {
    $scope.options = {
        animation : false
    }
    $scope.chart = {
        //labels : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        //labels: ["one","","","","four","","","","eight","","","","twelve"],
        labels: new Array(1000),
        datasets : [
            {
                fillColor : "rgba(151,187,205,0.5)",
                strokeColor : "#e67e22",
                pointColor : "rgba(151,187,205,0)",
                pointStrokeColor : "#e67e22",
                data : new Array(1000),
            },
            {
                fillColor : "rgba(151,187,205,0.7)",
                strokeColor : "#f1c40f",
                pointColor : "rgba(151,187,205,0)",
                pointStrokeColor : "#f1c40f",
                data : new Array(1000),
            }
        ],
    };

    $scope.clickme = function () {
      setInterval(function(){
        $scope.$apply(function(){
          $scope.chart.datasets[0].data.shift();
          $scope.chart.datasets[0].data.push(Math.random()*10);

          $scope.chart.datasets[1].data.pop();
          $scope.chart.datasets[1].data.unshift(Math.random()*10);
        });
      }, 2);
    };
});