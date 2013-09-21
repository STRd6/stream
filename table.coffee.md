Streamatorium
=============

Just doodling...

Introduction
------------

Streams are a pretty cool guy.

Atoms are any object.

> Example atoms
>     0, 1, "", true, false, "heyyy", 954, {}, {name: "flambo"}, [{...}, ...]

A sink is a function that accepts an atom.

>     NULL = (atom) ->
>     STDOUT = (atom) -> 
>       console.log atom

A source is a function that takes a sink as an argument.

>     source = (sink) ->
>       ...

A pipe is a function that takes a sink and returns a sink.

>     identity = (sink) ->
>       (atom) ->
>         sink atom
>     
>     # Almost equivalently:
>     identity = (sink) ->
>       sink

A pipeline connect sources to sinks through pipes.

>     source pipe0 pipe1 pipe2 sink

This works due to function composition: 

>     source(pipe0(pipe1(pipe2(sink))))

A pipe generator is a function that returns a pipe.

>     tee = (sink) ->     # Generator
>       (output) ->       # Pipe
>         (atom) ->       # Sink
>           sink atom
>           output atom

Sinks
-----

Two sinks.

    STDOUT = (atom) -> console.log atom
    NULL = ->
    
Pipes
-----

Pass items through to output unchanged. More useful as a demonstration than
an actual pipe.

    identity = (output) ->
      (atom) ->
        output atom

Output atoms async instead of immediately.

    defer = (output) ->
      (atom) ->
        output.defer atom

Get JSON data from a url then pass it to output

    DataSource = (output) ->
      (url) ->
        $.getJSON(url).then output

Splatter splats arrays into individual items. Non-arrays are passed through as is.

    Splatter = (output) ->
      (arrayOrItem) ->
        [].concat(arrayOrItem).each (item) ->
          output item

Splitter is a generalized T. When contsructed with a list of functions it returns
a function that when called with any argument passes it's argument to to each
of its output functions.

    Splitter = (outputs...) ->
      (atom) ->
        outputs.forEach (output) ->
          output atom

Pipe Generators
---------------

Similar to unix tee, splits a stream

    tee = (sink) ->
      (output) ->
        Splitter sink, output

`T` is a pipe that will mirror its atoms to the console. It is useful for
inspecting the flow at any point in the pipeline.

    T = tee(STDOUT)

>     source T pipe0 T pipe1 STDOUT

Maps
-------------

Generate a pipe that transforms atoms.

    map = (fn) ->
      (output) ->
        (atom) ->
          output fn(atom)

Filters
----------------

Generate a pipe that only allows certain atoms to pass through.

    filter = (fn) ->
      (output) ->
        (atom) ->
          output atom if fn(atom)

Filter out `null` and `undefined`

    soak = filter (atom) -> atom?

Stateful Pipes
--------------

    toggle = (output) ->
      value = true
      (atom) ->
        output value
        value = !value

Clocks
------

Emit an atom periodically

    clock = (t) ->
      (output) ->
        setInterval ->
          output 1
        , t * 1000

Gates
-----

Attempting to make a buffer that collects input and releases them based on a
control/signal input. Currently really crude.

    gate = (ctrl) ->
      (output) ->
        buffer = []

        ctrl ->
          output buffer.shift()

        (atom) ->
          buffer.push atom

Examples
-------

JSON to Template

    jsonExample = ->
      rows = Observable([])
      headers = Observable([])
  
      rows.observe (newRows) ->
        if firstRow = newRows.first()
          headers Object.keys firstRow
  
      template = require('./templates/table')(
        rows: rows
        headers: headers
      )
  
      pipeline = T DataSource T rows
      pipeline("https://api.github.com/repositories")
      $("body").append(template)

    clockExample = ->
      clock(1) STDOUT

    gateExample = ->
      25.times gate(clock(0.25)) soak defer T NULL

    filterExample = ->
      even = (x) -> x % 2 is 0

      100.times filter(even) STDOUT

    toggleExample = ->
      10.times toggle STDOUT

    gateExample()

Notes
-----

Apparently there is some mad currying going on.

When nesting the functions avoid leaky closures:

    # GOOD, can reuse the "same" gate in multiple streams no problem
    gate = (ctrl) ->
      (output) ->
        buffer = []

        ctrl ->
          output buffer.shift()

        (atom) ->
          buffer.push atom
    
    # BAD, gate will get weird if used in multiple streams
    gate = (ctrl) ->
      buffer = []
      
      (output) ->
        ctrl ->
          output buffer.shift()

        (atom) ->
          buffer.push atom