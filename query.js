var Mongodb = require('mongodb'),
    Q       = require('q'),
    Events  = require('events'),
    Logger  = require('./logger'),
    config  = require('./config');

var logger = Logger(module, config.logging.web);

var Query = function(config) {
  var that = this;
  logger.info('attempting to connect to', config.mongoServer);
  this.db = Q.nfcall(Mongodb.connect.bind(Mongodb), config.mongoServer);
};

Query.LIMIT = 100;

Query.prototype = Object.create(Events.EventEmitter.prototype);

Query.prototype.get = function (pair, aggr, range) {
  var that = this;
  var allowedPairs = config.symbols.map(function(s) { return typeof s == "object" ? s.pair : s.toString(); });
  if (!~allowedPairs.indexOf(pair)) { throw new Error("pair is not configured."); }
  if (!~["hour", "day", "minute"].indexOf(aggr)) { throw new Error("aggregate func is not configured."); }

  var now = +new Date(),
      yesterday = now - 60 * 60 * 24 * 1000;
  range = (Array.isArray(range) && (range.length >= 2))
          ? range.slice(0, 2)
          : typeof range == "number" ? [now, range] : [ now, yesterday];
  var gte = Math.min.apply(null, range);
  var lte = Math.max.apply(null, range);
  var query = { server_time: { $gte: gte, $lte: lte } };
  var map = MAP[aggr];
  logger.info('querying', query);

  return this.db
    .then(function(db) {
      var collection = db.collection(pair);
      that.emit('get', pair);
      return Q.nfcall(collection.mapReduce.bind(collection), map, MAP.reduce, { out: { inline: 1 }, query: query });
    });
};

Query.prototype.close = function () {
  this.db
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
    var key = new Date(Math.floor(this.server_time / minute) * minute);
    emit(key, this);
  },

  hour: function() {
    var hour = 1000 * 60 *60;
    var key = new Date(Math.floor(this.server_time / hour) * hour);
    emit(key, this);
  },

  day: function() {
    var day = 1000 * 60 *60 * 24;
    var key = new Date(Math.floor(this.server_time / day) * day);
    emit(key, this);
  },

  reduce: function(key, values) {
      var all_highs = values.map(function(v) { return v.high || 0 });
      var all_lows = values.map(function(v) { return v.low || 0 });
      var all_avgs = values.map(function(v) { return v.avg || 0 });
      var all_vols = values.map(function(v) { return v.vol || 0 });

      var high = Math.max.apply(null, all_highs);
      var low = Math.max.apply(null, all_lows);
      var avg = Array.avg(all_avgs);
      var vol = Array.avg(all_vols);

      return { time: key, high: high, low: low, avg: avg, vol: vol };
  }
};