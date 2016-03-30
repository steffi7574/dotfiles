(function() {
  var dispatch, exCommandsPrefix, getCommandPaletteEditor, getCommandPaletteView, insertToCommandPaletteEditor,
    __slice = [].slice;

  dispatch = function() {
    var command, commands, editor, editorElement, _i, _len, _results;
    commands = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    editor = atom.workspace.getActiveTextEditor();
    editorElement = atom.views.getView(editor);
    _results = [];
    for (_i = 0, _len = commands.length; _i < _len; _i++) {
      command = commands[_i];
      _results.push(atom.commands.dispatch(editorElement, command));
    }
    return _results;
  };

  getCommandPaletteView = function() {
    var item, _i, _len, _ref;
    _ref = atom.workspace.getModalPanels();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i].item;
      if (item.constructor.name === 'CommandPaletteView') {
        return item;
      }
    }
  };

  getCommandPaletteEditor = function() {
    return getCommandPaletteView().filterEditorView.getModel();
  };

  insertToCommandPaletteEditor = function(text) {
    var editor;
    editor = getCommandPaletteEditor();
    editor.insertText(text);
    return editor.moveToEndOfLine();
  };

  atom.commands.add('atom-workspace', {
    'ex-command:w': function() {
      return dispatch('core:save');
    },
    'ex-command:wq': function() {
      return dispatch('core:save', 'core:close');
    }
  });

  exCommandsPrefix = 'Ex Command: ';

  atom.commands.add('atom-workspace', {
    'user-ex-command-open': function() {
      dispatch('command-palette:toggle');
      return insertToCommandPaletteEditor(exCommandsPrefix);
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL2luaXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdHQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSw0REFBQTtBQUFBLElBRFUsa0VBQ1YsQ0FBQTtBQUFBLElBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBRGhCLENBQUE7QUFFQTtTQUFBLCtDQUFBOzZCQUFBO0FBQ0Usb0JBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLE9BQXRDLEVBQUEsQ0FERjtBQUFBO29CQUhTO0VBQUEsQ0FBWCxDQUFBOztBQUFBLEVBTUEscUJBQUEsR0FBd0IsU0FBQSxHQUFBO0FBQ3RCLFFBQUEsb0JBQUE7QUFBQTtBQUFBLFNBQUEsMkNBQUEsR0FBQTtBQUNFLE1BREcsZ0JBQUEsSUFDSCxDQUFBO0FBQUEsTUFBQSxJQUFlLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBakIsS0FBeUIsb0JBQXhDO0FBQUEsZUFBTyxJQUFQLENBQUE7T0FERjtBQUFBLEtBRHNCO0VBQUEsQ0FOeEIsQ0FBQTs7QUFBQSxFQVVBLHVCQUFBLEdBQTBCLFNBQUEsR0FBQTtXQUN4QixxQkFBQSxDQUFBLENBQXVCLENBQUMsZ0JBQWdCLENBQUMsUUFBekMsQ0FBQSxFQUR3QjtFQUFBLENBVjFCLENBQUE7O0FBQUEsRUFhQSw0QkFBQSxHQUErQixTQUFDLElBQUQsR0FBQTtBQUM3QixRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyx1QkFBQSxDQUFBLENBQVQsQ0FBQTtBQUFBLElBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEIsQ0FEQSxDQUFBO1dBRUEsTUFBTSxDQUFDLGVBQVAsQ0FBQSxFQUg2QjtFQUFBLENBYi9CLENBQUE7O0FBQUEsRUFrQkEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNFO0FBQUEsSUFBQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTthQUFHLFFBQUEsQ0FBUyxXQUFULEVBQUg7SUFBQSxDQUFoQjtBQUFBLElBQ0EsZUFBQSxFQUFpQixTQUFBLEdBQUE7YUFBRyxRQUFBLENBQVMsV0FBVCxFQUFzQixZQUF0QixFQUFIO0lBQUEsQ0FEakI7R0FERixDQWxCQSxDQUFBOztBQUFBLEVBc0JBLGdCQUFBLEdBQW1CLGNBdEJuQixDQUFBOztBQUFBLEVBdUJBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDRTtBQUFBLElBQUEsc0JBQUEsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLE1BQUEsUUFBQSxDQUFTLHdCQUFULENBQUEsQ0FBQTthQUNBLDRCQUFBLENBQTZCLGdCQUE3QixFQUZzQjtJQUFBLENBQXhCO0dBREYsQ0F2QkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/init.coffee
