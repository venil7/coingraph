var Mongodb = require('mongodb'),
    static = require('node-static'),
    config = require('./config.json'),
    http = require('http'),
    Q       = require('q');


var staticServer = new static.Server('./public');

http.createServer(function (request, response) {
    request.addListener('end', function () {
        staticServer.serve(request, response);
    }).resume();
}).listen(8080);