(function() {
  var Builder, LTool, exec, fs, get_tex_root, parse_tex_directives, parse_tex_log, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('./ltutils'), LTool = _ref.LTool, get_tex_root = _ref.get_tex_root;

  exec = require('child_process').exec;

  path = require('path');

  fs = require('fs');

  parse_tex_log = require('./parsers/parseTeXLog').parse_tex_log;

  parse_tex_directives = require('./parsers/tex-directive-parser');

  module.exports = Builder = (function(_super) {
    __extends(Builder, _super);

    function Builder() {
      return Builder.__super__.constructor.apply(this, arguments);
    }

    Builder.prototype.latexmk = function(dir, texfile, texfilename, user_options, user_program) {
      var br, command, options, texopt, _i, _len;
      this.ltConsole.addContent("latexmk builder", br = true);
      if (user_program === 'pdflatex') {
        user_program = 'pdf';
      }
      options = ["-cd", "-e", "-f", "-" + user_program, "-interaction=nonstopmode", "-synctex=1"];
      for (_i = 0, _len = user_options.length; _i < _len; _i++) {
        texopt = user_options[_i];
        options.push("-latexoption=\"" + texopt + "\"");
      }
      command = ["latexmk"].concat(options, "\"" + texfile + "\"").join(' ');
      this.ltConsole.addContent(command, br = true);
      return command;
    };

    Builder.prototype.texify = function(dir, texfile, texfilename, user_options, user_program) {
      var br, command, options, program, tex_options, tex_options_string;
      this.ltConsole.addContent("texify builder (internal)", br = true);
      options = ["-b", "-p"];
      user_program = (function() {
        switch (user_program) {
          case 'pdflatex':
            return 'pdftex';
          case 'xelatex':
            return 'xetex';
          case 'lualatex':
            return 'luatex';
          default:
            return user_program;
        }
      })();
      options.push("--engine=" + user_program);
      tex_options = ["--synctex=1"].concat(user_options);
      tex_options_string = "--tex-option=\"" + (tex_options.join(' ')) + "\"";
      options = options.concat([tex_options_string]);
      program = "pdflatex";
      command = ["texify"].concat(options, "\"" + texfile + "\"").join(' ');
      this.ltConsole.addContent(command, br = true);
      return command;
    };

    Builder.prototype.build = function() {
      var br, builder, cmd_env, command, current_path, directives, filebase, filedir, filename, fname, keyMaps, multiValues, parsed_fname, te, texpath, user_options, user_program, whitelist, _ref1, _ref2;
      this.ltConsole.show();
      this.ltConsole.clear();
      te = atom.workspace.getActiveTextEditor();
      if (te === '') {
        this.ltConsole.addContent("Focus the text editor before invoking a build");
        return;
      }
      if (te.isModified()) {
        te.save();
      }
      fname = get_tex_root(te);
      parsed_fname = path.parse(fname);
      filedir = parsed_fname.dir;
      filebase = parsed_fname.base;
      filename = parsed_fname.name;
      directives = parse_tex_directives(fname, multiValues = ['option'], keyMaps = {
        'ts-program': 'program'
      });
      user_options = atom.config.get("latextools.builderSettings.options");
      user_options = user_options.concat(directives.option);
      if (user_options.length === 1 && user_options[0] === void 0) {
        user_options = [];
      }
      whitelist = ["pdflatex", "xelatex", "lualatex"];
      if (process.platform === 'win32') {
        whitelist = whitelist.concat(["pdftex", "xetex", "luatex"]);
      }
      if (_ref1 = directives.program, __indexOf.call(whitelist, _ref1) >= 0) {
        user_program = directives.program;
      } else {
        user_program = atom.config.get("latextools.builderSettings.program");
      }
      if (process.platform === "win32") {
        current_path = process.env.Path;
      } else {
        current_path = process.env.PATH;
      }
      texpath = atom.config.get("latextools." + process.platform + ".texpath");
      this.ltConsole.addContent("Platform: " + process.platform + "; texpath: " + texpath);
      cmd_env = process.env;
      if (texpath) {
        cmd_env.PATH = current_path + path.delimiter + texpath;
        this.ltConsole.addContent("setting PATH = " + process.env.PATH);
      }
      this.ltConsole.addContent("Processing file " + filebase + " (" + filename + ") in directory " + filedir, br = true);
      builder = atom.config.get("latextools.builder");
      if (builder !== "texify-latexmk") {
        builder = "texify-latexmk";
      }
      if (builder === "texify-latexmk") {
        if ((_ref2 = process.platform) === "darwin" || _ref2 === "linux") {
          command = this.latexmk(filedir, filebase, filename, user_options, user_program);
        } else {
          command = this.texify(filedir, filebase, filename, user_options, user_program);
        }
        cmd_env.MYTEST = "Hello, world!";
        command = command;
        return exec(command, {
          cwd: filedir,
          env: cmd_env
        }, (function(_this) {
          return function(err, stdout, stderr) {
            var errors, fulllogfile, log, warn, warnings, _fn, _fn1, _i, _j, _len, _len1, _ref3;
            fulllogfile = path.join(filedir, filename + ".log");
            _this.ltConsole.addContent("Parsing " + fulllogfile, br = true);
            log = fs.readFileSync(fulllogfile, 'utf8');
            process.chdir(filedir);
            _ref3 = parse_tex_log(log), errors = _ref3[0], warnings = _ref3[1];
            _this.ltConsole.addContent("ERRORS:", br = true);
            _fn = function(err) {
              var err_string;
              if (err[1] === -1) {
                err_string = "" + err[0] + ": " + err[2] + " [" + err[3] + "]";
                return _this.ltConsole.addContent(err_string, br = true);
              } else {
                err_string = "" + err[0] + ":" + err[1] + ": " + err[2] + " [" + err[3] + "]";
                return _this.ltConsole.addContent(err_string, true, false, function() {
                  return atom.workspace.open(err[0], {
                    initialLine: err[1] - 1
                  });
                });
              }
            };
            for (_i = 0, _len = errors.length; _i < _len; _i++) {
              err = errors[_i];
              _fn(err);
            }
            _this.ltConsole.addContent("WARNINGS:", br = true);
            _fn1 = function(warn) {
              var warn_string;
              if (warn[1] === -1) {
                warn_string = "" + warn[0] + ": " + warn[2];
                return _this.ltConsole.addContent(warn_string, br = true);
              } else {
                warn_string = "" + warn[0] + ":" + warn[1] + ": " + warn[2];
                return _this.ltConsole.addContent(warn_string, true, false, function() {
                  return atom.workspace.open(warn[0], {
                    initialLine: warn[1] - 1
                  });
                });
              }
            };
            for (_j = 0, _len1 = warnings.length; _j < _len1; _j++) {
              warn = warnings[_j];
              _fn1(warn);
            }
            _this.ltConsole.addContent("Jumping to PDF...", br = true);
            return _this.viewer.jumpToPdf();
          };
        })(this));
      }
    };

    return Builder;

  })(LTool);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2J1aWxkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVGQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUEsT0FBdUIsT0FBQSxDQUFRLFdBQVIsQ0FBdkIsRUFBQyxhQUFBLEtBQUQsRUFBTyxvQkFBQSxZQUFQLENBQUE7O0FBQUEsRUFDQyxPQUFRLE9BQUEsQ0FBUSxlQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUhMLENBQUE7O0FBQUEsRUFJQyxnQkFBaUIsT0FBQSxDQUFRLHVCQUFSLEVBQWpCLGFBSkQsQ0FBQTs7QUFBQSxFQUtBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSxnQ0FBUixDQUx2QixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FFTTtBQWVKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxzQkFBQSxPQUFBLEdBQVMsU0FBQyxHQUFELEVBQU0sT0FBTixFQUFlLFdBQWYsRUFBNEIsWUFBNUIsRUFBMEMsWUFBMUMsR0FBQTtBQUNQLFVBQUEsc0NBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsVUFBWCxDQUFzQixpQkFBdEIsRUFBd0MsRUFBQSxHQUFHLElBQTNDLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBd0IsWUFBQSxLQUFnQixVQUF4QztBQUFBLFFBQUEsWUFBQSxHQUFlLEtBQWYsQ0FBQTtPQUZBO0FBQUEsTUFJQSxPQUFBLEdBQVcsQ0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLElBQWQsRUFBcUIsR0FBQSxHQUFHLFlBQXhCLEVBQ1QsMEJBRFMsRUFD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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/builder.coffee
