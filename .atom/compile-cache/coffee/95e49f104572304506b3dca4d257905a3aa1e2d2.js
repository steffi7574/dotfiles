(function() {
  var CompositeDisposable, CountManager, CursorStyleManager, Delegato, Disposable, Emitter, Hover, Input, MarkManager, ModeManager, OperationStack, Point, Range, RegisterManager, SearchHistoryManager, SearchInput, VimState, haveSomeSelection, packageScope, settings, swrap, toggleClassByCondition, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  Delegato = require('delegato');

  _ = require('underscore-plus');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable, Range = _ref.Range, Point = _ref.Point;

  Hover = require('./hover').Hover;

  _ref1 = require('./input'), Input = _ref1.Input, SearchInput = _ref1.SearchInput;

  settings = require('./settings');

  _ref2 = require('./utils'), haveSomeSelection = _ref2.haveSomeSelection, toggleClassByCondition = _ref2.toggleClassByCondition;

  swrap = require('./selection-wrapper');

  OperationStack = require('./operation-stack');

  CountManager = require('./count-manager');

  MarkManager = require('./mark-manager');

  ModeManager = require('./mode-manager');

  RegisterManager = require('./register-manager');

  SearchHistoryManager = require('./search-history-manager');

  CursorStyleManager = require('./cursor-style-manager');

  packageScope = 'vim-mode-plus';

  module.exports = VimState = (function() {
    Delegato.includeInto(VimState);

    VimState.prototype.destroyed = false;

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    function VimState(editor, statusBarManager) {
      this.editor = editor;
      this.statusBarManager = statusBarManager;
      this.editorElement = atom.views.getView(this.editor);
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.modeManager = new ModeManager(this);
      this.count = new CountManager(this);
      this.mark = new MarkManager(this);
      this.register = new RegisterManager(this);
      this.hover = new Hover(this);
      this.hoverSearchCounter = new Hover(this);
      this.searchHistory = new SearchHistoryManager(this);
      this.input = new Input(this);
      this.searchInput = new SearchInput(this);
      this.operationStack = new OperationStack(this);
      this.cursorStyleManager = new CursorStyleManager(this);
      this.observeSelection();
      this.editorElement.classList.add(packageScope);
      if (settings.get('startInInsertMode')) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
    }

    VimState.prototype.subscribe = function() {
      var args, _ref3;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref3 = this.operationStack).subscribe.apply(_ref3, args);
    };

    VimState.prototype.onDidChangeInput = function(fn) {
      return this.subscribe(this.input.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmInput = function(fn) {
      return this.subscribe(this.input.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelInput = function(fn) {
      return this.subscribe(this.input.onDidCancel(fn));
    };

    VimState.prototype.onDidUnfocusInput = function(fn) {
      return this.subscribe(this.input.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandInput = function(fn) {
      return this.subscribe(this.input.onDidCommand(fn));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidUnfocusSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidUnfocus(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.onWillExecuteOperation = function(fn) {
      return this.subscribe(this.emitter.on('will-execute-operation', fn));
    };

    VimState.prototype.onDidExecuteOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-execute-operation', fn));
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.destroy = function() {
      var _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.activate('normal');
        if ((_ref3 = this.editorElement.component) != null) {
          _ref3.setInputEnabled(true);
        }
        this.editorElement.classList.remove(packageScope, 'normal-mode');
      }
      if ((_ref4 = this.hover) != null) {
        if (typeof _ref4.destroy === "function") {
          _ref4.destroy();
        }
      }
      if ((_ref5 = this.hoverSearchCounter) != null) {
        if (typeof _ref5.destroy === "function") {
          _ref5.destroy();
        }
      }
      if ((_ref6 = this.operationStack) != null) {
        if (typeof _ref6.destroy === "function") {
          _ref6.destroy();
        }
      }
      if ((_ref7 = this.searchHistory) != null) {
        if (typeof _ref7.destroy === "function") {
          _ref7.destroy();
        }
      }
      if ((_ref8 = this.cursorStyleManager) != null) {
        if (typeof _ref8.destroy === "function") {
          _ref8.destroy();
        }
      }
      if ((_ref9 = this.input) != null) {
        if (typeof _ref9.destroy === "function") {
          _ref9.destroy();
        }
      }
      if ((_ref10 = this.search) != null) {
        if (typeof _ref10.destroy === "function") {
          _ref10.destroy();
        }
      }
      if ((_ref11 = this.modeManager) != null) {
        if (typeof _ref11.destroy === "function") {
          _ref11.destroy();
        }
      }
      if ((_ref12 = this.operationRecords) != null) {
        if (typeof _ref12.destroy === "function") {
          _ref12.destroy();
        }
      }
      ((_ref13 = this.register) != null ? _ref13.destroy : void 0) != null;
      _ref14 = {}, this.hover = _ref14.hover, this.hoverSearchCounter = _ref14.hoverSearchCounter, this.operationStack = _ref14.operationStack, this.searchHistory = _ref14.searchHistory, this.cursorStyleManager = _ref14.cursorStyleManager, this.input = _ref14.input, this.search = _ref14.search, this.modeManager = _ref14.modeManager, this.operationRecords = _ref14.operationRecords, this.register = _ref14.register;
      _ref15 = {}, this.editor = _ref15.editor, this.editorElement = _ref15.editorElement, this.subscriptions = _ref15.subscriptions;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.observeSelection = function() {
      var handleMouseDown, handleMouseUp, handleSelectionChange, selectionWatcher;
      handleSelectionChange = (function(_this) {
        return function() {
          if (_this.editor == null) {
            return;
          }
          if (_this.operationStack.isProcessing()) {
            return;
          }
          if (haveSomeSelection(_this.editor)) {
            if (_this.isMode('normal')) {
              return _this.activate('visual', 'characterwise');
            }
          } else {
            if (_this.isMode('visual')) {
              return _this.activate('normal');
            }
          }
        };
      })(this);
      selectionWatcher = null;
      handleMouseDown = (function(_this) {
        return function() {
          var point, tailRange;
          if (selectionWatcher != null) {
            selectionWatcher.dispose();
          }
          point = _this.editor.getLastCursor().getBufferPosition();
          tailRange = Range.fromPointWithDelta(point, 0, +1);
          return selectionWatcher = _this.editor.onDidChangeSelectionRange(function(_arg) {
            var selection;
            selection = _arg.selection;
            handleSelectionChange();
            selection.setBufferRange(selection.getBufferRange().union(tailRange));
            return _this.refreshCursors();
          });
        };
      })(this);
      handleMouseUp = function() {
        if (selectionWatcher != null) {
          selectionWatcher.dispose();
        }
        return selectionWatcher = null;
      };
      this.editorElement.addEventListener('mousedown', handleMouseDown);
      this.editorElement.addEventListener('mouseup', handleMouseUp);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          _this.editorElement.removeEventListener('mousedown', handleMouseDown);
          return _this.editorElement.removeEventListener('mouseup', handleMouseUp);
        };
      })(this)));
      return this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
        return function(_arg) {
          var target, type;
          target = _arg.target, type = _arg.type;
          if (target === _this.editorElement && !type.startsWith('vim-mode-plus:')) {
            if (selectionWatcher == null) {
              return handleSelectionChange();
            }
          }
        };
      })(this)));
    };

    VimState.prototype.onDidFailToSetTarget = function(fn) {
      return this.emitter.on('did-fail-to-set-target', fn);
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.reset = function() {
      this.count.reset();
      this.register.reset();
      this.searchHistory.reset();
      this.hover.reset();
      return this.operationStack.reset();
    };

    VimState.prototype.refreshCursors = function() {
      return this.cursorStyleManager.refresh();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseVRBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQTJELE9BQUEsQ0FBUSxNQUFSLENBQTNELEVBQUMsZUFBQSxPQUFELEVBQVUsa0JBQUEsVUFBVixFQUFzQiwyQkFBQSxtQkFBdEIsRUFBMkMsYUFBQSxLQUEzQyxFQUFrRCxhQUFBLEtBRmxELENBQUE7O0FBQUEsRUFJQyxRQUFTLE9BQUEsQ0FBUSxTQUFSLEVBQVQsS0FKRCxDQUFBOztBQUFBLEVBS0EsUUFBdUIsT0FBQSxDQUFRLFNBQVIsQ0FBdkIsRUFBQyxjQUFBLEtBQUQsRUFBUSxvQkFBQSxXQUxSLENBQUE7O0FBQUEsRUFNQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FOWCxDQUFBOztBQUFBLEVBT0EsUUFBOEMsT0FBQSxDQUFRLFNBQVIsQ0FBOUMsRUFBQywwQkFBQSxpQkFBRCxFQUFvQiwrQkFBQSxzQkFQcEIsQ0FBQTs7QUFBQSxFQVFBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FSUixDQUFBOztBQUFBLEVBVUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FWakIsQ0FBQTs7QUFBQSxFQVdBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FYZixDQUFBOztBQUFBLEVBWUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQVpkLENBQUE7O0FBQUEsRUFhQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/vim-state.coffee
