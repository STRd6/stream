Utility Functions
-----------------

    module.exports =

Evaluate a program with a given environment object.

The values of the environment are mapped to local variables with names equal to
the keys.

The given program is then run with that environment and optionally a context for
`this`.

      executeWithContext: (program, environment, context) ->
        args = Object.keys(environment)

        values = args.map (name) ->
          environment[name]

        Function(args..., program).apply(context, values)
