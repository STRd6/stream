(function() {
  var Stream, each, emptyStream, get, map;

  emptyStream = {
    "null": true
  };

  get = function(stream, n) {
    if (n === 0) {
      return stream.first();
    } else {
      return get(stream.rest(), n - 1);
    }
  };

  map = function(stream, fn) {
    if (stream["null"]) {
      return emptyStream;
    } else {
      return Stream(fn(stream.first()), map(stream.rest(), fn));
    }
  };

  each = function(stream, fn) {
    if (!stream["null"]) {
      fn(stream.first());
      each(stream.rest(), fn);
    }
    return stream;
  };

  Stream = function(first, rest) {
    var delayed;
    delayed = function() {
      return rest;
    };
    return {
      first: function() {
        return first;
      },
      rest: function() {
        return delayed();
      }
    };
  };

  module.exports = Stream;

}).call(this);
