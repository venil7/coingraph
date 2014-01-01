var Mongodb = require('mongodb'),
    Q       = require('q'),
    Events  = require('events'),
    Logger  = require('./logger.js'),
    config  = require('./config.json');

var logger = Logger(module, config.logging.web);

var Query = function(config) {
  var that = this;
  this.db = Q.nfcall(Mongodb.connect.bind(Mongodb), config.mongoServer);
};

Query.LIMIT = 100;

Query.prototype = Object.create(Events.EventEmitter.prototype);

Query.prototype.get = function (pair, range) {
  var that = this;
  var now = +new Date();
      then = now - 60 * 60 * 24 * 1000;
  range = (Array.isArray(range) && (range.length >= 2))
          ? range.slice(0, 2)
          : [ now, then];
  var gte = range[0] < range[1] ? range[0] : range[1];
  var lte = range[0] > range[1] ? range[0] : range[1];
  var query = { server_time: { $gte: gte, $lte: lte } };
  // console.log(query);

  return this.db
    .then(function(db) {
      var collection = db.collection(pair);
      that.emit('get', pair);
      return Q.nfcall(collection.find.bind(collection), query)
              .then(function(cursor){
                return Q.nfcall(cursor.limit.bind(cursor, Query.LIMIT));
              })
              .then(function(cursor){
                return Q.nfcall(cursor.sort.bind(cursor, { server_time: 1 }));
              });
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
