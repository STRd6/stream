    Stream = require('/main')

    describe "Stream", ->
      it "should be like a list", ->
        stream = Stream(1)
        
        assert.equal 1, stream.first()

      it "should be able to have a couple items", ->
      
        stream = Stream(0, ->Stream(1))
        
        assert.equal 0, stream.get(0), "First item is 0"
        assert.equal 1, stream.get(1), "Second item is 1"

      it "should be able to map", ->
        stream = Stream(0, ->Stream(1, ->Stream(2))).map (i) -> i * i
        
        assert.equal 4, stream.get(2)
