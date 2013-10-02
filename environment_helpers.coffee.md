Environment Helpers
-------------------

Some helpers that we add to the global environment so we can use our streams to
their fullest.

Adding `Object#tap` so it's easier to put any object into the beginnig of a
stream.

    unless Object.prototype.tap
      Object.defineProperty Object.prototype, "tap",
        enumerable: false
        configurable: false
        writable: false
        value: (fn) ->
          fn(this)

          return this
