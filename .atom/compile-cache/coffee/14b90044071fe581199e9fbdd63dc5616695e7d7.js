(function() {
  var Range, SelectionWrapper, isLinewiseRange, swrap, _;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  isLinewiseRange = require('./utils').isLinewiseRange;

  SelectionWrapper = (function() {
    SelectionWrapper.prototype.scope = 'vim-mode-plus';

    function SelectionWrapper(selection) {
      this.selection = selection;
    }

    SelectionWrapper.prototype.getProperties = function() {
      var _ref;
      return (_ref = this.selection.marker.getProperties()[this.scope]) != null ? _ref : {};
    };

    SelectionWrapper.prototype.setProperties = function(newProp) {
      var prop;
      prop = {};
      prop[this.scope] = newProp;
      return this.selection.marker.setProperties(prop);
    };

    SelectionWrapper.prototype.resetProperties = function() {
      return this.setProperties(null);
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range) {
      if (range) {
        this.setBufferRange(range, {
          autoscroll: false
        });
        if (this.selection.isLastSelection()) {
          return this.selection.cursor.autoscroll();
        }
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.reverse = function() {
      var head, tail, _ref, _ref1;
      this.setReversedState(!this.selection.isReversed());
      _ref1 = (_ref = this.getProperties().characterwise) != null ? _ref : {}, head = _ref1.head, tail = _ref1.tail;
      if ((head != null) && (tail != null)) {
        return this.setProperties({
          characterwise: {
            head: tail,
            tail: head,
            reversed: this.selection.isReversed()
          }
        });
      }
    };

    SelectionWrapper.prototype.setReversedState = function(reversed) {
      return this.setBufferRange(this.getBufferRange(), {
        autoscroll: true,
        reversed: reversed,
        preserveFolds: true
      });
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, startRow, _i, _ref, _results;
      _ref = this.selection.getBufferRowRange(), startRow = _ref[0], endRow = _ref[1];
      return (function() {
        _results = [];
        for (var _i = startRow; startRow <= endRow ? _i <= endRow : _i >= endRow; startRow <= endRow ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      var endRow, startRow, _ref;
      _ref = this.selection.getBufferRowRange(), startRow = _ref[0], endRow = _ref[1];
      return endRow - startRow + 1;
    };

    SelectionWrapper.prototype.selectRowRange = function(rowRange) {
      var editor, endRow, rangeEnd, rangeStart, startRow;
      editor = this.selection.editor;
      startRow = rowRange[0], endRow = rowRange[1];
      rangeStart = editor.bufferRangeForBufferRow(startRow, {
        includeNewline: true
      });
      rangeEnd = editor.bufferRangeForBufferRow(endRow, {
        includeNewline: true
      });
      return this.setBufferRange(rangeStart.union(rangeEnd), {
        preserveFolds: true
      });
    };

    SelectionWrapper.prototype.expandOverLine = function(options) {
      var goalColumn, preserveGoalColumn;
      if (options == null) {
        options = {};
      }
      preserveGoalColumn = options.preserveGoalColumn;
      if (preserveGoalColumn) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      this.selectRowRange(this.selection.getBufferRowRange());
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.getBufferRangeForTailRow = function() {
      var endRow, row, startRow, _ref;
      _ref = this.selection.getBufferRowRange(), startRow = _ref[0], endRow = _ref[1];
      row = this.selection.isReversed() ? endRow : startRow;
      return this.selection.editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, end, start;
      if (this.isSingleRow() && this.isLinewise()) {
        return this.getBufferRangeForTailRow();
      } else {
        editor = this.selection.editor;
        start = this.selection.getTailScreenPosition();
        end = this.selection.isReversed() ? editor.clipScreenPosition(start.translate([0, -1]), {
          clip: 'backward'
        }) : editor.clipScreenPosition(start.translate([0, +1]), {
          clip: 'forward',
          wrapBeyondNewlines: true
        });
        return editor.bufferRangeForScreenRange([start, end]);
      }
    };

    SelectionWrapper.prototype.preserveCharacterwise = function() {
      var characterwise, endPoint, point;
      characterwise = this.detectCharacterwiseProperties().characterwise;
      endPoint = this.selection.isReversed() ? 'tail' : 'head';
      point = characterwise[endPoint].translate([0, -1]);
      characterwise[endPoint] = this.selection.editor.clipBufferPosition(point);
      return this.setProperties({
        characterwise: characterwise
      });
    };

    SelectionWrapper.prototype.detectCharacterwiseProperties = function() {
      return {
        characterwise: {
          head: this.selection.getHeadBufferPosition(),
          tail: this.selection.getTailBufferPosition(),
          reversed: this.selection.isReversed()
        }
      };
    };

    SelectionWrapper.prototype.getCharacterwiseHeadPosition = function() {
      var _ref;
      return (_ref = this.getProperties().characterwise) != null ? _ref.head : void 0;
    };

    SelectionWrapper.prototype.selectByProperties = function(properties) {
      var head, reversed, tail, _ref;
      _ref = properties.characterwise, head = _ref.head, tail = _ref.tail, reversed = _ref.reversed;
      this.setBufferRange([head, tail]);
      return this.setReversedState(reversed);
    };

    SelectionWrapper.prototype.restoreCharacterwise = function(options) {
      var characterwise, end, goalColumn, head, preserveGoalColumn, start, tail, _ref, _ref1;
      if (options == null) {
        options = {};
      }
      preserveGoalColumn = options.preserveGoalColumn;
      if (preserveGoalColumn) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      if (!(characterwise = this.getProperties().characterwise)) {
        return;
      }
      head = characterwise.head, tail = characterwise.tail;
      _ref = this.selection.isReversed() ? [head, tail] : [tail, head], start = _ref[0], end = _ref[1];
      _ref1 = this.selection.getBufferRowRange(), start.row = _ref1[0], end.row = _ref1[1];
      this.setBufferRange([start, end], {
        preserveFolds: true
      });
      if (this.selection.isReversed()) {
        this.reverse();
        this.selection.selectRight();
        this.reverse();
      } else {
        this.selection.selectRight();
      }
      this.resetProperties();
      if (goalColumn) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      if (options == null) {
        options = {};
      }
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      return this.selection.setBufferRange(range, options);
    };

    SelectionWrapper.prototype.isBlockwiseHead = function() {
      var _ref;
      return (_ref = this.getProperties().blockwise) != null ? _ref.head : void 0;
    };

    SelectionWrapper.prototype.isBlockwiseTail = function() {
      var _ref;
      return (_ref = this.getProperties().blockwise) != null ? _ref.tail : void 0;
    };

    SelectionWrapper.prototype.replace = function(text) {
      var originalText;
      originalText = this.selection.getText();
      this.selection.insertText(text);
      return originalText;
    };

    SelectionWrapper.prototype.lineTextForBufferRows = function(text) {
      var editor;
      editor = this.selection.editor;
      return this.getRows().map(function(row) {
        return editor.lineTextForBufferRow(row);
      });
    };

    SelectionWrapper.prototype.translate = function(translation, options) {
      var range;
      range = this.getBufferRange();
      range = range.translate.apply(range, translation);
      return this.setBufferRange(range, options);
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, startRow, _ref;
      _ref = this.selection.getBufferRowRange(), startRow = _ref[0], endRow = _ref[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewise = function() {
      return isLinewiseRange(this.getBufferRange());
    };

    SelectionWrapper.prototype.detectVisualModeSubmode = function() {
      switch (false) {
        case !this.isLinewise():
          return 'linewise';
        case !!this.selection.isEmpty():
          return 'characterwise';
        default:
          return null;
      }
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.setReversedState = function(editor, reversed) {
    return editor.getSelections().forEach(function(s) {
      return swrap(s).setReversedState(reversed);
    });
  };

  swrap.expandOverLine = function(editor) {
    return editor.getSelections().forEach(function(s) {
      return swrap(s).expandOverLine();
    });
  };

  swrap.reverse = function(editor) {
    return editor.getSelections().forEach(function(s) {
      return swrap(s).reverse();
    });
  };

  swrap.detectVisualModeSubmode = function(editor) {
    var results, s, selections;
    selections = editor.getSelections();
    results = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        s = selections[_i];
        _results.push(swrap(s).detectVisualModeSubmode());
      }
      return _results;
    })();
    if (results.every(function(r) {
      return r === 'linewise';
    })) {
      return 'linewise';
    } else if (results.some(function(r) {
      return r === 'characterwise';
    })) {
      return 'characterwise';
    } else {
      return null;
    }
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBREQsQ0FBQTs7QUFBQSxFQUVDLGtCQUFtQixPQUFBLENBQVEsU0FBUixFQUFuQixlQUZELENBQUE7O0FBQUEsRUFJTTtBQUNKLCtCQUFBLEtBQUEsR0FBTyxlQUFQLENBQUE7O0FBRWEsSUFBQSwwQkFBRSxTQUFGLEdBQUE7QUFBYyxNQUFiLElBQUMsQ0FBQSxZQUFBLFNBQVksQ0FBZDtJQUFBLENBRmI7O0FBQUEsK0JBSUEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLFVBQUEsSUFBQTt5RkFBNEMsR0FEL0I7SUFBQSxDQUpmLENBQUE7O0FBQUEsK0JBT0EsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO0FBQ2IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sRUFBUCxDQUFBO0FBQUEsTUFDQSxJQUFLLENBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTCxHQUFlLE9BRGYsQ0FBQTthQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWxCLENBQWdDLElBQWhDLEVBSGE7SUFBQSxDQVBmLENBQUE7O0FBQUEsK0JBWUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7YUFDZixJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFEZTtJQUFBLENBWmpCLENBQUE7O0FBQUEsK0JBZUEsb0JBQUEsR0FBc0IsU0FBQyxLQUFELEdBQUE7QUFDcEIsTUFBQSxJQUFHLEtBQUg7QUFDRSxRQUFBLElB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/selection-wrapper.coffee
