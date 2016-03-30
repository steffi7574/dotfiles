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
      var error, operation, _ref1;
      if (_.isString(klass)) {
        klass = Base.getClass(klass);
      }
      if (!klass) {
        throw new Error("Invalid operation, can't run.");
      }
      try {
        if (((_ref1 = this.peekTop()) != null ? _ref1.constructor : void 0) === klass) {
          klass = Base.getClass('MoveToRelativeLine');
        }
        operation = new klass(this.vimState, properties);
        if ((this.vimState.isMode('visual') && _.isFunction(operation.select)) || (this.isEmpty() && operation["instanceof"]('TextObject'))) {
          this.stack.push(new Select(this.vimState));
        }
        this.stack.push(operation);
        if (this.vimState.isMode('visual') && operation["instanceof"]('Operator')) {
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
      var error, operation, _base;
      if (this.stack.length > 2) {
        throw new Error('Operation stack length exceeds 2');
      }
      if (this.stack.length > 1) {
        try {
          operation = this.stack.pop();
          this.peekTop().setTarget(operation);
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
        this.operation = this.stack.pop();
        this.vimState.emitter.emit('will-execute-operation', this.operation);
        return this.execute();
      }
    };

    OperationStack.prototype.suspendExecute = function() {
      return this.executionSuspended = true;
    };

    OperationStack.prototype.unsuspendExecute = function() {
      return this.executionSuspended = false;
    };

    OperationStack.prototype.isExecuteSuspended = function() {
      return this.executionSuspended;
    };

    OperationStack.prototype.execute = function() {
      this.operation.execute();
      if (this.isExecuteSuspended()) {
        return;
      }
      this.vimState.emitter.emit('did-execute-operation', this.operation);
      if (this.operation.isRecordable()) {
        this.record(this.operation);
      }
      return this.finish();
    };

    OperationStack.prototype.cancel = function() {
      if (!(this.vimState.isMode('visual') || this.vimState.isMode('insert'))) {
        this.vimState.activate('reset');
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function() {
      var cursor, message, operationName, _i, _len, _ref1;
      this.vimState.emitter.emit('did-finish-operation');
      if (this.vimState.isMode('normal')) {
        if (!this.editor.getLastSelection().isEmpty()) {
          if (settings.get('throwErrorOnNonEmptySelectionInNormalMode')) {
            operationName = this.operation.constructor.name;
            message = "Selection is not empty in normal-mode: " + operationName;
            if (this.operation.target != null) {
              message += ", target= " + this.operation.target.constructor.name;
            }
            throw new Error(message);
          } else {
            this.editor.clearSelections();
          }
        }
        _ref1 = this.editor.getCursors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          cursor = _ref1[_i];
          if (cursor.isAtEndOfLine()) {
            moveCursorLeft(cursor, {
              preserveGoalColumn: true
            });
          }
        }
      }
      this.operation = null;
      this.vimState.refreshCursors();
      return this.vimState.reset();
    };

    OperationStack.prototype.peekTop = function() {
      return _.last(this.stack);
    };

    OperationStack.prototype.reset = function() {
      var _ref1;
      this.stack = [];
      this.executionSuspended = false;
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
