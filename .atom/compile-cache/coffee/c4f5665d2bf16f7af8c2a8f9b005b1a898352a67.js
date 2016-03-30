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
        "default": true
      },
      order: 10,
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
            type: 'numer',
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
        "default": "{keyword}: {title}"
      },
      order: 20
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
            return _this.completionManager.refCiteComplete();
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
            if (atom.config.get("latextools.refAutoTrigger")) {
              return _this.completionManager.refCiteComplete();
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
            return _this.snippetManager.wrapIn("bold");
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
            return _this.snippetManager.quotes('`', '\'');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:quote': (function(_this) {
          return function() {
            return _this.snippetManager.quotes('`', '\'');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'latextools:double-quote': (function(_this) {
          return function() {
            return _this.snippetManager.quotes('``', '\'\'');
          };
        })(this)
      }));
      return new Disposable(function() {
        return this.snippets = null;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2xhdGV4dG9vbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNIQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVIsQ0FBWixDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUZULENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsc0JBQVIsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBSmpCLENBQUE7O0FBQUEsRUFLQSxPQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFMYixDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFVBQUEsR0FDZjtBQUFBLElBQUEsU0FBQSxFQUFXLElBQVg7QUFBQSxJQUNBLGFBQUEsRUFBZSxJQURmO0FBQUEsSUFFQSxRQUFBLEVBQVUsSUFGVjtBQUFBLElBSUEsTUFBQSxFQUNFO0FBQUEsTUFBQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtBQUFBLFFBRUEsS0FBQSxFQUFPLENBRlA7T0FERjtBQUFBLE1BSUEsY0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLElBRFQ7QUFBQSxRQUVBLEtBQUEsRUFBTyxDQUZQO09BTEY7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QUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsU0FBQSxFQUFTLEVBRFQ7V0FERjtBQUFBLFVBR0EsTUFBQSxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsU0FBQSxFQUFTLFFBRFQ7QUFBQSxZQUVBLE1BQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxTQUFYLENBRk47V0FKRjtBQUFBLFVBT0EsT0FBQSxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsU0FBQSxFQUFTLGdCQURUO1dBUkY7QUFBQSxVQVVBLGNBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBWEY7QUFBQSxVQWFBLGNBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxHQURUO1dBZEY7U0FGRjtBQUFBLFFBa0JBLEtBQUEsRUFBTSxFQWxCTjtPQTNFRjtBQUFBLE1BOEZBLEtBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFVBQUEsRUFDRTtBQUFBLFVBQUEsT0FBQSxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFlBQ0EsU0FBQSxFQUFTLG1CQURUO1dBREY7QUFBQSxVQUdBLE9BQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBSkY7QUFBQSxVQU1BLGNBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBUEY7QUFBQSxVQVNBLFFBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxHQURUO1dBVkY7QUFBQSxVQVlBLGNBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxHQURUO1dBYkY7U0FGRjtBQUFBLFFBaUJB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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/latextools.coffee
