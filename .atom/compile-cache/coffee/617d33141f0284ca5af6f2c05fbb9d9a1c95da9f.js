(function() {
  var AAngleBracket, AAnyPair, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurrentLine, ADoubleQuote, AEntire, AFold, AFunction, AIndentation, ALatestChange, AParagraph, AParenthesis, ASingleQuote, ASquareBracket, AWholeWord, AWord, AngleBracket, AnyPair, AnyQuote, BackTick, Base, Comment, CurlyBracket, CurrentLine, DoubleQuote, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAnyPair, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurrentLine, InnerDoubleQuote, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerSingleQuote, InnerSquareBracket, InnerTag, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, Range, SingleQuote, SquareBracket, Tag, TextObject, WholeWord, Word, countChar, getBufferRangeForRowRange, getCodeFoldRowRangesContainesForRow, getEolBufferPositionForRow, getIndentLevelForBufferRow, getTextToPoint, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, rangeToBeginningOfFileFromPoint, rangeToEndOfFileFromPoint, sortRanges, swrap, _, _ref,
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

    TextObject.prototype.isLinewise = function() {
      return swrap.detectVisualModeSubmode(this.editor) === 'linewise';
    };

    TextObject.prototype.select = function() {
      var end, selection, start, _i, _len, _ref1, _ref2;
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        this.selectTextObject(selection);
        _ref2 = selection.getBufferRange(), start = _ref2.start, end = _ref2.end;
        if ((end.column === 0) && swrap(selection).detectVisualModeSubmode() === 'characterwise') {
          end = getEolBufferPositionForRow(this.editor, end.row - 1);
          swrap(selection).setBufferRangeSafely([start, end]);
        }
      }
      return this.emitDidSelect();
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
      this.selectInner(selection, wordRegex);
      if (this.isA()) {
        return this.selectA(selection);
      }
    };

    Word.prototype.selectInner = function(selection, wordRegex) {
      if (wordRegex == null) {
        wordRegex = null;
      }
      return selection.selectWord();
    };

    Word.prototype.selectA = function(selection) {
      var headPoint, scanRange;
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

  Pair = (function(_super) {
    var escapeChar;

    __extends(Pair, _super);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.allowNextLine = false;

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

    Function.prototype.indentScopedLanguages = ['python', 'coffee'];

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSx1akNBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUixDQUpSLENBQUE7O0FBQUEsRUFLQSxPQVFJLE9BQUEsQ0FBUSxTQUFSLENBUkosRUFDRSx1Q0FBQSwrQkFERixFQUNtQyxpQ0FBQSx5QkFEbkMsRUFFRSxrQkFBQSxVQUZGLEVBRWMsaUJBQUEsU0FGZCxFQUV5QiwwQkFBQSxrQkFGekIsRUFFNkMsa0NBQUEsMEJBRjdDLEVBR0Usc0JBQUEsY0FIRixFQUlFLGtDQUFBLDBCQUpGLEVBS0UsMkNBQUEsbUNBTEYsRUFNRSxpQ0FBQSx5QkFORixFQU9FLG9DQUFBLDRCQVpGLENBQUE7O0FBQUEsRUFlTTtBQUNKLGlDQUFBLENBQUE7O0FBQUEsSUFBQSxVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsQ0FBQSxDQUFBOztBQUVhLElBQUEsb0JBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQSxTQUFFLENBQUEsS0FBZCxHQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFsQixDQUE2QixPQUE3QixDQUF0QixDQUFBO0FBQUEsTUFDQSw2Q0FBQSxTQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBQSxT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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/text-object.coffee
