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
      describe("the ctrl-e command", function() {
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
      return describe("InsertLastInserted", function() {
        var ensureInsertLastInserted;
        ensureInsertLastInserted = function(key, options) {
          var finalText, insert, text;
          insert = options.insert, text = options.text, finalText = options.finalText;
          keystroke(key);
          editor.insertText(insert);
          ensure("escape", {
            text: text
          });
          return ensure([
            "GI", {
              ctrl: 'a'
            }
          ], {
            text: finalText
          });
        };
        beforeEach(function() {
          var initialText;
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-a': 'vim-mode-plus:insert-last-inserted'
            }
          });
          initialText = "abc\ndef\n";
          set({
            text: "",
            cursor: [0, 0]
          });
          keystroke('i');
          editor.insertText(initialText);
          return ensure(["escape", 'gg'], {
            text: initialText,
            cursor: [0, 0]
          });
        });
        it("case-i: single-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx',
            text: "xxxabc\ndef\n",
            finalText: "xxxabc\nxxxdef\n"
          });
        });
        it("case-o: single-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx',
            text: "abc\nxxx\ndef\n",
            finalText: "abc\nxxx\nxxxdef\n"
          });
        });
        it("case-O: single-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx',
            text: "xxx\nabc\ndef\n",
            finalText: "xxx\nabc\nxxxdef\n"
          });
        });
        it("case-i: multi-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\nabc\ndef\n",
            finalText: "xxx\nyyy\nabc\nxxx\nyyy\ndef\n"
          });
        });
        it("case-o: multi-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx\nyyy\n',
            text: "abc\nxxx\nyyy\n\ndef\n",
            finalText: "abc\nxxx\nyyy\n\nxxx\nyyy\ndef\n"
          });
        });
        return it("case-O: multi-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\n\nabc\ndef\n",
            finalText: "xxx\nyyy\n\nabc\nxxx\nyyy\ndef\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9pbnNlcnQtbW9kZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsTUFBQSxXQUFBOztBQUFBLEVBQUMsY0FBZSxPQUFBLENBQVEsZUFBUixFQUFmLFdBQUQsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsUUFBQSw2REFBQTtBQUFBLElBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdELGtCQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsU0FBRCxFQUFZLEdBQVosR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLFNBQVgsQ0FBQTtBQUFBLFFBQ0MsbUJBQUEsTUFBRCxFQUFTLDBCQUFBLGFBRFQsQ0FBQTtlQUVDLFVBQUEsR0FBRCxFQUFNLGFBQUEsTUFBTixFQUFjLGdCQUFBLFNBQWQsRUFBMkIsSUFIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxRQUFULENBQWtCLE9BQWxCLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtXQVdBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxHQUFBLENBQ0U7QUFBQSxVQUFBLElBQUEsRUFBTSxzQkFBTjtBQUFBLFVBTUEsWUFBQSxFQUFjLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/spec/insert-mode-spec.coffee
