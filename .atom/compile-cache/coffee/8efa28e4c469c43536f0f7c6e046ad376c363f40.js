(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("the input element", function() {
    var editor, editorElement, exState, getCommandEditor, getVisibility, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2], exState = _ref[3];
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      exMode = atom.packages.loadPackage('ex-mode');
      waitsForPromise(function() {
        var activationPromise;
        activationPromise = exMode.activate();
        helpers.activateExMode();
        return activationPromise;
      });
      runs(function() {
        return spyOn(exMode.mainModule.globalExState, 'setVim').andCallThrough();
      });
      waitsForPromise(function() {
        return vimMode.activate();
      });
      waitsFor(function() {
        return exMode.mainModule.globalExState.setVim.calls.length > 0;
      });
      return runs(function() {
        return helpers.getEditorElement(function(element) {
          atom.commands.dispatch(element, "ex-mode:open");
          editorElement = element;
          editor = editorElement.getModel();
          atom.commands.dispatch(getCommandEditor(), "core:cancel");
          vimState = vimMode.mainModule.getEditorState(editor);
          exState = exMode.mainModule.exStates.get(editor);
          vimState.activateNormalMode();
          vimState.resetNormalMode();
          return editor.setText("abc\ndef\nabc\ndef");
        });
      });
    });
    afterEach(function() {
      return atom.commands.dispatch(getCommandEditor(), "core:cancel");
    });
    getVisibility = function() {
      return editor.normalModeInputView.panel.visible;
    };
    getCommandEditor = function() {
      return editor.normalModeInputView.editorElement;
    };
    it("opens with 'ex-mode:open'", function() {
      atom.commands.dispatch(editorElement, "ex-mode:open");
      return expect(getVisibility()).toBe(true);
    });
    it("closes with 'core:cancel'", function() {
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      atom.commands.dispatch(getCommandEditor(), "core:cancel");
      return expect(getVisibility()).toBe(false);
    });
    it("closes when opening and then pressing backspace", function() {
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      atom.commands.dispatch(getCommandEditor(), "core:backspace");
      return expect(getVisibility()).toBe(false);
    });
    it("doesn't close when there is text and pressing backspace", function() {
      var commandEditor, model;
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      commandEditor = getCommandEditor();
      model = commandEditor.getModel();
      model.setText('abc');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      return expect(model.getText()).toBe('ab');
    });
    return it("closes when there is text and pressing backspace multiple times", function() {
      var commandEditor, model;
      atom.commands.dispatch(editorElement, "ex-mode:open");
      expect(getVisibility()).toBe(true);
      commandEditor = getCommandEditor();
      model = commandEditor.getModel();
      model.setText('abc');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      expect(model.getText()).toBe('ab');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      expect(model.getText()).toBe('a');
      atom.commands.dispatch(commandEditor, "core:backspace");
      expect(getVisibility()).toBe(true);
      expect(model.getText()).toBe('');
      atom.commands.dispatch(commandEditor, "core:backspace");
      return expect(getVisibility()).toBe(false);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvc3BlYy9leC1pbnB1dC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxPQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSwrRUFBQTtBQUFBLElBQUEsT0FBNkMsRUFBN0MsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLGtCQUF4QixFQUFrQyxpQkFBbEMsQ0FBQTtBQUFBLElBQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsZUFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixVQUExQixDQUFWLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsU0FBMUIsQ0FEVCxDQUFBO0FBQUEsTUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtBQUNkLFlBQUEsaUJBQUE7QUFBQSxRQUFBLGlCQUFBLEdBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBcEIsQ0FBQTtBQUFBLFFBQ0EsT0FBTyxDQUFDLGNBQVIsQ0FBQSxDQURBLENBQUE7ZUFFQSxrQkFIYztNQUFBLENBQWhCLENBRkEsQ0FBQTtBQUFBLE1BT0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtlQUNILEtBQUEsQ0FBTSxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQXhCLEVBQXVDLFFBQXZDLENBQWdELENBQUMsY0FBakQsQ0FBQSxFQURHO01BQUEsQ0FBTCxDQVBBLENBQUE7QUFBQSxNQVVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsT0FBTyxDQUFD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

//# sourceURL=/home/sguenther/.atom/packages/ex-mode/spec/ex-input-spec.coffee
