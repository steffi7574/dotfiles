(function() {
  var CompletionManager, LTSelectList2View, LTSelectListView, LTool, find_in_files, fs, get_bib_completions, get_tex_root, is_file, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('./ltutils'), LTool = _ref.LTool, get_tex_root = _ref.get_tex_root, find_in_files = _ref.find_in_files, is_file = _ref.is_file;

  LTSelectListView = require('./ltselectlist-view');

  LTSelectList2View = require('./ltselectlist2-view');

  get_bib_completions = require('./parsers/get-bib-completions');

  path = require('path');

  fs = require('fs');

  module.exports = CompletionManager = (function(_super) {
    __extends(CompletionManager, _super);

    CompletionManager.prototype.sel_view = null;

    CompletionManager.prototype.sel2_view = null;

    CompletionManager.prototype.sel_panel = null;

    function CompletionManager(ltconsole) {
      this.ltconsole = ltconsole;
      CompletionManager.__super__.constructor.apply(this, arguments);
      this.sel_view = new LTSelectListView;
      this.sel2_view = new LTSelectList2View;
    }

    CompletionManager.prototype.refCiteComplete = function() {
      var cite_rx_rev, current_point, initial_point, line, m, max_length, range, ref_rx_rev, te;
      te = atom.workspace.getActiveTextEditor();
      max_length = 100;
      ref_rx_rev = /^\{fer(?:qe|egap|v|V|otua|eman|c|C|egapc)?/;
      cite_rx_rev = /^([^{},]*)(?:,[^{},]*)*\{(?:\].*?\[){0,2}([a-zX*]*?)etic\\/;
      current_point = te.getCursorBufferPosition();
      initial_point = [current_point.row, Math.max(0, current_point.column - max_length)];
      range = [initial_point, current_point];
      line = te.getTextInBufferRange(range);
      line = line.split("").reverse().join("");
      if (m = ref_rx_rev.exec(line)) {
        console.log("found match");
        return this.refComplete(te);
      } else if (m = cite_rx_rev.exec(line)) {
        console.log("found match");
        console.log(m);
        return this.citeComplete(te);
      }
    };

    CompletionManager.prototype.refComplete = function(te) {
      var filebase, filedir, fname, labels, parsed_fname;
      fname = get_tex_root(te);
      parsed_fname = path.parse(fname);
      filedir = parsed_fname.dir;
      filebase = parsed_fname.base;
      labels = find_in_files(filedir, filebase, /\\label\{([^\}]+)\}/g);
      this.sel_view.setItems(labels);
      return this.sel_view.start((function(_this) {
        return function(item) {
          var pt, ran;
          te.insertText(item);
          pt = te.getCursorBufferPosition();
          ran = [[pt.row, pt.column], [pt.row, pt.column + 1]];
          if (te.getTextInBufferRange(ran) === '}') {
            return te.moveRight();
          }
        };
      })(this));
    };

    CompletionManager.prototype.citeComplete = function(te) {
      var authors, authors_short, b, bib_rx, bibentries, bibs, filebase, filedir, fname, i, item_fmt, journals, keywords, parsed_fname, primary, raw_bibs, secondary, titles, titles_short, years, _i, _j, _k, _len, _len1, _ref1, _ref2;
      fname = get_tex_root(te);
      parsed_fname = path.parse(fname);
      filedir = parsed_fname.dir;
      filebase = parsed_fname.base;
      bib_rx = /\\(?:bibliography|nobibliography|addbibresource)\{([^\}]+)\}/g;
      raw_bibs = find_in_files(filedir, filebase, bib_rx);
      bibs = [];
      for (_i = 0, _len = raw_bibs.length; _i < _len; _i++) {
        b = raw_bibs[_i];
        bibs = bibs.concat(b.split(','));
      }
      bibs = ((function() {
        var _j, _len1, _results;
        if (path.extname(b) === '.bib') {
          return path.join(filedir, b.trim());
        } else {
          _results = [];
          for (_j = 0, _len1 = bibs.length; _j < _len1; _j++) {
            b = bibs[_j];
            _results.push(path.join(filedir, b.trim() + '.bib'));
          }
          return _results;
        }
      })());
      bibs = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = bibs.length; _j < _len1; _j++) {
          b = bibs[_j];
          if (is_file(b)) {
            _results.push(b);
          }
        }
        return _results;
      })();
      if (typeof bibs === 'string') {
        bibs = [bibs];
      }
      bibentries = [];
      for (_j = 0, _len1 = bibs.length; _j < _len1; _j++) {
        b = bibs[_j];
        _ref1 = get_bib_completions(b), keywords = _ref1[0], titles = _ref1[1], authors = _ref1[2], years = _ref1[3], authors_short = _ref1[4], titles_short = _ref1[5], journals = _ref1[6];
        item_fmt = atom.config.get("latextools.citePanelFormat");
        if (item_fmt.length !== 2) {
          alert("Incorrect citePanelFormat specification. Check your preferences!");
          return;
        }
        for (i = _k = 0, _ref2 = keywords.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          primary = item_fmt[0].replace("{keyword}", keywords[i]);
          primary = primary.replace("{title}", titles[i]);
          primary = primary.replace("{author}", authors[i]);
          primary = primary.replace("{year}", years[i]);
          primary = primary.replace("{author_short}", authors_short[i]);
          primary = primary.replace("{title_short}", titles_short[i]);
          primary = primary.replace("{journal}", journals[i]);
          secondary = item_fmt[1].replace("{keyword}", keywords[i]);
          secondary = secondary.replace("{title}", titles[i]);
          secondary = secondary.replace("{author}", authors[i]);
          secondary = secondary.replace("{year}", years[i]);
          secondary = secondary.replace("{author_short}", authors_short[i]);
          secondary = secondary.replace("{title_short}", titles_short[i]);
          secondary = secondary.replace("{journal}", journals[i]);
          bibentries.push({
            "primary": primary,
            "secondary": secondary,
            "id": keywords[i]
          });
        }
      }
      this.sel2_view.setItems(bibentries);
      return this.sel2_view.start((function(_this) {
        return function(item) {
          var pt, ran;
          te.insertText(item.id);
          pt = te.getCursorBufferPosition();
          ran = [[pt.row, pt.column], [pt.row, pt.column + 1]];
          if (te.getTextInBufferRange(ran) === '}') {
            return te.moveRight();
          }
        };
      })(this));
    };

    CompletionManager.prototype.destroy = function() {
      this.sel2_view.destroy();
      return this.sel_view.destroy();
    };

    return CompletionManager;

  })(LTool);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2NvbXBsZXRpb24tbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0lBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQTZDLE9BQUEsQ0FBUSxXQUFSLENBQTdDLEVBQUMsYUFBQSxLQUFELEVBQU8sb0JBQUEsWUFBUCxFQUFvQixxQkFBQSxhQUFwQixFQUFrQyxlQUFBLE9BQWxDLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUixDQUZwQixDQUFBOztBQUFBLEVBSUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLCtCQUFSLENBSnRCLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBTkwsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFDSix3Q0FBQSxDQUFBOztBQUFBLGdDQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBQUEsZ0NBQ0EsU0FBQSxHQUFXLElBRFgsQ0FBQTs7QUFBQSxnQ0FFQSxTQUFBLEdBQVcsSUFGWCxDQUFBOztBQUlhLElBQUEsMkJBQUUsU0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsWUFBQSxTQUNiLENBQUE7QUFBQSxNQUFBLG9EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsQ0FBQSxnQkFEWixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBQUEsQ0FBQSxpQkFGYixDQURX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

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/completion-manager.coffee
