(function() {
  var MinimapFindAndReplace, WorkspaceView;

  MinimapFindAndReplace = require('../lib/minimap-find-and-replace');

  WorkspaceView = require('atom').WorkspaceView;

  describe("MinimapFindAndReplace", function() {
    beforeEach(function() {
      runs(function() {
        atom.workspaceView = new WorkspaceView;
        return atom.workspaceView.openSync('sample.js');
      });
      runs(function() {
        var editorView;
        atom.workspaceView.attachToDom();
        editorView = atom.workspaceView.getActiveView();
        return editorView.setText("This is the file content");
      });
      waitsForPromise(function() {
        var promise;
        promise = atom.packages.activatePackage('minimap');
        atom.workspaceView.trigger('minimap:toggle');
        return promise;
      });
      return waitsForPromise(function() {
        var promise;
        promise = atom.packages.activatePackage('find-and-replace');
        atom.workspaceView.trigger('find-and-replace:show');
        return promise;
      });
    });
    return describe("when the toggle event is triggered", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          var promise;
          promise = atom.packages.activatePackage('minimap-find-and-replace');
          atom.workspaceView.trigger('minimap-find-and-replace:toggle');
          return promise;
        });
      });
      return it('should exist', function() {
        return expect();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS9zcGVjL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvQ0FBQTs7QUFBQSxFQUFBLHFCQUFBLEdBQXdCLE9BQUEsQ0FBUSxpQ0FBUixDQUF4QixDQUFBOztBQUFBLEVBQ0MsZ0JBQWlCLE9BQUEsQ0FBUSxNQUFSLEVBQWpCLGFBREQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsUUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixHQUFBLENBQUEsYUFBckIsQ0FBQTtlQUNBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsV0FBNUIsRUFGRztNQUFBLENBQUwsQ0FBQSxDQUFBO0FBQUEsTUFJQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsWUFBQSxVQUFBO0FBQUEsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQW5CLENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxVQUFBLEdBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFuQixDQUFBLENBRGIsQ0FBQTtlQUVBLFVBQVUsQ0FBQyxPQUFYLENBQW1CLDBCQUFuQixFQUhHO01BQUEsQ0FBTCxDQUpBLENBQUE7QUFBQSxNQVNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsWUFBQSxPQUFBO0FBQUEsUUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFNBQTlCLENBQVYsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixnQkFBM0IsQ0FEQSxDQUFBO2VBRUEsUUFIYztNQUFBLENBQWhCLENBVEEsQ0FBQTthQWNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsWUFBQSxPQUFBO0FBQUEsUUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGtCQUE5QixDQUFWLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsdUJBQTNCLENBREEsQ0FBQTtlQUVBLFFBSGM7TUFBQSxDQUFoQixFQWZTO0lBQUEsQ0FBWCxDQUFBLENBQUE7V0FvQkEsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUEsR0FBQTtBQUM3QyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNkLGNBQUEsT0FBQTtBQUFBLFVBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QiwwQkFBOUIsQ0FBVixDQUFBO0FBQUEsVUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGlDQUEzQixDQURBLENBQUE7aUJBRUEsUUFIYztRQUFBLENBQWhCLEVBRFM7TUFBQSxDQUFYLENBQUEsQ0FBQTthQU1BLEVBQUEsQ0FBRyxjQUFILEVBQW1CLFNBQUEsR0FBQTtlQUNqQixNQUFBLENBQUEsRUFEaUI7TUFBQSxDQUFuQixFQVA2QztJQUFBLENBQS9DLEVBckJnQztFQUFBLENBQWxDLENBSEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/minimap-find-and-replace/spec/minimap-find-and-replace-spec.coffee
