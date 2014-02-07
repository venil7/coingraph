var Mongodb = require('mongodb'),
    // Q       = require('q'),
    Events  = require('events'),
    lodash  = require('lodash'),
    Logger  = require('./logger'),
    config  = require('./config');

var logger = Logger(module, config.logging.web);

var MRRunner = function (symbol, range, query) {
  this.symbol = symbol;
  this.range = range;
  this.query = query;
};

MRRunner.prototype = Object.create(Events.EventEmitter.prototype);

MRRunner.prototype.run = function() {
  this.query.aggregate(this.symbol.pair, this.range);
};

MRRunner.prototype.start = function() {
  var that = this;
  logger.info('starting MR runner', that.symbol.name, that.range.name);

  var func = function() {
    logger.info('about to run MR for',
      that.symbol.name, that.range.name, that.range.freq);
    that.run();
    that.handle = setTimeout(func, that.range.freq);
  };

  this.handle = setTimeout(func, 0);
};

MRRunner.prototype.stop = function() {
  var that = this;
  logger.info('stopping MR runner',
    that.symbol.name, that.range.name);
  clearTimeout(this.handle);
};

MRSaver = function(symbols, ranges, query) {
  this.symbols = symbols;
  this.ranges = ranges;
  this.query = query;
};

MRSaver.prototype.start = function() {
  this.runners = [];
  for(var i in this.symbols) {
    for(var j in this.ranges) {
      var symbol = this.symbols[i];
      var range = this.ranges[j];
      var runner = new MRRunner(symbol, range, this.query);
      runner.start();
      this.runners.push(runner);
    }
  }
};

MRSaver.prototype.stop = function() {
  for(var i in this.runnners) {
    this.runners[i].stop();
  }
  this.runners = [];
};

module.exports = {
  MRSaver: MRSaver
};