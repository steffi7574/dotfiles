(function() {
  var CompositeDisposable, Disposable, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = function() {
    var FakeEditor, HighlightedAreaView, MinimapHighlightSelectedView, highlightSelected, highlightSelectedPackage;
    highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
    highlightSelected = require(highlightSelectedPackage.path);
    HighlightedAreaView = require(highlightSelectedPackage.path + '/lib/highlighted-area-view');
    FakeEditor = (function() {
      function FakeEditor(minimap) {
        this.minimap = minimap;
      }

      FakeEditor.prototype.getActiveMinimap = function() {
        return this.minimap.getActiveMinimap();
      };

      FakeEditor.prototype.getActiveTextEditor = function() {
        var _ref1;
        return (_ref1 = this.getActiveMinimap()) != null ? _ref1.getTextEditor() : void 0;
      };

      ['markBufferRange', 'scanInBufferRange', 'getEofBufferPosition', 'getSelections', 'getLastSelection', 'bufferRangeForBufferRow', 'getTextInBufferRange'].forEach(function(key) {
        return FakeEditor.prototype[key] = function() {
          var _ref1;
          return (_ref1 = this.getActiveTextEditor()) != null ? _ref1[key].apply(_ref1, arguments) : void 0;
        };
      });

      ['onDidAddSelection', 'onDidChangeSelectionRange'].forEach(function(key) {
        return FakeEditor.prototype[key] = function() {
          var _ref1, _ref2;
          return (_ref1 = (_ref2 = this.getActiveTextEditor()) != null ? _ref2[key].apply(_ref2, arguments) : void 0) != null ? _ref1 : new Disposable(function() {});
        };
      });

      ['decorateMarker'].forEach(function(key) {
        return FakeEditor.prototype[key] = function() {
          var _ref1;
          return (_ref1 = this.getActiveMinimap())[key].apply(_ref1, arguments);
        };
      });

      return FakeEditor;

    })();
    return MinimapHighlightSelectedView = (function(_super) {
      __extends(MinimapHighlightSelectedView, _super);

      function MinimapHighlightSelectedView(minimap) {
        this.fakeEditor = new FakeEditor(minimap);
        MinimapHighlightSelectedView.__super__.constructor.apply(this, arguments);
      }

      MinimapHighlightSelectedView.prototype.getActiveEditor = function() {
        return this.fakeEditor;
      };

      MinimapHighlightSelectedView.prototype.handleSelection = function() {
        var editor, range, regex, regexFlags, regexSearch, result, text;
        if (atom.workspace.getActiveTextEditor() == null) {
          return;
        }
        if (this.fakeEditor.getActiveTextEditor() == null) {
          return;
        }
        this.removeMarkers();
        editor = this.getActiveEditor();
        if (!editor) {
          return;
        }
        if (editor.getLastSelection().isEmpty()) {
          return;
        }
        if (!this.isWordSelected(editor.getLastSelection())) {
          return;
        }
        this.selections = editor.getSelections();
        text = _.escapeRegExp(this.selections[0].getText());
        regex = new RegExp("\\S*\\w*\\b", 'gi');
        result = regex.exec(text);
        if (result == null) {
          return;
        }
        if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
          return;
        }
        regexFlags = 'g';
        if (atom.config.get('highlight-selected.ignoreCase')) {
          regexFlags = 'gi';
        }
        range = [[0, 0], editor.getEofBufferPosition()];
        this.ranges = [];
        regexSearch = result[0];
        if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
          regexSearch = "\\b" + regexSearch + "\\b";
        }
        return editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
          return function(result) {
            var className, decoration, marker;
            marker = editor.markBufferRange(result.range);
            className = _this.makeClasses(_this.showHighlightOnSelectedWord(result.range, _this.selections));
            decoration = editor.decorateMarker(marker, {
              type: 'highlight',
              "class": className
            });
            return _this.views.push(marker);
          };
        })(this));
      };

      MinimapHighlightSelectedView.prototype.makeClasses = function(inSelection) {
        var className;
        className = 'highlight-selected';
        if (inSelection) {
          className += ' selected';
        }
        return className;
      };

      MinimapHighlightSelectedView.prototype.subscribeToActiveTextEditor = function() {
        var editor, _ref1;
        if ((_ref1 = this.selectionSubscription) != null) {
          _ref1.dispose();
        }
        this.selectionSubscription = new CompositeDisposable;
        if (editor = this.getActiveEditor()) {
          this.selectionSubscription.add(editor.onDidAddSelection((function(_this) {
            return function() {
              return _this.handleSelection();
            };
          })(this)));
          this.selectionSubscription.add(editor.onDidChangeSelectionRange((function(_this) {
            return function() {
              return _this.handleSelection();
            };
          })(this)));
        }
        return this.handleSelection();
      };

      return MinimapHighlightSelectedView;

    })(HighlightedAreaView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFEYixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSwwR0FBQTtBQUFBLElBQUEsd0JBQUEsR0FBMkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixvQkFBL0IsQ0FBM0IsQ0FBQTtBQUFBLElBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFTLHdCQUF3QixDQUFDLElBQWxDLENBRnBCLENBQUE7QUFBQSxJQUdBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUyx3QkFBd0IsQ0FBQyxJQUF6QixHQUFnQyw0QkFBekMsQ0FIdEIsQ0FBQTtBQUFBLElBS007QUFDUyxNQUFBLG9CQUFFLE9BQUYsR0FBQTtBQUFZLFFBQVgsSUFBQyxDQUFBLFVBQUEsT0FBVSxDQUFaO01BQUEsQ0FBYjs7QUFBQSwyQkFFQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7ZUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQUEsRUFBSDtNQUFBLENBRmxCLENBQUE7O0FBQUEsMkJBSUEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBQUcsWUFBQSxLQUFBO2dFQUFtQixDQUFFLGFBQXJCLENBQUEsV0FBSDtNQUFBLENBSnJCLENBQUE7O0FBQUEs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

//# sourceURL=/home/sguenther/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected-view.coffee
