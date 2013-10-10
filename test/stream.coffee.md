    require("../streamatorium").pollute()
    require("../environment_helpers")

    describe "stream", ->
      it "should map", ->
        3.tap map((x) -> 2 * x) (x) -> assert.equal x, 6

      it "should filter", ->
        even = (n) -> n % 2 is 0

        results = []
        push = (item) -> results.push item

        [1, 2, 3, 4, 5].forEach filter(even) push

        assert.equal results.length, 2

      it "should limit", ->
        results = []
        push = (item) -> results.push item

        [0..99].forEach limit(5) push

        assert.equal results.length, 5
