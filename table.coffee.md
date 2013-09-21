Table
=====

A table holds a list of JSON objects that have been hydrated with observable
properties.

Just doodling...

Splitter is a generalized T. When contsructed with a list of functions it returns
a function that when called with any argument passes it's argument to to each
of its output functions.

    Splitter = (outputs...) ->
      (atom) ->
        outputs.forEach (output) ->
          output atom

Splatter splats arrays into individual items. Non-arrays are passed through as is.

    Splatter = (output) ->
      (arrayOrItem) ->
        [].concat(arrayOrItem).each (item) ->
          output.defer item

Get JSON data from a url then pass it to output

    DataSource = (output) ->
      (url) ->
        $.getJSON(url).then output

    STDOUT = (atom) -> console.log atom
    NULL = ->

    T = (output) ->
      tee(STDOUT)(output)

Similar to unix tee, splits a stream

    tee = (stream) ->
      (output) ->
        Splitter output, stream

Emit an atom periodically

    clock = (t) ->
      (output) ->
        setInterval ->
          output 1
        , t * 1000

Attempting to make a buffer that collects input and releases them based on a
control/signal input. Currently really crude.

    gate = ->
      buffer = []
      out = null

      fn = (output) ->
        out = output

        (atom) ->
          buffer.push atom

      fn.CTRL = ->
        out buffer.shift()

      fn

    soak = (output) ->
      (atom) ->
        output atom if atom?

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
      numberGate = gate()

      clock(0.25) numberGate.CTRL

      25.times numberGate soak STDOUT

    gateExample()
