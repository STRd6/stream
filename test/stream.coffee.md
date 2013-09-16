    Stream = require('/stream')

    describe "Stream", ->
      it "should be like a list", ->
        stream = Stream(1)
        
        assert.equal 1, stream.first()
