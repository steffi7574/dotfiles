(function() {
  var Base, CompositeDisposable, CurrentSelection, OperationStack, Select, moveCursorLeft, settings, _, _ref,
    __slice = [].slice;

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  Base = require('./base');

  moveCursorLeft = require('./utils').moveCursorLeft;

  settings = require('./settings');

  _ref = {}, CurrentSelection = _ref.CurrentSelection, Select = _ref.Select;

  OperationStack = (function() {
    function OperationStack(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      if (CurrentSelection == null) {
        CurrentSelection = Base.getClass('CurrentSelection');
      }
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      this.reset();
    }

    OperationStack.prototype.subscribe = function() {
      var args, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref1 = this.subscriptions).add.apply(_ref1, args);
    };

    OperationStack.prototype.run = function(klass, properties) {
      var error, op;
      if (_.isString(klass)) {
        klass = Base.getClass(klass);
      }
      try {
        if (!this.isEmpty() && (this.peekTop().constructor === klass)) {
          klass = Base.getClass('MoveToRelativeLine');
        }
        op = new klass(this.vimState, properties);
        if ((this.vimState.isMode('visual') && _.isFunction(op.select)) || (this.isEmpty() && op["instanceof"]('TextObject'))) {
          this.stack.push(new Select(this.vimState));
        }
        this.stack.push(op);
        if (this.vimState.isMode('visual') && op["instanceof"]('Operator')) {
          this.stack.push(new CurrentSelection(this.vimState));
        }
        this.processing = true;
        return this.process();
      } catch (_error) {
        error = _error;
        this.vimState.reset();
        if (!(typeof error["instanceof"] === "function" ? error["instanceof"]('OperationAbortedError') : void 0)) {
          throw error;
        }
      } finally {
        this.processing = false;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var error, op, _base;
      if (this.stack.length > 2) {
        throw new Error('Operation stack length exceeds 2');
      }
      if (this.stack.length > 1) {
        try {
          op = this.stack.pop();
          this.peekTop().setTarget(op);
        } catch (_error) {
          error = _error;
          if (typeof error["instanceof"] === "function" ? error["instanceof"]('OperatorError') : void 0) {
            this.vimState.activate('reset');
            return;
          } else {
            throw error;
          }
        }
      }
      if (!this.peekTop().isComplete()) {
        if (this.vimState.isMode('normal') && (typeof (_base = this.peekTop())["instanceof"] === "function" ? _base["instanceof"]('Operator') : void 0)) {
          return this.vimState.activate('operator-pending');
        }
      } else {
        op = this.stack.pop();
        this.lastOperation = op;
        op.execute();
        if (op.isRecordable()) {
          this.record(op);
        }
        return this.finish();
      }
    };

    OperationStack.prototype.cancel = function() {
      if (!(this.vimState.isMode('visual') || this.vimState.isMode('insert'))) {
        this.vimState.activate('reset');
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function() {
      var c, message, operationName, _i, _len, _ref1;
      this.vimState.emitter.emit('did-operation-finish');
      if (this.vimState.isMode('normal')) {
        if (!this.editor.getLastSelection().isEmpty()) {
          if (settings.get('throwErrorOnNonEmptySelectionInNormalMode')) {
            operationName = this.lastOperation.constructor.name;
            message = "Selection is not empty in normal-mode: " + operationName;
            if (this.lastOperation.target != null) {
              message += ", target= " + this.lastOperation.target.constructor.name;
            }
            throw new Error(message);
          } else {
            this.editor.clearSelections();
          }
        }
        _ref1 = this.editor.getCursors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          c = _ref1[_i];
          if (c.isAtEndOfLine()) {
            moveCursorLeft(c, {
              preserveGoalColumn: true
            });
          }
        }
      }
      this.lastOperation = null;
      this.vimState.refreshCursors();
      return this.vimState.reset();
    };

    OperationStack.prototype.peekTop = function() {
      return _.last(this.stack);
    };

    OperationStack.prototype.reset = function() {
      var _ref1;
      this.stack = [];
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      return this.subscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      return _ref2 = {}, this.stack = _ref2.stack, this.subscriptions = _ref2.subscriptions, _ref2;
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.record = function(recorded) {
      this.recorded = recorded;
    };

    OperationStack.prototype.getRecorded = function() {
      return this.recorded;
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdGlvbi1zdGFjay5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsc0dBQUE7SUFBQSxrQkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUZELENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUMsaUJBQWtCLE9BQUEsQ0FBUSxTQUFSLEVBQWxCLGNBSkQsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUxYLENBQUE7O0FBQUEsRUFNQSxPQUE2QixFQUE3QixFQUFDLHdCQUFBLGdCQUFELEVBQW1CLGNBQUEsTUFObkIsQ0FBQTs7QUFBQSxFQVFNO0FBQ1MsSUFBQSx3QkFBRSxRQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxXQUFBLFFBQ2IsQ0FBQTtBQUFBLE1BQUMsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFNBQVgsTUFBRixDQUFBOztRQUNBLG1CQUFvQixJQUFJLENBQUMsUUFBTCxDQUFjLGtCQUFkO09BRHBCOztRQUVBLFNBQVUsSUFBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkO09BRlY7QUFBQSxNQUdBLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FIQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSw2QkFNQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxXQUFBO0FBQUEsTUFEVSw4REFDVixDQUFBO2FBQUEsU0FBQSxJQUFDLENBQUEsYUFBRCxDQUFjLENBQUMsR0FBZixjQUFtQixJQUFuQixFQURTO0lBQUEs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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/operation-stack.coffee
