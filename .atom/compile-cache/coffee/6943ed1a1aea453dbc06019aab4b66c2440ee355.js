(function() {
  var AAngleBracket, AAnyPair, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurrentLine, ADoubleQuote, AEntire, AFold, AFunction, AIndentation, ALatestChange, AParagraph, AParenthesis, ASingleQuote, ASmartWord, ASquareBracket, AWholeWord, AWord, AngleBracket, AnyPair, AnyQuote, BackTick, Base, Comment, CurlyBracket, CurrentLine, DoubleQuote, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAnyPair, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurrentLine, InnerDoubleQuote, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerTag, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, Range, SingleQuote, SmartWord, SquareBracket, Tag, TextObject, WholeWord, Word, countChar, getBufferRangeForRowRange, getCodeFoldRowRangesContainesForRow, getEolBufferPositionForRow, getIndentLevelForBufferRow, getTextToPoint, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, rangeToBeginningOfFileFromPoint, rangeToEndOfFileFromPoint, sortRanges, swrap, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Range = require('atom').Range;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  _ref = require('./utils'), rangeToBeginningOfFileFromPoint = _ref.rangeToBeginningOfFileFromPoint, rangeToEndOfFileFromPoint = _ref.rangeToEndOfFileFromPoint, sortRanges = _ref.sortRanges, countChar = _ref.countChar, pointIsAtEndOfLine = _ref.pointIsAtEndOfLine, getEolBufferPositionForRow = _ref.getEolBufferPositionForRow, getTextToPoint = _ref.getTextToPoint, getIndentLevelForBufferRow = _ref.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = _ref.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = _ref.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = _ref.isIncludeFunctionScopeForRow;

  TextObject = (function(_super) {
    __extends(TextObject, _super);

    TextObject.extend(false);

    TextObject.prototype.allowSubmodeChange = true;

    function TextObject() {
      this.constructor.prototype.inner = this.constructor.name.startsWith('Inner');
      TextObject.__super__.constructor.apply(this, arguments);
      this.onDidSetTarget((function(_this) {
        return function(operator) {
          _this.operator = operator;
          return _this.operator;
        };
      })(this));
      if (typeof this.initialize === "function") {
        this.initialize();
      }
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.isInner();
    };

    TextObject.prototype.isAllowSubmodeChange = function() {
      return this.allowSubmodeChange;
    };

    TextObject.prototype.isLinewise = function() {
      var submode;
      submode = this.isAllowSubmodeChange() ? swrap.detectVisualModeSubmode(this.editor) : this.vimState.submode;
      return submode === 'linewise';
    };

    TextObject.prototype.select = function() {
      var end, selection, start, _i, _len, _ref1, _ref2, _results;
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        this.selectTextObject(selection);
        _ref2 = selection.getBufferRange(), start = _ref2.start, end = _ref2.end;
        if ((end.column === 0) && swrap(selection).detectVisualModeSubmode() === 'characterwise') {
          end = getEolBufferPositionForRow(this.editor, end.row - 1);
          _results.push(swrap(selection).setBufferRangeSafely([start, end]));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return TextObject;

  })(Base);

  Word = (function(_super) {
    __extends(Word, _super);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.prototype.selectTextObject = function(selection) {
      var wordRegex, _ref1;
      wordRegex = (_ref1 = this.wordRegExp) != null ? _ref1 : selection.cursor.wordRegExp();
      if (this.isInner()) {
        return this.selectInner(selection, wordRegex);
      } else {
        return this.selectA(selection, wordRegex);
      }
    };

    Word.prototype.selectInner = function(selection, wordRegex) {
      if (wordRegex == null) {
        wordRegex = null;
      }
      return selection.selectWord();
    };

    Word.prototype.selectA = function(selection, wordRegex) {
      var headPoint, scanRange;
      if (wordRegex == null) {
        wordRegex = null;
      }
      this.selectInner(selection, wordRegex);
      scanRange = selection.cursor.getCurrentLineBufferRange();
      headPoint = selection.getHeadBufferPosition();
      scanRange.start = headPoint;
      return this.editor.scanInBufferRange(/\s+/, scanRange, function(_arg) {
        var range, stop;
        range = _arg.range, stop = _arg.stop;
        if (headPoint.isEqual(range.start)) {
          selection.selectToBufferPosition(range.end);
          return stop();
        }
      });
    };

    return Word;

  })(TextObject);

  AWord = (function(_super) {
    __extends(AWord, _super);

    function AWord() {
      return AWord.__super__.constructor.apply(this, arguments);
    }

    AWord.extend();

    return AWord;

  })(Word);

  InnerWord = (function(_super) {
    __extends(InnerWord, _super);

    function InnerWord() {
      return InnerWord.__super__.constructor.apply(this, arguments);
    }

    InnerWord.extend();

    return InnerWord;

  })(Word);

  WholeWord = (function(_super) {
    __extends(WholeWord, _super);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.prototype.wordRegExp = /\S+/;

    WholeWord.prototype.selectInner = function(s, wordRegex) {
      return swrap(s).setBufferRangeSafely(s.cursor.getCurrentWordBufferRange({
        wordRegex: wordRegex
      }));
    };

    return WholeWord;

  })(Word);

  AWholeWord = (function(_super) {
    __extends(AWholeWord, _super);

    function AWholeWord() {
      return AWholeWord.__super__.constructor.apply(this, arguments);
    }

    AWholeWord.extend();

    return AWholeWord;

  })(WholeWord);

  InnerWholeWord = (function(_super) {
    __extends(InnerWholeWord, _super);

    function InnerWholeWord() {
      return InnerWholeWord.__super__.constructor.apply(this, arguments);
    }

    InnerWholeWord.extend();

    return InnerWholeWord;

  })(WholeWord);

  SmartWord = (function(_super) {
    __extends(SmartWord, _super);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.prototype.wordRegExp = /[\w-]+/;

    SmartWord.prototype.selectInner = function(s, wordRegex) {
      return swrap(s).setBufferRangeSafely(s.cursor.getCurrentWordBufferRange({
        wordRegex: wordRegex
      }));
    };

    return SmartWord;

  })(Word);

  ASmartWord = (function(_super) {
    __extends(ASmartWord, _super);

    function ASmartWord() {
      return ASmartWord.__super__.constructor.apply(this, arguments);
    }

    ASmartWord.extend();

    return ASmartWord;

  })(SmartWord);

  InnerSmartWord = (function(_super) {
    __extends(InnerSmartWord, _super);

    function InnerSmartWord() {
      return InnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InnerSmartWord.extend();

    return InnerSmartWord;

  })(SmartWord);

  Pair = (function(_super) {
    var escapeChar;

    __extends(Pair, _super);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.allowNextLine = false;

    Pair.prototype.allowSubmodeChange = false;

    Pair.prototype.enclosed = true;

    Pair.prototype.pair = null;

    Pair.prototype.getPairState = function(pair, matchText, range) {
      var closeChar, openChar;
      openChar = pair[0], closeChar = pair[1];
      if (openChar === closeChar) {
        return this.pairStateInBufferRange(range, openChar);
      } else {
        return ['open', 'close'][pair.indexOf(matchText)];
      }
    };

    Pair.prototype.pairStateInBufferRange = function(range, char) {
      var pattern, text;
      text = getTextToPoint(this.editor, range.end);
      pattern = RegExp("[^\\\\]?" + (_.escapeRegExp(char)));
      return ['close', 'open'][countChar(text, pattern) % 2];
    };

    escapeChar = '\\';

    Pair.prototype.isEscapedCharAtPoint = function(point) {
      var range;
      range = Range.fromPointWithDelta(point, 0, -1);
      return this.editor.getTextInBufferRange(range) === escapeChar;
    };

    Pair.prototype.findPair = function(pair, options) {
      var allowNextLine, enclosed, found, from, pairRegexp, pattern, scanFunc, scanRange, state, which;
      from = options.from, which = options.which, allowNextLine = options.allowNextLine, enclosed = options.enclosed;
      switch (which) {
        case 'open':
          scanFunc = 'backwardsScanInBufferRange';
          scanRange = rangeToBeginningOfFileFromPoint(from);
          break;
        case 'close':
          scanFunc = 'scanInBufferRange';
          scanRange = rangeToEndOfFileFromPoint(from);
      }
      pairRegexp = pair.map(_.escapeRegExp).join('|');
      pattern = RegExp("" + pairRegexp, "g");
      found = null;
      state = {
        open: [],
        close: []
      };
      this.editor[scanFunc](pattern, scanRange, (function(_this) {
        return function(_arg) {
          var end, matchText, openRange, oppositeState, pairState, range, start, stop;
          matchText = _arg.matchText, range = _arg.range, stop = _arg.stop;
          start = range.start, end = range.end;
          if ((!allowNextLine) && (from.row !== start.row)) {
            return stop();
          }
          if (_this.isEscapedCharAtPoint(start)) {
            return;
          }
          pairState = _this.getPairState(pair, matchText, range);
          oppositeState = pairState === 'open' ? 'close' : 'open';
          if (pairState === which) {
            openRange = state[oppositeState].pop();
          } else {
            state[pairState].push(range);
          }
          if ((pairState === which) && (state.open.length === 0) && (state.close.length === 0)) {
            if (enclosed && (openRange != null) && (which === 'close')) {
              if (!new Range(openRange.start, range.end).containsPoint(from)) {
                return;
              }
            }
            found = range;
            return stop();
          }
        };
      })(this));
      return found;
    };

    Pair.prototype.findOpen = function(pair, options) {
      options.which = 'open';
      if (options.allowNextLine == null) {
        options.allowNextLine = this.allowNextLine;
      }
      return this.findPair(pair, options);
    };

    Pair.prototype.findClose = function(pair, options) {
      options.which = 'close';
      if (options.allowNextLine == null) {
        options.allowNextLine = this.allowNextLine;
      }
      return this.findPair(pair, options);
    };

    Pair.prototype.getPairInfo = function(from, pair, enclosed) {
      var aRange, closeRange, innerEnd, innerRange, innerStart, openRange, pairInfo, targetRange, _ref1;
      pairInfo = null;
      closeRange = this.findClose(pair, {
        from: from,
        enclosed: enclosed
      });
      if (closeRange != null) {
        openRange = this.findOpen(pair, {
          from: closeRange.end
        });
      }
      if ((openRange != null) && (closeRange != null)) {
        aRange = new Range(openRange.start, closeRange.end);
        _ref1 = [openRange.end, closeRange.start], innerStart = _ref1[0], innerEnd = _ref1[1];
        if (pointIsAtEndOfLine(this.editor, innerStart)) {
          innerStart = [innerStart.row + 1, 0];
        }
        if (getTextToPoint(this.editor, innerEnd).match(/^\s*$/)) {
          innerEnd = [innerEnd.row, 0];
        }
        innerRange = new Range(innerStart, innerEnd);
        targetRange = this.isInner() ? innerRange : aRange;
        pairInfo = {
          openRange: openRange,
          closeRange: closeRange,
          aRange: aRange,
          innerRange: innerRange,
          targetRange: targetRange
        };
      }
      return pairInfo;
    };

    Pair.prototype.getRange = function(selection, _arg) {
      var enclosed, from, originalRange, pairInfo;
      enclosed = (_arg != null ? _arg : {}).enclosed;
      originalRange = selection.getBufferRange();
      from = selection.getHeadBufferPosition();
      if (!selection.isEmpty() && !selection.isReversed()) {
        from = from.translate([0, -1]);
      }
      pairInfo = this.getPairInfo(from, this.pair, enclosed);
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        from = pairInfo.aRange.end.translate([0, +1]);
        pairInfo = this.getPairInfo(from, this.pair, enclosed);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    Pair.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange(selection, {
        enclosed: this.enclosed
      }));
    };

    return Pair;

  })(TextObject);

  AnyPair = (function(_super) {
    __extends(AnyPair, _super);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'Tag', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRangeBy = function(klass, selection) {
      return this["new"](klass, {
        inner: this.inner
      }).getRange(selection, {
        enclosed: this.enclosed
      });
    };

    AnyPair.prototype.getRanges = function(selection) {
      var klass, range, _i, _len, _ref1, _results;
      _ref1 = this.member;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        klass = _ref1[_i];
        if ((range = this.getRangeBy(klass, selection))) {
          _results.push(range);
        }
      }
      return _results;
    };

    AnyPair.prototype.getNearestRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.last(sortRanges(ranges));
      }
    };

    AnyPair.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getNearestRange(selection));
    };

    return AnyPair;

  })(Pair);

  AAnyPair = (function(_super) {
    __extends(AAnyPair, _super);

    function AAnyPair() {
      return AAnyPair.__super__.constructor.apply(this, arguments);
    }

    AAnyPair.extend();

    return AAnyPair;

  })(AnyPair);

  InnerAnyPair = (function(_super) {
    __extends(InnerAnyPair, _super);

    function InnerAnyPair() {
      return InnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPair.extend();

    return InnerAnyPair;

  })(AnyPair);

  AnyQuote = (function(_super) {
    __extends(AnyQuote, _super);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.prototype.enclosed = false;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getNearestRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  AAnyQuote = (function(_super) {
    __extends(AAnyQuote, _super);

    function AAnyQuote() {
      return AAnyQuote.__super__.constructor.apply(this, arguments);
    }

    AAnyQuote.extend();

    return AAnyQuote;

  })(AnyQuote);

  InnerAnyQuote = (function(_super) {
    __extends(InnerAnyQuote, _super);

    function InnerAnyQuote() {
      return InnerAnyQuote.__super__.constructor.apply(this, arguments);
    }

    InnerAnyQuote.extend();

    return InnerAnyQuote;

  })(AnyQuote);

  DoubleQuote = (function(_super) {
    __extends(DoubleQuote, _super);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.prototype.pair = ['"', '"'];

    DoubleQuote.prototype.enclosed = false;

    return DoubleQuote;

  })(Pair);

  ADoubleQuote = (function(_super) {
    __extends(ADoubleQuote, _super);

    function ADoubleQuote() {
      return ADoubleQuote.__super__.constructor.apply(this, arguments);
    }

    ADoubleQuote.extend();

    return ADoubleQuote;

  })(DoubleQuote);

  InnerDoubleQuote = (function(_super) {
    __extends(InnerDoubleQuote, _super);

    function InnerDoubleQuote() {
      return InnerDoubleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerDoubleQuote.extend();

    return InnerDoubleQuote;

  })(DoubleQuote);

  SingleQuote = (function(_super) {
    __extends(SingleQuote, _super);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.prototype.pair = ["'", "'"];

    SingleQuote.prototype.enclosed = false;

    return SingleQuote;

  })(Pair);

  ASingleQuote = (function(_super) {
    __extends(ASingleQuote, _super);

    function ASingleQuote() {
      return ASingleQuote.__super__.constructor.apply(this, arguments);
    }

    ASingleQuote.extend();

    return ASingleQuote;

  })(SingleQuote);

  InnerSingleQuote = (function(_super) {
    __extends(InnerSingleQuote, _super);

    function InnerSingleQuote() {
      return InnerSingleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerSingleQuote.extend();

    return InnerSingleQuote;

  })(SingleQuote);

  BackTick = (function(_super) {
    __extends(BackTick, _super);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.prototype.pair = ['`', '`'];

    BackTick.prototype.enclosed = false;

    return BackTick;

  })(Pair);

  ABackTick = (function(_super) {
    __extends(ABackTick, _super);

    function ABackTick() {
      return ABackTick.__super__.constructor.apply(this, arguments);
    }

    ABackTick.extend();

    return ABackTick;

  })(BackTick);

  InnerBackTick = (function(_super) {
    __extends(InnerBackTick, _super);

    function InnerBackTick() {
      return InnerBackTick.__super__.constructor.apply(this, arguments);
    }

    InnerBackTick.extend();

    return InnerBackTick;

  })(BackTick);

  CurlyBracket = (function(_super) {
    __extends(CurlyBracket, _super);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.prototype.pair = ['{', '}'];

    CurlyBracket.prototype.allowNextLine = true;

    return CurlyBracket;

  })(Pair);

  ACurlyBracket = (function(_super) {
    __extends(ACurlyBracket, _super);

    function ACurlyBracket() {
      return ACurlyBracket.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracket.extend();

    return ACurlyBracket;

  })(CurlyBracket);

  InnerCurlyBracket = (function(_super) {
    __extends(InnerCurlyBracket, _super);

    function InnerCurlyBracket() {
      return InnerCurlyBracket.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracket.extend();

    return InnerCurlyBracket;

  })(CurlyBracket);

  SquareBracket = (function(_super) {
    __extends(SquareBracket, _super);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.prototype.pair = ['[', ']'];

    SquareBracket.prototype.allowNextLine = true;

    return SquareBracket;

  })(Pair);

  ASquareBracket = (function(_super) {
    __extends(ASquareBracket, _super);

    function ASquareBracket() {
      return ASquareBracket.__super__.constructor.apply(this, arguments);
    }

    ASquareBracket.extend();

    return ASquareBracket;

  })(SquareBracket);

  InnerSquareBracket = (function(_super) {
    __extends(InnerSquareBracket, _super);

    function InnerSquareBracket() {
      return InnerSquareBracket.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracket.extend();

    return InnerSquareBracket;

  })(SquareBracket);

  Parenthesis = (function(_super) {
    __extends(Parenthesis, _super);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.prototype.pair = ['(', ')'];

    Parenthesis.prototype.allowNextLine = true;

    return Parenthesis;

  })(Pair);

  AParenthesis = (function(_super) {
    __extends(AParenthesis, _super);

    function AParenthesis() {
      return AParenthesis.__super__.constructor.apply(this, arguments);
    }

    AParenthesis.extend();

    return AParenthesis;

  })(Parenthesis);

  InnerParenthesis = (function(_super) {
    __extends(InnerParenthesis, _super);

    function InnerParenthesis() {
      return InnerParenthesis.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesis.extend();

    return InnerParenthesis;

  })(Parenthesis);

  AngleBracket = (function(_super) {
    __extends(AngleBracket, _super);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  AAngleBracket = (function(_super) {
    __extends(AAngleBracket, _super);

    function AAngleBracket() {
      return AAngleBracket.__super__.constructor.apply(this, arguments);
    }

    AAngleBracket.extend();

    return AAngleBracket;

  })(AngleBracket);

  InnerAngleBracket = (function(_super) {
    __extends(InnerAngleBracket, _super);

    function InnerAngleBracket() {
      return InnerAngleBracket.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracket.extend();

    return InnerAngleBracket;

  })(AngleBracket);

  Tag = (function(_super) {
    __extends(Tag, _super);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.prototype.pair = ['>', '<'];

    return Tag;

  })(Pair);

  InnerTag = (function(_super) {
    __extends(InnerTag, _super);

    function InnerTag() {
      return InnerTag.__super__.constructor.apply(this, arguments);
    }

    InnerTag.extend();

    return InnerTag;

  })(Tag);

  Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.prototype.getStartRow = function(startRow, fn) {
      var row, _i;
      for (row = _i = startRow; startRow <= 0 ? _i <= 0 : _i >= 0; row = startRow <= 0 ? ++_i : --_i) {
        if (fn(row)) {
          return row + 1;
        }
      }
      return 0;
    };

    Paragraph.prototype.getEndRow = function(startRow, fn) {
      var lastRow, row, _i;
      lastRow = this.editor.getLastBufferRow();
      for (row = _i = startRow; startRow <= lastRow ? _i <= lastRow : _i >= lastRow; row = startRow <= lastRow ? ++_i : --_i) {
        if (fn(row)) {
          return row - 1;
        }
      }
      return lastRow;
    };

    Paragraph.prototype.getRange = function(startRow) {
      var fn, startRowIsBlank;
      startRowIsBlank = this.editor.isBufferRowBlank(startRow);
      fn = (function(_this) {
        return function(row) {
          return _this.editor.isBufferRowBlank(row) !== startRowIsBlank;
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    Paragraph.prototype.selectParagraph = function(selection) {
      var endRow, point, startRow, _ref1, _ref2, _ref3;
      _ref1 = selection.getBufferRowRange(), startRow = _ref1[0], endRow = _ref1[1];
      if (swrap(selection).isSingleRow()) {
        return swrap(selection).setBufferRangeSafely(this.getRange(startRow));
      } else {
        point = selection.isReversed() ? (startRow = Math.max(0, startRow - 1), (_ref2 = this.getRange(startRow)) != null ? _ref2.start : void 0) : (_ref3 = this.getRange(endRow + 1)) != null ? _ref3.end : void 0;
        if (point != null) {
          return selection.selectToBufferPosition(point);
        }
      }
    };

    Paragraph.prototype.selectTextObject = function(selection) {
      return _.times(this.getCount(), (function(_this) {
        return function() {
          _this.selectParagraph(selection);
          if (_this["instanceof"]('AParagraph')) {
            return _this.selectParagraph(selection);
          }
        };
      })(this));
    };

    return Paragraph;

  })(TextObject);

  AParagraph = (function(_super) {
    __extends(AParagraph, _super);

    function AParagraph() {
      return AParagraph.__super__.constructor.apply(this, arguments);
    }

    AParagraph.extend();

    return AParagraph;

  })(Paragraph);

  InnerParagraph = (function(_super) {
    __extends(InnerParagraph, _super);

    function InnerParagraph() {
      return InnerParagraph.__super__.constructor.apply(this, arguments);
    }

    InnerParagraph.extend();

    return InnerParagraph;

  })(Paragraph);

  Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.prototype.getRange = function(startRow) {
      var fn;
      if (!this.editor.isBufferRowCommented(startRow)) {
        return;
      }
      fn = (function(_this) {
        return function(row) {
          var _ref1;
          if (!_this.isInner() && _this.editor.isBufferRowBlank(row)) {
            return;
          }
          return (_ref1 = _this.editor.isBufferRowCommented(row)) === false || _ref1 === (void 0);
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    return Comment;

  })(Paragraph);

  AComment = (function(_super) {
    __extends(AComment, _super);

    function AComment() {
      return AComment.__super__.constructor.apply(this, arguments);
    }

    AComment.extend();

    return AComment;

  })(Comment);

  InnerComment = (function(_super) {
    __extends(InnerComment, _super);

    function InnerComment() {
      return InnerComment.__super__.constructor.apply(this, arguments);
    }

    InnerComment.extend();

    return InnerComment;

  })(Comment);

  Indentation = (function(_super) {
    __extends(Indentation, _super);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.prototype.getRange = function(startRow) {
      var baseIndentLevel, fn;
      if (this.editor.isBufferRowBlank(startRow)) {
        return;
      }
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      fn = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isInner();
          } else {
            return getIndentLevelForBufferRow(_this.editor, row) < baseIndentLevel;
          }
        };
      })(this);
      return new Range([this.getStartRow(startRow, fn), 0], [this.getEndRow(startRow, fn) + 1, 0]);
    };

    return Indentation;

  })(Paragraph);

  AIndentation = (function(_super) {
    __extends(AIndentation, _super);

    function AIndentation() {
      return AIndentation.__super__.constructor.apply(this, arguments);
    }

    AIndentation.extend();

    return AIndentation;

  })(Indentation);

  InnerIndentation = (function(_super) {
    __extends(InnerIndentation, _super);

    function InnerIndentation() {
      return InnerIndentation.__super__.constructor.apply(this, arguments);
    }

    InnerIndentation.extend();

    return InnerIndentation;

  })(Indentation);

  Fold = (function(_super) {
    __extends(Fold, _super);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.prototype.adjustRowRange = function(_arg) {
      var endRow, endRowIndentLevel, startRow, startRowIndentLevel;
      startRow = _arg[0], endRow = _arg[1];
      if (!this.isInner()) {
        return [startRow, endRow];
      }
      startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      endRowIndentLevel = getIndentLevelForBufferRow(this.editor, endRow);
      if (startRowIndentLevel === endRowIndentLevel) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      var _ref1;
      return (_ref1 = getCodeFoldRowRangesContainesForRow(this.editor, row, true)) != null ? _ref1.reverse() : void 0;
    };

    Fold.prototype.selectTextObject = function(selection) {
      var range, rowRange, rowRanges, targetRange;
      range = selection.getBufferRange();
      rowRanges = this.getFoldRowRangesContainsForRow(range.start.row);
      if (rowRanges == null) {
        return;
      }
      if ((rowRange = rowRanges.shift()) != null) {
        rowRange = this.adjustRowRange(rowRange);
        targetRange = getBufferRangeForRowRange(this.editor, rowRange);
        if (targetRange.isEqual(range) && rowRanges.length) {
          rowRange = this.adjustRowRange(rowRanges.shift());
        }
      }
      if (rowRange != null) {
        return swrap(selection).selectRowRange(rowRange);
      }
    };

    return Fold;

  })(TextObject);

  AFold = (function(_super) {
    __extends(AFold, _super);

    function AFold() {
      return AFold.__super__.constructor.apply(this, arguments);
    }

    AFold.extend();

    return AFold;

  })(Fold);

  InnerFold = (function(_super) {
    __extends(InnerFold, _super);

    function InnerFold() {
      return InnerFold.__super__.constructor.apply(this, arguments);
    }

    InnerFold.extend();

    return InnerFold;

  })(Fold);

  Function = (function(_super) {
    __extends(Function, _super);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.prototype.omittingClosingCharLanguages = ['go'];

    Function.prototype.initialize = function() {
      return this.language = this.editor.getGrammar().scopeName.replace(/^source\./, '');
    };

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      var rowRanges, _ref1;
      rowRanges = (_ref1 = getCodeFoldRowRangesContainesForRow(this.editor, row)) != null ? _ref1.reverse() : void 0;
      return rowRanges != null ? rowRanges.filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this)) : void 0;
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, startRow, _ref1, _ref2;
      _ref1 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = _ref1[0], endRow = _ref1[1];
      if (this.isA() && (_ref2 = this.language, __indexOf.call(this.omittingClosingCharLanguages, _ref2) >= 0)) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  AFunction = (function(_super) {
    __extends(AFunction, _super);

    function AFunction() {
      return AFunction.__super__.constructor.apply(this, arguments);
    }

    AFunction.extend();

    return AFunction;

  })(Function);

  InnerFunction = (function(_super) {
    __extends(InnerFunction, _super);

    function InnerFunction() {
      return InnerFunction.__super__.constructor.apply(this, arguments);
    }

    InnerFunction.extend();

    return InnerFunction;

  })(Function);

  CurrentLine = (function(_super) {
    __extends(CurrentLine, _super);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.prototype.selectTextObject = function(selection) {
      var cursor;
      cursor = selection.cursor;
      cursor.moveToBeginningOfLine();
      if (this.isInner()) {
        cursor.moveToFirstCharacterOfLine();
      }
      return selection.selectToEndOfBufferLine();
    };

    return CurrentLine;

  })(TextObject);

  ACurrentLine = (function(_super) {
    __extends(ACurrentLine, _super);

    function ACurrentLine() {
      return ACurrentLine.__super__.constructor.apply(this, arguments);
    }

    ACurrentLine.extend();

    return ACurrentLine;

  })(CurrentLine);

  InnerCurrentLine = (function(_super) {
    __extends(InnerCurrentLine, _super);

    function InnerCurrentLine() {
      return InnerCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InnerCurrentLine.extend();

    return InnerCurrentLine;

  })(CurrentLine);

  Entire = (function(_super) {
    __extends(Entire, _super);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.prototype.selectTextObject = function(selection) {
      return this.editor.selectAll();
    };

    return Entire;

  })(TextObject);

  AEntire = (function(_super) {
    __extends(AEntire, _super);

    function AEntire() {
      return AEntire.__super__.constructor.apply(this, arguments);
    }

    AEntire.extend();

    return AEntire;

  })(Entire);

  InnerEntire = (function(_super) {
    __extends(InnerEntire, _super);

    function InnerEntire() {
      return InnerEntire.__super__.constructor.apply(this, arguments);
    }

    InnerEntire.extend();

    return InnerEntire;

  })(Entire);

  LatestChange = (function(_super) {
    __extends(LatestChange, _super);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.prototype.getRange = function() {
      return this.vimState.mark.getRange('[', ']');
    };

    LatestChange.prototype.selectTextObject = function(selection) {
      return swrap(selection).setBufferRangeSafely(this.getRange());
    };

    return LatestChange;

  })(TextObject);

  ALatestChange = (function(_super) {
    __extends(ALatestChange, _super);

    function ALatestChange() {
      return ALatestChange.__super__.constructor.apply(this, arguments);
    }

    ALatestChange.extend();

    return ALatestChange;

  })(LatestChange);

  InnerLatestChange = (function(_super) {
    __extends(InnerLatestChange, _super);

    function InnerLatestChange() {
      return InnerLatestChange.__super__.constructor.apply(this, arguments);
    }

    InnerLatestChange.extend();

    return InnerLatestChange;

  })(LatestChange);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSw4bENBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxPQVFJLE9BQUEsQ0FBUSxTQUFSLENBUkosRUFDRSx1Q0FBQSwrQkFERixFQUNtQyxpQ0FBQSx5QkFEbkMsRUFFRSxrQkFBQSxVQUZGLEVBRWMsaUJBQUEsU0FGZCxFQUV5QiwwQkFBQSxrQkFGekIsRUFFNkMsa0NBQUEsMEJBRjdDLEVBR0Usc0JBQUEsY0FIRixFQUlFLGtDQUFBLDBCQUpGLEVBS0UsMkNBQUEsbUNBTEYsRUFNRSxpQ0FBQSx5QkFORixFQU9FLG9DQUFBLDRCQVpGLENBQUE7O0FBQUEsRUFlTTtBQUNKLGlDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHlCQUNBLGtCQUFBLEdBQW9CLElBRHBCLENBQUE7O0FBR2EsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsV0FBVyxDQUFBLFNBQUUsQ0FBQSxLQUFkLEdBQXNCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQWxCLENBQTZCLE9BQTdCLENBQXRCLENBQUE7QUFBQSxNQUNBLDZDQUFBLFNBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsY0FBRCxDQUFnQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxRQUFGLEdBQUE7QUFBZSxVQUFkLEtBQUMsQ0FBQSxXQUFBLFFBQWEsQ0FBQTtpQkFBQSxLQUFDLENBQUEsU0FBaEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixDQUZBLENBQUE7O1FBR0EsSUFBQyxDQUFBO09BSlU7SUFBQSxDQUhiOztBQUFBLHlCQVNBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsTUFETTtJQUFBLENBVFQsQ0FBQTs7QUFBQSx5QkFZQSxHQUFBLEdBQUssU0FBQSxHQUFBO2FBQ0gsQ0FBQSxJQUFLLENBQUEsT0FBRCxDQUFBLEVBREQ7SUFBQSxDQVpMLENBQUE7O0FBQUEseUJBZUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO2FBQ3BCLElBQUMsQ0FBQSxtQkFEbUI7SUFBQSxDQWZ0QixDQUFBOztBQUFBLHlCQWtCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQWEsSUFBQyxDQUFBLG9CQUFELENBQUEsQ0FBSCxHQUNSLEtBQUssQ0FBQyx1QkFBTixDQUE4QixJQUFDLENBQUEsTUFBL0IsQ0FEUSxHQUdSLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FIWixDQUFBO2FBSUEsT0FBQSxLQUFXLFdBTEQ7SUFBQSxDQWxCWixDQUFBOztBQUFBLHlCQXlCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSx1REFBQTtBQUFBO0FBQUE7V0FBQSw0Q0FBQTs4QkFBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsUUFBZSxTQUFTLENBQUMsY0FBVixDQUFBLENBQWYsRUFBQyxjQUFBLEtBQUQsRUFBUSxZQUFBLEdBRFIsQ0FBQTtBQUVBLFFBQUEsSUFBRyxDQUFDLEdBQUcsQ0FBQyxNQUFKLEtBQWMsQ0FBZixDQUFBLElBQXNCLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsdUJBQWpCLENBQUEsQ0FBQSxLQUE4QyxlQUF2RTtBQUNFLFVBQUEsR0FBQSxHQUFNLDBCQUFBLENBQTJCLElBQUMsQ0FBQSxNQUE1QixFQUFvQyxHQUFHLENBQUMsR0FBSixHQUFVLENBQTlDLENBQU4sQ0FBQTtBQUFBLHdCQUNBLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsb0JBQWpCLENBQXNDLENBQUMsS0FBRCxFQUFRLEdBQVIsQ0FBdEMsRUFEQSxDQURGO1NBQUEsTUFBQTtnQ0FBQTtTQUhGO0FBQUE7c0JBRE07SUFBQSxDQXpCUixDQUFBOztzQkFBQTs7S0FEdUIsS0FmekIsQ0FBQTs7QUFBQSxFQW1ETTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsbUJBQ0EsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEdBQUE7QUFDaEIsVUFBQSxnQkFBQTtBQUFBLE1BQUEsU0FBQSwrQ0FBMEIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFqQixDQUFBLENBQTFCLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiLEVBQXdCLFNBQXhCLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFULEVBQW9CLFNBQXBCLEVBSEY7T0FGZ0I7SUFBQSxDQURsQixDQUFBOztBQUFBLG1CQVFBLFdBQUEsR0FBYSxTQUFDLFNBQUQsRUFBWSxTQUFaLEdBQUE7O1FBQVksWUFBVTtPQUNqQzthQUFBLFNBQVMsQ0FBQyxVQUFWLENBQUEsRUFEVztJQUFBLENBUmIsQ0FBQTs7QUFBQSxtQkFXQSxPQUFBLEdBQVMsU0FBQyxTQUFELEVBQVksU0FBWixHQUFBO0FBQ1AsVUFBQSxvQkFBQTs7UUFEbUIsWUFBVTtPQUM3QjtBQUFBLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiLEVBQXdCLFNBQXhCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLFNBQVMsQ0FBQyxNQUFNLENBQUMseUJBQWpCLENBQUEsQ0FEWixDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQVksU0FBUyxDQUFDLHFCQUFWLENBQUEsQ0FGWixDQUFBO0FBQUEsTUFHQSxTQUFTLENBQUMsS0FBVixHQUFrQixTQUhsQixDQUFBO2FBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixLQUExQixFQUFpQyxTQUFqQyxFQUE0QyxTQUFDLElBQUQsR0FBQTtBQUMxQyxZQUFBLFdBQUE7QUFBQSxRQUQ0QyxhQUFBLE9BQU8sWUFBQSxJQUNuRCxDQUFBO0FBQUEsUUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQUssQ0FBQyxLQUF4QixDQUFIO0FBQ0UsVUFBQSxTQUFTLENBQUMsc0JBQVYsQ0FBaUMsS0FBSyxDQUFDLEdBQXZDLENBQUEsQ0FBQTtpQkFDQSxJQUFBLENBQUEsRUFGRjtTQUQwQztNQUFBLENBQTVDLEVBTE87SUFBQSxDQVhULENBQUE7O2dCQUFBOztLQURpQixXQW5EbkIsQ0FBQTs7QUFBQSxFQXlFTTtBQUNKLDRCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztpQkFBQTs7S0FEa0IsS0F6RXBCLENBQUE7O0FBQUEsRUE0RU07QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7cUJBQUE7O0tBRHNCLEtBNUV4QixDQUFBOztBQUFBLEVBZ0ZNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx3QkFDQSxVQUFBLEdBQVksS0FEWixDQUFBOztBQUFBLHdCQUVBLFdBQUEsR0FBYSxTQUFDLENBQUQsRUFBSSxTQUFKLEdBQUE7YUFDWCxLQUFBLENBQU0sQ0FBTixDQUFRLENBQUMsb0JBQVQsQ0FBOEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx5QkFBVCxDQUFtQztBQUFBLFFBQUMsV0FBQSxTQUFEO09BQW5DLENBQTlCLEVBRFc7SUFBQSxDQUZiLENBQUE7O3FCQUFBOztLQURzQixLQWhGeEIsQ0FBQTs7QUFBQSxFQXNGTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztzQkFBQTs7S0FEdUIsVUF0RnpCLENBQUE7O0FBQUEsRUF5Rk07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7MEJBQUE7O0tBRDJCLFVBekY3QixDQUFBOztBQUFBLEVBOEZNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSx3QkFDQSxVQUFBLEdBQVksUUFEWixDQUFBOztBQUFBLHdCQUVBLFdBQUEsR0FBYSxTQUFDLENBQUQsRUFBSSxTQUFKLEdBQUE7YUFDWCxLQUFBLENBQU0sQ0FBTixDQUFRLENBQUMsb0JBQVQsQ0FBOEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx5QkFBVCxDQUFtQztBQUFBLFFBQUMsV0FBQSxTQUFEO09BQW5DLENBQTlCLEVBRFc7SUFBQSxDQUZiLENBQUE7O3FCQUFBOztLQURzQixLQTlGeEIsQ0FBQTs7QUFBQSxFQW9HTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztzQkFBQTs7S0FEdUIsVUFwR3pCLENBQUE7O0FBQUEsRUF1R007QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7MEJBQUE7O0tBRDJCLFVBdkc3QixDQUFBOztBQUFBLEVBMkdNO0FBQ0osUUFBQSxVQUFBOztBQUFBLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsbUJBQ0EsYUFBQSxHQUFlLEtBRGYsQ0FBQTs7QUFBQSxtQkFFQSxrQkFBQSxHQUFvQixLQUZwQixDQUFBOztBQUFBLG1CQUdBLFFBQUEsR0FBVSxJQUhWLENBQUE7O0FBQUEsbUJBSUEsSUFBQSxHQUFNLElBSk4sQ0FBQTs7QUFBQSxtQkFPQSxZQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sU0FBUCxFQUFrQixLQUFsQixHQUFBO0FBQ1osVUFBQSxtQkFBQTtBQUFBLE1BQUMsa0JBQUQsRUFBVyxtQkFBWCxDQUFBO0FBQ0EsTUFBQSxJQUFHLFFBQUEsS0FBWSxTQUFmO2VBQ0UsSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQXhCLEVBQStCLFFBQS9CLEVBREY7T0FBQSxNQUFBO2VBR0UsQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUFrQixDQUFBLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixDQUFBLEVBSHBCO09BRlk7SUFBQSxDQVBkLENBQUE7O0FBQUEsbUJBY0Esc0JBQUEsR0FBd0IsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ3RCLFVBQUEsYUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLGNBQUEsQ0FBZSxJQUFDLENBQUEsTUFBaEIsRUFBd0IsS0FBSyxDQUFDLEdBQTlCLENBQVAsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLE1BQUEsQ0FBRyxVQUFBLEdBQU8sQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLElBQWYsQ0FBRCxDQUFWLENBRFYsQ0FBQTthQUVBLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FBa0IsQ0FBQyxTQUFBLENBQVUsSUFBVixFQUFnQixPQUFoQixDQUFBLEdBQTJCLENBQTVCLEVBSEk7SUFBQSxDQWR4QixDQUFBOztBQUFBLElBb0JBLFVBQUEsR0FBYSxJQXBCYixDQUFBOztBQUFBLG1CQXFCQSxvQkFBQSxHQUFzQixTQUFDLEtBQUQsR0FBQTtBQUNwQixVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBQSxDQUFuQyxDQUFSLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEtBQTdCLENBQUEsS0FBdUMsV0FGbkI7SUFBQSxDQXJCdEIsQ0FBQTs7QUFBQSxtQkEwQkEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLE9BQVAsR0FBQTtBQUNSLFVBQUEsNEZBQUE7QUFBQSxNQUFDLGVBQUEsSUFBRCxFQUFPLGdCQUFBLEtBQVAsRUFBYyx3QkFBQSxhQUFkLEVBQTZCLG1CQUFBLFFBQTdCLENBQUE7QUFDQSxjQUFPLEtBQVA7QUFBQSxhQUNPLE1BRFA7QUFFSSxVQUFBLFFBQUEsR0FBVyw0QkFBWCxDQUFBO0FBQUEsVUFDQSxTQUFBLEdBQVksK0JBQUEsQ0FBZ0MsSUFBaEMsQ0FEWixDQUZKO0FBQ087QUFEUCxhQUlPLE9BSlA7QUFLSSxVQUFBLFFBQUEsR0FBVyxtQkFBWCxDQUFBO0FBQUEsVUFDQSxTQUFBLEdBQVkseUJBQUEsQ0FBMEIsSUFBMUIsQ0FEWixDQUxKO0FBQUEsT0FEQTtBQUFBLE1BUUEsVUFBQSxHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQyxDQUFDLFlBQVgsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixHQUE5QixDQVJiLENBQUE7QUFBQSxNQVNBLE9BQUEsR0FBVSxNQUFBLENBQUEsRUFBQSxHQUFLLFVBQUwsRUFBbUIsR0FBbkIsQ0FUVixDQUFBO0FBQUEsTUFXQSxLQUFBLEdBQVEsSUFYUixDQUFBO0FBQUEsTUFZQSxLQUFBLEdBQVE7QUFBQSxRQUFDLElBQUEsRUFBTSxFQUFQO0FBQUEsUUFBVyxLQUFBLEVBQU8sRUFBbEI7T0FaUixDQUFBO0FBQUEsTUFjQSxJQUFDLENBQUEsTUFBTyxDQUFBLFFBQUEsQ0FBUixDQUFrQixPQUFsQixFQUEyQixTQUEzQixFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDcEMsY0FBQSx1RUFBQTtBQUFBLFVBRHNDLGlCQUFBLFdBQVcsYUFBQSxPQUFPLFlBQUEsSUFDeEQsQ0FBQTtBQUFBLFVBQUMsY0FBQSxLQUFELEVBQVEsWUFBQSxHQUFSLENBQUE7QUFDQSxVQUFBLElBQWlCLENBQUMsQ0FBQSxhQUFELENBQUEsSUFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBTCxLQUFjLEtBQUssQ0FBQyxHQUFyQixDQUF6QztBQUFBLG1CQUFPLElBQUEsQ0FBQSxDQUFQLENBQUE7V0FEQTtBQUVBLFVBQUEsSUFBVSxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsS0FBdEIsQ0FBVjtBQUFBLGtCQUFBLENBQUE7V0FGQTtBQUFBLFVBSUEsU0FBQSxHQUFZLEtBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxFQUFvQixTQUFwQixFQUErQixLQUEvQixDQUpaLENBQUE7QUFBQSxVQUtBLGFBQUEsR0FBbUIsU0FBQSxLQUFhLE1BQWhCLEdBQTRCLE9BQTVCLEdBQXlDLE1BTHpELENBQUE7QUFNQSxVQUFBLElBQUcsU0FBQSxLQUFhLEtBQWhCO0FBQ0UsWUFBQSxTQUFBLEdBQVksS0FBTSxDQUFBLGFBQUEsQ0FBYyxDQUFDLEdBQXJCLENBQUEsQ0FBWixDQURGO1dBQUEsTUFBQTtBQUdFLFlBQUEsS0FBTSxDQUFBLFNBQUEsQ0FBVSxDQUFDLElBQWpCLENBQXNCLEtBQXRCLENBQUEsQ0FIRjtXQU5BO0FBV0EsVUFBQSxJQUFHLENBQUMsU0FBQSxLQUFhLEtBQWQsQ0FBQSxJQUF5QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBWCxLQUFxQixDQUF0QixDQUF6QixJQUFzRCxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixLQUFzQixDQUF2QixDQUF6RDtBQUNFLFlBQUEsSUFBRyxRQUFBLElBQWEsbUJBQWIsSUFBNEIsQ0FBQyxLQUFBLEtBQVMsT0FBVixDQUEvQjtBQUNFLGNBQUEsSUFBQSxDQUFBLElBQWtCLEtBQUEsQ0FBTSxTQUFTLENBQUMsS0FBaEIsRUFBdUIsS0FBSyxDQUFDLEdBQTdCLENBQWlDLENBQUMsYUFBbEMsQ0FBZ0QsSUFBaEQsQ0FBbEI7QUFBQSxzQkFBQSxDQUFBO2VBREY7YUFBQTtBQUFBLFlBRUEsS0FBQSxHQUFRLEtBRlIsQ0FBQTtBQUdBLG1CQUFPLElBQUEsQ0FBQSxDQUFQLENBSkY7V0Fab0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QyxDQWRBLENBQUE7YUErQkEsTUFoQ1E7SUFBQSxDQTFCVixDQUFBOztBQUFBLG1CQTREQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ1IsTUFBQSxPQUFPLENBQUMsS0FBUixHQUFnQixNQUFoQixDQUFBOztRQUNBLE9BQU8sQ0FBQyxnQkFBaUIsSUFBQyxDQUFBO09BRDFCO2FBRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQWdCLE9BQWhCLEVBSFE7SUFBQSxDQTVEVixDQUFBOztBQUFBLG1CQWlFQSxTQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ1QsTUFBQSxPQUFPLENBQUMsS0FBUixHQUFnQixPQUFoQixDQUFBOztRQUNBLE9BQU8sQ0FBQyxnQkFBaUIsSUFBQyxDQUFBO09BRDFCO2FBRUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQWdCLE9BQWhCLEVBSFM7SUFBQSxDQWpFWCxDQUFBOztBQUFBLG1CQXNFQSxXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLFFBQWIsR0FBQTtBQUNYLFVBQUEsNkZBQUE7QUFBQSxNQUFBLFFBQUEsR0FBVyxJQUFYLENBQUE7QUFBQSxNQUVBLFVBQUEsR0FBYSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUI7QUFBQSxRQUFDLElBQUEsRUFBTSxJQUFQO0FBQUEsUUFBYSxVQUFBLFFBQWI7T0FBakIsQ0FGYixDQUFBO0FBR0EsTUFBQSxJQUFzRCxrQkFBdEQ7QUFBQSxRQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQVYsRUFBZ0I7QUFBQSxVQUFDLElBQUEsRUFBTSxVQUFVLENBQUMsR0FBbEI7U0FBaEIsQ0FBWixDQUFBO09BSEE7QUFLQSxNQUFBLElBQUcsbUJBQUEsSUFBZSxvQkFBbEI7QUFDRSxRQUFBLE1BQUEsR0FBYSxJQUFBLEtBQUEsQ0FBTSxTQUFTLENBQUMsS0FBaEIsRUFBdUIsVUFBVSxDQUFDLEdBQWxDLENBQWIsQ0FBQTtBQUFBLFFBQ0EsUUFBeUIsQ0FBQyxTQUFTLENBQUMsR0FBWCxFQUFnQixVQUFVLENBQUMsS0FBM0IsQ0FBekIsRUFBQyxxQkFBRCxFQUFhLG1CQURiLENBQUE7QUFFQSxRQUFBLElBQXdDLGtCQUFBLENBQW1CLElBQUMsQ0FBQSxNQUFwQixFQUE0QixVQUE1QixDQUF4QztBQUFBLFVBQUEsVUFBQSxHQUFhLENBQUMsVUFBVSxDQUFDLEdBQVgsR0FBaUIsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBYixDQUFBO1NBRkE7QUFHQSxRQUFBLElBQWdDLGNBQUEsQ0FBZSxJQUFDLENBQUEsTUFBaEIsRUFBd0IsUUFBeEIsQ0FBaUMsQ0FBQyxLQUFsQyxDQUF3QyxPQUF4QyxDQUFoQztBQUFBLFVBQUEsUUFBQSxHQUFXLENBQUMsUUFBUSxDQUFDLEdBQVYsRUFBZSxDQUFmLENBQVgsQ0FBQTtTQUhBO0FBQUEsUUFJQSxVQUFBLEdBQWlCLElBQUEsS0FBQSxDQUFNLFVBQU4sRUFBa0IsUUFBbEIsQ0FKakIsQ0FBQTtBQUFBLFFBS0EsV0FBQSxHQUFpQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQUgsR0FBbUIsVUFBbkIsR0FBbUMsTUFMakQsQ0FBQTtBQUFBLFFBTUEsUUFBQSxHQUFXO0FBQUEsVUFBQyxXQUFBLFNBQUQ7QUFBQSxVQUFZLFlBQUEsVUFBWjtBQUFBLFVBQXdCLFFBQUEsTUFBeEI7QUFBQSxVQUFnQyxZQUFBLFVBQWhDO0FBQUEsVUFBNEMsYUFBQSxXQUE1QztTQU5YLENBREY7T0FMQTthQWFBLFNBZFc7SUFBQSxDQXRFYixDQUFBOztBQUFBLG1CQXNGQSxRQUFBLEdBQVUsU0FBQyxTQUFELEVBQVksSUFBWixHQUFBO0FBQ1IsVUFBQSx1Q0FBQTtBQUFBLE1BRHFCLDJCQUFELE9BQVcsSUFBVixRQUNyQixDQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBaEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLFNBQVMsQ0FBQyxxQkFBVixDQUFBLENBRFAsQ0FBQTtBQUlBLE1BQUEsSUFBSSxDQUFBLFNBQWEsQ0FBQyxPQUFWLENBQUEsQ0FBSixJQUE0QixDQUFBLFNBQWEsQ0FBQyxVQUFWLENBQUEsQ0FBcEM7QUFDRSxRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBTCxDQUFlLENBQUMsQ0FBRCxFQUFJLENBQUEsQ0FBSixDQUFmLENBQVAsQ0FERjtPQUpBO0FBQUEsTUFPQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBQW1CLElBQUMsQ0FBQSxJQUFwQixFQUEwQixRQUExQixDQVBYLENBQUE7QUFTQSxNQUFBLHVCQUFHLFFBQVEsQ0FBRSxXQUFXLENBQUMsT0FBdEIsQ0FBOEIsYUFBOUIsVUFBSDtBQUNFLFFBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQXBCLENBQThCLENBQUMsQ0FBRCxFQUFJLENBQUEsQ0FBSixDQUE5QixDQUFQLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFBbUIsSUFBQyxDQUFBLElBQXBCLEVBQTBCLFFBQTFCLENBRFgsQ0FERjtPQVRBO2dDQVlBLFFBQVEsQ0FBRSxxQkFiRjtJQUFBLENBdEZWLENBQUE7O0FBQUEsbUJBcUdBLGdCQUFBLEdBQWtCLFNBQUMsU0FBRCxHQUFBO2FBQ2hCLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsb0JBQWpCLENBQXNDLElBQUMsQ0FBQSxRQUFELENBQVUsU0FBVixFQUFxQjtBQUFBLFFBQUUsVUFBRCxJQUFDLENBQUEsUUFBRjtPQUFyQixDQUF0QyxFQURnQjtJQUFBLENBckdsQixDQUFBOztnQkFBQTs7S0FEaUIsV0EzR25CLENBQUE7O0FBQUEsRUFxTk07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHNCQUNBLE1BQUEsR0FBUSxDQUNOLGFBRE0sRUFDUyxhQURULEVBQ3dCLFVBRHhCLEVBRU4sY0FGTSxFQUVVLGNBRlYsRUFFMEIsS0FGMUIsRUFFaUMsZUFGakMsRUFFa0QsYUFGbEQsQ0FEUixDQUFBOztBQUFBLHNCQU1BLFVBQUEsR0FBWSxTQUFDLEtBQUQsRUFBUSxTQUFSLEdBQUE7YUFDVixJQUFDLENBQUEsS0FBQSxDQUFELENBQUssS0FBTCxFQUFZO0FBQUEsUUFBRSxPQUFELElBQUMsQ0FBQSxLQUFGO09BQVosQ0FBcUIsQ0FBQyxRQUF0QixDQUErQixTQUEvQixFQUEwQztBQUFBLFFBQUUsVUFBRCxJQUFDLENBQUEsUUFBRjtPQUExQyxFQURVO0lBQUEsQ0FOWixDQUFBOztBQUFBLHNCQVNBLFNBQUEsR0FBVyxTQUFDLFNBQUQsR0FBQTtBQUNULFVBQUEsdUNBQUE7QUFBQztBQUFBO1dBQUEsNENBQUE7MEJBQUE7WUFBZ0MsQ0FBQyxLQUFBLEdBQVEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaLEVBQW1CLFNBQW5CLENBQVQ7QUFBaEMsd0JBQUEsTUFBQTtTQUFBO0FBQUE7c0JBRFE7SUFBQSxDQVRYLENBQUE7O0FBQUEsc0JBWUEsZUFBQSxHQUFpQixTQUFDLFNBQUQsR0FBQTtBQUNmLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBWCxDQUFULENBQUE7QUFDQSxNQUFBLElBQThCLE1BQU0sQ0FBQyxNQUFyQztlQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sVUFBQSxDQUFXLE1BQVgsQ0FBUCxFQUFBO09BRmU7SUFBQSxDQVpqQixDQUFBOztBQUFBLHNCQWdCQSxnQkFBQSxHQUFrQixTQUFDLFNBQUQsR0FBQTthQUNoQixLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxJQUFDLENBQUEsZUFBRCxDQUFpQixTQUFqQixDQUF0QyxFQURnQjtJQUFBLENBaEJsQixDQUFBOzttQkFBQTs7S0FEb0IsS0FyTnRCLENBQUE7O0FBQUEsRUF5T007QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7b0JBQUE7O0tBRHFCLFFBek92QixDQUFBOztBQUFBLEVBNE9NO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3dCQUFBOztLQUR5QixRQTVPM0IsQ0FBQTs7QUFBQSxFQWdQTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsdUJBQ0EsUUFBQSxHQUFVLEtBRFYsQ0FBQTs7QUFBQSx1QkFFQSxNQUFBLEdBQVEsQ0FBQyxhQUFELEVBQWdCLGFBQWhCLEVBQStCLFVBQS9CLENBRlIsQ0FBQTs7QUFBQSx1QkFHQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxTQUFYLENBQVQsQ0FBQTtBQUVBLE1BQUEsSUFBa0QsTUFBTSxDQUFDLE1BQXpEO2VBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQsRUFBaUIsU0FBQyxDQUFELEdBQUE7aUJBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFiO1FBQUEsQ0FBakIsQ0FBUixFQUFBO09BSGU7SUFBQSxDQUhqQixDQUFBOztvQkFBQTs7S0FEcUIsUUFoUHZCLENBQUE7O0FBQUEsRUF5UE07QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7cUJBQUE7O0tBRHNCLFNBelB4QixDQUFBOztBQUFBLEVBNFBNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3lCQUFBOztLQUQwQixTQTVQNUIsQ0FBQTs7QUFBQSxFQWdRTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsMEJBQ0EsSUFBQSxHQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FETixDQUFBOztBQUFBLDBCQUVBLFFBQUEsR0FBVSxLQUZWLENBQUE7O3VCQUFBOztLQUR3QixLQWhRMUIsQ0FBQTs7QUFBQSxFQXFRTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt3QkFBQTs7S0FEeUIsWUFyUTNCLENBQUE7O0FBQUEsRUF3UU07QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzRCQUFBOztLQUQ2QixZQXhRL0IsQ0FBQTs7QUFBQSxFQTRRTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsMEJBQ0EsSUFBQSxHQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FETixDQUFBOztBQUFBLDBCQUVBLFFBQUEsR0FBVSxLQUZWLENBQUE7O3VCQUFBOztLQUR3QixLQTVRMUIsQ0FBQTs7QUFBQSxFQWlSTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt3QkFBQTs7S0FEeUIsWUFqUjNCLENBQUE7O0FBQUEsRUFvUk07QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzRCQUFBOztLQUQ2QixZQXBSL0IsQ0FBQTs7QUFBQSxFQXdSTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsdUJBQ0EsSUFBQSxHQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FETixDQUFBOztBQUFBLHVCQUVBLFFBQUEsR0FBVSxLQUZWLENBQUE7O29CQUFBOztLQURxQixLQXhSdkIsQ0FBQTs7QUFBQSxFQTZSTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztxQkFBQTs7S0FEc0IsU0E3UnhCLENBQUE7O0FBQUEsRUFnU007QUFDSixvQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7eUJBQUE7O0tBRDBCLFNBaFM1QixDQUFBOztBQUFBLEVBb1NNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSwyQkFDQSxJQUFBLEdBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUROLENBQUE7O0FBQUEsMkJBRUEsYUFBQSxHQUFlLElBRmYsQ0FBQTs7d0JBQUE7O0tBRHlCLEtBcFMzQixDQUFBOztBQUFBLEVBeVNNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3lCQUFBOztLQUQwQixhQXpTNUIsQ0FBQTs7QUFBQSxFQTRTTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGlCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7NkJBQUE7O0tBRDhCLGFBNVNoQyxDQUFBOztBQUFBLEVBZ1RNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSw0QkFDQSxJQUFBLEdBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUROLENBQUE7O0FBQUEsNEJBRUEsYUFBQSxHQUFlLElBRmYsQ0FBQTs7eUJBQUE7O0tBRDBCLEtBaFQ1QixDQUFBOztBQUFBLEVBcVRNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzBCQUFBOztLQUQyQixjQXJUN0IsQ0FBQTs7QUFBQSxFQXdUTTtBQUNKLHlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGtCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7OEJBQUE7O0tBRCtCLGNBeFRqQyxDQUFBOztBQUFBLEVBNFRNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsV0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSwwQkFDQSxJQUFBLEdBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUROLENBQUE7O0FBQUEsMEJBRUEsYUFBQSxHQUFlLElBRmYsQ0FBQTs7dUJBQUE7O0tBRHdCLEtBNVQxQixDQUFBOztBQUFBLEVBaVVNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3dCQUFBOztLQUR5QixZQWpVM0IsQ0FBQTs7QUFBQSxFQW9VTTtBQUNKLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7NEJBQUE7O0tBRDZCLFlBcFUvQixDQUFBOztBQUFBLEVBd1VNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSwyQkFDQSxJQUFBLEdBQU0sQ0FBQyxHQUFELEVBQU0sR0FBTixDQUROLENBQUE7O3dCQUFBOztLQUR5QixLQXhVM0IsQ0FBQTs7QUFBQSxFQTRVTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt5QkFBQTs7S0FEMEIsYUE1VTVCLENBQUE7O0FBQUEsRUErVU07QUFDSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxpQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzZCQUFBOztLQUQ4QixhQS9VaEMsQ0FBQTs7QUFBQSxFQW9WTTtBQUNKLDBCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLEdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsa0JBQ0EsSUFBQSxHQUFNLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FETixDQUFBOztlQUFBOztLQURnQixLQXBWbEIsQ0FBQTs7QUFBQSxFQTJWTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztvQkFBQTs7S0FEcUIsSUEzVnZCLENBQUE7O0FBQUEsRUFpV007QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHdCQUVBLFdBQUEsR0FBYSxTQUFDLFFBQUQsRUFBVyxFQUFYLEdBQUE7QUFDWCxVQUFBLE9BQUE7QUFBQSxXQUFXLHlGQUFYLEdBQUE7WUFBOEIsRUFBQSxDQUFHLEdBQUg7QUFDNUIsaUJBQU8sR0FBQSxHQUFNLENBQWI7U0FERjtBQUFBLE9BQUE7YUFFQSxFQUhXO0lBQUEsQ0FGYixDQUFBOztBQUFBLHdCQU9BLFNBQUEsR0FBVyxTQUFDLFFBQUQsRUFBVyxFQUFYLEdBQUE7QUFDVCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQVYsQ0FBQTtBQUNBLFdBQVcsaUhBQVgsR0FBQTtZQUFvQyxFQUFBLENBQUcsR0FBSDtBQUNsQyxpQkFBTyxHQUFBLEdBQU0sQ0FBYjtTQURGO0FBQUEsT0FEQTthQUdBLFFBSlM7SUFBQSxDQVBYLENBQUE7O0FBQUEsd0JBYUEsUUFBQSxHQUFVLFNBQUMsUUFBRCxHQUFBO0FBQ1IsVUFBQSxtQkFBQTtBQUFBLE1BQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLFFBQXpCLENBQWxCLENBQUE7QUFBQSxNQUNBLEVBQUEsR0FBSyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxHQUFELEdBQUE7aUJBQ0gsS0FBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixHQUF6QixDQUFBLEtBQW1DLGdCQURoQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBREwsQ0FBQTthQUdJLElBQUEsS0FBQSxDQUFNLENBQUMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiLEVBQXVCLEVBQXZCLENBQUQsRUFBNkIsQ0FBN0IsQ0FBTixFQUF1QyxDQUFDLElBQUMsQ0FBQSxTQUFELENBQVcsUUFBWCxFQUFxQixFQUFyQixDQUFBLEdBQTJCLENBQTVCLEVBQStCLENBQS9CLENBQXZDLEVBSkk7SUFBQSxDQWJWLENBQUE7O0FBQUEsd0JBbUJBLGVBQUEsR0FBaUIsU0FBQyxTQUFELEdBQUE7QUFDZixVQUFBLDRDQUFBO0FBQUEsTUFBQSxRQUFxQixTQUFTLENBQUMsaUJBQVYsQ0FBQSxDQUFyQixFQUFDLG1CQUFELEVBQVcsaUJBQVgsQ0FBQTtBQUNBLE1BQUEsSUFBRyxLQUFBLENBQU0sU0FBTixDQUFnQixDQUFDLFdBQWpCLENBQUEsQ0FBSDtlQUNFLEtBQUEsQ0FBTSxTQUFOLENBQWdCLENBQUMsb0JBQWpCLENBQXNDLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVixDQUF0QyxFQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsS0FBQSxHQUFXLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBSCxHQUNOLENBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLFFBQUEsR0FBVyxDQUF2QixDQUFYLG1EQUNtQixDQUFFLGNBRHJCLENBRE0sc0RBSWUsQ0FBRSxZQUp6QixDQUFBO0FBS0EsUUFBQSxJQUEwQyxhQUExQztpQkFBQSxTQUFTLENBQUMsc0JBQVYsQ0FBaUMsS0FBakMsRUFBQTtTQVJGO09BRmU7SUFBQSxDQW5CakIsQ0FBQTs7QUFBQSx3QkErQkEsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEdBQUE7YUFDaEIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQVIsRUFBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNuQixVQUFBLEtBQUMsQ0FBQSxlQUFELENBQWlCLFNBQWpCLENBQUEsQ0FBQTtBQUNBLFVBQUEsSUFBK0IsS0FBQyxDQUFBLFlBQUEsQ0FBRCxDQUFZLFlBQVosQ0FBL0I7bUJBQUEsS0FBQyxDQUFBLGVBQUQsQ0FBaUIsU0FBakIsRUFBQTtXQUZtQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLEVBRGdCO0lBQUEsQ0EvQmxCLENBQUE7O3FCQUFBOztLQURzQixXQWpXeEIsQ0FBQTs7QUFBQSxFQXNZTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztzQkFBQTs7S0FEdUIsVUF0WXpCLENBQUE7O0FBQUEsRUF5WU07QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7MEJBQUE7O0tBRDJCLFVBelk3QixDQUFBOztBQUFBLEVBNllNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsT0FBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSxzQkFFQSxRQUFBLEdBQVUsU0FBQyxRQUFELEdBQUE7QUFDUixVQUFBLEVBQUE7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUFlLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLFFBQTdCLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsRUFBQSxHQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUNILGNBQUEsS0FBQTtBQUFBLFVBQUEsSUFBVyxDQUFBLEtBQUssQ0FBQSxPQUFELENBQUEsQ0FBSixJQUFtQixLQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLEdBQXpCLENBQTlCO0FBQUEsa0JBQUEsQ0FBQTtXQUFBOzBCQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsR0FBN0IsRUFBQSxLQUFzQyxLQUF0QyxJQUFBLEtBQUEsS0FBNkMsU0FGMUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURMLENBQUE7YUFJSSxJQUFBLEtBQUEsQ0FBTSxDQUFDLElBQUMsQ0FBQSxXQUFELENBQWEsUUFBYixFQUF1QixFQUF2QixDQUFELEVBQTZCLENBQTdCLENBQU4sRUFBdUMsQ0FBQyxJQUFDLENBQUEsU0FBRCxDQUFXLFFBQVgsRUFBcUIsRUFBckIsQ0FBQSxHQUEyQixDQUE1QixFQUErQixDQUEvQixDQUF2QyxFQUxJO0lBQUEsQ0FGVixDQUFBOzttQkFBQTs7S0FEb0IsVUE3WXRCLENBQUE7O0FBQUEsRUF1Wk07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7b0JBQUE7O0tBRHFCLFFBdlp2QixDQUFBOztBQUFBLEVBMFpNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3dCQUFBOztLQUR5QixRQTFaM0IsQ0FBQTs7QUFBQSxFQThaTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsMEJBRUEsUUFBQSxHQUFVLFNBQUMsUUFBRCxHQUFBO0FBQ1IsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLFFBQXpCLENBQVY7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUFBLE1BQ0EsZUFBQSxHQUFrQiwwQkFBQSxDQUEyQixJQUFDLENBQUEsTUFBNUIsRUFBb0MsUUFBcEMsQ0FEbEIsQ0FBQTtBQUFBLE1BRUEsRUFBQSxHQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUNILFVBQUEsSUFBRyxLQUFDLENBQUEsTUFBTSxDQUFDLGdCQUFSLENBQXlCLEdBQXpCLENBQUg7bUJBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQURGO1dBQUEsTUFBQTttQkFHRSwwQkFBQSxDQUEyQixLQUFDLENBQUEsTUFBNUIsRUFBb0MsR0FBcEMsQ0FBQSxHQUEyQyxnQkFIN0M7V0FERztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRkwsQ0FBQTthQU9JLElBQUEsS0FBQSxDQUFNLENBQUMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiLEVBQXVCLEVBQXZCLENBQUQsRUFBNkIsQ0FBN0IsQ0FBTixFQUF1QyxDQUFDLElBQUMsQ0FBQSxTQUFELENBQVcsUUFBWCxFQUFxQixFQUFyQixDQUFBLEdBQTJCLENBQTVCLEVBQStCLENBQS9CLENBQXZDLEVBUkk7SUFBQSxDQUZWLENBQUE7O3VCQUFBOztLQUR3QixVQTlaMUIsQ0FBQTs7QUFBQSxFQTJhTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt3QkFBQTs7S0FEeUIsWUEzYTNCLENBQUE7O0FBQUEsRUE4YU07QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7OzRCQUFBOztLQUQ2QixZQTlhL0IsQ0FBQTs7QUFBQSxFQWtiTTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFELENBQVEsS0FBUixDQUFBLENBQUE7O0FBQUEsbUJBRUEsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLFVBQUEsd0RBQUE7QUFBQSxNQURnQixvQkFBVSxnQkFDMUIsQ0FBQTtBQUFBLE1BQUEsSUFBQSxDQUFBLElBQWtDLENBQUEsT0FBRCxDQUFBLENBQWpDO0FBQUEsZUFBTyxDQUFDLFFBQUQsRUFBVyxNQUFYLENBQVAsQ0FBQTtPQUFBO0FBQUEsTUFDQSxtQkFBQSxHQUFzQiwwQkFBQSxDQUEyQixJQUFDLENBQUEsTUFBNUIsRUFBb0MsUUFBcEMsQ0FEdEIsQ0FBQTtBQUFBLE1BRUEsaUJBQUEsR0FBb0IsMEJBQUEsQ0FBMkIsSUFBQyxDQUFBLE1BQTVCLEVBQW9DLE1BQXBDLENBRnBCLENBQUE7QUFHQSxNQUFBLElBQWdCLG1CQUFBLEtBQXVCLGlCQUF2QztBQUFBLFFBQUEsTUFBQSxJQUFVLENBQVYsQ0FBQTtPQUhBO0FBQUEsTUFJQSxRQUFBLElBQVksQ0FKWixDQUFBO2FBS0EsQ0FBQyxRQUFELEVBQVcsTUFBWCxFQU5jO0lBQUEsQ0FGaEIsQ0FBQTs7QUFBQSxtQkFVQSw4QkFBQSxHQUFnQyxTQUFDLEdBQUQsR0FBQTtBQUM5QixVQUFBLEtBQUE7a0dBQXVELENBQUUsT0FBekQsQ0FBQSxXQUQ4QjtJQUFBLENBVmhDLENBQUE7O0FBQUEsbUJBYUEsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEdBQUE7QUFDaEIsVUFBQSx1Q0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLDhCQUFELENBQWdDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBNUMsQ0FEWixDQUFBO0FBRUEsTUFBQSxJQUFjLGlCQUFkO0FBQUEsY0FBQSxDQUFBO09BRkE7QUFJQSxNQUFBLElBQUcsc0NBQUg7QUFDRSxRQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsY0FBRCxDQUFnQixRQUFoQixDQUFYLENBQUE7QUFBQSxRQUNBLFdBQUEsR0FBYyx5QkFBQSxDQUEwQixJQUFDLENBQUEsTUFBM0IsRUFBbUMsUUFBbkMsQ0FEZCxDQUFBO0FBRUEsUUFBQSxJQUFHLFdBQVcsQ0FBQyxPQUFaLENBQW9CLEtBQXBCLENBQUEsSUFBK0IsU0FBUyxDQUFDLE1BQTVDO0FBQ0UsVUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsU0FBUyxDQUFDLEtBQVYsQ0FBQSxDQUFoQixDQUFYLENBREY7U0FIRjtPQUpBO0FBU0EsTUFBQSxJQUFHLGdCQUFIO2VBQ0UsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxjQUFqQixDQUFnQyxRQUFoQyxFQURGO09BVmdCO0lBQUEsQ0FibEIsQ0FBQTs7Z0JBQUE7O0tBRGlCLFdBbGJuQixDQUFBOztBQUFBLEVBNmNNO0FBQ0osNEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O2lCQUFBOztLQURrQixLQTdjcEIsQ0FBQTs7QUFBQSxFQWdkTTtBQUNKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOztxQkFBQTs7S0FEc0IsS0FoZHhCLENBQUE7O0FBQUEsRUFxZE07QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLHVCQUdBLDRCQUFBLEdBQThCLENBQUMsSUFBRCxDQUg5QixDQUFBOztBQUFBLHVCQUtBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBLENBQW9CLENBQUMsU0FBUyxDQUFDLE9BQS9CLENBQXVDLFdBQXZDLEVBQW9ELEVBQXBELEVBREY7SUFBQSxDQUxaLENBQUE7O0FBQUEsdUJBUUEsOEJBQUEsR0FBZ0MsU0FBQyxHQUFELEdBQUE7QUFDOUIsVUFBQSxnQkFBQTtBQUFBLE1BQUEsU0FBQSxrRkFBNkQsQ0FBRSxPQUFuRCxDQUFBLFVBQVosQ0FBQTtpQ0FDQSxTQUFTLENBQUUsTUFBWCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQ2hCLDRCQUFBLENBQTZCLEtBQUMsQ0FBQSxNQUE5QixFQUFzQyxRQUFTLENBQUEsQ0FBQSxDQUEvQyxFQURnQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCLFdBRjhCO0lBQUEsQ0FSaEMsQ0FBQTs7QUFBQSx1QkFhQSxjQUFBLEdBQWdCLFNBQUMsUUFBRCxHQUFBO0FBQ2QsVUFBQSw4QkFBQTtBQUFBLE1BQUEsUUFBcUIsOENBQUEsU0FBQSxDQUFyQixFQUFDLG1CQUFELEVBQVcsaUJBQVgsQ0FBQTtBQUNBLE1BQUEsSUFBRyxJQUFDLENBQUEsR0FBRCxDQUFBLENBQUEsSUFBVyxTQUFDLElBQUMsQ0FBQSxRQUFELEVBQUEsZUFBYSxJQUFDLENBQUEsNEJBQWQsRUFBQSxLQUFBLE1BQUQsQ0FBZDtBQUNFLFFBQUEsTUFBQSxJQUFVLENBQVYsQ0FERjtPQURBO2FBR0EsQ0FBQyxRQUFELEVBQVcsTUFBWCxFQUpjO0lBQUEsQ0FiaEIsQ0FBQTs7b0JBQUE7O0tBRHFCLEtBcmR2QixDQUFBOztBQUFBLEVBeWVNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3FCQUFBOztLQURzQixTQXpleEIsQ0FBQTs7QUFBQSxFQTRlTTtBQUNKLG9DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGFBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzt5QkFBQTs7S0FEMEIsU0E1ZTVCLENBQUE7O0FBQUEsRUFnZk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDBCQUNBLGdCQUFBLEdBQWtCLFNBQUMsU0FBRCxHQUFBO0FBQ2hCLFVBQUEsTUFBQTtBQUFBLE1BQUMsU0FBVSxVQUFWLE1BQUQsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLHFCQUFQLENBQUEsQ0FEQSxDQUFBO0FBRUEsTUFBQSxJQUF1QyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQXZDO0FBQUEsUUFBQSxNQUFNLENBQUMsMEJBQVAsQ0FBQSxDQUFBLENBQUE7T0FGQTthQUdBLFNBQVMsQ0FBQyx1QkFBVixDQUFBLEVBSmdCO0lBQUEsQ0FEbEIsQ0FBQTs7dUJBQUE7O0tBRHdCLFdBaGYxQixDQUFBOztBQUFBLEVBd2ZNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3dCQUFBOztLQUR5QixZQXhmM0IsQ0FBQTs7QUFBQSxFQTJmTTtBQUNKLHVDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLGdCQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7NEJBQUE7O0tBRDZCLFlBM2YvQixDQUFBOztBQUFBLEVBK2ZNO0FBQ0osNkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsTUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSLENBQUEsQ0FBQTs7QUFBQSxxQkFDQSxnQkFBQSxHQUFrQixTQUFDLFNBQUQsR0FBQTthQUNoQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxFQURnQjtJQUFBLENBRGxCLENBQUE7O2tCQUFBOztLQURtQixXQS9mckIsQ0FBQTs7QUFBQSxFQW9nQk07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxPQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7bUJBQUE7O0tBRG9CLE9BcGdCdEIsQ0FBQTs7QUFBQSxFQXVnQk07QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTs7dUJBQUE7O0tBRHdCLE9BdmdCMUIsQ0FBQTs7QUFBQSxFQTJnQk07QUFDSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUFBLDJCQUNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFmLENBQXdCLEdBQXhCLEVBQTZCLEdBQTdCLEVBRFE7SUFBQSxDQURWLENBQUE7O0FBQUEsMkJBSUEsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEdBQUE7YUFDaEIsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxvQkFBakIsQ0FBc0MsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUF0QyxFQURnQjtJQUFBLENBSmxCLENBQUE7O3dCQUFBOztLQUR5QixXQTNnQjNCLENBQUE7O0FBQUEsRUFtaEJNO0FBQ0osb0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsYUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBQUE7O3lCQUFBOztLQUQwQixhQW5oQjVCLENBQUE7O0FBQUEsRUF1aEJNO0FBQ0osd0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsaUJBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBOzs2QkFBQTs7S0FEOEIsYUF2aEJoQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/text-object.coffee
