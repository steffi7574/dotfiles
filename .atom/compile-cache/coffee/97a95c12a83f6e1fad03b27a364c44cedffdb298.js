(function() {
  var Base, BufferedProcess, CompositeDisposable, DevEnvironment, Developer, Disposable, Emitter, debug, generateIntrospectionReport, getKeyBindingForCommand, packageScope, path, settings, _, _ref, _ref1;

  _ = require('underscore-plus');

  path = require('path');

  _ref = require('atom'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  Base = require('./base');

  _ref1 = require('./introspection'), generateIntrospectionReport = _ref1.generateIntrospectionReport, getKeyBindingForCommand = _ref1.getKeyBindingForCommand;

  settings = require('./settings');

  debug = require('./utils').debug;

  packageScope = 'vim-mode-plus';

  Developer = (function() {
    function Developer() {}

    Developer.prototype.init = function() {
      var commands, fn, name, subscriptions;
      this.devEnvironmentByBuffer = new Map;
      commands = {
        'toggle-debug': (function(_this) {
          return function() {
            return _this.toggleDebug();
          };
        })(this),
        'open-in-vim': (function(_this) {
          return function() {
            return _this.openInVim();
          };
        })(this),
        'generate-introspection-report': (function(_this) {
          return function() {
            return _this.generateIntrospectionReport();
          };
        })(this),
        'report-commands-have-no-default-keymap': (function(_this) {
          return function() {
            return _this.reportCommandsHaveNoDefaultKeymap();
          };
        })(this),
        'toggle-dev-environment': (function(_this) {
          return function() {
            return _this.toggleDevEnvironment();
          };
        })(this)
      };
      subscriptions = new CompositeDisposable;
      for (name in commands) {
        fn = commands[name];
        subscriptions.add(this.addCommand(name, fn));
      }
      return subscriptions;
    };

    Developer.prototype.toggleDevEnvironment = function() {
      var buffer, editor, fileName;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      buffer = editor.getBuffer();
      fileName = path.basename(editor.getPath());
      if (this.devEnvironmentByBuffer.has(buffer)) {
        this.devEnvironmentByBuffer.get(buffer).dispose();
        this.devEnvironmentByBuffer["delete"](buffer);
        return console.log("disposed dev env " + fileName);
      } else {
        this.devEnvironmentByBuffer.set(buffer, new DevEnvironment(editor));
        return console.log("activated dev env " + fileName);
      }
    };

    Developer.prototype.addCommand = function(name, fn) {
      return atom.commands.add('atom-text-editor', "" + packageScope + ":" + name, fn);
    };

    Developer.prototype.toggleDebug = function() {
      settings.set('debug', !settings.get('debug'));
      return console.log("" + settings.scope + " debug:", settings.get('debug'));
    };

    Developer.prototype.reportCommandsHaveNoDefaultKeymap = function() {
      var commandNames, klass, packPath, __;
      packPath = atom.packages.resolvePackagePath('vim-mode-plus');
      path.join(packPath, "keymaps");
      commandNames = (function() {
        var _ref2, _results;
        _ref2 = Base.getRegistries();
        _results = [];
        for (__ in _ref2) {
          klass = _ref2[__];
          if (klass.isCommand()) {
            _results.push(klass.getCommandName());
          }
        }
        return _results;
      })();
      commandNames = commandNames.filter(function(commandName) {
        return !getKeyBindingForCommand(commandName);
      });
      return atom.workspace.open().then(function(editor) {
        return editor.setText(commandNames.join("\n"));
      });
    };

    Developer.prototype.openInVim = function() {
      var editor, row;
      editor = atom.workspace.getActiveTextEditor();
      row = editor.getCursorBufferPosition().row;
      return new BufferedProcess({
        command: "/Applications/MacVim.app/Contents/MacOS/mvim",
        args: [editor.getPath(), "+" + (row + 1)]
      });
    };

    Developer.prototype.generateIntrospectionReport = function() {
      return generateIntrospectionReport(_.values(Base.getRegistries()), {
        excludeProperties: ['getClass', 'extend', 'getParent', 'getAncestors', 'isCommand', 'getRegistries', 'command', 'init', 'getCommandName', 'registerCommand', 'delegatesProperties', 'delegatesMethods', 'delegatesProperty', 'delegatesMethod'],
        recursiveInspect: Base
      });
    };

    return Developer;

  })();

  DevEnvironment = (function() {
    function DevEnvironment(editor) {
      var fileName;
      this.editor = editor;
      this.editorElement = atom.views.getView(this.editor);
      this.emitter = new Emitter;
      fileName = path.basename(this.editor.getPath());
      this.disposable = this.editor.onDidSave((function(_this) {
        return function() {
          console.clear();
          Base.suppressWarning = true;
          _this.reload();
          Base.suppressWarning = false;
          Base.reset();
          _this.emitter.emit('did-reload');
          return console.log("reloaded " + fileName);
        };
      })(this));
    }

    DevEnvironment.prototype.dispose = function() {
      var _ref2;
      return (_ref2 = this.disposable) != null ? _ref2.dispose() : void 0;
    };

    DevEnvironment.prototype.onDidReload = function(fn) {
      return this.emitter.on('did-reload', fn);
    };

    DevEnvironment.prototype.reload = function() {
      var originalRequire, packPath;
      packPath = atom.packages.resolvePackagePath('vim-mode-plus');
      originalRequire = global.require;
      global.require = function(libPath) {
        if (libPath.startsWith('./')) {
          return originalRequire("" + packPath + "/lib/" + libPath);
        } else {
          return originalRequire(libPath);
        }
      };
      atom.commands.dispatch(this.editorElement, 'run-in-atom:run-in-atom');
      return global.require = originalRequire;
    };

    return DevEnvironment;

  })();

  module.exports = Developer;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2RldmVsb3Blci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEscU1BQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxPQUE4RCxPQUFBLENBQVEsTUFBUixDQUE5RCxFQUFDLGVBQUEsT0FBRCxFQUFVLGtCQUFBLFVBQVYsRUFBc0IsdUJBQUEsZUFBdEIsRUFBdUMsMkJBQUEsbUJBRnZDLENBQUE7O0FBQUEsRUFJQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FKUCxDQUFBOztBQUFBLEVBS0EsUUFBeUQsT0FBQSxDQUFRLGlCQUFSLENBQXpELEVBQUMsb0NBQUEsMkJBQUQsRUFBOEIsZ0NBQUEsdUJBTDlCLENBQUE7O0FBQUEsRUFNQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FOWCxDQUFBOztBQUFBLEVBT0MsUUFBUyxPQUFBLENBQVEsU0FBUixFQUFULEtBUEQsQ0FBQTs7QUFBQSxFQVNBLFlBQUEsR0FBZSxlQVRmLENBQUE7O0FBQUEsRUFXTTsyQkFDSjs7QUFBQSx3QkFBQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osVUFBQSxpQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLHNCQUFELEdBQTBCLEdBQUEsQ0FBQSxHQUExQixDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxD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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/developer.coffee
