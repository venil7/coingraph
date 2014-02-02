var static = require('node-static'),
    http   = require('http'),
    socket = require('socket.io'),
    Query  = require('./query'),
    Logger = require('./logger'),
    config = require('./config');

var logger = Logger(module, config.logging.web);
var staticServer = new static.Server(config.web.public, { cache: config.web.cache || 7200 });

var port = config.web.port || 3000;
var host = config.web.host || "localhost";

var errorLogger = function(err) {
  logger.error(err.toString());
};

var http = http.createServer(function (request, response) {
  staticServer.serve(request, response, function (err, res) {
    if (err) {
      logger.error('error serving', request.url, err.message);
      response.writeHead(err.status, err.headers);
      response.end();
    }
  });
}).listen(port, host);

var io = socket.listen(http, { log: false });
var query = new Query.Query(config);

logger.info("app started on", host, port);

io.sockets.on('connection', function (socket) {
  logger.info('new client connected');

  socket.emit('welcome', {
    ranges: config.ranges,
    symbols: config.symbols
  });

  socket.on('update', function (state) {
    logger.info('client asked for data', state);
    var result = query.get_range(state.symbol.pair, state.range.name);
    result
      .then(function(data) {
        socket.emit('update', data);
      })
      .catch(errorLogger);
  });

  query.get_latest_snapshot()
      .then(function(snapshot){
        socket.emit('latest', snapshot);
      })
      .catch(errorLogger);

});

var latestUpdate = function() {
  var clients = io.sockets.clients();
  if (clients && clients.length) {
    query.get_latest_snapshot()
      .then(function(snapshot){
        io.sockets.emit('latest', snapshot);
      })
      .catch(errorLogger);
  }
};

setInterval(latestUpdate, config.tickerFreq);

process.on('SIGINT', function() {
  logger.info('disconnecting from', config.mongoServer);
  query.close();
  process.exit( );
});