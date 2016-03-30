(function() {
  var ActivateInsertMode, ActivateReplaceMode, AutoIndent, Base, CamelCase, Change, ChangeSurround, ChangeSurroundAnyPair, ChangeToLastCharacterOfLine, CompositeDisposable, DashCase, DecodeUriComponent, Decrease, DecrementNumber, Delete, DeleteLeft, DeleteRight, DeleteSurround, DeleteSurroundAnyPair, DeleteToLastCharacterOfLine, EncodeUriComponent, Increase, IncrementNumber, Indent, InsertAboveWithNewline, InsertAfter, InsertAfterByMotion, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertAtLastInsert, InsertAtNextFoldStart, InsertAtPreviousFoldStart, InsertBelowWithNewline, InsertByMotion, Join, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Mark, MoveLineDown, MoveLineUp, Operator, OperatorError, Outdent, Point, PutAfter, PutBefore, Range, Repeat, Replace, ReplaceWithRegister, Reverse, Select, SelectLatestChange, SnakeCase, SplitString, Substitute, SubstituteLine, Surround, SurroundSmartWord, SurroundWord, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringBySelectList, TransformWordBySelectList, UpperCase, Yank, YankLine, flashRanges, getNewTextRangeFromCheckpoint, getVimEofBufferPosition, haveSomeSelection, moveCursorLeft, moveCursorRight, settings, swrap, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('./utils'), haveSomeSelection = _ref1.haveSomeSelection, getVimEofBufferPosition = _ref1.getVimEofBufferPosition, moveCursorLeft = _ref1.moveCursorLeft, moveCursorRight = _ref1.moveCursorRight, flashRanges = _ref1.flashRanges, getNewTextRangeFromCheckpoint = _ref1.getNewTextRangeFromCheckpoint;

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

  TitleCase = (function(_super) {
    __extends(TitleCase, _super);

    function TitleCase() {
      return TitleCase.__super__.constructor.apply(this, arguments);
    }

    TitleCase.extend();

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

    DecodeUriComponent.prototype.hover = {
      icon: 'decodeURI',
      emoji: 'decodeURI'
    };

    DecodeUriComponent.prototype.getNewText = function(text) {
      return decodeURIComponent(text);
    };

    return DecodeUriComponent;

  })(TransformString);

  TransformStringBySelectList = (function(_super) {
    __extends(TransformStringBySelectList, _super);

    function TransformStringBySelectList() {
      return TransformStringBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformStringBySelectList.extend();

    TransformStringBySelectList.prototype.requireInput = true;

    TransformStringBySelectList.prototype.requireTarget = true;

    TransformStringBySelectList.prototype.transformers = ['CamelCase', 'DashCase', 'SnakeCase', 'LowerCase', 'UpperCase', 'ToggleCase', 'EncodeUriComponent', 'DecodeUriComponent', 'JoinByInput', 'JoinWithKeepingSpace', 'Reverse', 'SplitString', 'Surround', 'MapSurround', 'TitleCase', 'IncrementNumber', 'DecrementNumber'];

    TransformStringBySelectList.prototype.getItems = function() {
      return this.transformers.map(function(name) {
        var displayName;
        name = name;
        displayName = _.humanizeEventName(_.dasherize(name)).replace(/\bUri\b/, 'URI');
        return {
          name: name,
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

    ActivateInsertMode.prototype.supportInsertionCount = true;

    ActivateInsertMode.prototype.withAddedBufferRangeFromCheckpoint = function(purpose, fn) {
      var range;
      range = getNewTextRangeFromCheckpoint(this.editor, this.getCheckpoint(purpose));
      if (range != null) {
        return fn(range);
      }
    };

    ActivateInsertMode.prototype.observeWillDeactivateMode = function() {
      var disposable;
      return disposable = this.vimState.modeManager.preemptWillDeactivateMode((function(_this) {
        return function(_arg) {
          var mode, range, text;
          mode = _arg.mode;
          if (mode !== 'insert') {
            return;
          }
          disposable.dispose();
          _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition());
          text = '';
          if ((range = getNewTextRangeFromCheckpoint(_this.editor, _this.getCheckpoint('insert'))) != null) {
            _this.setMarkForChange(range);
            text = _this.editor.getTextInBufferRange(range);
          }
          _this.saveInsertedText(text);
          _this.vimState.register.set('.', {
            text: text
          });
          _.times(_this.getInsertionCount(), function() {
            var selection, _i, _len, _ref2, _results;
            text = _this.textByOperator + _this.getInsertedText();
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
          this.emitDidSelect();
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

  InsertByMotion = (function(_super) {
    __extends(InsertByMotion, _super);

    function InsertByMotion() {
      return InsertByMotion.__super__.constructor.apply(this, arguments);
    }

    InsertByMotion.extend();

    InsertByMotion.prototype.requireTarget = true;

    InsertByMotion.prototype.execute = function() {
      var c, _i, _len, _ref2;
      if (this.target["instanceof"]('Motion')) {
        this.target.execute();
      }
      if (this["instanceof"]('InsertAfterByMotion')) {
        _ref2 = this.editor.getCursors();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          c = _ref2[_i];
          moveCursorRight(c);
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
      this.setTextToRegister(this.editor.getSelectedText());
      text = '';
      if (typeof (_base = this.target).isLinewise === "function" ? _base.isLinewise() : void 0) {
        text += "\n";
      }
      this.editor.transact((function(_this) {
        return function() {
          var range, selection, _i, _len, _ref2, _results;
          _ref2 = _this.editor.getSelections();
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUVBO0FBQUEsTUFBQSxpekNBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixjQUFuQixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxPQUFzQyxPQUFBLENBQVEsTUFBUixDQUF0QyxFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLDJCQUFBLG1CQUZmLENBQUE7O0FBQUEsRUFJQSxRQUlJLE9BQUEsQ0FBUSxTQUFSLENBSkosRUFDRSwwQkFBQSxpQkFERixFQUNxQixnQ0FBQSx1QkFEckIsRUFFRSx1QkFBQSxjQUZGLEVBRWtCLHdCQUFBLGVBRmxCLEVBR0Usb0JBQUEsV0FIRixFQUdlLHNDQUFBLDZCQVBmLENBQUE7O0FBQUEsRUFTQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBVFIsQ0FBQTs7QUFBQSxFQVVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQVZYLENBQUE7O0FBQUEsRUFXQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FYUCxDQUFBOztBQUFBLEVBY007QUFDSixvQ0FBQSxDQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFDYSxJQUFBLHVCQUFFLE9BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFVBQUEsT0FDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLGdCQUFSLENBRFc7SUFBQSxDQURiOzt5QkFBQTs7S0FEMEIsS0FkNUIsQ0FBQTs7QUFBQSxFQXFCTTtBQUNKLCtCQUFBLENBQUE7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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/operator.coffee
