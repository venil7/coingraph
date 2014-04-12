var app = require("./app"),
    ScopedSocket = require("./scopedsocket");

app.factory("Socket", ["$rootScope", function($rootScope) {
  var socket = io.connect();

  // When injected into controllers, etc., Socket is a function
  // that takes a Scope and returns a ScopedSocket wrapping the
  // global Socket.IO `socket` object. When the scope is destroyed,
  // it will call `removeAllListeners` on that ScopedSocket.
  return function(scope) {
    var scopedSocket = new ScopedSocket(socket, $rootScope);
    scope.$on("$destroy", function() {
      scopedSocket.removeAllListeners();
    });
    return scopedSocket;
  };
}]);