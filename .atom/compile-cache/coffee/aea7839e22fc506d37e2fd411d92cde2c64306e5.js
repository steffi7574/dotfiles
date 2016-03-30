(function() {
  var CompositeDisposable, UI,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  UI = (function(_super) {
    __extends(UI, _super);

    function UI() {
      return UI.__super__.constructor.apply(this, arguments);
    }

    UI.prototype.createdCallback = function() {
      this.hiddenPanels = [];
      this.classList.add('isearch-ui');
      this.editorContainer = document.createElement('div');
      this.editorContainer.className = 'editor-container';
      this.counterContainer = document.createElement('div');
      this.counterContainer.className = 'counter';
      this.appendChild(this.counterContainer);
      this.appendChild(this.editorContainer);
      this.editorElement = document.createElement('atom-text-editor');
      this.editorElement.classList.add('editor', 'isearch');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.editorContainer.appendChild(this.editorElement);
      this.editor = this.editorElement.getModel();
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    UI.prototype.initialize = function(main) {
      this.main = main;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor.isearch', {
        'isearch:fill-cursor-word': (function(_this) {
          return function() {
            return _this.fillCursorWord();
          };
        })(this),
        'isearch:fill-history-next': (function(_this) {
          return function() {
            return _this.fillHistory('next');
          };
        })(this),
        'isearch:fill-history-prev': (function(_this) {
          return function() {
            return _this.fillHistory('prev');
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'isearch:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'click': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'blur': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      }));
      this.handleInput();
      return this;
    };

    UI.prototype.handleInput = function() {
      var subs;
      this.subscriptions = subs = new CompositeDisposable;
      subs.add(this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.isFinishing()) {
            return;
          }
          _this.main.search(_this.editor.getText());
          return _this.showCounter();
        };
      })(this)));
      return subs.add(this.editor.onDidDestroy(function() {
        return subs.dispose();
      }));
    };

    UI.prototype.isFinishing = function() {
      return this.finishing;
    };

    UI.prototype.showCounter = function() {
      var content, current, total, _ref;
      _ref = this.main.getCount(), total = _ref.total, current = _ref.current;
      content = total !== 0 ? "" + current + " / " + total : "0";
      return this.counterContainer.textContent = "Isearch: " + content;
    };

    UI.prototype.focus = function() {
      this.mainEditorSubscription = this.main.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.panel.show();
      this.editorElement.focus();
      return this.showCounter();
    };

    UI.prototype.fillCursorWord = function() {
      return this.editor.setText(this.main.editor.getWordUnderCursor());
    };

    UI.prototype.fillHistory = function(direction) {
      var entry;
      if (entry = this.main.getHistory(direction)) {
        return this.editor.setText(entry);
      }
    };

    UI.prototype.unFocus = function() {
      this.mainEditorSubscription.dispose();
      this.editor.setText('');
      this.panel.hide();
      atom.workspace.getActivePane().activate();
      return this.finishing = false;
    };

    UI.prototype.confirm = function() {
      if (!this.editor.getText()) {
        return;
      }
      if (this.main.matches.isEmpty()) {
        return;
      }
      this.finishing = true;
      this.main.land();
      this.main.saveHistory(this.editor.getText());
      return this.unFocus();
    };

    UI.prototype.cancel = function() {
      if (this.finishing) {
        return;
      }
      this.finishing = true;
      this.main.cancel();
      return this.unFocus();
    };

    UI.prototype.isVisible = function() {
      return this.panel.isVisible();
    };

    UI.prototype.destroy = function() {
      this.panel.destroy();
      this.editor.destroy();
      this.subscriptions.dispose();
      this.mainEditorSubscription.dispose();
      return this.remove();
    };

    return UI;

  })(HTMLElement);

  module.exports = document.registerElement('isearch-ui', {
    "extends": 'div',
    prototype: UI.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2lzZWFyY2gvbGliL3VpLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1QkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFFTTtBQUNKLHlCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxpQkFBQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFBaEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsWUFBZixDQURBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxlQUFELEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBSG5CLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxlQUFlLENBQUMsU0FBakIsR0FBNkIsa0JBSjdCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUxwQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsU0FBbEIsR0FBOEIsU0FOOUIsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsZ0JBQWQsQ0FSQSxDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxlQUFkLENBVEEsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsa0JBQXZCLENBWGpCLENBQUE7QUFBQSxNQVlBLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLFFBQTdCLEVBQXVD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

//# sourceURL=/home/sguenther/.atom/packages/isearch/lib/ui.coffee
