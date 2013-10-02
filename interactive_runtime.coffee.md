Interactive Runtime
-------------------

Register our interactive documentation runtime components.

These requires set up our interactive documentation environment.

    require("/environment_helpers")
    require("/streamatorium").pollute()
    {executeWithContext} = require("/util")

`pipe` examples provide the pipe functions and dislpay all atoms received into
`STDOUT` on the righthand side.

    Interactive.register "pipe", ({source, runtimeElement}) ->
      program = CoffeeScript.compile(source)

      outputElement = document.createElement "pre"
      runtimeElement.empty().append outputElement

      STDOUT = (atom) ->
        outputElement.textContent += "#{atom}\n"

      executeWithContext program,
        T: tee(STDOUT)
        STDOUT: STDOUT
        NULL: ->
