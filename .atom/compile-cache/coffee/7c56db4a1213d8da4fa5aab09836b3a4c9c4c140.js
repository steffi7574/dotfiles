(function() {
  var CtagsProvider, checkSnippet, tagToSuggestion;

  checkSnippet = function(tag) {
    if (tag.kind === "require") {
      return tag.pattern.substring(2, tag.pattern.length - 2);
    }
    if (tag.kind === "function") {
      return tag.pattern.substring(tag.pattern.indexOf(tag.name), tag.pattern.length - 2);
    }
  };

  tagToSuggestion = function(tag) {
    return {
      text: tag.name,
      displayText: tag.pattern.substring(2, tag.pattern.length - 2),
      type: tag.kind,
      snippet: checkSnippet(tag)
    };
  };

  module.exports = CtagsProvider = (function() {
    var prefix_opt, tag_options;

    function CtagsProvider() {}

    CtagsProvider.prototype.selector = '*';

    tag_options = {
      partialMatch: true,
      maxItems: 10
    };

    prefix_opt = {
      wordRegex: /[a-zA-Z0-9_]+[\.\:]/
    };

    CtagsProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, k, matches, output, prefix, scopeDescriptor, suggestions, tag, _i, _len;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      if (this.disabled) {
        return [];
      }
      if (prefix === "." || prefix === ":") {
        prefix = editor.getWordUnderCursor(prefix_opt);
      }
      if (!prefix.length) {
        return;
      }
      matches = this.ctagsCache.findTags(prefix, tag_options);
      suggestions = [];
      if (tag_options.partialMatch) {
        output = {};
        k = 0;
        while (k < matches.length) {
          tag = matches[k++];
          if (output[tag.name]) {
            continue;
          }
          output[tag.name] = tag;
          suggestions.push(tagToSuggestion(tag));
        }
        if (suggestions.length === 1 && suggestions[0].text === prefix) {
          return [];
        }
      } else {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          tag = matches[_i];
          suggestions.push(tagToSuggestion(tag));
        }
      }
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    return CtagsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2N0YWdzLXByb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0Q0FBQTs7QUFBQSxFQUFBLFlBQUEsR0FBZSxTQUFDLEdBQUQsR0FBQTtBQUViLElBQUEsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLFNBQWY7QUFDRSxhQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBWixDQUFzQixDQUF0QixFQUF5QixHQUFHLENBQUMsT0FBTyxDQUFDLE1BQVosR0FBbUIsQ0FBNUMsQ0FBUCxDQURGO0tBQUE7QUFFQSxJQUFBLElBQUcsR0FBRyxDQUFDLElBQUosS0FBWSxVQUFmO0FBQ0UsYUFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVosQ0FBc0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFaLENBQW9CLEdBQUcsQ0FBQyxJQUF4QixDQUF0QixFQUFxRCxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQVosR0FBbUIsQ0FBeEUsQ0FBUCxDQURGO0tBSmE7RUFBQSxDQUFmLENBQUE7O0FBQUEsRUFPQSxlQUFBLEdBQWtCLFNBQUMsR0FBRCxHQUFBO1dBQ2hCO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBRyxDQUFDLElBQVY7QUFBQSxNQUNBLFdBQUEsRUFBYSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVosQ0FBc0IsQ0FBdEIsRUFBeUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFaLEdBQW1CLENBQTVDLENBRGI7QUFBQSxNQUVBLElBQUEsRUFBTSxHQUFHLENBQUMsSUFGVjtBQUFBLE1BR0EsT0FBQSxFQUFTLFlBQUEsQ0FBYSxHQUFiLENBSFQ7TUFEZ0I7RUFBQSxDQVBsQixDQUFBOztBQUFBLEVBYUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLFFBQUEsdUJBQUE7OytCQUFBOztBQUFBLDRCQUFBLFFBQUEsR0FBVSxHQUFWLENBQUE7O0FBQUEsSUFFQSxXQUFBLEdBQWM7QUFBQSxNQUFFLFlBQUEsRUFBYyxJQUFoQjtBQUFBLE1BQXNCLFFBQUEsRUFBVSxFQUFoQztLQUZkLENBQUE7O0FBQUEsSUFHQSxVQUFBLEdBQWE7QUFBQSxNQUFDLFNBQUEsRUFBVyxxQkFBWjtLQUhiLENBQUE7O0FBQUEsNEJBS0EsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLFVBQUEsK0ZBQUE7QUFBQSxNQURnQixjQUFBLFFBQVEsc0JBQUEsZ0JBQWdCLHVCQUFBLGlCQUFpQixjQUFBLE1BQ3pELENBQUE7QUFBQSxNQUFBLElBQWEsSUFBQyxDQUFBLFFBQWQ7QUFBQSxlQUFPLEVBQVAsQ0FBQTtPQUFBO0FBRUEsTUFBQSxJQUFHLE1BQUEsS0FBVSxHQUFWLElBQWlCLE1BQUEsS0FBVSxHQUE5QjtBQUNFLFFBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxrQkFBUCxDQUEwQixVQUExQixDQUFULENBREY7T0FGQTtBQU1BLE1BQUEsSUFBQSxDQUFBLE1BQW9CLENBQUMsTUFBckI7QUFBQSxjQUFBLENBQUE7T0FOQTtBQUFBLE1BUUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixNQUFyQixFQUE2QixXQUE3QixDQVJWLENBQUE7QUFBQSxNQVVBLFdBQUEsR0FBYyxFQVZkLENBQUE7QUFXQSxNQUFBLElBQUcsV0FBVyxDQUFDLFlBQWY7QUFDRSxRQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxRQUNBLENBQUEsR0FBSSxDQURKLENBQUE7QUFFQSxlQUFNLENBQUEsR0FBSSxPQUFPLENBQUMsTUFBbEIsR0FBQTtBQUNFLFVBQUEsR0FBQSxHQUFNLE9BQVEsQ0FBQSxDQUFBLEVBQUEsQ0FBZCxDQUFBO0FBQ0EsVUFBQSxJQUFZLE1BQU8sQ0FBQSxHQUFHLENBQUMsSUFBSixDQUFuQjtBQUFBLHFCQUFBO1dBREE7QUFBQSxVQUVBLE1BQU8sQ0FBQSxHQUFHLENBQUMsSUFBSixDQUFQLEdBQW1CLEdBRm5CLENBQUE7QUFBQSxVQUdBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLGVBQUEsQ0FBZ0IsR0FBaEIsQ0FBakIsQ0FIQSxDQURGO1FBQUEsQ0FGQTtBQU9BLFFBQUEsSUFBRyxXQUFXLENBQUMsTUFBWixLQUFzQixDQUF0QixJQUE0QixXQUFZLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBZixLQUF1QixNQUF0RDtBQUNFLGlCQUFPLEVBQVAsQ0FERjtTQVJGO09BQUEsTUFBQTtBQVdFLGFBQUEsOENBQUE7NEJBQUE7QUFDRSxVQUFBLFdBQVcsQ0FBQyxJQUFaLENBQWlCLGVBQUEsQ0FBZ0IsR0FBaEIsQ0FBakIsQ0FBQSxDQURGO0FBQUEsU0FYRjtPQVhBO0FBMEJBLE1BQUEsSUFBQSxDQUFBLFdBQXlCLENBQUMsTUFBMUI7QUFBQSxjQUFBLENBQUE7T0ExQkE7QUE2QkEsYUFBTyxXQUFQLENBOUJjO0lBQUEsQ0FMaEIsQ0FBQTs7eUJBQUE7O01BZkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/lib/ctags-provider.coffee
