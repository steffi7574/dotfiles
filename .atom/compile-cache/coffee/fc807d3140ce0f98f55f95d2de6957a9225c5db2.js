(function() {
  var Base, BlockwiseChangeToLastCharacterOfLine, BlockwiseDeleteToLastCharacterOfLine, BlockwiseInsertAfterEndOfLine, BlockwiseInsertAtBeginningOfLine, BlockwiseMoveDown, BlockwiseMoveUp, BlockwiseOtherEnd, BlockwiseRestoreCharacterwise, BlockwiseSelect, Range, VisualBlockwise, swrap, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Range = require('atom').Range;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  VisualBlockwise = (function(_super) {
    __extends(VisualBlockwise, _super);

    VisualBlockwise.extend(false);

    function VisualBlockwise() {
      VisualBlockwise.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    VisualBlockwise.prototype.initialize = function() {
      if (this.getTail() == null) {
        return this.setProperties({
          head: this.getBottom(),
          tail: this.getTop()
        });
      }
    };

    VisualBlockwise.prototype.eachSelection = function(fn) {
      var s, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        _results.push(fn(s));
      }
      return _results;
    };

    VisualBlockwise.prototype.countTimes = function(fn) {
      return _.times(this.getCount(), function() {
        return fn();
      });
    };

    VisualBlockwise.prototype.setProperties = function(_arg) {
      var head, tail;
      head = _arg.head, tail = _arg.tail;
      return this.eachSelection(function(s) {
        var prop;
        prop = {};
        if (head != null) {
          prop.head = s === head;
        }
        if (tail != null) {
          prop.tail = s === tail;
        }
        return swrap(s).setProperties({
          blockwise: prop
        });
      });
    };

    VisualBlockwise.prototype.isSingleLine = function() {
      return this.editor.getSelections().length === 1;
    };

    VisualBlockwise.prototype.getTop = function() {
      return this.editor.getSelectionsOrderedByBufferPosition()[0];
    };

    VisualBlockwise.prototype.getBottom = function() {
      return _.last(this.editor.getSelectionsOrderedByBufferPosition());
    };

    VisualBlockwise.prototype.isReversed = function() {
      return (!this.isSingleLine()) && this.getTail() === this.getBottom();
    };

    VisualBlockwise.prototype.getHead = function() {
      if (this.isReversed()) {
        return this.getTop();
      } else {
        return this.getBottom();
      }
    };

    VisualBlockwise.prototype.getTail = function() {
      return _.detect(this.editor.getSelections(), function(s) {
        return swrap(s).isBlockwiseTail();
      });
    };

    VisualBlockwise.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getTop().getBufferRowRange()[0];
      endRow = this.getBottom().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    return VisualBlockwise;

  })(Base);

  BlockwiseOtherEnd = (function(_super) {
    __extends(BlockwiseOtherEnd, _super);

    function BlockwiseOtherEnd() {
      return BlockwiseOtherEnd.__super__.constructor.apply(this, arguments);
    }

    BlockwiseOtherEnd.extend();

    BlockwiseOtherEnd.prototype.execute = function() {
      if (!this.isSingleLine()) {
        this.setProperties({
          head: this.getTail(),
          tail: this.getHead()
        });
      }
      return this["new"]('ReverseSelections').execute();
    };

    return BlockwiseOtherEnd;

  })(VisualBlockwise);

  BlockwiseMoveDown = (function(_super) {
    __extends(BlockwiseMoveDown, _super);

    function BlockwiseMoveDown() {
      return BlockwiseMoveDown.__super__.constructor.apply(this, arguments);
    }

    BlockwiseMoveDown.extend();

    BlockwiseMoveDown.prototype.direction = 'Below';

    BlockwiseMoveDown.prototype.isExpanding = function() {
      if (this.isSingleLine()) {
        return true;
      }
      switch (this.direction) {
        case 'Below':
          return !this.isReversed();
        case 'Above':
          return this.isReversed();
      }
    };

    BlockwiseMoveDown.prototype.execute = function() {
      this.countTimes((function(_this) {
        return function() {
          if (_this.isExpanding()) {
            _this.editor["addSelection" + _this.direction]();
            return swrap.setReversedState(_this.editor, _this.getTail().isReversed());
          } else {
            return _this.getHead().destroy();
          }
        };
      })(this));
      return this.setProperties({
        head: this.getHead(),
        tail: this.getTail()
      });
    };

    return BlockwiseMoveDown;

  })(VisualBlockwise);

  BlockwiseMoveUp = (function(_super) {
    __extends(BlockwiseMoveUp, _super);

    function BlockwiseMoveUp() {
      return BlockwiseMoveUp.__super__.constructor.apply(this, arguments);
    }

    BlockwiseMoveUp.extend();

    BlockwiseMoveUp.prototype.direction = 'Above';

    return BlockwiseMoveUp;

  })(BlockwiseMoveDown);

  BlockwiseDeleteToLastCharacterOfLine = (function(_super) {
    __extends(BlockwiseDeleteToLastCharacterOfLine, _super);

    function BlockwiseDeleteToLastCharacterOfLine() {
      return BlockwiseDeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    BlockwiseDeleteToLastCharacterOfLine.extend();

    BlockwiseDeleteToLastCharacterOfLine.prototype.delegateTo = 'DeleteToLastCharacterOfLine';

    BlockwiseDeleteToLastCharacterOfLine.prototype.initialize = function() {
      return this.operator = this["new"](this.delegateTo);
    };

    BlockwiseDeleteToLastCharacterOfLine.prototype.execute = function() {
      var finalPoint;
      this.eachSelection(function(s) {
        return s.cursor.setBufferPosition(s.getBufferRange().start);
      });
      finalPoint = this.getTop().cursor.getBufferPosition();
      this.vimState.activate('normal');
      this.operator.execute();
      this.editor.clearSelections();
      return this.editor.setCursorBufferPosition(finalPoint);
    };

    return BlockwiseDeleteToLastCharacterOfLine;

  })(VisualBlockwise);

  BlockwiseChangeToLastCharacterOfLine = (function(_super) {
    __extends(BlockwiseChangeToLastCharacterOfLine, _super);

    function BlockwiseChangeToLastCharacterOfLine() {
      return BlockwiseChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    BlockwiseChangeToLastCharacterOfLine.extend();

    BlockwiseChangeToLastCharacterOfLine.prototype.recordable = true;

    BlockwiseChangeToLastCharacterOfLine.prototype.delegateTo = 'ChangeToLastCharacterOfLine';

    BlockwiseChangeToLastCharacterOfLine.prototype.getCheckpoint = function() {
      return this.operator.getCheckpoint();
    };

    BlockwiseChangeToLastCharacterOfLine.prototype.initialize = function() {
      return this.operator = this["new"](this.delegateTo);
    };

    return BlockwiseChangeToLastCharacterOfLine;

  })(BlockwiseDeleteToLastCharacterOfLine);

  BlockwiseInsertAtBeginningOfLine = (function(_super) {
    __extends(BlockwiseInsertAtBeginningOfLine, _super);

    function BlockwiseInsertAtBeginningOfLine() {
      return BlockwiseInsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    BlockwiseInsertAtBeginningOfLine.extend();

    BlockwiseInsertAtBeginningOfLine.prototype.delegateTo = 'ActivateInsertMode';

    BlockwiseInsertAtBeginningOfLine.prototype.recordable = true;

    BlockwiseInsertAtBeginningOfLine.prototype.after = false;

    BlockwiseInsertAtBeginningOfLine.prototype.getCheckpoint = function() {
      return this.operator.getCheckpoint();
    };

    BlockwiseInsertAtBeginningOfLine.prototype.initialize = function() {
      return this.operator = this["new"](this.delegateTo);
    };

    BlockwiseInsertAtBeginningOfLine.prototype.execute = function() {
      var which;
      which = this.after ? 'end' : 'start';
      this.eachSelection(function(s) {
        return s.cursor.setBufferPosition(s.getBufferRange()[which]);
      });
      return this.operator.execute();
    };

    return BlockwiseInsertAtBeginningOfLine;

  })(VisualBlockwise);

  BlockwiseInsertAfterEndOfLine = (function(_super) {
    __extends(BlockwiseInsertAfterEndOfLine, _super);

    function BlockwiseInsertAfterEndOfLine() {
      return BlockwiseInsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    BlockwiseInsertAfterEndOfLine.extend();

    BlockwiseInsertAfterEndOfLine.prototype.after = true;

    return BlockwiseInsertAfterEndOfLine;

  })(BlockwiseInsertAtBeginningOfLine);

  BlockwiseSelect = (function(_super) {
    __extends(BlockwiseSelect, _super);

    function BlockwiseSelect() {
      return BlockwiseSelect.__super__.constructor.apply(this, arguments);
    }

    BlockwiseSelect.extend(false);

    BlockwiseSelect.prototype.execute = function() {
      var end, endColumn, ranges, reversed, row, selection, start, startColumn, wasReversed, _ref;
      selection = this.editor.getLastSelection();
      wasReversed = reversed = selection.isReversed();
      _ref = selection.getScreenRange(), start = _ref.start, end = _ref.end;
      startColumn = start.column;
      endColumn = end.column;
      if (startColumn >= endColumn) {
        reversed = !reversed;
        startColumn += 1;
        endColumn -= 1;
      }
      ranges = (function() {
        var _i, _ref1, _ref2, _results;
        _results = [];
        for (row = _i = _ref1 = start.row, _ref2 = end.row; _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; row = _ref1 <= _ref2 ? ++_i : --_i) {
          _results.push([[row, startColumn], [row, endColumn]]);
        }
        return _results;
      })();
      if (!selection.isSingleScreenLine()) {
        this.editor.setSelectedScreenRanges(ranges, {
          reversed: reversed
        });
      }
      if (wasReversed) {
        this.setProperties({
          head: this.getTop(),
          tail: this.getBottom()
        });
      } else {
        this.setProperties({
          head: this.getBottom(),
          tail: this.getTop()
        });
      }
      return this.eachSelection(function(s) {
        if (s.isEmpty()) {
          return s.destroy();
        }
      });
    };

    return BlockwiseSelect;

  })(VisualBlockwise);

  BlockwiseRestoreCharacterwise = (function(_super) {
    __extends(BlockwiseRestoreCharacterwise, _super);

    function BlockwiseRestoreCharacterwise() {
      return BlockwiseRestoreCharacterwise.__super__.constructor.apply(this, arguments);
    }

    BlockwiseRestoreCharacterwise.extend(false);

    BlockwiseRestoreCharacterwise.prototype.execute = function() {
      var endColumn, endRow, head, headIsReversed, range, reversed, startColumn, startRow, _ref, _ref1, _ref2, _ref3, _ref4;
      reversed = this.isReversed();
      head = this.getHead();
      headIsReversed = head.isReversed();
      _ref = this.getBufferRowRange(), startRow = _ref[0], endRow = _ref[1];
      _ref1 = head.getBufferRange(), (_ref2 = _ref1.start, startColumn = _ref2.column), (_ref3 = _ref1.end, endColumn = _ref3.column);
      if (reversed !== headIsReversed) {
        _ref4 = [endColumn, startColumn], startColumn = _ref4[0], endColumn = _ref4[1];
        startColumn -= 1;
        endColumn += 1;
      }
      range = [[startRow, startColumn], [endRow, endColumn]];
      return this.editor.setSelectedBufferRange(range, {
        reversed: reversed
      });
    };

    return BlockwiseRestoreCharacterwise;

  })(VisualBlockwise);

  module.exports = {
    BlockwiseSelect: BlockwiseSelect,
    BlockwiseRestoreCharacterwise: BlockwiseRestoreCharacterwise
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3Zpc3VhbC1ibG9ja3dpc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBSQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFNTTtBQUNKLHNDQUFBLENBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUNhLElBQUEseUJBQUEsR0FBQTtBQUNYLE1BQUEsa0RBQUEsU0FBQSxDQUFBLENBQUE7O1FBQ0EsSUFBQyxDQUFBO09BRlU7SUFBQSxDQURiOztBQUFBLDhCQUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFFVixNQUFBLElBQU8sc0JBQVA7ZUFDRSxJQUFDLENBQUEsYUFBRCxDQUFlO0FBQUEsVUFBQyxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFQO0FBQUEsVUFBcUIsSUFBQSxFQUFNLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBM0I7U0FBZixFQURGO09BRlU7SUFBQSxDQUxaLENBQUE7O0FBQUEsOEJBVUEsYUFBQSxHQUFlLFNBQUMsRUFBRCxHQUFBO0FBQ2IsVUFBQSwyQkFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTtxQkFBQTtBQUNFLHNCQUFBLEVBQUEsQ0FBRyxDQUFILEVBQUEsQ0FERjtBQUFBO3NCQURhO0lBQUEsQ0FWZixDQUFBOztB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/visual-blockwise.coffee
