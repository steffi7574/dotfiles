(function() {
  var Base, CurrentSelection, Find, FindBackwards, MatchList, Motion, MoveDown, MoveDownToEdge, MoveDownToNonBlank, MoveLeft, MoveRight, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToFirstLine, MoveToLastCharacterOfLine, MoveToLastLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLineByPercent, MoveToMark, MoveToMarkLine, MoveToMiddleOfScreen, MoveToNextFoldEnd, MoveToNextFoldStart, MoveToNextFoldStartWithSameIndent, MoveToNextFunction, MoveToNextNumber, MoveToNextParagraph, MoveToNextString, MoveToNextWholeWord, MoveToNextWord, MoveToPair, MoveToPositionByScope, MoveToPreviousFoldEnd, MoveToPreviousFoldStart, MoveToPreviousFoldStartWithSameIndent, MoveToPreviousFunction, MoveToPreviousNumber, MoveToPreviousParagraph, MoveToPreviousString, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToRelativeLineWithMinimum, MoveToTopOfScreen, MoveUp, MoveUpToEdge, MoveUpToNonBlank, Point, RepeatFind, RepeatFindReverse, RepeatSearch, RepeatSearchReverse, ScrollFullScreenDown, ScrollFullScreenUp, ScrollHalfScreenDown, ScrollHalfScreenUp, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, Till, TillBackwards, cursorIsAtEmptyRow, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, detectScopeStartPositionByScope, flashRanges, getCodeFoldRowRanges, getEolBufferPositionForCursor, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getLastVisibleScreenRow, getTextAtCursor, getTextFromPointToEOL, getValidVimRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, globalState, isAllWhiteSpace, isIncludeFunctionScopeForRow, moveCursorDown, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, pointIsAtEndOfLine, saveEditorState, settings, sortRanges, swrap, unfoldAtCursorRow, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ = require('underscore-plus');

  Point = require('atom').Point;

  globalState = require('./global-state');

  _ref = require('./utils'), saveEditorState = _ref.saveEditorState, getVisibleBufferRange = _ref.getVisibleBufferRange, moveCursorLeft = _ref.moveCursorLeft, moveCursorRight = _ref.moveCursorRight, moveCursorUp = _ref.moveCursorUp, moveCursorDown = _ref.moveCursorDown, unfoldAtCursorRow = _ref.unfoldAtCursorRow, pointIsAtEndOfLine = _ref.pointIsAtEndOfLine, cursorIsAtVimEndOfFile = _ref.cursorIsAtVimEndOfFile, getFirstVisibleScreenRow = _ref.getFirstVisibleScreenRow, getLastVisibleScreenRow = _ref.getLastVisibleScreenRow, getVimEofBufferPosition = _ref.getVimEofBufferPosition, getVimEofScreenPosition = _ref.getVimEofScreenPosition, getVimLastBufferRow = _ref.getVimLastBufferRow, getVimLastScreenRow = _ref.getVimLastScreenRow, getValidVimRow = _ref.getValidVimRow, flashRanges = _ref.flashRanges, moveCursorToFirstCharacterAtRow = _ref.moveCursorToFirstCharacterAtRow, sortRanges = _ref.sortRanges, getIndentLevelForBufferRow = _ref.getIndentLevelForBufferRow, getTextFromPointToEOL = _ref.getTextFromPointToEOL, isAllWhiteSpace = _ref.isAllWhiteSpace, getTextAtCursor = _ref.getTextAtCursor, getEolBufferPositionForCursor = _ref.getEolBufferPositionForCursor, cursorIsOnWhiteSpace = _ref.cursorIsOnWhiteSpace, moveCursorToNextNonWhitespace = _ref.moveCursorToNextNonWhitespace, cursorIsAtEmptyRow = _ref.cursorIsAtEmptyRow, getCodeFoldRowRanges = _ref.getCodeFoldRowRanges, isIncludeFunctionScopeForRow = _ref.isIncludeFunctionScopeForRow, detectScopeStartPositionByScope = _ref.detectScopeStartPositionByScope;

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
      this.editor.mergeIntersectingSelections();
      return this.emitDidSelect();
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

    CurrentSelection.prototype.selectedRange = null;

    CurrentSelection.prototype.initialize = function() {
      this.selectedRange = this.editor.getSelectedBufferRange();
      return this.wasLinewise = this.isLinewise();
    };

    CurrentSelection.prototype.execute = function() {
      throw new Error("" + this.constructor.name + " should not be executed");
    };

    CurrentSelection.prototype.select = function() {
      if (!this.isMode('visual')) {
        this.selectCharacters();
        if (this.wasLinewise) {
          swrap.expandOverLine(this.editor);
        }
      }
      return this.emitDidSelect();
    };

    CurrentSelection.prototype.selectCharacters = function() {
      var end, extent, selection, start, _i, _len, _ref1, _results;
      extent = this.selectedRange.getExtent();
      _ref1 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        start = selection.getBufferRange().start;
        end = start.traverse(extent);
        _results.push(selection.setBufferRange([start, end]));
      }
      return _results;
    };

    return CurrentSelection;

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
      column = cursor.getBufferColumn();
      return this.countTimes((function(_this) {
        return function() {
          var newRow;
          newRow = _.detect(_this.getScanRows(cursor), function(row) {
            return _this.isMovableColumn(row, column);
          });
          if (newRow != null) {
            return cursor.setBufferPosition([newRow, column]);
          }
        };
      })(this));
    };

    MoveUpToNonBlank.prototype.getScanRows = function(cursor) {
      var cursorRow, validRow, _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      cursorRow = cursor.getBufferRow();
      validRow = getValidVimRow.bind(null, this.editor);
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
            for (var _j = _ref2 = validRow(cursorRow + 1), _ref3 = getVimLastBufferRow(this.editor); _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; _ref2 <= _ref3 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    };

    MoveUpToNonBlank.prototype.isMovableColumn = function(row, column) {
      return this.isNonBlankColumn(row, column);
    };

    MoveUpToNonBlank.prototype.isBlankColumn = function(row, column) {
      var text;
      if ((text = this.editor.lineTextForBufferRow(row)[column]) != null) {
        return /\s/.test(text);
      } else {
        return true;
      }
    };

    MoveUpToNonBlank.prototype.isNonBlankColumn = function(row, column) {
      return !this.isBlankColumn(row, column);
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

    MoveUpToEdge.prototype.isMovableColumn = function(row, column) {
      var stoppableAtNextRow, stoppableAtPrevRow;
      if (this.isStoppableColumn(row, column)) {
        if (row === 0 || row === getVimLastBufferRow(this.editor)) {
          return true;
        } else {
          stoppableAtNextRow = this.isStoppableColumn(row + 1, column);
          stoppableAtPrevRow = this.isStoppableColumn(row - 1, column);
          return (!stoppableAtNextRow) || (!stoppableAtPrevRow);
        }
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isValidStoppableColumn = function(row, column) {
      var firstChar, lastChar, match, text;
      text = this.editor.lineTextForBufferRow(row);
      if ((match = text.match(/\S/g)) != null) {
        firstChar = match[0], lastChar = match[match.length - 1];
        return (text.indexOf(firstChar) <= column && column <= text.lastIndexOf(lastChar));
      } else {
        return false;
      }
    };

    MoveUpToEdge.prototype.isStoppableColumn = function(row, column) {
      if (this.isNonBlankColumn(row, column)) {
        return true;
      } else if (this.isValidStoppableColumn(row, column)) {
        return this.isNonBlankColumn(row, column - 1) && this.isNonBlankColumn(row, column + 1);
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

    MoveToNextParagraph.prototype.moveCursor = function(cursor) {
      return this.countTimes(function() {
        return cursor.moveToBeginningOfNextParagraph();
      });
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(_super) {
    __extends(MoveToPreviousParagraph, _super);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.extend();

    MoveToPreviousParagraph.prototype.moveCursor = function(cursor) {
      return this.countTimes(function() {
        return cursor.moveToBeginningOfPreviousParagraph();
      });
    };

    return MoveToPreviousParagraph;

  })(Motion);

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
      this.vimState.operationStack.process();
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
      var c, _i, _len, _ref1, _ref2, _results;
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
          c = _ref2[_i];
          _results.push(this.moveCursor(c));
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

    MoveToPair.prototype.member = ["Parenthesis", "CurlyBracket", "SquareBracket"];

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsNCtEQUFBO0lBQUE7OztzQkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBREQsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBSUEsT0F5QkksT0FBQSxDQUFRLFNBQVIsQ0F6QkosRUFDRSx1QkFBQSxlQURGLEVBQ21CLDZCQUFBLHFCQURuQixFQUVFLHNCQUFBLGNBRkYsRUFFa0IsdUJBQUEsZUFGbEIsRUFHRSxvQkFBQSxZQUhGLEVBR2dCLHNCQUFBLGNBSGhCLEVBSUUseUJBQUEsaUJBSkYsRUFLRSwwQkFBQSxrQkFMRixFQU1FLDhCQUFBLHNCQU5GLEVBT0UsZ0NBQUEsd0JBUEYsRUFPNEIsK0JBQUEsdUJBUDVCLEVBUUUsK0JBQUEsdUJBUkYsRUFRMkIsK0JBQUEsdUJBUjNCLEVBU0UsMkJBQUEsbUJBVEYsRUFTdUIsMkJBQUEsbUJBVHZCLEVBVUUsc0JBQUEsY0FWRixFQVdFLG1CQUFBLFdBWEYsRUFZRSx1Q0FBQSwrQkFaRixFQWFFLGtCQUFBLFVBYkYsRUFjRSxrQ0FBQSwwQkFkRixFQWVFLDZCQUFBLHFCQWZGLEVBZ0JFLHVCQUFBLGVBaEJGLEVBaUJFLHVCQUFBLGVBakJGLEVBa0JFLHFDQUFBLDZCQWxCRixFQW1CRSw0QkFBQSxvQkFuQkYsRUFvQkUscUNBQUEsNkJBcEJGLEVBcUJFLDBCQUFBLGtCQXJCRixFQXNCRSw0QkFBQSxvQkF0QkYsRUF1QkUsb0NBQUEsNEJBdkJGLEVBd0JF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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/motion.coffee
