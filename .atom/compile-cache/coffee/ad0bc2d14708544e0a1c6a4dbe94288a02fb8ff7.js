(function() {
  var Point, Range, WhiteSpaceRegExp, characterAtBufferPosition, characterAtScreenPosition, clipScreenPositionForBufferPosition, countChar, cursorIsAtEmptyRow, cursorIsAtFirstCharacter, cursorIsAtVimEndOfFile, cursorIsOnWhiteSpace, debug, detectScopeStartPositionByScope, distanceForRange, eachSelection, findIndex, flashRanges, fs, getBufferRangeForRowRange, getBufferRows, getChangesSinceCheckpoint, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEolBufferPositionForCursor, getEolBufferPositionForRow, getFirstCharacterColumForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeystrokeForEvent, getLastVisibleScreenRow, getNewTextRangeFromChanges, getNewTextRangeFromCheckpoint, getNonBlankCharPositionForRow, getScopesForTokenizedLine, getTextAtCursor, getTextFromPointToEOL, getTextInScreenRange, getTextToPoint, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getView, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, haveSomeSelection, include, isAllWhiteSpace, isFunctionScope, isIncludeFunctionScopeForRow, isLinewiseRange, keystrokeToCharCode, markerOptions, mergeIntersectingRanges, moveCursor, moveCursorDown, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUp, pick, pointIsAtEndOfLine, pointIsAtVimEndOfFile, preserveSelectionStartPoints, rangeToBeginningOfFileFromPoint, rangeToEndOfFileFromPoint, reportCursor, reportSelection, saveEditorState, scanForScopeStart, selectVisibleBy, settings, sortRanges, toggleClassByCondition, unfoldAtCursorRow, withTrackingCursorPositionChange, _, _ref;

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
    return editor.getSelections().some(function(selection) {
      return !selection.isEmpty();
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
    var selection, _i, _len, _ref1, _results;
    _ref1 = editor.getSelections();
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      selection = _ref1[_i];
      _results.push(fn(selection));
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
      return moveCursor(cursor, options, function(cursor) {
        return cursor.moveLeft();
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
      return moveCursor(cursor, options, function(cursor) {
        return cursor.moveRight();
      });
    }
  };

  moveCursorUp = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      return moveCursor(cursor, options, function(cursor) {
        return cursor.moveUp();
      });
    }
  };

  moveCursorDown = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      return moveCursor(cursor, options, function(cursor) {
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

  preserveSelectionStartPoints = function(editor) {
    var rangeBySelection, selection, _i, _len, _ref1;
    rangeBySelection = new Map;
    _ref1 = editor.getSelections();
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      selection = _ref1[_i];
      rangeBySelection.set(selection, selection.getBufferRange());
    }
    return function(selection) {
      var point;
      point = rangeBySelection.get(selection).start;
      return selection.cursor.setBufferPosition(point);
    };
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
    preserveSelectionStartPoints: preserveSelectionStartPoints,
    reportSelection: reportSelection,
    reportCursor: reportCursor,
    withTrackingCursorPositionChange: withTrackingCursorPositionChange
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSw0cURBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLE9BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUZSLENBQUE7O0FBQUEsRUFHQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBSEosQ0FBQTs7QUFBQSxFQU1BLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxNQUFSLEdBQUE7QUFDUixRQUFBLG9CQUFBO0FBQUE7U0FBQSxhQUFBOzBCQUFBO0FBQ0Usb0JBQUEsS0FBSyxDQUFBLFNBQUcsQ0FBQSxHQUFBLENBQVIsR0FBZSxNQUFmLENBREY7QUFBQTtvQkFEUTtFQUFBLENBTlYsQ0FBQTs7QUFBQSxFQVVBLEtBQUEsR0FBUSxTQUFDLE9BQUQsR0FBQTtBQUNOLFFBQUEsUUFBQTtBQUFBLElBQUEsSUFBQSxDQUFBLFFBQXNCLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBZDtBQUFBLFlBQUEsQ0FBQTtLQUFBO0FBQUEsSUFDQSxPQUFBLElBQVcsSUFEWCxDQUFBO0FBRUEsWUFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBUDtBQUFBLFdBQ08sU0FEUDtlQUVJLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUZKO0FBQUEsV0FHTyxNQUhQO0FBSUksUUFBQSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLHFCQUFiLENBQWIsQ0FBWCxDQUFBO0FBQ0EsUUFBQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxDQUFIO2lCQUNFLEVBQUUsQ0FBQyxjQUFILENBQWtCLFFBQWxCLEVBQTRCLE9BQTVCLEVBREY7U0FMSjtBQUFBLEtBSE07RUFBQSxDQVZSLENBQUE7O0FBQUEsRUFxQkEsNkJBQUEsR0FBZ0MsU0FBQyxNQUFELEVBQVMsR0FBVCxHQUFBO0FBQzlCLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsQ0FBWixDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsSUFEUixDQUFBO0FBQUEsSUFFQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsU0FBekIsRUFBb0MsU0FBcEMsRUFBK0MsU0FBQyxJQUFELEdBQUE7QUFDN0MsVUFBQSxLQUFBO0FBQUEsTUFEK0MsUUFBRCxLQUFDLEtBQy9DLENBQUE7YUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFWLENBQW9CLENBQUMsQ0FBRCxFQUFJLENBQUEsQ0FBSixDQUFwQixFQURxQztJQUFBLENBQS9DLENBRkEsQ0FBQTtXQUlBLE1BTDhCO0VBQUEsQ0FyQmhDLENBQUE7O0FBQUEsRUE0QkEsT0FBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO1dBQ1IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLEtBQW5CLEVBRFE7RUFBQSxDQTVCVixDQUFBOztBQUFBLEVBZ0NBLGVBQUEsR0FBa0IsU0FBQyxNQUFELEdBQUE7QUFDaEIsUUFBQSx1Q0FBQTtBQUFBLElBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsTUFBUixDQUFoQixDQUFBO0FBQUEsSUFDQSxTQUFBLEdBQVksYUFBYSxDQUFDLFlBQWQsQ0FBQSxDQURaLENBQUE7QUFBQSxJQUVBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUFyQixDQUFxQyxFQUFyQyxDQUF3QyxDQUFDLEdBQXpDLENBQTZDLFNBQUMsQ0FBRCxHQUFBO2FBQzNELE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBckIsQ0FBbUMsQ0FBbkMsQ0FBcUMsQ0FBQyxXQUF0QyxDQUFBLEVBRDJEO0lBQUEsQ0FBN0MsQ0FGaEIsQ0FBQTtXQUlBLFNBQUEsR0FBQTtBQUNFLFVBQUEsb0JBQUE7QUFBQTtBQUFBLFdBQUEsNENBQUE7d0JBQUE7WUFBd0MsQ0FBQSxNQUFVLENBQUMsbUJBQVAsQ0FBMkIsR0FBM0I7QUFDMUMsVUFBQSxNQUFNLENBQUMsYUFBUCxDQUFxQixHQUFyQixDQUFBO1NBREY7QUFBQSxPQUFBO2FBRUEsYUFBYSxDQUFDLFlBQWQsQ0FBMkIsU0FBM0IsRUFIRjtJQUFBLEVBTGdCO0VBQUEsQ0FoQ2xCLENBQUE7O0FBQUEsRUEwQ0Esb0JBQUEsR0FBdUIsU0FBQyxLQUFELEdBQUE7QUFDckIsUUFBQSxvQkFBQTtBQUFBLElBQUEsYUFBQSxpRUFBb0QsS0FBSyxDQUFDLGFBQTFELENBQUE7V0FDQSxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUFiLENBQXVDLGFBQXZDLEVBRnFCO0VBQUEsQ0ExQ3ZCLENBQUE7O0FBQUEsRUE4Q0EsbUJBQUEsR0FDRTtBQUFBLElBQUEsU0FBQSxFQUFXLENBQVg7QUFBQSxJQUNBLEdBQUEsRUFBSyxDQURMO0FBQUEsSUFFQSxLQUFBLEVBQU8sRUFGUDtBQUFBLElBR0EsTUFBQSxFQUFRLEVBSFI7QUFBQSxJQUlBLEtBQUEsRUFBTyxFQUpQO0FBQUEsSUFLQSxRQUFBLEVBQVEsR0FMUjtHQS9DRixDQUFBOztBQUFBLEVBc0RBLG9CQUFBLEdBQXVCLFNBQUMsS0FBRCxHQUFBO0FBQ3JCLFFBQUEsbUJBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxvQkFBQSxDQUFxQixLQUFyQixDQUFaLENBQUE7QUFDQSxJQUFBLElBQUcsUUFBQSxHQUFXLG1CQUFvQixDQUFBLFNBQUEsQ0FBbEM7YUFDRSxNQUFNLENBQUMsWUFBUCxDQUFvQixRQUFwQixFQURGO0tBQUEsTUFBQTthQUdFLFVBSEY7S0FGcUI7RUFBQSxDQXREdkIsQ0FBQTs7QUFBQSxFQTZEQSxlQUFBLEdBQWtCLFNBQUMsS0FBRCxHQUFBO1dBQ2hCLENBQUMsQ0FBQSxLQUFTLENBQUMsT0FBTixDQUFBLENBQUwsQ0FBQSxJQUEwQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixLQUFzQixDQUF2QixDQUExQixJQUF3RCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBVixLQUFvQixDQUFyQixFQUR4QztFQUFBLENBN0RsQixDQUFBOztBQUFBLEVBZ0VBLCtCQUFBLEdBQWtDLFNBQUMsS0FBRCxHQUFBO1dBQzVCLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxJQUFaLEVBQWtCLEtBQWxCLEVBRDRCO0VBQUEsQ0FoRWxDLENBQUE7O0FBQUEsRUFtRUEseUJBQUEsR0FBNEIsU0FBQyxLQUFELEdBQUE7V0FDdEIsSUFBQSxLQUFBLENBQU0sS0FBTixFQUFhLEtBQUssQ0FBQyxRQUFuQixFQURzQjtFQUFBLENBbkU1QixDQUFBOztBQUFBLEVBc0VBLGlCQUFBLEdBQW9CLFNBQUMsTUFBRCxHQUFBO1dBQ2xCLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixTQUFDLFNBQUQsR0FBQTthQUFlLENBQUEsU0FBYSxDQUFDLE9BQVYsQ0FBQSxFQUFuQjtJQUFBLENBQTVCLEVBRGtCO0VBQUEsQ0F0RXBCLENBQUE7O0FBQUEsRUF5RUEsVUFBQSxHQUFhLFNBQUMsTUFBRCxHQUFBO1dBQ1gsTUFBTSxDQUFDLElBQVAsQ0FBWSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7YUFBVSxDQUFDLENBQUMsT0FBRixDQUFVLENBQVYsRUFBVjtJQUFBLENBQVosRUFEVztFQUFBLENBekViLENBQUE7O0FBQUEsRUE4RUEsUUFBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNULElBQUEsSUFBQSxDQUFBLElBQXFCLENBQUMsTUFBdEI7QUFBQSxhQUFPLENBQUEsQ0FBUCxDQUFBO0tBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BRHJCLENBQUE7QUFFQSxJQUFBLElBQUksS0FBQSxJQUFTLENBQWI7YUFBcUIsTUFBckI7S0FBQSxNQUFBO2FBQWlDLElBQUksQ0FBQyxNQUFMLEdBQWMsTUFBL0M7S0FIUztFQUFBLENBOUVYLENBQUE7O0FBQUEsRUFtRkEscUJBQUEsR0FBd0IsU0FBQyxNQUFELEdBQUE7QUFDdEIsUUFBQSx1QkFBQTtBQUFBLElBQUEsUUFBcUIsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLGtCQUFoQixDQUFBLENBQW9DLENBQUMsR0FBckMsQ0FBeUMsU0FBQyxHQUFELEdBQUE7YUFDNUQsTUFBTSxDQUFDLHFCQUFQLENBQTZCLEdBQTdCLEVBRDREO0lBQUEsQ0FBekMsQ0FBckIsRUFBQyxtQkFBRCxFQUFXLGlCQUFYLENBQUE7V0FFSSxJQUFBLEtBQUEsQ0FBTSxDQUFDLFFBQUQsRUFBVyxDQUFYLENBQU4sRUFBcUIsQ0FBQyxNQUFELEVBQVMsUUFBVCxDQUFyQixFQUhrQjtFQUFBLENBbkZ4QixDQUFBOztBQUFBLEVBeUZBLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixFQUFsQixHQUFBO0FBQ2hCLFFBQUEsNEJBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxxQkFBQSxDQUFzQixNQUF0QixDQUFSLENBQUE7QUFDQztTQUFBLDhDQUFBO3NCQUFBO1VBQXdCLEtBQUssQ0FBQyxhQUFOLENBQW9CLEVBQUEsQ0FBRyxDQUFILENBQXBCO0FBQXhCLHNCQUFBLEVBQUE7T0FBQTtBQUFBO29CQUZlO0VBQUEsQ0F6RmxCLENBQUE7O0FBQUEsRUE2RkEsYUFBQSxHQUFnQixTQUFDLE1BQUQsRUFBUyxFQUFULEdBQUE7QUFDZCxRQUFBLG9DQUFBO0FBQUE7QUFBQTtTQUFBLDRDQUFBOzRCQUFBO0FBQ0Usb0JBQUEsRUFBQSxDQUFHLFNBQUgsRUFBQSxDQURGO0FBQUE7b0JBRGM7RUFBQSxDQTdGaEIsQ0FBQTs7QUFBQSxFQWlHQSxzQkFBQSxHQUF5QixTQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWlCLFNBQWpCLEdBQUE7QUFDdkIsUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBSSxTQUFILEdBQWtCLEtBQWxCLEdBQTZCLFFBQTlCLENBQVQsQ0FBQTtXQUNBLE9BQU8sQ0FBQyxTQUFVLENBQUEsTUFBQSxDQUFsQixDQUEwQixLQUExQixFQUZ1QjtFQUFBLENBakd6QixDQUFBOztBQUFBLEVBdUdBLHlCQUFBLEdBQTRCLFNBQUMsTUFBRCxFQUFTLFVBQVQsR0FBQTtBQUMxQixRQUFBLGNBQUE7QUFBQSxJQUFDLFVBQVcsTUFBTSxDQUFDLFNBQVAsQ0FBQSxFQUFYLE9BQUQsQ0FBQTtBQUNBLElBQUEsSUFBRyx3REFBSDthQUNFLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBbEIsQ0FBd0IsS0FBeEIsRUFERjtLQUFBLE1BQUE7YUFHRSxHQUhGO0tBRjBCO0VBQUEsQ0F2RzVCLENBQUE7O0FBQUEsRUFpSEEsZ0JBQUEsR0FBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsUUFBQSx1QkFBQTtBQUFBLElBRG1CLGFBQUEsT0FBTyxXQUFBLEdBQzFCLENBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsR0FBSixHQUFVLEtBQUssQ0FBQyxHQUF0QixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsR0FBRyxDQUFDLE1BQUosR0FBYSxLQUFLLENBQUMsTUFENUIsQ0FBQTtXQUVJLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxNQUFYLEVBSGE7RUFBQSxDQWpIbkIsQ0FBQTs7QUFBQSxFQXNIQSwwQkFBQSxHQUE2QixTQUFDLE9BQUQsR0FBQTtBQUMzQixRQUFBLGdGQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBO0FBQ0EsU0FBQSw4Q0FBQTsyQkFBQTtZQUEyQjs7T0FDekI7QUFBQSxNQUFDLGtCQUFBLFFBQUQsRUFBVyxpQkFBQSxPQUFYLEVBQW9CLGtCQUFBLFFBQXBCLEVBQThCLGlCQUFBLE9BQTlCLENBQUE7QUFDQSxNQUFBLElBQU8sa0JBQVA7QUFDRSxRQUFBLElBQWdDLE9BQU8sQ0FBQyxNQUF4QztBQUFBLFVBQUEsVUFBQSxHQUFhLFFBQVEsQ0FBQyxJQUFULENBQUEsQ0FBYixDQUFBO1NBQUE7QUFDQSxpQkFGRjtPQURBO0FBS0EsTUFBQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLElBQW1CLFVBQVUsQ0FBQyxhQUFYLENBQXlCLFFBQXpCLENBQXRCO0FBQ0UsUUFBQSxNQUFBLEdBQVMsUUFBVCxDQUFBO0FBQUEsUUFDQSxJQUFBLEdBQU8sZ0JBQUEsQ0FBaUIsTUFBakIsQ0FEUCxDQUFBO0FBRUEsUUFBQSxJQUFBLENBQUEsQ0FBd0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFYLEtBQWtCLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBbEMsQ0FBdkI7QUFBQSxVQUFBLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBZCxDQUFBO1NBRkE7QUFBQSxRQUdBLFVBQVUsQ0FBQyxHQUFYLEdBQWlCLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBZixDQUF5QixJQUFJLENBQUMsTUFBTCxDQUFBLENBQXpCLENBSGpCLENBREY7T0FMQTtBQVdBLE1BQUEsSUFBRyxPQUFPLENBQUMsTUFBUixJQUFtQixVQUFVLENBQUMsYUFBWCxDQUF5QixRQUFRLENBQUMsS0FBbEMsQ0FBdEI7QUFDRSxRQUFBLE1BQUEsR0FBUyxRQUFULENBQUE7QUFBQSxRQUNBLElBQUEsR0FBTyxnQkFBQSxDQUFpQixNQUFqQixDQURQLENBQUE7QUFFQSxRQUFBLElBQUEsQ0FBQSxDQUF3QixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQWIsS0FBb0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFwQyxDQUF2QjtBQUFBLFVBQUEsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFkLENBQUE7U0FGQTtBQUFBLFFBR0EsVUFBVSxDQUFDLEdBQVgsR0FBaUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFmLENBQXlCLElBQXpCLENBSGpCLENBREY7T0FaRjtBQUFBLEtBREE7V0FrQkEsV0FuQjJCO0VBQUEsQ0F0SDdCLENBQUE7O0FBQUEsRUEySUEsNkJBQUEsR0FBZ0MsU0FBQyxNQUFELEVBQVMsVUFBVCxHQUFBO0FBQzlCLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLHlCQUFBLENBQTBCLE1BQTFCLEVBQWtDLFVBQWxDLENBQVYsQ0FBQTtXQUNBLDBCQUFBLENBQTJCLE9BQTNCLEVBRjhCO0VBQUEsQ0EzSWhDLENBQUE7O0FBQUEsRUFnSkEsU0FBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLElBQVQsR0FBQTtXQUNWLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixDQUFrQixDQUFDLE1BQW5CLEdBQTRCLEVBRGxCO0VBQUEsQ0FoSlosQ0FBQTs7QUFBQSxFQW1KQSxTQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sRUFBUCxHQUFBO0FBQ1YsUUFBQSxjQUFBO0FBQUEsU0FBQSxtREFBQTtrQkFBQTtVQUFzQixFQUFBLENBQUcsQ0FBSDtBQUNwQixlQUFPLENBQVA7T0FERjtBQUFBLEtBQUE7V0FFQSxLQUhVO0VBQUEsQ0FuSlosQ0FBQTs7QUFBQSxFQXdKQSx1QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtBQUN4QixRQUFBLGlDQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsRUFBVCxDQUFBO0FBQ0EsU0FBQSxxREFBQTt3QkFBQTtBQUNFLE1BQUEsSUFBRyxLQUFBLEdBQVEsU0FBQSxDQUFVLE1BQVYsRUFBa0IsU0FBQyxDQUFELEdBQUE7ZUFBTyxDQUFDLENBQUMsY0FBRixDQUFpQixLQUFqQixFQUFQO01BQUEsQ0FBbEIsQ0FBWDtBQUNFLFFBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUCxHQUFnQixNQUFPLENBQUEsS0FBQSxDQUFNLENBQUMsS0FBZCxDQUFvQixLQUFwQixDQUFoQixDQURGO09BQUEsTUFBQTtBQUdFLFFBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLENBQUEsQ0FIRjtPQURGO0FBQUEsS0FEQTtXQU1BLE9BUHdCO0VBQUEsQ0F4SjFCLENBQUE7O0FBQUEsRUFpS0EsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsR0FBVCxHQUFBO1dBQzNCLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixDQUFtQyxDQUFDLElBRFQ7RUFBQSxDQWpLN0IsQ0FBQTs7QUFBQSxFQW9LQSw2QkFBQSxHQUFnQyxTQUFDLE1BQUQsR0FBQTtXQUM5QiwwQkFBQSxDQUEyQixNQUFNLENBQUMsTUFBbEMsRUFBMEMsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUExQyxFQUQ4QjtFQUFBLENBcEtoQyxDQUFBOztBQUFBLEVBdUtBLGtCQUFBLEdBQXFCLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTtBQUNuQixJQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUFSLENBQUE7V0FDQSwwQkFBQSxDQUEyQixNQUEzQixFQUFtQyxLQUFLLENBQUMsR0FBekMsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFzRCxLQUF0RCxFQUZtQjtFQUFBLENBdktyQixDQUFBOztBQUFBLEVBMktBLHlCQUFBLEdBQTRCLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTtBQUMxQixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkMsQ0FBUixDQUFBO1dBQ0EsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLEVBRjBCO0VBQUEsQ0EzSzVCLENBQUE7O0FBQUEsRUErS0EseUJBQUEsR0FBNEIsU0FBQyxNQUFELEVBQVMsS0FBVCxHQUFBO0FBQzFCLFFBQUEsa0JBQUE7QUFBQSxJQUFBLFdBQUEsR0FBYyxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBbkMsQ0FBZCxDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsTUFBTSxDQUFDLHlCQUFQLENBQWlDLFdBQWpDLENBRFIsQ0FBQTtXQUVBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QixFQUgwQjtFQUFBLENBL0s1QixDQUFBOztBQUFBLEVBb0xBLGVBQUEsR0FBa0IsU0FBQyxNQUFELEdBQUE7QUFDaEIsUUFBQSxtQkFBQTtBQUFBLElBQUMsU0FBVSxPQUFWLE1BQUQsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxNQUFNLENBQUMsY0FBUCxDQUFBLENBQWpDLENBRGQsQ0FBQTtXQUVBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixXQUE1QixFQUhnQjtFQUFBLENBcExsQixDQUFBOztBQUFBLEVBeUxBLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLFdBQVQsR0FBQTtBQUNyQixRQUFBLFdBQUE7QUFBQSxJQUFBLFdBQUEsR0FBYyxNQUFNLENBQUMseUJBQVAsQ0FBaUMsV0FBakMsQ0FBZCxDQUFBO1dBQ0EsTUFBTSxDQUFDLG9CQUFQLENBQTRCLFdBQTVCLEVBRnFCO0VBQUEsQ0F6THZCLENBQUE7O0FBQUEsRUE2TEEsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEdBQUE7V0FDckIsZUFBQSxDQUFnQixlQUFBLENBQWdCLE1BQWhCLENBQWhCLEVBRHFCO0VBQUEsQ0E3THZCLENBQUE7O0FBQUEsRUFpTUEsNkJBQUEsR0FBZ0MsU0FBQyxNQUFELEdBQUE7QUFDOUIsUUFBQSxhQUFBO0FBQUEsSUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQWhCLENBQUE7QUFDQSxXQUFNLG9CQUFBLENBQXFCLE1BQXJCLENBQUEsSUFBaUMsQ0FBQyxDQUFBLHNCQUFJLENBQXVCLE1BQXZCLENBQUwsQ0FBdkMsR0FBQTtBQUNFLE1BQUEsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFBLENBREY7SUFBQSxDQURBO1dBR0EsQ0FBQSxhQUFpQixDQUFDLE9BQWQsQ0FBc0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdEIsRUFKMEI7RUFBQSxDQWpNaEMsQ0FBQTs7QUFBQSxFQXVNQSxhQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLElBQVQsR0FBQTtBQUNkLFFBQUEsaUVBQUE7QUFBQSxJQUR3QixnQkFBQSxVQUFVLGlCQUFBLFdBQVcsdUJBQUEsZUFDN0MsQ0FBQTtBQUFBLElBQUEsSUFBQSxDQUFBLGVBQUE7QUFDRSxNQUFBLFFBQUEsSUFBWSxDQUFJLFNBQUEsS0FBYSxNQUFoQixHQUE0QixDQUFBLENBQTVCLEdBQW9DLENBQUEsQ0FBckMsQ0FBWixDQURGO0tBQUE7QUFBQSxJQUdBLE1BQUE7QUFBUyxjQUFPLFNBQVA7QUFBQSxhQUNGLFVBREU7aUJBQ2MsRUFEZDtBQUFBLGFBRUYsTUFGRTtpQkFFVSxtQkFBQSxDQUFvQixNQUFwQixFQUZWO0FBQUE7UUFIVCxDQUFBO1dBTUE7Ozs7bUJBUGM7RUFBQSxDQXZNaEIsQ0FBQTs7QUFBQSxFQXNOQSx1QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtBQUN4QixRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUFOLENBQUE7QUFDQSxJQUFBLElBQUcsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CLENBQW1DLENBQUMsT0FBcEMsQ0FBQSxDQUFIO2FBQ0UsMEJBQUEsQ0FBMkIsTUFBM0IsRUFBbUMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksR0FBQSxHQUFNLENBQWxCLENBQW5DLEVBREY7S0FBQSxNQUFBO2FBR0UsTUFBTSxDQUFDLG9CQUFQLENBQUEsRUFIRjtLQUZ3QjtFQUFBLENBdE4xQixDQUFBOztBQUFBLEVBNk5BLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTtXQUN0Qix1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDLE9BQWhDLENBQXdDLEtBQXhDLEVBRHNCO0VBQUEsQ0E3TnhCLENBQUE7O0FBQUEsRUFnT0Esc0JBQUEsR0FBeUIsU0FBQyxNQUFELEdBQUE7V0FDdkIscUJBQUEsQ0FBc0IsTUFBTSxDQUFDLE1BQTdCLEVBQXFDLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQXJDLEVBRHVCO0VBQUEsQ0FoT3pCLENBQUE7O0FBQUEsRUFtT0Esa0JBQUEsR0FBcUIsU0FBQyxNQUFELEdBQUE7V0FDbkIsTUFBTSxDQUFDLG1CQUFQLENBQUEsQ0FBQSxJQUFpQyxNQUFNLENBQUMsYUFBUCxDQUFBLEVBRGQ7RUFBQSxDQW5PckIsQ0FBQTs7QUFBQSxFQXNPQSxtQkFBQSxHQUFzQixTQUFDLE1BQUQsR0FBQTtXQUNwQix1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDLElBRFo7RUFBQSxDQXRPdEIsQ0FBQTs7QUFBQSxFQXlPQSx1QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtXQUN4QixNQUFNLENBQUMsK0JBQVAsQ0FBdUMsdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBdkMsRUFEd0I7RUFBQSxDQXpPMUIsQ0FBQTs7QUFBQSxFQTRPQSxtQkFBQSxHQUFzQixTQUFDLE1BQUQsR0FBQTtXQUNwQix1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDLElBRFo7RUFBQSxDQTVPdEIsQ0FBQTs7QUFBQSxFQStPQSx3QkFBQSxHQUEyQixTQUFDLE1BQUQsR0FBQTtXQUN6QixPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsd0JBQWhCLENBQUEsRUFEeUI7RUFBQSxDQS9PM0IsQ0FBQTs7QUFBQSxFQWtQQSx1QkFBQSxHQUEwQixTQUFDLE1BQUQsR0FBQTtXQUN4QixPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsdUJBQWhCLENBQUEsRUFEd0I7RUFBQSxDQWxQMUIsQ0FBQTs7QUFBQSxFQXFQQSxrQ0FBQSxHQUFxQyxTQUFDLE1BQUQsRUFBUyxHQUFULEdBQUE7QUFDbkMsUUFBQSxZQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLEdBQTVCLENBQVAsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFDLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTCxDQUFZLElBQVosQ0FBVixDQUFBLElBQWdDLENBQW5DO2FBQ0UsT0FERjtLQUFBLE1BQUE7YUFHRSxLQUhGO0tBRm1DO0VBQUEsQ0FyUHJDLENBQUE7O0FBQUEsRUE0UEEsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEdBQUE7QUFDekIsUUFBQSwrQkFBQTtBQUFBLElBQUMsU0FBVSxPQUFWLE1BQUQsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLE1BQU0sQ0FBQyxlQUFQLENBQUEsQ0FEVCxDQUFBO0FBQUEsSUFFQSxlQUFBLEdBQWtCLGtDQUFBLENBQW1DLE1BQW5DLEVBQTJDLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBM0MsQ0FGbEIsQ0FBQTtXQUdBLHlCQUFBLElBQXFCLE1BQUEsS0FBVSxnQkFKTjtFQUFBLENBNVAzQixDQUFBOztBQUFBLEVBb1FBLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxJQUFULEVBQStCLEVBQS9CLEdBQUE7QUFDWCxRQUFBLDhCQUFBO0FBQUEsSUFEcUIscUJBQUQsS0FBQyxrQkFDckIsQ0FBQTtBQUFBLElBQUMsYUFBYyxPQUFkLFVBQUQsQ0FBQTtBQUFBLElBQ0EsRUFBQSxDQUFHLE1BQUgsQ0FEQSxDQUFBO0FBRUEsSUFBQSxJQUFHLGtCQUFBLElBQXVCLFVBQTFCO2FBQ0UsTUFBTSxDQUFDLFVBQVAsR0FBb0IsV0FEdEI7S0FIVztFQUFBLENBcFFiLENBQUE7O0FBQUEsRUE2UUEsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxPQUFULEdBQUE7QUFDZixRQUFBLFNBQUE7O01BRHdCLFVBQVE7S0FDaEM7QUFBQSxJQUFDLFlBQWEsUUFBYixTQUFELENBQUE7QUFBQSxJQUNBLE1BQUEsQ0FBQSxPQUFjLENBQUMsU0FEZixDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsTUFBVSxDQUFDLG1CQUFQLENBQUEsQ0FBSixJQUFvQyxTQUF2QzthQUNFLFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLFNBQUMsTUFBRCxHQUFBO2VBQzFCLE1BQU0sQ0FBQyxRQUFQLENBQUEsRUFEMEI7TUFBQSxDQUE1QixFQURGO0tBSGU7RUFBQSxDQTdRakIsQ0FBQTs7QUFBQSxFQW9SQSxlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtBQUNoQixRQUFBLFNBQUE7O01BRHlCLFVBQVE7S0FDakM7QUFBQSxJQUFDLFlBQWEsUUFBYixTQUFELENBQUE7QUFBQSxJQUNBLE1BQUEsQ0FBQSxPQUFjLENBQUMsU0FEZixDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsTUFBVSxDQUFDLGFBQVAsQ0FBQSxDQUFKLElBQThCLFNBQWpDO2FBQ0UsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsU0FBQyxNQUFELEdBQUE7ZUFDMUIsTUFBTSxDQUFDLFNBQVAsQ0FBQSxFQUQwQjtNQUFBLENBQTVCLEVBREY7S0FIZ0I7RUFBQSxDQXBSbEIsQ0FBQTs7QUFBQSxFQTJSQSxZQUFBLEdBQWUsU0FBQyxNQUFELEVBQVMsT0FBVCxHQUFBOztNQUFTLFVBQVE7S0FDOUI7QUFBQSxJQUFBLElBQU8sTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLEtBQXlCLENBQWhDO2FBQ0UsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsU0FBQyxNQUFELEdBQUE7ZUFDMUIsTUFBTSxDQUFDLE1BQVAsQ0FBQSxFQUQwQjtNQUFBLENBQTVCLEVBREY7S0FEYTtFQUFBLENBM1JmLENBQUE7O0FBQUEsRUFnU0EsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxPQUFULEdBQUE7O01BQVMsVUFBUTtLQUNoQztBQUFBLElBQUEsSUFBTyxtQkFBQSxDQUFvQixNQUFNLENBQUMsTUFBM0IsQ0FBQSxLQUFzQyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQTdDO2FBQ0UsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsU0FBQyxNQUFELEdBQUE7ZUFDMUIsTUFBTSxDQUFDLFFBQVAsQ0FBQSxFQUQwQjtNQUFBLENBQTVCLEVBREY7S0FEZTtFQUFBLENBaFNqQixDQUFBOztBQUFBLEVBcVNBLCtCQUFBLEdBQWtDLFNBQUMsTUFBRCxFQUFTLEdBQVQsR0FBQTtBQUNoQyxJQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFDLEdBQUQsRUFBTSxDQUFOLENBQXpCLENBQUEsQ0FBQTtXQUNBLE1BQU0sQ0FBQywwQkFBUCxDQUFBLEVBRmdDO0VBQUEsQ0FyU2xDLENBQUE7O0FBQUEsRUF5U0EsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEdBQUE7QUFDbEIsUUFBQSxXQUFBO0FBQUEsSUFBQyxTQUFVLE9BQVYsTUFBRCxDQUFBO0FBQUEsSUFDQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUROLENBQUE7QUFFQSxJQUFBLElBQUcsTUFBTSxDQUFDLG1CQUFQLENBQTJCLEdBQTNCLENBQUg7YUFDRSxNQUFNLENBQUMsZUFBUCxDQUF1QixHQUF2QixFQURGO0tBSGtCO0VBQUEsQ0F6U3BCLENBQUE7O0FBQUEsRUErU0EsYUFBQSxHQUFnQjtBQUFBLElBQUMsU0FBQSxFQUFXLE9BQVo7QUFBQSxJQUFxQixVQUFBLEVBQVksS0FBakM7R0EvU2hCLENBQUE7O0FBQUEsRUFnVEEsV0FBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLE9BQVQsR0FBQTtBQUNaLFFBQUEsa0RBQUE7QUFBQSxJQUFBLElBQUEsQ0FBQSxDQUEwQixDQUFDLE9BQUYsQ0FBVSxNQUFWLENBQXpCO0FBQUEsTUFBQSxNQUFBLEdBQVMsQ0FBQyxNQUFELENBQVQsQ0FBQTtLQUFBO0FBQ0EsSUFBQSxJQUFBLENBQUEsTUFBb0IsQ0FBQyxNQUFyQjtBQUFBLFlBQUEsQ0FBQTtLQURBO0FBQUEsSUFHQyxTQUFVLFFBQVYsTUFIRCxDQUFBO0FBQUEsSUFJQSxPQUFBOztBQUFXO1dBQUEsNkNBQUE7dUJBQUE7QUFBQSxzQkFBQSxNQUFNLENBQUMsZUFBUCxDQUF1QixDQUF2QixFQUEwQixhQUExQixFQUFBLENBQUE7QUFBQTs7UUFKWCxDQUFBO0FBQUEsSUFNQSxpQkFBQSxHQUFvQjtBQUFBLE1BQUMsSUFBQSxFQUFNLFdBQVA7QUFBQSxNQUFvQixPQUFBLEVBQU8sT0FBTyxDQUFDLE9BQUQsQ0FBbEM7S0FOcEIsQ0FBQTtBQU9BLFNBQUEsOENBQUE7c0JBQUE7QUFBQSxNQUFBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQXRCLEVBQXlCLGlCQUF6QixDQUFBLENBQUE7QUFBQSxLQVBBO1dBU0EsVUFBQSxDQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsbUJBQUE7QUFBQTtXQUFBLGdEQUFBO3dCQUFBO0FBQUEsc0JBQUEsQ0FBQyxDQUFDLE9BQUYsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFEVTtJQUFBLENBQVosRUFFRSxPQUFPLENBQUMsT0FGVixFQVZZO0VBQUEsQ0FoVGQsQ0FBQTs7QUFBQSxFQStUQSxvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxHQUFULEdBQUE7QUFDckIsUUFBQSxnQkFBQTtBQUFBLElBQUEsZ0JBQUEsR0FBbUIsbUJBQUEsQ0FBb0IsTUFBcEIsQ0FBbkIsQ0FBQTtBQUNBLFlBQUEsS0FBQTtBQUFBLFlBQ08sQ0FBQyxHQUFBLEdBQU0sQ0FBUCxDQURQO2VBQ3NCLEVBRHRCO0FBQUEsWUFFTyxDQUFDLEdBQUEsR0FBTSxnQkFBUCxDQUZQO2VBRXFDLGlCQUZyQztBQUFBO2VBR08sSUFIUDtBQUFBLEtBRnFCO0VBQUEsQ0EvVHZCLENBQUE7O0FBQUEsRUF1VUEsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsR0FBVCxHQUFBO0FBQ3JCLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLGdCQUFBLEdBQW1CLG1CQUFBLENBQW9CLE1BQXBCLENBQW5CLENBQUE7QUFDQSxZQUFBLEtBQUE7QUFBQSxZQUNPLENBQUMsR0FBQSxHQUFNLENBQVAsQ0FEUDtlQUNzQixFQUR0QjtBQUFBLFlBRU8sQ0FBQyxHQUFBLEdBQU0sZ0JBQVAsQ0FGUDtlQUVxQyxpQkFGckM7QUFBQTtlQUdPLElBSFA7QUFBQSxLQUZxQjtFQUFBLENBdlV2QixDQUFBOztBQUFBLEVBa1ZBLElBQUEsR0FBTyxTQUFDLE1BQUQsRUFBUyxPQUFULEdBQUE7QUFDTCxJQUFBLElBQUcsT0FBSDthQUNFLE1BQU8sQ0FBQSxDQUFBLEVBRFQ7S0FBQSxNQUFBO2FBR0UsTUFBTyxDQUFBLENBQUEsRUFIVDtLQURLO0VBQUEsQ0FsVlAsQ0FBQTs7QUFBQSxFQTJWQSxtQ0FBQSxHQUFzQyxTQUFDLE1BQUQsRUFBUyxjQUFULEVBQXlCLE9BQXpCLEdBQUE7QUFDcEMsUUFBQSx5QkFBQTtBQUFBLElBQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsK0JBQVAsQ0FBdUMsY0FBdkMsQ0FBakIsQ0FBQTtBQUFBLElBQ0MsWUFBYSxRQUFiLFNBREQsQ0FBQTtBQUFBLElBRUEsTUFBQSxDQUFBLE9BQWMsQ0FBQyxTQUZmLENBQUE7QUFHQSxJQUFBLElBQXdELFNBQXhEO0FBQUEsTUFBQSxjQUFBLEdBQWlCLGNBQWMsQ0FBQyxTQUFmLENBQXlCLFNBQXpCLENBQWpCLENBQUE7S0FIQTtXQUlBLE1BQU0sQ0FBQyxrQkFBUCxDQUEwQixjQUExQixFQUEwQyxPQUExQyxFQUxvQztFQUFBLENBM1Z0QyxDQUFBOztBQUFBLEVBbVdBLGNBQUEsR0FBaUIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUF3QixLQUF4QixHQUFBO0FBQ2YsUUFBQSxzQkFBQTtBQUFBLElBRHlCLFdBQUEsS0FBSyxjQUFBLE1BQzlCLENBQUE7QUFBQSxJQUR3Qyw2QkFBRCxRQUFZLElBQVgsU0FDeEMsQ0FBQTs7TUFBQSxZQUFhO0tBQWI7QUFDQSxJQUFBLElBQUcsU0FBSDthQUNFLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFpQyxrQkFEbkM7S0FBQSxNQUFBO2FBR0UsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEdBQTVCLENBQWlDLDhCQUhuQztLQUZlO0VBQUEsQ0FuV2pCLENBQUE7O0FBQUEsRUEwV0EscUJBQUEsR0FBd0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUF3QixLQUF4QixHQUFBO0FBQ3RCLFFBQUEsNkJBQUE7QUFBQSxJQURnQyxXQUFBLEtBQUssY0FBQSxNQUNyQyxDQUFBO0FBQUEsSUFEK0MsNkJBQUQsUUFBWSxJQUFYLFNBQy9DLENBQUE7O01BQUEsWUFBYTtLQUFiO0FBQUEsSUFDQSxLQUFBLEdBQVEsTUFEUixDQUFBO0FBRUEsSUFBQSxJQUFjLFNBQWQ7QUFBQSxNQUFBLEtBQUEsSUFBUyxDQUFULENBQUE7S0FGQTtXQUdBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFpQyxjQUpYO0VBQUEsQ0ExV3hCLENBQUE7O0FBQUEsRUFnWEEsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsR0FBVCxHQUFBO0FBQzNCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFQLENBQUE7V0FDQSxNQUFNLENBQUMsa0JBQVAsQ0FBMEIsSUFBMUIsRUFGMkI7RUFBQSxDQWhYN0IsQ0FBQTs7QUFBQSxFQW9YQSxnQkFBQSxHQUFtQixPQXBYbkIsQ0FBQTs7QUFBQSxFQXFYQSxlQUFBLEdBQWtCLFNBQUMsSUFBRCxHQUFBO1dBQ2hCLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLElBQXRCLEVBRGdCO0VBQUEsQ0FyWGxCLENBQUE7O0FBQUEsRUF3WEEsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEdBQUE7QUFDckIsUUFBQSxtQkFBQTtXQUFBOzs7O2tCQUNFLENBQUMsR0FESCxDQUNPLFNBQUMsR0FBRCxHQUFBO2FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyw4QkFBcEIsQ0FBbUQsR0FBbkQsRUFERztJQUFBLENBRFAsQ0FHRSxDQUFDLE1BSEgsQ0FHVSxTQUFDLFFBQUQsR0FBQTthQUNOLGtCQUFBLElBQWMscUJBQWQsSUFBK0Isc0JBRHpCO0lBQUEsQ0FIVixFQURxQjtFQUFBLENBeFh2QixDQUFBOztBQUFBLEVBZ1lBLG1DQUFBLEdBQXNDLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsU0FBcEIsR0FBQTs7TUFBb0IsWUFBVTtLQUNsRTtXQUFBLG9CQUFBLENBQXFCLE1BQXJCLENBQTRCLENBQUMsTUFBN0IsQ0FBb0MsU0FBQyxJQUFELEdBQUE7QUFDbEMsVUFBQSxnQkFBQTtBQUFBLE1BRG9DLG9CQUFVLGdCQUM5QyxDQUFBO0FBQUEsTUFBQSxJQUFHLFNBQUg7ZUFDRSxDQUFBLFFBQUEsR0FBVyxTQUFYLElBQVcsU0FBWCxJQUF3QixNQUF4QixFQURGO09BQUEsTUFBQTtlQUdFLENBQUEsUUFBQSxJQUFZLFNBQVosSUFBWSxTQUFaLElBQXlCLE1BQXpCLEVBSEY7T0FEa0M7SUFBQSxDQUFwQyxFQURvQztFQUFBLENBaFl0QyxDQUFBOztBQUFBLEVBdVlBLHlCQUFBLEdBQTRCLFNBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtBQUMxQixRQUFBLDJCQUFBO0FBQUEsSUFBQSxRQUF5QixRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsR0FBRCxHQUFBO2FBQ3BDLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixFQUFvQztBQUFBLFFBQUEsY0FBQSxFQUFnQixJQUFoQjtPQUFwQyxFQURvQztJQUFBLENBQWIsQ0FBekIsRUFBQyxxQkFBRCxFQUFhLG1CQUFiLENBQUE7V0FFQSxVQUFVLENBQUMsS0FBWCxDQUFpQixRQUFqQixFQUgwQjtFQUFBLENBdlk1QixDQUFBOztBQUFBLEVBNFlBLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLEdBQVQsR0FBQTtXQUN2QixNQUFNLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxtQkFBckMsQ0FBeUQsR0FBekQsRUFEdUI7RUFBQSxDQTVZekIsQ0FBQTs7QUFBQSxFQStZQSx5QkFBQSxHQUE0QixTQUFDLElBQUQsR0FBQTtBQUMxQixRQUFBLDhCQUFBO0FBQUE7QUFBQTtTQUFBLDRDQUFBO3NCQUFBO1VBQTBCLEdBQUEsR0FBTSxDQUFOLElBQVksQ0FBQyxHQUFBLEdBQU0sQ0FBTixLQUFXLENBQUEsQ0FBWjtBQUNwQyxzQkFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsRUFBQTtPQURGO0FBQUE7b0JBRDBCO0VBQUEsQ0EvWTVCLENBQUE7O0FBQUEsRUFtWkEsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixTQUFwQixFQUErQixFQUEvQixHQUFBO0FBQ2xCLFFBQUEsbUtBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBTixDQUFpQixTQUFqQixDQUFaLENBQUE7QUFBQSxJQUNBLFFBQUE7O0FBQVcsY0FBTyxTQUFQO0FBQUEsYUFDSixTQURJO2lCQUNXOzs7O3lCQURYO0FBQUEsYUFFSixVQUZJO2lCQUVZOzs7O3lCQUZaO0FBQUE7UUFEWCxDQUFBO0FBQUEsSUFLQSxZQUFBLEdBQWUsSUFMZixDQUFBO0FBQUEsSUFNQSxJQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsWUFBQSxHQUFlLE1BRFY7SUFBQSxDQU5QLENBQUE7QUFBQSxJQVNBLFlBQUE7QUFBZSxjQUFPLFNBQVA7QUFBQSxhQUNSLFNBRFE7aUJBQ08sU0FBQyxJQUFELEdBQUE7QUFBZ0IsZ0JBQUEsUUFBQTtBQUFBLFlBQWQsV0FBRCxLQUFDLFFBQWMsQ0FBQTttQkFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QixTQUF2QixFQUFoQjtVQUFBLEVBRFA7QUFBQSxhQUVSLFVBRlE7aUJBRVEsU0FBQyxJQUFELEdBQUE7QUFBZ0IsZ0JBQUEsUUFBQTtBQUFBLFlBQWQsV0FBRCxLQUFDLFFBQWMsQ0FBQTttQkFBQSxRQUFRLENBQUMsVUFBVCxDQUFvQixTQUFwQixFQUFoQjtVQUFBLEVBRlI7QUFBQTtRQVRmLENBQUE7QUFhQSxTQUFBLCtDQUFBO3lCQUFBO1lBQXlCLGFBQUEsR0FBZ0Isc0JBQUEsQ0FBdUIsTUFBdkIsRUFBK0IsR0FBL0I7O09BQ3ZDO0FBQUEsTUFBQSxNQUFBLEdBQVMsQ0FBVCxDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsRUFEVixDQUFBO0FBQUEsTUFHQSxhQUFBLEdBQWdCLGFBQWEsQ0FBQyxnQkFBZCxDQUFBLENBSGhCLENBQUE7QUFJQTtBQUFBLFdBQUEsOENBQUE7d0JBQUE7QUFDRSxRQUFBLGFBQWEsQ0FBQyxJQUFkLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFHLEdBQUEsR0FBTSxDQUFUO0FBQ0UsVUFBQSxNQUFBO0FBQVUsb0JBQUEsS0FBQTtBQUFBLG9CQUNILGFBQWEsQ0FBQyxTQUFkLENBQUEsQ0FERzt1QkFDNEIsRUFENUI7QUFBQSxvQkFFSCxhQUFhLENBQUMscUJBQWQsQ0FBQSxDQUZHO3VCQUV3QyxFQUZ4QztBQUFBO3VCQUdILElBSEc7QUFBQTtjQUFWLENBREY7U0FBQSxNQUtLLElBQUksR0FBQSxHQUFNLENBQU4sS0FBVyxDQUFBLENBQWY7QUFDSCxVQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQWQsQ0FBeUIsR0FBekIsQ0FBUixDQUFBO0FBQUEsVUFDQSxRQUFBLEdBQWUsSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLE1BQVgsQ0FEZixDQUFBO0FBQUEsVUFFQSxPQUFPLENBQUMsSUFBUixDQUFhO0FBQUEsWUFBQyxPQUFBLEtBQUQ7QUFBQSxZQUFRLFVBQUEsUUFBUjtBQUFBLFlBQWtCLE1BQUEsSUFBbEI7V0FBYixDQUZBLENBREc7U0FQUDtBQUFBLE9BSkE7QUFBQSxNQWdCQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxZQUFmLENBaEJWLENBQUE7QUFpQkEsTUFBQSxJQUFxQixTQUFBLEtBQWEsVUFBbEM7QUFBQSxRQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBQSxDQUFBO09BakJBO0FBa0JBLFdBQUEsZ0RBQUE7NkJBQUE7QUFDRSxRQUFBLEVBQUEsQ0FBRyxNQUFILENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxDQUFBLFlBQUE7QUFBQSxnQkFBQSxDQUFBO1NBRkY7QUFBQSxPQWxCQTtBQXFCQSxNQUFBLElBQUEsQ0FBQSxZQUFBO0FBQUEsY0FBQSxDQUFBO09BdEJGO0FBQUEsS0Fka0I7RUFBQSxDQW5acEIsQ0FBQTs7QUFBQSxFQXliQSwrQkFBQSxHQUFrQyxTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFNBQXBCLEVBQStCLEtBQS9CLEdBQUE7QUFDaEMsUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBUixDQUFBO0FBQUEsSUFDQSxpQkFBQSxDQUFrQixNQUFsQixFQUEwQixTQUExQixFQUFxQyxTQUFyQyxFQUFnRCxTQUFDLElBQUQsR0FBQTtBQUM5QyxNQUFBLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLENBQWtCLEtBQWxCLENBQUEsSUFBNEIsQ0FBL0I7QUFDRSxRQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxDQUFBO2VBQ0EsS0FBQSxHQUFRLElBQUksQ0FBQyxTQUZmO09BRDhDO0lBQUEsQ0FBaEQsQ0FEQSxDQUFBO1dBS0EsTUFOZ0M7RUFBQSxDQXpibEMsQ0FBQTs7QUFBQSxFQWljQSw0QkFBQSxHQUErQixTQUFDLE1BQUQsRUFBUyxHQUFULEdBQUE7QUFLN0IsUUFBQSxhQUFBO0FBQUEsSUFBQSxJQUFHLGFBQUEsR0FBZ0Isc0JBQUEsQ0FBdUIsTUFBdkIsRUFBK0IsR0FBL0IsQ0FBbkI7YUFDRSx5QkFBQSxDQUEwQixhQUExQixDQUF3QyxDQUFDLElBQXpDLENBQThDLFNBQUMsS0FBRCxHQUFBO2VBQzVDLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsS0FBeEIsRUFENEM7TUFBQSxDQUE5QyxFQURGO0tBQUEsTUFBQTthQUlFLE1BSkY7S0FMNkI7RUFBQSxDQWpjL0IsQ0FBQTs7QUFBQSxFQTZjQSxlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTtBQUNoQixRQUFBLFNBQUE7QUFBQSxJQUFDLFlBQWEsTUFBTSxDQUFDLFVBQVAsQ0FBQSxFQUFiLFNBQUQsQ0FBQTtBQUNBLFlBQU8sU0FBUDtBQUFBLFdBQ08sV0FEUDtlQUVJLHlCQUF5QixDQUFDLElBQTFCLENBQStCLEtBQS9CLEVBRko7QUFBQTtlQUlJLG1CQUFtQixDQUFDLElBQXBCLENBQXlCLEtBQXpCLEVBSko7QUFBQSxLQUZnQjtFQUFBLENBN2NsQixDQUFBOztBQUFBLEVBdWRBLGVBQUEsR0FBa0IsU0FBQyxPQUFELEVBQVUsU0FBVixHQUFBO1dBQ2hCLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQUFxQixTQUFTLENBQUMsY0FBVixDQUFBLENBQTBCLENBQUMsUUFBM0IsQ0FBQSxDQUFyQixFQURnQjtFQUFBLENBdmRsQixDQUFBOztBQUFBLEVBMGRBLFlBQUEsR0FBZSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7V0FDYixPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFBcUIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBMEIsQ0FBQyxRQUEzQixDQUFBLENBQXJCLEVBRGE7RUFBQSxDQTFkZixDQUFBOztBQUFBLEVBNmRBLGdDQUFBLEdBQW1DLFNBQUMsTUFBRCxFQUFTLEVBQVQsR0FBQTtBQUNqQyxRQUFBLHlCQUFBO0FBQUEsSUFBQSxZQUFBLEdBQWUsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBZixDQUFBO0FBQUEsSUFDQSxFQUFBLENBQUEsQ0FEQSxDQUFBO0FBQUEsSUFFQSxXQUFBLEdBQWMsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FGZCxDQUFBO0FBR0EsSUFBQSxJQUFBLENBQUEsWUFBbUIsQ0FBQyxPQUFiLENBQXFCLFdBQXJCLENBQVA7YUFDRSxPQUFPLENBQUMsR0FBUixDQUFhLFdBQUEsR0FBVSxDQUFDLFlBQVksQ0FBQyxRQUFiLENBQUEsQ0FBRCxDQUFWLEdBQW1DLE1BQW5DLEdBQXdDLENBQUMsV0FBVyxDQUFDLFFBQVosQ0FBQSxDQUFELENBQXJELEVBREY7S0FKaUM7RUFBQSxDQTdkbkMsQ0FBQTs7QUFBQSxFQXFlQSw0QkFBQSxHQUErQixTQUFDLE1BQUQsR0FBQTtBQUM3QixRQUFBLDRDQUFBO0FBQUEsSUFBQSxnQkFBQSxHQUFtQixHQUFBLENBQUEsR0FBbkIsQ0FBQTtBQUNBO0FBQUEsU0FBQSw0Q0FBQTs0QkFBQTtBQUNFLE1BQUEsZ0JBQWdCLENBQUMsR0FBakIsQ0FBcUIsU0FBckIsRUFBZ0MsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUFoQyxDQUFBLENBREY7QUFBQSxLQURBO1dBSUEsU0FBQyxTQUFELEdBQUE7QUFDRSxVQUFBLEtBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUFxQixTQUFyQixDQUErQixDQUFDLEtBQXhDLENBQUE7YUFDQSxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFtQyxLQUFuQyxFQUZGO0lBQUEsRUFMNkI7RUFBQSxDQXJlL0IsQ0FBQTs7QUFBQSxFQThlQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2YsU0FBQSxPQURlO0FBQUEsSUFFZixPQUFBLEtBRmU7QUFBQSxJQUdmLCtCQUFBLDZCQUhlO0FBQUEsSUFJZixTQUFBLE9BSmU7QUFBQSxJQUtmLGlCQUFBLGVBTGU7QUFBQSxJQU1mLHNCQUFBLG9CQU5lO0FBQUEsSUFPZixzQkFBQSxvQkFQZTtBQUFBLElBUWYsaUJBQUEsZUFSZTtBQUFBLElBU2YsaUNBQUEsK0JBVGU7QUFBQSxJQVVmLDJCQUFBLHlCQVZlO0FBQUEsSUFXZixtQkFBQSxpQkFYZTtBQUFBLElBWWYsWUFBQSxVQVplO0FBQUEsSUFhZixVQUFBLFFBYmU7QUFBQSxJQWNmLHVCQUFBLHFCQWRlO0FBQUEsSUFlZixpQkFBQSxlQWZlO0FBQUEsSUFnQmYsZUFBQSxhQWhCZTtBQUFBLElBaUJmLHdCQUFBLHNCQWpCZTtBQUFBLElBa0JmLCtCQUFBLDZCQWxCZTtBQUFBLElBbUJmLFdBQUEsU0FuQmU7QUFBQSxJQW9CZix5QkFBQSx1QkFwQmU7QUFBQSxJQXFCZixvQkFBQSxrQkFyQmU7QUFBQSxJQXNCZix1QkFBQSxxQkF0QmU7QUFBQSxJQXVCZix3QkFBQSxzQkF2QmU7QUFBQSxJQXdCZiwyQkFBQSx5QkF4QmU7QUFBQSxJQXlCZiwyQkFBQSx5QkF6QmU7QUFBQSxJQTBCZix5QkFBQSx1QkExQmU7QUFBQSxJQTJCZix5QkFBQSx1QkEzQmU7QUFBQSxJQTRCZixxQkFBQSxtQkE1QmU7QUFBQSxJQTZCZixxQkFBQSxtQkE3QmU7QUFBQSxJQThCZixnQkFBQSxjQTlCZTtBQUFBLElBK0JmLGlCQUFBLGVBL0JlO0FBQUEsSUFnQ2YsY0FBQSxZQWhDZTtBQUFBLElBaUNmLGdCQUFBLGNBakNlO0FBQUEsSUFrQ2YsbUJBQUEsaUJBbENlO0FBQUEsSUFtQ2YsNEJBQUEsMEJBbkNlO0FBQUEsSUFvQ2YsK0JBQUEsNkJBcENlO0FBQUEsSUFxQ2YsMEJBQUEsd0JBckNlO0FBQUEsSUFzQ2YseUJBQUEsdUJBdENlO0FBQUEsSUF1Q2YsYUFBQSxXQXZDZTtBQUFBLElBd0NmLHNCQUFBLG9CQXhDZTtBQUFBLElBeUNmLHNCQUFBLG9CQXpDZTtBQUFBLElBMENmLGlDQUFBLCtCQTFDZTtBQUFBLElBMkNmLFdBQUEsU0EzQ2U7QUFBQSxJQTRDZixNQUFBLElBNUNlO0FBQUEsSUE2Q2YscUNBQUEsbUNBN0NlO0FBQUEsSUE4Q2YsZ0JBQUEsY0E5Q2U7QUFBQSxJQStDZix1QkFBQSxxQkEvQ2U7QUFBQSxJQWdEZiw0QkFBQSwwQkFoRGU7QUFBQSxJQWlEZixpQkFBQSxlQWpEZTtBQUFBLElBa0RmLGlCQUFBLGVBbERlO0FBQUEsSUFtRGYsc0JBQUEsb0JBbkRlO0FBQUEsSUFvRGYsc0JBQUEsb0JBcERlO0FBQUEsSUFxRGYsK0JBQUEsNkJBckRlO0FBQUEsSUFzRGYsb0JBQUEsa0JBdERlO0FBQUEsSUF1RGYsc0JBQUEsb0JBdkRlO0FBQUEsSUF3RGYscUNBQUEsbUNBeERlO0FBQUEsSUF5RGYsMkJBQUEseUJBekRlO0FBQUEsSUEwRGYsb0NBQUEsa0NBMURlO0FBQUEsSUEyRGYsMEJBQUEsd0JBM0RlO0FBQUEsSUE0RGYsaUJBQUEsZUE1RGU7QUFBQSxJQTZEZiw4QkFBQSw0QkE3RGU7QUFBQSxJQThEZix3QkFBQSxzQkE5RGU7QUFBQSxJQStEZiwyQkFBQSx5QkEvRGU7QUFBQSxJQWdFZixtQkFBQSxpQkFoRWU7QUFBQSxJQWlFZixpQ0FBQSwrQkFqRWU7QUFBQSxJQWtFZixlQUFBLGFBbEVlO0FBQUEsSUFtRWYsOEJBQUEsNEJBbkVlO0FBQUEsSUFzRWYsaUJBQUEsZUF0RWU7QUFBQSxJQXVFZixjQUFBLFlBdkVlO0FBQUEsSUF3RWYsa0NBQUEsZ0NBeEVlO0dBOWVqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/utils.coffee
