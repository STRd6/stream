Notes
=====

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
