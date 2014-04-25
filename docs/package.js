(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2013 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "stream\n======\n\nLearning about streams\n",
      "mode": "100644",
      "type": "blob"
    },
    "environment_helpers.coffee.md": {
      "path": "environment_helpers.coffee.md",
      "content": "Environment Helpers\n-------------------\n\nSome helpers that we add to the global environment so we can use our streams to\ntheir fullest.\n\nAdding `Object#tap` so it's easier to put any object into the beginnig of a\nstream.\n\n    unless Object.prototype.tap\n      Object.defineProperty Object.prototype, \"tap\",\n        enumerable: false\n        configurable: false\n        writable: false\n        value: (fn) ->\n          fn(this)\n\n          return this\n",
      "mode": "100644",
      "type": "blob"
    },
    "extra.coffee.md": {
      "path": "extra.coffee.md",
      "content": "Distributor\n-----------\n\nDistribute inputs among a set of outputs.\n\n    distributor = (outputs...) ->\n      n = 0\n      (atom) ->\n        outputs[n](atom)\n\n        n = (n + 1) % outputs.length\n\n>     #! pipe-run\n>     \"Hello\".tap invoke(\"split\", \"\") each distributor(STDOUT, NULL)\n\n----\n\nRandom\n------\n\nTODO: Hook up to a clock?\n\n    rand = (n) ->\n      (output) ->\n        output(Math.floor Math.random() * n)\n\n>     #! pipe-run\n>     rand(10) STDOUT\n\n----\n\nPromisory Pipe\n\n    promisory = (output) ->\n      (atom) ->\n        atom.then output\n\nExpanding a pipeline, don't even need to handle the atom functions at all here.\n\n    getJSON = (output) ->\n      map($.getJSON) promisory output\n\n>     #! setup\n>     require(\"/interactive_runtime\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "interactive_runtime.coffee.md": {
      "path": "interactive_runtime.coffee.md",
      "content": "Interactive Runtime\n-------------------\n\nRegister our interactive documentation runtime components.\n\nThese requires set up our interactive documentation environment.\n\n    require(\"/environment_helpers\")\n    require(\"/streamatorium\").pollute()\n    {executeWithContext} = require(\"/util\")\n\n`pipe` examples provide the pipe functions and dislpay all atoms received into\n`STDOUT` on the righthand side.\n\n    Interactive.register \"pipe\", ({source, runtimeElement}) ->\n      program = CoffeeScript.compile(source)\n\n      outputElement = document.createElement \"pre\"\n      runtimeElement.empty().append outputElement\n\n      STDOUT = (atom) ->\n        outputElement.textContent += \"#{atom}\\n\"\n\n      executeWithContext program,\n        T: tee(STDOUT)\n        STDOUT: STDOUT\n        NULL: ->\n\n`pipe-run` examples are almost the same as `pipe` examples, but provide a\nbutton to run rather than auto-running.\n\n    Interactive.register \"pipe-run\", ({source, runtimeElement}) ->\n      # HACK: using the element to hold our state\n      runtimeElement.program = CoffeeScript.compile(source)\n\n      # Init\n      if runtimeElement.is(\":empty\")\n        runButton = $ \"<button>\",\n          text: \"Run\"\n          css:\n            position: \"absolute\"\n            marginTop: \"-2.5em\"\n            marginLeft: \"-1.5em\"\n          click: ->\n            outputElement.textContent = \"\"\n\n            executeProgram runtimeElement.program, outputElement\n\n        outputElement = document.createElement \"pre\"\n\n        runtimeElement\n          .append(runButton)\n          .append(outputElement)\n\nHelpers\n-------\n\nExecute a program attaching it's output to the output element.\n\n    executeProgram = (program, outputElement) ->\n      STDOUT = (atom) ->\n        outputElement.textContent += \"#{atom}\\n\"\n\n      executeWithContext program,\n        T: tee(STDOUT)\n        STDOUT: STDOUT\n        NULL: ->\n",
      "mode": "100644",
      "type": "blob"
    },
    "notes.coffee.md": {
      "path": "notes.coffee.md",
      "content": "Notes\n=====\n\nWhen nesting the functions avoid leaky closures:\n\n    # GOOD, can reuse the \"same\" gate in multiple streams no problem\n    gate = (ctrl) ->\n      (output) ->\n        buffer = []\n\n        ctrl ->\n          output buffer.shift()\n\n        (atom) ->\n          buffer.push atom\n\n    # BAD, gate will get weird if used in multiple streams\n    gate = (ctrl) ->\n      buffer = []\n\n      (output) ->\n        ctrl ->\n          output buffer.shift()\n\n        (atom) ->\n          buffer.push atom\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "entryPoint: \"streamatorium\"\nversion: \"0.1.0\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "sicp_stream.coffee.md": {
      "path": "sicp_stream.coffee.md",
      "content": "Stream\n======\n\nHere I will learn about streams using interactive models.\n\nConstruct a stream\n\n    Stream = (first, rest=->emptyStream) ->\n      self =\n        first: ->\n          first\n        rest: rest\n\nGet an element from a stream at position `n`\n\n        get: (n) ->\n          if n is 0\n            self.first()\n          else\n            rest().get(n - 1)\n\nInvoke a function for each item in a stream.\n\n        each: (fn) ->\n          fn(self.first())\n          rest().each(fn)\n\n          self\n\nTransform a stream\n\n        map: (fn) ->\n          Stream(\n            fn(self.first()),\n            -> rest().map(fn)\n          )\n\nA distinguishable object representing the empty stream.\n\n    emptyStream =\n      map: ->\n        emptyStream\n      each: ->\n        emptyStream\n      get: ->\n\nExport\n\n    module.exports = Stream\n\nNotes\n-----\n\nPassing in the second argument as a function to be evaluated later is a little\ntough on the user interface. The solution may be to provide helpers or higher\nlevels of abstraction so that we don't have to mess with streams directly,\njust create them from various other sources like text, lists, ajax requests,\ngenerator functions, etc. and be able to pipe them together in a signal flow\nstyle.\n\nAnother thing to explore is promises/deferreds and using those as our piping\ninterface.\n\nThe primary use case in my mind is something like:\n\n>\n>     +----------+                        +-----+                    +------+                   +--------+                        +------+\n>     |FileReader| -> Character Stream -> |Lexer| -> Token Stream -> |Parser| -> Node Stream -> |Compiler| -> Character Stream -> |STDOUT|\n>     +----------+                        +-----+                    +------+                   +--------+                        +------+\n>          |                                 |                          |                           |\n>          v                                 v                          v                           v                             +------+\n>          +---------------------------------+--------------------------+---------------------------+------------------------- -> |STDERR|\n>                                                                                                                                 +------+\n\nWhich could be connected something like:\n\n>     errors STDERR\n>\n>     reader lexer parser compiler STDOUT\n\nResources\n---------\n\nhttp://mitpress.mit.edu/sicp/full-text/sicp/book/node70.html\n",
      "mode": "100644",
      "type": "blob"
    },
    "streamatorium.coffee.md": {
      "path": "streamatorium.coffee.md",
      "content": "Streamatorium\n=============\n\nIntroduction\n------------\n\nThe Streamatorium is an experiment in applying functional programming and Unix\nprinciples to the web.\n\nStream processes look like this:\n\n>     #! pipe\n>     # Print out 10 numbers to the console\n>     [0..9].map STDOUT\n\n----\n\nOn the left is a source, on the right is a sink. Any number of pipes may\nconnect them.\n\n----\n\nGet popular repos from a json data source and display them one at a time to the\nconsole.\n\n>     popular = (repo) -> repo.watchers > 100\n>\n>     \"https://api.github.com/repositories\".tap getJSON each limit(10) pluck(\"url\") getJSON filter(popular) pluck(\"name\") STDOUT\n\nAtoms are any object. Atoms form streams by flowing through pipes. Atoms\noriginate in sources and end up in sinks.\n\nExample atoms:\n\n>     0, 1, \"\", true, false, \"heyyy\", 954,\n>     {}, {name: \"flambo\"}, [{...}, ...]\n\nSinks\n-----\n\nA sink is a function that accepts an atom.\n\n----\n\n`STDOUT` logs any atom to the console\n\n    STDOUT = (atom) ->\n      console.log atom\n\nThe `NULL` sink eats any atom passed to it and does nothing\n\n    NULL = (atom) ->\n\nSources\n-------\n\nA source is a function that takes a sink as an argument.\n\n>     source = (sink) ->\n>       ...\n\nWe have added a utility method `tap` to turn any object into a source.\n\n>     #! pipe\n>     \"Hello World\".tap STDOUT\n\n----\n\nThis is simply a convenience to keep the source on the left rather than:\n\n>     (STDOUT) \"Hello World\"\n\nWith just a sink it doesn't seem to save much, but compare to a lager pipeline:\n\n>     (T invoke(\"split\", \"\") STDOUT) \"Hello World\"\n\n----\n\nAny array can become a source using the existing `map` or `forEach` methods.\n\n>     #! pipe\n>     [1, 2, 3].map STDOUT\n>     [4, 5, 6].forEach STDOUT\n\n----\n\nPipes\n-----\n\nA pipe is a function that takes a sink and returns a sink. A pipe is both a\nsource and a sink.\n\nA pipeline connects sources to sinks through pipes.\n\n>     source pipe0 pipe1 pipe2 sink\n\nThis works due to function composition:\n\n>     source(pipe0(pipe1(pipe2(sink))))\n\n----\n\n`identity` passes items through to the output unchanged. It is more useful as a\ndemonstration than as a practical pipe.\n\n    identity = (output) ->\n      (atom) ->\n        output atom\n\n>     #! pipe\n>     [0..9].map identity STDOUT\n\n----\n\n`defer` outputs atoms asynchrounously instead of immediately.\n\n    defer = (output) ->\n      (atom) ->\n        setTimeout output, 0, atom\n\n`each` splats arrays into individual items. Non-arrays are passed through as is.\n\n    each = (output) ->\n      (arrayOrItem) ->\n        [].concat(arrayOrItem).forEach (item) ->\n          output item\n\n>     #! pipe\n>     [1, 2, 3, 4, 5].tap T each STDOUT\n\n----\n\n`prettyPrint` prettily prints an object as JSON.\n\n    prettyPrint = (output) ->\n      (atom) ->\n        output JSON.stringify(atom, null, 2)\n\n----\n\nGet JSON data from input urls then pass it along.\n\n    getJSON = (output) ->\n      (url) ->\n        $.getJSON(url).then output\n\n>     #! pipe\n>     \"https://api.github.com/users/STRd6\".tap getJSON prettyPrint STDOUT\n\n----\n\nSplitters\n---------\n\n`split` is a generalized T. When contsructed with a list of sinks it returns\na sink that outputs to all of the sinks it was constructed with.\n\n    split = (outputs...) ->\n      (atom) ->\n        outputs.forEach (output) ->\n          output atom\n\n`tee`, similar to unix tee, splits a stream so that each atom flows to two\nsinks.\n\n    tee = (sink) ->\n      (output) ->\n        split sink, output\n\n`T` is a pipe that will mirror its atoms to the console. It is useful for\ninspecting the flow at any point in the pipeline.\n\n    T = tee(STDOUT)\n\n>     source T pipe0 T pipe1 STDOUT\n\nPipe Generators\n---------------\n\nA pipe generator is a function that returns a pipe. The splitters above are one\nkind of pipe generator.\n\nExample of `tee` implemented wthout `split` and annotated to show each part.\n\n>     tee = (sink) ->     # Generator\n>       (output) ->       # Pipe\n>         (atom) ->       # Sink\n>           sink atom\n>           output atom\n\n\n\nMaps\n----\n\nGenerate a pipe that transforms atoms by applying the given transformation\nfunction to each atom as it passes through.\n\n    map = (fn) ->\n      (output) ->\n        (atom) ->\n          output fn(atom)\n\n>     #! pipe\n>     square = (x) -> x * x\n>\n>     [1..10].map map(square) STDOUT\n\n----\n\n`pluck` selects an attribute from an atom and passes that attribute on.\n\n    pluck = (name) ->\n      map (atom) -> atom[name]\n\n>     #! pipe\n>     {name: \"Duder\"}.tap pluck(\"name\") STDOUT\n\n----\n\n`invoke` generates a pipe that invokes the named function with the given\narguments on each item passing through then passes the result on to the sink it\nis connected to.\n\n    invoke = (name, args...) ->\n      map (atom) -> atom[name](args...)\n\n>     #! pipe\n>     \"Welcome to the Streamatorium\".tap invoke(\"split\", \"\") T each STDOUT\n\n----\n\nFilters\n-------\n\nGenerate a pipe that only allows certain atoms to pass through. `filter` applies\nthe given indicator function and only passes through atoms for which it returns\ntrue.\n\n    filter = (fn) ->\n      (output) ->\n        (atom) ->\n          output atom if fn(atom)\n\n>     #! pipe\n>     even = (x) -> x % 2 is 0\n>\n>     [0..25].map filter(even) STDOUT\n\n----\n\nThe `soak` pipe filters out `null` and `undefined` atoms.\n\n    soak = filter (atom) -> atom?\n\n\nStateful Pipes\n--------------\n\n`toggle` is a switch. Whenever it receives an input it will ouput either true or\nfalse and switch its state to output the opposite value the next input it\nreceives. It doesn't matter what atom it receives.\n\n    toggle = (output) ->\n      value = true\n      (atom) ->\n        output value\n        value = !value\n\n>     #! pipe\n>     [0..9].map toggle STDOUT\n\n----\n\nA counter acts like a pedometer, counting each atom that flows through. It\noutputs the total count anytime an atom is received. It can count anything.\n\n    counter = (output) ->\n      value = 0\n      (atom) ->\n        output value += 1\n\n>     #! pipe\n>     [1, {}, 'a', [4], 0].map counter STDOUT\n\n----\n\nAn accumulator sums the atoms that flow through and outputs the current total \neach time an atom is received.\n\nThis example sums the odd numbers to produce a list of squares.\n\n    accumulator = (output) ->\n      value = 0\n      (atom) ->\n        output value += atom\n\n>     #! pipe\n>     odd = (x) -> x % 2\n>\n>     [1..20].map filter(odd) accumulator STDOUT\n\n----\n\nAggregate a stream of individual characters separated by whitespace into a stream\nof word strings.\n\n    tokenizer = (output) ->\n      word = \"\"\n\n      (character) ->\n        if character.match /\\s/\n          if word\n            output word\n\n            word = \"\"\n        else\n          word += character\n\n----\n\nLimit the number of items that can flow through, silently discarding any beyond\nthe limit.\n\n    limit = (n) ->\n      (output) ->\n        count = 0\n        (atom) ->\n          output(atom) if count < n\n          count += 1\n\nConnectors\n----------\n\nConnect the \"end\" of one pipeline to the begining of a new one.\n\nTODO: Allow connectors to be created in any order.\nTODO: Allow many to many connectors.\n\n    connector = ->\n      atoms = []\n      output = null\n\n      flush = ->\n        if output\n          while atoms.length\n            output atoms.shift()\n\n      collector = (atom) ->\n        atoms.push atom\n\n        flush()\n\n      collector.source = (sink) ->\n        output = sink\n\n        flush()\n\n      return collector\n\n    connectors = {}\n    TO = (id) ->\n      connectors[id] = connector()\n\n    FROM = (id) ->\n      connectors[id].source\n\n>     #! pipe\n>     [0..9].map TO(\"A\")\n>     FROM(\"A\") STDOUT\n\n----\n\nClocks\n------\n\nEmit an atom periodically. The `clock` constructor returns a source.\n\n    clock = (t) ->\n      (output) ->\n        setInterval ->\n          output 1\n        , t * 1000\n\n>     #! pipe\n>     clock(4) STDOUT\n\n----\n\nControls\n--------\n\nTODO: Transistors and stuff.\n\nGates\n-----\n\nAttempt at a buffer that collects input and releases them based on a\ncontrol/signal input.\n\n`ctrl` is a source\n\n    gate = (ctrl) ->\n      (output) ->\n        buffer = []\n\n        ctrl ->\n          output buffer.shift()\n\n        (atom) ->\n          buffer.push atom\n\n>     #! pipe\n>     [0..25].map gate(clock(2)) STDOUT\n\nMaintain most recent value and emit it on CTRL.\n\n    latch = (ctrl) ->\n      (output) ->\n        value = undefined\n\n        ctrl ->\n          output value\n\n        (atom) ->\n          value = atom\n\nExport\n------\n\n    module.exports = Streamatorium =\n      accumulator: accumulator\n      clock: clock\n      counter: counter\n      each: each\n      filter: filter\n      FROM: FROM\n      gate: gate\n      getJSON: getJSON\n      identity: identity\n      invoke: invoke\n      limit: limit\n      map: map\n      pluck: pluck\n      pollute: ->\n        Object.keys(Streamatorium).forEach (name) ->\n          unless name is \"pollute\"\n            global[name] = Streamatorium[name]\n      prettyPrint: prettyPrint\n      soak: soak\n      tee: tee\n      TO: TO\n      toggle: toggle\n\nLive Examples\n-------------\n\n>     #! setup\n>     require(\"/interactive_runtime\")\n",
      "mode": "100644",
      "type": "blob"
    },
    "templates/table.haml.md": {
      "path": "templates/table.haml.md",
      "content": "A table template to render rows from stuff!\n\n    %table\n      %thead\n        %tr\n          - each @headers, (header) ->\n            %th= header\n      %tbody\n        - each @rows, (row) ->\n          %tr\n            - Object.keys(row).each (name) ->\n              %td= row[name]\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/stream.coffee.md": {
      "path": "test/stream.coffee.md",
      "content": "    require(\"../streamatorium\").pollute()\n    require(\"../environment_helpers\")\n\n    describe \"stream\", ->\n      it \"should map\", ->\n        3.tap map((x) -> 2 * x) (x) -> assert.equal x, 6\n\n      it \"should filter\", ->\n        even = (n) -> n % 2 is 0\n\n        results = []\n        push = (item) -> results.push item\n\n        [1, 2, 3, 4, 5].forEach filter(even) push\n\n        assert.equal results.length, 2\n\n      it \"should limit\", ->\n        results = []\n        push = (item) -> results.push item\n\n        [0..99].forEach limit(5) push\n\n        assert.equal results.length, 5\n",
      "mode": "100644",
      "type": "blob"
    },
    "util.coffee.md": {
      "path": "util.coffee.md",
      "content": "Utility Functions\n-----------------\n\n    module.exports =\n\nEvaluate a program with a given environment object.\n\nThe values of the environment are mapped to local variables with names equal to\nthe keys.\n\nThe given program is then run with that environment and optionally a context for\n`this`.\n\n      executeWithContext: (program, environment, context) ->\n        args = Object.keys(environment)\n\n        values = args.map (name) ->\n          environment[name]\n\n        Function(args..., program).apply(context, values)\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "environment_helpers": {
      "path": "environment_helpers",
      "content": "(function() {\n  if (!Object.prototype.tap) {\n    Object.defineProperty(Object.prototype, \"tap\", {\n      enumerable: false,\n      configurable: false,\n      writable: false,\n      value: function(fn) {\n        fn(this);\n        return this;\n      }\n    });\n  }\n\n}).call(this);\n",
      "type": "blob"
    },
    "extra": {
      "path": "extra",
      "content": "(function() {\n  var distributor, getJSON, promisory, rand,\n    __slice = [].slice;\n\n  distributor = function() {\n    var n, outputs;\n    outputs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    n = 0;\n    return function(atom) {\n      outputs[n](atom);\n      return n = (n + 1) % outputs.length;\n    };\n  };\n\n  rand = function(n) {\n    return function(output) {\n      return output(Math.floor(Math.random() * n));\n    };\n  };\n\n  promisory = function(output) {\n    return function(atom) {\n      return atom.then(output);\n    };\n  };\n\n  getJSON = function(output) {\n    return map($.getJSON)(promisory(output));\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "interactive_runtime": {
      "path": "interactive_runtime",
      "content": "(function() {\n  var executeProgram, executeWithContext;\n\n  require(\"/environment_helpers\");\n\n  require(\"/streamatorium\").pollute();\n\n  executeWithContext = require(\"/util\").executeWithContext;\n\n  Interactive.register(\"pipe\", function(_arg) {\n    var STDOUT, outputElement, program, runtimeElement, source;\n    source = _arg.source, runtimeElement = _arg.runtimeElement;\n    program = CoffeeScript.compile(source);\n    outputElement = document.createElement(\"pre\");\n    runtimeElement.empty().append(outputElement);\n    STDOUT = function(atom) {\n      return outputElement.textContent += \"\" + atom + \"\\n\";\n    };\n    return executeWithContext(program, {\n      T: tee(STDOUT),\n      STDOUT: STDOUT,\n      NULL: function() {}\n    });\n  });\n\n  Interactive.register(\"pipe-run\", function(_arg) {\n    var outputElement, runButton, runtimeElement, source;\n    source = _arg.source, runtimeElement = _arg.runtimeElement;\n    runtimeElement.program = CoffeeScript.compile(source);\n    if (runtimeElement.is(\":empty\")) {\n      runButton = $(\"<button>\", {\n        text: \"Run\",\n        css: {\n          position: \"absolute\",\n          marginTop: \"-2.5em\",\n          marginLeft: \"-1.5em\"\n        },\n        click: function() {\n          outputElement.textContent = \"\";\n          return executeProgram(runtimeElement.program, outputElement);\n        }\n      });\n      outputElement = document.createElement(\"pre\");\n      return runtimeElement.append(runButton).append(outputElement);\n    }\n  });\n\n  executeProgram = function(program, outputElement) {\n    var STDOUT;\n    STDOUT = function(atom) {\n      return outputElement.textContent += \"\" + atom + \"\\n\";\n    };\n    return executeWithContext(program, {\n      T: tee(STDOUT),\n      STDOUT: STDOUT,\n      NULL: function() {}\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "notes": {
      "path": "notes",
      "content": "(function() {\n  var gate;\n\n  gate = function(ctrl) {\n    return function(output) {\n      var buffer;\n      buffer = [];\n      ctrl(function() {\n        return output(buffer.shift());\n      });\n      return function(atom) {\n        return buffer.push(atom);\n      };\n    };\n  };\n\n  gate = function(ctrl) {\n    var buffer;\n    buffer = [];\n    return function(output) {\n      ctrl(function() {\n        return output(buffer.shift());\n      });\n      return function(atom) {\n        return buffer.push(atom);\n      };\n    };\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"entryPoint\":\"streamatorium\",\"version\":\"0.1.0\"};",
      "type": "blob"
    },
    "sicp_stream": {
      "path": "sicp_stream",
      "content": "(function() {\n  var Stream, emptyStream;\n\n  Stream = function(first, rest) {\n    var self;\n    if (rest == null) {\n      rest = function() {\n        return emptyStream;\n      };\n    }\n    return self = {\n      first: function() {\n        return first;\n      },\n      rest: rest,\n      get: function(n) {\n        if (n === 0) {\n          return self.first();\n        } else {\n          return rest().get(n - 1);\n        }\n      },\n      each: function(fn) {\n        fn(self.first());\n        rest().each(fn);\n        return self;\n      },\n      map: function(fn) {\n        return Stream(fn(self.first()), function() {\n          return rest().map(fn);\n        });\n      }\n    };\n  };\n\n  emptyStream = {\n    map: function() {\n      return emptyStream;\n    },\n    each: function() {\n      return emptyStream;\n    },\n    get: function() {}\n  };\n\n  module.exports = Stream;\n\n}).call(this);\n",
      "type": "blob"
    },
    "streamatorium": {
      "path": "streamatorium",
      "content": "(function() {\n  var FROM, NULL, STDOUT, Streamatorium, T, TO, accumulator, clock, connector, connectors, counter, defer, each, filter, gate, getJSON, identity, invoke, latch, limit, map, pluck, prettyPrint, soak, split, tee, toggle, tokenizer,\n    __slice = [].slice;\n\n  STDOUT = function(atom) {\n    return console.log(atom);\n  };\n\n  NULL = function(atom) {};\n\n  identity = function(output) {\n    return function(atom) {\n      return output(atom);\n    };\n  };\n\n  defer = function(output) {\n    return function(atom) {\n      return setTimeout(output, 0, atom);\n    };\n  };\n\n  each = function(output) {\n    return function(arrayOrItem) {\n      return [].concat(arrayOrItem).forEach(function(item) {\n        return output(item);\n      });\n    };\n  };\n\n  prettyPrint = function(output) {\n    return function(atom) {\n      return output(JSON.stringify(atom, null, 2));\n    };\n  };\n\n  getJSON = function(output) {\n    return function(url) {\n      return $.getJSON(url).then(output);\n    };\n  };\n\n  split = function() {\n    var outputs;\n    outputs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n    return function(atom) {\n      return outputs.forEach(function(output) {\n        return output(atom);\n      });\n    };\n  };\n\n  tee = function(sink) {\n    return function(output) {\n      return split(sink, output);\n    };\n  };\n\n  T = tee(STDOUT);\n\n  map = function(fn) {\n    return function(output) {\n      return function(atom) {\n        return output(fn(atom));\n      };\n    };\n  };\n\n  pluck = function(name) {\n    return map(function(atom) {\n      return atom[name];\n    });\n  };\n\n  invoke = function() {\n    var args, name;\n    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    return map(function(atom) {\n      return atom[name].apply(atom, args);\n    });\n  };\n\n  filter = function(fn) {\n    return function(output) {\n      return function(atom) {\n        if (fn(atom)) {\n          return output(atom);\n        }\n      };\n    };\n  };\n\n  soak = filter(function(atom) {\n    return atom != null;\n  });\n\n  toggle = function(output) {\n    var value;\n    value = true;\n    return function(atom) {\n      output(value);\n      return value = !value;\n    };\n  };\n\n  counter = function(output) {\n    var value;\n    value = 0;\n    return function(atom) {\n      return output(value += 1);\n    };\n  };\n\n  accumulator = function(output) {\n    var value;\n    value = 0;\n    return function(atom) {\n      return output(value += atom);\n    };\n  };\n\n  tokenizer = function(output) {\n    var word;\n    word = \"\";\n    return function(character) {\n      if (character.match(/\\s/)) {\n        if (word) {\n          output(word);\n          return word = \"\";\n        }\n      } else {\n        return word += character;\n      }\n    };\n  };\n\n  limit = function(n) {\n    return function(output) {\n      var count;\n      count = 0;\n      return function(atom) {\n        if (count < n) {\n          output(atom);\n        }\n        return count += 1;\n      };\n    };\n  };\n\n  connector = function() {\n    var atoms, collector, flush, output;\n    atoms = [];\n    output = null;\n    flush = function() {\n      var _results;\n      if (output) {\n        _results = [];\n        while (atoms.length) {\n          _results.push(output(atoms.shift()));\n        }\n        return _results;\n      }\n    };\n    collector = function(atom) {\n      atoms.push(atom);\n      return flush();\n    };\n    collector.source = function(sink) {\n      output = sink;\n      return flush();\n    };\n    return collector;\n  };\n\n  connectors = {};\n\n  TO = function(id) {\n    return connectors[id] = connector();\n  };\n\n  FROM = function(id) {\n    return connectors[id].source;\n  };\n\n  clock = function(t) {\n    return function(output) {\n      return setInterval(function() {\n        return output(1);\n      }, t * 1000);\n    };\n  };\n\n  gate = function(ctrl) {\n    return function(output) {\n      var buffer;\n      buffer = [];\n      ctrl(function() {\n        return output(buffer.shift());\n      });\n      return function(atom) {\n        return buffer.push(atom);\n      };\n    };\n  };\n\n  latch = function(ctrl) {\n    return function(output) {\n      var value;\n      value = void 0;\n      ctrl(function() {\n        return output(value);\n      });\n      return function(atom) {\n        return value = atom;\n      };\n    };\n  };\n\n  module.exports = Streamatorium = {\n    accumulator: accumulator,\n    clock: clock,\n    counter: counter,\n    each: each,\n    filter: filter,\n    FROM: FROM,\n    gate: gate,\n    getJSON: getJSON,\n    identity: identity,\n    invoke: invoke,\n    limit: limit,\n    map: map,\n    pluck: pluck,\n    pollute: function() {\n      return Object.keys(Streamatorium).forEach(function(name) {\n        if (name !== \"pollute\") {\n          return global[name] = Streamatorium[name];\n        }\n      });\n    },\n    prettyPrint: prettyPrint,\n    soak: soak,\n    tee: tee,\n    TO: TO,\n    toggle: toggle\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "templates/table": {
      "path": "templates/table",
      "content": "Runtime = require(\"/_lib/hamljr_runtime\");\n\nmodule.exports = (function(data) {\n  return (function() {\n    var __runtime;\n    __runtime = Runtime(this);\n    __runtime.push(document.createDocumentFragment());\n    __runtime.push(document.createElement(\"table\"));\n    __runtime.push(document.createElement(\"thead\"));\n    __runtime.push(document.createElement(\"tr\"));\n    __runtime.each(this.headers, function(header) {\n      __runtime.push(document.createElement(\"th\"));\n      __runtime.text(header);\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.pop();\n    __runtime.push(document.createElement(\"tbody\"));\n    __runtime.each(this.rows, function(row) {\n      __runtime.push(document.createElement(\"tr\"));\n      Object.keys(row).each(function(name) {\n        __runtime.push(document.createElement(\"td\"));\n        __runtime.text(row[name]);\n        return __runtime.pop();\n      });\n      return __runtime.pop();\n    });\n    __runtime.pop();\n    __runtime.pop();\n    return __runtime.pop();\n  }).call(data);\n});\n",
      "type": "blob"
    },
    "test/stream": {
      "path": "test/stream",
      "content": "(function() {\n  require(\"../streamatorium\").pollute();\n\n  require(\"../environment_helpers\");\n\n  describe(\"stream\", function() {\n    it(\"should map\", function() {\n      return 3..tap(map(function(x) {\n        return 2 * x;\n      })(function(x) {\n        return assert.equal(x, 6);\n      }));\n    });\n    it(\"should filter\", function() {\n      var even, push, results;\n      even = function(n) {\n        return n % 2 === 0;\n      };\n      results = [];\n      push = function(item) {\n        return results.push(item);\n      };\n      [1, 2, 3, 4, 5].forEach(filter(even)(push));\n      return assert.equal(results.length, 2);\n    });\n    return it(\"should limit\", function() {\n      var push, results, _i, _results;\n      results = [];\n      push = function(item) {\n        return results.push(item);\n      };\n      (function() {\n        _results = [];\n        for (_i = 0; _i <= 99; _i++){ _results.push(_i); }\n        return _results;\n      }).apply(this).forEach(limit(5)(push));\n      return assert.equal(results.length, 5);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "util": {
      "path": "util",
      "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    executeWithContext: function(program, environment, context) {\n      var args, values;\n      args = Object.keys(environment);\n      values = args.map(function(name) {\n        return environment[name];\n      });\n      return Function.apply(null, __slice.call(args).concat([program])).apply(context, values);\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "_lib/hamljr_runtime": {
      "path": "_lib/hamljr_runtime",
      "content": "(function() {\n  var Runtime, dataName, document,\n    __slice = [].slice;\n\n  dataName = \"__hamlJR_data\";\n\n  if (typeof window !== \"undefined\" && window !== null) {\n    document = window.document;\n  } else {\n    document = global.document;\n  }\n\n  Runtime = function(context) {\n    var append, bindObservable, classes, id, lastParent, observeAttribute, observeText, pop, push, render, self, stack, top;\n    stack = [];\n    lastParent = function() {\n      var element, i;\n      i = stack.length - 1;\n      while ((element = stack[i]) && element.nodeType === 11) {\n        i -= 1;\n      }\n      return element;\n    };\n    top = function() {\n      return stack[stack.length - 1];\n    };\n    append = function(child) {\n      var _ref;\n      if ((_ref = top()) != null) {\n        _ref.appendChild(child);\n      }\n      return child;\n    };\n    push = function(child) {\n      return stack.push(child);\n    };\n    pop = function() {\n      return append(stack.pop());\n    };\n    render = function(child) {\n      push(child);\n      return pop();\n    };\n    bindObservable = function(element, value, update) {\n      var observable, observe, unobserve;\n      if (typeof Observable === \"undefined\" || Observable === null) {\n        update(value);\n        return;\n      }\n      observable = Observable(value);\n      observe = function() {\n        observable.observe(update);\n        return update(observable());\n      };\n      unobserve = function() {\n        return observable.stopObserving(update);\n      };\n      element.addEventListener(\"DOMNodeInserted\", observe, true);\n      element.addEventListener(\"DOMNodeRemoved\", unobserve, true);\n      return element;\n    };\n    id = function() {\n      var element, sources, update, value;\n      sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      element = top();\n      update = function(newValue) {\n        if (typeof newValue === \"function\") {\n          newValue = newValue();\n        }\n        return element.id = newValue;\n      };\n      value = function() {\n        var possibleValues;\n        possibleValues = sources.map(function(source) {\n          if (typeof source === \"function\") {\n            return source();\n          } else {\n            return source;\n          }\n        }).filter(function(idValue) {\n          return idValue != null;\n        });\n        return possibleValues[possibleValues.length - 1];\n      };\n      return bindObservable(element, value, update);\n    };\n    classes = function() {\n      var element, sources, update, value;\n      sources = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      element = top();\n      update = function(newValue) {\n        if (typeof newValue === \"function\") {\n          newValue = newValue();\n        }\n        return element.className = newValue;\n      };\n      value = function() {\n        var possibleValues;\n        possibleValues = sources.map(function(source) {\n          if (typeof source === \"function\") {\n            return source();\n          } else {\n            return source;\n          }\n        }).filter(function(sourceValue) {\n          return sourceValue != null;\n        });\n        return possibleValues.join(\" \");\n      };\n      return bindObservable(element, value, update);\n    };\n    observeAttribute = function(name, value) {\n      var element, update;\n      element = top();\n      if ((name === \"value\") && (typeof value === \"function\")) {\n        element.value = value();\n        element.onchange = function() {\n          return value(element.value);\n        };\n        if (value.observe) {\n          value.observe(function(newValue) {\n            return element.value = newValue;\n          });\n        }\n      } else {\n        update = function(newValue) {\n          return element.setAttribute(name, newValue);\n        };\n        bindObservable(element, value, update);\n      }\n      return element;\n    };\n    observeText = function(value) {\n      var element, update;\n      switch (value != null ? value.nodeType : void 0) {\n        case 1:\n        case 3:\n        case 11:\n          render(value);\n          return;\n      }\n      element = document.createTextNode('');\n      update = function(newValue) {\n        return element.nodeValue = newValue;\n      };\n      bindObservable(element, value, update);\n      return render(element);\n    };\n    self = {\n      push: push,\n      pop: pop,\n      id: id,\n      classes: classes,\n      attribute: observeAttribute,\n      text: observeText,\n      filter: function(name, content) {},\n      each: function(items, fn) {\n        var elements, parent, replace;\n        items = Observable(items);\n        elements = [];\n        parent = lastParent();\n        items.observe(function(newItems) {\n          return replace(elements, newItems);\n        });\n        replace = function(oldElements, items) {\n          var firstElement;\n          if (oldElements) {\n            firstElement = oldElements[0];\n            parent = (firstElement != null ? firstElement.parentElement : void 0) || parent;\n            elements = items.map(function(item, index, array) {\n              var element;\n              element = fn.call(item, item, index, array);\n              element[dataName] = item;\n              parent.insertBefore(element, firstElement);\n              return element;\n            });\n            return oldElements.forEach(function(element) {\n              return element.remove();\n            });\n          } else {\n            return elements = items.map(function(item, index, array) {\n              var element;\n              element = fn.call(item, item, index, array);\n              element[dataName] = item;\n              return element;\n            });\n          }\n        };\n        return replace(null, items);\n      },\n      \"with\": function(item, fn) {\n        var element, replace, value;\n        element = null;\n        item = Observable(item);\n        item.observe(function(newValue) {\n          return replace(element, newValue);\n        });\n        value = item();\n        replace = function(oldElement, value) {\n          var parent;\n          element = fn.call(value);\n          element[dataName] = item;\n          if (oldElement) {\n            parent = oldElement.parentElement;\n            parent.insertBefore(element, oldElement);\n            return oldElement.remove();\n          } else {\n\n          }\n        };\n        return replace(element, value);\n      },\n      on: function(eventName, fn) {\n        var element;\n        element = lastParent();\n        if (eventName === \"change\") {\n          switch (element.nodeName) {\n            case \"SELECT\":\n              element[\"on\" + eventName] = function() {\n                var selectedOption;\n                selectedOption = this.options[this.selectedIndex];\n                return fn(selectedOption[dataName]);\n              };\n              if (fn.observe) {\n                return fn.observe(function(newValue) {\n                  return Array.prototype.forEach.call(element.options, function(option, index) {\n                    if (option[dataName] === newValue) {\n                      return element.selectedIndex = index;\n                    }\n                  });\n                });\n              }\n              break;\n            default:\n              element[\"on\" + eventName] = function() {\n                return fn(element.value);\n              };\n              if (fn.observe) {\n                return fn.observe(function(newValue) {\n                  return element.value = newValue;\n                });\n              }\n          }\n        } else {\n          return element[\"on\" + eventName] = function(event) {\n            return fn.call(context, event);\n          };\n        }\n      }\n    };\n    return self;\n  };\n\n  module.exports = Runtime;\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "version": "0.1.0",
  "entryPoint": "streamatorium",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/stream",
    "homepage": null,
    "description": "Learning about streams",
    "html_url": "https://github.com/STRd6/stream",
    "url": "https://api.github.com/repos/STRd6/stream",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});