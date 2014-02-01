coingraph.factory('storage', function(){
  localStorage = localStorage || {};
  return {
    set: function(name, value) {
      if (typeof value === "object") {
        value = "\x00" + JSON.stringify(value);
      } else if (typeof value == "number") {
        value = "\x01" + value.toString();
      }
      localStorage[name] = value;
    },
    get: function(name) {
      var value = localStorage[name];
      if (value) {
        if (value[0] == "\x00") {
          value = value.substring(1);
          return JSON.parse(value);
        }
        if (value[0] == "\x01") {
          value = value.substring(1);
          return parseInt(value, 10);
        }
      }
      return value;
    }
  }
});