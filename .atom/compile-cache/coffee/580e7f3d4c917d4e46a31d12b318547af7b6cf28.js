(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      maxTokensPerLine: {
        type: 'integer',
        minimum: 1,
        "default": 100,
        description: 'Atom limits the number of tokens that will be syntax highlighted on a line for performance reasons. Be careful when increasing this limit.'
      }
    },
    activate: function(state) {
      this.subs = new CompositeDisposable;
      this.subs.add(atom.grammars.onDidAddGrammar(function(grammar) {
        return grammar.maxTokensPerLine = atom.config.get('grammar-token-limit.maxTokensPerLine');
      }));
      return this.subs.add(atom.config.observe('grammar-token-limit.maxTokensPerLine', function(maxTokensPerLine) {
        var grammar, _i, _len, _ref, _results;
        _ref = atom.grammars.getGrammars();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          grammar = _ref[_i];
          _results.push(grammar.maxTokensPerLine = maxTokensPerLine);
        }
        return _results;
      }));
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.subs) != null ? _ref.dispose() : void 0;
    },
    serialize: function() {}
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2dyYW1tYXItdG9rZW4tbGltaXQvbGliL2dyYW1tYXItdG9rZW4tbGltaXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLGdCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxPQUFBLEVBQVMsQ0FEVDtBQUFBLFFBRUEsU0FBQSxFQUFTLEdBRlQ7QUFBQSxRQUdBLFdBQUEsRUFBYSw0SUFIYjtPQURGO0tBREY7QUFBQSxJQU9BLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxHQUFBLENBQUEsbUJBQVIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFNBQUMsT0FBRCxHQUFBO2VBQ3RDLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0NBQWhCLEVBRFc7TUFBQSxDQUE5QixDQUFWLENBREEsQ0FBQTthQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixzQ0FBcEIsRUFBNEQsU0FBQyxnQkFBRCxHQUFBO0FBQ3BFLFlBQUEsaUNBQUE7QUFBQTtBQUFBO2FBQUEsMkNBQUE7NkJBQUE7QUFDSSx3QkFBQSxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsaUJBQTNCLENBREo7QUFBQTt3QkFEb0U7TUFBQSxDQUE1RCxDQUFWLEVBTFE7SUFBQSxDQVBWO0FBQUEsSUFnQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBQTs4Q0FBSyxDQUFFLE9BQVAsQ0FBQSxXQURVO0lBQUEsQ0FoQlo7QUFBQSxJQW1CQSxTQUFBLEVBQVcsU0FBQSxHQUFBLENBbkJYO0dBSEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/grammar-token-limit/lib/grammar-token-limit.coffee
