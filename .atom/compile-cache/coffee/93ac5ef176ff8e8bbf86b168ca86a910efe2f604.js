(function() {
  var getView, getVimState, packageName, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, getView = _ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, workspaceElement, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5], workspaceElement = _ref1[6];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    afterEach(function() {
      return vimState.activate('reset');
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("Normal");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("Insert");
        });
      });
      return it("doesn't register duplicate command listeners for editors", function() {
        var newPane, pane;
        set({
          text: '12345',
          cursorBuffer: [0, 0]
        });
        pane = atom.workspace.getActivePane();
        newPane = pane.splitRight();
        pane.removeItem(editor);
        newPane.addItem(editor);
        return ensure('l', {
          cursorBuffer: [0, 1]
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy92aW0tbW9kZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSx1Q0FBQTs7QUFBQSxFQUFBLE9BQXlCLE9BQUEsQ0FBUSxlQUFSLENBQXpCLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGVBQUEsT0FBZCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLGVBRmQsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLGdGQUFBO0FBQUEsSUFBQSxRQUE4RSxFQUE5RSxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELEVBQTBELDJCQUExRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxXQUFBLENBQVksU0FBQyxTQUFELEVBQVksR0FBWixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsU0FBWCxDQUFBO0FBQUEsUUFDQyxtQkFBQSxNQUFELEVBQVMsMEJBQUEsYUFEVCxDQUFBO2VBRUMsVUFBQSxHQUFELEVBQU0sYUFBQSxNQUFOLEVBQWMsZ0JBQUEsU0FBZCxFQUEyQixJQUhqQjtNQUFBLENBQVosQ0FBQSxDQUFBO0FBQUEsTUFLQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsSUFBSSxDQUFDLFNBQWIsQ0FMbkIsQ0FBQTthQU9BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFlBQTlCLEVBRGM7TUFBQSxDQUFoQixFQVJTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQWFBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7YUFD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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/spec/vim-mode-spec.coffee
