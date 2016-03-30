(function() {
  var Base, CompositeDisposable, Delegato, OperationAbortedError, delegatingMethods, getEditorState, run, selectList, settings, _,
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

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.vimState.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.vimState.operationStack.cancel();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDJIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBTGIsQ0FBQTs7QUFBQSxFQU1BLGNBQUEsR0FBaUIsSUFOakIsQ0FBQTs7QUFBQSxFQVFBLEdBQUEsR0FBTSxTQUFDLEtBQUQsRUFBUSxVQUFSLEdBQUE7QUFDSixRQUFBLFFBQUE7O01BRFksYUFBVztLQUN2QjtBQUFBLElBQUEsSUFBRyxRQUFBLEdBQVcsY0FBQSxDQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFmLENBQWQ7YUFFRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQXhCLENBQTRCLEtBQTVCLEVBQW1DLFVBQW5DLEVBRkY7S0FESTtFQUFBLENBUk4sQ0FBQTs7QUFBQSxFQWFBLGlCQUFBLEdBQW9CLENBQ2xCLGtCQURrQixFQUVsQixtQkFGa0IsRUFHbEIsa0JBSGtCLEVBSWxCLG1CQUprQixFQUtsQixtQkFMa0IsRUFNbEIsbUJBTmtCLEVBT2xCLG9CQVBrQixFQVFsQixtQkFSa0IsRUFTbEIsb0JBVGtCLEVBVWxCLG9CQVZrQixFQVdsQixjQVhrQixFQVlsQixhQVprQixFQWFsQixnQkFia0IsRUFjbEIs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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/base.coffee
