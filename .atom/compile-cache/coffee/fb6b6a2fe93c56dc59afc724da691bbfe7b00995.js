(function() {
  var TextData, dispatch, getVimState, globalState, settings, _ref;

  _ref = require('./spec-helper'), getVimState = _ref.getVimState, dispatch = _ref.dispatch, TextData = _ref.TextData;

  settings = require('../lib/settings');

  globalState = require('../lib/global-state');

  describe("Motion Search", function() {
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
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        set({
          text: "abc\ndef\nabc\ndef\n",
          cursor: [0, 0]
        });
        spyOn(atom.workspace, 'getActivePane').andReturn(pane);
        vimState.searchHistory.clear();
        return globalState.currentSearch = {};
      });
      describe("as a motion", function() {
        it("moves the cursor to the specified search pattern", function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          return expect(pane.activate).toHaveBeenCalled();
        });
        it("loops back around", function() {
          set({
            cursor: [3, 0]
          });
          return ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
        });
        it("uses a valid regex as a regex", function() {
          ensure([
            '/', {
              search: '[abc]'
            }
          ], {
            cursor: [0, 1]
          });
          return ensure('n', {
            cursor: [0, 2]
          });
        });
        it("uses an invalid regex as a literal string", function() {
          set({
            text: "abc\n[abc]\n"
          });
          ensure([
            '/', {
              search: '[abc'
            }
          ], {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [1, 0]
          });
        });
        it("uses ? as a literal string", function() {
          set({
            text: "abc\n[a?c?\n"
          });
          ensure([
            '/', {
              search: '?'
            }
          ], {
            cursor: [1, 2]
          });
          return ensure('n', {
            cursor: [1, 4]
          });
        });
        it('works with selection in visual mode', function() {
          set({
            text: 'one two three'
          });
          ensure([
            'v/', {
              search: 'th'
            }
          ], {
            cursor: [0, 9]
          });
          return ensure('d', {
            text: 'hree'
          });
        });
        it('extends selection when repeating search in visual mode', function() {
          set({
            text: "line1\nline2\nline3"
          });
          ensure([
            'v/', {
              search: 'line'
            }
          ], {
            selectedBufferRange: [[0, 0], [1, 1]]
          });
          return ensure('n', {
            selectedBufferRange: [[0, 0], [2, 1]]
          });
        });
        it('searches to the correct column in visual linewise mode', function() {
          return ensure([
            'V/', {
              search: 'ef'
            }
          ], {
            selectedText: "abc\ndef\n",
            characterwiseHead: [1, 1],
            cursor: [2, 0],
            mode: ['visual', 'linewise']
          });
        });
        it('not extend linwise selection if search matches on same line', function() {
          set({
            text: "abc def\ndef\n"
          });
          return ensure([
            'V/', {
              search: 'ef'
            }
          ], {
            selectedText: "abc def\n"
          });
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            return set({
              text: "\nabc\nABC\n",
              cursor: [0, 0]
            });
          });
          it("works in case sensitive mode", function() {
            ensure([
              '/', {
                search: 'ABC'
              }
            ], {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode", function() {
            ensure([
              '/', {
                search: '\\cAbC'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode wherever \\c is", function() {
            ensure([
              '/', {
                search: 'AbC\\c'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("uses case insensitive search if useSmartcaseForSearch is true and searching lowercase", function() {
            settings.set('useSmartcaseForSearch', true);
            ensure([
              '/', {
                search: 'abc'
              }
            ], {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          return it("uses case sensitive search if useSmartcaseForSearch is true and searching uppercase", function() {
            settings.set('useSmartcaseForSearch', true);
            ensure([
              '/', {
                search: 'ABC'
              }
            ], {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            set({
              cursor: [0, 0]
            });
            ensure('n', {
              cursor: [0, 0]
            });
            set({
              cursor: [1, 1]
            });
            return ensure('n', {
              cursor: [1, 1]
            });
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            return keystroke([
              '/', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search with /<enter>", function() {
            return ensure([
              '/', {
                search: ''
              }
            ], {
              cursor: [3, 0]
            });
          });
          it("repeats previous search with //", function() {
            return ensure([
              '/', {
                search: '/'
              }
            ], {
              cursor: [3, 0]
            });
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              ensure('N', {
                cursor: [3, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            return ensure([
              'd/', {
                search: 'def'
              }
            ], {
              text: "def\nabc\ndef\n"
            });
          });
          return it("repeats correctly with operators", function() {
            return ensure([
              'd/', {
                search: 'def'
              }, '.'
            ], {
              text: "def\n"
            });
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          return ensure([
            '?', {
              search: 'def'
            }
          ], {
            cursor: [3, 0]
          });
        });
        it("accepts / as a literal search pattern", function() {
          set({
            text: "abc\nd/f\nabc\nd/f\n",
            cursor: [0, 0]
          });
          ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [3, 1]
          });
          return ensure([
            '?', {
              search: '/'
            }
          ], {
            cursor: [1, 1]
          });
        });
        return describe("repeating", function() {
          beforeEach(function() {
            return keystroke([
              '?', {
                search: 'def'
              }
            ]);
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            return ensure([
              '?', {
                search: ''
              }
            ], {
              cursor: [1, 0]
            });
          });
          it("repeats previous search as reversed with ??", function() {
            return ensure([
              '?', {
                search: '?'
              }
            ], {
              cursor: [1, 0]
            });
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
      });
      return describe("using search history", function() {
        var ensureInputEditor, inputEditor;
        inputEditor = null;
        ensureInputEditor = function(command, _arg) {
          var text;
          text = _arg.text;
          dispatch(inputEditor, command);
          return expect(inputEditor.getModel().getText()).toEqual(text);
        };
        beforeEach(function() {
          ensure([
            '/', {
              search: 'def'
            }
          ], {
            cursor: [1, 0]
          });
          ensure([
            '/', {
              search: 'abc'
            }
          ], {
            cursor: [2, 0]
          });
          return inputEditor = vimState.searchInput.view.editorElement;
        });
        it("allows searching history in the search field", function() {
          var _editor;
          _editor = inputEditor.getModel();
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          return ensureInputEditor('core:move-up', {
            text: 'def'
          });
        });
        return it("resets the search field to empty when scrolling back", function() {
          keystroke('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          ensureInputEditor('core:move-down', {
            text: 'abc'
          });
          return ensureInputEditor('core:move-down', {
            text: ''
          });
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abd\n@def\nabd\ndef\n",
          cursorBuffer: [0, 0]
        });
      });
      return describe("as a motion", function() {
        it("moves cursor to next occurence of word under cursor", function() {
          return ensure('*', {
            cursorBuffer: [2, 0]
          });
        });
        it("repeats with the n key", function() {
          ensure('*', {
            cursorBuffer: [2, 0]
          });
          return ensure('n', {
            cursorBuffer: [0, 0]
          });
        });
        it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursorBuffer: [0, 0]
          });
          return ensure('*', {
            cursorBuffer: [0, 0]
          });
        });
        describe("with words that contain 'non-word' characters", function() {
          it("moves cursor to next occurence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            set({
              text: "abc\n@def\nabc\n@def1\n",
              cursorBuffer: [1, 1]
            });
            return ensure('*', {
              cursorBuffer: [1, 0]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\ndef\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 1]
            });
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            set({
              text: "abc\na  @def\n abc\n @def",
              cursorBuffer: [1, 1]
            });
            return ensure('*', {
              cursorBuffer: [3, 1]
            });
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            set({
              text: "abc\n@def\nabc\n ",
              cursorBuffer: [3, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      return describe("as a motion", function() {
        it("moves cursor to previous occurence of word under cursor", function() {
          set({
            text: "abc\n@def\nabc\ndef\n",
            cursorBuffer: [2, 1]
          });
          return ensure('#', {
            cursorBuffer: [0, 0]
          });
        });
        it("repeats with n", function() {
          set({
            text: "abc\n@def\nabc\ndef\nabc\n",
            cursorBuffer: [2, 1]
          });
          ensure('#', {
            cursorBuffer: [0, 0]
          });
          ensure('n', {
            cursorBuffer: [4, 0]
          });
          return ensure('n', {
            cursorBuffer: [2, 0]
          });
        });
        it("doesn't move cursor unless next occurence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursorBuffer: [0, 0]
          });
          return ensure('#', {
            cursorBuffer: [0, 0]
          });
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [3, 0]
            });
            return ensure('#', {
              cursorBuffer: [1, 0]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\n@def\nabc\ndef\n",
              cursorBuffer: [3, 0]
            });
            return ensure('#', {
              cursorBuffer: [1, 1]
            });
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursorBuffer: [1, 0]
            });
            return ensure('*', {
              cursorBuffer: [3, 0]
            });
          });
        });
      });
    });
    return describe('the % motion', function() {
      beforeEach(function() {
        return set({
          text: "( ( ) )--{ text in here; and a function call(with parameters) }\n",
          cursor: [0, 0]
        });
      });
      it('matches the correct parenthesis', function() {
        return ensure('%', {
          cursor: [0, 6]
        });
      });
      it('matches the correct brace', function() {
        set({
          cursor: [0, 9]
        });
        return ensure('%', {
          cursor: [0, 62]
        });
      });
      it('is behave inclusively when composed with operator', function() {
        set({
          cursor: [0, 9]
        });
        return ensure('d%', {
          text: "( ( ) )--\n"
        });
      });
      it('moves correctly when composed with v going forward', function() {
        return ensure('v%', {
          cursor: [0, 7],
          selectedText: '( ( ) )'
        });
      });
      it('moves correctly when composed with v going backward', function() {
        set({
          cursor: [0, 5]
        });
        return ensure('v%', {
          cursor: [0, 0]
        });
      });
      it('it moves appropriately to find the nearest matching action', function() {
        set({
          cursor: [0, 3]
        });
        return ensure('%', {
          cursor: [0, 2]
        });
      });
      it('it moves appropriately to find the nearest matching action', function() {
        set({
          cursor: [0, 26]
        });
        return ensure('%', {
          cursor: [0, 60]
        });
      });
      it("finds matches across multiple lines", function() {
        set({
          text: "...(\n...)",
          cursor: [0, 0]
        });
        return ensure('%', {
          cursor: [1, 3]
        });
      });
      return it("does not affect search history", function() {
        ensure([
          '/', {
            search: 'func'
          }
        ], {
          cursor: [0, 31]
        });
        ensure('%', {
          cursor: [0, 60]
        });
        return ensure('n', {
          cursor: [0, 31]
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9tb3Rpb24tc2VhcmNoLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDREQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyxtQkFBQSxXQUFELEVBQWMsZ0JBQUEsUUFBZCxFQUF3QixnQkFBQSxRQUF4QixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQURYLENBQUE7O0FBQUEsRUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRmQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLDhEQUFBO0FBQUEsSUFBQSxRQUE0RCxFQUE1RCxFQUFDLGNBQUQsRUFBTSxpQkFBTixFQUFjLG9CQUFkLEVBQXlCLGlCQUF6QixFQUFpQyx3QkFBakMsRUFBZ0QsbUJBQWhELENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1YsUUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBQUEsUUFDQyxrQkFBQSxNQUFELEVBQVMseUJBQUEsYUFEVCxDQUFBO2VBRUMsV0FBQSxHQUFELEVBQU0sY0FBQSxNQUFOLEVBQWMsaUJBQUEsU0FBZCxFQUEyQixLQUhqQjtNQUFBLENBQVosRUFEUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFRQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsT0FBbEIsRUFEUTtJQUFBLENBQVYsQ0FSQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsa0JBQVQsRUFB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

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/spec/motion-search-spec.coffee
