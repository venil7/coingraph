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
  this.pairs = Array.isArray(config.pairs) ? config.pairs : [];
  this.tickers = [];
  if (this.pairs.length) {
    this.pairs.forEach(function(pair, index, arr){
      var ticker = new Ticker.BtceTicker(pair);
      ticker.on('tick', that.tickHandler.bind(that));
      that.tickers.push(ticker);
    });
    this.db = Q.nfcall(Mongodb.connect.bind(Mongodb), config.mongoServer);
  };
};

TickSaver.prototype = Object.create(Events.EventEmitter.prototype);

TickSaver.prototype.save = function(pairData, pair) {
    this.db
    .then(function(db){
      collection = db.collection(pair);
      return Q.nfcall(collection.insert.bind(collection), pairData);
    })
    .then(function(){
      logger.info('saiving pair data', pair, new Date(pairData.server_time * 1000));
    })
    .catch(function(err){
      logger.error(err.toString());
    });
};

TickSaver.prototype.tickHandler = function(err, pairData, pair) {
  if (err) logger.error(err.toString());
  if (pairData) this.save(pairData, pair);
};

var saver = new TickSaver(config);