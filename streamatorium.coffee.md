Streamatorium
=============

Introduction
------------

The Streamatorium is an experiment in applying functional programming and Unix
principles to the web.

Stream processes look like this:

>     #! pipe
>     # Print out 10 numbers to the console
>     [0..9].map STDOUT

----

On the left is a source, on the right is a sink. Any number of pipes may
connect them.

----

Get popular repos from a json data source and display them one at a time to the
console.

>     popular = (repo) -> repo.watchers > 100
>
>     "https://api.github.com/repositories".tap getJSON each limit(10) pluck("url") getJSON filter(popular) pluck("name") STDOUT

Atoms are any object. Atoms form streams by flowing through pipes. Atoms
originate in sources and end up in sinks.

Example atoms:

>     0, 1, "", true, false, "heyyy", 954,
>     {}, {name: "flambo"}, [{...}, ...]

Sinks
-----

A sink is a function that accepts an atom.

----

`STDOUT` logs any atom to the console

    STDOUT = (atom) ->
      console.log atom

The `NULL` sink eats any atom passed to it and does nothing

    NULL = (atom) ->

Sources
-------

A source is a function that takes a sink as an argument.

>     source = (sink) ->
>       ...

We have added a utility method `tap` to turn any object into a source.

>     #! pipe
>     "Hello World".tap STDOUT

----

This is simply a convenience to keep the source on the left rather than:

>     (STDOUT) "Hello World"

With just a sink it doesn't seem to save much, but compare to a lager pipeline:

>     (T invoke("split", "") STDOUT) "Hello World"

----

Any array can become a source using the existing `map` or `forEach` methods.

>     #! pipe
>     [1, 2, 3].map STDOUT
>     [4, 5, 6].forEach STDOUT

----

Pipes
-----

A pipe is a function that takes a sink and returns a sink. A pipe is both a
source and a sink.

A pipeline connects sources to sinks through pipes.

>     source pipe0 pipe1 pipe2 sink

This works due to function composition:

>     source(pipe0(pipe1(pipe2(sink))))

----

`identity` passes items through to the output unchanged. It is more useful as a
demonstration than as a practical pipe.

    identity = (output) ->
      (atom) ->
        output atom

>     #! pipe
>     [0..9].map identity STDOUT

----

`defer` outputs atoms asynchrounously instead of immediately.

    defer = (output) ->
      (atom) ->
        setTimeout output, 0, atom

`each` splats arrays into individual items. Non-arrays are passed through as is.

    each = (output) ->
      (arrayOrItem) ->
        [].concat(arrayOrItem).forEach (item) ->
          output item

>     #! pipe
>     [1, 2, 3, 4, 5].tap T each STDOUT

----

`prettyPrint` prettily prints an object as JSON.

    prettyPrint = (output) ->
      (atom) ->
        output JSON.stringify(atom, null, 2)

----

Get JSON data from input urls then pass it along.

    getJSON = (output) ->
      (url) ->
        $.getJSON(url).then output

>     #! pipe
>     "https://api.github.com/users/STRd6".tap getJSON prettyPrint STDOUT

----

Splitters
---------

`split` is a generalized T. When contsructed with a list of sinks it returns
a sink that outputs to all of the sinks it was constructed with.

    split = (outputs...) ->
      (atom) ->
        outputs.forEach (output) ->
          output atom

`tee`, similar to unix tee, splits a stream so that each atom flows to two
sinks.

    tee = (sink) ->
      (output) ->
        split sink, output

`T` is a pipe that will mirror its atoms to the console. It is useful for
inspecting the flow at any point in the pipeline.

    T = tee(STDOUT)

>     source T pipe0 T pipe1 STDOUT

Pipe Generators
---------------

A pipe generator is a function that returns a pipe. The splitters above are one
kind of pipe generator.

Example of `tee` implemented wthout `split` and annotated to show each part.

>     tee = (sink) ->     # Generator
>       (output) ->       # Pipe
>         (atom) ->       # Sink
>           sink atom
>           output atom



Maps
----

Generate a pipe that transforms atoms by applying the given transformation
function to each atom as it passes through.

    map = (fn) ->
      (output) ->
        (atom) ->
          output fn(atom)

>     #! pipe
>     square = (x) -> x * x
>
>     [1..10].map map(square) STDOUT

----

