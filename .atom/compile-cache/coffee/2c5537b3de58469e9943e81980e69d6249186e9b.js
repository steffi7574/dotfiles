(function() {
  var TextData, dispatch, getVimState, globalState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  globalState = require('../lib/global-state');

  describe("Motion Find", function() {
    var editor, editorElement, ensure, keystroke, set, vimState, _ref1;
    _ref1 = [], set = _ref1[0], ensure = _ref1[1], keystroke = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], vimState = _ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      return vimState.activate('reset');
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the first specified character it finds', function() {
        return ensure([
          'f', {
            char: 'c'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'F', {
            char: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2f', {
            char: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        ({
          cursor: [0, 6]
        });
        return ensure([
          '2F', {
            char: 'a'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          'f', {
            char: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '10f', {
            char: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '11f', {
            char: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '10F', {
            char: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '11F', {
            char: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd2f', {
            char: 'a'
          }
        ], {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'dF', {
            char: 'a'
          }
        ], {
          text: 'abcabcabc\n'
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the character previous to the first specified character it finds', function() {
        ensure([
          't', {
            char: 'a'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure([
          't', {
            char: 'a'
          }
        ], {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure([
          'T', {
            char: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure([
          '2t', {
            char: 'a'
          }
        ], {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure([
          '2T', {
            char: 'a'
          }
        ], {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure([
          't', {
            char: 'd'
          }
        ], {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure([
          '10t', {
            char: 'd'
          }
        ], {
          cursor: [0, 0]
        });
        ensure([
          '11t', {
            char: 'a'
          }
        ], {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure([
          '10T', {
            char: 'a'
          }
        ], {
          cursor: [0, 6]
        });
        return ensure([
          '11T', {
            char: 'a'
          }
        ], {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'd2t', {
            char: 'b'
          }
        ], {
          text: 'abcbcabc\n'
        });
      });
      it("selects character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 0]
        });
        return ensure([
          'dt', {
            char: 'b'
          }
        ], {
          text: 'bcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'dT', {
            char: 'b'
          }
        ], {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure([
          'dT', {
            char: 'c'
          }
        ], {
          text: 'abcabcabcabc\n'
        });
      });
    });
    return describe('the ; and , keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it("repeat f in same direction", function() {
        ensure([
          'f', {
            char: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 8]
        });
      });
      it("repeat F in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            char: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 2]
        });
      });
      it("repeat f in opposite direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            char: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("repeat F in opposite direction", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'F', {
            char: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("alternate repeat f in same direction and reverse", function() {
        ensure([
          'f', {
            char: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("alternate repeat F in same direction and reverse", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'F', {
            char: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("repeat t in same direction", function() {
        ensure([
          't', {
            char: 'c'
          }
        ], {
          cursor: [0, 1]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure([
          'T', {
            char: 'c'
          }
        ], {
          cursor: [0, 9]
        });
        return ensure(';', {
          cursor: [0, 6]
        });
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 3]
        });
        ensure([
          't', {
            char: 'c'
          }
        ], {
          cursor: [0, 4]
        });
        ensure(',', {
          cursor: [0, 3]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 4]
        });
        ensure([
          'T', {
            char: 'c'
          }
        ], {
          cursor: [0, 3]
        });
        ensure(',', {
          cursor: [0, 4]
        });
        return ensure(';', {
          cursor: [0, 3]
        });
      });
      it("repeat with count in same direction", function() {
        set({
          cursor: [0, 0]
        });
        ensure([
          'f', {
            char: 'c'
          }
        ], {
          cursor: [0, 2]
        });
        return ensure('2;', {
          cursor: [0, 8]
        });
      });
      it("repeat with count in reverse direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure([
          'f', {
            char: 'c'
          }
        ], {
          cursor: [0, 8]
        });
        return ensure('2,', {
          cursor: [0, 2]
        });
      });
      return it("shares the most recent find/till command with other editors", function() {
        return getVimState(function(otherVimState, other) {
          var otherEditor, pane;
          set({
            text: "a baz bar\n",
            cursor: [0, 0]
          });
          other.set({
            text: "foo bar baz",
            cursor: [0, 0]
          });
          otherEditor = otherVimState.editor;
          pane = atom.workspace.getActivePane();
          pane.activateItem(editor);
          ensure([
            'f', {
              char: 'b'
            }
          ], {
            cursor: [0, 2]
          });
          other.ensure({
            cursor: [0, 0]
          });
          pane.activateItem(otherEditor);
          other.keystroke(';');
          ensure({
            cursor: [0, 2]
          });
          other.ensure({
            cursor: [0, 4]
          });
          other.keystroke([
            't', {
              char: 'r'
            }
          ]);
          ensure({
            cursor: [0, 2]
          });
          other.ensure({
            cursor: [0, 5]
          });
          pane.activateItem(editor);
          ensure(';', {
            cursor: [0, 7]
          });
          return other.ensure({
            cursor: [0, 5]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tZmluZC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0REFBQTs7QUFBQSxFQUFBLE9BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsbUJBQUEsV0FBRCxFQUFjLGdCQUFBLFFBQWQsRUFBd0IsZ0JBQUEsUUFBeEIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUixDQUZkLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSw4REFBQTtBQUFBLElBQUEsUUFBNEQsRUFBNUQsRUFBQyxjQUFELEVBQU0saUJBQU4sRUFBYyxvQkFBZCxFQUF5QixpQkFBekIsRUFBaUMsd0JBQWpDLEVBQWdELG1CQUFoRCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNWLFFBQUEsUUFBQSxHQUFXLEtBQVgsQ0FBQTtBQUFBLFFBQ0Msa0JBQUEsTUFBRCxFQUFTLHlCQUFBLGFBRFQsQ0FBQTtlQUVDLFdBQUEsR0FBRCxFQUFNLGNBQUEsTUFBTixFQUFjLGlCQUFBLFNBQWQsRUFBMkIsS0FIakI7TUFBQSxDQUFaLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBUUEsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFFBQVEsQ0FBQyxRQUFULENBQWtCLE9BQWxCLEVBRFE7SUFBQSxDQUFWLENBUkEsQ0FBQTtBQUFBLElBV0EsUUFBQSxDQUFTLHFCQUFULEVBQWdD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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/spec/motion-find-spec.coffee
