(function() {
  var Stream, emptyStream;

  Stream = function(first, rest) {
    var self;
    if (rest == null) {
      rest = function() {
        return emptyStream;
      };
    }
    return self = {
      first: function() {
        return first;
      },
      rest: rest,
      get: function(n) {
        if (n === 0) {
          return self.first();
        } else {
          return rest().get(n - 1);
        }
      },
      each: function(fn) {
        fn(self.first());
        rest().each(fn);
        return self;
      },
      map: function(fn) {
        return Stream(fn(self.first()), function() {
          return rest().map(fn);
        });
      }
    };
  };

  emptyStream = {
    map: function() {
      return emptyStream;
    },
    each: function() {
      return emptyStream;
    },
    get: function() {}
  };

  module.exports = Stream;

}).call(this);
