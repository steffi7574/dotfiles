(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, getEditorState, run, selectList, settings, vimStateMethods, _,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Delegato = require('delegato');

  CompositeDisposable = require('atom').CompositeDisposable;

  settings = require('./settings');

  selectList = require('./select-list');

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

  vimStateMethods = ["onDidChangeInput", "onDidConfirmInput", "onDidCancelInput", "onDidUnfocusInput", "onDidCommandInput", "onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidUnfocusSearch", "onDidCommandSearch", "onWillSelectTarget", "onDidSelectTarget", "onDidSetTarget", "onDidFinishOperation", "onWillExecuteOperation", "onDidExecuteOperation", "subscribe", "isMode"];

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

    Base.prototype.context = {};

    Base.commandPrefix = 'vim-mode-plus';

    Base.delegatesMethods.apply(Base, __slice.call(vimStateMethods).concat([{
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
      return this.onDidFinishOperation((function(_this) {
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

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.suspendExecuteOperation = function() {
      return this.vimState.operationStack.suspendExecute();
    };

    Base.prototype.unsuspendExecuteOperation = function() {
      this.vimState.operationStack.unsuspendExecute();
      return this.vimState.operationStack.execute();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.vimState.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      return selectList.show(this.vimState, options);
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
          return _this.processOperation();
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
          return _this.cancelOperation();
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

    Base.prototype.emitWillSelectTarget = function() {
      return this.vimState.emitter.emit('will-select-target');
    };

    Base.prototype.emitDidSelectTarget = function() {
      return this.vimState.emitter.emit('did-select-target');
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
      if ((this.name in registries) && (!this.suppressWarning)) {
        console.warn("Duplicate constructor " + this.name);
      }
      return registries[this.name] = this;
    };

    Base.getClass = function(klassName) {
      return registries[klassName];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLHlIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLGNBQUEsR0FBaUIsSUFOakIsQ0FBQTs7QUFBQSxFQVFBLEdBQUEsR0FBTSxTQUFDLEtBQUQsRUFBUSxVQUFSLEdBQUE7QUFDSixRQUFBLFFBQUE7O01BRFksYUFBVztLQUN2QjtBQUFBLElBQUEsSUFBRyxRQUFBLEdBQVcsY0FBQSxDQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFmLENBQWQ7YUFFRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXhCLENBQTRCLEtBQTVCLEVBQW1DLFVBQW5DLEVBRkY7S0FESTtFQUFBLENBUk4sQ0FBQTs7QUFBQSxFQWFBLGVBQUEsR0FBa0IsQ0FDaEIsa0JBRGdCLEVBRWhCLG1CQUZnQixFQUdoQixrQkFIZ0IsRUFJaEIsbUJBSmdCLEVBS2hCLG1CQUxnQixFQU1oQixtQkFOZ0IsRUFPaEIsb0JBUGdCLEVBUWhCLG1CQVJnQixFQVNoQixvQkFUZ0IsRUFVaEIsb0JBVmdCLEVBV2hCLG9CQVhnQixFQVloQixtQkFaZ0IsRUFhaEIsZ0JBYmdCLEVBY2hC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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/base.coffee
