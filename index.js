var  //Mongodb = require('mongodb'),
    static = require('node-static'),
    config = require('./config.json'),
    http = require('http'),
    socketio = require('socket.io'),
    Logger = require('./logger.js'),
    Q       = require('q');

var logger = Logger(module, config.logging.web);
var staticServer = new static.Server('./public');

var http = http.createServer(function (request, response) {
    request.addListener('end', function () {
        staticServer.serve(request, response);
    }).resume();
}).listen(8080);

var io = socketio.listen(http);