Stream
======

Here I will learn about streams using interactive models.

>     Stream

>     Stream(1, 2, 3)

>     stream = Stream.repeat(1)
>     stream.take()
>     .then (value) ->

A distinguishable object representing the empty stream.

    emptyStream =
      null: true

Get an element from a stream at position `n`

    get = (stream, n) ->
      if n is 0
        stream.first()
      else
        get(stream.rest(), n - 1)

Transform a stream

    map = (stream, fn) ->
      if stream.null
        emptyStream
      else
        Stream(
          fn(stream.first()),
          map(stream.rest(), fn)
        )

Invoke a function for each item in a stream.

    each = (stream, fn) ->
      unless stream.null
        fn(stream.first())
        each(stream.rest(), fn)

      stream

Construct a stream

    Stream = (first, rest) ->
      delayed = ->
        rest

      first: ->
        first
      rest: ->
        delayed()

Export

    module.exports = Stream
