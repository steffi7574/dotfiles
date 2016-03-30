(function() {
  var Point, Range, WhiteSpaceRegExp, characterAtPoint, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionByScope, distanceForRange, eachSelection, findIndex, flashRanges, fs, getBufferRangeForRowRange, getChangesSinceCheckpoint, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEolBufferPositionForCursor, getEolBufferPositionForRow, getFirstCharacterColumForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromChanges, getNewTextRangeFromCheckpoint, getNonBlankCharPositionForRow, getScopesForTokenizedLine, getTextAtCursor, getTextFromPointToEOL, getTextToPoint, getTokenizedLineForRow, getValidVimRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, haveSomeSelection, include, isAllWhiteSpace, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, markerOptions, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, pick, pointIsAtEndOfLine, pointIsAtVimEndOfFile, rangeToBeginningOfFileFromPoint, rangeToEndOfFileFromPoint, reportCursor, reportSelection, saveEditorState, scanForScopeStart, selectVisibleBy, settings, sortRanges, toggleClassByCondition, unfoldAtCursorRow, withTrackingCursorPositionChange, _, _ref;

  fs = require('fs-plus');

  settings = require('./settings');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  include = function(klass, module) {
    var key, value, _results;
    _results = [];
    for (key in module) {
      value = module[key];
      _results.push(klass.prototype[key] = value);
    }
    return _results;
  };

  debug = function(message) {
    var filePath;
    if (!settings.get('debug')) {
      return;
    }
    message += "\n";
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log(message);
      case 'file':
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, message);
        }
    }
  };

  getNonBlankCharPositionForRow = function(editor, row) {
    var point, scanRange;
    scanRange = editor.bufferRangeForBufferRow(row);
    point = null;
    editor.scanInBufferRange(/^[ \t]*/, scanRange, function(_arg) {
      var range;
      range = _arg.range;
      return point = range.end.translate([0, +1]);
    });
    return point;
  };

  getView = function(model) {
    return atom.views.getView(model);
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = getView(editor);
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayBuffer.findFoldMarkers({}).map(function(m) {
      return editor.displayBuffer.foldForMarker(m).getStartRow();
    });
    return function() {
      var row, _i, _len, _ref1;
      _ref1 = foldStartRows.reverse();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  getKeystrokeForEvent = function(event) {
    var keyboardEvent, _ref1;
    keyboardEvent = (_ref1 = event.originalEvent.originalEvent) != null ? _ref1 : event.originalEvent;
    return atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
  };

  keystrokeToCharCode = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    "delete": 127
  };

  getCharacterForEvent = function(event) {
    var charCode, keystroke;
    keystroke = getKeystrokeForEvent(event);
    if (charCode = keystrokeToCharCode[keystroke]) {
      return String.fromCharCode(charCode);
    } else {
      return keystroke;
    }
  };

  isLinewiseRange = function(range) {
    return (!range.isEmpty()) && (range.start.column === 0) && (range.end.column === 0);
  };

  rangeToBeginningOfFileFromPoint = function(point) {
    return new Range(Point.ZERO, point);
  };

  rangeToEndOfFileFromPoint = function(point) {
    return new Range(point, Point.INFINITY);
  };

  haveSomeSelection = function(selections) {
    return selections.some(function(s) {
      return !s.isEmpty();
    });
  };

  sortRanges = function(ranges) {
    return ranges.sort(function(a, b) {
      return a.compare(b);
    });
  };

  getIndex = function(index, list) {
    if (!list.length) {
      return -1;
    }
    index = index % list.length;
    if (index >= 0) {
      return index;
    } else {
      return list.length + index;
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, startRow, _ref1;
    _ref1 = getView(editor).getVisibleRowRange().map(function(row) {
      return editor.bufferRowForScreenRow(row);
    }), startRow = _ref1[0], endRow = _ref1[1];
    return new Range([startRow, 0], [endRow, Infinity]);
  };

  selectVisibleBy = function(editor, entries, fn) {
    var e, range, _i, _len, _results;
    range = getVisibleBufferRange(editor);
    _results = [];
    for (_i = 0, _len = entries.length; _i < _len; _i++) {
      e = entries[_i];
      if (range.containsRange(fn(e))) {
        _results.push(e);
      }
    }
    return _results;
  };

  eachSelection = function(editor, fn) {
    var s, _i, _len, _ref1, _results;
    _ref1 = editor.getSelections();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      s = _ref1[_i];
      _results.push(fn(s));
    }
    return _results;
  };

  toggleClassByCondition = function(element, klass, condition) {
    var action;
    action = (condition ? 'add' : 'remove');
    return element.classList[action](klass);
  };

  getChangesSinceCheckpoint = function(editor, checkpoint) {
    var history, index;
    history = editor.getBuffer().history;
    if ((index = history.getCheckpointIndex(checkpoint)) != null) {
      return history.undoStack.slice(index);
    } else {
      return [];
    }
  };

  distanceForRange = function(_arg) {
    var column, end, row, start;
    start = _arg.start, end = _arg.end;
    row = end.row - start.row;
    column = end.column - start.column;
    return new Point(row, column);
  };

  getNewTextRangeFromChanges = function(changes) {
    var amount, change, diff, finalRange, newRange, newText, oldRange, oldText, _i, _len;
    finalRange = null;
    for (_i = 0, _len = changes.length; _i < _len; _i++) {
      change = changes[_i];
      if (!(change.newRange != null)) {
        continue;
      }
      oldRange = change.oldRange, oldText = change.oldText, newRange = change.newRange, newText = change.newText;
      if (finalRange == null) {
        if (newText.length) {
          finalRange = newRange.copy();
        }
        continue;
      }
      if (oldText.length && finalRange.containsRange(oldRange)) {
        amount = oldRange;
        diff = distanceForRange(amount);
        if (!(amount.end.row === finalRange.end.row)) {
          diff.column = 0;
        }
        finalRange.end = finalRange.end.translate(diff.negate());
      }
      if (newText.length && finalRange.containsPoint(newRange.start)) {
        amount = newRange;
        diff = distanceForRange(amount);
        if (!(amount.start.row === finalRange.end.row)) {
          diff.column = 0;
        }
        finalRange.end = finalRange.end.translate(diff);
      }
    }
    return finalRange;
  };

  getNewTextRangeFromCheckpoint = function(editor, checkpoint) {
    var changes;
    changes = getChangesSinceCheckpoint(editor, checkpoint);
    return getNewTextRangeFromChanges(changes);
  };

  countChar = function(string, char) {
    return string.split(char).length - 1;
  };

  findIndex = function(list, fn) {
    var e, i, _i, _len;
    for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
      e = list[i];
      if (fn(e)) {
        return i;
      }
    }
    return null;
  };

  mergeIntersectingRanges = function(ranges) {
    var i, index, range, result, _i, _len;
    result = [];
    for (i = _i = 0, _len = ranges.length; _i < _len; i = ++_i) {
      range = ranges[i];
      if (index = findIndex(result, function(r) {
        return r.intersectsWith(range);
      })) {
        result[index] = result[index].union(range);
      } else {
        result.push(range);
      }
    }
    return result;
  };

  getEolBufferPositionForRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  getEolBufferPositionForCursor = function(cursor) {
    return getEolBufferPositionForRow(cursor.editor, cursor.getBufferRow());
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEolBufferPositionForRow(editor, point.row).isEqual(point);
  };

  characterAtPoint = function(editor, point) {
    var char, range;
    range = Range.fromPointWithDelta(point, 0, 1);
    return char = editor.getTextInBufferRange(range);
  };

  getTextAtCursor = function(cursor) {
    var bufferRange, editor;
    editor = cursor.editor;
    bufferRange = editor.bufferRangeForScreenRange(cursor.getScreenRange());
    return editor.getTextInBufferRange(bufferRange);
  };

  cursorIsOnWhiteSpace = function(cursor) {
    return isAllWhiteSpace(getTextAtCursor(cursor));
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var originalPoint;
    originalPoint = cursor.getBufferPosition();
    while (cursorIsOnWhiteSpace(cursor) && (!cursorIsAtVimEndOfFile(cursor))) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getVimEofBufferPosition = function(editor) {
    var row;
    row = editor.getLastBufferRow();
    if (editor.bufferRangeForBufferRow(row).isEmpty()) {
      return getEolBufferPositionForRow(editor, Math.max(0, row - 1));
    } else {
      return editor.getEofBufferPosition();
    }
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  cursorIsAtVimEndOfFile = function(cursor) {
    return pointIsAtVimEndOfFile(cursor.editor, cursor.getBufferPosition());
  };

  cursorIsAtEmptyRow = function(cursor) {
    return cursor.isAtBeginningOfLine() && cursor.isAtEndOfLine();
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return getView(editor).getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return getView(editor).getLastVisibleScreenRow();
  };

  getFirstCharacterColumForBufferRow = function(editor, row) {
    var column, text;
    text = editor.lineTextForBufferRow(row);
    if ((column = text.search(/\S/)) >= 0) {
      return column;
    } else {
      return null;
    }
  };

  cursorIsAtFirstCharacter = function(cursor) {
    var column, editor, firstCharColumn;
    editor = cursor.editor;
    column = cursor.getBufferColumn();
    firstCharColumn = getFirstCharacterColumForBufferRow(editor, cursor.getBufferRow());
    return (firstCharColumn != null) && column === firstCharColumn;
  };

  moveCursor = function(cursor, _arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = _arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && goalColumn) {
      return cursor.goalColumn = goalColumn;
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      return moveCursor(cursor, options, function(c) {
        return c.moveLeft();
      });
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      return moveCursor(cursor, options, function(c) {
        return c.moveRight();
      });
    }
  };

  moveCursorUp = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      return moveCursor(cursor, options, function(c) {
        return cursor.moveUp();
      });
    }
  };

  moveCursorDown = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      return moveCursor(cursor, options, function(c) {
        return cursor.moveDown();
      });
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  unfoldAtCursorRow = function(cursor) {
    var editor, row;
    editor = cursor.editor;
    row = cursor.getBufferRow();
    if (editor.isFoldedAtBufferRow(row)) {
      return editor.unfoldBufferRow(row);
    }
  };

  markerOptions = {
    ivalidate: 'never',
    persistent: false
  };

  flashRanges = function(ranges, options) {
    var decorationOptions, editor, m, markers, r, _i, _len;
    if (!_.isArray(ranges)) {
      ranges = [ranges];
    }
    if (!ranges.length) {
      return;
    }
    editor = options.editor;
    markers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ranges.length; _i < _len; _i++) {
        r = ranges[_i];
        _results.push(editor.markBufferRange(r, markerOptions));
      }
      return _results;
    })();
    decorationOptions = {
      type: 'highlight',
      "class": options["class"]
    };
    for (_i = 0, _len = markers.length; _i < _len; _i++) {
      m = markers[_i];
      editor.decorateMarker(m, decorationOptions);
    }
    return setTimeout(function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
        m = markers[_j];
        _results.push(m.destroy());
      }
      return _results;
    }, options.timeout);
  };

  getValidVimRow = function(editor, row) {
    var vimLastBufferRow;
    vimLastBufferRow = getVimLastBufferRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastBufferRow):
        return vimLastBufferRow;
      default:
        return row;
    }
  };

  pick = function(choice, boolean) {
    if (boolean) {
      return choice[0];
    } else {
      return choice[1];
    }
  };

  clipScreenPositionForBufferPosition = function(editor, bufferPosition, options) {
    var screenPosition, translate;
    screenPosition = editor.screenPositionForBufferPosition(bufferPosition);
    translate = options.translate;
    delete options.translate;
    if (translate) {
      screenPosition = screenPosition.translate(translate);
    }
    return editor.clipScreenPosition(screenPosition, options);
  };

  getTextToPoint = function(editor, _arg, _arg1) {
    var column, exclusive, row;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = true;
    }
    if (exclusive) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getTextFromPointToEOL = function(editor, _arg, _arg1) {
    var column, exclusive, row, start;
    row = _arg.row, column = _arg.column;
    exclusive = (_arg1 != null ? _arg1 : {}).exclusive;
    if (exclusive == null) {
      exclusive = false;
    }
    start = column;
    if (exclusive) {
      start += 1;
    }
    return editor.lineTextForBufferRow(row).slice(start);
  };

  getIndentLevelForBufferRow = function(editor, row) {
    var text;
    text = editor.lineTextForBufferRow(row);
    return editor.indentLevelForLine(text);
  };

  WhiteSpaceRegExp = /^\s*$/;

  isAllWhiteSpace = function(text) {
    return WhiteSpaceRegExp.test(text);
  };

  getCodeFoldRowRanges = function(editor) {
    var _i, _ref1, _results;
    return (function() {
      _results = [];
      for (var _i = 0, _ref1 = editor.getLastBufferRow(); 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 0 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, exclusive) {
    if (exclusive == null) {
      exclusive = false;
    }
    return getCodeFoldRowRanges(editor).filter(function(_arg) {
      var endRow, startRow;
      startRow = _arg[0], endRow = _arg[1];
      if (exclusive) {
        return (startRow < bufferRow && bufferRow <= endRow);
      } else {
        return (startRow <= bufferRow && bufferRow <= endRow);
      }
    });
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var rangeEnd, rangeStart, _ref1;
    _ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), rangeStart = _ref1[0], rangeEnd = _ref1[1];
    return rangeStart.union(rangeEnd);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.displayBuffer.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var tag, _i, _len, _ref1, _results;
    _ref1 = line.tags;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      tag = _ref1[_i];
      if (tag < 0 && (tag % 2 === -1)) {
        _results.push(atom.grammars.scopeForId(tag));
      }
    }
    return _results;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, isValidToken, position, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine, _i, _j, _k, _len, _len1, _len2, _ref1;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var _i, _j, _ref1, _ref2, _ref3, _results, _results1;
      switch (direction) {
        case 'forward':
          return (function() {
            _results = [];
            for (var _i = _ref1 = fromPoint.row, _ref2 = editor.getLastBufferRow(); _ref1 <= _ref2 ? _i <= _ref2 : _i >= _ref2; _ref1 <= _ref2 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        case 'backward':
          return (function() {
            _results1 = [];
            for (var _j = _ref3 = fromPoint.row; _ref3 <= 0 ? _j <= 0 : _j >= 0; _ref3 <= 0 ? _j++ : _j--){ _results1.push(_j); }
            return _results1;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(_arg) {
            var position;
            position = _arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (_i = 0, _len = scanRows.length; _i < _len; _i++) {
      row = scanRows[_i];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      _ref1 = tokenizedLine.tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        tokenIterator.next();
        if (tag > 0) {
          column += (function() {
            switch (false) {
              case !tokenIterator.isHardTab():
                return 1;
              case !tokenIterator.isSoftWrapIndentation():
                return 0;
              default:
                return tag;
            }
          })();
        } else if (tag % 2 === -1) {
          scope = atom.grammars.scopeForId(tag);
          position = new Point(row, column);
          results.push({
            scope: scope,
            position: position,
            stop: stop
          });
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (_k = 0, _len2 = results.length; _k < _len2; _k++) {
        result = results[_k];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionByScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var scopeName;
    scopeName = editor.getGrammar().scopeName;
    switch (scopeName) {
      case 'source.go':
        return /^entity\.name\.function/.test(scope);
      default:
        return /^meta\.function\./.test(scope);
    }
  };

  reportSelection = function(subject, selection) {
    return console.log(subject, selection.getBufferRange().toString());
  };

  reportCursor = function(subject, cursor) {
    return console.log(subject, cursor.getBufferPosition().toString());
  };

  withTrackingCursorPositionChange = function(cursor, fn) {
    var cursorAfter, cursorBefore;
    cursorBefore = cursor.getBufferPosition();
    fn();
    cursorAfter = cursor.getBufferPosition();
    if (!cursorBefore.isEqual(cursorAfter)) {
      return console.log("Changed: " + (cursorBefore.toString()) + " -> " + (cursorAfter.toString()));
    }
  };

  module.exports = {
    include: include,
    debug: debug,
    getNonBlankCharPositionForRow: getNonBlankCharPositionForRow,
    getView: getView,
    saveEditorState: saveEditorState,
    getKeystrokeForEvent: getKeystrokeForEvent,
    getCharacterForEvent: getCharacterForEvent,
    isLinewiseRange: isLinewiseRange,
    rangeToBeginningOfFileFromPoint: rangeToBeginningOfFileFromPoint,
    rangeToEndOfFileFromPoint: rangeToEndOfFileFromPoint,
    haveSomeSelection: haveSomeSelection,
    sortRanges: sortRanges,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    selectVisibleBy: selectVisibleBy,
    eachSelection: eachSelection,
    toggleClassByCondition: toggleClassByCondition,
    getNewTextRangeFromCheckpoint: getNewTextRangeFromCheckpoint,
    findIndex: findIndex,
    mergeIntersectingRanges: mergeIntersectingRanges,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    cursorIsAtVimEndOfFile: cursorIsAtVimEndOfFile,
    characterAtPoint: characterAtPoint,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUp: moveCursorUp,
    moveCursorDown: moveCursorDown,
    unfoldAtCursorRow: unfoldAtCursorRow,
    getEolBufferPositionForRow: getEolBufferPositionForRow,
    getEolBufferPositionForCursor: getEolBufferPositionForCursor,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    flashRanges: flashRanges,
    getValidVimRow: getValidVimRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    countChar: countChar,
    pick: pick,
    clipScreenPositionForBufferPosition: clipScreenPositionForBufferPosition,
    getTextToPoint: getTextToPoint,
    getTextFromPointToEOL: getTextFromPointToEOL,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpace: isAllWhiteSpace,
    getTextAtCursor: getTextAtCursor,
    cursorIsOnWhiteSpace: cursorIsOnWhiteSpace,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    cursorIsAtEmptyRow: cursorIsAtEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    getFirstCharacterColumForBufferRow: getFirstCharacterColumForBufferRow,
    cursorIsAtFirstCharacter: cursorIsAtFirstCharacter,
    isFunctionScope: isFunctionScope,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    getTokenizedLineForRow: getTokenizedLineForRow,
    getScopesForTokenizedLine: getScopesForTokenizedLine,
    scanForScopeStart: scanForScopeStart,
    detectScopeStartPositionByScope: detectScopeStartPositionByScope,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSx5aURBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLE9BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUZSLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQU1BLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDUixRQUFBLG9CQUFBO0FBQUE7U0FBQSxhQUFBOzBCQUFBO0FBQ0Usb0JBQUEsS0FBSyxDQUFBLFNBQUcsQ0FBQSxHQUFBLENBQVIsR0FBZSxNQUFmLENBREY7QUFBQTtvQkFEUTtFQUFBLENBTlYsQ0FBQTs7QUFBQSxFQVVBLEtBQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNOLFFBQUEsUUFBQTtBQUFBLElBQUEsSUFBQSxDQUFBLFFBQXNCLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBZDtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxPQUFBLElBQVcsSUFEWCxDQUFBO0FBRUEsWUFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBUDtBQUFBLFdBQ08sU0FEUDtlQUVJLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUZKO0FBQUEsV0FHTyxNQUhQO0FBSUksUUFBQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLHFCQUFiLENBQWIsQ0FB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/utils.coffee
