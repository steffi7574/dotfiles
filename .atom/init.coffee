dispatch = (commands...) ->
  editor = atom.workspace.getActiveTextEditor()
  editorElement = atom.views.getView(editor)
  for command in commands
    atom.commands.dispatch(editorElement, command)

getCommandPaletteView = () ->
  for {item} in atom.workspace.getModalPanels()
    return item if item.constructor.name is 'CommandPaletteView'

getCommandPaletteEditor = () ->
  getCommandPaletteView().filterEditorView.getModel()

insertToCommandPaletteEditor = (text) ->
  editor = getCommandPaletteEditor()
  editor.insertText(text)
  editor.moveToEndOfLine()

atom.commands.add 'atom-workspace',
  'ex-command:w': -> dispatch 'core:save'
  'ex-command:wq': -> dispatch 'core:save', 'core:close'

exCommandsPrefix = 'Ex Command: '
atom.commands.add 'atom-workspace',
  'user-ex-command-open': ->
    dispatch 'command-palette:toggle'
    insertToCommandPaletteEditor(exCommandsPrefix)
