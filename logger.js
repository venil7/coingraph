var winston = require('winston'),
    path = require('path');

module.exports = function(module, transport_config) {
  var id = path.basename(module.filename);
  var logger = new (winston.Logger)({
    transports: [
      new winston.transports.File(transport_config),
      new winston.transports.Console({colorize: true, timestamp: true})
    ]
  });

  //monkey patching log to contain module id
  var f = logger.log;
  logger.log = function(level) {
    args = Array.prototype.slice.call(arguments, 1),
    args.unshift(id);
    args.unshift(level);
    f.apply(logger, args);
  };

  return logger;
};