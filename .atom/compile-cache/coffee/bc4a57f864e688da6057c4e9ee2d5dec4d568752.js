(function() {
  var CompositeDisposable, CursorStyleManager, Disposable, RowHeightInEm, getDomNode, getOffset, setStyleOffset, settings, swrap, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  settings = require('./settings');

  swrap = require('./selection-wrapper');

  RowHeightInEm = 1.5;

  getDomNode = function(editorElement, cursor) {
    var cursorsComponent;
    cursorsComponent = editorElement.component.linesComponent.cursorsComponent;
    return cursorsComponent.cursorNodesById[cursor.id];
  };

  getOffset = function(submode, selection) {
    var bufferPoint, bufferRange, cursor, editor, left, rows, screenPoint, screenRows, top, _ref1;
    _ref1 = {}, top = _ref1.top, left = _ref1.left;
    cursor = selection.cursor;
    switch (submode) {
      case 'characterwise':
      case 'blockwise':
        if (!selection.isReversed()) {
          if (cursor.isAtBeginningOfLine()) {
            top = -RowHeightInEm;
          } else {
            left = -1;
          }
        }
        break;
      case 'linewise':
        editor = selection.editor;
        bufferPoint = swrap(selection).getCharacterwiseHeadPosition();
        if (editor.isSoftWrapped()) {
          screenPoint = editor.screenPositionForBufferPosition(bufferPoint);
          bufferRange = editor.bufferRangeForBufferRow(bufferPoint.row);
          screenRows = editor.screenRangeForBufferRange(bufferRange).getRows();
          rows = selection.isReversed() ? screenRows.indexOf(screenPoint.row) : -(screenRows.reverse().indexOf(screenPoint.row) + 1);
          top = rows * RowHeightInEm;
          left = screenPoint.column;
        } else {
          left = 0;
          if (!selection.isReversed()) {
            if (cursor.isAtBeginningOfLine()) {
              top = -RowHeightInEm;
            } else {
              left -= cursor.getBufferColumn();
            }
          }
          left += bufferPoint.column;
        }
    }
    return {
      top: top,
      left: left
    };
  };

  setStyleOffset = function(cursor, _arg) {
    var domNode, editor, editorElement, left, style, submode, top, _ref1;
    submode = _arg.submode, editor = _arg.editor, editorElement = _arg.editorElement;
    domNode = getDomNode(editorElement, cursor);
    if (!domNode) {
      return new Disposable;
    }
    style = domNode.style;
    _ref1 = getOffset(submode, cursor.selection), left = _ref1.left, top = _ref1.top;
    if (top != null) {
      style.setProperty('top', "" + top + "em");
    }
    if (left != null) {
      style.setProperty('left', "" + left + "ch");
    }
    return new Disposable(function() {
      style.removeProperty('top');
      return style.removeProperty('left');
    });
  };

  CursorStyleManager = (function() {
    function CursorStyleManager(vimState) {
      var _ref1;
      this.vimState = vimState;
      _ref1 = this.vimState, this.editorElement = _ref1.editorElement, this.editor = _ref1.editor;
      this.subscriptions = new CompositeDisposable;
    }

    CursorStyleManager.prototype.destroy = function() {
      var _ref1;
      this.subscriptions.dispose();
      return _ref1 = {}, this.subscriptions = _ref1.subscriptions, _ref1;
    };

    CursorStyleManager.prototype.refresh = function() {
      var cursor, cursors, cursorsToShow, submode, _i, _j, _len, _len1, _results;
      this.subscriptions.dispose();
      this.subscriptions = new CompositeDisposable;
      if (!(this.vimState.isMode('visual') && settings.get('showCursorInVisualMode'))) {
        return;
      }
      cursors = this.editor.getCursors();
      submode = this.vimState.submode;
      cursorsToShow = submode === 'blockwise' ? (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = cursors.length; _i < _len; _i++) {
          cursor = cursors[_i];
          if (swrap(cursor.selection).isBlockwiseHead()) {
            _results.push(cursor);
          }
        }
        return _results;
      })() : cursors;
      for (_i = 0, _len = cursors.length; _i < _len; _i++) {
        cursor = cursors[_i];
        if (__indexOf.call(cursorsToShow, cursor) >= 0) {
          if (!cursor.isVisible()) {
            cursor.setVisible(true);
          }
        } else {
          if (cursor.isVisible()) {
            cursor.setVisible(false);
          }
        }
      }
      this.editorElement.component.updateSync();
      _results = [];
      for (_j = 0, _len1 = cursorsToShow.length; _j < _len1; _j++) {
        cursor = cursorsToShow[_j];
        _results.push(this.subscriptions.add(setStyleOffset(cursor, {
          submode: submode,
          editor: this.editor,
          editorElement: this.editorElement
        })));
      }
      return _results;
    };

    return CursorStyleManager;

  })();

  module.exports = CursorStyleManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2N1cnNvci1zdHlsZS1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnSUFBQTtJQUFBLHFKQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBQWIsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBSFIsQ0FBQTs7QUFBQSxFQUtBLGFBQUEsR0FBZ0IsR0FMaEIsQ0FBQTs7QUFBQSxFQU9BLFVBQUEsR0FBYSxTQUFDLGFBQUQsRUFBZ0IsTUFBaEIsR0FBQTtBQUNYLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLGdCQUFBLEdBQW1CLGFBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGdCQUExRCxDQUFBO1dBQ0EsZ0JBQWdCLENBQUMsZUFBZ0IsQ0FBQSxNQUFNLENBQUMsRUFBUCxFQUZ0QjtFQUFBLENBUGIsQ0FBQTs7QUFBQSxFQWFBLFNBQUEsR0FBWSxTQUFDLE9BQUQsRUFBVSxTQUFWLEdBQUE7QUFDVixRQUFBLHlGQUFBO0FBQUEsSUFBQSxRQUFjLEVBQWQsRUFBQyxZQUFBLEdBQUQsRUFBTSxhQUFBLElBQU4sQ0FBQTtBQUFBLElBQ0MsU0FBVSxVQUFWLE1BREQsQ0FBQTtBQUVBLFlBQU8sT0FBUDtBQUFBLFdBQ08sZUFEUDtBQUFBLFdBQ3dCLFdBRHhCO0FBRUksUUFBQSxJQUFBLENBQUEsU0FBZ0IsQ0FBQyxVQUFWLENBQUEsQ0FBUDtBQUNFLFVBQUEsSUFBRyxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUFIO0FBQ0UsWUFB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/cursor-style-manager.coffee
