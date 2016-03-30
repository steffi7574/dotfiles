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
      sumatra_args = ["-reuse-instance"];
      if (forward_sync) {
        sumatra_args = sumatra_args.concat(["-forward-search", '\"' + texfile + '\"', "" + row]);
      }
      sumatra_args.push('\"' + pdffile + '\"');
      command = sumatra_cmd + ' ' + sumatra_args.join(' ');
      this.ltConsole.addContent("Executing " + command, br = true);
      return exec(command, {}, (function(_this) {
        return function(err, stdout, stderr) {
          var line, _i, _len, _ref2, _results;
          if (err && !(err.code === 1 && !stderr)) {
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

    Viewer.prototype._jumpLinux = function(texfile, pdffile, row, col, forward_sync, keep_focus) {
      var br, command, okular_args, okular_cmd;
      console.log("in _jumpLinux");
      if (keep_focus) {
        okular_args = "--unique --noraise";
      } else {
        okular_args = "--unique";
      }
      okular_cmd = 'okular';
      if (forward_sync) {
        command = okular_cmd + (" " + okular_args + " \"" + pdffile + "\#src:" + row + " " + texfile + "\"");
      } else {
        command = okular_cmd + (" " + okular_args + " " + pdffile);
      }
      this.ltConsole.addContent("Executing " + command, br = true);
      console.log(command);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL3ZpZXdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOERBQUE7SUFBQTs7eUpBQUE7O0FBQUEsRUFBQSxPQUF1QixPQUFBLENBQVEsV0FBUixDQUF2QixFQUFDLGFBQUEsS0FBRCxFQUFPLG9CQUFBLFlBQVAsQ0FBQTs7QUFBQSxFQUNBLFFBQW1CLE9BQUEsQ0FBUSxlQUFSLENBQW5CLEVBQUMsYUFBQSxJQUFELEVBQU8saUJBQUEsUUFEUCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFHSiw2QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEscUJBQUEsWUFBQSxHQUFjLFNBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsR0FBbkIsRUFBd0IsR0FBeEIsRUFBNkIsWUFBN0IsRUFBMkMsVUFBM0MsR0FBQTtBQUNaLFVBQUEsc0NBQUE7QUFBQSxNQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCLENBQWQsQ0FBQTtBQUFBLE1BQ0EsWUFBQSxHQUFlLENBQUMsaUJBQUQsQ0FEZixDQUFBO0FBR0EsTUFBQSxJQUFHLFlBQUg7QUFDRSxRQUFBLFlBQUEsR0FBZSxZQUFZLENBQUMsTUFBYixDQUFvQixDQUFDLGlCQUFELEVBQW9CLElBQUEsR0FBSyxPQUFMLEdBQWEsSUFBakMsRUFBdUMsRUFBQSxHQUFHLEdBQTFDLENBQXBCLENBQWYsQ0FERjtPQUhBO0FBQUEsTUFNQSxZQUFZLENBQUMsSUFBYixDQUFrQixJQUFBLEdBQUssT0FBTCxHQUFhLElBQS9CLENBTkEsQ0FBQTtBQUFBLE1BUUEsT0FBQSxH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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/viewer.coffee
