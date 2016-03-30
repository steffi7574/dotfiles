Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _atom = require('atom');

var _treeKill = require('tree-kill');

var _treeKill2 = _interopRequireDefault(_treeKill);

var _grim = require('grim');

var _grim2 = _interopRequireDefault(_grim);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _saveConfirmView = require('./save-confirm-view');

var _saveConfirmView2 = _interopRequireDefault(_saveConfirmView);

var _statusBarView = require('./status-bar-view');

var _statusBarView2 = _interopRequireDefault(_statusBarView);

var _targetsView = require('./targets-view');

var _targetsView2 = _interopRequireDefault(_targetsView);

var _buildView = require('./build-view');

var _buildView2 = _interopRequireDefault(_buildView);

var _googleAnalytics = require('./google-analytics');

var _googleAnalytics2 = _interopRequireDefault(_googleAnalytics);

var _errorMatcher = require('./error-matcher');

var _errorMatcher2 = _interopRequireDefault(_errorMatcher);

var _buildError = require('./build-error');

var _buildError2 = _interopRequireDefault(_buildError);

var _atomBuild = require('./atom-build');

var _atomBuild2 = _interopRequireDefault(_atomBuild);

var _providerLegacy = require('./provider-legacy');

var _providerLegacy2 = _interopRequireDefault(_providerLegacy);

'use babel';

