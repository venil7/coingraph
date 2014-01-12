## coingraph

### sample `config.json`

    {
      "mongoServer": "mongodb://localhost:27017/coingraph",
      "symbols": [
        { "pair": "btc_usd", "name": "BTC USD", "freq": null },
        { "pair": "ltc_btc", "name": "LTC BTC", "freq": null }
      ],
      "tickerFreq": 60000,
      "logging": {
        "ticker": {
          "filename": "./ticker.log",
          "json": false,
          "timestamp": true,
          "level": "error"
        },
        "web": {
          "filename": "./web.log",
          "json": false,
          "timestamp": true,
          "level": "error"
        }
      },
      "ranges":  [
        { "name": "1 Month" , "aggr": "day",    "range": 2592000000 },
        { "name": "1 Week"  , "aggr": "hour",   "range": 604800000 },
        { "name": "1 Day"   , "aggr": "minute", "range": 86400000  },
        { "name": "12 Hours", "aggr": "minute", "range": 43200000 },
        { "name": "6 Hours" , "aggr": "minute", "range": 21600000 },
        { "name": "3 Hours" , "aggr": "minute", "range": 10800000 },
        { "name": "1 Hour"  , "aggr": "minute", "range": 3600000 },
        { "name": "10 Mins" , "aggr": "minute", "range": 600000 }
      ],
      "web":"./dist"
    }