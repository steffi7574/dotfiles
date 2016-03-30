(function() {
  var Base, CompositeDisposable, Disposable, Hover, HoverElement, Input, InputElement, SearchInput, SearchInputElement, StatusBarManager, VimState, globalState, packageScope, settings, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  _ = require('underscore-plus');

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  StatusBarManager = require('./status-bar-manager');

  globalState = require('./global-state');

  settings = require('./settings');

  VimState = require('./vim-state');

  _ref1 = require('./hover'), Hover = _ref1.Hover, HoverElement = _ref1.HoverElement;

  _ref2 = require('./input'), Input = _ref2.Input, InputElement = _ref2.InputElement, SearchInput = _ref2.SearchInput, SearchInputElement = _ref2.SearchInputElement;

  packageScope = 'vim-mode-plus';

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var developer, workspaceElement;
      this.subscriptions = new CompositeDisposable;
      this.statusBarManager = new StatusBarManager;
      this.vimStates = new Map;
      this.registerViewProviders();
      this.subscriptions.add(Base.init(this.provideVimModePlus()));
      this.registerCommands();
      if (atom.inDevMode()) {
        developer = new (require('./developer'));
        this.subscribe(developer.init());
      }
      this.subscribe(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var vimState;
          if (editor.isMini()) {
            return;
          }
          vimState = new VimState(editor, _this.statusBarManager);
          _this.vimStates.set(editor, vimState);
          return vimState.onDidDestroy(function() {
            return _this.vimStates["delete"](editor);
          });
        };
      })(this)));
      this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.vimStates.forEach(function(vimState) {
            return vimState.destroy();
          });
        };
      })(this)));
      workspaceElement = atom.views.getView(atom.workspace);
      return this.subscribe(atom.workspace.onDidChangeActivePane(function() {
        var selector;
        selector = 'vim-mode-plus-pane-maximized';
        return workspaceElement.classList.remove(selector);
      }));
    },
    subscribe: function() {
      var args, _ref3;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref3 = this.subscriptions).add.apply(_ref3, args);
    },
    registerCommands: function() {
      var fn, getState, name, scope, vimStateCommands, _results;
      vimStateCommands = {
        'activate-normal-mode': function() {
          return this.activate('normal');
        },
        'activate-linewise-visual-mode': function() {
          return this.activate('visual', 'linewise');
        },
        'activate-characterwise-visual-mode': function() {
          return this.activate('visual', 'characterwise');
        },
        'activate-blockwise-visual-mode': function() {
          return this.activate('visual', 'blockwise');
        },
        'activate-previous-visual-mode': function() {
          return this.activate('visual', 'previous');
        },
        'reset-normal-mode': function() {
          return this.activate('reset');
        },
        'set-register-name': function() {
          return this.register.setName();
        },
        'set-count-0': function() {
          return this.count.set(0);
        },
        'set-count-1': function() {
          return this.count.set(1);
        },
        'set-count-2': function() {
          return this.count.set(2);
        },
        'set-count-3': function() {
          return this.count.set(3);
        },
        'set-count-4': function() {
          return this.count.set(4);
        },
        'set-count-5': function() {
          return this.count.set(5);
        },
        'set-count-6': function() {
          return this.count.set(6);
        },
        'set-count-7': function() {
          return this.count.set(7);
        },
        'set-count-8': function() {
          return this.count.set(8);
        },
        'set-count-9': function() {
          return this.count.set(9);
        }
      };
      getState = (function(_this) {
        return function() {
          return _this.getEditorState(atom.workspace.getActiveTextEditor());
        };
      })(this);
      scope = 'atom-text-editor:not([mini])';
      _results = [];
      for (name in vimStateCommands) {
        fn = vimStateCommands[name];
        _results.push((function(_this) {
          return function(fn) {
            return _this.addCommand(scope, name, function(event) {
              return fn.bind(getState())(event);
            });
          };
        })(this)(fn));
      }
      return _results;
    },
    addCommand: function(scope, name, fn) {
      return this.subscribe(atom.commands.add(scope, "" + packageScope + ":" + name, fn));
    },
    registerViewProviders: function() {
      var addView;
      addView = atom.views.addViewProvider.bind(atom.views);
      addView(Hover, function(model) {
        return new HoverElement().initialize(model);
      });
      addView(Input, function(model) {
        return new InputElement().initialize(model);
      });
      return addView(SearchInput, function(model) {
        return new SearchInputElement().initialize(model);
      });
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    getGlobalState: function() {
      return globalState;
    },
    getEditorState: function(editor) {
      return this.vimStates.get(editor);
    },
    provideVimModePlus: function() {
      return {
        Base: Base,
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdNQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLE9BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsa0JBQUEsVUFBRCxFQUFhLDJCQUFBLG1CQUZiLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSLENBTG5CLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBTmQsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVBYLENBQUE7O0FBQUEsRUFRQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FSWCxDQUFBOztBQUFBLEVBU0EsUUFBd0IsT0FBQSxDQUFRLFNBQVIsQ0FBeEIsRUFBQyxjQUFBLEtBQUQsRUFBUSxxQkFBQSxZQVRSLENBQUE7O0FBQUEsRUFVQSxRQUF5RCxPQUFBLENBQVEsU0FBUixDQUF6RCxFQUFDLGNBQUEsS0FBRCxFQUFRLHFCQUFBLFlBQVIsRUFBc0Isb0JBQUEsV0FBdEIsRUFBbUMsMkJBQUEsa0JBVm5DLENBQUE7O0FBQUEsRUFZQSxZQUFBLEdBQWUsZUFaZixDQUFBOztBQUFBLEVBY0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSwyQkFBQTtBQUFBLE1B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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/main.coffee
