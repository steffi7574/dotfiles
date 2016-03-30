(function() {
  var BibtexProvider, XRegExp, bibtexParse, fs, fuzzaldrin, titlecaps,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require("fs");

  bibtexParse = require("zotero-bibtex-parse");

  fuzzaldrin = require("fuzzaldrin");

  XRegExp = require('xregexp').XRegExp;

  titlecaps = require("./titlecaps");

  module.exports = BibtexProvider = (function() {

    /*
    For a while, I intended to continue using XRegExp with this `wordRegex`:
    
    ```
    wordRegex: XRegExp('(?:^|\\p{WhiteSpace})@[\\p{Letter}\\p{Number}\._-]*')
    ```
    
    But I found that the regular expression given here seems to work well. If
    there are problems with Unicode characters, I can switch back to the other.
    
    This regular expression is also more lenient about what punctuation it will
    accept. Whereas the alternate only allows the punctuation which might be
    expected in a BibTeX key, this will accept all sorts. It does not accept a
    second `@`, as this would become confusing.
     */
    var bibtex;

    BibtexProvider.prototype.wordRegex = XRegExp('(?:^|[\\p{WhiteSpace}\\p{Punctuation}])@[\\p{Letter}\\p{Number}\._-]*');

    bibtex = [];

    atom.deserializers.add(BibtexProvider);

    BibtexProvider.deserialize = function(_arg) {
      var data;
      data = _arg.data;
      return new BibtexProvider(data);
    };

    function BibtexProvider(state) {
      this.prefixForCursor = __bind(this.prefixForCursor, this);
      this.readBibtexFiles = __bind(this.readBibtexFiles, this);
      this.buildWordListFromFiles = __bind(this.buildWordListFromFiles, this);
      this.buildWordList = __bind(this.buildWordList, this);
      var resultTemplate;
      if (state && Object.keys(state).length !== 0) {
        this.bibtex = state.bibtex;
        this.possibleWords = state.possibleWords;
      } else {
        this.buildWordListFromFiles(atom.config.get("autocomplete-bibtex.bibtex"));
      }
      if (this.bibtex.length === 0) {
        this.buildWordListFromFiles(atom.config.get("autocomplete-bibtex.bibtex"));
      }
      atom.config.onDidChange("autocomplete-bibtex.bibtex", (function(_this) {
        return function(bibtexFiles) {
          return _this.buildWordListFromFiles(bibtexFiles);
        };
      })(this));
      resultTemplate = atom.config.get("autocomplete-bibtex.resultTemplate");
      atom.config.observe("autocomplete-bibtex.resultTemplate", (function(_this) {
        return function(resultTemplate) {
          return _this.resultTemplate = resultTemplate;
        };
      })(this));
      this.provider = {
        id: 'autocomplete-bibtex-bibtexprovider',
        selector: atom.config.get("autocomplete-bibtex.scope"),
        blacklist: '',
        providerblacklist: '',
        requestHandler: (function(_this) {
          return function(options) {
            var normalizedPrefix, prefix, suggestions, word, words;
            prefix = _this.prefixForCursor(options.cursor, options.buffer);

            /*
            Because the regular expression may a single whitespace or punctuation
            character before the part in which we're interested. Since this is the
            only case in which an `@` could be the second character, that's a simple
            way to test for it.
            
            (I put this here, and not in the `prefixForCursor` method because I want
            to keep that method as similar to the `AutocompleteManager` method of
            the same name as I can.)
             */
            if (prefix[1] === '@') {
              prefix = prefix.slice(1);
            }
            if (!prefix.length || prefix[0] === !'@') {
              return;
            }
            normalizedPrefix = prefix.normalize().replace(/@/, '');
            normalizedPrefix = normalizedPrefix.replace(/(\r\n|\n|\r)/gm, "");
            words = fuzzaldrin.filter(_this.possibleWords, normalizedPrefix, {
              key: 'author'
            });
            return suggestions = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = words.length; _i < _len; _i++) {
                word = words[_i];
                _results.push({
                  word: this.resultTemplate.replace('[key]', word.key),
                  prefix: '@' + normalizedPrefix,
                  label: word.label,
                  renderLabelAsHtml: false,
                  className: '',
                  onWillConfirm: function() {},
                  onDidConfirm: function() {}
                });
              }
              return _results;
            }).call(_this);
          };
        })(this),
        dispose: function() {}
      };
    }

    BibtexProvider.prototype.serialize = function() {
      return {
        deserializer: 'BibtexProvider',
        data: {
          bibtex: this.bibtex,
          possibleWords: this.possibleWords
        }
      };
    };

    BibtexProvider.prototype.buildWordList = function() {
      var author, citation, possibleWords, _i, _j, _len, _len1, _ref, _ref1;
      possibleWords = [];
      _ref = this.bibtex;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        citation = _ref[_i];
        if (citation.entryTags && citation.entryTags.title && (citation.entryTags.author || citation.entryTags.editor)) {
          citation.entryTags.prettyTitle = this.prettifyTitle(citation.entryTags.title);
          citation.entryTags.authors = [];
          if (citation.entryTags.author != null) {
            citation.entryTags.authors = citation.entryTags.authors.concat(this.cleanAuthors(citation.entryTags.author.split(' and ')));
          }
          if (citation.entryTags.editor != null) {
            citation.entryTags.authors = citation.entryTags.authors.concat(this.cleanAuthors(citation.entryTags.editor.split(' and ')));
          }
          citation.entryTags.prettyAuthors = this.prettifyAuthors(citation.entryTags.authors);
          _ref1 = citation.entryTags.authors;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            author = _ref1[_j];
            possibleWords.push({
              author: this.prettifyName(author, true),
              key: citation.citationKey,
              label: "" + citation.entryTags.prettyTitle + " by " + citation.entryTags.prettyAuthors
            });
          }
        }
      }
      return this.possibleWords = possibleWords;
    };

    BibtexProvider.prototype.buildWordListFromFiles = function(bibtexFiles) {
      this.readBibtexFiles(bibtexFiles);
      return this.buildWordList();
    };

    BibtexProvider.prototype.readBibtexFiles = function(bibtexFiles) {
      var error, file, parser, _i, _len;
      if (!Array.isArray(bibtexFiles)) {
        bibtexFiles = [bibtexFiles];
      }
      try {
        bibtex = [];
        for (_i = 0, _len = bibtexFiles.length; _i < _len; _i++) {
          file = bibtexFiles[_i];
          if (fs.statSync(file).isFile()) {
            parser = new bibtexParse(fs.readFileSync(file, 'utf-8'));
            bibtex = bibtex.concat(parser.parse());
          } else {
            console.warn("'" + file + "' does not appear to be a file, so autocomplete-bibtex will not try to parse it.");
          }
        }
        return this.bibtex = bibtex;
      } catch (_error) {
        error = _error;
        return console.error(error);
      }
    };


    /*
    This is a lightly modified version of AutocompleteManager.prefixForCursor
    which allows autocomplete-bibtex to define its own wordRegex.
    
    N.B. Setting `allowPrevious` to `false` is absolutely essential in order to
    make this perform as expected.
     */

    BibtexProvider.prototype.prefixForCursor = function(cursor, buffer) {
      var end, start;
      if (!((buffer != null) && (cursor != null))) {
        return '';
      }
      start = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex,
        allowPrevious: false
      });
      end = cursor.getBufferPosition();
      if (!((start != null) && (end != null))) {
        return '';
      }
      return buffer.getTextInRange([start, end]);
    };

    BibtexProvider.prototype.prettifyTitle = function(title) {
      var colon, l, n;
      if (!title) {
        return;
      }
      if ((colon = title.indexOf(':')) !== -1 && title.split(" ").length > 5) {
        title = title.substring(0, colon);
      }
      title = titlecaps(title);
      l = title.length > 30 ? 30 : title.length;
      title = title.slice(0, l);
      n = title.lastIndexOf(" ");
      return title = title.slice(0, n) + "...";
    };

    BibtexProvider.prototype.cleanAuthors = function(authors) {
      var author, familyName, personalName, _i, _len, _ref, _results;
      if (authors == null) {
        return [
          {
            familyName: 'Unknown'
          }
        ];
      }
      _results = [];
      for (_i = 0, _len = authors.length; _i < _len; _i++) {
        author = authors[_i];
        _ref = author.indexOf(', ') !== -1 ? author.split(', ') : [author], familyName = _ref[0], personalName = _ref[1];
        _results.push({
          personalName: personalName,
          familyName: familyName
        });
      }
      return _results;
    };

    BibtexProvider.prototype.prettifyAuthors = function(authors) {
      var name;
      name = this.prettifyName(authors[0]);
      if (authors.length > 1) {
        return "" + name + " et al.";
      } else {
        return "" + name;
      }
    };

    BibtexProvider.prototype.prettifyName = function(person, inverted, separator) {
      if (inverted == null) {
        inverted = false;
      }
      if (separator == null) {
        separator = ' ';
      }
      if (inverted) {
        return this.prettifyName({
          personalName: person.familyName,
          familyName: person.personalName
        }, false, ', ');
      } else {
        return (person.personalName != null ? person.personalName : '') + ((person.personalName != null) && (person.familyName != null) ? separator : '') + (person.familyName != null ? person.familyName : '');
      }
    };

    return BibtexProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1iaWJ0ZXgvbGliL3Byb3ZpZGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrREFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVIsQ0FEZCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBRmIsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQUFrQixDQUFDLE9BSDdCLENBQUE7O0FBQUEsRUFJQSxTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FKWixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKO0FBQUE7Ozs7Ozs7Ozs7Ozs7O09BQUE7QUFBQSxRQUFBLE1BQUE7O0FBQUEsNkJBZUEsU0FBQSxHQUFXLE9BQUEsQ0FBUSx1RUFBUixDQWZYLENBQUE7O0FBQUEsSUFnQkEsTUFBQSxHQUFTLEVBaEJULENBQUE7O0FBQUEsSUFrQkEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixjQUF2QixDQWxCQSxDQUFBOztBQUFBLElBbUJBLGNBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxJQUFELEdBQUE7QUFBWSxVQUFBLElBQUE7QUFBQSxNQUFWLE9BQUQsS0FBQyxJQUFVLENBQUE7YUFBSSxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQWhCO0lBQUEsQ0FuQmQsQ0FBQTs7QUFxQmEsSUFBQSx3QkFBQyxLQUFELEdBQUE7QUFDWCwrREFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSwyREFBQSxDQUFB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

//# sourceURL=/home/sguenther/.atom/packages/autocomplete-bibtex/lib/provider.coffee
