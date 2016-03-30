(function() {
  var Base, CurrentSelection, Find, FindBackwards, MatchList, Motion, MoveDown, MoveDownToEdge, MoveDownToNonBlank, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpToEdge, MoveUpToNonBlank, NullMotion, Point, RepeatFind, RepeatFindReverse, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, Till, TillBackwards, characterAtScreenPosition, cursorIsAtEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, detectScopeStartPositionByScope, flashRanges, getBufferRows, getCodeFoldRowRanges, getEolBufferPositionForCursor, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLastVisibleScreenRow, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, globalState, isAllWhiteSpace, isIncludeFunctionScopeForRow, moveCursorDown, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, pointIsAtEndOfLine, saveEditorState, settings, sortRanges, swrap, unfoldAtCursorRow, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ = require('underscore-plus');

  Point = require('atom').Point;

  globalState = require('./global-state');

  _ref = require('./utils'), saveEditorState = _ref.saveEditorState, getVisibleBufferRange = _ref.getVisibleBufferRange, moveCursorLeft = _ref.moveCursorLeft, moveCursorRight = _ref.moveCursorRight, moveCursorUp = _ref.moveCursorUp, moveCursorDown = _ref.moveCursorDown, unfoldAtCursorRow = _ref.unfoldAtCursorRow, pointIsAtEndOfLine = _ref.pointIsAtEndOfLine, cursorIsAtVimEndOfFile = _ref.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref.getLastVisibleScreenRow, getVimEofBufferPosition = _ref.getVimEofBufferPosition, getVimEofScreenPosition = _ref.getVimEofScreenPosition, getVimLastBufferRow = _ref.getVimLastBufferRow, getVimLastScreenRow = _ref.getVimLastScreenRow, getValidVimScreenRow = _ref.getValidVimScreenRow, characterAtScreenPosition = _ref.characterAtScreenPosition, flashRanges = _ref.flashRanges, moveCursorToFirstCharacterAtRow = _ref.moveCursorToFirstCharacterAtRow, sortRanges = _ref.sortRanges, getIndentLevelForBufferRow = _ref.getIndentLevelForBufferRow, getTextFromPointToEOL = _ref.getTextFromPointToEOL, isAllWhiteSpace = _ref.isAllWhiteSpace, getTextAtCursor = _ref.getTextAtCursor, getEolBufferPositionForCursor = _ref.getEolBufferPositionForCursor, cursorIsOnWhiteSpace = _ref.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref.getCodeFoldRowRanges, isIncludeFunctionScopeForRow = _ref.isIncludeFunctionScopeForRow, detectScopeStartPositionByScope = _ref.detectScopeStartPositionByScope, getTextInScreenRange = _ref.getTextInScreenRange, getBufferRows = _ref.getBufferRows;

  swrap = require('./selection-wrapper');

  MatchList = require('./match').MatchList;

  settings = require('./settings');

  Base = require('./base');

  Motion = (function(_super) {
    __extends(Motion, _super);

    Motion.extend(false);

    Motion.prototype.inclusive = false;

    Motion.prototype.linewise = false;

    Motion.prototype.options = null;

    Motion.prototype.operator = null;

    function Motion() {
      Motion.__super__.constructor.apply(this, arguments);
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

    Motion.prototype.isLinewise = function() {
      if (this.isMode('visual')) {
        return this.isMode('visual', 'linewise');
      } else {
        return this.linewise;
      }
    };

    Motion.prototype.isInclusive = function() {
      if (this.isMode('visual')) {
        return this.isMode('visual', ['characterwise', 'blockwise']);
      } else {
        return this.inclusive;
      }
    };

    Motion.prototype.execute = function() {
      return this.editor.moveCursors((function(_this) {
        return function(cursor) {
          return _this.moveCursor(cursor);
        };
      })(this));
    };

    Motion.prototype.select = function() {
      var selection, _i, _len, _ref1;
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        if (this.isInclusive() || this.isLinewise()) {
          if (this.isMode('visual')) {
            this.normalizeVisualModeCursorPosition(selection);
          }
          this.selectInclusively(selection);
          if (this.isLinewise()) {
            if (this.isMode('visual', 'linewise')) {
              swrap(selection).preserveCharacterwise();
            }
            swrap(selection).expandOverLine({
              preserveGoalColumn: true
            });
          }
        } else {
          selection.modifySelection((function(_this) {
            return function() {
              return _this.moveCursor(selection.cursor);
            };
          })(this));
        }
      }
      this.editor.mergeCursors();
      return this.editor.mergeIntersectingSelections();
    };

    Motion.prototype.selectInclusively = function(selection) {
      var cursor;
      cursor = selection.cursor;
      return selection.modifySelection((function(_this) {
        return function() {
          var allowWrap, newRange, tailRange;
          tailRange = swrap(selection).getTailBufferRange();
          _this.moveCursor(cursor);
          if (_this.isMode('visual') && cursor.isAtEndOfLine()) {
            moveCursorLeft(cursor);
          }
          if (selection.isEmpty() && (!_this.isMode('visual'))) {
            return;
          }
          if (!selection.isReversed()) {
            allowWrap = cursorIsAtEmptyRow(cursor);
            moveCursorRight(cursor, {
              allowWrap: allowWrap,
              preserveGoalColumn: true
            });
          }
          newRange = selection.getBufferRange().union(tailRange);
          return selection.setBufferRange(newRange, {
            autoscroll: false,
            preserveFolds: true
          });
        };
      })(this));
    };

    Motion.prototype.normalizeVisualModeCursorPosition = function(selection) {
      if (this.isMode('visual', 'linewise')) {
        swrap(selection).restoreCharacterwise({
          preserveGoalColumn: true
        });
      }
      if (!selection.isReversed()) {
        return selection.modifySelection(function() {
          return moveCursorLeft(selection.cursor, {
            allowWrap: true,
            preserveGoalColumn: true
          });
        });
      }
    };

    Motion.prototype.countTimes = function(fn) {
      return _.times(this.getCount(), function() {
        return fn();
      });
    };

    return Motion;

  })(Base);

  CurrentSelection = (function(_super) {
    __extends(CurrentSelection, _super);

    function CurrentSelection() {
      return CurrentSelection.__super__.constructor.apply(this, arguments);
    }

    CurrentSelection.extend(false);

    CurrentSelection.prototype.selectionExtent = null;

    CurrentSelection.prototype.execute = function() {
      throw new Error("" + this.constructor.name + " should not be executed");
    };

    CurrentSelection.prototype.select = function() {
      if (this.isMode('visual')) {
        this.selectionExtent = this.editor.getSelectedBufferRange().getExtent();
        return this.wasLinewise = this.isLinewise();
      } else {
        return this.replaySelection();
      }
    };

    CurrentSelection.prototype.replaySelection = function() {
      var end, selection, start, _i, _len, _ref1;
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        start = selection.getBufferRange().start;
        end = start.traverse(this.selectionExtent);
        selection.setBufferRange([start, end]);
      }
      if (this.wasLinewise) {
        return swrap.expandOverLine(this.editor);
      }
    };

    return CurrentSelection;

  })(Motion);

  NullMotion = (function(_super) {
    __extends(NullMotion, _super);

    function NullMotion() {
      return NullMotion.__super__.constructor.apply(this, arguments);
    }

    NullMotion.extend(false);

    NullMotion.prototype.select = function() {};

    NullMotion.prototype.execute = function() {};

    return NullMotion;

  })(Motion);

  MoveLeft = (function(_super) {
    __extends(MoveLeft, _super);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.extend();

    MoveLeft.prototype.moveCursor = function(cursor) {
      var allowWrap;
      allowWrap = settings.get('wrapLeftRightMotion');
      return this.countTimes(function() {
        return moveCursorLeft(cursor, {
          allowWrap: allowWrap
        });
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(_super) {
    __extends(MoveRight, _super);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.extend();

    MoveRight.prototype.canWrapToNextLine = function(cursor) {
      if (!this.isMode('visual') && this.isAsOperatorTarget() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return settings.get('wrapLeftRightMotion');
      }
    };

    MoveRight.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var allowWrap;
          unfoldAtCursorRow(cursor);
          allowWrap = _this.canWrapToNextLine(cursor);
          moveCursorRight(cursor);
          if (cursor.isAtEndOfLine() && allowWrap && !cursorIsAtVimEndOfFile(cursor)) {
            return moveCursorRight(cursor, {
              allowWrap: allowWrap
            });
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveUp = (function(_super) {
    __extends(MoveUp, _super);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.extend();

    MoveUp.prototype.linewise = true;

    MoveUp.prototype.amount = -1;

    MoveUp.prototype.move = function(cursor) {
      return moveCursorUp(cursor);
    };

    MoveUp.prototype.moveCursor = function(cursor) {
      var isBufferRowWise, vimLastBufferRow;
      isBufferRowWise = this.editor.isSoftWrapped() && this.isMode('visual', 'linewise');
      vimLastBufferRow = null;
      return this.countTimes((function(_this) {
        return function() {
          var column, row;
          if (isBufferRowWise) {
            if (vimLastBufferRow == null) {
              vimLastBufferRow = getVimLastBufferRow(_this.editor);
            }
            row = cursor.getBufferRow() + _this.amount;
            if (row <= vimLastBufferRow) {
              column = cursor.goalColumn || cursor.getBufferColumn();
              cursor.setBufferPosition([row, column]);
              return cursor.goalColumn = column;
            }
          } else {
            return _this.move(cursor);
          }
        };
      })(this));
    };

    return MoveUp;

  })(Motion);

  MoveDown = (function(_super) {
    __extends(MoveDown, _super);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.extend();

    MoveDown.prototype.linewise = true;

    MoveDown.prototype.amount = +1;

    MoveDown.prototype.move = function(cursor) {
      return moveCursorDown(cursor);
    };

    return MoveDown;

  })(MoveUp);

  MoveUpToNonBlank = (function(_super) {
    __extends(MoveUpToNonBlank, _super);

    function MoveUpToNonBlank() {
      return MoveUpToNonBlank.__super__.constructor.apply(this, arguments);
    }

    MoveUpToNonBlank.extend();

    MoveUpToNonBlank.prototype.linewise = true;

    MoveUpToNonBlank.prototype.direction = 'up';

    MoveUpToNonBlank.prototype.moveCursor = function(cursor) {
      var column;
      column = cursor.getScreenColumn();
      return this.countTimes((function(_this) {
        return function() {
          var newRow;
          newRow = _.detect(_this.getScanRows(cursor), function(row) {
            return _this.isMovablePoint(new Point(row, column));
          });
          if (newRow != null) {
            return cursor.setScreenPosition([newRow, column]);
          }
        };
      })(this));
    };

    MoveUpToNonBlank.prototype.getScanRows = function(cursor) {
      var cursorRow, validRow, _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      cursorRow = cursor.getScreenRow();
      validRow = getValidVimScreenRow.bind(null, this.editor);
      switch (this.direction) {
        case 'up':
          return (function() {
            _results = [];
            for (var _i = _ref1 = validRow(cursorRow - 1); _ref1 <= 0 ? _i <= 0 : _i >= 0; _ref1 <= 0 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'down':
          return (function() {
            _results1 = [];
            for (var _j = _ref2 = validRow(cursorRow + 1), _ref3 = getVimLastScreenRow(this.editor); _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; _ref2 <= _ref3 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    };

    MoveUpToNonBlank.prototype.isMovablePoint = function(point) {
      return this.isNonBlankPoint(point);
    };

    MoveUpToNonBlank.prototype.isBlankPoint = function(point) {
      var char;
      char = characterAtScreenPosition(this.editor, point);
      if (char.length > 0) {
        return /\s/.test(char);
      } else {
        return true;
      }
    };

    MoveUpToNonBlank.prototype.isNonBlankPoint = function(point) {
      return !this.isBlankPoint(point);
    };

    return MoveUpToNonBlank;

  })(Motion);

  MoveDownToNonBlank = (function(_super) {
    __extends(MoveDownToNonBlank, _super);

    function MoveDownToNonBlank() {
      return MoveDownToNonBlank.__super__.constructor.apply(this, arguments);
    }

    MoveDownToNonBlank.extend();

    MoveDownToNonBlank.prototype.direction = 'down';

    return MoveDownToNonBlank;

  })(MoveUpToNonBlank);

  MoveUpToEdge = (function(_super) {
    __extends(MoveUpToEdge, _super);

    function MoveUpToEdge() {
      return MoveUpToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveUpToEdge.extend();

    MoveUpToEdge.prototype.direction = 'up';

    MoveUpToEdge.prototype.isMovablePoint = function(point) {
      var above, below, _ref1;
      if (this.isStoppablePoint(point)) {
        if ((_ref1 = point.row) === 0 || _ref1 === getVimLastScreenRow(this.editor)) {
          return true;
        } else {
          above = point.translate([-1, 0]);
          below = point.translate([+1, 0]);
          return (!this.isStoppablePoint(above)) || (!this.isStoppablePoint(below));
        }
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isValidStoppablePoint = function(point) {
      var column, firstChar, lastChar, match, row, softTabText, text;
      row = point.row, column = point.column;
      text = getTextInScreenRange(this.editor, [[row, 0], [row, Infinity]]);
      softTabText = _.multiplyString(' ', this.editor.getTabLength());
      text = text.replace(/\t/g, softTabText);
      if ((match = text.match(/\S/g)) != null) {
        firstChar = match[0], lastChar = match[match.length - 1];
        return (text.indexOf(firstChar) <= column && column <= text.lastIndexOf(lastChar));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppablePoint = function(point) {
      var left, right;
      if (this.isNonBlankPoint(point)) {
        return true;
      } else if (this.isValidStoppablePoint(point)) {
        left = point.translate([0, -1]);
        right = point.translate([0, +1]);
        return this.isNonBlankPoint(left) && this.isNonBlankPoint(right);
      } else {
        return false;
      }
    };

    return MoveUpToEdge;

  })(MoveUpToNonBlank);

  MoveDownToEdge = (function(_super) {
    __extends(MoveDownToEdge, _super);

    function MoveDownToEdge() {
      return MoveDownToEdge.__super__.constructor.apply(this, arguments);
    }

    MoveDownToEdge.extend();

    MoveDownToEdge.prototype.direction = 'down';

    return MoveDownToEdge;

  })(MoveUpToEdge);

  MoveToPreviousWord = (function(_super) {
    __extends(MoveToPreviousWord, _super);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.extend();

    MoveToPreviousWord.prototype.wordRegex = null;

    MoveToPreviousWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var point;
          point = cursor.getBeginningOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          return cursor.setBufferPosition(point);
        };
      })(this));
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToPreviousWholeWord = (function(_super) {
    __extends(MoveToPreviousWholeWord, _super);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.extend();

    MoveToPreviousWholeWord.prototype.wordRegex = /^\s*$|\S+/;

    return MoveToPreviousWholeWord;

  })(MoveToPreviousWord);

  MoveToNextWord = (function(_super) {
    __extends(MoveToNextWord, _super);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.extend();

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.getPoint = function(cursor, options) {
      var point;
      point = cursor.getBeginningOfNextWordBufferPosition(options);
      if (cursor.getBufferPosition().isEqual(point) || (point.row > getVimLastBufferRow(this.editor))) {
        point = cursor.getEndOfCurrentWordBufferPosition(options);
      }
      return point;
    };

    MoveToNextWord.prototype.getPointForChange = function(cursor, _arg) {
      var allowNextLine, point, wordRegex;
      wordRegex = _arg.wordRegex, allowNextLine = _arg.allowNextLine;
      if (cursorIsOnWhiteSpace(cursor)) {
        point = cursor.getBeginningOfNextWordBufferPosition({
          wordRegex: wordRegex
        });
        if (!allowNextLine) {
          point = Point.min(point, getEolBufferPositionForCursor(cursor));
        }
        return point;
      } else {
        return cursor.getEndOfCurrentWordBufferPosition();
      }
    };

    MoveToNextWord.prototype.textToEndOfLineIsAllWhiteSpace = function(cursor) {
      var textToEOL;
      textToEOL = getTextFromPointToEOL(this.editor, cursor.getBufferPosition());
      return isAllWhiteSpace(textToEOL);
    };

    MoveToNextWord.prototype.moveCursor = function(cursor) {
      var allowNextLine;
      if (cursorIsAtVimEndOfFile(cursor)) {
        return;
      }
      allowNextLine = false;
      return this.countTimes((function(_this) {
        return function() {
          var point, _ref1;
          if ((_ref1 = _this.operator) != null ? _ref1.directInstanceof('Change') : void 0) {
            point = _this.getPointForChange(cursor, {
              wordRegex: _this.wordRegex,
              allowNextLine: allowNextLine
            });
            cursor.setBufferPosition(point);
            return allowNextLine = cursor.isAtEndOfLine();
          } else {
            if (_this.textToEndOfLineIsAllWhiteSpace(cursor) && !cursorIsAtVimEndOfFile(cursor)) {
              cursor.moveDown();
              return cursor.moveToFirstCharacterOfLine();
            } else {
              return cursor.setBufferPosition(_this.getPoint(cursor, {
                wordRegex: _this.wordRegex
              }));
            }
          }
        };
      })(this));
    };

    return MoveToNextWord;

  })(Motion);

  MoveToNextWholeWord = (function(_super) {
    __extends(MoveToNextWholeWord, _super);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.extend();

    MoveToNextWholeWord.prototype.wordRegex = /^\s*$|\S+/;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToEndOfWord = (function(_super) {
    __extends(MoveToEndOfWord, _super);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.extend();

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.inclusive = true;

    MoveToEndOfWord.prototype.moveToNextEndOfWord = function(cursor) {
      var point;
      moveCursorToNextNonWhitespace(cursor);
      point = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.wordRegex
      }).translate([0, -1]);
      point = Point.min(point, getVimEofBufferPosition(this.editor));
      return cursor.setBufferPosition(point);
    };

    MoveToEndOfWord.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var originalPoint;
          originalPoint = cursor.getBufferPosition();
          _this.moveToNextEndOfWord(cursor);
          if (originalPoint.isEqual(cursor.getBufferPosition())) {
            cursor.moveRight();
            return _this.moveToNextEndOfWord(cursor);
          }
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToEndOfWholeWord = (function(_super) {
    __extends(MoveToEndOfWholeWord, _super);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.extend();

    MoveToEndOfWholeWord.prototype.wordRegex = /\S+/;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToNextParagraph = (function(_super) {
    __extends(MoveToNextParagraph, _super);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.extend();

    MoveToNextParagraph.prototype.direction = 'next';

    MoveToNextParagraph.prototype.getPoint = function(cursor) {
      var inSection, row, rows, startRow, _i, _len;
      inSection = !this.editor.isBufferRowBlank(cursor.getBufferRow());
      startRow = cursor.getBufferRow();
      rows = getBufferRows(this.editor, {
        startRow: startRow,
        direction: this.direction,
        includeStartRow: false
      });
      for (_i = 0, _len = rows.length; _i < _len; _i++) {
        row = rows[_i];
        if (this.editor.isBufferRowBlank(row)) {
          if (inSection) {
            return [row, 0];
          }
        } else {
          inSection = true;
        }
      }
      switch (this.direction) {
        case 'previous':
          return [0, 0];
        case 'next':
          return getVimEofBufferPosition(this.editor);
      }
    };

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          return cursor.setBufferPosition(_this.getPoint(cursor));
        };
      })(this));
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(_super) {
    __extends(MoveToPreviousParagraph, _super);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.direction = 'previous';

    MoveToPreviousParagraph.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          return cursor.setBufferPosition(_this.getPoint(cursor));
        };
      })(this));
    };

    return MoveToPreviousParagraph;

  })(MoveToNextParagraph);

  MoveToBeginningOfLine = (function(_super) {
    __extends(MoveToBeginningOfLine, _super);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.extend();

    MoveToBeginningOfLine.prototype.defaultCount = null;

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor) {
      return cursor.moveToBeginningOfLine();
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToLastCharacterOfLine = (function(_super) {
    __extends(MoveToLastCharacterOfLine, _super);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.extend();

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor) {
      return this.countTimes(function() {
        cursor.moveToEndOfLine();
        return cursor.goalColumn = Infinity;
      });
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToLastNonblankCharacterOfLineAndDown, _super);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.extend();

    MoveToLastNonblankCharacterOfLineAndDown.prototype.inclusive = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.skipTrailingWhitespace = function(cursor) {
      var position, scanRange, startOfTrailingWhitespace;
      position = cursor.getBufferPosition();
      scanRange = cursor.getCurrentLineBufferRange();
      startOfTrailingWhitespace = [scanRange.end.row, scanRange.end.column - 1];
      this.editor.scanInBufferRange(/[ \t]+$/, scanRange, function(_arg) {
        var range;
        range = _arg.range;
        startOfTrailingWhitespace = range.start;
        return startOfTrailingWhitespace.column -= 1;
      });
      return cursor.setBufferPosition(startOfTrailingWhitespace);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor) {
      this.countTimes((function(_this) {
        return function() {
          if (cursor.getBufferRow() !== getVimLastBufferRow(_this.editor)) {
            return cursor.moveDown();
          }
        };
      })(this));
      return this.skipTrailingWhitespace(cursor);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(_super) {
    __extends(MoveToFirstCharacterOfLine, _super);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.extend();

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor) {
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(_super) {
    __extends(MoveToFirstCharacterOfLineUp, _super);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.extend();

    MoveToFirstCharacterOfLineUp.prototype.linewise = true;

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorUp(cursor);
      });
      return MoveToFirstCharacterOfLineUp.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineUp;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineDown, _super);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.extend();

    MoveToFirstCharacterOfLineDown.prototype.linewise = true;

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor) {
      this.countTimes(function() {
        return moveCursorDown(cursor);
      });
      return MoveToFirstCharacterOfLineDown.__super__.moveCursor.apply(this, arguments);
    };

    return MoveToFirstCharacterOfLineDown;

  })(MoveToFirstCharacterOfLine);

  MoveToFirstCharacterOfLineAndDown = (function(_super) {
    __extends(MoveToFirstCharacterOfLineAndDown, _super);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.extend();

    MoveToFirstCharacterOfLineAndDown.prototype.defaultCount = 0;

    MoveToFirstCharacterOfLineAndDown.prototype.getCount = function() {
      return MoveToFirstCharacterOfLineAndDown.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(MoveToFirstCharacterOfLineDown);

  MoveToFirstLine = (function(_super) {
    __extends(MoveToFirstLine, _super);

    function MoveToFirstLine() {
      return MoveToFirstLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstLine.extend();

    MoveToFirstLine.prototype.linewise = true;

    MoveToFirstLine.prototype.defaultCount = null;

    MoveToFirstLine.prototype.getRow = function() {
      var count;
      if ((count = this.getCount())) {
        return count - 1;
      } else {
        return this.getDefaultRow();
      }
    };

    MoveToFirstLine.prototype.getDefaultRow = function() {
      return 0;
    };

    MoveToFirstLine.prototype.moveCursor = function(cursor) {
      cursor.setBufferPosition([this.getRow(), 0]);
      cursor.moveToFirstCharacterOfLine();
      return cursor.autoscroll({
        center: true
      });
    };

    return MoveToFirstLine;

  })(Motion);

  MoveToLastLine = (function(_super) {
    __extends(MoveToLastLine, _super);

    function MoveToLastLine() {
      return MoveToLastLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastLine.extend();

    MoveToLastLine.prototype.getDefaultRow = function() {
      return getVimLastBufferRow(this.editor);
    };

    return MoveToLastLine;

  })(MoveToFirstLine);

  MoveToLineByPercent = (function(_super) {
    __extends(MoveToLineByPercent, _super);

    function MoveToLineByPercent() {
      return MoveToLineByPercent.__super__.constructor.apply(this, arguments);
    }

    MoveToLineByPercent.extend();

    MoveToLineByPercent.prototype.getRow = function() {
      var percent;
      percent = Math.min(100, this.getCount());
      return Math.floor(getVimLastScreenRow(this.editor) * (percent / 100));
    };

    return MoveToLineByPercent;

  })(MoveToFirstLine);

  MoveToRelativeLine = (function(_super) {
    __extends(MoveToRelativeLine, _super);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.extend(false);

    MoveToRelativeLine.prototype.linewise = true;

    MoveToRelativeLine.prototype.moveCursor = function(cursor) {
      var newRow;
      newRow = cursor.getBufferRow() + this.getCount();
      return cursor.setBufferPosition([newRow, 0]);
    };

    MoveToRelativeLine.prototype.getCount = function() {
      return MoveToRelativeLine.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToRelativeLine;

  })(Motion);

  MoveToRelativeLineWithMinimum = (function(_super) {
    __extends(MoveToRelativeLineWithMinimum, _super);

    function MoveToRelativeLineWithMinimum() {
      return MoveToRelativeLineWithMinimum.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLineWithMinimum.extend(false);

    MoveToRelativeLineWithMinimum.prototype.min = 0;

    MoveToRelativeLineWithMinimum.prototype.getCount = function() {
      var count;
      count = MoveToRelativeLineWithMinimum.__super__.getCount.apply(this, arguments);
      return Math.max(this.min, count);
    };

    return MoveToRelativeLineWithMinimum;

  })(MoveToRelativeLine);

  MoveToTopOfScreen = (function(_super) {
    __extends(MoveToTopOfScreen, _super);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.extend();

    MoveToTopOfScreen.prototype.linewise = true;

    MoveToTopOfScreen.prototype.scrolloff = 2;

    MoveToTopOfScreen.prototype.defaultCount = 0;

    MoveToTopOfScreen.prototype.moveCursor = function(cursor) {
      cursor.setScreenPosition([this.getRow(), 0]);
      return cursor.moveToFirstCharacterOfLine();
    };

    MoveToTopOfScreen.prototype.getRow = function() {
      var offset, row;
      row = getFirstVisibleScreenRow(this.editor);
      offset = row === 0 ? 0 : this.scrolloff;
      return row + Math.max(this.getCount(), offset);
    };

    MoveToTopOfScreen.prototype.getCount = function() {
      return MoveToTopOfScreen.__super__.getCount.apply(this, arguments) - 1;
    };

    return MoveToTopOfScreen;

  })(Motion);

  MoveToBottomOfScreen = (function(_super) {
    __extends(MoveToBottomOfScreen, _super);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.extend();

    MoveToBottomOfScreen.prototype.getRow = function() {
      var offset, row;
      row = getLastVisibleScreenRow(this.editor);
      offset = row === getVimLastBufferRow(this.editor) ? 0 : this.scrolloff;
      return row - Math.max(this.getCount(), offset);
    };

    return MoveToBottomOfScreen;

  })(MoveToTopOfScreen);

  MoveToMiddleOfScreen = (function(_super) {
    __extends(MoveToMiddleOfScreen, _super);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.extend();

    MoveToMiddleOfScreen.prototype.getRow = function() {
      var offset, row;
      row = getFirstVisibleScreenRow(this.editor);
      offset = Math.floor(this.editor.getRowsPerPage() / 2) - 1;
      return row + Math.max(offset, 0);
    };

    return MoveToMiddleOfScreen;

  })(MoveToTopOfScreen);

  ScrollFullScreenDown = (function(_super) {
    __extends(ScrollFullScreenDown, _super);

    function ScrollFullScreenDown() {
      return ScrollFullScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenDown.extend();

    ScrollFullScreenDown.prototype.coefficient = +1;

    ScrollFullScreenDown.prototype.initialize = function() {
      var amountInPixel;
      this.rowsToScroll = this.editor.getRowsPerPage() * this.coefficient;
      amountInPixel = this.rowsToScroll * this.editor.getLineHeightInPixels();
      return this.newScrollTop = this.editorElement.getScrollTop() + amountInPixel;
    };

    ScrollFullScreenDown.prototype.scroll = function() {
      return this.editorElement.setScrollTop(this.newScrollTop);
    };

    ScrollFullScreenDown.prototype.select = function() {
      ScrollFullScreenDown.__super__.select.call(this);
      return this.scroll();
    };

    ScrollFullScreenDown.prototype.execute = function() {
      ScrollFullScreenDown.__super__.execute.call(this);
      return this.scroll();
    };

    ScrollFullScreenDown.prototype.moveCursor = function(cursor) {
      var row;
      row = Math.floor(this.editor.getCursorScreenPosition().row + this.rowsToScroll);
      row = Math.min(getVimLastScreenRow(this.editor), row);
      return cursor.setScreenPosition([row, 0], {
        autoscroll: false
      });
    };

    return ScrollFullScreenDown;

  })(Motion);

  ScrollFullScreenUp = (function(_super) {
    __extends(ScrollFullScreenUp, _super);

    function ScrollFullScreenUp() {
      return ScrollFullScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollFullScreenUp.extend();

    ScrollFullScreenUp.prototype.coefficient = -1;

    return ScrollFullScreenUp;

  })(ScrollFullScreenDown);

  ScrollHalfScreenDown = (function(_super) {
    __extends(ScrollHalfScreenDown, _super);

    function ScrollHalfScreenDown() {
      return ScrollHalfScreenDown.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenDown.extend();

    ScrollHalfScreenDown.prototype.coefficient = +1 / 2;

    return ScrollHalfScreenDown;

  })(ScrollFullScreenDown);

  ScrollHalfScreenUp = (function(_super) {
    __extends(ScrollHalfScreenUp, _super);

    function ScrollHalfScreenUp() {
      return ScrollHalfScreenUp.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfScreenUp.extend();

    ScrollHalfScreenUp.prototype.coefficient = -1 / 2;

    return ScrollHalfScreenUp;

  })(ScrollHalfScreenDown);

  Find = (function(_super) {
    __extends(Find, _super);

    function Find() {
      return Find.__super__.constructor.apply(this, arguments);
    }

    Find.extend();

    Find.prototype.backwards = false;

    Find.prototype.inclusive = true;

    Find.prototype.hover = {
      icon: ':find:',
      emoji: ':mag_right:'
    };

    Find.prototype.offset = 0;

    Find.prototype.requireInput = true;

    Find.prototype.initialize = function() {
      if (!this.isRepeated()) {
        return this.focusInput();
      }
    };

    Find.prototype.isBackwards = function() {
      return this.backwards;
    };

    Find.prototype.find = function(cursor) {
      var cursorPoint, end, method, offset, points, scanRange, start, unOffset, _ref1, _ref2;
      cursorPoint = cursor.getBufferPosition();
      _ref1 = this.editor.bufferRangeForBufferRow(cursorPoint.row), start = _ref1.start, end = _ref1.end;
      offset = this.isBackwards() ? this.offset : -this.offset;
      unOffset = -offset * this.isRepeated();
      if (this.isBackwards()) {
        scanRange = [start, cursorPoint.translate([0, unOffset])];
        method = 'backwardsScanInBufferRange';
      } else {
        scanRange = [cursorPoint.translate([0, 1 + unOffset]), end];
        method = 'scanInBufferRange';
      }
      points = [];
      this.editor[method](RegExp("" + (_.escapeRegExp(this.input)), "g"), scanRange, function(_arg) {
        var range;
        range = _arg.range;
        return points.push(range.start);
      });
      return (_ref2 = points[this.getCount()]) != null ? _ref2.translate([0, offset]) : void 0;
    };

    Find.prototype.getCount = function() {
      return Find.__super__.getCount.apply(this, arguments) - 1;
    };

    Find.prototype.moveCursor = function(cursor) {
      var point;
      if (point = this.find(cursor)) {
        cursor.setBufferPosition(point);
      }
      if (!this.isRepeated()) {
        return globalState.currentFind = this;
      }
    };

    return Find;

  })(Motion);

  FindBackwards = (function(_super) {
    __extends(FindBackwards, _super);

    function FindBackwards() {
      return FindBackwards.__super__.constructor.apply(this, arguments);
    }

    FindBackwards.extend();

    FindBackwards.prototype.inclusive = false;

    FindBackwards.prototype.backwards = true;

    FindBackwards.prototype.hover = {
      icon: ':find:',
      emoji: ':mag:'
    };

    return FindBackwards;

  })(Find);

  Till = (function(_super) {
    __extends(Till, _super);

    function Till() {
      return Till.__super__.constructor.apply(this, arguments);
    }

    Till.extend();

    Till.prototype.offset = 1;

    Till.prototype.find = function() {
      return this.point = Till.__super__.find.apply(this, arguments);
    };

    Till.prototype.selectInclusively = function(selection) {
      Till.__super__.selectInclusively.apply(this, arguments);
      if (selection.isEmpty() && ((this.point != null) && !this.backwards)) {
        return selection.modifySelection(function() {
          return selection.cursor.moveRight();
        });
      }
    };

    return Till;

  })(Find);

  TillBackwards = (function(_super) {
    __extends(TillBackwards, _super);

    function TillBackwards() {
      return TillBackwards.__super__.constructor.apply(this, arguments);
    }

    TillBackwards.extend();

    TillBackwards.prototype.inclusive = false;

    TillBackwards.prototype.backwards = true;

    return TillBackwards;

  })(Till);

  RepeatFind = (function(_super) {
    __extends(RepeatFind, _super);

    function RepeatFind() {
      return RepeatFind.__super__.constructor.apply(this, arguments);
    }

    RepeatFind.extend();

    RepeatFind.prototype.repeated = true;

    RepeatFind.prototype.initialize = function() {
      var findObj;
      if (!(findObj = globalState.currentFind)) {
        this.abort();
      }
      return this.offset = findObj.offset, this.backwards = findObj.backwards, this.input = findObj.input, findObj;
    };

    return RepeatFind;

  })(Find);

  RepeatFindReverse = (function(_super) {
    __extends(RepeatFindReverse, _super);

    function RepeatFindReverse() {
      return RepeatFindReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatFindReverse.extend();

    RepeatFindReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatFindReverse;

  })(RepeatFind);

  MoveToMark = (function(_super) {
    __extends(MoveToMark, _super);

    function MoveToMark() {
      return MoveToMark.__super__.constructor.apply(this, arguments);
    }

    MoveToMark.extend();

    MoveToMark.prototype.requireInput = true;

    MoveToMark.prototype.hover = {
      icon: ":move-to-mark:`",
      emoji: ":round_pushpin:`"
    };

    MoveToMark.prototype.initialize = function() {
      return this.focusInput();
    };

    MoveToMark.prototype.moveCursor = function(cursor) {
      var markPosition;
      markPosition = this.vimState.mark.get(this.input);
      if (this.input === '`') {
        if (markPosition == null) {
          markPosition = [0, 0];
        }
        this.vimState.mark.set('`', cursor.getBufferPosition());
      }
      if (markPosition != null) {
        cursor.setBufferPosition(markPosition);
        if (this.linewise) {
          return cursor.moveToFirstCharacterOfLine();
        }
      }
    };

    return MoveToMark;

  })(Motion);

  MoveToMarkLine = (function(_super) {
    __extends(MoveToMarkLine, _super);

    function MoveToMarkLine() {
      return MoveToMarkLine.__super__.constructor.apply(this, arguments);
    }

    MoveToMarkLine.extend();

    MoveToMarkLine.prototype.linewise = true;

    MoveToMarkLine.prototype.hover = {
      icon: ":move-to-mark:'",
      emoji: ":round_pushpin:'"
    };

    return MoveToMarkLine;

  })(MoveToMark);

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.saveCurrentSearch = true;

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.escapeRegExp = false;

    SearchBase.prototype.initialize = function() {
      if (this.saveCurrentSearch) {
        return globalState.currentSearch.backwards = this.backwards;
      }
    };

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.getInput = function() {
      return this.input;
    };

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments);
      if (this.isBackwards()) {
        return -count;
      } else {
        return count - 1;
      }
    };

    SearchBase.prototype.flash = function(range, _arg) {
      var timeout;
      timeout = (_arg != null ? _arg : {}).timeout;
      return flashRanges(range, {
        editor: this.editor,
        "class": 'vim-mode-plus-flash',
        timeout: timeout
      });
    };

    SearchBase.prototype.finish = function() {
      var _ref1;
      if ((_ref1 = this.matches) != null) {
        _ref1.destroy();
      }
      return this.matches = null;
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var current;
      if (this.matches == null) {
        this.matches = new MatchList(this.vimState, this.scan(cursor), this.getCount());
      }
      if (this.matches.isEmpty()) {
        if (this.input !== '') {
          if (settings.get('flashScreenOnSearchHasNoMatch')) {
            this.flash(getVisibleBufferRange(this.editor), {
              timeout: 100
            });
          }
          atom.beep();
        }
      } else {
        current = this.matches.get();
        if (this.isComplete()) {
          this.visit(current, cursor);
        } else {
          this.visit(current, null);
        }
      }
      if (this.isComplete()) {
        this.vimState.searchHistory.save(this.getInput());
        return this.finish();
      }
    };

    SearchBase.prototype.visit = function(match, cursor) {
      var timeout;
      if (cursor == null) {
        cursor = null;
      }
      match.visit();
      if (cursor) {
        if (!this.isIncrementalSearch()) {
          match.flash();
        }
        timeout = settings.get('showHoverSearchCounterDuration');
        this.matches.showHover({
          timeout: timeout
        });
        return cursor.setBufferPosition(match.getStartPoint());
      } else {
        this.matches.show();
        this.matches.showHover({
          timeout: null
        });
        return match.flash();
      }
    };

    SearchBase.prototype.isIncrementalSearch = function() {
      return settings.get('incrementalSearch') && this["instanceof"]('Search');
    };

    SearchBase.prototype.scan = function(cursor) {
      var fromPoint, input, post, pre, ranges, _ref1;
      ranges = [];
      input = this.getInput();
      if (input === '') {
        return ranges;
      }
      fromPoint = this.isMode('visual', 'linewise') && this.isIncrementalSearch() ? swrap(cursor.selection).getCharacterwiseHeadPosition() : cursor.getBufferPosition();
      this.editor.scan(this.getPattern(input), function(_arg) {
        var range;
        range = _arg.range;
        return ranges.push(range);
      });
      _ref1 = _.partition(ranges, (function(_this) {
        return function(_arg) {
          var start;
          start = _arg.start;
          if (_this.isBackwards()) {
            return start.isLessThan(fromPoint);
          } else {
            return start.isLessThanOrEqual(fromPoint);
          }
        };
      })(this)), pre = _ref1[0], post = _ref1[1];
      return post.concat(pre);
    };

    SearchBase.prototype.getPattern = function(term) {
      var modFlags, modifiers;
      modifiers = {
        'g': true
      };
      if (!term.match('[A-Z]') && settings.get('useSmartcaseForSearch')) {
        modifiers['i'] = true;
      }
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        modifiers['i'] = true;
      }
      modFlags = Object.keys(modifiers).join('');
      if (this.escapeRegExp) {
        return new RegExp(_.escapeRegExp(term), modFlags);
      } else {
        try {
          return new RegExp(term, modFlags);
        } catch (_error) {
          return new RegExp(_.escapeRegExp(term), modFlags);
        }
      }
    };

    SearchBase.prototype.updateEscapeRegExpOption = function(input) {
      if (this.escapeRegExp = /^ /.test(input)) {
        input = input.replace(/^ /, '');
      }
      this.updateUI({
        escapeRegExp: this.escapeRegExp
      });
      return input;
    };

    SearchBase.prototype.updateUI = function(options) {
      return this.vimState.searchInput.updateOptionSettings(options);
    };

    return SearchBase;

  })(Motion);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search() {
      this.onCommand = __bind(this.onCommand, this);
      this.onChange = __bind(this.onChange, this);
      this.onCancel = __bind(this.onCancel, this);
      this.onConfirm = __bind(this.onConfirm, this);
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.requireInput = true;

    Search.prototype.confirmed = false;

    Search.prototype.initialize = function() {
      Search.__super__.initialize.apply(this, arguments);
      if (settings.get('incrementalSearch')) {
        this.restoreEditorState = saveEditorState(this.editor);
        this.subscribeScrollChange();
        this.onDidCommandSearch(this.onCommand);
      }
      this.onDidConfirmSearch(this.onConfirm);
      this.onDidCancelSearch(this.onCancel);
      this.onDidChangeSearch(this.onChange);
      return this.vimState.searchInput.focus({
        backwards: this.backwards
      });
    };

    Search.prototype.isComplete = function() {
      if (!this.confirmed) {
        return false;
      }
      return Search.__super__.isComplete.apply(this, arguments);
    };

    Search.prototype.subscribeScrollChange = function() {
      this.subscribe(this.editorElement.onDidChangeScrollTop((function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.matches) != null ? _ref1.show() : void 0;
        };
      })(this)));
      return this.subscribe(this.editorElement.onDidChangeScrollLeft((function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.matches) != null ? _ref1.show() : void 0;
        };
      })(this)));
    };

    Search.prototype.isRepeatLastSearch = function(input) {
      return input === '' || input === (this.isBackwards() ? '?' : '/');
    };

    Search.prototype.finish = function() {
      if (this.isIncrementalSearch() && settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      return Search.__super__.finish.apply(this, arguments);
    };

    Search.prototype.onConfirm = function(input) {
      this.input = input;
      this.confirmed = true;
      if (this.isRepeatLastSearch(this.input)) {
        if (!(this.input = this.vimState.searchHistory.get('prev'))) {
          atom.beep();
        }
      }
      this.processOperation();
      return this.finish();
    };

    Search.prototype.onCancel = function() {
      if (!(this.isMode('visual') || this.isMode('insert'))) {
        this.vimState.activate('reset');
      }
      if (typeof this.restoreEditorState === "function") {
        this.restoreEditorState();
      }
      this.vimState.reset();
      return this.finish();
    };

    Search.prototype.onChange = function(input) {
      var cursor, _i, _len, _ref1, _ref2, _results;
      this.input = input;
      this.input = this.updateEscapeRegExpOption(this.input);
      if (!this.isIncrementalSearch()) {
        return;
      }
      if ((_ref1 = this.matches) != null) {
        _ref1.destroy();
      }
      if (settings.get('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      this.matches = null;
      if (this.input !== '') {
        _ref2 = this.editor.getCursors();
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cursor = _ref2[_i];
          _results.push(this.moveCursor(cursor));
        }
        return _results;
      }
    };

    Search.prototype.onCommand = function(command) {
      var action, args, _ref1, _ref2;
      _ref1 = command.split('-'), action = _ref1[0], args = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
      if (!this.input) {
        return;
      }
      if (this.matches.isEmpty()) {
        return;
      }
      switch (action) {
        case 'visit':
          return this.visit((_ref2 = this.matches).get.apply(_ref2, args));
        case 'scroll':
          this.matches.scroll(args[0]);
          return this.visit(this.matches.get());
      }
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(_super) {
    __extends(SearchBackwards, _super);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.wordRegex = null;

    SearchCurrentWord.prototype.getInput = function() {
      var defaultIsKeyword, userIsKeyword;
      if (this.input != null) {
        return this.input;
      }
      defaultIsKeyword = "[@a-zA-Z0-9_\-]+";
      userIsKeyword = settings.get('iskeyword');
      this.wordRegex = new RegExp(userIsKeyword || defaultIsKeyword);
      return this.input = this.getCurrentWord();
    };

    SearchCurrentWord.prototype.getPattern = function(text) {
      var pattern;
      pattern = _.escapeRegExp(text);
      pattern = /\W/.test(text) ? "" + pattern + "\\b" : "\\b" + pattern + "\\b";
      return new RegExp(pattern, 'gi');
    };

    SearchCurrentWord.prototype.getCurrentWord = function() {
      var cursor, point, range, rowStart;
      cursor = this.editor.getLastCursor();
      rowStart = cursor.getBufferRow();
      range = cursor.getCurrentWordBufferRange({
        wordRegex: this.wordRegex
      });
      if (range.end.isEqual(cursor.getBufferPosition())) {
        point = cursor.getBeginningOfNextWordBufferPosition({
          wordRegex: this.wordRegex
        });
        if (point.row === rowStart) {
          cursor.setBufferPosition(point);
          range = cursor.getCurrentWordBufferRange({
            wordRegex: this.wordRegex
          });
        }
      }
      if (range.isEmpty()) {
        return '';
      } else {
        cursor.setBufferPosition(range.start);
        return this.editor.getTextInBufferRange(range);
      }
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(_super) {
    __extends(SearchCurrentWordBackwards, _super);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

  RepeatSearch = (function(_super) {
    __extends(RepeatSearch, _super);

    function RepeatSearch() {
      return RepeatSearch.__super__.constructor.apply(this, arguments);
    }

    RepeatSearch.extend();

    RepeatSearch.prototype.saveCurrentSearch = false;

    RepeatSearch.prototype.initialize = function() {
      RepeatSearch.__super__.initialize.apply(this, arguments);
      this.input = this.vimState.searchHistory.get('prev');
      return this.backwards = globalState.currentSearch.backwards;
    };

    return RepeatSearch;

  })(SearchBase);

  RepeatSearchReverse = (function(_super) {
    __extends(RepeatSearchReverse, _super);

    function RepeatSearchReverse() {
      return RepeatSearchReverse.__super__.constructor.apply(this, arguments);
    }

    RepeatSearchReverse.extend();

    RepeatSearchReverse.prototype.isBackwards = function() {
      return !this.backwards;
    };

    return RepeatSearchReverse;

  })(RepeatSearch);

  MoveToPreviousFoldStart = (function(_super) {
    __extends(MoveToPreviousFoldStart, _super);

    function MoveToPreviousFoldStart() {
      return MoveToPreviousFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStart.extend();

    MoveToPreviousFoldStart.prototype.linewise = true;

    MoveToPreviousFoldStart.prototype.which = 'start';

    MoveToPreviousFoldStart.prototype.direction = 'prev';

    MoveToPreviousFoldStart.prototype.initialize = function() {
      this.rows = this.getFoldRow(this.which);
      if (this.direction === 'prev') {
        return this.rows.reverse();
      }
    };

    MoveToPreviousFoldStart.prototype.getFoldRow = function(which) {
      var index, rows;
      index = which === 'start' ? 0 : 1;
      rows = getCodeFoldRowRanges(this.editor).map(function(rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function(row) {
        return row;
      });
    };

    MoveToPreviousFoldStart.prototype.getScanRows = function(cursor) {
      var cursorRow, isValidRow;
      cursorRow = cursor.getBufferRow();
      isValidRow = (function() {
        switch (this.direction) {
          case 'prev':
            return function(row) {
              return row < cursorRow;
            };
          case 'next':
            return function(row) {
              return row > cursorRow;
            };
        }
      }).call(this);
      return this.rows.filter(isValidRow);
    };

    MoveToPreviousFoldStart.prototype.detectRow = function(cursor) {
      return this.getScanRows(cursor)[0];
    };

    MoveToPreviousFoldStart.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var row;
          if ((row = _this.detectRow(cursor)) != null) {
            return moveCursorToFirstCharacterAtRow(cursor, row);
          }
        };
      })(this));
    };

    return MoveToPreviousFoldStart;

  })(Motion);

  MoveToNextFoldStart = (function(_super) {
    __extends(MoveToNextFoldStart, _super);

    function MoveToNextFoldStart() {
      return MoveToNextFoldStart.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStart.extend();

    MoveToNextFoldStart.prototype.direction = 'next';

    return MoveToNextFoldStart;

  })(MoveToPreviousFoldStart);

  MoveToPreviousFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToPreviousFoldStartWithSameIndent, _super);

    function MoveToPreviousFoldStartWithSameIndent() {
      return MoveToPreviousFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldStartWithSameIndent.extend();

    MoveToPreviousFoldStartWithSameIndent.prototype.detectRow = function(cursor) {
      var baseIndentLevel, row, _i, _len, _ref1;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, cursor.getBufferRow());
      _ref1 = this.getScanRows(cursor);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (getIndentLevelForBufferRow(this.editor, row) === baseIndentLevel) {
          return row;
        }
      }
      return null;
    };

    return MoveToPreviousFoldStartWithSameIndent;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldStartWithSameIndent = (function(_super) {
    __extends(MoveToNextFoldStartWithSameIndent, _super);

    function MoveToNextFoldStartWithSameIndent() {
      return MoveToNextFoldStartWithSameIndent.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldStartWithSameIndent.extend();

    MoveToNextFoldStartWithSameIndent.prototype.direction = 'next';

    return MoveToNextFoldStartWithSameIndent;

  })(MoveToPreviousFoldStartWithSameIndent);

  MoveToPreviousFoldEnd = (function(_super) {
    __extends(MoveToPreviousFoldEnd, _super);

    function MoveToPreviousFoldEnd() {
      return MoveToPreviousFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFoldEnd.extend();

    MoveToPreviousFoldEnd.prototype.which = 'end';

    return MoveToPreviousFoldEnd;

  })(MoveToPreviousFoldStart);

  MoveToNextFoldEnd = (function(_super) {
    __extends(MoveToNextFoldEnd, _super);

    function MoveToNextFoldEnd() {
      return MoveToNextFoldEnd.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFoldEnd.extend();

    MoveToNextFoldEnd.prototype.direction = 'next';

    return MoveToNextFoldEnd;

  })(MoveToPreviousFoldEnd);

  MoveToPreviousFunction = (function(_super) {
    __extends(MoveToPreviousFunction, _super);

    function MoveToPreviousFunction() {
      return MoveToPreviousFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousFunction.extend();

    MoveToPreviousFunction.prototype.direction = 'prev';

    MoveToPreviousFunction.prototype.detectRow = function(cursor) {
      return _.detect(this.getScanRows(cursor), (function(_this) {
        return function(row) {
          return isIncludeFunctionScopeForRow(_this.editor, row);
        };
      })(this));
    };

    return MoveToPreviousFunction;

  })(MoveToPreviousFoldStart);

  MoveToNextFunction = (function(_super) {
    __extends(MoveToNextFunction, _super);

    function MoveToNextFunction() {
      return MoveToNextFunction.__super__.constructor.apply(this, arguments);
    }

    MoveToNextFunction.extend();

    MoveToNextFunction.prototype.direction = 'next';

    return MoveToNextFunction;

  })(MoveToPreviousFunction);

  MoveToPositionByScope = (function(_super) {
    __extends(MoveToPositionByScope, _super);

    function MoveToPositionByScope() {
      return MoveToPositionByScope.__super__.constructor.apply(this, arguments);
    }

    MoveToPositionByScope.extend(false);

    MoveToPositionByScope.prototype.direction = 'backward';

    MoveToPositionByScope.prototype.scope = '.';

    MoveToPositionByScope.prototype.moveCursor = function(cursor) {
      return this.countTimes((function(_this) {
        return function() {
          var from, point;
          from = cursor.getBufferPosition();
          if (point = detectScopeStartPositionByScope(_this.editor, from, _this.direction, _this.scope)) {
            return cursor.setBufferPosition(point);
          }
        };
      })(this));
    };

    return MoveToPositionByScope;

  })(Motion);

  MoveToPreviousString = (function(_super) {
    __extends(MoveToPreviousString, _super);

    function MoveToPreviousString() {
      return MoveToPreviousString.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousString.extend();

    MoveToPreviousString.prototype.direction = 'backward';

    MoveToPreviousString.prototype.scope = 'string.begin';

    return MoveToPreviousString;

  })(MoveToPositionByScope);

  MoveToNextString = (function(_super) {
    __extends(MoveToNextString, _super);

    function MoveToNextString() {
      return MoveToNextString.__super__.constructor.apply(this, arguments);
    }

    MoveToNextString.extend();

    MoveToNextString.prototype.direction = 'forward';

    return MoveToNextString;

  })(MoveToPreviousString);

  MoveToPreviousNumber = (function(_super) {
    __extends(MoveToPreviousNumber, _super);

    function MoveToPreviousNumber() {
      return MoveToPreviousNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousNumber.extend();

    MoveToPreviousNumber.prototype.direction = 'backward';

    MoveToPreviousNumber.prototype.scope = 'constant.numeric';

    return MoveToPreviousNumber;

  })(MoveToPositionByScope);

  MoveToNextNumber = (function(_super) {
    __extends(MoveToNextNumber, _super);

    function MoveToNextNumber() {
      return MoveToNextNumber.__super__.constructor.apply(this, arguments);
    }

    MoveToNextNumber.extend();

    MoveToNextNumber.prototype.direction = 'forward';

    return MoveToNextNumber;

  })(MoveToPreviousNumber);

  MoveToPair = (function(_super) {
    __extends(MoveToPair, _super);

    function MoveToPair() {
      return MoveToPair.__super__.constructor.apply(this, arguments);
    }

    MoveToPair.extend();

    MoveToPair.prototype.inclusive = true;

    MoveToPair.prototype.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket'];

    MoveToPair.prototype.getPoint = function(cursor) {
      var enclosingRange, enclosingRanges, forwardingRanges, ranges, _ref1, _ref2;
      ranges = this["new"]("AAnyPair", {
        enclosed: false,
        member: this.member
      }).getRanges(cursor.selection);
      ranges = ranges.filter(function(_arg) {
        var end, start, _ref1;
        start = _arg.start, end = _arg.end;
        return (_ref1 = cursor.getBufferRow()) === start.row || _ref1 === end.row;
      });
      if (!ranges.length) {
        return null;
      }
      _ref1 = _.partition(ranges, function(range) {
        return range.containsPoint(cursor.getBufferPosition(), true);
      }), enclosingRanges = _ref1[0], forwardingRanges = _ref1[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return ((_ref2 = forwardingRanges[0]) != null ? _ref2.end.translate([0, -1]) : void 0) || (enclosingRange != null ? enclosingRange.start : void 0);
    };

    MoveToPair.prototype.moveCursor = function(cursor) {
      var point;
      if (point = this.getPoint(cursor)) {
        return cursor.setBufferPosition(point);
      }
    };

    return MoveToPair;

  })(Motion);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsOGpFQUFBO0lBQUE7OztzQkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBREQsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBSUEsT0E0QkksT0FBQSxDQUFRLFNBQVIsQ0E1QkosRUFDRSx1QkFBQSxlQURGLEVBQ21CLDZCQUFBLHFCQURuQixFQUVFLHNCQUFBLGNBRkYsRUFFa0IsdUJBQUEsZUFGbEIsRUFHRSxvQkFBQSxZQUhGLEVBR2dCLHNCQUFBLGNBSGhCLEVBSUUseUJBQUEsaUJBSkYsRUFLRSwwQkFBQSxrQkFMRixFQU1FLDhCQUFBLHNCQU5GLEVBT0UsZ0NBQUEsd0JBUEYsRUFPNEIsK0JBQUEsdUJBUDVCLEVBUUUsK0JBQUEsdUJBUkYsRUFRMkIsK0JBQUEsdUJBUjNCLEVBU0UsMkJBQUEsbUJBVEYsRUFTdUIsMkJBQUEsbUJBVHZCLEVBVUUsNEJBQUEsb0JBVkYsRUFXRSxpQ0FBQSx5QkFYRixFQVlFLG1CQUFBLFdBWkYsRUFhRSx1Q0FBQSwrQkFiRixFQWNFLGtCQUFBLFVBZEYsRUFlRSxrQ0FBQSwwQkFmRixFQWdCRSw2QkFBQSxxQkFoQkYsRUFpQkUsdUJBQUEsZUFqQkYsRUFrQkUsdUJBQUEsZUFsQkYsRUFtQkUscUNBQUEsNkJBbkJGLEVBb0JFLDRCQUFBLG9CQXBCRixFQXFCRSxxQ0FBQSw2QkFyQkYsRUFzQkUsMEJBQUEsa0JBdEJGLEVBdUJFLDRCQUFBLG9CQXZCRixFQXdC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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/motion.coffee
