(function() {
  var $, CompositeDisposable, MouseEventWhichDict;

  $ = null;

  CompositeDisposable = require('atom').CompositeDisposable;

  MouseEventWhichDict = {
    "left click": 1,
    "middle click": 2,
    "right click": 3
  };

  module.exports = {
    disposable: null,
    config: {
      disableComplete: {
        type: 'boolean',
        "default": false
      },
      autoBuildTagsWhenActive: {
        title: 'Automatically rebuild tags',
        description: 'Rebuild tags file each time a project path changes',
        type: 'boolean',
        "default": false
      },
      buildTimeout: {
        title: 'Build timeout',
        description: 'Time (in milliseconds) to wait for a tags rebuild to finish',
        type: 'integer',
        "default": 5000
      },
      cmd: {
        type: 'string',
        "default": ""
      },
      cmdArgs: {
        type: 'string',
        "default": ""
      },
      extraTagFiles: {
        type: 'string',
        "default": ""
      },
      GotoSymbolKey: {
        description: 'combine bindings: alt, ctrl, meta, shift',
        type: 'array',
        "default": ["alt"]
      },
      GotoSymbolClick: {
        type: 'string',
        "default": "left click",
        "enum": ["left click", "middle click", "right click"]
      }
    },
    provider: null,
    activate: function() {
      var initExtraTagsTime;
      this.stack = [];
      this.ctagsCache = require("./ctags-cache");
      this.ctagsCache.activate();
      this.ctagsCache.initTags(atom.project.getPaths(), atom.config.get('atom-ctags.autoBuildTagsWhenActive'));
      this.disposable = atom.project.onDidChangePaths((function(_this) {
        return function(paths) {
          return _this.ctagsCache.initTags(paths, atom.config.get('atom-ctags.autoBuildTagsWhenActive'));
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-ctags:rebuild', (function(_this) {
        return function(e, cmdArgs) {
          var t;
          console.error("rebuild: ", e);
          if (Array.isArray(cmdArgs)) {
            _this.ctagsCache.cmdArgs = cmdArgs;
          }
          _this.createFileView().rebuild(true);
          if (t) {
            clearTimeout(t);
            return t = null;
          }
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-ctags:toggle-project-symbols', (function(_this) {
        return function() {
          return _this.createFileView().toggleAll();
        };
      })(this));
      atom.commands.add('atom-text-editor', {
        'atom-ctags:toggle-file-symbols': (function(_this) {
          return function() {
            return _this.createFileView().toggle();
          };
        })(this),
        'atom-ctags:go-to-declaration': (function(_this) {
          return function() {
            return _this.createFileView().goto();
          };
        })(this),
        'atom-ctags:return-from-declaration': (function(_this) {
          return function() {
            return _this.createGoBackView().toggle();
          };
        })(this)
      });
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorView;
          editorView = atom.views.getView(editor);
          if (!$) {
            $ = require('atom-space-pen-views').$;
          }
          return $(editorView).on('mousedown', function(event) {
            var keyName, which, _i, _len, _ref;
            which = atom.config.get('atom-ctags.GotoSymbolClick');
            if (MouseEventWhichDict[which] !== event.which) {
              return;
            }
            _ref = atom.config.get('atom-ctags.GotoSymbolKey');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              keyName = _ref[_i];
              if (!event[keyName + "Key"]) {
                return;
              }
            }
            return _this.createFileView().goto();
          });
        };
      })(this));
      if (!atom.packages.isPackageDisabled("symbols-view")) {
        atom.packages.disablePackage("symbols-view");
        alert("Warning from atom-ctags: atom-ctags replaces and enhances the symbols-view package. Therefore, symbols-view has been disabled.");
      }
      atom.config.observe('atom-ctags.disableComplete', (function(_this) {
        return function() {
          if (!_this.provider) {
            return;
          }
          return _this.provider.disabled = atom.config.get('atom-ctags.disableComplete');
        };
      })(this));
      initExtraTagsTime = null;
      return atom.config.observe('atom-ctags.extraTagFiles', (function(_this) {
        return function() {
          if (initExtraTagsTime) {
            clearTimeout(initExtraTagsTime);
          }
          return initExtraTagsTime = setTimeout((function() {
            _this.ctagsCache.initExtraTags(atom.config.get('atom-ctags.extraTagFiles').split(" "));
            return initExtraTagsTime = null;
          }), 1000);
        };
      })(this));
    },
    deactivate: function() {
      if (this.disposable != null) {
        this.disposable.dispose();
        this.disposable = null;
      }
      if (this.fileView != null) {
        this.fileView.destroy();
        this.fileView = null;
      }
      if (this.projectView != null) {
        this.projectView.destroy();
        this.projectView = null;
      }
      if (this.goToView != null) {
        this.goToView.destroy();
        this.goToView = null;
      }
      if (this.goBackView != null) {
        this.goBackView.destroy();
        this.goBackView = null;
      }
      return this.ctagsCache.deactivate();
    },
    createFileView: function() {
      var FileView;
      if (this.fileView == null) {
        FileView = require('./file-view');
        this.fileView = new FileView(this.stack);
        this.fileView.ctagsCache = this.ctagsCache;
      }
      return this.fileView;
    },
    createGoBackView: function() {
      var GoBackView;
      if (this.goBackView == null) {
        GoBackView = require('./go-back-view');
        this.goBackView = new GoBackView(this.stack);
      }
      return this.goBackView;
    },
    provide: function() {
      var CtagsProvider;
      if (this.provider == null) {
        CtagsProvider = require('./ctags-provider');
        this.provider = new CtagsProvider();
        this.provider.ctagsCache = this.ctagsCache;
        this.provider.disabled = atom.config.get('atom-ctags.disableComplete');
      }
      return this.provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLElBQUosQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBR0EsbUJBQUEsR0FBc0I7QUFBQSxJQUFDLFlBQUEsRUFBYyxDQUFmO0FBQUEsSUFBa0IsY0FBQSxFQUFnQixDQUFsQztBQUFBLElBQXFDLGFBQUEsRUFBZSxDQUFwRDtHQUh0QixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsVUFBQSxFQUFZLElBQVo7QUFBQSxJQUVBLE1BQUEsRUFDRTtBQUFBLE1BQUEsZUFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FERjtBQUFBLE1BR0EsdUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDRCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsb0RBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsS0FIVDtPQUpGO0FBQUEsTUFRQSxZQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxlQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsNkRBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtPQVRGO0FBQUEsTUFhQSxHQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtPQWRGO0FBQUEsTUFnQkEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVB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

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/lib/main.coffee
