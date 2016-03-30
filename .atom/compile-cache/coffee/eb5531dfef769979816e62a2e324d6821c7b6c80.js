(function() {
  var CompositeDisposable, REGISTERS, RegisterManager, globalState, settings, toggleClassByCondition,
    __slice = [].slice;

  globalState = require('./global-state');

  settings = require('./settings');

  CompositeDisposable = require('atom').CompositeDisposable;

  toggleClassByCondition = require('./utils').toggleClassByCondition;

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
    function RegisterManager(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.data = globalState.register;
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.updateEditorElement();
    };

    RegisterManager.prototype.destroy = function() {
      var _ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return _ref = {}, this.subscriptionBySelection = _ref.subscriptionBySelection, this.clipboardBySelection = _ref.clipboardBySelection, _ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var _ref;
      return (_ref = this.get(name, selection).text) != null ? _ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var text, type, _ref, _ref1;
      if (name == null) {
        name = this.getName();
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          _ref1 = (_ref = this.data[name.toLowerCase()]) != null ? _ref : {}, text = _ref1.text, type = _ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function() {
      var args, name, selection, value, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = [], name = _ref[0], value = _ref[1];
      switch (args.length) {
        case 1:
          value = args[0];
          break;
        case 2:
          name = args[0], value = args[1];
      }
      if (name == null) {
        name = this.getName();
      }
      if (!this.isValidName(name)) {
        return;
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            return this.append(name.toLowerCase(), value);
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      if (!(register = this.data[name])) {
        this.data[name] = value;
        return;
      }
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.text += '\n';
          register.type = 'linewise';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.getName = function() {
      var _ref;
      return (_ref = this.name) != null ? _ref : settings.get('defaultRegister');
    };

    RegisterManager.prototype.setName = function() {
      this.vimState.hover.add('"');
      this.updateEditorElement();
      this.vimState.onDidConfirmInput((function(_this) {
        return function(name) {
          _this.name = name;
          return _this.vimState.hover.add(_this.name);
        };
      })(this));
      this.vimState.onDidCancelInput((function(_this) {
        return function() {
          return _this.vimState.hover.reset();
        };
      })(this));
      return this.vimState.input.focus({
        charsMax: 1
      });
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'character';
      }
    };

    RegisterManager.prototype.updateEditorElement = function() {
      return toggleClassByCondition(this.editorElement, 'with-register', this.name != null);
    };

    return RegisterManager;

  })();

  module.exports = RegisterManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3JlZ2lzdGVyLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDhGQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQURYLENBQUE7O0FBQUEsRUFFQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBRkQsQ0FBQTs7QUFBQSxFQUdDLHlCQUEwQixPQUFBLENBQVEsU0FBUixFQUExQixzQkFIRCxDQUFBOztBQUFBLEVBS0EsU0FBQSxHQUFZLG9CQUxaLENBQUE7O0FBQUEsRUFzQk07QUFDUyxJQUFBLHlCQUFFLFFBQUYsR0FBQTtBQUNYLFVBQUEsSUFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQSxPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxXQUFXLENBQUMsUUFEcEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLHVCQUFELEdBQTJCLEdBQUEsQ0FBQSxHQUYzQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsR0FBQSxDQUFBLEdBSHhCLENBRFc7SUFBQSxDQUFiOztBQUFBLDhCQU1BLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBUixDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUEsRUFGSztJQUFBLENBTlAsQ0FBQTs7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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/register-manager.coffee
