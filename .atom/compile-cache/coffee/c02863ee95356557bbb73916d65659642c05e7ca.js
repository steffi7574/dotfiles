(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Insert mode commands", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref;
    _ref = [], set = _ref[0], ensure = _ref[1], keystroke = _ref[2], editor = _ref[3], editorElement = _ref[4], vimState = _ref[5];
    beforeEach(function() {
      return getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    afterEach(function() {
      return vimState.activate('reset');
    });
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        set({
          text: "12345\n\nabcd\nefghi",
          cursorBuffer: [[1, 0], [3, 0]]
        });
        return keystroke('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          ensure({
            ctrl: 'y'
          }, {
            text: "12345\n1\nabcd\naefghi"
          });
          editor.insertText(' ');
          return ensure({
            ctrl: 'y'
          }, {
            text: "12345\n1 3\nabcd\na cefghi"
          });
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          ensure({
            ctrl: 'y'
          }, {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
          return ensure({
            ctrl: 'y'
          }, {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
        });
        return it("does nothing on the first line", function() {
          set({
            cursorBuffer: [[0, 2], [3, 2]]
          });
          editor.insertText('a');
          ensure({
            text: "12a345\n\nabcd\nefaghi"
          });
          return ensure({
            ctrl: 'y'
          }, {
            text: "12a345\n\nabcd\nefadghi"
          });
        });
      });
      return describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-e': 'vim-mode-plus:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          ensure({
            ctrl: 'e'
          }, {
            text: "12345\na\nabcd\nefghi"
          });
          editor.insertText(' ');
          return ensure({
            ctrl: 'e'
          }, {
            text: "12345\na c\nabcd\n efghi"
          });
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          ensure({
            ctrl: 'e'
          }, {
            text: "12345\nfood\nabcd\nfooefghi"
          });
          return ensure({
            ctrl: 'e'
          }, {
            text: "12345\nfood\nabcd\nfooefghi"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9pbnNlcnQtbW9kZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUMsY0FBZSxPQUFBLENBQVEsZUFBUixFQUFmLFdBQUQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSw2REFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsU0FBRCxFQUFZLEdBQVosR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLFNBQVgsQ0FBQTtBQUFBLFFBQ0MsbUJBQUEsTUFBRCxFQUFTLDBCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxRQUFULENBQWtCLE9BQWxCLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtXQVdBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxzQkFBTjtBQUFBLFVBTUEsWUFBQSxFQUFjLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBTmQ7U0FERixDQUFBLENBQUE7ZUFRQSxTQUFBLENBQVUsR0FBVixFQVRTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQVdBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsTUFBQSxDQUFPO0FBQUEsWUFBQyxJQUFBLEVBQU0sR0FBUDtXQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSx3QkFBTjtXQURGLENBQUEsQ0FBQTtBQUFBLFVBT0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FQQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTztBQUFBLFlBQUMsSUFBQSxFQUFNLEdBQVA7V0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sNEJBQU47V0FERixFQVQrQjtRQUFBLENBQWpDLENBQUEsQ0FBQTtBQUFBLFFBaUJBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBLEdBQUE7QUFDckQsVUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTztBQUFBLFlBQUMsSUFBQSxFQUFNLEdBQVA7V0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sK0JBQU47V0FERixDQURBLENBQUE7aUJBUUEsTUFBQSxDQUFPO0FBQUEsWUFBQyxJQUFBLEVBQU0sR0FBUDtXQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSwrQkFBTjtXQURGLEVBVHFEO1FBQUEsQ0FBdkQsQ0FqQkEsQ0FBQTtlQWtDQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFVBQUEsR0FBQSxDQUNFO0FBQUEsWUFBQSxZQUFBLEVBQWMsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsQ0FBZDtXQURGLENBQUEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSx3QkFBTjtXQURGLENBSEEsQ0FBQTtpQkFVQSxNQUFBLENBQU87QUFBQSxZQUFDLElBQUEsRUFBTSxHQUFQO1dBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLHlCQUFOO1dBREYsRUFYbUM7UUFBQSxDQUFyQyxFQW5DNkI7TUFBQSxDQUEvQixDQVhBLENBQUE7YUFpRUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFiLENBQWlCLE1BQWpCLEVBQ0U7QUFBQSxZQUFBLDRDQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSxvQ0FBVjthQURGO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsTUFBQSxDQUFPO0FBQUEsWUFBQyxJQUFBLEVBQU0sR0FBUDtXQUFQLEVBQ0U7QUFBQSxZQUFBLElBQUEsRUFBTSx1QkFBTjtXQURGLENBQUEsQ0FBQTtBQUFBLFVBT0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FQQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTztBQUFBLFlBQUMsSUFBQSxFQUFNLEdBQVA7V0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sMEJBQU47V0FERixFQVQrQjtRQUFBLENBQWpDLENBTEEsQ0FBQTtlQXNCQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQSxHQUFBO0FBQ3JELFVBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU87QUFBQSxZQUFDLElBQUEsRUFBTSxHQUFQO1dBQVAsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLDZCQUFOO1dBREYsQ0FEQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTztBQUFBLFlBQUMsSUFBQSxFQUFNLEdBQVA7V0FBUCxFQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sNkJBQU47V0FERixFQVRxRDtRQUFBLENBQXZELEVBdkI2QjtNQUFBLENBQS9CLEVBbEVxQztJQUFBLENBQXZDLEVBWitCO0VBQUEsQ0FBakMsQ0FGQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/spec/insert-mode-spec.coffee