exports['default'] = {
  config: _config2['default'],

  activate: function activate() {
    var _this = this;

    if (!/^win/.test(process.platform)) {
      // Manually append /usr/local/bin as it may not be set on some systems,
      // and it's common to have node installed here. Keep it at end so it won't
      // accidentially override any other node installation
      process.env.PATH += ':/usr/local/bin';
    }

    this.buildView = new _buildView2['default']();

    this.tools = [_atomBuild2['default']];
    this.instancedTools = {}; // Ordered by project path
    this.targets = {};
    this.activeTarget = {};
    this.targetsLoading = {};

    this.stdout = new Buffer(0);
    this.stderr = new Buffer(0);
    this.errorMatcher = new _errorMatcher2['default']();

    atom.commands.add('atom-workspace', 'build:refresh-targets', function () {
      return _this.refreshTargets();
    });
    atom.commands.add('atom-workspace', 'build:trigger', function () {
      return _this.build('trigger');
    });
    atom.commands.add('atom-workspace', 'build:select-active-target', function () {
      return _this.selectActiveTarget();
    });
    atom.commands.add('atom-workspace', 'build:stop', function () {
      return _this.stop();
    });
    atom.commands.add('atom-workspace', 'build:confirm', function () {
      _googleAnalytics2['default'].sendEvent('build', 'confirmed');
      document.activeElement.click();
    });
    atom.commands.add('atom-workspace', 'build:no-confirm', function () {
      if (_this.saveConfirmView) {
        _googleAnalytics2['default'].sendEvent('build', 'not confirmed');
        _this.saveConfirmView.cancel();
      }
    });

    atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(function () {
        if (atom.config.get('build.buildOnSave')) {
          _this.build('save');
        }
      });
    });

    atom.workspace.onDidChangeActivePaneItem(function () {
      return _this.updateStatusBar();
    });

    this.errorMatcher.on('error', function (message) {
      atom.notifications.addError('Error matching failed!', { detail: message });
    });

    this.errorMatcher.on('matched', function (id) {
      _this.buildView.scrollTo(id);
    });

    this.errorMatcher.on('match', function (text, id) {
      var callback = _this.errorMatcher.goto.bind(_this.errorMatcher, id);
      _this.buildView.link(text, id, callback);
    });

    atom.packages.onDidActivateInitialPackages(function () {
      return _this.refreshTargets();
    });

    var projectPaths = atom.project.getPaths();
    atom.project.onDidChangePaths(function () {
      var addedPaths = atom.project.getPaths().filter(function (el) {
        return projectPaths.indexOf(el) === -1;
      });
      _this.refreshTargets(addedPaths);
      projectPaths = atom.project.getPaths();
    });

    atom.packages.getLoadedPackages().filter(function (p) {
      return (((p.metadata.providedServices || {}).builder || {}).versions || {})['1.0.0'];
    }).forEach(function (p) {
      return _grim2['default'].deprecate('Use 2.0.0 of builder service API instead', { packageName: p.name });
    });
  },

  deactivate: function deactivate() {
    _lodash2['default'].map(this.instancedTools, function (tools, cwd) {
      return tools.forEach(function (tool) {
        tool.removeAllListeners('refresh');
        tool.destructor && tool.destructor();
      });
    });

    if (this.child) {
      this.child.removeAllListeners();
      (0, _treeKill2['default'])(this.child.pid, 'SIGKILL');
      this.child = null;
    }

    this.statusBarView && this.statusBarView.destroy();

    clearTimeout(this.finishedTimer);
  },

  activePath: function activePath() {
    var textEditor = atom.workspace.getActiveTextEditor();
    if (!textEditor || !textEditor.getPath()) {
      /* default to building the first one if no editor is active */
      if (0 === atom.project.getPaths().length) {
        return false;
      }

      return atom.project.getPaths()[0];
    }

    /* otherwise, build the one in the root of the active editor */
    return atom.project.getPaths().sort(function (a, b) {
      return b.length - a.length;
    }).find(function (p) {
      var realpath = _fs2['default'].realpathSync(p);
      return textEditor.getPath().substr(0, realpath.length) === realpath;
    });
  },

  updateStatusBar: function updateStatusBar() {
    var activeTarget = this.activeTarget[this.activePath()];
    this.statusBarView && this.statusBarView.setTarget(activeTarget);
  },

  cmdDefaults: function cmdDefaults(cwd) {
    return {
      env: {},
      args: [],
      cwd: cwd,
      sh: true,
      errorMatch: '',
      dispose: Function.prototype
    };
  },

  settingsMakeUnique: function settingsMakeUnique(settings) {
    var diff = undefined;
    var appender = function appender(setting) {
      setting._uniqueIndex = setting._uniqueIndex || 1;
      setting._originalName = setting._originalName || setting.name;
      setting.name = setting._originalName + ' - ' + setting._uniqueIndex++;
      settings.push(setting);
    };
    var i = 0;
    do {
      var uniqueSettings = _lodash2['default'].uniq(settings, 'name');
      diff = _lodash2['default'].difference(settings, uniqueSettings);
      settings = uniqueSettings;
      diff.forEach(appender);
    } while (diff.length > 0 && i++ < 10);

    return settings;
  },

  refreshTargets: function refreshTargets(refreshPaths) {
    var _this2 = this;

    refreshPaths = refreshPaths || atom.project.getPaths();

    var pathPromise = refreshPaths.map(function (p) {
      _this2.targetsLoading[p] = true;
      _this2.targets[p] = _this2.targets[p] || [];

      _this2.instancedTools[p] = (_this2.instancedTools[p] || []).map(function (t) {
        return t.removeAllListeners && t.removeAllListeners('refresh');
      }).filter(function () {
        return false;
      }); // Just empty the array

      var settingsPromise = _this2.tools.map(function (Tool) {
        return new Tool(p);
      }).filter(function (tool) {
        return tool.isEligible();
      }).map(function (tool) {
        _this2.instancedTools[p].push(tool);
        _googleAnalytics2['default'].sendEvent('build', 'tool eligible', tool.getNiceName());

        tool.on && tool.on('refresh', _this2.refreshTargets.bind(_this2, [p]));
        return Promise.resolve().then(function () {
          return tool.settings();
        })['catch'](function (err) {
          if (err instanceof SyntaxError) {
            atom.notifications.addError('Invalid build file.', {
              detail: 'You have a syntax error in your build file: ' + err.message,
              dismissable: true
            });
          } else {
            atom.notifications.addError('Ooops. Something went wrong.', {
              detail: err.message + (err.stack ? '\n' + err.stack : ''),
              dismissable: true
            });
          }
        });
      });

      return Promise.all(settingsPromise).then(function (settings) {
        settings = _this2.settingsMakeUnique([].concat.apply([], settings).filter(Boolean).map(function (setting) {
          return _lodash2['default'].defaults(setting, _this2.cmdDefaults(p));
        }));

        if (_lodash2['default'].isNull(_this2.activeTarget[p]) || !settings.find(function (s) {
          return s.name === _this2.activeTarget[p];
        })) {
          /* Active target has been removed or not set. Set it to the highest prio target */
          _this2.activeTarget[p] = settings[0] ? settings[0].name : undefined;
        }

        _this2.targets[p].forEach(function (target) {
          return target.dispose();
        });

        settings.forEach(function (setting, index) {
          if (!setting.keymap) {
            return;
          }

          _googleAnalytics2['default'].sendEvent('keymap', 'registered', setting.keymap);
          var commandName = 'build:trigger:' + setting.name;
          var keymapSpec = { 'atom-workspace, atom-text-editor': {} };
          keymapSpec['atom-workspace, atom-text-editor'][setting.keymap] = commandName;
          var keymapDispose = atom.keymaps.add(setting.name, keymapSpec);
          var commandDispose = atom.commands.add('atom-workspace', commandName, _this2.build.bind(_this2, 'trigger'));
          settings[index].dispose = function () {
            keymapDispose.dispose();
            commandDispose.dispose();
          };
        });

        _this2.targets[p] = settings;
        _this2.targetsLoading[p] = false;
        _this2.updateStatusBar();
      });
    });

    Promise.all(pathPromise).then(function (entries) {
      if (entries.length === 0) {
        return;
      }

      if (atom.config.get('build.notificationOnRefresh')) {
        var rows = refreshPaths.map(function (p) {
          return _this2.targets[p].length + ' targets at: ' + p;
        });
        atom.notifications.addInfo('Build targets parsed.', {
          detail: rows.join('\n')
        });
      }
    });
  },

  selectActiveTarget: function selectActiveTarget() {
    var _this3 = this;

    var p = this.activePath();
    var targets = this.targets[p];
    var targetsView = new _targetsView2['default']();

    if (this.targetsLoading[p]) {
      return targetsView.setLoading('Loading project build targets…');
    }

    targetsView.setActiveTarget(this.activeTarget[p]);
    targetsView.setItems((targets || []).map(function (target) {
      return target.name;
    }));
    targetsView.awaitSelection().then(function (newTarget) {
      _this3.activeTarget[p] = newTarget;
      _this3.updateStatusBar();

      if (atom.config.get('build.selectTriggers')) {
        var workspaceElement = atom.views.getView(atom.workspace);
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      }
    })['catch'](function (err) {
      return targetsView.setError(err.message);
    });
  },

  replace: function replace(value, targetEnv) {
    if (value === undefined) value = '';

    var env = _lodash2['default'].extend({}, process.env, targetEnv);
    value = value.replace(/\$(\w+)/g, function (match, name) {
      return name in env ? env[name] : match;
    });

    var editor = atom.workspace.getActiveTextEditor();

    var projectPaths = _lodash2['default'].map(atom.project.getPaths(), function (projectPath) {
      try {
        return _fs2['default'].realpathSync(projectPath);
      } catch (e) {/* Do nothing. */}
    });

    var projectPath = projectPaths[0];
    if (editor && 'untitled' !== editor.getTitle()) {
      (function () {
        var activeFile = _fs2['default'].realpathSync(editor.getPath());
        var activeFilePath = _path2['default'].dirname(activeFile);
        projectPath = _lodash2['default'].find(projectPaths, function (p) {
          return activeFilePath && activeFilePath.startsWith(p);
        });
        value = value.replace(/{FILE_ACTIVE}/g, activeFile);
        value = value.replace(/{FILE_ACTIVE_PATH}/g, activeFilePath);
        value = value.replace(/{FILE_ACTIVE_NAME}/g, _path2['default'].basename(activeFile));
        value = value.replace(/{FILE_ACTIVE_NAME_BASE}/g, _path2['default'].basename(activeFile, _path2['default'].extname(activeFile)));
      })();
    }
    value = value.replace(/{PROJECT_PATH}/g, projectPath);
    if (atom.project.getRepositories[0]) {
      value = value.replace(/{REPO_BRANCH_SHORT}/g, atom.project.getRepositories()[0].getShortHead());
    }

    return value;
  },

  startNewBuild: function startNewBuild(source, targetName) {
    var _this4 = this;

    var p = this.activePath();
    targetName = targetName || this.activeTarget[p];

    Promise.resolve(this.targets[p]).then(function (targets) {
      if (!targets || 0 === targets.length) {
        throw new _buildError2['default']('No eligible build target.', 'No configuration to build this project exists.');
      }

      var target = targets.find(function (t) {
        return t.name === targetName;
      });
      _googleAnalytics2['default'].sendEvent('build', 'triggered');

      if (!target.exec) {
        throw new _buildError2['default']('Invalid build file.', 'No executable command specified.');
      }

      var env = _lodash2['default'].extend({}, process.env, target.env);
      _lodash2['default'].forEach(env, function (value, key, list) {
        list[key] = _this4.replace(value, target.env);
      });

      var exec = _this4.replace(target.exec, target.env);
      var args = target.args.map(function (arg) {
        return _this4.replace(arg, target.env);
      });
      var cwd = _this4.replace(target.cwd, target.env);
      var isWin = process.platform === 'win32';
      var shCmd = isWin ? 'cmd' : '/bin/sh';
      var shCmdArg = isWin ? '/C' : '-c';

      _this4.child = require('child_process').spawn(target.sh ? shCmd : exec, target.sh ? [shCmdArg, [_path2['default'].normalize(exec)].concat(args).join(' ')] : args, { cwd: cwd, env: env });

      _this4.stdout = new Buffer(0);
      _this4.child.stdout.on('data', function (buffer) {
        _this4.stdout = Buffer.concat([_this4.stdout, buffer]);
        _this4.buildView.append(buffer);
      });

      _this4.stderr = new Buffer(0);
      _this4.child.stderr.on('data', function (buffer) {
        _this4.stderr = Buffer.concat([_this4.stderr, buffer]);
        _this4.buildView.append(buffer);
      });

      _this4.child.on('error', function (err) {
        _this4.buildView.append((target.sh ? 'Unable to execute with sh: ' : 'Unable to execute: ') + exec + '\n');

        if (/\s/.test(exec) && !target.sh) {
          _this4.buildView.append('`cmd` cannot contain space. Use `args` for arguments.\n');
        }

        if ('ENOENT' === err.code) {
          _this4.buildView.append('Make sure `cmd` and `cwd` exists and have correct access permissions.\n');
          _this4.buildView.append('Build finds binaries in these folders: ' + process.env.PATH + '\n');
        }
      });

      _this4.child.on('close', function (exitCode) {
        _this4.errorMatcher.set(target.errorMatch, cwd, _this4.buildView.output.text());

        var success = 0 === exitCode;
        if (atom.config.get('build.matchedErrorFailsBuild')) {
          success = success && !_this4.errorMatcher.hasMatch();
        }
        _this4.buildView.buildFinished(success);
        _this4.statusBarView && _this4.statusBarView.setBuildSuccess(success);

        if (success) {
          _googleAnalytics2['default'].sendEvent('build', 'succeeded');
          _this4.finishedTimer = setTimeout(function () {
            _this4.buildView.detach();
          }, 1000);
        } else {
          if (atom.config.get('build.scrollOnError')) {
            _this4.errorMatcher.matchFirst();
          }
          _googleAnalytics2['default'].sendEvent('build', 'failed');
        }
        _this4.child = null;
      });

      _this4.buildView.buildStarted();
      _this4.buildView.append([target.sh ? 'Executing with sh:' : 'Executing:', exec].concat(_toConsumableArray(args), ['\n']).join(' '));
    })['catch'](function (err) {
      if (err instanceof _buildError2['default']) {
        if (source === 'save') {
          // If there is no eligible build tool, and cause of build was a save, stay quiet.
          return;
        }

        atom.notifications.addWarning(err.name, { detail: err.message });
      } else {
        atom.notifications.addError('Failed to build.', { detail: err.message });
      }
    });
  },

  abort: function abort(cb) {
    var _this5 = this;

    this.child.removeAllListeners('close');
    this.child.on('close', function () {
      _this5.child = null;
      cb && cb();
    });

    try {
      (0, _treeKill2['default'])(this.child.pid);
    } catch (e) {
      /* Something may have happened to the child (e.g. terminated by itself). Ignore this. */
    }

    this.child.killed = true;
  },

  build: function build(source, event) {
    var _this6 = this;

    clearTimeout(this.finishedTimer);

    this.doSaveConfirm(this.unsavedTextEditors(), function () {
      var next = _this6.startNewBuild.bind(_this6, source, event ? event.type.substr(14) : null);
      _this6.child ? _this6.abort(next) : next();
    });
  },

  doSaveConfirm: function doSaveConfirm(modifiedTextEditors, continuecb, cancelcb) {
    var saveAndContinue = function saveAndContinue(save) {
      modifiedTextEditors.forEach(function (textEditor) {
        return save && textEditor.save();
      });
      continuecb();
    };

    if (0 === _lodash2['default'].size(modifiedTextEditors) || atom.config.get('build.saveOnBuild')) {
      return saveAndContinue(true);
    }

    if (this.saveConfirmView) {
      this.saveConfirmView.destroy();
    }

    this.saveConfirmView = new _saveConfirmView2['default']();
    this.saveConfirmView.show(saveAndContinue, cancelcb);
  },

  unsavedTextEditors: function unsavedTextEditors() {
    return atom.workspace.getTextEditors().filter(function (textEditor) {
      return textEditor.isModified() && 'untitled' !== textEditor.getTitle();
    });
  },

  stop: function stop() {
    var _this7 = this;

    clearTimeout(this.finishedTimer);
    if (this.child) {
      if (this.child.killed) {
        // This child has been killed, but hasn't terminated. Hide it from user.
        this.child.removeAllListeners();
        this.child = null;
        this.buildView.buildAborted();
        return;
      }

      this.abort(function () {
        return _this7.buildView.buildAborted();
      });

      this.buildView.buildAbortInitiated();
    } else {
      this.buildView.reset();
    }
  },

  consumeBuilderLegacy: function consumeBuilderLegacy(builder) {
    return this.consumeBuilder((0, _providerLegacy2['default'])(builder));
  },

  consumeBuilder: function consumeBuilder(builders) {
    var _this8 = this;

    builders = Array.isArray(builders) ? builders : [builders];
    this.tools = _lodash2['default'].union(this.tools, builders);
    return new _atom.Disposable(function () {
      return _this8.tools = _lodash2['default'].difference(_this8.tools, builders);
    });
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    var _this9 = this;

    this.statusBarView = new _statusBarView2['default'](statusBar);
    this.statusBarView.onClick(function () {
      return _this9.selectActiveTarget();
    });
    this.statusBarView.attach();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBRWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O3NCQUNULFFBQVE7Ozs7b0JBQ0ssTUFBTTs7d0JBQ2hCLFdBQVc7Ozs7b0JBQ1gsTUFBTTs7OztzQkFFSixVQUFVOzs7OytCQUNELHFCQUFxQjs7Ozs2QkFDdkIsbUJBQW1COzs7OzJCQUNyQixnQkFBZ0I7Ozs7eUJBQ2xCLGNBQWM7Ozs7K0JBQ1Isb0JBQW9COzs7OzRCQUN2QixpQkFBaUI7Ozs7MEJBQ25CLGVBQWU7Ozs7eUJBQ2YsY0FBYzs7Ozs4QkFDVixtQkFBbUI7Ozs7QUFsQjlDLFdBQVcsQ0FBQzs7cUJBb0JHO0FBQ2IsUUFBTSxxQkFBUTs7QUFFZCxVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTs7OztBQUlsQyxhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxpQkFBaUIsQ0FBQztLQUN2Qzs7QUFFRCxRQUFJLENBQUMsU0FBUyxHQUFHLDRCQUFlLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxLQUFLLEdBQUcsd0JBQWMsQ0FBQztBQUM1QixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN6QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQzs7QUFFekIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQWtCLENBQUM7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QUFHLFFBQVEsR0FBRyxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBQzdELFFBQUksQ0FBQyxLQUFLLEdBQUcsb0JBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0MsV0FBTyxxQkFBZTthQUFNLE9BQUssS0FBSyxHQUFHLG9CQUFFLFVBQVUsQ0FBQyxPQUFLLEtBQUssRUFBRSxRQUFRLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDOUU7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsU0FBUyxFQUFFOzs7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBa0IsU0FBUyxDQUFDLENBQUM7QUFDbEQsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7YUFBTSxPQUFLLGtCQUFrQixFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDN0I7Q0FDRiIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2J1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQga2lsbCBmcm9tICd0cmVlLWtpbGwnO1xuaW1wb3J0IEdyaW0gZnJvbSAnZ3JpbSc7XG5cbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IFNhdmVDb25maXJtVmlldyBmcm9tICcuL3NhdmUtY29uZmlybS12aWV3JztcbmltcG9ydCBTdGF0dXNCYXJWaWV3IGZyb20gJy4vc3RhdHVzLWJhci12aWV3JztcbmltcG9ydCBUYXJnZXRzVmlldyBmcm9tICcuL3RhcmdldHMtdmlldyc7XG5pbXBvcnQgQnVpbGRWaWV3IGZyb20gJy4vYnVpbGQtdmlldyc7XG5pbXBvcnQgR29vZ2xlQW5hbHl0aWNzIGZyb20gJy4vZ29vZ2xlLWFuYWx5dGljcyc7XG5pbXBvcnQgRXJyb3JNYXRjaGVyIGZyb20gJy4vZXJyb3ItbWF0Y2hlcic7XG5pbXBvcnQgQnVpbGRFcnJvciBmcm9tICcuL2J1aWxkLWVycm9yJztcbmltcG9ydCBDdXN0b21GaWxlIGZyb20gJy4vYXRvbS1idWlsZCc7XG5pbXBvcnQgcHJvdmlkZXJMZWdhY3kgZnJvbSAnLi9wcm92aWRlci1sZWdhY3knO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbmZpZzogY29uZmlnLFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIGlmICghL153aW4vLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSkpIHtcbiAgICAgIC8vIE1hbnVhbGx5IGFwcGVuZCAvdXNyL2xvY2FsL2JpbiBhcyBpdCBtYXkgbm90IGJlIHNldCBvbiBzb21lIHN5c3RlbXMsXG4gICAgICAvLyBhbmQgaXQncyBjb21tb24gdG8gaGF2ZSBub2RlIGluc3RhbGxlZCBoZXJlLiBLZWVwIGl0IGF0IGVuZCBzbyBpdCB3b24ndFxuICAgICAgLy8gYWNjaWRlbnRpYWxseSBvdmVycmlkZSBhbnkgb3RoZXIgbm9kZSBpbnN0YWxsYXRpb25cbiAgICAgIHByb2Nlc3MuZW52LlBBVEggKz0gJzovdXNyL2xvY2FsL2Jpbic7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZFZpZXcgPSBuZXcgQnVpbGRWaWV3KCk7XG5cbiAgICB0aGlzLnRvb2xzID0gWyBDdXN0b21GaWxlIF07XG4gICAgdGhpcy5pbnN0YW5jZWRUb29scyA9IHt9OyAvLyBPcmRlcmVkIGJ5IHByb2plY3QgcGF0aFxuICAgIHRoaXMudGFyZ2V0cyA9IHt9O1xuICAgIHRoaXMuYWN0aXZlVGFyZ2V0ID0ge307XG4gICAgdGhpcy50YXJnZXRzTG9hZGluZyA9IHt9O1xuXG4gICAgdGhpcy5zdGRvdXQgPSBuZXcgQnVmZmVyKDApO1xuICAgIHRoaXMuc3RkZXJyID0gbmV3IEJ1ZmZlcigwKTtcbiAgICB0aGlzLmVycm9yTWF0Y2hlciA9IG5ldyBFcnJvck1hdGNoZXIoKTtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpyZWZyZXNoLXRhcmdldHMnLCAoKSA9PiB0aGlzLnJlZnJlc2hUYXJnZXRzKCkpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDp0cmlnZ2VyJywgKCkgPT4gdGhpcy5idWlsZCgndHJpZ2dlcicpKTtcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6c2VsZWN0LWFjdGl2ZS10YXJnZXQnLCAoKSA9PiB0aGlzLnNlbGVjdEFjdGl2ZVRhcmdldCgpKTtcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6c3RvcCcsICgpID0+IHRoaXMuc3RvcCgpKTtcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6Y29uZmlybScsICgpID0+IHtcbiAgICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2J1aWxkJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jbGljaygpO1xuICAgIH0pO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpuby1jb25maXJtJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2F2ZUNvbmZpcm1WaWV3KSB7XG4gICAgICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2J1aWxkJywgJ25vdCBjb25maXJtZWQnKTtcbiAgICAgICAgdGhpcy5zYXZlQ29uZmlybVZpZXcuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PiB7XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJykpIHtcbiAgICAgICAgICB0aGlzLmJ1aWxkKCdzYXZlJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSgoKSA9PiB0aGlzLnVwZGF0ZVN0YXR1c0JhcigpKTtcblxuICAgIHRoaXMuZXJyb3JNYXRjaGVyLm9uKCdlcnJvcicsIChtZXNzYWdlKSA9PiB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0Vycm9yIG1hdGNoaW5nIGZhaWxlZCEnLCB7IGRldGFpbDogbWVzc2FnZSB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuZXJyb3JNYXRjaGVyLm9uKCdtYXRjaGVkJywgKGlkKSA9PiB7XG4gICAgICB0aGlzLmJ1aWxkVmlldy5zY3JvbGxUbyhpZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmVycm9yTWF0Y2hlci5vbignbWF0Y2gnLCAodGV4dCwgaWQpID0+IHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5lcnJvck1hdGNoZXIuZ290by5iaW5kKHRoaXMuZXJyb3JNYXRjaGVyLCBpZCk7XG4gICAgICB0aGlzLmJ1aWxkVmlldy5saW5rKHRleHQsIGlkLCBjYWxsYmFjayk7XG4gICAgfSk7XG5cbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMoKCkgPT4gdGhpcy5yZWZyZXNoVGFyZ2V0cygpKTtcblxuICAgIGxldCBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICBjb25zdCBhZGRlZFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuZmlsdGVyKGVsID0+IHByb2plY3RQYXRocy5pbmRleE9mKGVsKSA9PT0gLTEpO1xuICAgICAgdGhpcy5yZWZyZXNoVGFyZ2V0cyhhZGRlZFBhdGhzKTtcbiAgICAgIHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIH0pO1xuXG4gICAgYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlcygpXG4gICAgICAuZmlsdGVyKHAgPT4gKCgoKHAubWV0YWRhdGEucHJvdmlkZWRTZXJ2aWNlcyB8fCB7fSkuYnVpbGRlciB8fCB7fSkudmVyc2lvbnMgfHwge30pWycxLjAuMCddKSlcbiAgICAgIC5mb3JFYWNoKHAgPT4gR3JpbS5kZXByZWNhdGUoJ1VzZSAyLjAuMCBvZiBidWlsZGVyIHNlcnZpY2UgQVBJIGluc3RlYWQnLCB7IHBhY2thZ2VOYW1lOiBwLm5hbWUgfSkpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgXy5tYXAodGhpcy5pbnN0YW5jZWRUb29scywgKHRvb2xzLCBjd2QpID0+IHRvb2xzLmZvckVhY2godG9vbCA9PiB7XG4gICAgICB0b29sLnJlbW92ZUFsbExpc3RlbmVycygncmVmcmVzaCcpO1xuICAgICAgdG9vbC5kZXN0cnVjdG9yICYmIHRvb2wuZGVzdHJ1Y3RvcigpO1xuICAgIH0pKTtcblxuICAgIGlmICh0aGlzLmNoaWxkKSB7XG4gICAgICB0aGlzLmNoaWxkLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAga2lsbCh0aGlzLmNoaWxkLnBpZCwgJ1NJR0tJTEwnKTtcbiAgICAgIHRoaXMuY2hpbGQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdHVzQmFyVmlldyAmJiB0aGlzLnN0YXR1c0JhclZpZXcuZGVzdHJveSgpO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuZmluaXNoZWRUaW1lcik7XG4gIH0sXG5cbiAgYWN0aXZlUGF0aCgpIHtcbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICghdGV4dEVkaXRvciB8fCAhdGV4dEVkaXRvci5nZXRQYXRoKCkpIHtcbiAgICAgIC8qIGRlZmF1bHQgdG8gYnVpbGRpbmcgdGhlIGZpcnN0IG9uZSBpZiBubyBlZGl0b3IgaXMgYWN0aXZlICovXG4gICAgICBpZiAoMCA9PT0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgIH1cblxuICAgIC8qIG90aGVyd2lzZSwgYnVpbGQgdGhlIG9uZSBpbiB0aGUgcm9vdCBvZiB0aGUgYWN0aXZlIGVkaXRvciAqL1xuICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5zb3J0KChhLCBiKSA9PiAoYi5sZW5ndGggLSBhLmxlbmd0aCkpLmZpbmQocCA9PiB7XG4gICAgICBjb25zdCByZWFscGF0aCA9IGZzLnJlYWxwYXRoU3luYyhwKTtcbiAgICAgIHJldHVybiB0ZXh0RWRpdG9yLmdldFBhdGgoKS5zdWJzdHIoMCwgcmVhbHBhdGgubGVuZ3RoKSA9PT0gcmVhbHBhdGg7XG4gICAgfSk7XG4gIH0sXG5cbiAgdXBkYXRlU3RhdHVzQmFyKCkge1xuICAgIGNvbnN0IGFjdGl2ZVRhcmdldCA9IHRoaXMuYWN0aXZlVGFyZ2V0W3RoaXMuYWN0aXZlUGF0aCgpXTtcbiAgICB0aGlzLnN0YXR1c0JhclZpZXcgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LnNldFRhcmdldChhY3RpdmVUYXJnZXQpO1xuICB9LFxuXG4gIGNtZERlZmF1bHRzKGN3ZCkge1xuICAgIHJldHVybiB7XG4gICAgICBlbnY6IHt9LFxuICAgICAgYXJnczogW10sXG4gICAgICBjd2Q6IGN3ZCxcbiAgICAgIHNoOiB0cnVlLFxuICAgICAgZXJyb3JNYXRjaDogJycsXG4gICAgICBkaXNwb3NlOiBGdW5jdGlvbi5wcm90b3R5cGVcbiAgICB9O1xuICB9LFxuXG4gIHNldHRpbmdzTWFrZVVuaXF1ZShzZXR0aW5ncykge1xuICAgIGxldCBkaWZmO1xuICAgIGNvbnN0IGFwcGVuZGVyID0gKHNldHRpbmcpID0+IHtcbiAgICAgIHNldHRpbmcuX3VuaXF1ZUluZGV4ID0gc2V0dGluZy5fdW5pcXVlSW5kZXggfHwgMTtcbiAgICAgIHNldHRpbmcuX29yaWdpbmFsTmFtZSA9IHNldHRpbmcuX29yaWdpbmFsTmFtZSB8fCBzZXR0aW5nLm5hbWU7XG4gICAgICBzZXR0aW5nLm5hbWUgPSBgJHtzZXR0aW5nLl9vcmlnaW5hbE5hbWV9IC0gJHtzZXR0aW5nLl91bmlxdWVJbmRleCsrfWA7XG4gICAgICBzZXR0aW5ncy5wdXNoKHNldHRpbmcpO1xuICAgIH07XG4gICAgbGV0IGkgPSAwO1xuICAgIGRvIHtcbiAgICAgIGNvbnN0IHVuaXF1ZVNldHRpbmdzID0gXy51bmlxKHNldHRpbmdzLCAnbmFtZScpO1xuICAgICAgZGlmZiA9IF8uZGlmZmVyZW5jZShzZXR0aW5ncywgdW5pcXVlU2V0dGluZ3MpO1xuICAgICAgc2V0dGluZ3MgPSB1bmlxdWVTZXR0aW5ncztcbiAgICAgIGRpZmYuZm9yRWFjaChhcHBlbmRlcik7XG4gICAgfSB3aGlsZSAoZGlmZi5sZW5ndGggPiAwICYmIGkrKyA8IDEwKTtcblxuICAgIHJldHVybiBzZXR0aW5ncztcbiAgfSxcblxuICByZWZyZXNoVGFyZ2V0cyhyZWZyZXNoUGF0aHMpIHtcbiAgICByZWZyZXNoUGF0aHMgPSByZWZyZXNoUGF0aHMgfHwgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG5cbiAgICBjb25zdCBwYXRoUHJvbWlzZSA9IHJlZnJlc2hQYXRocy5tYXAoKHApID0+IHtcbiAgICAgIHRoaXMudGFyZ2V0c0xvYWRpbmdbcF0gPSB0cnVlO1xuICAgICAgdGhpcy50YXJnZXRzW3BdID0gdGhpcy50YXJnZXRzW3BdIHx8IFtdO1xuXG4gICAgICB0aGlzLmluc3RhbmNlZFRvb2xzW3BdID0gKHRoaXMuaW5zdGFuY2VkVG9vbHNbcF0gfHwgW10pXG4gICAgICAgIC5tYXAodCA9PiB0LnJlbW92ZUFsbExpc3RlbmVycyAmJiB0LnJlbW92ZUFsbExpc3RlbmVycygncmVmcmVzaCcpKVxuICAgICAgICAuZmlsdGVyKCgpID0+IGZhbHNlKTsgLy8gSnVzdCBlbXB0eSB0aGUgYXJyYXlcblxuICAgICAgY29uc3Qgc2V0dGluZ3NQcm9taXNlID0gdGhpcy50b29sc1xuICAgICAgICAubWFwKFRvb2wgPT4gbmV3IFRvb2wocCkpXG4gICAgICAgIC5maWx0ZXIodG9vbCA9PiB0b29sLmlzRWxpZ2libGUoKSlcbiAgICAgICAgLm1hcCh0b29sID0+IHtcbiAgICAgICAgICB0aGlzLmluc3RhbmNlZFRvb2xzW3BdLnB1c2godG9vbCk7XG4gICAgICAgICAgR29vZ2xlQW5hbHl0aWNzLnNlbmRFdmVudCgnYnVpbGQnLCAndG9vbCBlbGlnaWJsZScsIHRvb2wuZ2V0TmljZU5hbWUoKSk7XG5cbiAgICAgICAgICB0b29sLm9uICYmIHRvb2wub24oJ3JlZnJlc2gnLCB0aGlzLnJlZnJlc2hUYXJnZXRzLmJpbmQodGhpcywgWyBwIF0pKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0b29sLnNldHRpbmdzKCkpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdJbnZhbGlkIGJ1aWxkIGZpbGUuJywge1xuICAgICAgICAgICAgICAgIGRldGFpbDogJ1lvdSBoYXZlIGEgc3ludGF4IGVycm9yIGluIHlvdXIgYnVpbGQgZmlsZTogJyArIGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPb29wcy4gU29tZXRoaW5nIHdlbnQgd3JvbmcuJywge1xuICAgICAgICAgICAgICAgIGRldGFpbDogZXJyLm1lc3NhZ2UgKyAoZXJyLnN0YWNrID8gJ1xcbicgKyBlcnIuc3RhY2sgOiAnJyksXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwoc2V0dGluZ3NQcm9taXNlKS50aGVuKChzZXR0aW5ncykgPT4ge1xuICAgICAgICBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3NNYWtlVW5pcXVlKFtdLmNvbmNhdC5hcHBseShbXSwgc2V0dGluZ3MpLmZpbHRlcihCb29sZWFuKS5tYXAoc2V0dGluZyA9PlxuICAgICAgICAgIF8uZGVmYXVsdHMoc2V0dGluZywgdGhpcy5jbWREZWZhdWx0cyhwKSlcbiAgICAgICAgKSk7XG5cbiAgICAgICAgaWYgKF8uaXNOdWxsKHRoaXMuYWN0aXZlVGFyZ2V0W3BdKSB8fCAhc2V0dGluZ3MuZmluZChzID0+IHMubmFtZSA9PT0gdGhpcy5hY3RpdmVUYXJnZXRbcF0pKSB7XG4gICAgICAgICAgLyogQWN0aXZlIHRhcmdldCBoYXMgYmVlbiByZW1vdmVkIG9yIG5vdCBzZXQuIFNldCBpdCB0byB0aGUgaGlnaGVzdCBwcmlvIHRhcmdldCAqL1xuICAgICAgICAgIHRoaXMuYWN0aXZlVGFyZ2V0W3BdID0gc2V0dGluZ3NbMF0gPyBzZXR0aW5nc1swXS5uYW1lIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50YXJnZXRzW3BdLmZvckVhY2godGFyZ2V0ID0+IHRhcmdldC5kaXNwb3NlKCkpO1xuXG4gICAgICAgIHNldHRpbmdzLmZvckVhY2goKHNldHRpbmcsIGluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKCFzZXR0aW5nLmtleW1hcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2tleW1hcCcsICdyZWdpc3RlcmVkJywgc2V0dGluZy5rZXltYXApO1xuICAgICAgICAgIGNvbnN0IGNvbW1hbmROYW1lID0gJ2J1aWxkOnRyaWdnZXI6JyArIHNldHRpbmcubmFtZTtcbiAgICAgICAgICBjb25zdCBrZXltYXBTcGVjID0geyAnYXRvbS13b3Jrc3BhY2UsIGF0b20tdGV4dC1lZGl0b3InOiB7fSB9O1xuICAgICAgICAgIGtleW1hcFNwZWNbJ2F0b20td29ya3NwYWNlLCBhdG9tLXRleHQtZWRpdG9yJ11bc2V0dGluZy5rZXltYXBdID0gY29tbWFuZE5hbWU7XG4gICAgICAgICAgY29uc3Qga2V5bWFwRGlzcG9zZSA9IGF0b20ua2V5bWFwcy5hZGQoc2V0dGluZy5uYW1lLCBrZXltYXBTcGVjKTtcbiAgICAgICAgICBjb25zdCBjb21tYW5kRGlzcG9zZSA9IGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIGNvbW1hbmROYW1lLCB0aGlzLmJ1aWxkLmJpbmQodGhpcywgJ3RyaWdnZXInKSk7XG4gICAgICAgICAgc2V0dGluZ3NbaW5kZXhdLmRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICBrZXltYXBEaXNwb3NlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGNvbW1hbmREaXNwb3NlLmRpc3Bvc2UoKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRhcmdldHNbcF0gPSBzZXR0aW5ncztcbiAgICAgICAgdGhpcy50YXJnZXRzTG9hZGluZ1twXSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXR1c0JhcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBQcm9taXNlLmFsbChwYXRoUHJvbWlzZSkudGhlbigoZW50cmllcykgPT4ge1xuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQubm90aWZpY2F0aW9uT25SZWZyZXNoJykpIHtcbiAgICAgICAgY29uc3Qgcm93cyA9IHJlZnJlc2hQYXRocy5tYXAocCA9PiBgJHt0aGlzLnRhcmdldHNbcF0ubGVuZ3RofSB0YXJnZXRzIGF0OiAke3B9YCk7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZCB0YXJnZXRzIHBhcnNlZC4nLCB7XG4gICAgICAgICAgZGV0YWlsOiByb3dzLmpvaW4oJ1xcbicpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIHNlbGVjdEFjdGl2ZVRhcmdldCgpIHtcbiAgICBjb25zdCBwID0gdGhpcy5hY3RpdmVQYXRoKCk7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMudGFyZ2V0c1twXTtcbiAgICBjb25zdCB0YXJnZXRzVmlldyA9IG5ldyBUYXJnZXRzVmlldygpO1xuXG4gICAgaWYgKHRoaXMudGFyZ2V0c0xvYWRpbmdbcF0pIHtcbiAgICAgIHJldHVybiB0YXJnZXRzVmlldy5zZXRMb2FkaW5nKCdMb2FkaW5nIHByb2plY3QgYnVpbGQgdGFyZ2V0c1xcdTIwMjYnKTtcbiAgICB9XG5cbiAgICB0YXJnZXRzVmlldy5zZXRBY3RpdmVUYXJnZXQodGhpcy5hY3RpdmVUYXJnZXRbcF0pO1xuICAgIHRhcmdldHNWaWV3LnNldEl0ZW1zKCh0YXJnZXRzIHx8IFtdKS5tYXAodGFyZ2V0ID0+IHRhcmdldC5uYW1lKSk7XG4gICAgdGFyZ2V0c1ZpZXcuYXdhaXRTZWxlY3Rpb24oKS50aGVuKChuZXdUYXJnZXQpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZlVGFyZ2V0W3BdID0gbmV3VGFyZ2V0O1xuICAgICAgdGhpcy51cGRhdGVTdGF0dXNCYXIoKTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuc2VsZWN0VHJpZ2dlcnMnKSkge1xuICAgICAgICBjb25zdCB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHRhcmdldHNWaWV3LnNldEVycm9yKGVyci5tZXNzYWdlKSk7XG4gIH0sXG5cbiAgcmVwbGFjZSh2YWx1ZSA9ICcnLCB0YXJnZXRFbnYpIHtcbiAgICBjb25zdCBlbnYgPSBfLmV4dGVuZCh7fSwgcHJvY2Vzcy5lbnYsIHRhcmdldEVudik7XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXCQoXFx3KykvZywgZnVuY3Rpb24gKG1hdGNoLCBuYW1lKSB7XG4gICAgICByZXR1cm4gbmFtZSBpbiBlbnYgPyBlbnZbbmFtZV0gOiBtYXRjaDtcbiAgICB9KTtcblxuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblxuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IF8ubWFwKGF0b20ucHJvamVjdC5nZXRQYXRocygpLCAocHJvamVjdFBhdGgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmcy5yZWFscGF0aFN5bmMocHJvamVjdFBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBEbyBub3RoaW5nLiAqLyB9XG4gICAgfSk7XG5cbiAgICBsZXQgcHJvamVjdFBhdGggPSBwcm9qZWN0UGF0aHNbMF07XG4gICAgaWYgKGVkaXRvciAmJiAndW50aXRsZWQnICE9PSBlZGl0b3IuZ2V0VGl0bGUoKSkge1xuICAgICAgY29uc3QgYWN0aXZlRmlsZSA9IGZzLnJlYWxwYXRoU3luYyhlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgIGNvbnN0IGFjdGl2ZUZpbGVQYXRoID0gcGF0aC5kaXJuYW1lKGFjdGl2ZUZpbGUpO1xuICAgICAgcHJvamVjdFBhdGggPSBfLmZpbmQocHJvamVjdFBhdGhzLCAocCkgPT4gYWN0aXZlRmlsZVBhdGggJiYgYWN0aXZlRmlsZVBhdGguc3RhcnRzV2l0aChwKSk7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL3tGSUxFX0FDVElWRX0vZywgYWN0aXZlRmlsZSk7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL3tGSUxFX0FDVElWRV9QQVRIfS9nLCBhY3RpdmVGaWxlUGF0aCk7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL3tGSUxFX0FDVElWRV9OQU1FfS9nLCBwYXRoLmJhc2VuYW1lKGFjdGl2ZUZpbGUpKTtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgve0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0vZywgcGF0aC5iYXNlbmFtZShhY3RpdmVGaWxlLCBwYXRoLmV4dG5hbWUoYWN0aXZlRmlsZSkpKTtcbiAgICB9XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC97UFJPSkVDVF9QQVRIfS9nLCBwcm9qZWN0UGF0aCk7XG4gICAgaWYgKGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXNbMF0pIHtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgve1JFUE9fQlJBTkNIX1NIT1JUfS9nLCBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbMF0uZ2V0U2hvcnRIZWFkKCkpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfSxcblxuICBzdGFydE5ld0J1aWxkKHNvdXJjZSwgdGFyZ2V0TmFtZSkge1xuICAgIGNvbnN0IHAgPSB0aGlzLmFjdGl2ZVBhdGgoKTtcbiAgICB0YXJnZXROYW1lID0gdGFyZ2V0TmFtZSB8fCB0aGlzLmFjdGl2ZVRhcmdldFtwXTtcblxuICAgIFByb21pc2UucmVzb2x2ZSh0aGlzLnRhcmdldHNbcF0pLnRoZW4odGFyZ2V0cyA9PiB7XG4gICAgICBpZiAoIXRhcmdldHMgfHwgMCA9PT0gdGFyZ2V0cy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJ1aWxkRXJyb3IoJ05vIGVsaWdpYmxlIGJ1aWxkIHRhcmdldC4nLCAnTm8gY29uZmlndXJhdGlvbiB0byBidWlsZCB0aGlzIHByb2plY3QgZXhpc3RzLicpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0YXJnZXQgPSB0YXJnZXRzLmZpbmQodCA9PiB0Lm5hbWUgPT09IHRhcmdldE5hbWUpO1xuICAgICAgR29vZ2xlQW5hbHl0aWNzLnNlbmRFdmVudCgnYnVpbGQnLCAndHJpZ2dlcmVkJyk7XG5cbiAgICAgIGlmICghdGFyZ2V0LmV4ZWMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJ1aWxkRXJyb3IoJ0ludmFsaWQgYnVpbGQgZmlsZS4nLCAnTm8gZXhlY3V0YWJsZSBjb21tYW5kIHNwZWNpZmllZC4nKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZW52ID0gXy5leHRlbmQoe30sIHByb2Nlc3MuZW52LCB0YXJnZXQuZW52KTtcbiAgICAgIF8uZm9yRWFjaChlbnYsICh2YWx1ZSwga2V5LCBsaXN0KSA9PiB7XG4gICAgICAgIGxpc3Rba2V5XSA9IHRoaXMucmVwbGFjZSh2YWx1ZSwgdGFyZ2V0LmVudik7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZXhlYyA9IHRoaXMucmVwbGFjZSh0YXJnZXQuZXhlYywgdGFyZ2V0LmVudik7XG4gICAgICBjb25zdCBhcmdzID0gdGFyZ2V0LmFyZ3MubWFwKGFyZyA9PiB0aGlzLnJlcGxhY2UoYXJnLCB0YXJnZXQuZW52KSk7XG4gICAgICBjb25zdCBjd2QgPSB0aGlzLnJlcGxhY2UodGFyZ2V0LmN3ZCwgdGFyZ2V0LmVudik7XG4gICAgICBjb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG4gICAgICBjb25zdCBzaENtZCA9IGlzV2luID8gJ2NtZCcgOiAnL2Jpbi9zaCc7XG4gICAgICBjb25zdCBzaENtZEFyZyA9IGlzV2luID8gJy9DJyA6ICctYyc7XG5cbiAgICAgIHRoaXMuY2hpbGQgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd24oXG4gICAgICAgIHRhcmdldC5zaCA/IHNoQ21kIDogZXhlYyxcbiAgICAgICAgdGFyZ2V0LnNoID8gWyBzaENtZEFyZywgWyBwYXRoLm5vcm1hbGl6ZShleGVjKSBdLmNvbmNhdChhcmdzKS5qb2luKCcgJykgXSA6IGFyZ3MsXG4gICAgICAgIHsgY3dkOiBjd2QsIGVudjogZW52IH1cbiAgICAgICk7XG5cbiAgICAgIHRoaXMuc3Rkb3V0ID0gbmV3IEJ1ZmZlcigwKTtcbiAgICAgIHRoaXMuY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGJ1ZmZlcikgPT4ge1xuICAgICAgICB0aGlzLnN0ZG91dCA9IEJ1ZmZlci5jb25jYXQoWyB0aGlzLnN0ZG91dCwgYnVmZmVyIF0pO1xuICAgICAgICB0aGlzLmJ1aWxkVmlldy5hcHBlbmQoYnVmZmVyKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN0ZGVyciA9IG5ldyBCdWZmZXIoMCk7XG4gICAgICB0aGlzLmNoaWxkLnN0ZGVyci5vbignZGF0YScsIChidWZmZXIpID0+IHtcbiAgICAgICAgdGhpcy5zdGRlcnIgPSBCdWZmZXIuY29uY2F0KFsgdGhpcy5zdGRlcnIsIGJ1ZmZlciBdKTtcbiAgICAgICAgdGhpcy5idWlsZFZpZXcuYXBwZW5kKGJ1ZmZlcik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jaGlsZC5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMuYnVpbGRWaWV3LmFwcGVuZCgodGFyZ2V0LnNoID8gJ1VuYWJsZSB0byBleGVjdXRlIHdpdGggc2g6ICcgOiAnVW5hYmxlIHRvIGV4ZWN1dGU6ICcpICsgZXhlYyArICdcXG4nKTtcblxuICAgICAgICBpZiAoL1xccy8udGVzdChleGVjKSAmJiAhdGFyZ2V0LnNoKSB7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcuYXBwZW5kKCdgY21kYCBjYW5ub3QgY29udGFpbiBzcGFjZS4gVXNlIGBhcmdzYCBmb3IgYXJndW1lbnRzLlxcbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCdFTk9FTlQnID09PSBlcnIuY29kZSkge1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LmFwcGVuZCgnTWFrZSBzdXJlIGBjbWRgIGFuZCBgY3dkYCBleGlzdHMgYW5kIGhhdmUgY29ycmVjdCBhY2Nlc3MgcGVybWlzc2lvbnMuXFxuJyk7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcuYXBwZW5kKGBCdWlsZCBmaW5kcyBiaW5hcmllcyBpbiB0aGVzZSBmb2xkZXJzOiAke3Byb2Nlc3MuZW52LlBBVEh9XFxuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNoaWxkLm9uKCdjbG9zZScsIChleGl0Q29kZSkgPT4ge1xuICAgICAgICB0aGlzLmVycm9yTWF0Y2hlci5zZXQodGFyZ2V0LmVycm9yTWF0Y2gsIGN3ZCwgdGhpcy5idWlsZFZpZXcub3V0cHV0LnRleHQoKSk7XG5cbiAgICAgICAgbGV0IHN1Y2Nlc3MgPSAoMCA9PT0gZXhpdENvZGUpO1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5tYXRjaGVkRXJyb3JGYWlsc0J1aWxkJykpIHtcbiAgICAgICAgICBzdWNjZXNzID0gc3VjY2VzcyAmJiAhdGhpcy5lcnJvck1hdGNoZXIuaGFzTWF0Y2goKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ1aWxkVmlldy5idWlsZEZpbmlzaGVkKHN1Y2Nlc3MpO1xuICAgICAgICB0aGlzLnN0YXR1c0JhclZpZXcgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LnNldEJ1aWxkU3VjY2VzcyhzdWNjZXNzKTtcblxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2J1aWxkJywgJ3N1Y2NlZWRlZCcpO1xuICAgICAgICAgIHRoaXMuZmluaXNoZWRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5idWlsZFZpZXcuZGV0YWNoKCk7XG4gICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuc2Nyb2xsT25FcnJvcicpKSB7XG4gICAgICAgICAgICB0aGlzLmVycm9yTWF0Y2hlci5tYXRjaEZpcnN0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2J1aWxkJywgJ2ZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hpbGQgPSBudWxsO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuYnVpbGRWaWV3LmJ1aWxkU3RhcnRlZCgpO1xuICAgICAgdGhpcy5idWlsZFZpZXcuYXBwZW5kKFsgKHRhcmdldC5zaCA/ICdFeGVjdXRpbmcgd2l0aCBzaDonIDogJ0V4ZWN1dGluZzonKSwgZXhlYywgLi4uYXJncywgJ1xcbiddLmpvaW4oJyAnKSk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEJ1aWxkRXJyb3IpIHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gJ3NhdmUnKSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gZWxpZ2libGUgYnVpbGQgdG9vbCwgYW5kIGNhdXNlIG9mIGJ1aWxkIHdhcyBhIHNhdmUsIHN0YXkgcXVpZXQuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoZXJyLm5hbWUsIHsgZGV0YWlsOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHRvIGJ1aWxkLicsIHsgZGV0YWlsOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBhYm9ydChjYikge1xuICAgIHRoaXMuY2hpbGQucmVtb3ZlQWxsTGlzdGVuZXJzKCdjbG9zZScpO1xuICAgIHRoaXMuY2hpbGQub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgICBjYiAmJiBjYigpO1xuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGtpbGwodGhpcy5jaGlsZC5waWQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8qIFNvbWV0aGluZyBtYXkgaGF2ZSBoYXBwZW5lZCB0byB0aGUgY2hpbGQgKGUuZy4gdGVybWluYXRlZCBieSBpdHNlbGYpLiBJZ25vcmUgdGhpcy4gKi9cbiAgICB9XG5cbiAgICB0aGlzLmNoaWxkLmtpbGxlZCA9IHRydWU7XG4gIH0sXG5cbiAgYnVpbGQoc291cmNlLCBldmVudCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbmlzaGVkVGltZXIpO1xuXG4gICAgdGhpcy5kb1NhdmVDb25maXJtKHRoaXMudW5zYXZlZFRleHRFZGl0b3JzKCksICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSB0aGlzLnN0YXJ0TmV3QnVpbGQuYmluZCh0aGlzLCBzb3VyY2UsIGV2ZW50ID8gZXZlbnQudHlwZS5zdWJzdHIoMTQpIDogbnVsbCk7XG4gICAgICB0aGlzLmNoaWxkID8gdGhpcy5hYm9ydChuZXh0KSA6IG5leHQoKTtcbiAgICB9KTtcbiAgfSxcblxuICBkb1NhdmVDb25maXJtKG1vZGlmaWVkVGV4dEVkaXRvcnMsIGNvbnRpbnVlY2IsIGNhbmNlbGNiKSB7XG4gICAgY29uc3Qgc2F2ZUFuZENvbnRpbnVlID0gKHNhdmUpID0+IHtcbiAgICAgIG1vZGlmaWVkVGV4dEVkaXRvcnMuZm9yRWFjaCgodGV4dEVkaXRvcikgPT4gc2F2ZSAmJiB0ZXh0RWRpdG9yLnNhdmUoKSk7XG4gICAgICBjb250aW51ZWNiKCk7XG4gICAgfTtcblxuICAgIGlmICgwID09PSBfLnNpemUobW9kaWZpZWRUZXh0RWRpdG9ycykgfHwgYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zYXZlT25CdWlsZCcpKSB7XG4gICAgICByZXR1cm4gc2F2ZUFuZENvbnRpbnVlKHRydWUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnNhdmVDb25maXJtVmlldykge1xuICAgICAgdGhpcy5zYXZlQ29uZmlybVZpZXcuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3ID0gbmV3IFNhdmVDb25maXJtVmlldygpO1xuICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3LnNob3coc2F2ZUFuZENvbnRpbnVlLCBjYW5jZWxjYik7XG4gIH0sXG5cbiAgdW5zYXZlZFRleHRFZGl0b3JzKCkge1xuICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZpbHRlcigodGV4dEVkaXRvcikgPT4ge1xuICAgICAgcmV0dXJuIHRleHRFZGl0b3IuaXNNb2RpZmllZCgpICYmICgndW50aXRsZWQnICE9PSB0ZXh0RWRpdG9yLmdldFRpdGxlKCkpO1xuICAgIH0pO1xuICB9LFxuXG4gIHN0b3AoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuZmluaXNoZWRUaW1lcik7XG4gICAgaWYgKHRoaXMuY2hpbGQpIHtcbiAgICAgIGlmICh0aGlzLmNoaWxkLmtpbGxlZCkge1xuICAgICAgICAvLyBUaGlzIGNoaWxkIGhhcyBiZWVuIGtpbGxlZCwgYnV0IGhhc24ndCB0ZXJtaW5hdGVkLiBIaWRlIGl0IGZyb20gdXNlci5cbiAgICAgICAgdGhpcy5jaGlsZC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgICAgIHRoaXMuYnVpbGRWaWV3LmJ1aWxkQWJvcnRlZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWJvcnQoKCkgPT4gdGhpcy5idWlsZFZpZXcuYnVpbGRBYm9ydGVkKCkpO1xuXG4gICAgICB0aGlzLmJ1aWxkVmlldy5idWlsZEFib3J0SW5pdGlhdGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LnJlc2V0KCk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVCdWlsZGVyTGVnYWN5KGJ1aWxkZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdW1lQnVpbGRlcihwcm92aWRlckxlZ2FjeShidWlsZGVyKSk7XG4gIH0sXG5cbiAgY29uc3VtZUJ1aWxkZXIoYnVpbGRlcnMpIHtcbiAgICBidWlsZGVycyA9IEFycmF5LmlzQXJyYXkoYnVpbGRlcnMpID8gYnVpbGRlcnMgOiBbIGJ1aWxkZXJzIF07XG4gICAgdGhpcy50b29scyA9IF8udW5pb24odGhpcy50b29scywgYnVpbGRlcnMpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLnRvb2xzID0gXy5kaWZmZXJlbmNlKHRoaXMudG9vbHMsIGJ1aWxkZXJzKSk7XG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLnN0YXR1c0JhclZpZXcgPSBuZXcgU3RhdHVzQmFyVmlldyhzdGF0dXNCYXIpO1xuICAgIHRoaXMuc3RhdHVzQmFyVmlldy5vbkNsaWNrKCgpID0+IHRoaXMuc2VsZWN0QWN0aXZlVGFyZ2V0KCkpO1xuICAgIHRoaXMuc3RhdHVzQmFyVmlldy5hdHRhY2goKTtcbiAgfVxufTtcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/lib/build.js
