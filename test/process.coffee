{StringStreamer, Tokenizer, T} = require('/process')

describe "StringStreamer", ->
  it "should convert strings into streams of characters", ->
    chars = []

    output = (c) ->
      assert.equal c, "a"
      chars.push c

    (StringStreamer output) "aaaaaaa"
    
    assert.equal chars.length, 7

describe "Process streams", ->
  
  it "Should output a stream of tokens", ->
    tokens = []

    output = (token) ->
      tokens.push token

    pipeline = StringStreamer Tokenizer output

    pipeline """
      this is pretty cool\n
    """

    assert.equal tokens.length, 4, "Tokens: #{tokens.length}"
