var Mongodb = require('mongodb'),
    Events  = require('events'),
    Q       = require('q'),
    Ticker  = require('./ticker'),
    config  = require('./config.json'),
    Logger  = require('./logger');

var logger = Logger(module, config.logging.ticker);

var TickSaver = function(config) {
  config = config || {};
  var that = this;
  this.symbols = Array.isArray(config.symbols) ? config.symbols : [];
  this.tickers = [];
  if (this.symbols.length) {
    this.symbols.forEach(function(symbol, index, arr) {
      symbol = (typeof symbol == "string")
          ? { pair: symbol, freq: config.tickerFreq }
          : (typeof symbol == "object" ? { pair: symbol.pair, freq: symbol.freq } : {});
      var ticker = new Ticker.BtceTicker(symbol.pair, symbol.freq);
      ticker.on('tick', that.tickHandler.bind(that));
      that.tickers.push(ticker);
    });
    this.db = Q.nfcall(Mongodb.connect.bind(Mongodb), config.mongoServer);
  };
};

TickSaver.prototype = Object.create(Events.EventEmitter.prototype);

TickSaver.prototype.save = function(pairData, pair) {
    this.db
    .then(function(db) {
      collection = db.collection(pair);
      return Q.nfcall(collection.insert.bind(collection), pairData);
    })
    .then(function() {
      logger.info('saiving pair data', pair, new Date(pairData.server_time * 1000));
    })
    .catch(function(err) {
      logger.error(err.toString());
    });
};

TickSaver.prototype.tickHandler = function(err, pairData, pair) {
  if (err) logger.error(err.toString());
  if (pairData) this.save(pairData, pair);
};

var saver = new TickSaver(config);