(function() {
  var getView, saveEditorState;

  getView = function(model) {
    return atom.views.getView(model);
  };

  saveEditorState = function(editor) {
    var foldStartRows, scrollTop;
    scrollTop = getView(editor).getScrollTop();
    foldStartRows = editor.displayBuffer.findFoldMarkers({}).map(function(m) {
      return editor.displayBuffer.foldForMarker(m).getStartRow();
    });
    return function() {
      var row, _i, _len, _ref;
      _ref = foldStartRows.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return getView(editor).setScrollTop(scrollTop);
    };
  };

  module.exports = {
    getView: getView,
    saveEditorState: saveEditorState
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2lzZWFyY2gvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3QkFBQTs7QUFBQSxFQUFBLE9BQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtXQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixLQUFuQixFQURRO0VBQUEsQ0FBVixDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixTQUFDLE1BQUQsR0FBQTtBQUNoQixRQUFBLHdCQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLFlBQWhCLENBQUEsQ0FBWixDQUFBO0FBQUEsSUFDQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBckIsQ0FBcUMsRUFBckMsQ0FBd0MsQ0FBQyxHQUF6QyxDQUE2QyxTQUFDLENBQUQsR0FBQTthQUMzRCxNQUFNLENBQUMsYUFBYSxDQUFDLGFBQXJCLENBQW1DLENBQW5DLENBQXFDLENBQUMsV0FBdEMsQ0FBQSxFQUQyRDtJQUFBLENBQTdDLENBRGhCLENBQUE7V0FHQSxTQUFBLEdBQUE7QUFDRSxVQUFBLG1CQUFBO0FBQUE7QUFBQSxXQUFBLDJDQUFBO3VCQUFBO1lBQXdDLENBQUEsTUFBVSxDQUFDLG1CQUFQLENBQTJCLEdBQTNCO0FBQzFDLFVBQUEsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsR0FBckIsQ0FBQTtTQURGO0FBQUEsT0FBQTthQUVBLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxZQUFoQixDQUE2QixTQUE3QixFQUhGO0lBQUEsRUFKZ0I7RUFBQSxDQUpsQixDQUFBOztBQUFBLEVBYUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFDLFNBQUEsT0FBRDtBQUFBLElBQVUsaUJBQUEsZUFBVjtHQWJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/isearch/lib/utils.coffee
