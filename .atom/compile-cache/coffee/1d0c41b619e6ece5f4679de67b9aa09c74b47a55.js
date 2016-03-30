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
      var selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        _results.push(fn(selection));
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
      return this.eachSelection(function(selection) {
        var prop;
        prop = {};
        if (head != null) {
          prop.head = selection === head;
        }
        if (tail != null) {
          prop.tail = selection === tail;
        }
        return swrap(selection).setProperties({
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
      return _.detect(this.editor.getSelections(), function(selection) {
        return swrap(selection).isBlockwiseTail();
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
      this.eachSelection(function(selection) {
        return selection.cursor.setBufferPosition(selection.getBufferRange().start);
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

    BlockwiseInsertAtBeginningOfLine.prototype.initialize = function() {
      return this.operator = this["new"](this.delegateTo);
    };

    BlockwiseInsertAtBeginningOfLine.prototype.execute = function() {
      var which;
      which = this.after ? 'end' : 'start';
      this.eachSelection(function(selection) {
        var point;
        point = selection.getBufferRange()[which];
        return selection.cursor.setBufferPosition(point);
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
      return this.eachSelection(function(selection) {
        if (selection.isEmpty()) {
          return selection.destroy();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3Zpc3VhbC1ibG9ja3dpc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBSQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFNTTtBQUNKLHNDQUFBLENBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUNhLElBQUEseUJBQUEsR0FBQTtBQUNYLE1BQUEsa0RBQUEsU0FBQSxDQUFBLENBQUE7O1FBQ0EsSUFBQyxDQUFBO09BRlU7SUFBQSxDQURiOztBQUFBLDhCQUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFFVixNQUFBLElBQU8sc0JBQVA7ZUFDRSxJQUFDLENBQUEsYUFBRCxDQUFlO0FBQUEsVUFBQyxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFQO0FBQUEsVUFBcUIsSUFBQSxFQUFNLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBM0I7U0FBZixFQURGO09BRlU7SUFBQSxDQUxaLENBQUE7O0FBQUEsOEJBVUEsYUFBQSxHQUFlLFNBQUMsRUFBRCxHQUFBO0FBQ2IsVUFBQSxtQ0FBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTs2QkFBQTtBQUNFLHNCQUFBLEVBQUEsQ0FBRyxTQUFILEVBQUEsQ0FERjtBQUFBO3NCQURhO0lBQUEsQ0FWZixDQUFBOztBQUFBLDhCQWNBLFVBQUEsR0FBWSxTQUFDLEVBQUQsR0FBQTthQUNWLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFSLEVBQXFCLFNBQUEsR0FBQTtlQUNuQixFQUFBLENBQUEsRUFEbUI7TUFBQSxDQUFyQixFQURVO0lBQUEsQ0FkWixDQUFBOztBQUFBLDhCQWtCQSxhQUFBLEdBQWUsU0FBQyxJQUFELEdBQUE7QUFDYixVQUFBLFVBQUE7QUFBQSxNQURlLFlBQUEsTUFBTSxZQUFBLElBQ3JCLENBQUE7YUFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQUMsU0FBRCxHQUFBO0FBQ2IsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sRUFBUCxDQUFBO0FBQ0EsUUFBQSxJQUFtQyxZQUFuQztBQUFBLFVBQUEsSUFBSSxDQUFDLElBQUwsR0FBYSxTQUFBLEtBQWEsSUFBMUIsQ0FBQTtTQURBO0FBRUEsUUFBQSxJQUFtQyxZQUFuQztBQUFBLFVBQUEsSUFBSSxDQUFDLElBQUwsR0FBYSxTQUFBLEtBQWEsSUFBMUIsQ0FBQTtTQUZBO2VBR0EsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxhQUFqQixDQUErQjtBQUFBLFVBQUEsU0FBQSxFQUFXLElBQVg7U0FBL0IsRUFKYTtNQUFBLENBQWYsRUFEYTtJQUFBLENBbEJmLENBQUE7O0FBQUEsOEJBeUJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLE1BQXhCLEtBQWtDLEVBRHRCO0lBQUEsQ0F6QmQsQ0FBQTs7QUFBQSw4QkE0QkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxNQUFNLENBQUMsb0NBQVIsQ0FBQSxDQUErQyxDQUFBLENBQUEsRUFEekM7SUFBQSxDQTVCUixDQUFBOztBQUFBLDhCQStCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ1QsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLG9DQUFSLENBQUEsQ0FBUCxFQURTO0lBQUEsQ0EvQlgsQ0FBQTs7QUFBQSw4QkFrQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLENBQUMsQ0FBQSxJQUFLLENBQUEsWUFBRCxDQUFBLENBQUwsQ0FBQSxJQUEwQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsS0FBYyxJQUFDLENBQUEsU0FBRCxDQUFBLEVBRDlCO0lBQUEsQ0FsQ1osQ0FBQTs7QUFBQSw4QkFxQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBRyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUg7ZUFBc0IsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUF0QjtPQUFBLE1BQUE7ZUFBcUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxFQUFyQztPQURPO0lBQUEsQ0FyQ1QsQ0FBQTs7QUFBQSw4QkF3Q0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBVCxFQUFrQyxTQUFDLFNBQUQsR0FBQTtlQUNoQyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLGVBQWpCLENBQUEsRUFEZ0M7TUFBQSxDQUFsQyxFQURPO0lBQUEsQ0F4Q1QsQ0FBQTs7QUFBQSw4QkE0Q0EsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsZ0JBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxpQkFBVixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUF6QyxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsaUJBQWIsQ0FBQSxDQUFpQyxDQUFBLENBQUEsQ0FEMUMsQ0FBQTthQUVBLENBQUMsUUFBRCxFQUFXLE1BQVgsRUFIaUI7SUFBQSxDQTVDbkIsQ0FBQTs7MkJBQUE7O0tBRDRCLEtBTjlCLENBQUE7O0FBQUEsRUF3RE07QUFDSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsZ0NBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQSxDQUFBLElBQVEsQ0FBQSxZQUFELENBQUEsQ0FBUDtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQUQsQ0FBZTtBQUFBLFVBQUMsSUFBQSxFQUFNLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBUDtBQUFBLFVBQW1CLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQXpCO1NBQWYsQ0FBQSxDQURGO09BQUE7YUFFQSxJQUFDLENBQUEsS0FBQSxDQUFELENBQUssbUJBQUwsQ0FBeUIsQ0FBQyxPQUExQixDQUFBLEVBSE87SUFBQSxDQURULENBQUE7OzZCQUFBOztLQUQ4QixnQkF4RGhDLENBQUE7O0FBQUEsRUErRE07QUFDSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsZ0NBQ0EsU0FBQSxHQUFXLE9BRFgsQ0FBQTs7QUFBQSxnQ0FHQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFlLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBZjtBQUFBLGVBQU8sSUFBUCxDQUFBO09BQUE7QUFDQSxjQUFPLElBQUMsQ0FBQSxTQUFSO0FBQUEsYUFDTyxPQURQO2lCQUNvQixDQUFBLElBQUssQ0FBQSxVQUFELENBQUEsRUFEeEI7QUFBQSxhQUVPLE9BRlA7aUJBRW9CLElBQUMsQ0FBQSxVQUFELENBQUEsRUFGcEI7QUFBQSxPQUZXO0lBQUEsQ0FIYixDQUFBOztBQUFBLGdDQVNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNWLFVBQUEsSUFBRyxLQUFDLENBQUEsV0FBRCxDQUFBLENBQUg7QUFDRSxZQUFBLEtBQUMsQ0FBQSxNQUFPLENBQUMsY0FBQSxHQUFjLEtBQUMsQ0FBQSxTQUFoQixDQUFSLENBQUEsQ0FBQSxDQUFBO21CQUNBLEtBQUssQ0FBQyxnQkFBTixDQUF1QixLQUFDLENBQUEsTUFBeEIsRUFBZ0MsS0FBQyxDQUFBLE9BQUQsQ0FBQSxDQUFVLENBQUMsVUFBWCxDQUFBLENBQWhDLEVBRkY7V0FBQSxNQUFBO21CQUlFLEtBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLE9BQVgsQ0FBQSxFQUpGO1dBRFU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBQUEsQ0FBQTthQU1BLElBQUMsQ0FBQSxhQUFELENBQWU7QUFBQSxRQUFDLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVA7QUFBQSxRQUFtQixJQUFBLEVBQU0sSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUF6QjtPQUFmLEVBUE87SUFBQSxDQVRULENBQUE7OzZCQUFBOztLQUQ4QixnQkEvRGhDLENBQUE7O0FBQUEsRUFrRk07QUFDSixzQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxlQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSw4QkFDQSxTQUFBLEdBQVcsT0FEWCxDQUFBOzsyQkFBQTs7S0FENEIsa0JBbEY5QixDQUFBOztBQUFBLEVBc0ZNO0FBQ0osMkRBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsb0NBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztBQUFBLG1EQUNBLFVBQUEsR0FBWSw2QkFEWixDQUFBOztBQUFBLG1EQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxLQUFBLENBQUQsQ0FBSyxJQUFDLENBQUEsVUFBTixFQURGO0lBQUEsQ0FIWixDQUFBOztBQUFBLG1EQU1BLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLFVBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsU0FBQyxTQUFELEdBQUE7ZUFDYixTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFtQyxTQUFTLENBQUMsY0FBVixDQUFBLENBQTBCLENBQUMsS0FBOUQsRUFEYTtNQUFBLENBQWYsQ0FBQSxDQUFBO0FBQUEsTUFFQSxVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFBLENBRmIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQW1CLFFBQW5CLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQUEsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBQSxDQUxBLENBQUE7YUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLFVBQWhDLEVBUE87SUFBQSxDQU5ULENBQUE7O2dEQUFBOztLQURpRCxnQkF0Rm5ELENBQUE7O0FBQUEsRUFzR007QUFDSiwyREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxvQ0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsbURBQ0EsVUFBQSxHQUFZLElBRFosQ0FBQTs7QUFBQSxtREFFQSxVQUFBLEdBQVksNkJBRlosQ0FBQTs7QUFBQSxtREFJQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsS0FBQSxDQUFELENBQUssSUFBQyxDQUFBLFVBQU4sRUFERjtJQUFBLENBSlosQ0FBQTs7Z0RBQUE7O0tBRGlELHFDQXRHbkQsQ0FBQTs7QUFBQSxFQThHTTtBQUNKLHVEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdDQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSwrQ0FDQSxVQUFBLEdBQVksb0JBRFosQ0FBQTs7QUFBQSwrQ0FFQSxVQUFBLEdBQVksSUFGWixDQUFBOztBQUFBLCtDQUdBLEtBQUEsR0FBTyxLQUhQLENBQUE7O0FBQUEsK0NBS0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLEtBQUEsQ0FBRCxDQUFLLElBQUMsQ0FBQSxVQUFOLEVBREY7SUFBQSxDQUxaLENBQUE7O0FBQUEsK0NBUUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFXLElBQUMsQ0FBQSxLQUFKLEdBQWUsS0FBZixHQUEwQixPQUFsQyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQUMsU0FBRCxHQUFBO0FBQ2IsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLEdBQVEsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEyQixDQUFBLEtBQUEsQ0FBbkMsQ0FBQTtlQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQW1DLEtBQW5DLEVBRmE7TUFBQSxDQUFmLENBREEsQ0FBQTthQU1BLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLEVBUE87SUFBQSxDQVJULENBQUE7OzRDQUFBOztLQUQ2QyxnQkE5Ry9DLENBQUE7O0FBQUEsRUFnSU07QUFDSixvREFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSw2QkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O0FBQUEsNENBQ0EsS0FBQSxHQUFPLElBRFAsQ0FBQTs7eUNBQUE7O0tBRDBDLGlDQWhJNUMsQ0FBQTs7QUFBQSxFQW9JTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsOEJBQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsdUZBQUE7QUFBQSxNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQUEsQ0FBWixDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsUUFBQSxHQUFXLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FEekIsQ0FBQTtBQUFBLE1BRUEsT0FBZSxTQUFTLENBQUMsY0FBVixDQUFBLENBQWYsRUFBQyxhQUFBLEtBQUQsRUFBUSxXQUFBLEdBRlIsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEtBQUssQ0FBQyxNQUhwQixDQUFBO0FBQUEsTUFJQSxTQUFBLEdBQVksR0FBRyxDQUFDLE1BSmhCLENBQUE7QUFNQSxNQUFBLElBQUcsV0FBQSxJQUFlLFNBQWxCO0FBQ0UsUUFBQSxRQUFBLEdBQVcsQ0FBQSxRQUFYLENBQUE7QUFBQSxRQUNBLFdBQUEsSUFBZSxDQURmLENBQUE7QUFBQSxRQUVBLFNBQUEsSUFBYSxDQUZiLENBREY7T0FOQTtBQUFBLE1BV0EsTUFBQTs7QUFBVTthQUFrRCw2SEFBbEQsR0FBQTtBQUFBLHdCQUFBLENBQUMsQ0FBQyxHQUFELEVBQU0sV0FBTixDQUFELEVBQXFCLENBQUMsR0FBRCxFQUFNLFNBQU4sQ0FBckIsRUFBQSxDQUFBO0FBQUE7O1VBWFYsQ0FBQTtBQWNBLE1BQUEsSUFBQSxDQUFBLFNBQWdCLENBQUMsa0JBQVYsQ0FBQSxDQUFQO0FBQ0UsUUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLE1BQWhDLEVBQXdDO0FBQUEsVUFBQyxVQUFBLFFBQUQ7U0FBeEMsQ0FBQSxDQURGO09BZEE7QUFnQkEsTUFBQSxJQUFHLFdBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxhQUFELENBQWU7QUFBQSxVQUFDLElBQUEsRUFBTSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVA7QUFBQSxVQUFrQixJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUF4QjtTQUFmLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUMsQ0FBQSxhQUFELENBQWU7QUFBQSxVQUFDLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVA7QUFBQSxVQUFxQixJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUEzQjtTQUFmLENBQUEsQ0FIRjtPQWhCQTthQW9CQSxJQUFDLENBQUEsYUFBRCxDQUFlLFNBQUMsU0FBRCxHQUFBO0FBQ2IsUUFBQSxJQUF1QixTQUFTLENBQUMsT0FBVixDQUFBLENBQXZCO2lCQUFBLFNBQVMsQ0FBQyxPQUFWLENBQUEsRUFBQTtTQURhO01BQUEsQ0FBZixFQXJCTztJQUFBLENBRFQsQ0FBQTs7MkJBQUE7O0tBRDRCLGdCQXBJOUIsQ0FBQTs7QUFBQSxFQThKTTtBQUNKLG9EQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLDZCQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDRDQUVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGlIQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFYLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBRCxDQUFBLENBRFAsQ0FBQTtBQUFBLE1BRUEsY0FBQSxHQUFpQixJQUFJLENBQUMsVUFBTCxDQUFBLENBRmpCLENBQUE7QUFBQSxNQUdBLE9BQXFCLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBQXJCLEVBQUMsa0JBQUQsRUFBVyxnQkFIWCxDQUFBO0FBQUEsTUFJQSxRQUEyRCxJQUFJLENBQUMsY0FBTCxDQUFBLENBQTNELGlCQUFDLE9BQWdCLG9CQUFSLE9BQVQsaUJBQStCLEtBQWMsa0JBQVIsT0FKckMsQ0FBQTtBQUtBLE1BQUEsSUFBRyxRQUFBLEtBQWMsY0FBakI7QUFDRSxRQUFBLFFBQTJCLENBQUMsU0FBRCxFQUFZLFdBQVosQ0FBM0IsRUFBQyxzQkFBRCxFQUFjLG9CQUFkLENBQUE7QUFBQSxRQUNBLFdBQUEsSUFBZSxDQURmLENBQUE7QUFBQSxRQUVBLFNBQUEsSUFBYSxDQUZiLENBREY7T0FMQTtBQUFBLE1BU0EsS0FBQSxHQUFRLENBQUMsQ0FBQyxRQUFELEVBQVcsV0FBWCxDQUFELEVBQTBCLENBQUMsTUFBRCxFQUFTLFNBQVQsQ0FBMUIsQ0FUUixDQUFBO2FBVUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUErQixLQUEvQixFQUFzQztBQUFBLFFBQUMsVUFBQSxRQUFEO09BQXRDLEVBWE87SUFBQSxDQUZULENBQUE7O3lDQUFBOztLQUQwQyxnQkE5SjVDLENBQUE7O0FBQUEsRUE4S0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFDLGlCQUFBLGVBQUQ7QUFBQSxJQUFrQiwrQkFBQSw2QkFBbEI7R0E5S2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/visual-blockwise.coffee
