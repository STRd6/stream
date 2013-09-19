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
      Splitter output, (x) -> console.log(x)

Example
-------

    rows = Observable([])
    headers = Observable([])

    rows.observe (newRows) ->
      return if headers().length

      if firstRow = newRows.first()
        headers Object.keys firstRow

    pipeline = DataSource Splatter Splitter(rows.push, STDOUT)

    pipeline("https://api.github.com/repositories")

    template = require('./templates/table')(
      rows: rows
      headers: headers
    )

TODO: This example currently executes when this file is included, so watch out!

    $("body").append(template)
