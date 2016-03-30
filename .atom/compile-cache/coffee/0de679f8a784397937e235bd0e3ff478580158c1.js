(function() {
  var CompositeDisposable, Emitter, Input, InputBase, InputBaseElement, InputElement, SearchInput, SearchInputElement, getCharacterForEvent, packageScope, searchScope,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Emitter = require('atom').Emitter;

  CompositeDisposable = require('atom').CompositeDisposable;

  getCharacterForEvent = require('./utils').getCharacterForEvent;

  packageScope = 'vim-mode-plus';

  searchScope = "" + packageScope + "-search";

  InputBase = (function() {
    InputBase.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    InputBase.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    InputBase.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    InputBase.prototype.onDidUnfocus = function(fn) {
      return this.emitter.on('did-unfocus', fn);
    };

    InputBase.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    function InputBase(vimState) {
      var _ref;
      this.vimState = vimState;
      this.emitter = new Emitter;
      this.view = atom.views.getView(this);
      _ref = this.view, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.vimState.onDidFailToSetTarget((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      atom.commands.add(this.editorElement, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'blur': (function(_this) {
          return function() {
            if (!_this.finished) {
              return _this.cancel();
            }
          };
        })(this),
        'vim-mode-plus:input-cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      this.editor.onDidChange((function(_this) {
        return function() {
          var input;
          if (_this.finished) {
            return;
          }
          input = _this.editor.getText();
          _this.emitter.emit('did-change', input);
          if (_this.canConfirm()) {
            return _this.confirm();
          }
        };
      })(this));
    }

    InputBase.prototype.canConfirm = function() {
      var _ref;
      if ((_ref = this.options) != null ? _ref.charsMax : void 0) {
        return this.editor.getText().length >= this.options.charsMax;
      } else {
        return false;
      }
    };

    InputBase.prototype.focus = function(options) {
      this.options = options != null ? options : {};
      this.finished = false;
      this.view.panel.show();
      return this.editorElement.focus();
    };

    InputBase.prototype.unfocus = function() {
      this.finished = true;
      this.emitter.emit('did-unfocus');
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return this.view.panel.hide();
    };

    InputBase.prototype.cancel = function() {
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    InputBase.prototype.destroy = function() {
      this.vimState = null;
      this.view.destroy();
      this.editor = null;
      return this.editorElement = null;
    };

    InputBase.prototype.confirm = function() {
      var input;
      if ((input = this.editor.getText()) != null) {
        this.emitter.emit('did-confirm', input);
        return this.unfocus();
      } else {
        return this.cancel();
      }
    };

    return InputBase;

  })();

  InputBaseElement = (function(_super) {
    __extends(InputBaseElement, _super);

    function InputBaseElement() {
      return InputBaseElement.__super__.constructor.apply(this, arguments);
    }

    InputBaseElement.prototype.klass = null;

    InputBaseElement.prototype.createdCallback = function() {
      this.className = this.klass;
      this.editorElement = document.createElement('atom-text-editor');
      this.editorElement.classList.add('editor');
      this.editorElement.classList.add(this.klass);
      this.editorElement.setAttribute('mini', '');
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.appendChild(this.editorElement);
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    InputBaseElement.prototype.initialize = function(model) {
      this.model = model;
      return this;
    };

    InputBaseElement.prototype.destroy = function() {
      this.model = null;
      this.editor.destroy();
      this.editor = null;
      this.panel.destroy();
      this.panel = null;
      this.editorElement = null;
      return this.remove();
    };

    return InputBaseElement;

  })(HTMLElement);

  Input = (function(_super) {
    __extends(Input, _super);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    return Input;

  })(InputBase);

  InputElement = (function(_super) {
    __extends(InputElement, _super);

    function InputElement() {
      return InputElement.__super__.constructor.apply(this, arguments);
    }

    InputElement.prototype.klass = "" + packageScope + "-input";

    InputElement.prototype.createdCallback = function() {
      InputElement.__super__.createdCallback.apply(this, arguments);
      this.editorElement = document.createElement('atom-text-editor');
      this.editorElement.classList.add('editor');
      this.editorElement.classList.add(this.klass);
      this.editorElement.setAttribute('mini', '');
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.appendChild(this.editorElement);
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    return InputElement;

  })(InputBaseElement);

  SearchInput = (function(_super) {
    __extends(SearchInput, _super);

    function SearchInput() {
      var command, commands, fn, literalModeSupportCommands, prefix, _fn;
      SearchInput.__super__.constructor.apply(this, arguments);
      this.options = {};
      this.searchHistory = this.vimState.searchHistory;
      literalModeSupportCommands = {
        "confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "cancel": (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        "visit-next": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', 'visit-next');
          };
        })(this),
        "visit-prev": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', 'visit-prev');
          };
        })(this),
        "scroll-next": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', 'scroll-next');
          };
        })(this),
        "scroll-prev": (function(_this) {
          return function() {
            return _this.emitter.emit('did-command', 'scroll-prev');
          };
        })(this),
        "insert-wild-pattern": (function(_this) {
          return function() {
            return _this.editor.insertText('.*?');
          };
        })(this)
      };
      prefix = "" + packageScope + ":search";
      commands = {};
      _fn = (function(_this) {
        return function(fn) {
          return commands["" + prefix + "-" + command] = function(event) {
            if (_this.literalCharMode) {
              _this.editor.insertText(getCharacterForEvent(event));
              return _this.literalCharMode = false;
            } else {
              return fn();
            }
          };
        };
      })(this);
      for (command in literalModeSupportCommands) {
        fn = literalModeSupportCommands[command];
        _fn(fn);
      }
      atom.commands.add(this.editorElement, commands);
      atom.commands.add(this.editorElement, {
        "vim-mode-plus:search-set-literal-char": (function(_this) {
          return function() {
            return _this.setLiteralChar();
          };
        })(this),
        "vim-mode-plus:search-set-cursor-word": (function(_this) {
          return function() {
            return _this.setCursorWord();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.editor.setText(_this.searchHistory.get('prev'));
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.editor.setText(_this.searchHistory.get('next'));
          };
        })(this)
      });
    }

    SearchInput.prototype.setCursorWord = function() {
      return this.editor.setText(this.vimState.editor.getWordUnderCursor());
    };

    SearchInput.prototype.setLiteralChar = function() {
      return this.literalCharMode = true;
    };

    SearchInput.prototype.updateOptionSettings = function(_arg) {
      var escapeRegExp;
      escapeRegExp = (_arg != null ? _arg : {}).escapeRegExp;
      if (escapeRegExp) {
        return this.view.regexSearchStatus.classList.remove('btn-primary');
      } else {
        return this.view.regexSearchStatus.classList.add('btn-primary');
      }
    };

    SearchInput.prototype.focus = function(_arg) {
      var backwards;
      backwards = _arg.backwards;
      if (backwards) {
        this.editorElement.classList.add('backwards');
      }
      return SearchInput.__super__.focus.call(this, {});
    };

    SearchInput.prototype.unfocus = function() {
      this.editorElement.classList.remove('backwards');
      this.view.regexSearchStatus.classList.add('btn-primary');
      return SearchInput.__super__.unfocus.apply(this, arguments);
    };

    return SearchInput;

  })(InputBase);

  SearchInputElement = (function(_super) {
    __extends(SearchInputElement, _super);

    function SearchInputElement() {
      return SearchInputElement.__super__.constructor.apply(this, arguments);
    }

    SearchInputElement.prototype.klass = "" + searchScope + "-container";

    SearchInputElement.prototype.createdCallback = function() {
      this.className = this.klass;
      this.editorElement = document.createElement('atom-text-editor');
      this.editorElement.classList.add('editor');
      this.editorElement.classList.add("" + searchScope);
      this.editorElement.setAttribute('mini', '');
      this.editor = this.editorElement.getModel();
      this.editor.setMini(true);
      this.editorContainer = document.createElement('div');
      this.editorContainer.className = 'editor-container';
      this.editorContainer.appendChild(this.editorElement);
      this.optionsContainer = document.createElement('div');
      this.optionsContainer.className = 'options-container';
      this.regexSearchStatus = document.createElement('span');
      this.regexSearchStatus.classList.add('inline-block-tight', 'btn', 'btn-primary');
      this.regexSearchStatus.textContent = '.*';
      this.optionsContainer.appendChild(this.regexSearchStatus);
      this.container = document.createElement('div');
      this.container.className = 'container';
      this.appendChild(this.optionsContainer);
      this.appendChild(this.editorContainer);
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
      return this;
    };

    return SearchInputElement;

  })(InputBaseElement);

  InputElement = document.registerElement("" + packageScope + "-input", {
    prototype: InputElement.prototype,
    "extends": 'div'
  });

  SearchInputElement = document.registerElement("" + packageScope + "-search-input", {
    prototype: SearchInputElement.prototype,
    "extends": 'div'
  });

  module.exports = {
    Input: Input,
    InputElement: InputElement,
    SearchInput: SearchInput,
    SearchInputElement: SearchInputElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2lucHV0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxnS0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBRUMsdUJBQXdCLE9BQUEsQ0FBUSxTQUFSLEVBQXhCLG9CQUZELENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsZUFIZixDQUFBOztBQUFBLEVBSUEsV0FBQSxHQUFjLEVBQUEsR0FBRyxZQUFILEdBQWdCLFNBSjlCLENBQUE7O0FBQUEsRUFNTTtBQUNKLHdCQUFBLFdBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsRUFBMUIsRUFBUjtJQUFBLENBQWQsQ0FBQTs7QUFBQSx3QkFDQSxZQUFBLEdBQWMsU0FBQyxFQUFELEdBQUE7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCLEVBQVI7SUFBQSxDQURkLENBQUE7O0FBQUEsd0JBRUEsV0FBQSxHQUFjLFNBQUMsRUFBRCxHQUFBO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQixFQUFSO0lBQUEsQ0FGZCxDQUFBOztBQUFBLHdCQUdBLFlBQUEsR0FBYyxTQUFDLEVBQUQsR0FBQTthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGFBQVosRUFBMkIsRUFBM0IsRUFBUjtJQUFBLENBSGQsQ0FBQTs7QUFBQSx3QkFJQSxZQUFBLEdBQWMs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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/input.coffee
