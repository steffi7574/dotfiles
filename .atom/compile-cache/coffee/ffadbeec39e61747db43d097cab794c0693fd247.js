(function() {
  var Point, Range, WhiteSpaceRegExp, characterAtBufferPosition, characterAtScreenPosition, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionByScope, distanceForRange, eachSelection, findIndex, flashRanges, fs, getBufferRangeForRowRange, getBufferRows, getChangesSinceCheckpoint, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEolBufferPositionForCursor, getEolBufferPositionForRow, getFirstCharacterColumForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromChanges, getNewTextRangeFromCheckpoint, getNonBlankCharPositionForRow, getScopesForTokenizedLine, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, haveSomeSelection, include, isAllWhiteSpace, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, markerOptions, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, pick, pointIsAtEndOfLine, pointIsAtVimEndOfFile, rangeToBeginningOfFileFromPoint, rangeToEndOfFileFromPoint, reportCursor, reportSelection, saveEditorState, scanForScopeStart, selectVisibleBy, settings, sortRanges, toggleClassByCondition, unfoldAtCursorRow, withTrackingCursorPositionChange, _, _ref;

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

  haveSomeSelection = function(editor) {
    return editor.getSelections().some(function(s) {
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

  characterAtBufferPosition = function(editor, point) {
    var range;
    range = Range.fromPointWithDelta(point, 0, 1);
    return editor.getTextInBufferRange(range);
  };

  characterAtScreenPosition = function(editor, point) {
    var range, screenRange;
    screenRange = Range.fromPointWithDelta(point, 0, 1);
    range = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(range);
  };

  getTextAtCursor = function(cursor) {
    var bufferRange, editor;
    editor = cursor.editor;
    bufferRange = editor.bufferRangeForScreenRange(cursor.getScreenRange());
    return editor.getTextInBufferRange(bufferRange);
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
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

  getBufferRows = function(editor, _arg) {
    var direction, endRow, includeStartRow, startRow, _i, _ref1, _results;
    startRow = _arg.startRow, direction = _arg.direction, includeStartRow = _arg.includeStartRow;
    if (!includeStartRow) {
      startRow += (direction === 'next' ? +1 : -1);
    }
    endRow = (function() {
      switch (direction) {
        case 'previous':
          return 0;
        case 'next':
          return getVimLastBufferRow(editor);
      }
    })();
    return (function() {
      _results = [];
      for (var _i = _ref1 = getValidVimBufferRow(editor, startRow); _ref1 <= endRow ? _i <= endRow : _i >= endRow; _ref1 <= endRow ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this);
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

  getValidVimBufferRow = function(editor, row) {
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

  getValidVimScreenRow = function(editor, row) {
    var vimLastScreenRow;
    vimLastScreenRow = getVimLastScreenRow(editor);
    switch (false) {
      case !(row < 0):
        return 0;
      case !(row > vimLastScreenRow):
        return vimLastScreenRow;
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
    characterAtBufferPosition: characterAtBufferPosition,
    characterAtScreenPosition: characterAtScreenPosition,
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
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    countChar: countChar,
    pick: pick,
    clipScreenPositionForBufferPosition: clipScreenPositionForBufferPosition,
    getTextToPoint: getTextToPoint,
    getTextFromPointToEOL: getTextFromPointToEOL,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpace: isAllWhiteSpace,
    getTextAtCursor: getTextAtCursor,
    getTextInScreenRange: getTextInScreenRange,
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
    getBufferRows: getBufferRows,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSw4b0RBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLE9BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUZSLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQU1BLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDUixRQUFBLG9CQUFBO0FBQUE7U0FBQSxhQUFBOzBCQUFBO0FBQ0Usb0JBQUEsS0FBSyxDQUFBLFNBQUcsQ0FBQSxHQUFBLENBQVIsR0FBZSxNQUFmLENBREY7QUFBQTtvQkFEUTtFQUFBLENBTlYsQ0FBQTs7QUFBQSxFQVVBLEtBQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNOLFFBQUEsUUFBQTtBQUFBLElBQUEsSUFBQSxDQUFBLFFBQXNCLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBZDtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxPQUFBLElBQVcsSUFEWCxDQUFBO0FBRUEsWUFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBUDtBQUFBLFdBQ08sU0FEUDtlQUVJLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUZKO0FBQUEsV0FHTyxNQUhQO0FBSUksUUFBQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLHFCQUFiLENBQWIsQ0FB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/utils.coffee
