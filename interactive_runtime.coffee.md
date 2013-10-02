Interactive Runtime
-------------------

Register our interactive documentation runtime components.

    require("/environment_helpers")
    require("/streamatorium").pollute()
    {executeWithContext} = require("/util")

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
