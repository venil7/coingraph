// A ScopedSocket is an object that provides `on` and `emit` methods,
// but keeps track of all listeners it registers on the socket.
// A call to `removeAllListeners` will remove all listeners on the
// socket that were created via this particular instance of ScopedSocket.

var ScopedSocket = function(socket, $rootScope) {
  this.socket = socket;
  this.$rootScope = $rootScope;
  this.listeners = [];
};

ScopedSocket.prototype.removeAllListeners = function() {
  // Remove each of the stored listeners
  for(var i = 0; i < this.listeners.length; i++) {
    var details = this.listeners[i];
    this.socket.removeListener(details.event, details.fn);
  };
};

ScopedSocket.prototype.on = function(event, callback) {
  var socket = this.socket;
  var $rootScope = this.$rootScope;

  // Store the event name and callback so we can remove it later
  this.listeners.push({event: event, fn: callback});

  socket.on(event, function() {
    var args = arguments;
    $rootScope.$apply(function() {
      callback.apply(socket, args);
    });
  });
};

ScopedSocket.prototype.emit = function(event, data, callback) {
  var socket = this.socket;
  var $rootScope = this.$rootScope;

  socket.emit(event, data, function() {
    var args = arguments;
    $rootScope.$apply(function() {
      if (callback) {
        callback.apply(socket, args);
      }
    });
  });
};