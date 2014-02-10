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
  this.pairs = config.symbols.map(function(x) { return x.pair; });
  // this.allRanges = config.ranges.map(function(x) { return x.name; });
};

// Query.prototype = Object.create(Events.EventEmitter.prototype);

Query.prototype.aggregate = function (pair, range) {
  var that = this;
  if (!~this.pairs.indexOf(pair)) {
    return Q.reject(new Error("pair is not configured."));
  }
  if (!~Object.keys(MAP)
    .filter(function(n){ return n!=="reduce" })
    .indexOf(range.aggr)) {
      return Q.reject(new Error("aggregate func is not configured."));
  }

  var now = +new Date(),
      then = now - range.range,
      range_array = [now, then];

  var gte = Math.min.apply(null, range_array);
  var lte = Math.max.apply(null, range_array);
  var query = { server_time: { $gte: gte, $lte: lte } };
  var map = MAP[range.aggr];
  var reduce = MAP.reduce;
  var out_collection_name = this.collectionName(pair, range.name);
  logger.info('running map-reduce', query);

  return this.db()
    .then(function(db) {
      var collection = db.collection(pair);
      return Q.nfcall(collection.mapReduce.bind(collection),
        map, reduce, { query: query, out: out_collection_name });
    })
    .then(function(c) {
      var metadata = c.db.collection("metadata");
      return Q.nfcall(
        metadata.update.bind(metadata), {
          name: out_collection_name
        },{
          name: out_collection_name, expires: +new Date() + range.exp
        }, { upsert: true })
      .then(function(){
        return c;
      });
    });
};

Query.prototype.get_range = function(pair, range) {
  var that = this;
  var aggr_collection_name = this.collectionName(pair, range.name);
  var read_from_collection = function(db, c) {
    var aggr_collection = c || db.collection(aggr_collection_name);
    return Q.nfcall(
          aggr_collection.find.bind(aggr_collection), {}, { limit: 100 })
        .then(function(cursor){
          return Q.nfcall(cursor.toArray.bind(cursor));
        });
  };
  return this.db()
    .then(function(db){
      var metadata = db.collection("metadata");
      return Q.nfcall(
        metadata.findOne.bind(metadata), { name: aggr_collection_name })
      .then(function (meta) {
        if (!!meta && !!meta.expires && meta.expires > +new Date()) {
          logger.info('cache exists');
          return read_from_collection(db);
        }
        return that.aggregate(pair, range)
          .then(function(c){
            return read_from_collection(db, c);
          });
      });
    });
};

Query.prototype.get_latest_snapshot = function () {
  var that = this;
  logger.info('getting latest snapshot');
  return this.db()
    .then(function(db){
      var promises = that.pairs.map(function(pair){
        var collection = db.collection(pair);
        return Q.nfcall(
          collection.findOne.bind(collection), {}, {sort:{$natural:-1}});
      });
      return Q.all(promises)
              .then(function(values){
                return lodash.zipObject(that.pairs, values);
              });
    });
};

Query.prototype.collectionName = function (pair, rangeName) {
  var template = "<%= pair %>_<%= rangeName %>";
  var model = {
    pair: pair,
    rangeName: rangeName.replace(/\s+/g, '_').toLowerCase()
  };

  return lodash.template(template, model);
};

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