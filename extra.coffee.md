Distributor
-----------

Distribute inputs among a set of outputs.

    distributor = (outputs...) ->
      n = 0
      (atom) ->
        outputs[n](atom)

        n = (n + 1) % outputs.length

>     #! pipe-run
>     "Hello".tap invoke("split", "") each distributor(STDOUT, NULL)

----

Promisory Pipe

    promisory = (output) ->
      (atom) ->
        atom.then output

Expanding a pipeline, don't even need to handle the atom functions at all here.

    getJSON = (output) ->
      map($.getJSON) promisory output

>     #! setup
>     require("/interactive_runtime")
