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
          rest().each(fn)

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

Notes
-----

Passing in the second argument as a function to be evaluated later is a little
tough on the user interface. The solution may be to provide helpers or higher
levels of abstraction so that we don't have to mess with streams directly,
just create them from various other sources like text, lists, ajax requests,
generator functions, etc. and be able to pipe them together in a signal flow
style.

Another thing to explore is promises/deferreds and using those as our piping
interface.

The primary use case in my mind is something like:

>     +----------+                        +-----+                    +------+                   +--------+                        +------+
>     |FileReader| -> Character Stream -> |Lexer| -> Token Stream -> |Parser| -> Node Stream -> |Compiler| -> Character Stream -> |STDOUT|
>     +----------+                        +-----+                    +------+                   +--------+                        +------+
>          |                                 |                          |                           |
>          v                                 v                          v                           v                             +------+
>          +---------------------------------+--------------------------+---------------------------+------------------------- -> |STDERR|
>                                                                                                                                 +------+

Which could be connected something like:

>     reader
>     .out(lexer)
>     .out(parser)
>     .out(compiler)
>     .out(STDOUT)
>     .err(STDERR)

Resources
---------

http://mitpress.mit.edu/sicp/full-text/sicp/book/node70.html