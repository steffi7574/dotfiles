(function() {
  var CompositeDisposable, LTool, fs, parse_tex_directives, path,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  parse_tex_directives = require('./parsers/tex-directive-parser');

  fs = require('fs');

  path = require('path');

  module.exports.LTool = LTool = (function() {
    LTool.prototype.viewer = null;

    function LTool(ltConsole) {
      this.ltConsole = ltConsole;
    }

    return LTool;

  })();

  module.exports.get_tex_root = function(editor) {
    var directives, root;
    if (typeof editor === 'string') {
      root = editor;
    } else {
      root = editor.getPath();
    }
    directives = parse_tex_directives(editor);
    if (directives.root != null) {
      root = path.resolve(path.dirname(root), directives.root);
    }
    return root;
  };

  module.exports.is_file = function(fname) {
    var e, s;
    try {
      s = fs.statSync(fname);
    } catch (_error) {
      e = _error;
      return false;
    }
    return s.isFile();
  };

  module.exports.find_in_files = function(rootdir, src, rx) {
    var e, ext, file_path, include_rx, new_results, next_file_match, not_found, r, results, src_content, tex_exts, tex_src, _i, _len, _ref;
    include_rx = /\\(?:input|include)\{([^\{\}]+)\}/g;
    tex_exts = atom.config.get('latextools.texFileExtensions');
    if (_ref = path.extname(src), __indexOf.call(tex_exts, _ref) >= 0) {
      tex_src = src;
    } else {
      console.log("Need to find extension for " + src);
      not_found = true;
      for (_i = 0, _len = tex_exts.length; _i < _len; _i++) {
        ext = tex_exts[_i];
        tex_src = src + ext;
        if (module.exports.is_file(path.join(rootdir, tex_src))) {
          not_found = false;
          break;
        }
      }
      if (not_found) {
        alert("Could not find " + src);
        return null;
      }
    }
    file_path = path.join(rootdir, tex_src);
    console.log("find_in_files: searching " + file_path);
    try {
      src_content = fs.readFileSync(file_path, 'utf-8');
    } catch (_error) {
      e = _error;
      alert("Could not read " + file_path + "; encoding issues?");
      return null;
    }
    src_content = src_content.replace(/%.*/g, "");
    results = [];
    while ((r = rx.exec(src_content)) !== null) {
      console.log("found " + r[1] + " in " + file_path);
      results.push(r[1]);
    }
    while ((next_file_match = include_rx.exec(src_content)) !== null) {
      new_results = module.exports.find_in_files(rootdir, next_file_match[1], rx);
      results = results.concat(new_results);
    }
    return results;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2x0dXRpbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSxnQ0FBUixDQUR2QixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWYsR0FFTTtBQUNKLG9CQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBRWEsSUFBQSxlQUFFLFNBQUYsR0FBQTtBQUFjLE1BQWIsSUFBQyxDQUFBLFlBQUEsU0FBWSxDQUFkO0lBQUEsQ0FGYjs7aUJBQUE7O01BYkYsQ0FBQTs7QUFBQSxFQXlCQSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQWYsR0FBOEIsU0FBQyxNQUFELEdBQUE7QUFDNUIsUUFBQSxnQkFBQTtBQUFBLElBQUEsSUFBRyxNQUFBLENBQUEsTUFBQSxLQUFrQixRQUFyQjtBQUNFLE1BQUEsSUFBQSxHQUFPLE1BQVAsQ0FERjtLQUFBLE1BQUE7QUFHRSxNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FIRjtLQUFBO0FBQUEsSUFLQSxVQUFBLEdBQWEsb0JBQUEsQ0FBcUIsTUFBckIsQ0FMYixDQUFBO0FBTUEsSUFBQSxJQUFHLHVCQUFIO0FBQ0UsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIs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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/ltutils.coffee
