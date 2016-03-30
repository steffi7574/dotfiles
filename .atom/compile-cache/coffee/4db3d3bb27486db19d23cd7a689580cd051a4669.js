(function() {
  var BlockwiseRestoreCharacterwise, BlockwiseSelect, CompositeDisposable, Disposable, Emitter, ModeManager, Range, getNewTextRangeFromCheckpoint, moveCursorLeft, supportedModes, supportedSubModes, swrap, toggleClassByCondition, _, _ref, _ref1, _ref2,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('./visual-blockwise'), BlockwiseSelect = _ref1.BlockwiseSelect, BlockwiseRestoreCharacterwise = _ref1.BlockwiseRestoreCharacterwise;

  swrap = require('./selection-wrapper');

  _ref2 = require('./utils'), toggleClassByCondition = _ref2.toggleClassByCondition, getNewTextRangeFromCheckpoint = _ref2.getNewTextRangeFromCheckpoint, moveCursorLeft = _ref2.moveCursorLeft;

  supportedModes = ['normal', 'insert', 'visual', 'operator-pending'];

  supportedSubModes = ['characterwise', 'linewise', 'blockwise', 'replace'];

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    function ModeManager(vimState) {
      var _ref3;
      this.vimState = vimState;
      _ref3 = this.vimState, this.editor = _ref3.editor, this.editorElement = _ref3.editorElement;
      this.emitter = new Emitter;
      this.onDidActivateMode((function(_this) {
        return function(_arg) {
          var mode, submode;
          mode = _arg.mode, submode = _arg.submode;
          _this.updateEditorElement();
          _this.vimState.statusBarManager.update(mode, submode);
          return _this.vimState.refreshCursors();
        };
      })(this));
    }

    ModeManager.prototype.updateEditorElement = function() {
      var mode, submode, _i, _j, _len, _len1, _results;
      for (_i = 0, _len = supportedModes.length; _i < _len; _i++) {
        mode = supportedModes[_i];
        toggleClassByCondition(this.editorElement, "" + mode + "-mode", mode === this.mode);
      }
      _results = [];
      for (_j = 0, _len1 = supportedSubModes.length; _j < _len1; _j++) {
        submode = supportedSubModes[_j];
        _results.push(toggleClassByCondition(this.editorElement, submode, submode === this.submode));
      }
      return _results;
    };

    ModeManager.prototype.isMode = function(mode, submodes) {
      var _ref3;
      if (submodes != null) {
        if (!_.isArray(submodes)) {
          submodes = [submodes];
        }
        return (this.mode === mode) && (_ref3 = this.submode, __indexOf.call(submodes, _ref3) >= 0);
      } else {
        return this.mode === mode;
      }
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.activate = function(mode, submode) {
      var _ref3, _ref4, _ref5;
      if (submode == null) {
        submode = null;
      }
      if (mode === 'reset') {
        this.editor.clearSelections();
        mode = 'normal';
      } else if (mode === 'visual') {
        if (submode === this.submode) {
          mode = 'normal';
          submode = null;
        } else if (submode === 'previous') {
          submode = (_ref3 = typeof this.restorePreviousSelection === "function" ? this.restorePreviousSelection() : void 0) != null ? _ref3 : 'characterwise';
        }
      }
      if (mode !== this.mode) {
        this.emitter.emit('will-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
        if ((_ref4 = this.deactivator) != null) {
          _ref4.dispose();
        }
      }
      this.deactivator = (function() {
        switch (mode) {
          case 'normal':
            return this.activateNormalMode();
          case 'insert':
            return this.activateInsertMode(submode);
          case 'visual':
            return this.activateVisualMode(submode);
          case 'operator-pending':
            return new Disposable;
        }
      }).call(this);
      _ref5 = [mode, submode], this.mode = _ref5[0], this.submode = _ref5[1];
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.activateNormalMode = function() {
      this.vimState.reset();
      this.editorElement.component.setInputEnabled(false);
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var c, insert, item, range, text, undo, _i, _len, _ref3, _ref4, _results;
          if ((item = _this.vimState.operationStack.getRecorded()) && (item.getCheckpoint != null)) {
            _ref3 = item.getCheckpoint(), undo = _ref3.undo, insert = _ref3.insert;
            range = getNewTextRangeFromCheckpoint(_this.editor, insert);
            text = _this.editor.getTextInBufferRange(range != null ? range : []);
            _this.editor.groupChangesSinceCheckpoint(undo);
            _this.vimState.register.set('.', {
              text: text
            });
            _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
            if (range) {
              _this.vimState.mark.set('[', range.start);
              _this.vimState.mark.set(']', range.end);
            }
          }
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          _ref4 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            c = _ref4[_i];
            _results.push(moveCursorLeft(c));
          }
          return _results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = {};
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(_arg) {
          var cancel, text;
          text = _arg.text, cancel = _arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(s) {
            var char, _base, _i, _len, _name, _ref3, _ref4, _results;
            _ref4 = (_ref3 = text.split('')) != null ? _ref3 : [];
            _results = [];
            for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
              char = _ref4[_i];
              if ((char !== "\n") && (!s.cursor.isAtEndOfLine())) {
                s.selectRight();
              }
              if ((_base = _this.replacedCharsBySelection)[_name = s.id] == null) {
                _base[_name] = [];
              }
              _results.push(_this.replacedCharsBySelection[s.id].push(swrap(s).replace(char)));
            }
            return _results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var _ref3;
      return (_ref3 = this.replacedCharsBySelection[selection.id]) != null ? _ref3.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(submode) {
      var s, _i, _len, _ref3;
      if (this.submode != null) {
        this.restoreCharacterwiseRange();
      } else {
        if (this.editor.getLastSelection().isEmpty()) {
          this.editor.selectRight();
        }
      }
      _ref3 = this.editor.getSelections();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        s = _ref3[_i];
        swrap(s).preserveCharacterwise();
      }
      switch (submode) {
        case 'linewise':
          swrap.expandOverLine(this.editor);
          break;
        case 'blockwise':
          if (!swrap(this.editor.getLastSelection()).isLinewise()) {
            new BlockwiseSelect(this.vimState).execute();
          }
      }
      return new Disposable((function(_this) {
        return function() {
          var properties;
          _this.restoreCharacterwiseRange();
          properties = swrap(_this.editor.getLastSelection()).detectCharacterwiseProperties();
          submode = _this.submode;
          _this.restorePreviousSelection = function() {
            var selection;
            selection = _this.editor.getLastSelection();
            swrap(s).selectByProperties(properties);
            _this.editor.scrollToScreenRange(s.getScreenRange(), {
              center: true
            });
            return submode;
          };
          return _this.editor.getSelections().forEach(function(s) {
            swrap(s).resetProperties();
            if (!s.isReversed() && !s.isEmpty()) {
              s.selectLeft();
            }
            return s.clear({
              autoscroll: false
            });
          });
        };
      })(this));
    };

    ModeManager.prototype.restoreCharacterwiseRange = function() {
      if (this.submode === 'characterwise') {
        return;
      }
      switch (this.submode) {
        case 'linewise':
          return this.editor.getSelections().forEach(function(s) {
            if (!s.isEmpty()) {
              return swrap(s).restoreCharacterwise();
            }
          });
        case 'blockwise':
          if (!this.vimState.operationStack.isProcessing()) {
            return new BlockwiseRestoreCharacterwise(this.vimState).execute();
          }
      }
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vZGUtbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsb1BBQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxlQUFBLE9BQUQsRUFBVSxhQUFBLEtBQVYsRUFBaUIsMkJBQUEsbUJBQWpCLEVBQXNDLGtCQUFBLFVBRHRDLENBQUE7O0FBQUEsRUFFQSxRQUFtRCxPQUFBLENBQVEsb0JBQVIsQ0FBbkQsRUFBQyx3QkFBQSxlQUFELEVBQWtCLHNDQUFBLDZCQUZsQixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxRQUEwRSxPQUFBLENBQVEsU0FBUixDQUExRSxFQUFDLCtCQUFBLHNCQUFELEVBQXlCLHNDQUFBLDZCQUF6QixFQUF3RCx1QkFBQSxjQUx4RCxDQUFBOztBQUFBLEVBT0EsY0FBQSxHQUFpQixDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFFBQXJCLEVBQStCLGtCQUEvQixDQVBqQixDQUFBOztBQUFBLEVBUUEsaUJBQUEsR0FBb0IsQ0FBQyxlQUFELEVBQWtCLFVBQWxCLEVBQThCLFdBQTlCLEVBQTJDLFNBQTNDLENBUnBCLENBQUE7O0FBQUEsRUFVTTtBQUNKLDBCQUFBLElBQUEsR0FBTSxRQUFOLENBQUE7O0FBRWEsSUFBQSxxQkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLEtBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsUUFBNEIsSUFBQyxDQUFBLFFBQTdCLEVB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/mode-manager.coffee
