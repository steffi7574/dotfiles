(function() {
  var Builder, CompletionManager, CompositeDisposable, Disposable, LTConsole, Latextools, SnippetManager, Viewer, path, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LTConsole = require('./ltconsole');

  Builder = require('./builder');

  Viewer = require('./viewer');

  CompletionManager = require('./completion-manager');

  SnippetManager = require('./snippet-manager');

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  path = require('path');

  module.exports = Latextools = {
    ltConsole: null,
    subscriptions: null,
    snippets: null,
    config: {
      citeAutoTrigger: {
        type: 'boolean',
        "default": true,
        order: 1
      },
      refAutoTrigger: {
        type: 'boolean',
        "default": true,
        order: 2
      },
      refAddParenthesis: {
        type: 'boolean',
        "default": false,
        order: 3
      },
      fillAutoTrigger: {
        type: 'boolean',
        "default": true,
        order: 4
      },
      keepFocus: {
        type: 'boolean',
        "default": true,
        order: 5
      },
      forwardSync: {
        type: 'boolean',
        "default": true,
        order: 6
      },
      commandCompletion: {
        type: 'string',
        "default": 'prefixed',
        "enum": ['always', 'prefixed', 'never'],
        order: 7
      },
      hideBuildPanel: {
        type: 'string',
        "default": 'never',
        "enum": ['always', 'no_errors', 'no_warnings', 'never'],
        order: 8
      },
      texFileExtensions: {
        type: 'array',
        "default": ['.tex'],
        items: {
          type: 'string'
        },
        order: 9
      },
      latextoolsSetSyntax: {
        type: 'boolean',
        "default": true,
        order: 10
      },
      temporaryFileExtensions: {
        type: 'array',
        "default": [".blg", ".bbl", ".aux", ".log", ".brf", ".nlo", ".out", ".dvi", ".ps", ".lof", ".toc", ".fls", ".fdb_latexmk", ".pdfsync", ".synctex.gz", ".ind", ".ilg", ".idx"],
        items: {
          type: 'string'
        },
        order: 11
      },
      temporaryFilesIgnoredFolders: {
        type: 'array',
        "default": [".git", ".svn", ".hg"],
        items: {
          type: 'string'
        },
        order: 12
      },
      darwin: {
        type: 'object',
        properties: {
          texpath: {
            type: 'string',
            "default": "/Library/TeX/texbin:/usr/texbin:/usr/local/bin:/opt/local/bin"
          }
        },
        order: 13
      },
      win32: {
        type: 'object',
        properties: {
          texpath: {
            type: 'string',
            "default": ""
          },
          distro: {
            type: 'string',
            "default": "miktex",
            "enum": ["miktex", "texlive"]
          },
          sumatra: {
            type: 'string',
            "default": "SumatraPDF.exe"
          },
          atomExecutable: {
            type: 'string',
            "default": ""
          },
          keepFocusDelay: {
            type: 'number',
            "default": 0.5
          }
        },
        order: 14
      },
      linux: {
        type: 'object',
        properties: {
          texpath: {
            type: 'string',
            "default": "$PATH:/usr/texbin"
          },
          python2: {
            type: 'string',
            "default": ""
          },
          atomExecutable: {
            type: 'string',
            "default": ""
          },
          syncWait: {
            type: 'number',
            "default": 1.5
          },
          keepFocusDelay: {
            type: 'number',
            "default": 0.5
          }
        },
        order: 15
      },
      builder: {
        type: 'string',
        "default": "texify-latexmk",
        order: 16
      },
      builderPath: {
        type: 'string',
        "default": "",
        order: 17
      },
      builderSettings: {
        type: 'object',
        properties: {
          program: {
            type: 'string',
            "default": "pdflatex",
            "enum": ["pdflatex", "xelatex", "lualatex"]
          },
          options: {
            type: 'array',
            "default": [],
            items: {
              type: 'string'
            }
          },
          command: {
            description: "The exact command to run. <strong>Leave this blank</strong> unless you know what you are doing!",
            type: 'array',
            "default": [],
            items: {
              type: 'string'
            }
          },
          displayLog: {
            type: 'boolean',
            "default": false
          }
        },
        order: 18
      },
      citePanelFormat: {
        type: 'array',
        "default": ["{author_short} {year} - {title_short} ({keyword})", "{title}"],
        order: 19
      },
      citeAutocompleteFormat: {
        type: 'string',
        "default": "{keyword}: {title}",
        order: 20
      }
    },
    activate: function(state) {
      this.ltConsole = new LTConsole(state.ltConsoleState);
      this.viewer = new Viewer(this.ltConsole);
      this.builder = new Builder(this.ltConsole);
      this.builder.viewer = this.viewer;
      this.completionManager = new CompletionManager(this.ltConsole);
      this.snippetManager = new SnippetManager(this.ltConsole);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:toggle-log': (function(_this) {
          return function() {
            return _this.ltConsole.toggle_log();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:add-log': (function(_this) {
          return function() {
            return _this.ltConsole.add_log();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:clear-log': (function(_this) {
          return function() {
            return _this.ltConsole.clear();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:hide-ltconsole': (function(_this) {
          return function() {
            return _this.ltConsole.hide();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:show-ltconsole': (function(_this) {
          return function() {
            return _this.ltConsole.show();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:build': (function(_this) {
          return function() {
            return _this.builder.build();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:jump-to-pdf': (function(_this) {
          return function() {
            return _this.viewer.jumpToPdf();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'latextools:ref-cite-complete': (function(_this) {
          return function() {
            var keybinding;
            return _this.completionManager.refCiteComplete(keybinding = true);
          };
        })(this)
      }));
      return atom.workspace.observeTextEditors((function(_this) {
        return function(te) {
          var _ref1;
          if (!(_ref1 = path.extname(te.getPath()), __indexOf.call(atom.config.get('latextools.texFileExtensions'), _ref1) >= 0)) {
            return;
          }
          return _this.subscriptions.add(te.onDidStopChanging(function() {
            var keybinding;
            if (te !== atom.workspace.getActiveTextEditor()) {
              return;
            }
            if (atom.config.get("latextools.refAutoTrigger") || atom.config.get("latextools.citeAutoTrigger")) {
              return _this.completionManager.refCiteComplete(te, keybinding = false);
            }
          }));
        };
      })(this));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      return this.ltConsole.destroy();
    },
    serialize: function() {
      return {
        ltConsoleState: this.ltConsole.serialize()
      };
    },
    consumeSnippets: function(snippets) {
      this.snippetManager.setService(snippets);
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:wrap-in-command': (function(_this) {
          return function() {
            return _this.snippetManager.wrapInCommand();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:wrap-in-environment': (function(_this) {
          return function() {
            return _this.snippetManager.wrapInEnvironment();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:wrap-in-emph': (function(_this) {
          return function() {
            return _this.snippetManager.wrapIn("emph");
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:wrap-in-bold': (function(_this) {
          return function() {
            return _this.snippetManager.wrapIn("textbf");
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:wrap-in-underline': (function(_this) {
          return function() {
            return _this.snippetManager.wrapIn("underline");
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:wrap-in-monospace': (function(_this) {
          return function() {
            return _this.snippetManager.wrapIn("texttt");
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:close-environment': (function(_this) {
          return function() {
            return _this.snippetManager.closeEnvironment();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:dollar-sign': (function(_this) {
          return function() {
            return _this.snippetManager.dollarSign();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:backquote': (function(_this) {
          return function() {
            return _this.snippetManager.quotes('`', '\'', '`');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:quote': (function(_this) {
          return function() {
            return _this.snippetManager.quotes('`', '\'', '\'');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:double-quote': (function(_this) {
          return function() {
            return _this.snippetManager.quotes('``', '\'\'', '"');
          };
        })(this)
      }));
      return new Disposable(function() {
        return this.snippets = null;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2xhdGV4dG9vbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNIQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FBWixDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUZULENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVIsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBSmpCLENBQUE7O0FBQUEsRUFLQSxPQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFMYixDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQUEsR0FDZjtBQUFBLElBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxJQUNBLGFBQUEsRUFBZSxJQURmO0FBQUEsSUFFQSxRQUFBLEVBQVUsSUFGVjtBQUFBLElBSUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLENBRlA7T0FERjtBQUFBLE1BSUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLEtBQUEsRUFBTyxDQUZQO09BTEY7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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/latextools.coffee
