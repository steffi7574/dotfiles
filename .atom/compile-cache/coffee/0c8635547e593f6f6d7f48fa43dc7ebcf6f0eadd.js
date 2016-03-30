(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, delegatingMethods, getEditorState, run, settings, _,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  settings = require('./settings');

  getEditorState = null;

  run = function(klass, properties) {
    var vimState;
    if (properties == null) {
      properties = {};
    }
    if (vimState = getEditorState(atom.workspace.getActiveTextEditor())) {
      return vimState.operationStack.run(klass, properties);
    }
  };

  delegatingMethods = ["onDidChangeInput", "onDidConfirmInput", "onDidCancelInput", "onDidUnfocusInput", "onDidCommandInput", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidUnfocusSearch", "onDidCommandSearch", "onWillSelect", "onDidSelect", "onDidSetTarget", "onDidOperationFinish", "subscribe", "isMode"];

  Base = (function() {
    var registries;

    Delegato.includeInto(Base);

    Base.prototype.recordable = false;

    Base.prototype.repeated = false;

    Base.prototype.defaultCount = 1;

    Base.prototype.requireInput = false;

    Base.prototype.requireTarget = false;

    Base.prototype.operator = null;

    Base.prototype.asTarget = false;

    Base.commandPrefix = 'vim-mode-plus';

    Base.delegatesMethods.apply(Base, __slice.call(delegatingMethods).concat([{
      toProperty: 'vimState'
    }]));

    function Base(vimState, properties) {
      var hover, _ref, _ref1;
      this.vimState = vimState;
      _ref = this.vimState, this.editor = _ref.editor, this.editorElement = _ref.editorElement;
      this.vimState.hover.setPoint();
      if (hover = (_ref1 = this.hover) != null ? _ref1[settings.get('showHoverOnOperateIcon')] : void 0) {
        this.addHover(hover);
      }
      _.extend(this, properties);
    }

    Base.prototype.isComplete = function() {
      var _ref;
      if (this.requireInput && (this.input == null)) {
        return false;
      }
      if (this.requireTarget) {
        return (_ref = this.target) != null ? _ref.isComplete() : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.isRecordable = function() {
      return this.recordable;
    };

    Base.prototype.isRepeated = function() {
      return this.repeated;
    };

    Base.prototype.setRepeated = function() {
      return this.repeated = true;
    };

    Base.prototype.isAsOperatorTarget = function() {
      return (this.operator != null) && this !== this.operator;
    };

    Base.prototype.abort = function() {
      throw new OperationAbortedError('Aborted');
    };

    Base.prototype.getCount = function() {
      var _ref;
      return this.count != null ? this.count : this.count = (_ref = this.vimState.count.get()) != null ? _ref : this.defaultCount;
    };

    Base.prototype.isDefaultCount = function() {
      return this.getCount() === this.defaultCount;
    };

    Base.prototype.isCountSpecified = function() {
      return this.vimState.count.get() != null;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidOperationFinish((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.addHover = function(text, _arg) {
      var replace;
      replace = (_arg != null ? _arg : {}).replace;
      if (settings.get('showHoverOnOperate')) {
        if (replace == null) {
          replace = false;
        }
        if (replace) {
          return this.vimState.hover.replaceLastSection(text);
        } else {
          return this.vimState.hover.add(text);
        }
      }
    };

    Base.prototype["new"] = function(klassName, properties) {
      var klass;
      if (properties == null) {
        properties = {};
      }
      klass = Base.getClass(klassName);
      return new klass(this.vimState, properties);
    };

    Base.prototype.focusInput = function(options) {
      var firstInput;
      if (options == null) {
        options = {};
      }
      if (options.charsMax == null) {
        options.charsMax = 1;
      }
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.vimState.operationStack.process();
        };
      })(this));
      firstInput = true;
      this.onDidChangeInput((function(_this) {
        return function(input) {
          _this.addHover(input, {
            replace: !firstInput
          });
          return firstInput = false;
        };
      })(this));
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.vimState.operationStack.cancel();
        };
      })(this));
      return this.vimState.input.focus(options);
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.directInstanceof = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.emitWillSelect = function() {
      return this.vimState.emitter.emit('will-select');
    };

    Base.prototype.emitDidSelect = function() {
      return this.vimState.emitter.emit('did-select');
    };

    Base.prototype.emitDidSetTarget = function(operator) {
      return this.vimState.emitter.emit('did-set-target', operator);
    };

    Base.init = function(service) {
      var klass, lib, __, _i, _len, _ref, _ref1;
      getEditorState = service.getEditorState;
      this.subscriptions = new CompositeDisposable();
      _ref = ['./operator', './motion', './text-object', './insert-mode', './misc-commands', './scroll', './visual-blockwise'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lib = _ref[_i];
        require(lib);
      }
      _ref1 = this.getRegistries();
      for (__ in _ref1) {
        klass = _ref1[__];
        if (klass.isCommand()) {
          this.subscriptions.add(klass.registerCommand());
        }
      }
      return this.subscriptions;
    };

    Base.reset = function() {
      var klass, __, _ref, _results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable();
      _ref = this.getRegistries();
      _results = [];
      for (__ in _ref) {
        klass = _ref[__];
        if (klass.isCommand()) {
          _results.push(this.subscriptions.add(klass.registerCommand()));
        }
      }
      return _results;
    };

    registries = {
      Base: Base
    };

    Base.extend = function(command) {
      this.command = command != null ? command : true;
      if (this.name in registries && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getRegistries = function() {
      return registries;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _.dasherize(this.name);
    };

    Base.registerCommand = function() {
      return atom.commands.add('atom-text-editor', this.getCommandName(), (function(_this) {
        return function() {
          return run(_this);
        };
      })(this));
    };

    Base.getClass = function(klassName) {
      return registries[klassName];
    };

    return Base;

  })();

  OperationAbortedError = (function(_super) {
    __extends(OperationAbortedError, _super);

    OperationAbortedError.extend(false);

    function OperationAbortedError(message) {
      this.message = message;
      this.name = 'OperationAborted Error';
    }

    return OperationAbortedError;

  })(Base);

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLCtHQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsY0FBQSxHQUFpQixJQUxqQixDQUFBOztBQUFBLEVBT0EsR0FBQSxHQUFNLFNBQUMsS0FBRCxFQUFRLFVBQVIsR0FBQTtBQUNKLFFBQUEsUUFBQTs7TUFEWSxhQUFXO0tBQ3ZCO0FBQUEsSUFBQSxJQUFHLFFBQUEsR0FBVyxjQUFBLENBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQWYsQ0FBZDthQUVFLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBeEIsQ0FBNEIsS0FBNUIsRUFBbUMsVUFBbkMsRUFGRjtLQURJO0VBQUEsQ0FQTixDQUFBOztBQUFBLEVBWUEsaUJBQUEsR0FBb0IsQ0FDbEIsa0JBRGtCLEVBRWxCLG1CQUZrQixFQUdsQixrQkFIa0IsRUFJbEIsbUJBSmtCLEVBS2xCLG1CQUxrQixFQU1sQixtQkFOa0IsRUFPbEIsb0JBUGtCLEVBUWxCLG1CQVJrQixFQVNsQixvQkFUa0IsRUFVbEIsb0JBVmtCLEVBV2xCLGNBWGtCLEVBWWxCLGFBWmtCLEVBYWxCLGdCQWJrQixFQWNsQixzQkFka0IsRUFlbEIsV0Fma0IsRUFnQmxCLFFBaEJrQixDQVpwQixDQUFBOztB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/base.coffee
