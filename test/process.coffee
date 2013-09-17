{StringStreamer, Tokenizer} = require('/process')

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

    (StringStreamer Tokenizer output) """
      this is pretty cool\n
    """
    
    console.log tokens
    
    assert.equal tokens.length, 4, "Tokens: #{tokens.length}"
