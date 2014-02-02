var Q = require("q");
var Mongodb = require('mongodb');
var Query = require("../query");
var config = require("../config");

var query = new Query.Query(config);

query.get_latest_snapshot()
  .then(function(array) {
      console.log(array);
    query.close();
  })
  .catch(function(err){
    console.log("error:", err.toString());
    query.close();
  });

// var minute_map = function() {
//   var minute = 1000 * 60;
//   var key = new Date(Math.floor(this.server_time / minute) * minute);
//   emit(key, this);
// };

// var hourly_map = function() {
//   var hour = 1000 * 60 *60;
//   var key = new Date(Math.floor(this.server_time / hour) * hour);
//   emit(key, this);
// };

// var daily_map = function() {
//   var day = 1000 * 60 *60 * 24;
//   var key = new Date(Math.floor(this.server_time / day) * day);
//   emit(key, this);
// };

// var map = function (period) {
//   var periods = {};
//   periods.minute = 1000 * 60;
//   periods.hour = periods.minute * 60;
//   periods.day = periods.hour * 24;

//   return function () {
//     var p = periods[period];
//     var key = new Date(Math.floor(this.server_time / p) * p);
//     emit(key, this);
//   }
// };

// var reduce = function(key, values) {
//     var all_highs = values.map(function(v) { return v.high || 0 });
//     var all_lows = values.map(function(v) { return v.low || 0 });
//     var all_avgs = values.map(function(v) { return v.avg || 0 });
//     var all_vols = values.map(function(v) { return v.vol || 0 });

//     var high = Math.max.apply(null, all_highs);
//     var low = Math.max.apply(null, all_lows);
//     var avg = Array.avg(all_avgs);
//     var vol = Array.avg(all_vols);

//     return { time: key, high: high, low: low, avg: avg, vol: vol };
// };

// Mongodb.connect(config.mongoServer, function(err, db) {
//   var collection = db.collection('btc_usd');
//   // console.log(collection);
//   collection.mapReduce(minute_map, reduce, { out: { inline: 1 }}, function(err, data) {
//     console.log(data);
//     db.close();
//   });
//   // collection.find().toArray(function(err, data) {
//   //   data.forEach(function(v){
//   //     console.log(new Date(v.server_time).getFullYear(), v.avg);
//   //   });
//   //   db.close();
//   // });
// });