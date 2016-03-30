(function() {
  var ActivateInsertMode, ActivateReplaceMode, AutoIndent, Base, BufferedProcess, CamelCase, Change, ChangeSurround, ChangeSurroundAnyPair, ChangeToLastCharacterOfLine, CompositeDisposable, DashCase, DecodeUriComponent, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteRight, DeleteSurround, DeleteSurroundAnyPair, DeleteToLastCharacterOfLine, EncodeUriComponent, Increase, IncrementNumber, Indent, InsertAboveWithNewline, InsertAfter, InsertAfterByMotion, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertBelowWithNewline, InsertByMotion, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Mark, MoveLineDown, MoveLineUp, Operator, OperatorError, Outdent, Point, PutAfter, PutBefore, Range, Repeat, Replace, ReplaceWithRegister, Reverse, Select, SelectLatestChange, SnakeCase, SplitString, Substitute, SubstituteLine, Surround, SurroundSmartWord, SurroundWord, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, UpperCase, Yank, YankLine, flashRanges, getNewTextRangeFromCheckpoint, getVimEofBufferPosition, haveSomeSelection, moveCursorLeft, moveCursorRight, preserveSelectionStartPoints, settings, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, getVimEofBufferPosition = _ref1.getVimEofBufferPosition, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, flashRanges = _ref1.flashRanges, getNewTextRangeFromCheckpoint = _ref1.getNewTextRangeFromCheckpoint, preserveSelectionStartPoints = _ref1.preserveSelectionStartPoints;

  swrap = require('./selection-wrapper');

  settings = require('./settings');

  Base = require('./base');

  OperatorError = (function(_super) {
    __extends(OperatorError, _super);

    OperatorError.extend(false);

    function OperatorError(message) {
      this.message = message;
      this.name = 'Operator Error';
    }

    return OperatorError;

  })(Base);

  Operator = (function(_super) {
    __extends(Operator, _super);

    Operator.extend(false);

    Operator.prototype.recordable = true;

    Operator.prototype.target = null;

    Operator.prototype.flashTarget = true;

    Operator.prototype.trackChange = false;

    Operator.prototype.requireTarget = true;

    Operator.prototype.setMarkForChange = function(_arg) {
      var end, start;
      start = _arg.start, end = _arg.end;
      this.vimState.mark.set('[', start);
      return this.vimState.mark.set(']', end);
    };

    Operator.prototype.needFlash = function() {
      var _ref2;
      return this.flashTarget && settings.get('flashOnOperate') && !(_ref2 = this.constructor.name, __indexOf.call(settings.get('flashOnOperateBlacklist'), _ref2) >= 0);
    };

    Operator.prototype.needTrackChange = function() {
      return this.trackChange;
    };

    Operator.prototype.needStay = function() {
      var param, _base;
      param = this["instanceof"]('TransformString') ? "stayOnTransformString" : "stayOn" + this.constructor.name;
      return settings.get(param) || (this.stayOnLinewise && (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0));
    };

    function Operator() {
      Operator.__super__.constructor.apply(this, arguments);
      if (this["instanceof"]("Repeat")) {
        return;
      }
      if (typeof this.initialize === "function") {
        this.initialize();
      }
      if (_.isString(this.target)) {
        this.setTarget(this["new"](this.target));
      }
    }

    Operator.prototype.markSelectedBufferRange = function() {
      return this.editor.markBufferRange(this.editor.getSelectedBufferRange(), {
        invalidate: 'never',
        persistent: false
      });
    };

    Operator.prototype.observeSelectAction = function() {
      var marker;
      if (this.needStay()) {
        this.onWillSelectTarget((function(_this) {
          return function() {
            return _this.restorePoint = preserveSelectionStartPoints(_this.editor);
          };
        })(this));
      } else {
        this.onDidSelectTarget((function(_this) {
          return function() {
            return _this.restorePoint = preserveSelectionStartPoints(_this.editor);
          };
        })(this));
      }
      if (this.needFlash()) {
        this.onDidSelectTarget((function(_this) {
          return function() {
            return _this.flash(_this.editor.getSelectedBufferRanges());
          };
        })(this));
      }
      if (this.needTrackChange()) {
        marker = null;
        this.onDidSelectTarget((function(_this) {
          return function() {
            return marker = _this.markSelectedBufferRange();
          };
        })(this));
        return this.onDidFinishOperation((function(_this) {
          return function() {
            var range;
            if ((range = marker.getBufferRange())) {
              return _this.setMarkForChange(range);
            }
          };
        })(this));
      }
    };

    Operator.prototype.setTarget = function(target) {
      var message, operatorName, targetName;
      this.target = target;
      if (!_.isFunction(this.target.select)) {
        this.vimState.emitter.emit('did-fail-to-set-target');
        targetName = this.target.constructor.name;
        operatorName = this.constructor.name;
        message = "Failed to set '" + targetName + "' as target for Operator '" + operatorName + "'";
        throw new OperatorError(message);
      }
      return this.emitDidSetTarget(this);
    };

    Operator.prototype.selectTarget = function() {
      this.observeSelectAction();
      this.emitWillSelectTarget();
      this.target.select();
      this.emitDidSelectTarget();
      return haveSomeSelection(this.editor);
    };

    Operator.prototype.setTextToRegisterForSelection = function(selection) {
      return this.setTextToRegister(selection.getText(), selection);
    };

    Operator.prototype.setTextToRegister = function(text, selection) {
      var _base;
      if ((typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) && !text.endsWith('\n')) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set({
          text: text,
          selection: selection
        });
      }
    };

    Operator.prototype.flash = function(ranges) {
      if (this.flashTarget && settings.get('flashOnOperate')) {
        return flashRanges(ranges, {
          editor: this.editor,
          "class": 'vim-mode-plus-flash',
          timeout: settings.get('flashOnOperateDuration')
        });
      }
    };

    Operator.prototype.eachSelection = function(fn) {
      if (!this.selectTarget()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            _results.push(fn(selection));
          }
          return _results;
        };
      })(this));
    };

    return Operator;

  })(Base);

  Select = (function(_super) {
    __extends(Select, _super);

    function Select() {
      return Select.__super__.constructor.apply(this, arguments);
    }

    Select.extend(false);

    Select.prototype.flashTarget = false;

    Select.prototype.recordable = false;

    Select.prototype.execute = function() {
      var submode, _base;
      this.selectTarget();
      if (this.isMode('operator-pending') || this.isMode('visual', 'blockwise')) {
        return;
      }
      if (typeof (_base = this.target).isAllowSubmodeChange === "function" ? _base.isAllowSubmodeChange() : void 0) {
        submode = swrap.detectVisualModeSubmode(this.editor);
        if ((submode != null) && !this.isMode('visual', submode)) {
          return this.activateMode('visual', submode);
        }
      }
    };

    return Select;

  })(Operator);

  SelectLatestChange = (function(_super) {
    __extends(SelectLatestChange, _super);

    function SelectLatestChange() {
      return SelectLatestChange.__super__.constructor.apply(this, arguments);
    }

    SelectLatestChange.extend();

    SelectLatestChange.prototype.target = 'ALatestChange';

    return SelectLatestChange;

  })(Select);

  Delete = (function(_super) {
    __extends(Delete, _super);

    function Delete() {
      return Delete.__super__.constructor.apply(this, arguments);
    }

    Delete.extend();

    Delete.prototype.hover = {
      icon: ':delete:',
      emoji: ':scissors:'
    };

    Delete.prototype.trackChange = true;

    Delete.prototype.flashTarget = false;

    Delete.prototype.execute = function() {
      this.eachSelection((function(_this) {
        return function(selection) {
          var cursor, vimEof, _base;
          cursor = selection.cursor;
          _this.setTextToRegisterForSelection(selection);
          selection.deleteSelectedText();
          vimEof = getVimEofBufferPosition(_this.editor);
          if (cursor.getBufferPosition().isGreaterThan(vimEof)) {
            cursor.setBufferPosition([vimEof.row, 0]);
          }
          if (typeof (_base = _this.target).isLinewise === "function" ? _base.isLinewise() : void 0) {
            return cursor.skipLeadingWhitespace();
          }
        };
      })(this));
      return this.activateMode('normal');
    };

    return Delete;

  })(Operator);

  DeleteRight = (function(_super) {
    __extends(DeleteRight, _super);

    function DeleteRight() {
      return DeleteRight.__super__.constructor.apply(this, arguments);
    }

    DeleteRight.extend();

    DeleteRight.prototype.target = 'MoveRight';

    return DeleteRight;

  })(Delete);

  DeleteLeft = (function(_super) {
    __extends(DeleteLeft, _super);

    function DeleteLeft() {
      return DeleteLeft.__super__.constructor.apply(this, arguments);
    }

    DeleteLeft.extend();

    DeleteLeft.prototype.target = 'MoveLeft';

    return DeleteLeft;

  })(Delete);

  DeleteToLastCharacterOfLine = (function(_super) {
    __extends(DeleteToLastCharacterOfLine, _super);

    function DeleteToLastCharacterOfLine() {
      return DeleteToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    DeleteToLastCharacterOfLine.extend();

    DeleteToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return DeleteToLastCharacterOfLine;

  })(Delete);

  TransformString = (function(_super) {
    __extends(TransformString, _super);

    function TransformString() {
      return TransformString.__super__.constructor.apply(this, arguments);
    }

    TransformString.extend(false);

    TransformString.prototype.trackChange = true;

    TransformString.prototype.stayOnLinewise = true;

    TransformString.prototype.setPoint = true;

    TransformString.prototype.autoIndent = false;

    TransformString.prototype.execute = function() {
      this.eachSelection((function(_this) {
        return function(selection) {
          return _this.mutate(selection);
        };
      })(this));
      return this.activateMode('normal');
    };

    TransformString.prototype.mutate = function(selection) {
      var text;
      text = this.getNewText(selection.getText(), selection);
      selection.insertText(text, {
        autoIndent: this.autoIndent
      });
      if (this.setPoint) {
        return this.restorePoint(selection);
      }
    };

    return TransformString;

  })(Operator);

  ToggleCase = (function(_super) {
    __extends(ToggleCase, _super);

    function ToggleCase() {
      return ToggleCase.__super__.constructor.apply(this, arguments);
    }

    ToggleCase.extend();

    ToggleCase.prototype.displayName = 'Toggle ~';

    ToggleCase.prototype.hover = {
      icon: ':toggle-case:',
      emoji: ':clap:'
    };

    ToggleCase.prototype.toggleCase = function(char) {
      var charLower;
      charLower = char.toLowerCase();
      if (charLower === char) {
        return char.toUpperCase();
      } else {
        return charLower;
      }
    };

    ToggleCase.prototype.getNewText = function(text) {
      return text.split('').map(this.toggleCase).join('');
    };

    return ToggleCase;

  })(TransformString);

  ToggleCaseAndMoveRight = (function(_super) {
    __extends(ToggleCaseAndMoveRight, _super);

    function ToggleCaseAndMoveRight() {
      return ToggleCaseAndMoveRight.__super__.constructor.apply(this, arguments);
    }

    ToggleCaseAndMoveRight.extend();

    ToggleCaseAndMoveRight.prototype.hover = null;

    ToggleCaseAndMoveRight.prototype.setPoint = false;

    ToggleCaseAndMoveRight.prototype.target = 'MoveRight';

    return ToggleCaseAndMoveRight;

  })(ToggleCase);

  UpperCase = (function(_super) {
    __extends(UpperCase, _super);

    function UpperCase() {
      return UpperCase.__super__.constructor.apply(this, arguments);
    }

    UpperCase.extend();

    UpperCase.prototype.displayName = 'Upper';

    UpperCase.prototype.hover = {
      icon: ':upper-case:',
      emoji: ':point_up:'
    };

    UpperCase.prototype.getNewText = function(text) {
      return text.toUpperCase();
    };

    return UpperCase;

  })(TransformString);

  LowerCase = (function(_super) {
    __extends(LowerCase, _super);

    function LowerCase() {
      return LowerCase.__super__.constructor.apply(this, arguments);
    }

    LowerCase.extend();

    LowerCase.prototype.displayName = 'Lower';

    LowerCase.prototype.hover = {
      icon: ':lower-case:',
      emoji: ':point_down:'
    };

    LowerCase.prototype.getNewText = function(text) {
      return text.toLowerCase();
    };

    return LowerCase;

  })(TransformString);

  CamelCase = (function(_super) {
    __extends(CamelCase, _super);

    function CamelCase() {
      return CamelCase.__super__.constructor.apply(this, arguments);
    }

    CamelCase.extend();

    CamelCase.prototype.displayName = 'Camelize';

    CamelCase.prototype.hover = {
      icon: ':camel-case:',
      emoji: ':camel:'
    };

    CamelCase.prototype.getNewText = function(text) {
      return _.camelize(text);
    };

    return CamelCase;

  })(TransformString);

  SnakeCase = (function(_super) {
    __extends(SnakeCase, _super);

    function SnakeCase() {
      return SnakeCase.__super__.constructor.apply(this, arguments);
    }

    SnakeCase.extend();

    SnakeCase.prototype.displayName = 'Underscore _';

    SnakeCase.prototype.hover = {
      icon: ':snake-case:',
      emoji: ':snake:'
    };

    SnakeCase.prototype.getNewText = function(text) {
      return _.underscore(text);
    };

    return SnakeCase;

  })(TransformString);

  DashCase = (function(_super) {
    __extends(DashCase, _super);

    function DashCase() {
      return DashCase.__super__.constructor.apply(this, arguments);
    }

    DashCase.extend();

    DashCase.prototype.displayName = 'Dasherize -';

    DashCase.prototype.hover = {
      icon: ':dash-case:',
      emoji: ':dash:'
    };

    DashCase.prototype.getNewText = function(text) {
      return _.dasherize(text);
    };

    return DashCase;

  })(TransformString);

  TitleCase = (function(_super) {
    __extends(TitleCase, _super);

    function TitleCase() {
      return TitleCase.__super__.constructor.apply(this, arguments);
    }

    TitleCase.extend();

    TitleCase.prototype.displayName = 'Titlize';

    TitleCase.prototype.getNewText = function(text) {
      return _.humanizeEventName(_.dasherize(text));
    };

    return TitleCase;

  })(TransformString);

  EncodeUriComponent = (function(_super) {
    __extends(EncodeUriComponent, _super);

    function EncodeUriComponent() {
      return EncodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    EncodeUriComponent.extend();

    EncodeUriComponent.prototype.displayName = 'Encode URI Component %';

    EncodeUriComponent.prototype.hover = {
      icon: 'encodeURI',
      emoji: 'encodeURI'
    };

    EncodeUriComponent.prototype.getNewText = function(text) {
      return encodeURIComponent(text);
    };

    return EncodeUriComponent;

  })(TransformString);

  DecodeUriComponent = (function(_super) {
    __extends(DecodeUriComponent, _super);

    function DecodeUriComponent() {
      return DecodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    DecodeUriComponent.extend();

    DecodeUriComponent.prototype.displayName = 'Decode URI Component %%';

    DecodeUriComponent.prototype.hover = {
      icon: 'decodeURI',
      emoji: 'decodeURI'
    };

    DecodeUriComponent.prototype.getNewText = function(text) {
      return decodeURIComponent(text);
    };

    return DecodeUriComponent;

  })(TransformString);

  TransformStringByExternalCommand = (function(_super) {
    __extends(TransformStringByExternalCommand, _super);

    function TransformStringByExternalCommand() {
      return TransformStringByExternalCommand.__super__.constructor.apply(this, arguments);
    }

    TransformStringByExternalCommand.extend(false);

    TransformStringByExternalCommand.prototype.autoIndent = true;

    TransformStringByExternalCommand.prototype.command = '';

    TransformStringByExternalCommand.prototype.args = [];

    TransformStringByExternalCommand.prototype.stdoutBySelection = null;

    TransformStringByExternalCommand.prototype.execute = function() {
      this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.collected = false;
        };
      })(this));
      if (!this.collected) {
        return this.collect();
      } else {
        return TransformStringByExternalCommand.__super__.execute.apply(this, arguments);
      }
    };

    TransformStringByExternalCommand.prototype.collect = function() {
      var args, command, finished, restorePoint, running, selection, _i, _len, _ref2, _ref3, _ref4, _results;
      if (this.collected) {
        return;
      }
      this.collected = true;
      this.suspendExecuteOperation();
      this.stdoutBySelection = new Map;
      restorePoint = null;
      if (!this.isMode('visual')) {
        restorePoint = preserveSelectionStartPoints(this.editor);
        this.target.select();
      }
      running = finished = 0;
      _ref2 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        running++;
        _ref4 = (_ref3 = this.getCommand(selection)) != null ? _ref3 : {}, command = _ref4.command, args = _ref4.args;
        if ((command != null) && (args != null)) {
          _results.push((function(_this) {
            return function(selection) {
              var exit, stdin, stdout;
              stdin = _this.getStdin(selection);
              stdout = function(output) {
                return _this.stdoutBySelection.set(selection, output);
              };
              exit = function(code) {
                finished++;
                if (running === finished) {
                  return _this.unsuspendExecuteOperation();
                }
              };
              _this.runExternalCommand({
                command: command,
                args: args,
                stdout: stdout,
                exit: exit,
                stdin: stdin
              });
              return typeof restorePoint === "function" ? restorePoint(selection) : void 0;
            };
          })(this)(selection));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    TransformStringByExternalCommand.prototype.runExternalCommand = function(options) {
      var bufferedProcess, stdin;
      stdin = options.stdin;
      delete options.stdin;
      bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError((function(_this) {
        return function(_arg) {
          var commandName, error, handle;
          error = _arg.error, handle = _arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            commandName = _this.constructor.getCommandName();
            console.log("" + commandName + ": Failed to spawn command " + error.path + ".");
          }
          _this.cancelOperation();
          return handle();
        };
      })(this));
      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        return bufferedProcess.process.stdin.end();
      }
    };

    TransformStringByExternalCommand.prototype.getNewText = function(text, selection) {
      var _ref2;
      return (_ref2 = this.getStdout(selection)) != null ? _ref2 : text;
    };

    TransformStringByExternalCommand.prototype.getCommand = function(selection) {
      return {
        command: this.command,
        args: this.args
      };
    };

    TransformStringByExternalCommand.prototype.getStdin = function(selection) {
      return selection.getText();
    };

    TransformStringByExternalCommand.prototype.getStdout = function(selection) {
      return this.stdoutBySelection.get(selection);
    };

    return TransformStringByExternalCommand;

  })(TransformString);

  TransformStringBySelectList = (function(_super) {
    __extends(TransformStringBySelectList, _super);

    function TransformStringBySelectList() {
      return TransformStringBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformStringBySelectList.extend();

    TransformStringBySelectList.prototype.requireInput = true;

    TransformStringBySelectList.prototype.requireTarget = true;

    TransformStringBySelectList.prototype.transformers = ['CamelCase', 'DashCase', 'SnakeCase', 'TitleCase', 'EncodeUriComponent', 'DecodeUriComponent', 'Reverse', 'Surround', 'MapSurround', 'IncrementNumber', 'DecrementNumber', 'JoinByInput', 'JoinWithKeepingSpace', 'SplitString', 'LowerCase', 'UpperCase', 'ToggleCase'];

    TransformStringBySelectList.prototype.getItems = function() {
      return this.transformers.map(function(klass) {
        var displayName;
        if (_.isString(klass)) {
          klass = Base.getClass(klass);
        }
        if (klass.prototype.hasOwnProperty('displayName')) {
          displayName = klass.prototype.displayName;
        }
        if (displayName == null) {
          displayName = _.humanizeEventName(_.dasherize(klass.name));
        }
        return {
          name: klass,
          displayName: displayName
        };
      });
    };

    TransformStringBySelectList.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          return _this.focusSelectList({
            items: _this.getItems()
          });
        };
      })(this));
      return this.vimState.onDidConfirmSelectList((function(_this) {
        return function(transformer) {
          _this.vimState.reset();
          return _this.vimState.operationStack.run(transformer.name, {
            target: _this.target.constructor.name
          });
        };
      })(this));
    };

    TransformStringBySelectList.prototype.execute = function() {};

    return TransformStringBySelectList;

  })(Operator);

  TransformWordBySelectList = (function(_super) {
    __extends(TransformWordBySelectList, _super);

    function TransformWordBySelectList() {
      return TransformWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformWordBySelectList.extend();

    TransformWordBySelectList.prototype.target = "InnerWord";

    return TransformWordBySelectList;

  })(TransformStringBySelectList);

  TransformSmartWordBySelectList = (function(_super) {
    __extends(TransformSmartWordBySelectList, _super);

    function TransformSmartWordBySelectList() {
      return TransformSmartWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformSmartWordBySelectList.extend();

    TransformSmartWordBySelectList.prototype.target = "InnerSmartWord";

    return TransformSmartWordBySelectList;

  })(TransformStringBySelectList);

  ReplaceWithRegister = (function(_super) {
    __extends(ReplaceWithRegister, _super);

    function ReplaceWithRegister() {
      return ReplaceWithRegister.__super__.constructor.apply(this, arguments);
    }

    ReplaceWithRegister.extend();

    ReplaceWithRegister.prototype.hover = {
      icon: ':replace-with-register:',
      emoji: ':pencil:'
    };

    ReplaceWithRegister.prototype.getNewText = function(text) {
      return this.vimState.register.getText();
    };

    return ReplaceWithRegister;

  })(TransformString);

  Indent = (function(_super) {
    __extends(Indent, _super);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.extend();

    Indent.prototype.hover = {
      icon: ':indent:',
      emoji: ':point_right:'
    };

    Indent.prototype.stayOnLinewise = false;

    Indent.prototype.mutate = function(selection) {
      this.indent(selection);
      this.restorePoint(selection);
      if (!this.needStay()) {
        return selection.cursor.moveToFirstCharacterOfLine();
      }
    };

    Indent.prototype.indent = function(selection) {
      return selection.indentSelectedRows();
    };

    return Indent;

  })(TransformString);

  Outdent = (function(_super) {
    __extends(Outdent, _super);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.extend();

    Outdent.prototype.hover = {
      icon: ':outdent:',
      emoji: ':point_left:'
    };

    Outdent.prototype.indent = function(selection) {
      return selection.outdentSelectedRows();
    };

    return Outdent;

  })(Indent);

  AutoIndent = (function(_super) {
    __extends(AutoIndent, _super);

    function AutoIndent() {
      return AutoIndent.__super__.constructor.apply(this, arguments);
    }

    AutoIndent.extend();

    AutoIndent.prototype.hover = {
      icon: ':auto-indent:',
      emoji: ':open_hands:'
    };

    AutoIndent.prototype.indent = function(selection) {
      return selection.autoIndentSelectedRows();
    };

    return AutoIndent;

  })(Indent);

  ToggleLineComments = (function(_super) {
    __extends(ToggleLineComments, _super);

    function ToggleLineComments() {
      return ToggleLineComments.__super__.constructor.apply(this, arguments);
    }

    ToggleLineComments.extend();

    ToggleLineComments.prototype.hover = {
      icon: ':toggle-line-comments:',
      emoji: ':mute:'
    };

    ToggleLineComments.prototype.mutate = function(selection) {
      selection.toggleLineComments();
      return this.restorePoint(selection);
    };

    return ToggleLineComments;

  })(TransformString);

  Surround = (function(_super) {
    __extends(Surround, _super);

    function Surround() {
      return Surround.__super__.constructor.apply(this, arguments);
    }

    Surround.extend();

    Surround.prototype.displayName = "Surround ()";

    Surround.prototype.pairs = [['[', ']'], ['(', ')'], ['{', '}'], ['<', '>']];

    Surround.prototype.input = null;

    Surround.prototype.charsMax = 1;

    Surround.prototype.hover = {
      icon: ':surround:',
      emoji: ':two_women_holding_hands:'
    };

    Surround.prototype.requireInput = true;

    Surround.prototype.autoIndent = true;

    Surround.prototype.initialize = function() {
      if (!this.requireInput) {
        return;
      }
      this.onDidConfirmInput((function(_this) {
        return function(input) {
          return _this.onConfirm(input);
        };
      })(this));
      this.onDidChangeInput((function(_this) {
        return function(input) {
          return _this.addHover(input);
        };
      })(this));
      this.onDidCancelInput((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (this.requireTarget) {
        return this.onDidSetTarget((function(_this) {
          return function() {
            return _this.vimState.input.focus({
              charsMax: _this.charsMax
            });
          };
        })(this));
      } else {
        return this.vimState.input.focus({
          charsMax: this.charsMax
        });
      }
    };

    Surround.prototype.onConfirm = function(input) {
      this.input = input;
      return this.processOperation();
    };

    Surround.prototype.getPair = function(input) {
      var pair;
      pair = _.detect(this.pairs, function(pair) {
        return __indexOf.call(pair, input) >= 0;
      });
      return pair != null ? pair : pair = [input, input];
    };

    Surround.prototype.surround = function(text, pair) {
      var close, open;
      open = pair[0], close = pair[1];
      if (LineEndingRegExp.test(text)) {
        open += "\n";
        close += "\n";
      }
      return open + text + close;
    };

    Surround.prototype.getNewText = function(text) {
      return this.surround(text, this.getPair(this.input));
    };

    return Surround;

  })(TransformString);

  SurroundWord = (function(_super) {
    __extends(SurroundWord, _super);

    function SurroundWord() {
      return SurroundWord.__super__.constructor.apply(this, arguments);
    }

    SurroundWord.extend();

    SurroundWord.prototype.target = 'InnerWord';

    return SurroundWord;

  })(Surround);

  SurroundSmartWord = (function(_super) {
    __extends(SurroundSmartWord, _super);

    function SurroundSmartWord() {
      return SurroundSmartWord.__super__.constructor.apply(this, arguments);
    }

    SurroundSmartWord.extend();

    SurroundSmartWord.prototype.target = 'InnerSmartWord';

    return SurroundSmartWord;

  })(Surround);

  MapSurround = (function(_super) {
    __extends(MapSurround, _super);

    function MapSurround() {
      return MapSurround.__super__.constructor.apply(this, arguments);
    }

    MapSurround.extend();

    MapSurround.prototype.mapRegExp = /\w+/g;

    MapSurround.prototype.execute = function() {
      this.eachSelection((function(_this) {
        return function(selection) {
          var scanRange;
          scanRange = selection.getBufferRange();
          _this.editor.scanInBufferRange(_this.mapRegExp, scanRange, function(_arg) {
            var matchText, replace;
            matchText = _arg.matchText, replace = _arg.replace;
            return replace(_this.getNewText(matchText));
          });
          if (_this.setPoint) {
            return _this.restorePoint(selection);
          }
        };
      })(this));
      return this.activateMode('normal');
    };

    return MapSurround;

  })(Surround);

  DeleteSurround = (function(_super) {
    __extends(DeleteSurround, _super);

    function DeleteSurround() {
      return DeleteSurround.__super__.constructor.apply(this, arguments);
    }

    DeleteSurround.extend();

    DeleteSurround.prototype.pairChars = ['[]', '()', '{}'].join('');

    DeleteSurround.prototype.requireTarget = false;

    DeleteSurround.prototype.onConfirm = function(input) {
      var target, _ref2;
      this.input = input;
      target = this["new"]('Pair', {
        pair: this.getPair(this.input),
        inclusive: true,
        allowNextLine: (_ref2 = this.input, __indexOf.call(this.pairChars, _ref2) >= 0)
      });
      this.setTarget(target);
      return this.processOperation();
    };

    DeleteSurround.prototype.getNewText = function(text) {
      return text.slice(1, -1);
    };

    return DeleteSurround;

  })(Surround);

  DeleteSurroundAnyPair = (function(_super) {
    __extends(DeleteSurroundAnyPair, _super);

    function DeleteSurroundAnyPair() {
      return DeleteSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPair.extend();

    DeleteSurroundAnyPair.prototype.requireInput = false;

    DeleteSurroundAnyPair.prototype.target = 'AAnyPair';

    return DeleteSurroundAnyPair;

  })(DeleteSurround);

  ChangeSurround = (function(_super) {
    __extends(ChangeSurround, _super);

    function ChangeSurround() {
      return ChangeSurround.__super__.constructor.apply(this, arguments);
    }

    ChangeSurround.extend();

    ChangeSurround.prototype.charsMax = 2;

    ChangeSurround.prototype.char = null;

    ChangeSurround.prototype.onConfirm = function(input) {
      var from, _ref2;
      if (!input) {
        return;
      }
      _ref2 = input.split(''), from = _ref2[0], this.char = _ref2[1];
      return ChangeSurround.__super__.onConfirm.call(this, from);
    };

    ChangeSurround.prototype.getNewText = function(text) {
      return this.surround(ChangeSurround.__super__.getNewText.call(this, text), this.getPair(this.char));
    };

    return ChangeSurround;

  })(DeleteSurround);

  ChangeSurroundAnyPair = (function(_super) {
    __extends(ChangeSurroundAnyPair, _super);

    function ChangeSurroundAnyPair() {
      return ChangeSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPair.extend();

    ChangeSurroundAnyPair.prototype.charsMax = 1;

    ChangeSurroundAnyPair.prototype.target = "AAnyPair";

    ChangeSurroundAnyPair.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          _this.restore = preserveSelectionStartPoints(_this.editor);
          _this.target.select();
          if (!haveSomeSelection(_this.editor)) {
            _this.vimState.reset();
            _this.abort();
          }
          return _this.addHover(_this.editor.getSelectedText()[0]);
        };
      })(this));
      return ChangeSurroundAnyPair.__super__.initialize.apply(this, arguments);
    };

    ChangeSurroundAnyPair.prototype.onConfirm = function(char) {
      var selection, _i, _len, _ref2;
      this.char = char;
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        this.restore(selection);
      }
      this.input = this.char;
      return this.processOperation();
    };

    return ChangeSurroundAnyPair;

  })(ChangeSurround);

  MoveLineUp = (function(_super) {
    __extends(MoveLineUp, _super);

    function MoveLineUp() {
      return MoveLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveLineUp.extend();

    MoveLineUp.prototype.direction = 'up';

    MoveLineUp.prototype.execute = function() {
      return this.eachSelection((function(_this) {
        return function(selection) {
          return _this.mutate(selection);
        };
      })(this));
    };

    MoveLineUp.prototype.isMovable = function(selection) {
      return selection.getBufferRange().start.row !== 0;
    };

    MoveLineUp.prototype.getRangeTranslationSpec = function() {
      return [[-1, 0], [0, 0]];
    };

    MoveLineUp.prototype.mutate = function(selection) {
      var range, reversed, rows, translation;
      if (!this.isMovable(selection)) {
        return;
      }
      reversed = selection.isReversed();
      translation = this.getRangeTranslationSpec();
      swrap(selection).translate(translation, {
        preserveFolds: true
      });
      rows = swrap(selection).lineTextForBufferRows();
      this.rotateRows(rows);
      range = selection.insertText(rows.join("\n") + "\n");
      range = range.translate.apply(range, translation.reverse());
      swrap(selection).setBufferRange(range, {
        preserveFolds: true,
        reversed: reversed
      });
      return this.editor.scrollToCursorPosition({
        center: true
      });
    };

    MoveLineUp.prototype.rotateRows = function(rows) {
      return rows.push(rows.shift());
    };

    return MoveLineUp;

  })(TransformString);

  MoveLineDown = (function(_super) {
    __extends(MoveLineDown, _super);

    function MoveLineDown() {
      return MoveLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveLineDown.extend();

    MoveLineDown.prototype.direction = 'down';

    MoveLineDown.prototype.isMovable = function(selection) {
      var endRow;
      endRow = selection.getBufferRange().end.row;
      return endRow < this.editor.getBuffer().getLastRow();
    };

    MoveLineDown.prototype.rotateRows = function(rows) {
      return rows.unshift(rows.pop());
    };

    MoveLineDown.prototype.getRangeTranslationSpec = function() {
      return [[0, 0], [1, 0]];
    };

    return MoveLineDown;

  })(MoveLineUp);

  Yank = (function(_super) {
    __extends(Yank, _super);

    function Yank() {
      return Yank.__super__.constructor.apply(this, arguments);
    }

    Yank.extend();

    Yank.prototype.hover = {
      icon: ':yank:',
      emoji: ':clipboard:'
    };

    Yank.prototype.trackChange = true;

    Yank.prototype.stayOnLinewise = true;

    Yank.prototype.execute = function() {
      this.eachSelection((function(_this) {
        return function(selection) {
          _this.setTextToRegisterForSelection(selection);
          return _this.restorePoint(selection);
        };
      })(this));
      return this.activateMode('normal');
    };

    return Yank;

  })(Operator);

  YankLine = (function(_super) {
    __extends(YankLine, _super);

    function YankLine() {
      return YankLine.__super__.constructor.apply(this, arguments);
    }

    YankLine.extend();

    YankLine.prototype.target = 'MoveToRelativeLine';

    return YankLine;

  })(Yank);

  Join = (function(_super) {
    __extends(Join, _super);

    function Join() {
      return Join.__super__.constructor.apply(this, arguments);
    }

    Join.extend();

    Join.prototype.requireTarget = false;

    Join.prototype.execute = function() {
      this.editor.transact((function(_this) {
        return function() {
          return _.times(_this.getCount(), function() {
            return _this.editor.joinLines();
          });
        };
      })(this));
      return this.activateMode('normal');
    };

    return Join;

  })(Operator);

  JoinWithKeepingSpace = (function(_super) {
    __extends(JoinWithKeepingSpace, _super);

    function JoinWithKeepingSpace() {
      return JoinWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinWithKeepingSpace.extend();

    JoinWithKeepingSpace.prototype.input = '';

    JoinWithKeepingSpace.prototype.requireTarget = false;

    JoinWithKeepingSpace.prototype.trim = false;

    JoinWithKeepingSpace.prototype.initialize = function() {
      return this.setTarget(this["new"]("MoveToRelativeLineWithMinimum", {
        min: 1
      }));
    };

    JoinWithKeepingSpace.prototype.mutate = function(selection) {
      var endRow, row, rows, startRow, text, _ref2;
      _ref2 = selection.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      swrap(selection).expandOverLine();
      rows = (function() {
        var _i, _results;
        _results = [];
        for (row = _i = startRow; startRow <= endRow ? _i <= endRow : _i >= endRow; row = startRow <= endRow ? ++_i : --_i) {
          text = this.editor.lineTextForBufferRow(row);
          if (this.trim && row !== startRow) {
            _results.push(text.trimLeft());
          } else {
            _results.push(text);
          }
        }
        return _results;
      }).call(this);
      return selection.insertText(this.join(rows) + "\n");
    };

    JoinWithKeepingSpace.prototype.join = function(rows) {
      return rows.join(this.input);
    };

    return JoinWithKeepingSpace;

  })(TransformString);

  JoinByInput = (function(_super) {
    __extends(JoinByInput, _super);

    function JoinByInput() {
      return JoinByInput.__super__.constructor.apply(this, arguments);
    }

    JoinByInput.extend();

    JoinByInput.prototype.hover = {
      icon: ':join:',
      emoji: ':couple:'
    };

    JoinByInput.prototype.requireInput = true;

    JoinByInput.prototype.input = null;

    JoinByInput.prototype.trim = true;

    JoinByInput.prototype.initialize = function() {
      JoinByInput.__super__.initialize.apply(this, arguments);
      return this.focusInput({
        charsMax: 10
      });
    };

    JoinByInput.prototype.join = function(rows) {
      return rows.join(" " + this.input + " ");
    };

    return JoinByInput;

  })(JoinWithKeepingSpace);

  JoinByInputWithKeepingSpace = (function(_super) {
    __extends(JoinByInputWithKeepingSpace, _super);

    function JoinByInputWithKeepingSpace() {
      return JoinByInputWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinByInputWithKeepingSpace.extend();

    JoinByInputWithKeepingSpace.prototype.trim = false;

    JoinByInputWithKeepingSpace.prototype.join = function(rows) {
      return rows.join(this.input);
    };

    return JoinByInputWithKeepingSpace;

  })(JoinByInput);

  SplitString = (function(_super) {
    __extends(SplitString, _super);

    function SplitString() {
      return SplitString.__super__.constructor.apply(this, arguments);
    }

    SplitString.extend();

    SplitString.prototype.hover = {
      icon: ':split-string:',
      emoji: ':hocho:'
    };

    SplitString.prototype.requireInput = true;

    SplitString.prototype.input = null;

    SplitString.prototype.initialize = function() {
      if (!this.isMode('visual')) {
        this.setTarget(this["new"]("MoveToRelativeLine", {
          min: 1
        }));
      }
      return this.focusInput({
        charsMax: 10
      });
    };

    SplitString.prototype.getNewText = function(text) {
      var regex;
      if (this.input === '') {
        this.input = "\\n";
      }
      regex = RegExp("" + (_.escapeRegExp(this.input)), "g");
      return text.split(regex).join("\n");
    };

    return SplitString;

  })(TransformString);

  Reverse = (function(_super) {
    __extends(Reverse, _super);

    function Reverse() {
      return Reverse.__super__.constructor.apply(this, arguments);
    }

    Reverse.extend();

    Reverse.prototype.mutate = function(selection) {
      var newText, textForRows;
      swrap(selection).expandOverLine();
      textForRows = swrap(selection).lineTextForBufferRows();
      newText = textForRows.reverse().join("\n") + "\n";
      selection.insertText(newText);
      return this.restorePoint(selection);
    };

    return Reverse;

  })(TransformString);

  Repeat = (function(_super) {
    __extends(Repeat, _super);

    function Repeat() {
      return Repeat.__super__.constructor.apply(this, arguments);
    }

    Repeat.extend();

    Repeat.prototype.requireTarget = false;

    Repeat.prototype.recordable = false;

    Repeat.prototype.execute = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _.times(_this.getCount(), function() {
            var operation;
            if (operation = _this.vimState.operationStack.getRecorded()) {
              operation.setRepeated();
              return operation.execute();
            }
          });
        };
      })(this));
    };

    return Repeat;

  })(Operator);

  Mark = (function(_super) {
    __extends(Mark, _super);

    function Mark() {
      return Mark.__super__.constructor.apply(this, arguments);
    }

    Mark.extend();

    Mark.prototype.hover = {
      icon: ':mark:',
      emoji: ':round_pushpin:'
    };

    Mark.prototype.requireInput = true;

    Mark.prototype.requireTarget = false;

    Mark.prototype.initialize = function() {
      return this.focusInput();
    };

    Mark.prototype.execute = function() {
      this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
      return this.activateMode('normal');
    };

    return Mark;

  })(Operator);

  Increase = (function(_super) {
    __extends(Increase, _super);

    function Increase() {
      return Increase.__super__.constructor.apply(this, arguments);
    }

    Increase.extend();

    Increase.prototype.requireTarget = false;

    Increase.prototype.step = 1;

    Increase.prototype.execute = function() {
      var newRanges, pattern;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = [];
      this.editor.transact((function(_this) {
        return function() {
          var cursor, ranges, scanRange, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            cursor = _ref2[_i];
            scanRange = _this.isMode('visual') ? cursor.selection.getBufferRange() : cursor.getCurrentLineBufferRange();
            ranges = _this.increaseNumber(cursor, scanRange, pattern);
            if (!_this.isMode('visual') && ranges.length) {
              cursor.setBufferPosition(ranges[0].end.translate([0, -1]));
            }
            _results.push(newRanges.push(ranges));
          }
          return _results;
        };
      })(this));
      if ((newRanges = _.flatten(newRanges)).length) {
        return this.flash(newRanges);
      } else {
        return atom.beep();
      }
    };

    Increase.prototype.increaseNumber = function(cursor, scanRange, pattern) {
      var newRanges;
      newRanges = [];
      this.editor.scanInBufferRange(pattern, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, newText, range, replace, stop;
          matchText = _arg.matchText, range = _arg.range, stop = _arg.stop, replace = _arg.replace;
          newText = String(parseInt(matchText, 10) + _this.step * _this.getCount());
          if (_this.isMode('visual')) {
            return newRanges.push(replace(newText));
          } else {
            if (!range.end.isGreaterThan(cursor.getBufferPosition())) {
              return;
            }
            newRanges.push(replace(newText));
            return stop();
          }
        };
      })(this));
      return newRanges;
    };

    return Increase;

  })(Operator);

  Decrease = (function(_super) {
    __extends(Decrease, _super);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.extend();

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  IncrementNumber = (function(_super) {
    __extends(IncrementNumber, _super);

    function IncrementNumber() {
      return IncrementNumber.__super__.constructor.apply(this, arguments);
    }

    IncrementNumber.extend();

    IncrementNumber.prototype.displayName = 'Increment ++';

    IncrementNumber.prototype.step = 1;

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.execute = function() {
      var newRanges, pattern, selection, _i, _len, _ref2;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = null;
      this.selectTarget();
      this.editor.transact((function(_this) {
        return function() {
          var selection;
          return newRanges = (function() {
            var _i, _len, _ref2, _results;
            _ref2 = this.editor.getSelectionsOrderedByBufferPosition();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _results.push(this.replaceNumber(selection.getBufferRange(), pattern));
            }
            return _results;
          }).call(_this);
        };
      })(this));
      if ((newRanges = _.flatten(newRanges)).length) {
        this.flash(newRanges);
      } else {
        atom.beep();
      }
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        selection.cursor.setBufferPosition(selection.getBufferRange().start);
      }
      return this.activateMode('normal');
    };

    IncrementNumber.prototype.replaceNumber = function(scanRange, pattern) {
      var newRanges;
      newRanges = [];
      this.editor.scanInBufferRange(pattern, scanRange, (function(_this) {
        return function(_arg) {
          var matchText, replace;
          matchText = _arg.matchText, replace = _arg.replace;
          return newRanges.push(replace(_this.getNewText(matchText)));
        };
      })(this));
      return newRanges;
    };

    IncrementNumber.prototype.getNewText = function(text) {
      this.baseNumber = this.baseNumber != null ? this.baseNumber + this.step * this.getCount() : parseInt(text, 10);
      return String(this.baseNumber);
    };

    return IncrementNumber;

  })(Operator);

  DecrementNumber = (function(_super) {
    __extends(DecrementNumber, _super);

    function DecrementNumber() {
      return DecrementNumber.__super__.constructor.apply(this, arguments);
    }

    DecrementNumber.extend();

    DecrementNumber.prototype.displayName = 'Decrement --';

    DecrementNumber.prototype.step = -1;

    return DecrementNumber;

  })(IncrementNumber);

  PutBefore = (function(_super) {
    __extends(PutBefore, _super);

    function PutBefore() {
      return PutBefore.__super__.constructor.apply(this, arguments);
    }

    PutBefore.extend();

    PutBefore.prototype.requireTarget = false;

    PutBefore.prototype.location = 'before';

    PutBefore.prototype.execute = function() {
      this.editor.transact((function(_this) {
        return function() {
          var cursor, isLinewise, newRange, selection, text, type, _i, _len, _ref2, _ref3, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            cursor = selection.cursor;
            _ref3 = _this.vimState.register.get(null, selection), text = _ref3.text, type = _ref3.type;
            if (!text) {
              break;
            }
            text = _.multiplyString(text, _this.getCount());
            isLinewise = type === 'linewise' || _this.isMode('visual', 'linewise');
            if (isLinewise) {
              newRange = _this.pasteLinewise(selection, text);
              cursor.setBufferPosition(newRange.start);
              cursor.moveToFirstCharacterOfLine();
            } else {
              newRange = _this.pasteCharacterwise(selection, text);
              cursor.setBufferPosition(newRange.end.translate([0, -1]));
            }
            _this.setMarkForChange(newRange);
            _results.push(_this.flash(newRange));
          }
          return _results;
        };
      })(this));
      return this.activateMode('normal');
    };

    PutBefore.prototype.pasteLinewise = function(selection, text) {
      var cursor;
      cursor = selection.cursor;
      if (selection.isEmpty()) {
        text = text.replace(LineEndingRegExp, '');
        if (this.location === 'before') {
          return this.insertTextAbove(selection, text);
        } else {
          return this.insertTextBelow(selection, text);
        }
      } else {
        if (this.isMode('visual', 'linewise')) {
          if (!text.endsWith("\n")) {
            text += "\n";
          }
        } else {
          selection.insertText("\n");
        }
        return selection.insertText(text);
      }
    };

    PutBefore.prototype.pasteCharacterwise = function(selection, text) {
      if (this.location === 'after' && selection.isEmpty()) {
        selection.cursor.moveRight();
      }
      return selection.insertText(text);
    };

    PutBefore.prototype.insertTextAbove = function(selection, text) {
      selection.cursor.moveToBeginningOfLine();
      selection.insertText("\n");
      selection.cursor.moveUp();
      return selection.insertText(text);
    };

    PutBefore.prototype.insertTextBelow = function(selection, text) {
      selection.cursor.moveToEndOfLine();
      selection.insertText("\n");
      return selection.insertText(text);
    };

    return PutBefore;

  })(Operator);

  PutAfter = (function(_super) {
    __extends(PutAfter, _super);

    function PutAfter() {
      return PutAfter.__super__.constructor.apply(this, arguments);
    }

    PutAfter.extend();

    PutAfter.prototype.location = 'after';

    return PutAfter;

  })(PutBefore);

  Replace = (function(_super) {
    __extends(Replace, _super);

    function Replace() {
      return Replace.__super__.constructor.apply(this, arguments);
    }

    Replace.extend();

    Replace.prototype.input = null;

    Replace.prototype.hover = {
      icon: ':replace:',
      emoji: ':tractor:'
    };

    Replace.prototype.flashTarget = false;

    Replace.prototype.trackChange = true;

    Replace.prototype.requireInput = true;

    Replace.prototype.requireTarget = false;

    Replace.prototype.initialize = function() {
      if (this.isMode('normal')) {
        this.setTarget(this["new"]('MoveRight'));
      }
      return this.focusInput();
    };

    Replace.prototype.execute = function() {
      var selection, top, _i, _len, _ref2;
      if (this.input === '') {
        this.input = "\n";
      }
      this.eachSelection((function(_this) {
        return function(selection) {
          var text;
          text = selection.getText().replace(/./g, _this.input);
          if (!(_this.target["instanceof"]('MoveRight') && (text.length < _this.getCount()))) {
            selection.insertText(text, {
              autoIndentNewline: true
            });
          }
          if (_this.input !== "\n") {
            return _this.restorePoint(selection);
          }
        };
      })(this));
      if (this.isMode('visual', 'blockwise')) {
        top = this.editor.getSelectionsOrderedByBufferPosition()[0];
        _ref2 = this.editor.getSelections();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          selection = _ref2[_i];
          if (selection !== top) {
            selection.destroy();
          }
        }
      }
      return this.activateMode('normal');
    };

    return Replace;

  })(Operator);

  ActivateInsertMode = (function(_super) {
    __extends(ActivateInsertMode, _super);

    function ActivateInsertMode() {
      return ActivateInsertMode.__super__.constructor.apply(this, arguments);
    }

    ActivateInsertMode.extend();

    ActivateInsertMode.prototype.requireTarget = false;

    ActivateInsertMode.prototype.flashTarget = false;

    ActivateInsertMode.prototype.checkpoint = null;

    ActivateInsertMode.prototype.submode = null;

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(_arg) {
          var mode, range, textByUserInput;
          mode = _arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          if ((range = getNewTextRangeFromCheckpoint(_this.editor, _this.getCheckpoint('insert'))) != null) {
            _this.setMarkForChange(range);
            textByUserInput = _this.editor.getTextInBufferRange(range);
          } else {
            textByUserInput = '';
          }
          _this.saveInsertedText(textByUserInput);
          _this.vimState.register.set('.', {
            text: textByUserInput
          });
          _.times(_this.getInsertionCount(), function() {
            var selection, text, _i, _len, _ref2, _results;
            text = _this.textByOperator + textByUserInput;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _results.push(selection.insertText(text, {
                autoIndent: true
              }));
            }
            return _results;
          });
          return _this.editor.groupChangesSinceCheckpoint(_this.getCheckpoint('undo'));
        };
      })(this));
    };

    ActivateInsertMode.prototype.initialize = function() {
      this.checkpoint = {};
      if (!this.isRepeated()) {
        this.setCheckpoint('undo');
      }
      return this.observeWillDeactivateMode();
    };

    ActivateInsertMode.prototype.setCheckpoint = function(purpose) {
      return this.checkpoint[purpose] = this.editor.createCheckpoint();
    };

    ActivateInsertMode.prototype.getCheckpoint = function(purpose) {
      return this.checkpoint[purpose];
    };

    ActivateInsertMode.prototype.saveInsertedText = function(insertedText) {
      this.insertedText = insertedText;
      return this.insertedText;
    };

    ActivateInsertMode.prototype.getInsertedText = function() {
      var _ref2;
      return (_ref2 = this.insertedText) != null ? _ref2 : '';
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.getInsertionCount = function() {
      if (this.insertionCount == null) {
        this.insertionCount = this.supportInsertionCount ? this.getCount() - 1 : 0;
      }
      return this.insertionCount;
    };

    ActivateInsertMode.prototype.execute = function() {
      var range, text;
      if (this.isRepeated()) {
        if (!(text = this.getInsertedText())) {
          return;
        }
        if (!this["instanceof"]('Change')) {
          this.flashTarget = this.trackChange = true;
          this.observeSelectAction();
          this.emitDidSelectTarget();
        }
        return this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref2, _results;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              selection = _ref2[_i];
              _this.repeatInsert(selection, text);
              _results.push(moveCursorLeft(selection.cursor));
            }
            return _results;
          };
        })(this));
      } else {
        if (this.getInsertionCount() > 0) {
          range = getNewTextRangeFromCheckpoint(this.editor, this.getCheckpoint('undo'));
          this.textByOperator = range != null ? this.editor.getTextInBufferRange(range) : '';
        }
        this.setCheckpoint('insert');
        return this.vimState.activate('insert', this.submode);
      }
    };

    return ActivateInsertMode;

  })(Operator);

  InsertAtLastInsert = (function(_super) {
    __extends(InsertAtLastInsert, _super);

    function InsertAtLastInsert() {
      return InsertAtLastInsert.__super__.constructor.apply(this, arguments);
    }

    InsertAtLastInsert.extend();

    InsertAtLastInsert.prototype.execute = function() {
      var point;
      if ((point = this.vimState.mark.get('^'))) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({
          center: true
        });
      }
      return InsertAtLastInsert.__super__.execute.apply(this, arguments);
    };

    return InsertAtLastInsert;

  })(ActivateInsertMode);

  ActivateReplaceMode = (function(_super) {
    __extends(ActivateReplaceMode, _super);

    function ActivateReplaceMode() {
      return ActivateReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ActivateReplaceMode.extend();

    ActivateReplaceMode.prototype.submode = 'replace';

    ActivateReplaceMode.prototype.repeatInsert = function(selection, text) {
      var char, _i, _len;
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        char = text[_i];
        if (!(char !== "\n")) {
          continue;
        }
        if (selection.cursor.isAtEndOfLine()) {
          break;
        }
        selection.selectRight();
      }
      return selection.insertText(text, {
        autoIndent: false
      });
    };

    return ActivateReplaceMode;

  })(ActivateInsertMode);

  InsertAfter = (function(_super) {
    __extends(InsertAfter, _super);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.extend();

    InsertAfter.prototype.execute = function() {
      var cursor, _i, _len, _ref2;
      _ref2 = this.editor.getCursors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cursor = _ref2[_i];
        moveCursorRight(cursor);
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(ActivateInsertMode);

  InsertAfterEndOfLine = (function(_super) {
    __extends(InsertAfterEndOfLine, _super);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.extend();

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(ActivateInsertMode);

  InsertAtBeginningOfLine = (function(_super) {
    __extends(InsertAtBeginningOfLine, _super);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.extend();

    InsertAtBeginningOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(ActivateInsertMode);

  InsertByMotion = (function(_super) {
    __extends(InsertByMotion, _super);

    function InsertByMotion() {
      return InsertByMotion.__super__.constructor.apply(this, arguments);
    }

    InsertByMotion.extend();

    InsertByMotion.prototype.requireTarget = true;

    InsertByMotion.prototype.execute = function() {
      var cursor, _i, _len, _ref2;
      if (this.target["instanceof"]('Motion')) {
        this.target.execute();
      }
      if (this["instanceof"]('InsertAfterByMotion')) {
        _ref2 = this.editor.getCursors();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cursor = _ref2[_i];
          moveCursorRight(cursor);
        }
      }
      return InsertByMotion.__super__.execute.apply(this, arguments);
    };

    return InsertByMotion;

  })(ActivateInsertMode);

  InsertAfterByMotion = (function(_super) {
    __extends(InsertAfterByMotion, _super);

    function InsertAfterByMotion() {
      return InsertAfterByMotion.__super__.constructor.apply(this, arguments);
    }

    InsertAfterByMotion.extend();

    return InsertAfterByMotion;

  })(InsertByMotion);

  InsertAtPreviousFoldStart = (function(_super) {
    __extends(InsertAtPreviousFoldStart, _super);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.prototype.target = 'MoveToPreviousFoldStart';

    return InsertAtPreviousFoldStart;

  })(InsertByMotion);

  InsertAtNextFoldStart = (function(_super) {
    __extends(InsertAtNextFoldStart, _super);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.prototype.target = 'MoveToNextFoldStart';

    return InsertAtNextFoldStart;

  })(InsertAtPreviousFoldStart);

  InsertAboveWithNewline = (function(_super) {
    __extends(InsertAboveWithNewline, _super);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.extend();

    InsertAboveWithNewline.prototype.execute = function() {
      this.insertNewline();
      return InsertAboveWithNewline.__super__.execute.apply(this, arguments);
    };

    InsertAboveWithNewline.prototype.insertNewline = function() {
      return this.editor.insertNewlineAbove();
    };

    InsertAboveWithNewline.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text.trimLeft(), {
        autoIndent: true
      });
    };

    return InsertAboveWithNewline;

  })(ActivateInsertMode);

  InsertBelowWithNewline = (function(_super) {
    __extends(InsertBelowWithNewline, _super);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.extend();

    InsertBelowWithNewline.prototype.insertNewline = function() {
      return this.editor.insertNewlineBelow();
    };

    return InsertBelowWithNewline;

  })(InsertAboveWithNewline);

  Change = (function(_super) {
    __extends(Change, _super);

    function Change() {
      return Change.__super__.constructor.apply(this, arguments);
    }

    Change.extend();

    Change.prototype.requireTarget = true;

    Change.prototype.trackChange = true;

    Change.prototype.supportInsertionCount = false;

    Change.prototype.execute = function() {
      var text, _base;
      if (!this.selectTarget()) {
        this.activateMode('normal');
        return;
      }
      text = '';
      if (this.target["instanceof"]('TextObject')) {
        if (swrap.detectVisualModeSubmode(this.editor) === 'linewise') {
          text = "\n";
        }
      } else {
        if (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) {
          text = "\n";
        }
      }
      this.editor.transact((function(_this) {
        return function() {
          var range, selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            _this.setTextToRegisterForSelection(selection);
            range = selection.insertText(text, {
              autoIndent: true
            });
            if (!range.isEmpty()) {
              _results.push(selection.cursor.moveLeft());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this));
      return Change.__super__.execute.apply(this, arguments);
    };

    return Change;

  })(ActivateInsertMode);

  Substitute = (function(_super) {
    __extends(Substitute, _super);

    function Substitute() {
      return Substitute.__super__.constructor.apply(this, arguments);
    }

    Substitute.extend();

    Substitute.prototype.target = 'MoveRight';

    return Substitute;

  })(Change);

  SubstituteLine = (function(_super) {
    __extends(SubstituteLine, _super);

    function SubstituteLine() {
      return SubstituteLine.__super__.constructor.apply(this, arguments);
    }

    SubstituteLine.extend();

    SubstituteLine.prototype.target = 'MoveToRelativeLine';

    return SubstituteLine;

  })(Change);

  ChangeToLastCharacterOfLine = (function(_super) {
    __extends(ChangeToLastCharacterOfLine, _super);

    function ChangeToLastCharacterOfLine() {
      return ChangeToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    ChangeToLastCharacterOfLine.extend();

    ChangeToLastCharacterOfLine.prototype.target = 'MoveToLastCharacterOfLine';

    return ChangeToLastCharacterOfLine;

  })(Change);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUVBO0FBQUEsTUFBQSxrNENBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixjQUFuQixDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxPQUF1RCxPQUFBLENBQVEsTUFBUixDQUF2RCxFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLDJCQUFBLG1CQUFmLEVBQW9DLHVCQUFBLGVBSHBDLENBQUE7O0FBQUEsRUFLQSxRQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSwwQkFBQSxpQkFERixFQUNxQixnQ0FBQSx1QkFEckIsRUFFRSx1QkFBQSxjQUZGLEVBRWtCLHdCQUFBLGVBRmxCLEVBR0Usb0JBQUEsV0FIRixFQUdlLHNDQUFBLDZCQUhmLEVBSUUscUNBQUEsNEJBVEYsQ0FBQTs7QUFBQSxFQVdBLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVIsQ0FYUixDQUFBOztBQUFBLEVBWUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBWlgsQ0FBQTs7QUFBQSxFQWFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQWJQLENBQUE7O0FBQUEsRUFnQk07QUFDSixvQ0FBQSxDQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFDYSxJQUFBLHVCQUFFLE9BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLGdCQUFSLENBRFc7SUFBQSxDQURiOzt5QkFBQTs7S0FEMEIsS0Fo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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/operator.coffee
