(function() {
  var Base, MaximizePane, Misc, Range, Redo, ReplaceModeBackspace, ReverseSelections, ToggleFold, Undo, isLinewiseRange, mergeIntersectingRanges, pointIsAtEndOfLine, settings, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  Base = require('./base');

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  _ = require('underscore-plus');

  _ref = require('./utils'), isLinewiseRange = _ref.isLinewiseRange, pointIsAtEndOfLine = _ref.pointIsAtEndOfLine, mergeIntersectingRanges = _ref.mergeIntersectingRanges;

  Misc = (function(_super) {
    __extends(Misc, _super);

    Misc.extend(false);

    function Misc() {
      Misc.__super__.constructor.apply(this, arguments);
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    return Misc;

  })(Base);

  ReverseSelections = (function(_super) {
    __extends(ReverseSelections, _super);

    function ReverseSelections() {
      return ReverseSelections.__super__.constructor.apply(this, arguments);
    }

    ReverseSelections.extend();

    ReverseSelections.prototype.execute = function() {
      return swrap.reverse(this.editor);
    };

    return ReverseSelections;

  })(Misc);

  Undo = (function(_super) {
    __extends(Undo, _super);

    function Undo() {
      return Undo.__super__.constructor.apply(this, arguments);
    }

    Undo.extend();

    Undo.prototype.flash = function(ranges, klass, timeout) {
      var m, markers, options, _i, _len;
      options = {
        type: 'highlight',
        "class": "vim-mode-plus-flash " + klass
      };
      markers = ranges.map((function(_this) {
        return function(r) {
          return _this.editor.markBufferRange(r);
        };
      })(this));
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        m = markers[_i];
        this.editor.decorateMarker(m, options);
      }
      return setTimeout(function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
          m = markers[_j];
          _results.push(m.destroy());
        }
        return _results;
      }, timeout);
    };

    Undo.prototype.saveRangeAsMarker = function(markers, range) {
      if (_.all(markers, function(m) {
        return !m.getBufferRange().intersectsWith(range);
      })) {
        return markers.push(this.editor.markBufferRange(range));
      }
    };

    Undo.prototype.trimEndOfLineRange = function(range) {
      var start;
      start = range.start;
      if ((start.column !== 0) && pointIsAtEndOfLine(this.editor, start)) {
        return range.traverse([+1, 0], [0, 0]);
      } else {
        return range;
      }
    };

    Undo.prototype.mapToChangedRanges = function(list, fn) {
      var ranges;
      ranges = list.map(function(e) {
        return fn(e);
      });
      return mergeIntersectingRanges(ranges).map((function(_this) {
        return function(r) {
          return _this.trimEndOfLineRange(r);
        };
      })(this));
    };

    Undo.prototype.mutateWithTrackingChanges = function(fn) {
      var disposable, firstAdded, lastRemoved, markersAdded, range, rangesAdded, rangesRemoved;
      markersAdded = [];
      rangesRemoved = [];
      disposable = this.editor.getBuffer().onDidChange((function(_this) {
        return function(_arg) {
          var newRange, oldRange;
          oldRange = _arg.oldRange, newRange = _arg.newRange;
          if (!oldRange.isEmpty()) {
            rangesRemoved.push(oldRange);
          }
          if (!newRange.isEmpty()) {
            return _this.saveRangeAsMarker(markersAdded, newRange);
          }
        };
      })(this));
      this.mutate();
      disposable.dispose();
      rangesAdded = this.mapToChangedRanges(markersAdded, function(m) {
        return m.getBufferRange();
      });
      markersAdded.forEach(function(m) {
        return m.destroy();
      });
      rangesRemoved = this.mapToChangedRanges(rangesRemoved, function(r) {
        return r;
      });
      firstAdded = rangesAdded[0];
      lastRemoved = _.last(rangesRemoved);
      range = (firstAdded != null) && (lastRemoved != null) ? firstAdded.start.isLessThan(lastRemoved.start) ? firstAdded : lastRemoved : firstAdded || lastRemoved;
      if (range != null) {
        fn(range);
      }
      if (settings.get('flashOnUndoRedo')) {
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var timeout;
            timeout = settings.get('flashOnUndoRedoDuration');
            _this.flash(rangesRemoved, 'removed', timeout);
            return _this.flash(rangesAdded, 'added', timeout);
          };
        })(this));
      }
    };

    Undo.prototype.execute = function() {
      var selection, _i, _len, _ref1;
      this.mutateWithTrackingChanges((function(_this) {
        return function(_arg) {
          var end, start;
          start = _arg.start, end = _arg.end;
          _this.vimState.mark.set('[', start);
          _this.vimState.mark.set(']', end);
          if (settings.get('setCursorToStartOfChangeOnUndoRedo')) {
            return _this.editor.setCursorBufferPosition(start);
          }
        };
      })(this));
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        selection.clear();
      }
      return this.activateMode('normal');
    };

    Undo.prototype.mutate = function() {
      return this.editor.undo();
    };

    return Undo;

  })(Misc);

  Redo = (function(_super) {
    __extends(Redo, _super);

    function Redo() {
      return Redo.__super__.constructor.apply(this, arguments);
    }

    Redo.extend();

    Redo.prototype.mutate = function() {
      return this.editor.redo();
    };

    return Redo;

  })(Undo);

  ToggleFold = (function(_super) {
    __extends(ToggleFold, _super);

    function ToggleFold() {
      return ToggleFold.__super__.constructor.apply(this, arguments);
    }

    ToggleFold.extend();

    ToggleFold.prototype.execute = function() {
      var row;
      row = this.editor.getCursorBufferPosition().row;
      return this.editor.toggleFoldAtBufferRow(row);
    };

    return ToggleFold;

  })(Misc);

  ReplaceModeBackspace = (function(_super) {
    __extends(ReplaceModeBackspace, _super);

    function ReplaceModeBackspace() {
      return ReplaceModeBackspace.__super__.constructor.apply(this, arguments);
    }

    ReplaceModeBackspace.extend();

    ReplaceModeBackspace.prototype.execute = function() {
      return this.editor.getSelections().forEach((function(_this) {
        return function(selection) {
          var char;
          char = _this.vimState.modeManager.getReplacedCharForSelection(selection);
          if (char != null) {
            selection.selectLeft();
            if (!selection.insertText(char).isEmpty()) {
              return selection.cursor.moveLeft();
            }
          }
        };
      })(this));
    };

    return ReplaceModeBackspace;

  })(Misc);

  MaximizePane = (function(_super) {
    __extends(MaximizePane, _super);

    function MaximizePane() {
      return MaximizePane.__super__.constructor.apply(this, arguments);
    }

    MaximizePane.extend();

    MaximizePane.prototype.execute = function() {
      var selector, workspaceElement;
      selector = 'vim-mode-plus-pane-maximized';
      workspaceElement = atom.views.getView(atom.workspace);
      return workspaceElement.classList.toggle(selector);
    };

    return MaximizePane;

  })(Misc);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBR0E7QUFBQSxNQUFBLHdMQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FGUixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FKSixDQUFBOztBQUFBLEVBTUEsT0FBaUUsT0FBQSxDQUFRLFNBQVIsQ0FBakUsRUFBQyx1QkFBQSxlQUFELEVBQWtCLDBCQUFBLGtCQUFsQixFQUFzQywrQkFBQSx1QkFOdEMsQ0FBQTs7QUFBQSxFQVFNO0FBQ0osMkJBQUEsQ0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQ2EsSUFBQSxjQUFBLEdBQUE7QUFDWCxNQUFBLHVDQUFBLFNBQUEsQ0FBQSxDQUFBOztRQUNBLElBQUMsQ0FBQTtPQUZVO0lBQUEsQ0FEYjs7Z0JBQUE7O0tBRGlCLEtBUm5CLENBQUE7O0FBQUEsRUFjTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGlCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7QUFBQSxnQ0FDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBSVAsS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFDLENBQUEsTUFBZixFQUpPO0lBQUEsQ0FEVCxDQUFBOzs2QkFBQTs7S0FE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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/misc-commands.coffee
