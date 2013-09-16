Stream
======

Here I will learn about streams using interactive models.

Construct a stream

    Stream = (first, rest=->emptyStream) ->
      self =
        first: ->
          first
        rest: rest

Get an element from a stream at position `n`

        get: (n) ->
          if n is 0
            self.first()
          else
            rest().get(n - 1)

Invoke a function for each item in a stream.

        each: (fn) ->
          fn(self.first())
          each(self.rest(), fn)
    
          self

Transform a stream

        map: (fn) ->
          Stream(
            fn(self.first()),
            -> rest().map(fn)
          )

A distinguishable object representing the empty stream.

    emptyStream =
      map: ->
        emptyStream
      each: ->
        emptyStream
      get: ->

Export

    module.exports = Stream

Resources
---------

http://mitpress.mit.edu/sicp/full-text/sicp/book/node70.html