`pluck` selects an attribute from an atom and passes that attribute on.

    pluck = (name) ->
      map (atom) -> atom[name]

>     #! pipe
>     {name: "Duder"}.tap pluck("name") STDOUT

----

`invoke` generates a pipe that invokes the named function with the given
arguments on each item passing through then passes the result on to the sink it
is connected to.

    invoke = (name, args...) ->
      map (atom) -> atom[name](args...)

>     #! pipe
>     "Welcome to the Streamatorium".tap invoke("split", "") T each STDOUT

----

Filters
-------

Generate a pipe that only allows certain atoms to pass through. `filter` applies
the given indicator function and only passes through atoms for which it returns
true.

    filter = (fn) ->
      (output) ->
        (atom) ->
          output atom if fn(atom)

>     #! pipe
>     even = (x) -> x % 2 is 0
>
>     [0..25].map filter(even) STDOUT

----

The `soak` pipe filters out `null` and `undefined` atoms.

    soak = filter (atom) -> atom?


Stateful Pipes
--------------

`toggle` is a switch. Whenever it receives an input it will ouput either true or
false and switch its state to output the opposite value the next input it
receives. It doesn't matter what atom it receives.

    toggle = (output) ->
      value = true
      (atom) ->
        output value
        value = !value

>     #! pipe
>     [0..9].map toggle STDOUT

----

Count number of atoms that flowed through, outputting the total count each time
and atom is received.

    counter = (output) ->
      value = 0
      (atom) ->
        output value += 1

>     #! pipe
>     [1, 1, 1, 1, 1].map counter STDOUT

----

Sum the atoms that flow through and output the current total each time an atom
is received.

    accumulator = (output) ->
      value = 0
      (atom) ->
        output value += atom

>     #! pipe
>     [0..9].map accumulator STDOUT

----

Aggregate a stream of individual characters separated by whitespace into a stream
of word strings.

    tokenizer = (output) ->
      word = ""

      (character) ->
        if character.match /\s/
          if word
            output word

            word = ""
        else
          word += character

----

Limit the number of items that can flow through, silently discarding any beyond
the limit.

    limit = (n) ->
      (output) ->
        count = 0
        (atom) ->
          output(atom) if count < n
          count += 1

Connectors
----------

Connect the "end" of one pipeline to the begining of a new one.

TODO: Allow connectors to be created in any order.
TODO: Allow many to many connectors.

    connector = ->
      atoms = []
      output = null

      flush = ->
        if output
          while atoms.length
            output atoms.shift()

      collector = (atom) ->
        atoms.push atom

        flush()

      collector.source = (sink) ->
        output = sink

        flush()

      return collector

    connectors = {}
    TO = (id) ->
      connectors[id] = connector()

    FROM = (id) ->
      connectors[id].source

>     #! pipe
>     [0..9].map TO("A")
>     FROM("A") STDOUT

----

Clocks
------

Emit an atom periodically. The `clock` constructor returns a source.

    clock = (t) ->
      (output) ->
        setInterval ->
          output 1
        , t * 1000

>     #! pipe
>     clock(4) STDOUT

----

Controls
--------

TODO: Transistors and stuff.

Gates
-----

Attempt at a buffer that collects input and releases them based on a
control/signal input.

`ctrl` is a source

    gate = (ctrl) ->
      (output) ->
        buffer = []

        ctrl ->
          output buffer.shift()

        (atom) ->
          buffer.push atom

>     #! pipe
>     [0..25].map gate(clock(2)) STDOUT

Maintain most recent value and emit it on CTRL.

    latch = (ctrl) ->
      (output) ->
        value = undefined

        ctrl ->
          output value

        (atom) ->
          value = atom

Export
------

    module.exports = Streamatorium =
      accumulator: accumulator
      clock: clock
      counter: counter
      each: each
      filter: filter
      FROM: FROM
      gate: gate
      getJSON: getJSON
      identity: identity
      invoke: invoke
      limit: limit
      map: map
      pluck: pluck
      pollute: ->
        Object.keys(Streamatorium).forEach (name) ->
          unless name is "pollute"
            global[name] = Streamatorium[name]
      prettyPrint: prettyPrint
      soak: soak
      tee: tee
      TO: TO
      toggle: toggle

Live Examples
-------------

>     #! setup
>     require("/interactive_runtime")
