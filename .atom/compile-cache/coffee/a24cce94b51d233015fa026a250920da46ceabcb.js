(function() {
  var MinimapHighlightSelected, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  MinimapHighlightSelected = require('../lib/minimap-highlight-selected');

  describe("MinimapHighlightSelected", function() {
    var activationPromise;
    activationPromise = null;
    return beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return waitsForPromise(function() {
        return atom.packages.activatePackage('minimap-highlight-selected');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtaGlnaGxpZ2h0LXNlbGVjdGVkL3NwZWMvbWluaW1hcC1oaWdobGlnaHQtc2VsZWN0ZWQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUNBQUE7O0FBQUEsRUFBQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFBRCxDQUFBOztBQUFBLEVBQ0Esd0JBQUEsR0FBMkIsT0FBQSxDQUFRLG1DQUFSLENBRDNCLENBQUE7O0FBQUEsRUFRQSxRQUFBLENBQVMsMEJBQVQsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFFBQUEsaUJBQUE7QUFBQSxJQUFBLGlCQUFBLEdBQW9CLElBQXBCLENBQUE7V0FFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFJLENBQUMsYUFBTCxHQUFxQixHQUFBLENBQUEsYUFBckIsQ0FBQTthQUVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLDRCQUE5QixFQURjO01BQUEsQ0FBaEIsRUFIUztJQUFBLENBQVgsRUFIbUM7RUFBQSxDQUFyQyxDQVJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/minimap-highlight-selected/spec/minimap-highlight-selected-spec.coffee
