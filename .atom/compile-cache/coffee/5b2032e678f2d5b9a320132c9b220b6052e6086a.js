(function() {
  var ActivateInsertMode, ActivateReplaceMode, AutoIndent, Base, CamelCase, Change, ChangeSurround, ChangeSurroundAnyPair, ChangeToLastCharacterOfLine, CompositeDisposable, DashCase, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteRight, DeleteSurround, DeleteSurroundAnyPair, DeleteToLastCharacterOfLine, Increase, IncrementNumber, Indent, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertBelowWithNewline, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Mark, MoveLineDown, MoveLineUp, Operator, OperatorError, Outdent, Point, PutAfter, PutBefore, Range, Repeat, Replace, ReplaceWithRegister, Reverse, Select, SelectLatestChange, SnakeCase, SplitString, Substitute, SubstituteLine, Surround, SurroundWord, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformString, UpperCase, Yank, YankLine, flashRanges, getVimEofBufferPosition, haveSomeSelection, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, getVimEofBufferPosition = _ref1.getVimEofBufferPosition, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, flashRanges = _ref1.flashRanges;

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

    Operator.prototype.haveSomeSelection = function() {
      return haveSomeSelection(this.editor.getSelections());
    };

    Operator.prototype.needFlash = function() {
      return this.flashTarget && settings.get('flashOnOperate');
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

    Operator.prototype.observeSelectAction = function() {
      var changeMarker;
      if (this.needFlash()) {
        this.onDidSelect((function(_this) {
          return function() {
            return _this.flash(_this.editor.getSelectedBufferRanges());
          };
        })(this));
      }
      if (this.needTrackChange()) {
        changeMarker = null;
        this.onDidSelect((function(_this) {
          return function() {
            var range;
            range = _this.editor.getSelectedBufferRange();
            return changeMarker = _this.editor.markBufferRange(range, {
              invalidate: 'never',
              persistent: false
            });
          };
        })(this));
        return this.onDidOperationFinish((function(_this) {
          return function() {
            var range;
            if (range = changeMarker.getBufferRange()) {
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

    Operator.prototype.selectTarget = function(force) {
      if (force == null) {
        force = false;
      }
      this.observeSelectAction();
      this.emitWillSelect();
      if (this.haveSomeSelection() && !force) {
        this.emitDidSelect();
        return true;
      } else {
        this.target.select();
        return this.haveSomeSelection();
      }
    };

    Operator.prototype.setTextToRegister = function(text) {
      var _base;
      if ((typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) && !text.endsWith('\n')) {
        text += "\n";
      }
      if (text) {
        return this.vimState.register.set({
          text: text
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

    Operator.prototype.preservePoints = function(_arg) {
      var asMarker, markers, options, points;
      asMarker = (_arg != null ? _arg : {}).asMarker;
      points = _.pluck(this.editor.getSelectedBufferRanges(), 'start');
      if (asMarker == null) {
        asMarker = false;
      }
      if (asMarker) {
        options = {
          invalidate: 'never',
          persistent: false
        };
        markers = this.editor.getCursorBufferPositions().map((function(_this) {
          return function(point) {
            return _this.editor.markBufferPosition(point, options);
          };
        })(this));
        return function(_arg1, i) {
          var cursor, point;
          cursor = _arg1.cursor;
          point = markers[i].getStartBufferPosition();
          return cursor.setBufferPosition(point);
        };
      } else {
        return function(_arg1, i) {
          var cursor, point;
          cursor = _arg1.cursor;
          point = points[i];
          return cursor.setBufferPosition(point);
        };
      }
    };

    Operator.prototype.eachSelection = function(fn) {
      var setPoint;
      setPoint = null;
      if (this.needStay()) {
        this.onWillSelect((function(_this) {
          return function() {
            return setPoint = _this.preservePoints(_this.stayOption);
          };
        })(this));
      } else {
        this.onDidSelect((function(_this) {
          return function() {
            return setPoint = _this.preservePoints();
          };
        })(this));
      }
      if (!this.selectTarget()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
            selection = _ref2[i];
            _results.push(fn(selection, setPoint.bind(_this, selection, i)));
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
      var submode;
      this.selectTarget(true);
      if (this.isMode('operator-pending') || this.isMode('visual', 'blockwise')) {
        return;
      }
      if (this.target["instanceof"]('TextObject')) {
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

    Delete.prototype.ensureCursorNotPastEOF = function(s) {
      var eof, head;
      head = s.getHeadBufferPosition();
      eof = getVimEofBufferPosition(this.editor);
      if (head.isGreaterThan(eof)) {
        return s.cursor.setBufferPosition([eof.row, 0]);
      }
    };

    Delete.prototype.execute = function() {
      this.eachSelection((function(_this) {
        return function(s) {
          var _base;
          if (s.isLastSelection()) {
            _this.setTextToRegister(s.getText());
          }
          s.deleteSelectedText();
          _this.ensureCursorNotPastEOF(s);
          if (typeof (_base = _this.target).isLinewise === "function" ? _base.isLinewise() : void 0) {
            return s.cursor.skipLeadingWhitespace();
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
        return function(s, setPoint) {
          return _this.mutate(s, setPoint);
        };
      })(this));
      return this.activateMode('normal');
    };

    TransformString.prototype.mutate = function(s, setPoint) {
      var text;
      text = this.getNewText(s.getText());
      s.insertText(text, {
        autoIndent: this.autoIndent
      });
      if (this.setPoint) {
        return setPoint();
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

    ToggleCase.prototype.hover = {
      icon: ':toggle-case:',
      emoji: ':clap:'
    };

    ToggleCase.prototype.toggleCase = function(char) {
      var charLower;
      if ((charLower = char.toLowerCase()) === char) {
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

    DashCase.prototype.hover = {
      icon: ':dash-case:',
      emoji: ':dash:'
    };

    DashCase.prototype.getNewText = function(text) {
      return _.dasherize(text);
    };

    return DashCase;

  })(TransformString);

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

    Indent.prototype.mutate = function(s, setPoint) {
      this.indent(s);
      setPoint();
      if (!this.needStay()) {
        return s.cursor.moveToFirstCharacterOfLine();
      }
    };

    Indent.prototype.indent = function(s) {
      return s.indentSelectedRows();
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

    Outdent.prototype.indent = function(s) {
      return s.outdentSelectedRows();
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

    AutoIndent.prototype.indent = function(s) {
      return s.autoIndentSelectedRows();
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

    ToggleLineComments.prototype.stayOption = {
      asMarker: true
    };

    ToggleLineComments.prototype.mutate = function(s, setPoint) {
      s.toggleLineComments();
      return setPoint();
    };

    return ToggleLineComments;

  })(TransformString);

  Surround = (function(_super) {
    __extends(Surround, _super);

    function Surround() {
      return Surround.__super__.constructor.apply(this, arguments);
    }

    Surround.extend();

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
          return _this.vimState.operationStack.cancel();
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
      return this.vimState.operationStack.process();
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

  MapSurround = (function(_super) {
    __extends(MapSurround, _super);

    function MapSurround() {
      return MapSurround.__super__.constructor.apply(this, arguments);
    }

    MapSurround.extend();

    MapSurround.prototype.mapRegExp = /\w+/g;

    MapSurround.prototype.execute = function() {
      this.eachSelection((function(_this) {
        return function(s, setPoint) {
          var scanRange;
          scanRange = s.getBufferRange();
          _this.editor.scanInBufferRange(_this.mapRegExp, scanRange, function(_arg) {
            var matchText, replace;
            matchText = _arg.matchText, replace = _arg.replace;
            return replace(_this.getNewText(matchText));
          });
          if (_this.setPoint) {
            return setPoint();
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
      return this.vimState.operationStack.process();
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
          _this.restore = _this.preservePoints();
          _this.target.select();
          if (!_this.haveSomeSelection()) {
            _this.vimState.reset();
            _this.abort();
          }
          return _this.addHover(_this.editor.getSelectedText()[0]);
        };
      })(this));
      return ChangeSurroundAnyPair.__super__.initialize.apply(this, arguments);
    };

    ChangeSurroundAnyPair.prototype.onConfirm = function(char) {
      var i, s, _i, _len, _ref2;
      this.char = char;
      _ref2 = this.editor.getSelections();
      for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
        s = _ref2[i];
        this.restore(s, i);
      }
      this.input = this.char;
      return this.vimState.operationStack.process();
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
        return function(s, setPoint) {
          return _this.mutate(s, setPoint);
        };
      })(this));
    };

    MoveLineUp.prototype.isMovable = function(s) {
      return s.getBufferRange().start.row !== 0;
    };

    MoveLineUp.prototype.getRangeTranslationSpec = function() {
      return [[-1, 0], [0, 0]];
    };

    MoveLineUp.prototype.mutate = function(s, setPoint) {
      var range, reversed, rows, translation;
      if (!this.isMovable(s)) {
        return;
      }
      reversed = s.isReversed();
      translation = this.getRangeTranslationSpec();
      swrap(s).translate(translation, {
        preserveFolds: true
      });
      rows = swrap(s).lineTextForBufferRows();
      this.rotateRows(rows);
      range = s.insertText(rows.join("\n") + "\n");
      range = range.translate.apply(range, translation.reverse());
      swrap(s).setBufferRange(range, {
        preserveFolds: true,
        reversed: reversed
      });
      return this.editor.scrollToCursorPosition({
        center: true
      });
    };

    MoveLineUp.prototype.isLastRow = function(row) {
      return row === this.editor.getBuffer().getLastRow();
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

    MoveLineDown.prototype.isMovable = function(s) {
      return !this.isLastRow(s.getBufferRange().end.row);
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
        return function(s, setPoint) {
          if (s.isLastSelection()) {
            _this.setTextToRegister(s.getText());
          }
          return setPoint();
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

    JoinWithKeepingSpace.prototype.mutate = function(s) {
      var endRow, row, rows, startRow, text, _ref2;
      _ref2 = s.getBufferRowRange(), startRow = _ref2[0], endRow = _ref2[1];
      swrap(s).expandOverLine();
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
      return s.insertText(this.join(rows) + "\n");
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

    Reverse.prototype.mutate = function(s, setPoint) {
      var newText, textForRows;
      swrap(s).expandOverLine();
      textForRows = swrap(s).lineTextForBufferRows();
      newText = textForRows.reverse().join("\n") + "\n";
      s.insertText(newText);
      return setPoint();
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
            var op;
            if (op = _this.vimState.operationStack.getRecorded()) {
              op.setRepeated();
              return op.execute();
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
          var c, ranges, scanRange, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            c = _ref2[_i];
            scanRange = _this.isMode('visual') ? c.selection.getBufferRange() : c.getCurrentLineBufferRange();
            ranges = _this.increaseNumber(c, scanRange, pattern);
            if (!_this.isMode('visual') && ranges.length) {
              c.setBufferPosition(ranges[0].end.translate([0, -1]));
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

    IncrementNumber.prototype.step = 1;

    IncrementNumber.prototype.baseNumber = null;

    IncrementNumber.prototype.execute = function() {
      var newRanges, pattern, s, _i, _len, _ref2;
      pattern = RegExp("" + (settings.get('numberRegex')), "g");
      newRanges = null;
      this.selectTarget();
      this.editor.transact((function(_this) {
        return function() {
          var s;
          return newRanges = (function() {
            var _i, _len, _ref2, _results;
            _ref2 = this.editor.getSelectionsOrderedByBufferPosition();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              s = _ref2[_i];
              _results.push(this.replaceNumber(s.getBufferRange(), pattern));
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
        s = _ref2[_i];
        s.cursor.setBufferPosition(s.getBufferRange().start);
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
      var isLinewise, text, type, _ref2;
      _ref2 = this.vimState.register.get(), text = _ref2.text, type = _ref2.type;
      if (!text) {
        return;
      }
      text = _.multiplyString(text, this.getCount());
      isLinewise = type === 'linewise' || this.isMode('visual', 'linewise');
      this.editor.transact((function(_this) {
        return function() {
          var cursor, newRange, s, _i, _len, _ref3, _results;
          _ref3 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
            s = _ref3[_i];
            cursor = s.cursor;
            if (isLinewise) {
              newRange = _this.pasteLinewise(s, text);
              cursor.setBufferPosition(newRange.start);
              cursor.moveToFirstCharacterOfLine();
            } else {
              newRange = _this.pasteCharacterwise(s, text);
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
          if (!text.endsWith('\n')) {
            text += '\n';
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
      var s, top, _i, _len, _ref2;
      if (this.input === '') {
        this.input = "\n";
      }
      this.eachSelection((function(_this) {
        return function(s, setPoint) {
          var text;
          text = s.getText().replace(/./g, _this.input);
          if (!(_this.target["instanceof"]('MoveRight') && (text.length < _this.getCount()))) {
            s.insertText(text, {
              autoIndentNewline: true
            });
          }
          if (_this.input !== "\n") {
            return setPoint();
          }
        };
      })(this));
      if (this.isMode('visual', 'blockwise')) {
        top = this.editor.getSelectionsOrderedByBufferPosition()[0];
        _ref2 = this.editor.getSelections();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          s = _ref2[_i];
          if (s !== top) {
            s.destroy();
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

    ActivateInsertMode.prototype.initialize = function() {
      this.checkpoint = {};
      if (!this.isRepeated()) {
        return this.setCheckpoint('undo');
      }
    };

    ActivateInsertMode.prototype.setCheckpoint = function(purpose) {
      return this.checkpoint[purpose] = this.editor.createCheckpoint();
    };

    ActivateInsertMode.prototype.getCheckpoint = function() {
      return this.checkpoint;
    };

    ActivateInsertMode.prototype.getText = function() {
      return this.vimState.register.getText('.');
    };

    ActivateInsertMode.prototype.repeatInsert = function(selection, text) {
      return selection.insertText(text, {
        autoIndent: true
      });
    };

    ActivateInsertMode.prototype.execute = function() {
      var text;
      if (this.isRepeated()) {
        if (!(text = this.getText())) {
          return;
        }
        this.flashTarget = this.trackChange = true;
        this.observeSelectAction();
        this.emitDidSelect();
        return this.editor.transact((function(_this) {
          return function() {
            var s, _i, _len, _ref2, _results;
            _ref2 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              s = _ref2[_i];
              _this.repeatInsert(s, text);
              _results.push(moveCursorLeft(s.cursor));
            }
            return _results;
          };
        })(this));
      } else {
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
      var c, _i, _len, _ref2;
      _ref2 = this.editor.getCursors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        c = _ref2[_i];
        moveCursorRight(c);
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

  InsertAtPreviousFoldStart = (function(_super) {
    __extends(InsertAtPreviousFoldStart, _super);

    function InsertAtPreviousFoldStart() {
      return InsertAtPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtPreviousFoldStart.extend();

    InsertAtPreviousFoldStart.prototype.motion = 'MoveToPreviousFoldStart';

    InsertAtPreviousFoldStart.prototype.execute = function() {
      this["new"](this.motion).execute();
      return InsertAtPreviousFoldStart.__super__.execute.apply(this, arguments);
    };

    return InsertAtPreviousFoldStart;

  })(ActivateInsertMode);

  InsertAtNextFoldStart = (function(_super) {
    __extends(InsertAtNextFoldStart, _super);

    function InsertAtNextFoldStart() {
      return InsertAtNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    InsertAtNextFoldStart.extend();

    InsertAtNextFoldStart.prototype.motion = 'MoveToNextFoldStart';

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

    Change.prototype.execute = function() {
      var text, _base;
      if (!this.selectTarget()) {
        this.activateMode('normal');
        return;
      }
      this.setTextToRegister(this.editor.getSelectedText());
      text = (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) ? "\n" : "";
      this.editor.transact((function(_this) {
        return function() {
          var range, s, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            s = _ref2[_i];
            range = s.insertText(text, {
              autoIndent: true
            });
            if (!range.isEmpty()) {
              _results.push(s.cursor.moveLeft());
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSwra0NBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixjQUFuQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxPQUFzQyxPQUFBLENBQVEsTUFBUixDQUF0QyxFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLDJCQUFBLG1CQUZmLENBQUE7O0FBQUEsRUFJQSxRQUlJLE9BQUEsQ0FBUSxTQUFSLENBSkosRUFDRSwwQkFBQSxpQkFERixFQUNxQixnQ0FBQSx1QkFEckIsRUFFRSx1QkFBQSxjQUZGLEVBRWtCLHdCQUFBLGVBRmxCLEVBR0Usb0JBQUEsV0FQRixDQUFBOztBQUFBLEVBU0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQVRSLENBQUE7O0FBQUEsRUFVQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FWWCxDQUFBOztBQUFBLEVBV0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBWFAsQ0FBQTs7QUFBQSxFQWFNO0FBQ0osb0NBQUEsQ0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQ2EsSUFBQSx1QkFBRSxPQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxnQkFBUixDQURXO0lBQUEsQ0FEYjs7eUJBQUE7O0tBRDBCLEtBYjVCLENBQUE7O0FBQUEsRUFvQk07QUFDSiwrQkFBQSxDQUFBOztBQUFBLElBQUEsUUFBQyxD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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/operator.coffee
