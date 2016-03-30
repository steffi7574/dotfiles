(function() {
  var CompositeDisposable, REGISTERS, RegisterManager, globalState, settings, toggleClassByCondition, validNames,
    __slice = [].slice;

  globalState = require('./global-state');

  settings = require('./settings');

  CompositeDisposable = require('atom').CompositeDisposable;

  toggleClassByCondition = require('./utils').toggleClassByCondition;

  validNames = /[a-zA-Z*+%_"]/;

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  RegisterManager = (function() {
    function RegisterManager(vimState) {
      var _ref;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.data = globalState.register;
    }

    RegisterManager.prototype.isValid = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name) {
      var _ref;
      return (_ref = this.get(name).text) != null ? _ref : '';
    };

    RegisterManager.prototype.get = function(name) {
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
          text = atom.clipboard.read();
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
      var args, name, value, _ref;
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
      if (!this.isValid(name)) {
        return;
      }
      if (name === '"') {
        name = settings.get('defaultRegister');
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      switch (name) {
        case '*':
        case '+':
          return atom.clipboard.write(value.text);
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

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.updateEditorElement();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3JlZ2lzdGVyLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDBHQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBQWQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQURYLENBQUE7O0FBQUEsRUFFQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBRkQsQ0FBQTs7QUFBQSxFQUdDLHlCQUEwQixPQUFBLENBQVEsU0FBUixFQUExQixzQkFIRCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLGVBTGIsQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxvQkFOWixDQUFBOztBQUFBLEVBdUJNO0FBQ1MsSUFBQSx5QkFBRSxRQUFGLEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUEsT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQSxhQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsV0FBVyxDQUFDLFFBRHBCLENBRFc7SUFBQSxDQUFiOztBQUFBLDhCQUlBLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTthQUNQLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZixFQURPO0lBQUEsQ0FKVCxDQUFBOztBQUFBLDhCQU9BLE9BQUEsR0FBUyxTQUFDLElBQUQsR0FBQTtBQUNQLFVBQUEsSUFBQTsyREFBa0IsR0FEWDtJQUFBLENBUFQsQ0FBQTs7QUFBQSw4QkFVQSxHQUFBLEdBQUssU0FBQyxJ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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/register-manager.coffee
