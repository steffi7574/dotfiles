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

    VimState.prototype.onWillSelect = function(fn) {
      return this.subscribe(this.emitter.on('will-select', fn));
    };

    VimState.prototype.onDidSelect = function(fn) {
      return this.subscribe(this.emitter.on('did-select', fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.onDidOperationFinish = function(fn) {
      return this.subscribe(this.emitter.on('did-operation-finish', fn));
    };

    VimState.prototype.destroy = function() {
      var ivar, ivars, _i, _len, _ref3, _ref4, _ref5;
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
      ivars = ["hover", "hoverSearchCounter", "operationStack", "searchHistory", "cursorStyleManager", "input", "search", "modeManager", "operationRecords"];
      for (_i = 0, _len = ivars.length; _i < _len; _i++) {
        ivar = ivars[_i];
        if ((_ref4 = this[name]) != null) {
          if (typeof _ref4.destroy === "function") {
            _ref4.destroy();
          }
        }
        this[name] = null;
      }
      _ref5 = {}, this.editor = _ref5.editor, this.editorElement = _ref5.editorElement, this.subscriptions = _ref5.subscriptions;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.observeSelection = function() {
      var handleMouseDown, handleMouseUp, handleSelectionChange, selectionWatcher;
      handleSelectionChange = (function(_this) {
        return function() {
          var someSelection;
          if (_this.editor == null) {
            return;
          }
          if (_this.operationStack.isProcessing()) {
            return;
          }
          someSelection = haveSomeSelection(_this.editor.getSelections());
          switch (false) {
            case !(_this.isMode('visual') && (!someSelection)):
              return _this.activate('normal');
            case !(_this.isMode('normal') && someSelection):
              return _this.activate('visual', 'characterwise');
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
