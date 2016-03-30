(function() {
  var LTool, SnippetManager, get_tex_root, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('./ltutils'), LTool = _ref.LTool, get_tex_root = _ref.get_tex_root;

  module.exports = SnippetManager = (function(_super) {
    __extends(SnippetManager, _super);

    SnippetManager.prototype.snippetService = null;

    function SnippetManager() {
      SnippetManager.__super__.constructor.apply(this, arguments);
      console.log("Created SnippetManager");
    }

    SnippetManager.prototype.setService = function(service) {
      console.log("Set snippet service");
      console.log(service);
      return this.snippetService = service;
    };

    SnippetManager.prototype.wrapInCommand = function() {
      var cmd_range, range, snippet, te, text;
      if (!this.snippetService) {
        alert("Still waiting for the snippets service to activate...");
        return;
      }
      te = atom.workspace.getActiveTextEditor();
      range = te.getSelectedBufferRange();
      text = te.getTextInBufferRange(range);
      te.setTextInBufferRange(range, "");
      snippet = "\\\\$1cmd\{" + text + "\}";
      cmd_range = [[range.start.row, range.start.column + 1], [range.start.row, range.start.column + 4]];
      this.snippetService.insertSnippet(snippet);
      return te.setSelectedBufferRange(cmd_range);
    };

    SnippetManager.prototype.wrapInEnvironment = function() {
      var cmd_range_begin, cmd_range_end, nlines, range, snippet, te, text;
      if (!this.snippetService) {
        alert("Still waiting for the snippets service to activate...");
        return;
      }
      te = atom.workspace.getActiveTextEditor();
      range = te.getSelectedBufferRange();
      text = te.getTextInBufferRange(range);
      te.setTextInBufferRange(range, "");
      snippet = "\\\\begin\{$1env\}\n" + text + "\n\\\\end\{$1env\}";
      cmd_range_begin = [[range.start.row, range.start.column + 7], [range.start.row, range.start.column + 10]];
      nlines = text.split('\n').length;
      cmd_range_end = [[range.start.row + nlines + 1, range.start.column + 5], [range.start.row + nlines + 1, range.start.column + 8]];
      this.snippetService.insertSnippet(snippet);
      te.setSelectedBufferRange(cmd_range_begin);
      return te.addSelectionForBufferRange(cmd_range_end);
    };

    SnippetManager.prototype.wrapIn = function(cmd) {
      var range, snippet, te, text;
      if (!this.snippetService) {
        alert("Still waiting for the snippets service to activate...");
        return;
      }
      te = atom.workspace.getActiveTextEditor();
      range = te.getSelectedBufferRange();
      text = te.getTextInBufferRange(range);
      if (text) {
        snippet = "\\\\" + cmd + "\\{" + text + "\\}$0";
      } else {
        snippet = "\\\\" + cmd + "\\{$1\\}$0";
      }
      return this.snippetService.insertSnippet(snippet);
    };

    SnippetManager.prototype.closeEnvironment = function() {
      var begin_rx, cursor, found, te;
      begin_rx = /\\(begin|end)\{([^\}]*)\}/;
      te = atom.workspace.getActiveTextEditor();
      cursor = te.getCursorBufferPosition();
      found = false;
      te.backwardsScanInBufferRange(begin_rx, [[0, 0], cursor], (function(_this) {
        return function(_arg) {
          var match, matchText, range, replace, stop;
          match = _arg.match, matchText = _arg.matchText, range = _arg.range, stop = _arg.stop, replace = _arg.replace;
          console.log(match);
          console.log(stop);
          if (match[1] === 'begin') {
            te.insertText("\\end{" + match[2] + "}\n");
            found = true;
          }
          return stop();
        };
      })(this));
      if (!found) {
        return alert("No unmatched \\begin");
      }
    };

    SnippetManager.prototype.dollarSign = function() {
      var cursor, pos, range, snippet, te, text;
      te = atom.workspace.getActiveTextEditor();
      if (text = te.getSelectedText()) {
        range = te.getSelectedBufferRange();
        te.setSelectedBufferRange(range, '');
        this.snippetService.insertSnippet("\$" + text + "\$");
        return;
      }
      cursor = te.getCursorBufferPosition();
      text = te.getTextInBufferRange([[cursor.row, 0], [cursor.row, cursor.column + 1]]);
      pos = cursor.column;
      if ((text[pos] != null) && text[pos] === '$') {
        te.moveRight();
        if ((text[pos + 1] != null) && text[pos + 1] === '$') {
          te.moveRight();
        }
        return;
      }
      if ((pos === 0) || (pos > 0) && !text[pos - 1].match(/[a-zA-Z0-9\$\\]/)) {
        snippet = "\$${1: }\$";
        return this.snippetService.insertSnippet(snippet);
      } else {
        return te.insertText('$');
      }
    };

    SnippetManager.prototype.quotes = function(left, right, ch) {
      var cursor, range, snippet, te, text;
      te = atom.workspace.getActiveTextEditor();
      if (text = te.getSelectedText()) {
        range = te.getSelectedBufferRange();
        te.setSelectedBufferRange(range, '');
        this.snippetService.insertSnippet("" + left + "${1:" + text + "}" + right);
        return;
      }
      cursor = te.getCursorBufferPosition();
      text = te.getTextInBufferRange([[cursor.row, 0], [cursor.row, cursor.column]]);
      if ((text[cursor.column - 1] != null) && !text[cursor.column - 1].match(/\s/) && text[cursor.column - 1] !== left) {
        te.insertText(ch);
        return;
      }
      snippet = "" + left + "$0" + right;
      return this.snippetService.insertSnippet(snippet);
    };

    return SnippetManager;

  })(LTool);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL3NuaXBwZXQtbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxXQUFSLENBQXZCLEVBQUMsYUFBQSxLQUFELEVBQU8sb0JBQUEsWUFBUCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQUNKLHFDQUFBLENBQUE7O0FBQUEsNkJBQUEsY0FBQSxHQUFnQixJQUFoQixDQUFBOztBQUVhLElBQUEsd0JBQUEsR0FBQTtBQUNYLE1BQUEsaURBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVosQ0FEQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSw2QkFNQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsUUFIUjtJQUFBLENBTlosQ0FBQTs7QUFBQSw2QkFXQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBR2IsVUFBQSxtQ0FBQTtBQUFBLE1BQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxjQUFMO0FBQ0UsUUFBQSxLQUFBLENBQU0sdURBQU4sQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUZGO09BQUE7QUFBQSxNQUlBLEVBQUEsR0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FKTCxDQUFBO0FBQUEsTUFLQSxLQUFBLEdBQVEsRUFBRSxDQUFDLHNCQUFILENBQUEsQ0FMUixDQUFBO0FB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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/snippet-manager.coffee
