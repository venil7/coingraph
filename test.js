var Ticker = require('./ticker')
var ticker1 = new Ticker.BtceTicker('btc_usd');
var ticker2 = new Ticker.BtceTicker('ltc_eur');

ticker1.on('tick', function(e,d){
  if(e) console.log(e);
  if(d) console.log('1:', d.server_time);
});

ticker2.on('tick', function(e,d){
  if(e) console.log(e);
  if(d) console.log('2: ',d.server_time);
});