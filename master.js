(function() {
  var FROM, NULL, STDOUT, Streamatorium, T, TO, accumulator, clock, connector, connectors, counter, defer, each, filter, gate, getJSON, identity, invoke, latch, map, pluck, soak, split, tee, toggle, tokenizer,
    __slice = [].slice;

  STDOUT = function(atom) {
    return console.log(atom);
  };

  NULL = function(atom) {};

  identity = function(output) {
    return function(atom) {
      return output(atom);
    };
  };

  defer = function(output) {
    return function(atom) {
      return setTimeout(output, 0, atom);
    };
  };

  each = function(output) {
    return function(arrayOrItem) {
      return [].concat(arrayOrItem).forEach(function(item) {
        return output(item);
      });
    };
  };

  getJSON = function(output) {
    return function(url) {
      return $.getJSON(url).then(output);
    };
  };

  split = function() {
    var outputs;
    outputs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return function(atom) {
      return outputs.forEach(function(output) {
        return output(atom);
      });
    };
  };

  tee = function(sink) {
    return function(output) {
      return split(sink, output);
    };
  };

  T = tee(STDOUT);

  map = function(fn) {
    return function(output) {
      return function(atom) {
        return output(fn(atom));
      };
    };
  };

  pluck = function(name) {
    return function(output) {
      return function(atom) {
        return output(atom[name]);
      };
    };
  };

  invoke = function() {
    var args, name;
    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return function(output) {
      return function(atom) {
        return output(atom[name].apply(atom, args));
      };
    };
  };

  filter = function(fn) {
    return function(output) {
      return function(atom) {
        if (fn(atom)) {
          return output(atom);
        }
      };
    };
  };

  soak = filter(function(atom) {
    return atom != null;
  });

  toggle = function(output) {
    var value;
    value = true;
    return function(atom) {
      output(value);
      return value = !value;
    };
  };

  counter = function(output) {
    var value;
    value = 0;
    return function(atom) {
      return output(value += 1);
    };
  };

  accumulator = function(output) {
    var value;
    value = 0;
    return function(atom) {
      return output(value += atom);
    };
  };

  tokenizer = function(output) {
    var word;
    word = "";
    return function(character) {
      if (character.match(/\s/)) {
        if (word) {
          output(word);
          return word = "";
        }
      } else {
        return word += character;
      }
    };
  };

  connector = function() {
    var atoms, collector, flush, output;
    atoms = [];
    output = null;
    flush = function() {
      var _results;
      if (output) {
        _results = [];
        while (atoms.length) {
          _results.push(output(atoms.shift()));
        }
        return _results;
      }
    };
    collector = function(atom) {
      atoms.push(atom);
      return flush();
    };
    collector.source = function(sink) {
      output = sink;
      return flush();
    };
    return collector;
  };

  connectors = {};

  TO = function(id) {
    return connectors[id] = connector();
  };

  FROM = function(id) {
    return connectors[id].source;
  };

  clock = function(t) {
    return function(output) {
      return setInterval(function() {
        return output(1);
      }, t * 1000);
    };
  };

  gate = function(ctrl) {
    return function(output) {
      var buffer;
      buffer = [];
      ctrl(function() {
        return output(buffer.shift());
      });
      return function(atom) {
        return buffer.push(atom);
      };
    };
  };

  latch = function(ctrl) {
    return function(output) {
      var value;
      value = void 0;
      ctrl(function() {
        return output(value);
      });
      return function(atom) {
        return value = atom;
      };
    };
  };

  module.exports = Streamatorium = {
    accumulator: accumulator,
    clock: clock,
    counter: counter,
    each: each,
    filter: filter,
    FROM: FROM,
    gate: gate,
    getJSON: getJSON,
    identity: identity,
    invoke: invoke,
    map: map,
    pluck: pluck,
    pollute: function() {
      return Object.keys(Streamatorium).forEach(function(name) {
        if (name !== "pollute") {
          return global[name] = Streamatorium[name];
        }
      });
    },
    soak: soak,
    T: T,
    tee: tee,
    TO: TO,
    toggle: toggle
  };

}).call(this);
