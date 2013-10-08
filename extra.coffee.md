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

>     #! setup
>     require("/interactive_runtime")
