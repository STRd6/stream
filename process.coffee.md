Process
=======

A process receives data from input and writes data to output.

Just exploring some unix-y concepts in JS land.

    StringStreamer = (output) ->
      (string) ->
        string.split('').map output
        
    T = (output) ->
      (atom) ->
        console.log atom
        output atom

    Tokenizer = (output) ->
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
      T: T

Example:
--------

>     pipeline = StringStreamer Tokenizer output
>
>     pipeline """
>       this is pretty cool\n
>     """
