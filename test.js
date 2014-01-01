// var Ticker = require('./ticker')
// var ticker1 = new Ticker.BtceTicker('btc_usd');
// var ticker2 = new Ticker.BtceTicker('ltc_eur');

// ticker1.on('tick', function(e,d){
//   if(e) console.log(e);
//   if(d) console.log('1:', d.server_time);
// });

// ticker2.on('tick', function(e,d){
//   if(e) console.log(e);
//   if(d) console.log('2: ',d.server_time);
// });

var Query = require("./query");
// var Q = require("q");
var config = require("./config.json");

var query = new Query.Query(config);
    // query.close();

query.get("btc_usd", [])
     .then(function(data){
        data.toArray(function(err, a){
          console.log("success");
          console.log(a[0].server_time);
          console.log(a[a.length-1].server_time);
          query.close();
        });
     })
     .catch(function(err){
        console.log("error");
        console.log(err);
        query.close();
     });
