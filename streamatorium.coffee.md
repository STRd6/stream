Streamatorium
=============

Introduction
------------

The Streamatorium is an experiment in applying functional programming and Unix
principles to the web.

Processes may look something like these:

Print out even numbers to the console.

>     100.times filter(even) STDOUT

Get popular repos from a json data source and display them one at a time to the
console.

>     popular = (repo) -> repo.watchers > 100
>
>     json("https://api.github.com/repos/") each filter(popular) STDOUT


Atoms are any object. Atoms form streams by flowing through pipes. Atoms
originate in sources and end up in sinks.

Example atoms:

>     0, 1, "", true, false, "heyyy", 954, 
>     {}, {name: "flambo"}, [{...}, ...]

Sinks
-----

A sink is a function that accepts an atom.

`STDOUT` logs any atom to the console

    STDOUT = (atom) -> 
      console.log atom

The `NULL` sink eats any atom passed to it and does nothing

    NULL = (atom) ->

A source is a function that takes a sink as an argument.

>     source = (sink) ->
>       ...

Pipes
-----

A pipe is a function that takes a sink and returns a sink. A pipe is both a
source and a sink.

A pipeline connects sources to sinks through pipes.

>     source pipe0 pipe1 pipe2 sink

This works due to function composition:

>     source(pipe0(pipe1(pipe2(sink))))

Pass items through to output unchanged. More useful as a demonstration than
an actual pipe.

    identity = (output) ->
      (atom) ->
        output atom

>     #! pipe
>     countTo(10) identity STDOUT

----

Output atoms asynchrounously instead of immediately.

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

Get JSON data from input urls then pass it along.

    getJSON = (output) ->
      (url) ->
        $.getJSON(url).then output

`split` is a generalized T. When contsructed with a list of sinks it returns
a sink that outputs to all of the sinks it was constructed with.

    split = (outputs...) ->
      (atom) ->
        outputs.forEach (output) ->
          output atom

Pipe Generators
---------------

A pipe generator is a function that returns a pipe.

Similar to unix tee, splits a stream.

    tee = (sink) ->
      (output) ->
        split sink, output

Example of `tee` implemented wthout `split`

>     tee = (sink) ->     # Generator
>       (output) ->       # Pipe
>         (atom) ->       # Sink
>           sink atom
>           output atom

`T` is a pipe that will mirror its atoms to the console. It is useful for
inspecting the flow at any point in the pipeline.

    T = tee(STDOUT)

>     source T pipe0 T pipe1 STDOUT

Maps
----

Generate a pipe that transforms atoms by applying the given transformation
function to each atom as it passes through.

    map = (fn) ->
      (output) ->
        (atom) ->
          output fn(atom)

    characterSplitter = map (string) ->
      string.split('')

Filters
-------

Generate a pipe that only allows certain atoms to pass through. `filter` applies
the given indicator function and only passes through atoms for which it returns
true.

    filter = (fn) ->
      (output) ->
        (atom) ->
          output atom if fn(atom)

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

Count number of atoms that flowed through, outputting the total count each time
and atom is received.

    counter = (output) ->
      value = 0
      (atom) ->
        output value += 1

Sum the atoms that flow through and output the current total each time an atom
is received.

    accumulator = (output) ->
      value = 0
      (atom) ->
        output value += atom

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

Connect the "end" of one pipeline to the begining of a new one.

TODO: Explore this further, currently seems like a pain to hold a reference
to a sink and carry it over as a source. Maybe if the constructor took names
to refer to connectors so we could use them without carrying the instances
ourselves, ex:
>     source pipe0 pipe1 TO("A")
>     FROM("A") pipe2 pipe3 STDOUT

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

Clocks
------

Emit an atom periodically. The `clock` constructor returns a source.

    clock = (t) ->
      (output) ->
        setInterval ->
          output 1
        , t * 1000

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

Maintain most recent value and emit it on CTRL.

    latch = (ctrl) ->
      (output) ->
        value = undefined

        ctrl ->
          output value

        (atom) ->
          value = atom

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

      pipeline = T getJSON T rows
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

    tokenizerExample = ->
       (characterSplitter each tokenizer STDOUT)("a sentence of words\n")

    tokenizerExample()
    
    module.exports = Streamatorium =
      each: each
      identity: identity

      pollute: ->
        Object.keys(Streamatorium).forEach (name) ->
          unless name is "pollute"
            global[name] = Streamatorium[name]

      tee: tee

      T: T

Live Examples
-------------

`pipe` examples provide the pipe functions and dislpay all atoms received in
STDOUT on the righthand side.

>     #! setup
>     require("/interactive_runtime")
