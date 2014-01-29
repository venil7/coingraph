// fault tolerant connect mixin
module.exports = function(Q, Mongodb, config, logger) {
  return {
    db: db = function () {
      if (!!this._db) { return this._db; }

      var that = this;
      logger.info('attempting to (re)connect to', config.mongoServer);
      this._db = Q.nfcall(Mongodb.connect.bind(Mongodb), config.mongoServer)
        .then(function (db) {
          db.on('close', function () {
            logger.info('disconnected from', config.mongoServer);
            that._db = null;
          });
          return db;
        })
        .catch(function (e) {
          logger.info('failed to connect to', config.mongoServer);
          that._db = null;
          return Q.reject(new Error("Failed to connect to mongodb"));
        });

      return this._db;
    }
  };
};