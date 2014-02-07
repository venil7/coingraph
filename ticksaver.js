var Mongodb = require('mongodb'),
    Q       = require('q'),
    Events  = require('events'),
    lodash  = require('lodash'),
    Ticker  = require('./ticker'),
    config  = require('./config'),
    connect = require('./ft-connect'),
    Logger  = require('./logger');

var logger = Logger(module, config.logging.ticker);
var ftConnectMixin = connect(Q, Mongodb, config, logger);

var TickSaver = function(config) {
  var that = this;
  this.config = config || {};
  this.tickers = [];
  if (config.symbols.length) {
    config.symbols.forEach(function(symbol, index, arr) {
      var ticker = new Ticker.BtceTicker(symbol.pair, symbol.freq || config.tickerFreq);
      ticker.on('tick', that.tickHandler.bind(that));
      that.tickers.push(ticker);
    });
    lodash.mixin(this, ftConnectMixin);
  };
};

TickSaver.prototype = Object.create(Events.EventEmitter.prototype);

TickSaver.prototype.save = function(pairData, pair) {
    this.db()
    .then(function(db) {
      var collection = db.collection(pair);
      pairData.server_time *= 1000;
      pairData.updated *= 1000;
      return Q.nfcall(collection.insert.bind(collection), pairData);
    })
    .then(function() {
      logger.info('saiving pair data', pair, new Date(pairData.server_time));
    })
    .catch(function(err) {
      logger.error(err.toString());
    });
};

TickSaver.prototype.tickHandler = function(err, pairData, pair) {
  if (err) logger.error(err.toString());
  if (pairData) this.save(pairData, pair);
};

TickSaver.prototype.shutdown = function() {
  logger.info('gracefully shutting down saver');
  for(var i in this.tickers || []) {
    var ticker = this.tickers[i];
    ticker.cancel();
  }
  this.db().then(function(db){
    db.close();
  });
};

module.exports = {
  TickSaver: TickSaver
};

if (!module.parent) {
  var saver = new TickSaver(config);

  process.on('SIGINT', function() {
    saver.shutdown();
    process.exit();
  });
}