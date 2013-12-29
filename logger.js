var winston = require('winston');

module.exports = function(module, transport_config) {
  var id = module.id;
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