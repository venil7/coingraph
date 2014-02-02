var Mongodb = require('mongodb'),
    Q       = require('q'),
    Events  = require('events'),
    lodash  = require('lodash'),
    Logger  = require('./logger'),
    connect = require('./ft-connect'),
    config  = require('./config');

var logger = Logger(module, config.logging.web);
var ftConnectMixin = connect(Q, Mongodb, config, logger);

var Query = function(config) {
  this.config = config || {};
  lodash.mixin(this, ftConnectMixin);
  this.allPairs = config.symbols.map(function(x) { return x.pair; });
  this.allRanges = config.ranges.map(function(x) { return x.name; });
};

Query.prototype = Object.create(Events.EventEmitter.prototype);

Query.prototype.get = function (pair, aggr, range) {
  var that = this;
  if (!~this.allPairs.indexOf(pair)) { return Q.reject(new Error("pair is not configured.")); }
  if (!~Object.keys(MAP).filter(function(n){ return n!=="reduce" }).indexOf(aggr)) { return Q.reject(new Error("aggregate func is not configured.")); }

  var now = +new Date(),
      yesterday = now - 60 * 60 * 24 * 1000;
  range = (Array.isArray(range) && (range.length >= 2))
          ? range.slice(0, 2)
          : typeof range == "number" ? [now, range] : [now, yesterday];
  var gte = Math.min.apply(null, range);
  var lte = Math.max.apply(null, range);
  var query = { server_time: { $gte: gte, $lte: lte } };
  var map = MAP[aggr];
  var reduce = MAP.reduce;
  logger.info('querying', query);

  return this.db()
    .then(function(db) {
      var collection = db.collection(pair);
      return Q.nfcall(collection.mapReduce.bind(collection), map, reduce, { out: { inline: 1 }, query: query });
    });
};

Query.prototype.get_range = function(pair, range) {
  var idx = this.allRanges.indexOf(range);
  if (!~idx) { return Q.reject(new Error("range is not configured.")); }
  var range = config.ranges[idx];
  return this.get(pair, range.aggr, +new Date() - range.range);
};

Query.prototype.get_latest_snapshot = function () {
  var that = this;
  logger.info('getting latest snapshot');
  return this.db()
    .then(function(db){
      var promises = that.allPairs.map(function(pair){
        var collection = db.collection(pair);
        return Q.nfcall(
          collection.findOne.bind(collection), {}, {sort:{$natural:-1}});
      });
      return Q.all(promises)
              .then(function(values){
                return lodash.zipObject(that.allPairs, values);
              });
    });
}

Query.prototype.close = function () {
  this.db()
      .then(function(db){
        db.close();
      });
};

module.exports = {
  Query: Query
};

var MAP = {
  minute: function() {
    var minute = 1000 * 60;
    var key = (Math.floor(this.server_time / minute) * minute);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  fiveminute: function() {
    var fiveminute = 1000 * 60 * 5;
    var key = (Math.floor(this.server_time / fiveminute) * fiveminute);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  tenminute: function() {
    var tenminute = 1000 * 60 * 10;
    var key = (Math.floor(this.server_time / tenminute) * tenminute);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  halfhour: function() {
    var halfhour = 1000 * 60 * 30;
    var key = (Math.floor(this.server_time / halfhour) * halfhour);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  hour: function() {
    var hour = 1000 * 60 * 60;
    var key = (Math.floor(this.server_time / hour) * hour);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  threehour: function() {
    var threehour = 1000 * 60 * 60 * 3;
    var key = (Math.floor(this.server_time / threehour) * threehour);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  day: function() {
    var day = 1000 * 60 *60 * 24;
    var key = (Math.floor(this.server_time / day) * day);
    var value = { time: key, buy: this.buy, sell: this.sell, avg: this.avg, vol: this.vol };
    emit(key, value);
  },

  reduce: function(key, values) {
      var all_highs = [],
          all_lows = [],
          all_avgs = [],
          all_buys = [],
          all_sells = [];
          all_vols = [];

      values.forEach(function (v) {
        all_buys.push(v.buy || 0);
        all_sells.push(v.sell || 0);
        all_avgs.push(v.avg || 0);
        all_vols.push(v.vol || 0);
      });

      // var high = Math.max.apply(null, all_highs);
      // var low = Math.max.apply(null, all_lows);
      var buy = Array.avg(all_buys);
      var sell = Array.avg(all_sells);
      var avg = Array.avg(all_avgs);
      var vol = Math.max.apply(null, all_vols);

      return { time: key, buy: buy, sell: sell, avg: avg, vol: vol };
  }
};