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

`pipe-run` examples are almost the same as `pipe` examples, but provide a
button to run rather than auto-running.

    Interactive.register "pipe-run", ({source, runtimeElement}) ->
      # HACK: using the element to hold our state
      runtimeElement.program = CoffeeScript.compile(source)

      # Init
      if runtimeElement.is(":empty")
        runButton = $ "<button>",
          text: "Run"
          css:
            position: "absolute"
            marginTop: "-2.5em"
            marginLeft: "-1.5em"
          click: ->
            outputElement.textContent = ""

            executeProgram runtimeElement.program, outputElement

        outputElement = document.createElement "pre"

        runtimeElement
          .append(runButton)
          .append(outputElement)

Helpers
-------

Execute a program attaching it's output to the output element.

    executeProgram = (program, outputElement) ->    
      STDOUT = (atom) ->
        outputElement.textContent += "#{atom}\n"

      executeWithContext program,
        T: tee(STDOUT)
        STDOUT: STDOUT
        NULL: ->
