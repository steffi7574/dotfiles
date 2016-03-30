(function() {
  var Base, CopyFromLineAbove, CopyFromLineBelow, InsertLastInserted, InsertMode, InsertRegister,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Base = require('./base');

  InsertMode = (function(_super) {
    __extends(InsertMode, _super);

    InsertMode.extend(false);

    function InsertMode() {
      InsertMode.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return InsertMode;

  })(Base);

  InsertRegister = (function(_super) {
    __extends(InsertRegister, _super);

    function InsertRegister() {
      return InsertRegister.__super__.constructor.apply(this, arguments);
    }

    InsertRegister.extend();

    InsertRegister.prototype.hover = {
      icon: '"',
      emoji: '"'
    };

    InsertRegister.prototype.requireInput = true;

    InsertRegister.prototype.initialize = function() {
      return this.focusInput();
    };

    InsertRegister.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var selection, text, _i, _len, _ref, _results;
          _ref = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            selection = _ref[_i];
            text = _this.vimState.register.getText(_this.input, selection);
            _results.push(selection.insertText(text));
          }
          return _results;
        };
      })(this));
    };

    return InsertRegister;

  })(InsertMode);

  InsertLastInserted = (function(_super) {
    __extends(InsertLastInserted, _super);

    function InsertLastInserted() {
      return InsertLastInserted.__super__.constructor.apply(this, arguments);
    }

    InsertLastInserted.extend();

    InsertLastInserted.prototype.execute = function() {
      return this.editor.insertText(this.vimState.register.getText('.'));
    };

    return InsertLastInserted;

  })(InsertMode);

  CopyFromLineAbove = (function(_super) {
    __extends(CopyFromLineAbove, _super);

    function CopyFromLineAbove() {
      return CopyFromLineAbove.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineAbove.extend();

    CopyFromLineAbove.prototype.rowTranslation = -1;

    CopyFromLineAbove.prototype.getTextInScreenRange = function(range) {
      var bufferRange;
      bufferRange = this.editor.bufferRangeForScreenRange(range);
      return this.editor.getTextInBufferRange(bufferRange);
    };

    CopyFromLineAbove.prototype.execute = function() {
      var lastRow;
      lastRow = this.editor.getLastBufferRow();
      return this.editor.transact((function(_this) {
        return function() {
          var column, cursor, range, row, _i, _len, _ref, _ref1, _results;
          _ref = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cursor = _ref[_i];
            _ref1 = cursor.getScreenPosition(), row = _ref1.row, column = _ref1.column;
            row += _this.rowTranslation;
            if (!((0 <= row && row <= lastRow))) {
              continue;
            }
            range = [[row, column], [row, column + 1]];
            _results.push(cursor.selection.insertText(_this.getTextInScreenRange(range)));
          }
          return _results;
        };
      })(this));
    };

    return CopyFromLineAbove;

  })(InsertMode);

  CopyFromLineBelow = (function(_super) {
    __extends(CopyFromLineBelow, _super);

    function CopyFromLineBelow() {
      return CopyFromLineBelow.__super__.constructor.apply(this, arguments);
    }

    CopyFromLineBelow.extend();

    CopyFromLineBelow.prototype.rowTranslation = +1;

    return CopyFromLineBelow;

  })(CopyFromLineAbove);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2luc2VydC1tb2RlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSwwRkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVNO0FBQ0osaUNBQUEsQ0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQ2EsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsTUFBQSw2Q0FBQSxTQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUE7T0FGVTtJQUFBLENBRGI7O3NCQUFBOztLQUR1QixLQUZ6QixDQUFBOztBQUFBLEVBUU07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSw2QkFDQSxLQUFBLEdBQU87QUFBQSxNQUFBLElBQUEsRUFBTSxHQUFOO0FBQUEsTUFBVyxLQUFBLEVBQU8sR0FBbEI7S0FEUCxDQUFBOztBQUFBLDZCQUVBLFlBQUEsR0FBYyxJQUZkLENBQUE7O0FBQUEsNkJBSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxVQUFELENBQUEsRUFEVTtJQUFBLENBSlosQ0FBQTs7QUFBQSw2QkFPQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDZixjQUFBLHlDQUFBO0FBQUE7QUFBQTtlQUFBLDJDQUFBO2lDQUFBO0FBQ0UsWUFBQSxJQUFBLEdBQU8sS0FBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMs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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/insert-mode.coffee
