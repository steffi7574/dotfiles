(function() {
  var LTool, Viewer, exec, execFile, get_tex_root, path, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('./ltutils'), LTool = _ref.LTool, get_tex_root = _ref.get_tex_root;

  _ref1 = require('child_process'), exec = _ref1.exec, execFile = _ref1.execFile;

  path = require('path');

  module.exports = Viewer = (function(_super) {
    __extends(Viewer, _super);

    function Viewer() {
      return Viewer.__super__.constructor.apply(this, arguments);
    }

    Viewer.prototype._jumpWindows = function(texfile, pdffile, row, col, forward_sync, keep_focus) {
      var br, command, sumatra_args, sumatra_cmd;
      sumatra_cmd = atom.config.get("latextools.win32.sumatra");
      sumatra_args = [];
      if (forward_sync) {
        sumatra_args = sumatra_args.concat(["-forward-search", '\"' + texfile + '\"', "" + row]);
      }
      sumatra_args.push('\"' + pdffile + '\"');
      command = sumatra_cmd + ' ' + sumatra_args.join(' ');
      this.ltConsole.addContent("Executing " + command, br = true);
      return exec(command, {}, (function(_this) {
        return function(err, stdout, stderr) {
          var line, _i, _len, _ref2, _results;
          if (err > 1) {
            _this.ltConsole.addContent("ERROR " + err.code + ": ", br = true);
            _ref2 = stderr.split('\n');
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              line = _ref2[_i];
              _results.push(_this.ltConsole.addContent(line, br = true));
            }
            return _results;
          }
        };
      })(this));
    };

    Viewer.prototype._jumpDarwin = function(texfile, pdffile, row, col, forward_sync, keep_focus) {
      var br, command, displayfile_cmd, skim_args, skim_cmd;
      if (keep_focus) {
        skim_args = "-r -g";
      } else {
        skim_args = "-r";
      }
      if (forward_sync) {
        skim_cmd = '/Applications/Skim.app/Contents/SharedSupport/displayline';
        command = skim_cmd + (" " + skim_args + " " + row + " \"" + pdffile + "\" \"" + texfile + "\"");
      } else {
        displayfile_cmd = path.join(atom.packages.resolvePackagePath("latextools"), "lib/support/displayfile");
        command = "sh " + displayfile_cmd + (" " + skim_args + " " + pdffile);
      }
      this.ltConsole.addContent("Executing " + command, br = true);
      return exec(command, {}, (function(_this) {
        return function(err, stdout, stderr) {
          var line, _i, _len, _ref2, _results;
          if (err) {
            _this.ltConsole.addContent("ERROR " + err.code + ": ", br = true);
            _ref2 = stderr.split('\n');
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              line = _ref2[_i];
              _results.push(_this.ltConsole.addContent(line, br = true));
            }
            return _results;
          }
        };
      })(this));
    };

    Viewer.prototype._jumpLinux = function() {
      return alert("Not implemented yet");
    };

    Viewer.prototype._jumpToPdf = function(texfile, pdffile, row, col) {
      var forward_sync, keep_focus;
      if (col == null) {
        col = 1;
      }
      forward_sync = atom.config.get("latextools.forwardSync");
      keep_focus = atom.config.get("latextools.keepFocus");
      switch (process.platform) {
        case "darwin":
          return this._jumpDarwin(texfile, pdffile, row, col, forward_sync, keep_focus);
        case "win32":
          return this._jumpWindows(texfile, pdffile, row, col, forward_sync, keep_focus);
        case "linux":
          return this._jumpLinux(texfile, pdffile, row, col, forward_sync, keep_focus);
        default:
          return alert("Sorry, no viewer for the current platform");
      }
    };

    Viewer.prototype.jumpToPdf = function() {
      var col, current_file, master_file, master_path_no_ext, parsed_current, parsed_master, pt, row, te, tex_exts, _ref2, _ref3;
      te = atom.workspace.getActiveTextEditor();
      pt = te.getCursorBufferPosition();
      row = pt.row + 1;
      col = pt.column + 1;
      current_file = te.getPath();
      master_file = get_tex_root(te);
      parsed_master = path.parse(master_file);
      parsed_current = path.parse(current_file);
      tex_exts = atom.config.get("latextools.texFileExtensions");
      if ((_ref2 = parsed_master.ext, __indexOf.call(tex_exts, _ref2) >= 0) && (_ref3 = parsed_current.ext, __indexOf.call(tex_exts, _ref3) >= 0)) {
        master_path_no_ext = path.join(parsed_master.dir, parsed_master.name);
        this.ltConsole.addContent("Jump to " + row + "," + col);
        return this._jumpToPdf(current_file, master_path_no_ext + ".pdf", row, col);
      }
    };

    return Viewer;

  })(LTool);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL3ZpZXdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOERBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsV0FBUixDQUF2QixFQUFDLGFBQUEsS0FBRCxFQUFPLG9CQUFBLFlBQVAsQ0FBQTs7QUFBQSxFQUNBLFFBQW1CLE9BQUEsQ0FBUSxlQUFSLENBQW5CLEVBQUMsYUFBQSxJQUFELEVBQU8saUJBQUEsUUFEUCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFHSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUJBQUEsWUFBQSxHQUFjLFNBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsR0FBbkIsRUFBd0IsR0FBeEIsRUFBNkIsWUFBN0IsRUFBMkMsVUFBM0MsR0FBQTtBQUNaLFVBQUEsc0NBQUE7QUFBQSxNQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCLENBQWQsQ0FBQTtBQUFBLE1BQ0EsWUFBQSxHQUFlLEVBRGYsQ0FBQTtBQUdBLE1BQUEsSUFBRyxZQUFIO0FBQ0UsUUFBQSxZQUFBLEdBQWUsWUFBWSxDQUFDLE1BQWIsQ0FBb0IsQ0FBQyxpQkFBRCxFQUFvQixJQUFBLEdBQUssT0FBTCxHQUFhLElBQWpDLEVBQXVDLEVBQUEsR0FBRyxHQUExQyxDQUFwQixDQUFmLENBREY7T0FIQTtBQUFBLE1BTUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsSUFBQSxHQUFLLE9BQUwsR0FBYSxJQUEvQixDQU5BLENBQUE7QUFBQSxNQVFBLE9BQUEsR0FBVSxXQUFBLEdB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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/viewer.coffee
