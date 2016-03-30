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
      if (this.needFlash()) {
        this.onDidSelect((function(_this) {
          return function() {
            return _this.flash(_this.editor.getSelectedBufferRanges());
          };
        })(this));
      }
      if (this.needTrackChange()) {
        marker = null;
        this.onDidSelect((function(_this) {
          return function() {
            return marker = _this.markSelectedBufferRange();
          };
        })(this));
        return this.onDidOperationFinish((function(_this) {
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
      this.emitWillSelect();
      this.target.select();
      this.emitDidSelect();
      return haveSomeSelection(this.editor);
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
          if (selection.isLastSelection()) {
            _this.setTextToRegister(selection.getText());
          }
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
        if (!this["instanceof"]('Change')) {
          this.flashTarget = this.trackChange = true;
          this.setTarget(this["new"]('NullMotion'));
          this.selectTarget();
        }
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
