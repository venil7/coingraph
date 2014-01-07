var static = require('node-static'),
    http   = require('http'),
    socket = require('socket.io'),
    Query  = require('./query'),
    Logger = require('./logger'),
    config = require('./config');

var logger = Logger(module, config.logging.web);
var staticServer = new static.Server(config.web);

var http = http.createServer(function (request, response) {
  request.addListener('end', function () {
    staticServer.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 3000);

var io = socket.listen(http, { log: false });
var query = new Query.Query(config);

// var handle = setInterval();


io.sockets.on('connection', function (socket) {
  logger.info('new client connected');

  socket.emit('welcome', {
    ranges: config.ranges,
    symbols: config.symbols
  });

  socket.on('update', function (req) {

  });
});

process.on('SIGINT', function() {
  logger.info('disconnecting from', config.mongoServer);
  query.close();
  process.exit( );
});