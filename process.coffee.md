Process
=======

A process receives data from input and writes data to output and optionally errput.

Just exploring some unix-y concepts in JS land.

    StringStreamer = (output, errput=output) ->

      (string) ->
        string.split('').map output

    Tokenizer = (output, errput=output) ->
      word = ""

      (character) ->
        if character.match /\s/
          if word
            output
              type: "word"
              value: word

            word = ""
        else
          word += character

    Object.extend exports,
      StringStreamer: StringStreamer
      Tokenizer: Tokenizer
