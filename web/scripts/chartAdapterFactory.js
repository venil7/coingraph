var app = require("./app");

app.factory("chartAdapter", 
  ["moment", "exchange", function(moment, exchange) {

  var full = function(x) {
    return moment(x).format("D MMM HH:mm");
  };

  var day = function(x) {
    return moment(x).format("DDMMM");
  };

  var hour = function(x) {
    return moment(x).format("HH:mm");
  };

  var label = hour;
  var tooltip = full;

  exchange.on("range", function(undefined, data){
    var threshold = 86400000; // 1 day
    label = (data.range > threshold) ? 
            day : hour;
  });

  return {
    options: function() {
      return {
        axes: {
          x:  { key: "time", labelFunction: label, type: "linear", tooltipFormatter: tooltip },
          y:  { type: "linear"},
          y2: { type: "linear"}
        },
        series: [
          { y: "buy", color: "red", type: "line", label: "Buy"},
          { y: "sell", color: "green", type: "line", label: "Sell"},
          { y: "vol", color: "DodgerBlue", type: "area", striped: true, label: "Volume", axis: "y2"}
        ],
        lineMode: "cardinal"
      };
    },
    prepare: function(data) {
      var ret = data.map(function(v) {
        v.value.time = new Date(v.value.time);
        return v.value;
      });
      return ret;
    }
  };
}]);