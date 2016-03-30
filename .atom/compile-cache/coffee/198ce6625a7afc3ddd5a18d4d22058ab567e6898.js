(function() {
  var BlockwiseRestoreCharacterwise, BlockwiseSelect, CompositeDisposable, Disposable, Emitter, ModeManager, Range, moveCursorLeft, supportedModes, supportedSubModes, swrap, toggleClassByCondition, _, _ref, _ref1, _ref2,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('./visual-blockwise'), BlockwiseSelect = _ref1.BlockwiseSelect, BlockwiseRestoreCharacterwise = _ref1.BlockwiseRestoreCharacterwise;

  swrap = require('./selection-wrapper');

  _ref2 = require('./utils'), toggleClassByCondition = _ref2.toggleClassByCondition, moveCursorLeft = _ref2.moveCursorLeft;

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

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(mode, submode) {
      var _ref3, _ref4, _ref5;
      if (submode == null) {
        submode = null;
      }
      this.emitter.emit('will-activate-mode', {
        mode: mode,
        submode: submode
      });
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
        this.emitter.emit('did-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
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
          var c, _i, _len, _ref3, _results;
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          _ref3 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            c = _ref3[_i];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vZGUtbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEscU5BQUE7SUFBQSxxSkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBb0QsT0FBQSxDQUFRLE1BQVIsQ0FBcEQsRUFBQyxlQUFBLE9BQUQsRUFBVSxhQUFBLEtBQVYsRUFBaUIsMkJBQUEsbUJBQWpCLEVBQXNDLGtCQUFBLFVBRHRDLENBQUE7O0FBQUEsRUFFQSxRQUFtRCxPQUFBLENBQVEsb0JBQVIsQ0FBbkQsRUFBQyx3QkFBQSxlQUFELEVBQWtCLHNDQUFBLDZCQUZsQixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxRQUEyQyxPQUFBLENBQVEsU0FBUixDQUEzQyxFQUFDLCtCQUFBLHNCQUFELEVBQXlCLHVCQUFBLGNBTHpCLENBQUE7O0FBQUEsRUFPQSxjQUFBLEdBQWlCLENBQUMsUUFBRCxFQUFXLFFBQVgsRUFBcUIsUUFBckIsRUFBK0Isa0JBQS9CLENBUGpCLENBQUE7O0FBQUEsRUFRQSxpQkFBQSxHQUFvQixDQUFDLGVBQUQsRUFBa0IsVUFBbEIsRUFBOEIsV0FBOUIsRUFBMkMsU0FBM0MsQ0FScEIsQ0FBQTs7QUFBQSxFQVVNO0FBQ0osMEJBQUEsSUFBQSxHQUFNLFFBQU4sQ0FBQTs7QUFFYSxJQUFBLHFCQUFFLFFBQUYsR0FBQTtBQUNYLFVBQUEsS0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxRQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsZUFBQSxN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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/mode-manager.coffee
