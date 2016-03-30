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
  config: {
    panelVisibility: {
      title: 'Panel Visibility',
      description: 'Set when the build panel should be visible.',
      type: 'string',
      'default': 'Toggle',
      'enum': ['Toggle', 'Keep Visible', 'Show on Error', 'Hidden'],
      order: 1
    },
    buildOnSave: {
      title: 'Automatically build on save',
      description: 'Automatically build your project each time an editor is saved.',
      type: 'boolean',
      'default': false,
      order: 2
    },
    saveOnBuild: {
      title: 'Automatically save on build',
      description: 'Automatically save all edited files when triggering a build.',
      type: 'boolean',
      'default': false,
      order: 3
    },
    matchedErrorFailsBuild: {
      title: 'Any matched error will fail the build',
      description: 'Even if the build has a return code of zero it is marked as "failed" if any error is being matched in the output.',
      type: 'boolean',
      'default': true,
      order: 4
    },
    scrollOnError: {
      title: 'Automatically scroll on build error',
      description: 'Automatically scroll to first matched error when a build failed.',
      type: 'boolean',
      'default': false,
      order: 5
    },
    stealFocus: {
      title: 'Steal Focus',
      description: 'Steal focus when opening build panel.',
      type: 'boolean',
      'default': true,
      order: 6
    },
    selectTriggers: {
      title: 'Selecting new target triggers the build',
      description: 'When selecting a new target (through status-bar, cmd-alt-t, etc), the newly selected target will be triggered.',
      type: 'boolean',
      'default': true,
      order: 7
    },
    monocleHeight: {
      title: 'Monocle Height',
      description: 'How much of the workspace to use for build panel when it is "maximized".',
      type: 'number',
      'default': 0.75,
      minimum: 0.1,
      maximum: 0.9,
      order: 8
    },
    minimizedHeight: {
      title: 'Minimized Height',
      description: 'How much of the workspace to use for build panel when it is "minimized".',
      type: 'number',
      'default': 0.15,
      minimum: 0.1,
      maximum: 0.9,
      order: 9
    },
    panelOrientation: {
      title: 'Panel Orientation',
      description: 'Where to attach the build panel',
      type: 'string',
      'default': 'Bottom',
      'enum': ['Bottom', 'Top', 'Left', 'Right'],
      order: 10
    },
    statusBar: {
      title: 'Status Bar',
      description: 'Where to place the status bar. Set to `Disable` to disable status bar display.',
      type: 'string',
      'default': 'Left',
      'enum': ['Left', 'Right', 'Disable'],
      order: 11
    },
    statusBarPriority: {
      title: 'Priority on Status Bar',
      description: 'Lower priority tiles are placed further to the left/right, depends on where you choose to place Status Bar.',
      type: 'number',
      'default': -1000,
      order: 12
    }
  },

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

      var rows = refreshPaths.map(function (p) {
        return _this2.targets[p].length + ' targets at: ' + p;
      });
      atom.notifications.addInfo('Build targets parsed.', {
        detail: rows.join('\n')
      });
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

      _this4.child = require('child_process').spawn(target.sh ? '/bin/sh' : exec, target.sh ? ['-c', [exec].concat(args).join(' ')] : args, { cwd: cwd, env: env });

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBRWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O3NCQUNULFFBQVE7Ozs7b0JBQ0ssTUFBTTs7d0JBQ2hCLFdBQVc7Ozs7b0JBQ1gsTUFBTTs7OzsrQkFFSyxxQkFBcUI7Ozs7NkJBQ3ZCLG1CQUFtQjs7OzsyQkFDckIsZ0JBQWdCOzs7O3lCQUNsQixjQUFjOzs7OytCQUNSLG9CQUFvQjs7Ozs0QkFDdkIsaUJBQWlCOzs7OzBCQUNuQixlQUFlOzs7O3lCQUNmLGNBQWM7Ozs7OEJBQ1YsbUJBQW1COzs7O0FBakI5QyxXQUFXLENBQUM7O3FCQW1CRztBQUNiLFFBQU0sRUFBRTtBQUNOLG1CQUFlLEVBQUU7QUFDZixXQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLGlCQUFXLEVBQUUsNkNBQTZDO0FBQzFELFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsUUFBUTtBQUNqQixjQUFNLENBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFFO0FBQzdELFdBQUssRUFBRSxDQUFDO0tBQ1Q7QUFDRCxlQUFXLEVBQUU7QUFDWCxXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGlCQUFXLEVBQUUsZ0VBQWdFO0FBQzdFLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztBQUNkLFdBQUssRUFBRSxDQUFDO0tBQ1Q7QUFDRCxlQUFXLEVBQUU7QUFDWCxXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGlCQUFXLEVBQUUsOERBQThEO0FBQzNFLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztBQUNkLFdBQUssRUFBRSxDQUFDO0tBQ1Q7QUFDRCwwQkFBc0IsRUFBRTtBQUN0QixXQUFLLEVBQUUsdUNBQXVDO0FBQzlDLGlCQUFXLEVBQUUsbUhBQW1IO0FBQ2hJLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFB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QyxPQUFPLENBQUM7YUFBTSxPQUFLLGtCQUFrQixFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDN0I7Q0FDRiIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2J1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQga2lsbCBmcm9tICd0cmVlLWtpbGwnO1xuaW1wb3J0IEdyaW0gZnJvbSAnZ3JpbSc7XG5cbmltcG9ydCBTYXZlQ29uZmlybVZpZXcgZnJvbSAnLi9zYXZlLWNvbmZpcm0tdmlldyc7XG5pbXBvcnQgU3RhdHVzQmFyVmlldyBmcm9tICcuL3N0YXR1cy1iYXItdmlldyc7XG5pbXBvcnQgVGFyZ2V0c1ZpZXcgZnJvbSAnLi90YXJnZXRzLXZpZXcnO1xuaW1wb3J0IEJ1aWxkVmlldyBmcm9tICcuL2J1aWxkLXZpZXcnO1xuaW1wb3J0IEdvb2dsZUFuYWx5dGljcyBmcm9tICcuL2dvb2dsZS1hbmFseXRpY3MnO1xuaW1wb3J0IEVycm9yTWF0Y2hlciBmcm9tICcuL2Vycm9yLW1hdGNoZXInO1xuaW1wb3J0IEJ1aWxkRXJyb3IgZnJvbSAnLi9idWlsZC1lcnJvcic7XG5pbXBvcnQgQ3VzdG9tRmlsZSBmcm9tICcuL2F0b20tYnVpbGQnO1xuaW1wb3J0IHByb3ZpZGVyTGVnYWN5IGZyb20gJy4vcHJvdmlkZXItbGVnYWN5JztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IHtcbiAgICBwYW5lbFZpc2liaWxpdHk6IHtcbiAgICAgIHRpdGxlOiAnUGFuZWwgVmlzaWJpbGl0eScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NldCB3aGVuIHRoZSBidWlsZCBwYW5lbCBzaG91bGQgYmUgdmlzaWJsZS4nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnVG9nZ2xlJyxcbiAgICAgIGVudW06IFsgJ1RvZ2dsZScsICdLZWVwIFZpc2libGUnLCAnU2hvdyBvbiBFcnJvcicsICdIaWRkZW4nIF0sXG4gICAgICBvcmRlcjogMVxuICAgIH0sXG4gICAgYnVpbGRPblNhdmU6IHtcbiAgICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSBidWlsZCBvbiBzYXZlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBidWlsZCB5b3VyIHByb2plY3QgZWFjaCB0aW1lIGFuIGVkaXRvciBpcyBzYXZlZC4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogMlxuICAgIH0sXG4gICAgc2F2ZU9uQnVpbGQ6IHtcbiAgICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSBzYXZlIG9uIGJ1aWxkJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBzYXZlIGFsbCBlZGl0ZWQgZmlsZXMgd2hlbiB0cmlnZ2VyaW5nIGEgYnVpbGQuJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgb3JkZXI6IDNcbiAgICB9LFxuICAgIG1hdGNoZWRFcnJvckZhaWxzQnVpbGQ6IHtcbiAgICAgIHRpdGxlOiAnQW55IG1hdGNoZWQgZXJyb3Igd2lsbCBmYWlsIHRoZSBidWlsZCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ0V2ZW4gaWYgdGhlIGJ1aWxkIGhhcyBhIHJldHVybiBjb2RlIG9mIHplcm8gaXQgaXMgbWFya2VkIGFzIFwiZmFpbGVkXCIgaWYgYW55IGVycm9yIGlzIGJlaW5nIG1hdGNoZWQgaW4gdGhlIG91dHB1dC4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIG9yZGVyOiA0XG4gICAgfSxcbiAgICBzY3JvbGxPbkVycm9yOiB7XG4gICAgICB0aXRsZTogJ0F1dG9tYXRpY2FsbHkgc2Nyb2xsIG9uIGJ1aWxkIGVycm9yJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBzY3JvbGwgdG8gZmlyc3QgbWF0Y2hlZCBlcnJvciB3aGVuIGEgYnVpbGQgZmFpbGVkLicsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiA1XG4gICAgfSxcbiAgICBzdGVhbEZvY3VzOiB7XG4gICAgICB0aXRsZTogJ1N0ZWFsIEZvY3VzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3RlYWwgZm9jdXMgd2hlbiBvcGVuaW5nIGJ1aWxkIHBhbmVsLicsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgb3JkZXI6IDZcbiAgICB9LFxuICAgIHNlbGVjdFRyaWdnZXJzOiB7XG4gICAgICB0aXRsZTogJ1NlbGVjdGluZyBuZXcgdGFyZ2V0IHRyaWdnZXJzIHRoZSBidWlsZCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gc2VsZWN0aW5nIGEgbmV3IHRhcmdldCAodGhyb3VnaCBzdGF0dXMtYmFyLCBjbWQtYWx0LXQsIGV0YyksIHRoZSBuZXdseSBzZWxlY3RlZCB0YXJnZXQgd2lsbCBiZSB0cmlnZ2VyZWQuJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBvcmRlcjogN1xuICAgIH0sXG4gICAgbW9ub2NsZUhlaWdodDoge1xuICAgICAgdGl0bGU6ICdNb25vY2xlIEhlaWdodCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ0hvdyBtdWNoIG9mIHRoZSB3b3Jrc3BhY2UgdG8gdXNlIGZvciBidWlsZCBwYW5lbCB3aGVuIGl0IGlzIFwibWF4aW1pemVkXCIuJyxcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgZGVmYXVsdDogMC43NSxcbiAgICAgIG1pbmltdW06IDAuMSxcbiAgICAgIG1heGltdW06IDAuOSxcbiAgICAgIG9yZGVyOiA4XG4gICAgfSxcbiAgICBtaW5pbWl6ZWRIZWlnaHQ6IHtcbiAgICAgIHRpdGxlOiAnTWluaW1pemVkIEhlaWdodCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ0hvdyBtdWNoIG9mIHRoZSB3b3Jrc3BhY2UgdG8gdXNlIGZvciBidWlsZCBwYW5lbCB3aGVuIGl0IGlzIFwibWluaW1pemVkXCIuJyxcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgZGVmYXVsdDogMC4xNSxcbiAgICAgIG1pbmltdW06IDAuMSxcbiAgICAgIG1heGltdW06IDAuOSxcbiAgICAgIG9yZGVyOiA5XG4gICAgfSxcbiAgICBwYW5lbE9yaWVudGF0aW9uOiB7XG4gICAgICB0aXRsZTogJ1BhbmVsIE9yaWVudGF0aW9uJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hlcmUgdG8gYXR0YWNoIHRoZSBidWlsZCBwYW5lbCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdCb3R0b20nLFxuICAgICAgZW51bTogWyAnQm90dG9tJywgJ1RvcCcsICdMZWZ0JywgJ1JpZ2h0JyBdLFxuICAgICAgb3JkZXI6IDEwXG4gICAgfSxcbiAgICBzdGF0dXNCYXI6IHtcbiAgICAgIHRpdGxlOiAnU3RhdHVzIEJhcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZXJlIHRvIHBsYWNlIHRoZSBzdGF0dXMgYmFyLiBTZXQgdG8gYERpc2FibGVgIHRvIGRpc2FibGUgc3RhdHVzIGJhciBkaXNwbGF5LicsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdMZWZ0JyxcbiAgICAgIGVudW06IFsgJ0xlZnQnLCAnUmlnaHQnLCAnRGlzYWJsZScgXSxcbiAgICAgIG9yZGVyOiAxMVxuICAgIH0sXG4gICAgc3RhdHVzQmFyUHJpb3JpdHk6IHtcbiAgICAgIHRpdGxlOiAnUHJpb3JpdHkgb24gU3RhdHVzIEJhcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ0xvd2VyIHByaW9yaXR5IHRpbGVzIGFyZSBwbGFjZWQgZnVydGhlciB0byB0aGUgbGVmdC9yaWdodCwgZGVwZW5kcyBvbiB3aGVyZSB5b3UgY2hvb3NlIHRvIHBsYWNlIFN0YXR1cyBCYXIuJyxcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgZGVmYXVsdDogLTEwMDAsXG4gICAgICBvcmRlcjogMTJcbiAgICB9XG4gIH0sXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgaWYgKCEvXndpbi8udGVzdChwcm9jZXNzLnBsYXRmb3JtKSkge1xuICAgICAgLy8gTWFudWFsbHkgYXBwZW5kIC91c3IvbG9jYWwvYmluIGFzIGl0IG1heSBub3QgYmUgc2V0IG9uIHNvbWUgc3lzdGVtcyxcbiAgICAgIC8vIGFuZCBpdCdzIGNvbW1vbiB0byBoYXZlIG5vZGUgaW5zdGFsbGVkIGhlcmUuIEtlZXAgaXQgYXQgZW5kIHNvIGl0IHdvbid0XG4gICAgICAvLyBhY2NpZGVudGlhbGx5IG92ZXJyaWRlIGFueSBvdGhlciBub2RlIGluc3RhbGxhdGlvblxuICAgICAgcHJvY2Vzcy5lbnYuUEFUSCArPSAnOi91c3IvbG9jYWwvYmluJztcbiAgICB9XG5cbiAgICB0aGlzLmJ1aWxkVmlldyA9IG5ldyBCdWlsZFZpZXcoKTtcblxuICAgIHRoaXMudG9vbHMgPSBbIEN1c3RvbUZpbGUgXTtcbiAgICB0aGlzLmluc3RhbmNlZFRvb2xzID0ge307IC8vIE9yZGVyZWQgYnkgcHJvamVjdCBwYXRoXG4gICAgdGhpcy50YXJnZXRzID0ge307XG4gICAgdGhpcy5hY3RpdmVUYXJnZXQgPSB7fTtcbiAgICB0aGlzLnRhcmdldHNMb2FkaW5nID0ge307XG5cbiAgICB0aGlzLnN0ZG91dCA9IG5ldyBCdWZmZXIoMCk7XG4gICAgdGhpcy5zdGRlcnIgPSBuZXcgQnVmZmVyKDApO1xuICAgIHRoaXMuZXJyb3JNYXRjaGVyID0gbmV3IEVycm9yTWF0Y2hlcigpO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnJlZnJlc2gtdGFyZ2V0cycsICgpID0+IHRoaXMucmVmcmVzaFRhcmdldHMoKSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnRyaWdnZXInLCAoKSA9PiB0aGlzLmJ1aWxkKCd0cmlnZ2VyJykpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpzZWxlY3QtYWN0aXZlLXRhcmdldCcsICgpID0+IHRoaXMuc2VsZWN0QWN0aXZlVGFyZ2V0KCkpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpzdG9wJywgKCkgPT4gdGhpcy5zdG9wKCkpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpjb25maXJtJywgKCkgPT4ge1xuICAgICAgR29vZ2xlQW5hbHl0aWNzLnNlbmRFdmVudCgnYnVpbGQnLCAnY29uZmlybWVkJyk7XG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmNsaWNrKCk7XG4gICAgfSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOm5vLWNvbmZpcm0nLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zYXZlQ29uZmlybVZpZXcpIHtcbiAgICAgICAgR29vZ2xlQW5hbHl0aWNzLnNlbmRFdmVudCgnYnVpbGQnLCAnbm90IGNvbmZpcm1lZCcpO1xuICAgICAgICB0aGlzLnNhdmVDb25maXJtVmlldy5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yKSA9PiB7XG4gICAgICBlZGl0b3Iub25EaWRTYXZlKCgpID0+IHtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuYnVpbGRPblNhdmUnKSkge1xuICAgICAgICAgIHRoaXMuYnVpbGQoJ3NhdmUnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKCgpID0+IHRoaXMudXBkYXRlU3RhdHVzQmFyKCkpO1xuXG4gICAgdGhpcy5lcnJvck1hdGNoZXIub24oJ2Vycm9yJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRXJyb3IgbWF0Y2hpbmcgZmFpbGVkIScsIHsgZGV0YWlsOiBtZXNzYWdlIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lcnJvck1hdGNoZXIub24oJ21hdGNoZWQnLCAoaWQpID0+IHtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LnNjcm9sbFRvKGlkKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZXJyb3JNYXRjaGVyLm9uKCdtYXRjaCcsICh0ZXh0LCBpZCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLmVycm9yTWF0Y2hlci5nb3RvLmJpbmQodGhpcy5lcnJvck1hdGNoZXIsIGlkKTtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LmxpbmsodGV4dCwgaWQsIGNhbGxiYWNrKTtcbiAgICB9KTtcblxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcygoKSA9PiB0aGlzLnJlZnJlc2hUYXJnZXRzKCkpO1xuXG4gICAgbGV0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHtcbiAgICAgIGNvbnN0IGFkZGVkUGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5maWx0ZXIoZWwgPT4gcHJvamVjdFBhdGhzLmluZGV4T2YoZWwpID09PSAtMSk7XG4gICAgICB0aGlzLnJlZnJlc2hUYXJnZXRzKGFkZGVkUGF0aHMpO1xuICAgICAgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2VzKClcbiAgICAgIC5maWx0ZXIocCA9PiAoKCgocC5tZXRhZGF0YS5wcm92aWRlZFNlcnZpY2VzIHx8IHt9KS5idWlsZGVyIHx8IHt9KS52ZXJzaW9ucyB8fCB7fSlbJzEuMC4wJ10pKVxuICAgICAgLmZvckVhY2gocCA9PiBHcmltLmRlcHJlY2F0ZSgnVXNlIDIuMC4wIG9mIGJ1aWxkZXIgc2VydmljZSBBUEkgaW5zdGVhZCcsIHsgcGFja2FnZU5hbWU6IHAubmFtZSB9KSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBfLm1hcCh0aGlzLmluc3RhbmNlZFRvb2xzLCAodG9vbHMsIGN3ZCkgPT4gdG9vbHMuZm9yRWFjaCh0b29sID0+IHtcbiAgICAgIHRvb2wucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZWZyZXNoJyk7XG4gICAgICB0b29sLmRlc3RydWN0b3IgJiYgdG9vbC5kZXN0cnVjdG9yKCk7XG4gICAgfSkpO1xuXG4gICAgaWYgKHRoaXMuY2hpbGQpIHtcbiAgICAgIHRoaXMuY2hpbGQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICBraWxsKHRoaXMuY2hpbGQucGlkLCAnU0lHS0lMTCcpO1xuICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0dXNCYXJWaWV3ICYmIHRoaXMuc3RhdHVzQmFyVmlldy5kZXN0cm95KCk7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5maW5pc2hlZFRpbWVyKTtcbiAgfSxcblxuICBhY3RpdmVQYXRoKCkge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKCF0ZXh0RWRpdG9yIHx8ICF0ZXh0RWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgLyogZGVmYXVsdCB0byBidWlsZGluZyB0aGUgZmlyc3Qgb25lIGlmIG5vIGVkaXRvciBpcyBhY3RpdmUgKi9cbiAgICAgIGlmICgwID09PSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgfVxuXG4gICAgLyogb3RoZXJ3aXNlLCBidWlsZCB0aGUgb25lIGluIHRoZSByb290IG9mIHRoZSBhY3RpdmUgZWRpdG9yICovXG4gICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXRQYXRocygpLnNvcnQoKGEsIGIpID0+IChiLmxlbmd0aCAtIGEubGVuZ3RoKSkuZmluZChwID0+IHtcbiAgICAgIGNvbnN0IHJlYWxwYXRoID0gZnMucmVhbHBhdGhTeW5jKHApO1xuICAgICAgcmV0dXJuIHRleHRFZGl0b3IuZ2V0UGF0aCgpLnN1YnN0cigwLCByZWFscGF0aC5sZW5ndGgpID09PSByZWFscGF0aDtcbiAgICB9KTtcbiAgfSxcblxuICB1cGRhdGVTdGF0dXNCYXIoKSB7XG4gICAgY29uc3QgYWN0aXZlVGFyZ2V0ID0gdGhpcy5hY3RpdmVUYXJnZXRbdGhpcy5hY3RpdmVQYXRoKCldO1xuICAgIHRoaXMuc3RhdHVzQmFyVmlldyAmJiB0aGlzLnN0YXR1c0JhclZpZXcuc2V0VGFyZ2V0KGFjdGl2ZVRhcmdldCk7XG4gIH0sXG5cbiAgY21kRGVmYXVsdHMoY3dkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVudjoge30sXG4gICAgICBhcmdzOiBbXSxcbiAgICAgIGN3ZDogY3dkLFxuICAgICAgc2g6IHRydWUsXG4gICAgICBlcnJvck1hdGNoOiAnJyxcbiAgICAgIGRpc3Bvc2U6IEZ1bmN0aW9uLnByb3RvdHlwZVxuICAgIH07XG4gIH0sXG5cbiAgc2V0dGluZ3NNYWtlVW5pcXVlKHNldHRpbmdzKSB7XG4gICAgbGV0IGRpZmY7XG4gICAgY29uc3QgYXBwZW5kZXIgPSAoc2V0dGluZykgPT4ge1xuICAgICAgc2V0dGluZy5fdW5pcXVlSW5kZXggPSBzZXR0aW5nLl91bmlxdWVJbmRleCB8fCAxO1xuICAgICAgc2V0dGluZy5fb3JpZ2luYWxOYW1lID0gc2V0dGluZy5fb3JpZ2luYWxOYW1lIHx8IHNldHRpbmcubmFtZTtcbiAgICAgIHNldHRpbmcubmFtZSA9IGAke3NldHRpbmcuX29yaWdpbmFsTmFtZX0gLSAke3NldHRpbmcuX3VuaXF1ZUluZGV4Kyt9YDtcbiAgICAgIHNldHRpbmdzLnB1c2goc2V0dGluZyk7XG4gICAgfTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZG8ge1xuICAgICAgY29uc3QgdW5pcXVlU2V0dGluZ3MgPSBfLnVuaXEoc2V0dGluZ3MsICduYW1lJyk7XG4gICAgICBkaWZmID0gXy5kaWZmZXJlbmNlKHNldHRpbmdzLCB1bmlxdWVTZXR0aW5ncyk7XG4gICAgICBzZXR0aW5ncyA9IHVuaXF1ZVNldHRpbmdzO1xuICAgICAgZGlmZi5mb3JFYWNoKGFwcGVuZGVyKTtcbiAgICB9IHdoaWxlIChkaWZmLmxlbmd0aCA+IDAgJiYgaSsrIDwgMTApO1xuXG4gICAgcmV0dXJuIHNldHRpbmdzO1xuICB9LFxuXG4gIHJlZnJlc2hUYXJnZXRzKHJlZnJlc2hQYXRocykge1xuICAgIHJlZnJlc2hQYXRocyA9IHJlZnJlc2hQYXRocyB8fCBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcblxuICAgIGNvbnN0IHBhdGhQcm9taXNlID0gcmVmcmVzaFBhdGhzLm1hcCgocCkgPT4ge1xuICAgICAgdGhpcy50YXJnZXRzTG9hZGluZ1twXSA9IHRydWU7XG4gICAgICB0aGlzLnRhcmdldHNbcF0gPSB0aGlzLnRhcmdldHNbcF0gfHwgW107XG5cbiAgICAgIHRoaXMuaW5zdGFuY2VkVG9vbHNbcF0gPSAodGhpcy5pbnN0YW5jZWRUb29sc1twXSB8fCBbXSlcbiAgICAgICAgLm1hcCh0ID0+IHQucmVtb3ZlQWxsTGlzdGVuZXJzICYmIHQucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZWZyZXNoJykpXG4gICAgICAgIC5maWx0ZXIoKCkgPT4gZmFsc2UpOyAvLyBKdXN0IGVtcHR5IHRoZSBhcnJheVxuXG4gICAgICBjb25zdCBzZXR0aW5nc1Byb21pc2UgPSB0aGlzLnRvb2xzXG4gICAgICAgIC5tYXAoVG9vbCA9PiBuZXcgVG9vbChwKSlcbiAgICAgICAgLmZpbHRlcih0b29sID0+IHRvb2wuaXNFbGlnaWJsZSgpKVxuICAgICAgICAubWFwKHRvb2wgPT4ge1xuICAgICAgICAgIHRoaXMuaW5zdGFuY2VkVG9vbHNbcF0ucHVzaCh0b29sKTtcbiAgICAgICAgICBHb29nbGVBbmFseXRpY3Muc2VuZEV2ZW50KCdidWlsZCcsICd0b29sIGVsaWdpYmxlJywgdG9vbC5nZXROaWNlTmFtZSgpKTtcblxuICAgICAgICAgIHRvb2wub24gJiYgdG9vbC5vbigncmVmcmVzaCcsIHRoaXMucmVmcmVzaFRhcmdldHMuYmluZCh0aGlzLCBbIHAgXSkpO1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHRvb2wuc2V0dGluZ3MoKSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvcikge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ludmFsaWQgYnVpbGQgZmlsZS4nLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiAnWW91IGhhdmUgYSBzeW50YXggZXJyb3IgaW4geW91ciBidWlsZCBmaWxlOiAnICsgZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ09vb3BzLiBTb21ldGhpbmcgd2VudCB3cm9uZy4nLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiBlcnIubWVzc2FnZSArIChlcnIuc3RhY2sgPyAnXFxuJyArIGVyci5zdGFjayA6ICcnKSxcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChzZXR0aW5nc1Byb21pc2UpLnRoZW4oKHNldHRpbmdzKSA9PiB7XG4gICAgICAgIHNldHRpbmdzID0gdGhpcy5zZXR0aW5nc01ha2VVbmlxdWUoW10uY29uY2F0LmFwcGx5KFtdLCBzZXR0aW5ncykuZmlsdGVyKEJvb2xlYW4pLm1hcChzZXR0aW5nID0+XG4gICAgICAgICAgXy5kZWZhdWx0cyhzZXR0aW5nLCB0aGlzLmNtZERlZmF1bHRzKHApKVxuICAgICAgICApKTtcblxuICAgICAgICBpZiAoXy5pc051bGwodGhpcy5hY3RpdmVUYXJnZXRbcF0pIHx8ICFzZXR0aW5ncy5maW5kKHMgPT4gcy5uYW1lID09PSB0aGlzLmFjdGl2ZVRhcmdldFtwXSkpIHtcbiAgICAgICAgICAvKiBBY3RpdmUgdGFyZ2V0IGhhcyBiZWVuIHJlbW92ZWQgb3Igbm90IHNldC4gU2V0IGl0IHRvIHRoZSBoaWdoZXN0IHByaW8gdGFyZ2V0ICovXG4gICAgICAgICAgdGhpcy5hY3RpdmVUYXJnZXRbcF0gPSBzZXR0aW5nc1swXSA/IHNldHRpbmdzWzBdLm5hbWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRhcmdldHNbcF0uZm9yRWFjaCh0YXJnZXQgPT4gdGFyZ2V0LmRpc3Bvc2UoKSk7XG5cbiAgICAgICAgc2V0dGluZ3MuZm9yRWFjaCgoc2V0dGluZywgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoIXNldHRpbmcua2V5bWFwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgR29vZ2xlQW5hbHl0aWNzLnNlbmRFdmVudCgna2V5bWFwJywgJ3JlZ2lzdGVyZWQnLCBzZXR0aW5nLmtleW1hcCk7XG4gICAgICAgICAgY29uc3QgY29tbWFuZE5hbWUgPSAnYnVpbGQ6dHJpZ2dlcjonICsgc2V0dGluZy5uYW1lO1xuICAgICAgICAgIGNvbnN0IGtleW1hcFNwZWMgPSB7ICdhdG9tLXdvcmtzcGFjZSwgYXRvbS10ZXh0LWVkaXRvcic6IHt9IH07XG4gICAgICAgICAga2V5bWFwU3BlY1snYXRvbS13b3Jrc3BhY2UsIGF0b20tdGV4dC1lZGl0b3InXVtzZXR0aW5nLmtleW1hcF0gPSBjb21tYW5kTmFtZTtcbiAgICAgICAgICBjb25zdCBrZXltYXBEaXNwb3NlID0gYXRvbS5rZXltYXBzLmFkZChzZXR0aW5nLm5hbWUsIGtleW1hcFNwZWMpO1xuICAgICAgICAgIGNvbnN0IGNvbW1hbmREaXNwb3NlID0gYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgY29tbWFuZE5hbWUsIHRoaXMuYnVpbGQuYmluZCh0aGlzLCAndHJpZ2dlcicpKTtcbiAgICAgICAgICBzZXR0aW5nc1tpbmRleF0uZGlzcG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGtleW1hcERpc3Bvc2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgY29tbWFuZERpc3Bvc2UuZGlzcG9zZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudGFyZ2V0c1twXSA9IHNldHRpbmdzO1xuICAgICAgICB0aGlzLnRhcmdldHNMb2FkaW5nW3BdID0gZmFsc2U7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzQmFyKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIFByb21pc2UuYWxsKHBhdGhQcm9taXNlKS50aGVuKChlbnRyaWVzKSA9PiB7XG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByb3dzID0gcmVmcmVzaFBhdGhzLm1hcChwID0+IGAke3RoaXMudGFyZ2V0c1twXS5sZW5ndGh9IHRhcmdldHMgYXQ6ICR7cH1gKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZCB0YXJnZXRzIHBhcnNlZC4nLCB7XG4gICAgICAgIGRldGFpbDogcm93cy5qb2luKCdcXG4nKVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgc2VsZWN0QWN0aXZlVGFyZ2V0KCkge1xuICAgIGNvbnN0IHAgPSB0aGlzLmFjdGl2ZVBhdGgoKTtcbiAgICBjb25zdCB0YXJnZXRzID0gdGhpcy50YXJnZXRzW3BdO1xuICAgIGNvbnN0IHRhcmdldHNWaWV3ID0gbmV3IFRhcmdldHNWaWV3KCk7XG5cbiAgICBpZiAodGhpcy50YXJnZXRzTG9hZGluZ1twXSkge1xuICAgICAgcmV0dXJuIHRhcmdldHNWaWV3LnNldExvYWRpbmcoJ0xvYWRpbmcgcHJvamVjdCBidWlsZCB0YXJnZXRzXFx1MjAyNicpO1xuICAgIH1cblxuICAgIHRhcmdldHNWaWV3LnNldEFjdGl2ZVRhcmdldCh0aGlzLmFjdGl2ZVRhcmdldFtwXSk7XG4gICAgdGFyZ2V0c1ZpZXcuc2V0SXRlbXMoKHRhcmdldHMgfHwgW10pLm1hcCh0YXJnZXQgPT4gdGFyZ2V0Lm5hbWUpKTtcbiAgICB0YXJnZXRzVmlldy5hd2FpdFNlbGVjdGlvbigpLnRoZW4oKG5ld1RhcmdldCkgPT4ge1xuICAgICAgdGhpcy5hY3RpdmVUYXJnZXRbcF0gPSBuZXdUYXJnZXQ7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXR1c0JhcigpO1xuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zZWxlY3RUcmlnZ2VycycpKSB7XG4gICAgICAgIGNvbnN0IHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJyk7XG4gICAgICB9XG4gICAgfSkuY2F0Y2goKGVycikgPT4gdGFyZ2V0c1ZpZXcuc2V0RXJyb3IoZXJyLm1lc3NhZ2UpKTtcbiAgfSxcblxuICByZXBsYWNlKHZhbHVlID0gJycsIHRhcmdldEVudikge1xuICAgIGNvbnN0IGVudiA9IF8uZXh0ZW5kKHt9LCBwcm9jZXNzLmVudiwgdGFyZ2V0RW52KTtcbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcJChcXHcrKS9nLCBmdW5jdGlvbiAobWF0Y2gsIG5hbWUpIHtcbiAgICAgIHJldHVybiBuYW1lIGluIGVudiA/IGVudltuYW1lXSA6IG1hdGNoO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgY29uc3QgcHJvamVjdFBhdGhzID0gXy5tYXAoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksIChwcm9qZWN0UGF0aCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZzLnJlYWxwYXRoU3luYyhwcm9qZWN0UGF0aCk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIERvIG5vdGhpbmcuICovIH1cbiAgICB9KTtcblxuICAgIGxldCBwcm9qZWN0UGF0aCA9IHByb2plY3RQYXRoc1swXTtcbiAgICBpZiAoZWRpdG9yICYmICd1bnRpdGxlZCcgIT09IGVkaXRvci5nZXRUaXRsZSgpKSB7XG4gICAgICBjb25zdCBhY3RpdmVGaWxlID0gZnMucmVhbHBhdGhTeW5jKGVkaXRvci5nZXRQYXRoKCkpO1xuICAgICAgY29uc3QgYWN0aXZlRmlsZVBhdGggPSBwYXRoLmRpcm5hbWUoYWN0aXZlRmlsZSk7XG4gICAgICBwcm9qZWN0UGF0aCA9IF8uZmluZChwcm9qZWN0UGF0aHMsIChwKSA9PiBhY3RpdmVGaWxlUGF0aCAmJiBhY3RpdmVGaWxlUGF0aC5zdGFydHNXaXRoKHApKTtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgve0ZJTEVfQUNUSVZFfS9nLCBhY3RpdmVGaWxlKTtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgve0ZJTEVfQUNUSVZFX1BBVEh9L2csIGFjdGl2ZUZpbGVQYXRoKTtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgve0ZJTEVfQUNUSVZFX05BTUV9L2csIHBhdGguYmFzZW5hbWUoYWN0aXZlRmlsZSkpO1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC97RklMRV9BQ1RJVkVfTkFNRV9CQVNFfS9nLCBwYXRoLmJhc2VuYW1lKGFjdGl2ZUZpbGUsIHBhdGguZXh0bmFtZShhY3RpdmVGaWxlKSkpO1xuICAgIH1cbiAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL3tQUk9KRUNUX1BBVEh9L2csIHByb2plY3RQYXRoKTtcbiAgICBpZiAoYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllc1swXSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC97UkVQT19CUkFOQ0hfU0hPUlR9L2csIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVswXS5nZXRTaG9ydEhlYWQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9LFxuXG4gIHN0YXJ0TmV3QnVpbGQoc291cmNlLCB0YXJnZXROYW1lKSB7XG4gICAgY29uc3QgcCA9IHRoaXMuYWN0aXZlUGF0aCgpO1xuICAgIHRhcmdldE5hbWUgPSB0YXJnZXROYW1lIHx8IHRoaXMuYWN0aXZlVGFyZ2V0W3BdO1xuXG4gICAgUHJvbWlzZS5yZXNvbHZlKHRoaXMudGFyZ2V0c1twXSkudGhlbih0YXJnZXRzID0+IHtcbiAgICAgIGlmICghdGFyZ2V0cyB8fCAwID09PSB0YXJnZXRzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgQnVpbGRFcnJvcignTm8gZWxpZ2libGUgYnVpbGQgdGFyZ2V0LicsICdObyBjb25maWd1cmF0aW9uIHRvIGJ1aWxkIHRoaXMgcHJvamVjdCBleGlzdHMuJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IHRhcmdldHMuZmluZCh0ID0+IHQubmFtZSA9PT0gdGFyZ2V0TmFtZSk7XG4gICAgICBHb29nbGVBbmFseXRpY3Muc2VuZEV2ZW50KCdidWlsZCcsICd0cmlnZ2VyZWQnKTtcblxuICAgICAgaWYgKCF0YXJnZXQuZXhlYykge1xuICAgICAgICB0aHJvdyBuZXcgQnVpbGRFcnJvcignSW52YWxpZCBidWlsZCBmaWxlLicsICdObyBleGVjdXRhYmxlIGNvbW1hbmQgc3BlY2lmaWVkLicpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlbnYgPSBfLmV4dGVuZCh7fSwgcHJvY2Vzcy5lbnYsIHRhcmdldC5lbnYpO1xuICAgICAgXy5mb3JFYWNoKGVudiwgKHZhbHVlLCBrZXksIGxpc3QpID0+IHtcbiAgICAgICAgbGlzdFtrZXldID0gdGhpcy5yZXBsYWNlKHZhbHVlLCB0YXJnZXQuZW52KTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBleGVjID0gdGhpcy5yZXBsYWNlKHRhcmdldC5leGVjLCB0YXJnZXQuZW52KTtcbiAgICAgIGNvbnN0IGFyZ3MgPSB0YXJnZXQuYXJncy5tYXAoYXJnID0+IHRoaXMucmVwbGFjZShhcmcsIHRhcmdldC5lbnYpKTtcbiAgICAgIGNvbnN0IGN3ZCA9IHRoaXMucmVwbGFjZSh0YXJnZXQuY3dkLCB0YXJnZXQuZW52KTtcblxuICAgICAgdGhpcy5jaGlsZCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bihcbiAgICAgICAgdGFyZ2V0LnNoID8gJy9iaW4vc2gnIDogZXhlYyxcbiAgICAgICAgdGFyZ2V0LnNoID8gWyAnLWMnLCBbIGV4ZWMgXS5jb25jYXQoYXJncykuam9pbignICcpIF0gOiBhcmdzLFxuICAgICAgICB7IGN3ZDogY3dkLCBlbnY6IGVudiB9XG4gICAgICApO1xuXG4gICAgICB0aGlzLnN0ZG91dCA9IG5ldyBCdWZmZXIoMCk7XG4gICAgICB0aGlzLmNoaWxkLnN0ZG91dC5vbignZGF0YScsIChidWZmZXIpID0+IHtcbiAgICAgICAgdGhpcy5zdGRvdXQgPSBCdWZmZXIuY29uY2F0KFsgdGhpcy5zdGRvdXQsIGJ1ZmZlciBdKTtcbiAgICAgICAgdGhpcy5idWlsZFZpZXcuYXBwZW5kKGJ1ZmZlcik7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zdGRlcnIgPSBuZXcgQnVmZmVyKDApO1xuICAgICAgdGhpcy5jaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgIHRoaXMuc3RkZXJyID0gQnVmZmVyLmNvbmNhdChbIHRoaXMuc3RkZXJyLCBidWZmZXIgXSk7XG4gICAgICAgIHRoaXMuYnVpbGRWaWV3LmFwcGVuZChidWZmZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuY2hpbGQub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICB0aGlzLmJ1aWxkVmlldy5hcHBlbmQoKHRhcmdldC5zaCA/ICdVbmFibGUgdG8gZXhlY3V0ZSB3aXRoIHNoOiAnIDogJ1VuYWJsZSB0byBleGVjdXRlOiAnKSArIGV4ZWMgKyAnXFxuJyk7XG5cbiAgICAgICAgaWYgKC9cXHMvLnRlc3QoZXhlYykgJiYgIXRhcmdldC5zaCkge1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LmFwcGVuZCgnYGNtZGAgY2Fubm90IGNvbnRhaW4gc3BhY2UuIFVzZSBgYXJnc2AgZm9yIGFyZ3VtZW50cy5cXG4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgnRU5PRU5UJyA9PT0gZXJyLmNvZGUpIHtcbiAgICAgICAgICB0aGlzLmJ1aWxkVmlldy5hcHBlbmQoJ01ha2Ugc3VyZSBgY21kYCBhbmQgYGN3ZGAgZXhpc3RzIGFuZCBoYXZlIGNvcnJlY3QgYWNjZXNzIHBlcm1pc3Npb25zLlxcbicpO1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LmFwcGVuZChgQnVpbGQgZmluZHMgYmluYXJpZXMgaW4gdGhlc2UgZm9sZGVyczogJHtwcm9jZXNzLmVudi5QQVRIfVxcbmApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jaGlsZC5vbignY2xvc2UnLCAoZXhpdENvZGUpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvck1hdGNoZXIuc2V0KHRhcmdldC5lcnJvck1hdGNoLCBjd2QsIHRoaXMuYnVpbGRWaWV3Lm91dHB1dC50ZXh0KCkpO1xuXG4gICAgICAgIGxldCBzdWNjZXNzID0gKDAgPT09IGV4aXRDb2RlKTtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQubWF0Y2hlZEVycm9yRmFpbHNCdWlsZCcpKSB7XG4gICAgICAgICAgc3VjY2VzcyA9IHN1Y2Nlc3MgJiYgIXRoaXMuZXJyb3JNYXRjaGVyLmhhc01hdGNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idWlsZFZpZXcuYnVpbGRGaW5pc2hlZChzdWNjZXNzKTtcbiAgICAgICAgdGhpcy5zdGF0dXNCYXJWaWV3ICYmIHRoaXMuc3RhdHVzQmFyVmlldy5zZXRCdWlsZFN1Y2Nlc3Moc3VjY2Vzcyk7XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBHb29nbGVBbmFseXRpY3Muc2VuZEV2ZW50KCdidWlsZCcsICdzdWNjZWVkZWQnKTtcbiAgICAgICAgICB0aGlzLmZpbmlzaGVkVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LmRldGFjaCgpO1xuICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnNjcm9sbE9uRXJyb3InKSkge1xuICAgICAgICAgICAgdGhpcy5lcnJvck1hdGNoZXIubWF0Y2hGaXJzdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBHb29nbGVBbmFseXRpY3Muc2VuZEV2ZW50KCdidWlsZCcsICdmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoaWxkID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmJ1aWxkVmlldy5idWlsZFN0YXJ0ZWQoKTtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LmFwcGVuZChbICh0YXJnZXQuc2ggPyAnRXhlY3V0aW5nIHdpdGggc2g6JyA6ICdFeGVjdXRpbmc6JyksIGV4ZWMsIC4uLmFyZ3MsICdcXG4nXS5qb2luKCcgJykpO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBCdWlsZEVycm9yKSB7XG4gICAgICAgIGlmIChzb3VyY2UgPT09ICdzYXZlJykge1xuICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIGVsaWdpYmxlIGJ1aWxkIHRvb2wsIGFuZCBjYXVzZSBvZiBidWlsZCB3YXMgYSBzYXZlLCBzdGF5IHF1aWV0LlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKGVyci5uYW1lLCB7IGRldGFpbDogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCB0byBidWlsZC4nLCB7IGRldGFpbDogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYWJvcnQoY2IpIHtcbiAgICB0aGlzLmNoaWxkLnJlbW92ZUFsbExpc3RlbmVycygnY2xvc2UnKTtcbiAgICB0aGlzLmNoaWxkLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIHRoaXMuY2hpbGQgPSBudWxsO1xuICAgICAgY2IgJiYgY2IoKTtcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICBraWxsKHRoaXMuY2hpbGQucGlkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBTb21ldGhpbmcgbWF5IGhhdmUgaGFwcGVuZWQgdG8gdGhlIGNoaWxkIChlLmcuIHRlcm1pbmF0ZWQgYnkgaXRzZWxmKS4gSWdub3JlIHRoaXMuICovXG4gICAgfVxuXG4gICAgdGhpcy5jaGlsZC5raWxsZWQgPSB0cnVlO1xuICB9LFxuXG4gIGJ1aWxkKHNvdXJjZSwgZXZlbnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5maW5pc2hlZFRpbWVyKTtcblxuICAgIHRoaXMuZG9TYXZlQ29uZmlybSh0aGlzLnVuc2F2ZWRUZXh0RWRpdG9ycygpLCAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gdGhpcy5zdGFydE5ld0J1aWxkLmJpbmQodGhpcywgc291cmNlLCBldmVudCA/IGV2ZW50LnR5cGUuc3Vic3RyKDE0KSA6IG51bGwpO1xuICAgICAgdGhpcy5jaGlsZCA/IHRoaXMuYWJvcnQobmV4dCkgOiBuZXh0KCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZG9TYXZlQ29uZmlybShtb2RpZmllZFRleHRFZGl0b3JzLCBjb250aW51ZWNiLCBjYW5jZWxjYikge1xuICAgIGNvbnN0IHNhdmVBbmRDb250aW51ZSA9IChzYXZlKSA9PiB7XG4gICAgICBtb2RpZmllZFRleHRFZGl0b3JzLmZvckVhY2goKHRleHRFZGl0b3IpID0+IHNhdmUgJiYgdGV4dEVkaXRvci5zYXZlKCkpO1xuICAgICAgY29udGludWVjYigpO1xuICAgIH07XG5cbiAgICBpZiAoMCA9PT0gXy5zaXplKG1vZGlmaWVkVGV4dEVkaXRvcnMpIHx8IGF0b20uY29uZmlnLmdldCgnYnVpbGQuc2F2ZU9uQnVpbGQnKSkge1xuICAgICAgcmV0dXJuIHNhdmVBbmRDb250aW51ZSh0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zYXZlQ29uZmlybVZpZXcpIHtcbiAgICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3LmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICB0aGlzLnNhdmVDb25maXJtVmlldyA9IG5ldyBTYXZlQ29uZmlybVZpZXcoKTtcbiAgICB0aGlzLnNhdmVDb25maXJtVmlldy5zaG93KHNhdmVBbmRDb250aW51ZSwgY2FuY2VsY2IpO1xuICB9LFxuXG4gIHVuc2F2ZWRUZXh0RWRpdG9ycygpIHtcbiAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5maWx0ZXIoKHRleHRFZGl0b3IpID0+IHtcbiAgICAgIHJldHVybiB0ZXh0RWRpdG9yLmlzTW9kaWZpZWQoKSAmJiAoJ3VudGl0bGVkJyAhPT0gdGV4dEVkaXRvci5nZXRUaXRsZSgpKTtcbiAgICB9KTtcbiAgfSxcblxuICBzdG9wKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbmlzaGVkVGltZXIpO1xuICAgIGlmICh0aGlzLmNoaWxkKSB7XG4gICAgICBpZiAodGhpcy5jaGlsZC5raWxsZWQpIHtcbiAgICAgICAgLy8gVGhpcyBjaGlsZCBoYXMgYmVlbiBraWxsZWQsIGJ1dCBoYXNuJ3QgdGVybWluYXRlZC4gSGlkZSBpdCBmcm9tIHVzZXIuXG4gICAgICAgIHRoaXMuY2hpbGQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuY2hpbGQgPSBudWxsO1xuICAgICAgICB0aGlzLmJ1aWxkVmlldy5idWlsZEFib3J0ZWQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFib3J0KCgpID0+IHRoaXMuYnVpbGRWaWV3LmJ1aWxkQWJvcnRlZCgpKTtcblxuICAgICAgdGhpcy5idWlsZFZpZXcuYnVpbGRBYm9ydEluaXRpYXRlZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1aWxkVmlldy5yZXNldCgpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lQnVpbGRlckxlZ2FjeShidWlsZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3VtZUJ1aWxkZXIocHJvdmlkZXJMZWdhY3koYnVpbGRlcikpO1xuICB9LFxuXG4gIGNvbnN1bWVCdWlsZGVyKGJ1aWxkZXJzKSB7XG4gICAgYnVpbGRlcnMgPSBBcnJheS5pc0FycmF5KGJ1aWxkZXJzKSA/IGJ1aWxkZXJzIDogWyBidWlsZGVycyBdO1xuICAgIHRoaXMudG9vbHMgPSBfLnVuaW9uKHRoaXMudG9vbHMsIGJ1aWxkZXJzKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy50b29scyA9IF8uZGlmZmVyZW5jZSh0aGlzLnRvb2xzLCBidWlsZGVycykpO1xuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdGF0dXNCYXJWaWV3ID0gbmV3IFN0YXR1c0JhclZpZXcoc3RhdHVzQmFyKTtcbiAgICB0aGlzLnN0YXR1c0JhclZpZXcub25DbGljaygoKSA9PiB0aGlzLnNlbGVjdEFjdGl2ZVRhcmdldCgpKTtcbiAgICB0aGlzLnN0YXR1c0JhclZpZXcuYXR0YWNoKCk7XG4gIH1cbn07XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/build/lib/build.js
