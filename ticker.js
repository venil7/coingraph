var Btce    = require('btce'),
    Events  = require('events');

var BtceTicker = function (pair, freq) {
  var that = this;
  this.pair = pair;
  this.freq = freq;
  this.btce = new Btce();
  this.handler = setTimeout(function() {
    that.query();
  }, 0);
};

BtceTicker.prototype = Object.create(Events.EventEmitter.prototype);

BtceTicker.prototype.query = function() {
  var that = this;
  var pair = this.pair;
  this.btce.ticker({pair: pair}, function(err, data) {
    that.emit('tick', err, (data && data.ticker) || null, pair);
    that.handler = setTimeout(that.query.bind(that), that.freq);
  });
};

BtceTicker.prototype.cancel = function() {
  clearTimeout(this.handler);
};

module.exports = {
  BtceTicker: BtceTicker
};