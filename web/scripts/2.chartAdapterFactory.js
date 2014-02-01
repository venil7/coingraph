coingraph.factory('chartAdapter', ['moment', function(moment) {
  var full = function(x) {
    return moment(x).format("D MMM HH:mm");
  };

  var hour = function(x) {
    return moment(x).format("HH:mm");
  };

  return {
    options: {
      axes: {
        x:  { key: 'time', labelFunction: hour, type: 'linear', tooltipFormatter: full },
        y:  { type: 'linear'},
        y2: { type: 'linear'}
      },
      series: [
        { y: 'buy', color: 'red', type: 'line', label: 'Buy'},
        { y: 'sell', color: 'green', type: 'line', label: 'Sell'},
        { y: 'vol', color: 'DodgerBlue', type: 'area', striped: true, label: 'Volume', axis: 'y2'}
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