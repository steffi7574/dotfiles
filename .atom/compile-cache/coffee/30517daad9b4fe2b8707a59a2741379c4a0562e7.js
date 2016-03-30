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

    CompletionManager.prototype.refCiteComplete = function(te, keybinding) {
      var cite_rx_rev, current_point, initial_point, line, m, max_length, range, ref_rx_rev;
      if (keybinding == null) {
        keybinding = false;
      }
      max_length = 100;
      ref_rx_rev = /^\{fer(?:qe|egap|v|V|otua|eman|c|C|egapc)?/;
      cite_rx_rev = /^([^{},]*)(?:,[^{},]*)*\{(?:\].*?\[){0,2}([a-zX*]*?)etic\\/;
      current_point = te.getCursorBufferPosition();
      initial_point = [current_point.row, Math.max(0, current_point.column - max_length)];
      range = [initial_point, current_point];
      line = te.getTextInBufferRange(range);
      line = line.split("").reverse().join("");
      if ((keybinding || atom.config.get("latextools.refAutoTrigger")) && (m = ref_rx_rev.exec(line))) {
        console.log("found match");
        return this.refComplete(te);
      } else if ((keybinding || atom.config.get("latextools.citeAutoTrigger")) && (m = cite_rx_rev.exec(line))) {
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
      bibs = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = bibs.length; _j < _len1; _j++) {
          b = bibs[_j];
          _results.push(path.extname(b) !== '.bib' ? path.join(filedir, b.trim()) + '.bib' : path.join(filedir, b.trim()));
        }
        return _results;
      })();
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
      if (bibs.length === 0) {
        alert("Could not find bib files. Please check your \\bibliography statements");
        return;
      }
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
          primary = item_fmt[0].replace("{keyword}", keywords[i]).replace("{title}", titles[i]).replace("{author}", authors[i]).replace("{year}", years[i]).replace("{author_short}", authors_short[i]).replace("{title_short}", titles_short[i]).replace("{journal}", journals[i]);
          secondary = item_fmt[1].replace("{keyword}", keywords[i]).replace("{title}", titles[i]).replace("{author}", authors[i]).replace("{year}", years[i]).replace("{author_short}", authors_short[i]).replace("{title_short}", titles_short[i]).replace("{journal}", journals[i]);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2NvbXBsZXRpb24tbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0lBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQTZDLE9BQUEsQ0FBUSxXQUFSLENBQTdDLEVBQUMsYUFBQSxLQUFELEVBQU8sb0JBQUEsWUFBUCxFQUFvQixxQkFBQSxhQUFwQixFQUFrQyxlQUFBLE9BQWxDLENBQUE7O0FBQUEsRUFDQSxnQkFBQSxHQUFtQixPQUFBLENBQVEscUJBQVIsQ0FEbkIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSxzQkFBUixDQUZwQixDQUFBOztBQUFBLEVBSUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLCtCQUFSLENBSnRCLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBTUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBTkwsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBRU07QUFDSix3Q0FBQSxDQUFBOztBQUFBLGdDQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBQUEsZ0NBQ0EsU0FBQSxHQUFXLElBRFgsQ0FBQTs7QUFBQSxnQ0FFQSxTQUFBLEdBQVcsSUFGWCxDQUFBOztBQUlhLElBQUEsMkJBQUUsU0FBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsWUFBQSxTQUNiLENBQUE7QUFBQSxNQUFBLG9EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEdBQUEsQ0FBQSxnQkFEWixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBQUEsQ0FBQSxpQkFGYixDQURXO0lBQUEsQ0FKYjs7QUFBQSxnQ0FVQSxlQUFBLEdBQWlCLFNBQUMsRUFBRCxFQUFLLFVBQUwsR0FBQTtBQUNmLFVBQUEsaUZBQUE7O1FBRG9CLGFBQWE7T0FDakM7QUFBQSxNQUFBLFVBQUEsR0FBYSxHQUFiLENBQUE7QUFBQSxNQUVBLFVBQUEsR0FBYSw0Q0FGYixDQUFBO0FBQUEsTUFJQSxXQUFBLEdBQWMsNERBSmQsQ0FBQTtBQUFBLE1BTUEsYUFBQSxHQUFnQixFQUFFLENBQUMsdUJBQUgsQ0FBQSxDQU5oQixDQUFBO0FBQUEsTUFPQSxhQUFBLEdBQWdCLENBQUMsYUFBYSxDQUFDLEdBQWYsRUFBb0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVcsYUFBYSxDQUFDLE1BQWQsR0FBdUIsVUFBbEMsQ0FBcEIsQ0FQaEIsQ0FBQTtBQUFBLE1BUUEsS0FBQSxHQUFRLENBQUMsYUFBRCxFQUFnQixhQUFoQixDQVJSLENBQUE7QUFBQSxNQVNBLElBQUEsR0FBTyxFQUFFLENBQUMsb0JBQUgsQ0FBd0IsS0FBeEIsQ0FUUCxDQUFBO0FBQUEsTUFjQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFYLENBQWMsQ0FBQyxPQUFmLENBQUEsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixFQUE5QixDQWRQLENBQUE7QUFrQkEsTUFBQSxJQUFHLENBQUMsVUFBQSxJQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQkFBaEIsQ0FBZixDQUFBLElBQ0gsQ0FBQSxDQUFBLEdBQUksVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBSixDQURBO0FBRUUsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGFBQVosQ0FBQSxDQUFBO2VBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxFQUFiLEVBSEY7T0FBQSxNQUlLLElBQUcsQ0FBQyxVQUFBLElBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFmLENBQUEsSUFDUixDQUFBLENBQUEsR0FBSSxXQUFXLENBQUMsSUFBWixDQUFpQixJQUFqQixDQUFKLENBREs7QUFFSCxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBWixDQUFBLENBQUE7QUFBQSxRQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWixDQURBLENBQUE7ZUFFQSxJQUFDLENBQUEsWUFBRCxDQUFjLEVBQWQsRUFKRztPQXZCVTtJQUFBLENBVmpCLENBQUE7O0FBQUEsZ0NBNERBLFdBQUEsR0FBYSxTQUFDLEVBQUQsR0FBQTtBQUVYLFVBQUEsOENBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxZQUFBLENBQWEsRUFBYixDQUFSLENBQUE7QUFBQSxNQUVBLFlBQUEsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQVgsQ0FGZixDQUFBO0FBQUEsTUFJQSxPQUFBLEdBQVUsWUFBWSxDQUFDLEdBSnZCLENBQUE7QUFBQSxNQUtBLFFBQUEsR0FBVyxZQUFZLENBQUMsSUFMeEIsQ0FBQTtBQUFBLE1BT0EsTUFBQSxHQUFTLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCLEVBQWlDLHNCQUFqQyxDQVBULENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixNQUFuQixDQVZBLENBQUE7YUFXQSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ2QsY0FBQSxPQUFBO0FBQUEsVUFBQSxFQUFFLENBQUMsVUFBSCxDQUFjLElBQWQsQ0FBQSxDQUFBO0FBQUEsVUFFQSxFQUFBLEdBQUssRUFBRSxDQUFDLHVCQUFILENBQUEsQ0FGTCxDQUFBO0FBQUEsVUFHQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFKLEVBQVMsRUFBRSxDQUFDLE1BQVosQ0FBRCxFQUFzQixDQUFDLEVBQUUsQ0FBQyxHQUFKLEVBQVMsRUFBRSxDQUFDLE1BQUgsR0FBVSxDQUFuQixDQUF0QixDQUhOLENBQUE7QUFJQSxVQUFBLElBQUcsRUFBRSxDQUFDLG9CQUFILENBQXdCLEdBQXhCLENBQUEsS0FBZ0MsR0FBbkM7bUJBQ0UsRUFBRSxDQUFDLFNBQUgsQ0FBQSxFQURGO1dBTGM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixFQWJXO0lBQUEsQ0E1RGIsQ0FBQTs7QUFBQSxnQ0FvRkEsWUFBQSxHQUFjLFNBQUMsRUFBRCxHQUFBO0FBRVosVUFBQSw4TkFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFlBQUEsQ0FBYSxFQUFiLENBQVIsQ0FBQTtBQUFBLE1BRUEsWUFBQSxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWCxDQUZmLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxZQUFZLENBQUMsR0FKdkIsQ0FBQTtBQUFBLE1BS0EsUUFBQSxHQUFXLFlBQVksQ0FBQyxJQUx4QixDQUFBO0FBQUEsTUFPQSxNQUFBLEdBQVMsK0RBUFQsQ0FBQTtBQUFBLE1BUUEsUUFBQSxHQUFXLGFBQUEsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCLEVBQWlDLE1BQWpDLENBUlgsQ0FBQTtBQUFBLE1BV0EsSUFBQSxHQUFPLEVBWFAsQ0FBQTtBQVlBLFdBQUEsK0NBQUE7eUJBQUE7QUFDRSxRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUMsQ0FBQyxLQUFGLENBQVEsR0FBUixDQUFaLENBQVAsQ0FERjtBQUFBLE9BWkE7QUFBQSxNQWdCQSxJQUFBOztBQUFRO2FBQUEsNkNBQUE7dUJBQUE7QUFBQSx3QkFBSSxJQUFJLENBQUMsT0FBTCxDQUFhLENBQWIsQ0FBQSxLQUFxQixNQUF4QixHQUFvQyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsQ0FBQyxDQUFDLElBQUYsQ0FBQSxDQUFuQixDQUFBLEdBQStCLE1BQW5FLEdBQStFLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixDQUFDLENBQUMsSUFBRixDQUFBLENBQW5CLEVBQWhGLENBQUE7QUFBQTs7VUFoQlIsQ0FBQTtBQUFBLE1BbUJBLElBQUE7O0FBQVM7YUFBQSw2Q0FBQTt1QkFBQTtjQUFxQixPQUFBLENBQVEsQ0FBUjtBQUFyQiwwQkFBQSxFQUFBO1dBQUE7QUFBQTs7VUFuQlQsQ0FBQTtBQXFCQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxDQUFsQjtBQUNFLFFBQUEsS0FBQSxDQUFNLHVFQUFOLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FGRjtPQXJCQTtBQTBCQSxNQUFBLElBQUcsTUFBQSxDQUFBLElBQUEsS0FBZSxRQUFsQjtBQUNFLFFBQUEsSUFBQSxHQUFPLENBQUMsSUFBRCxDQUFQLENBREY7T0ExQkE7QUFBQSxNQTZCQSxVQUFBLEdBQWEsRUE3QmIsQ0FBQTtBQThCQSxXQUFBLDZDQUFBO3FCQUFBO0FBQ0UsUUFBQSxRQUE0RSxtQkFBQSxDQUFvQixDQUFwQixDQUE1RSxFQUFDLG1CQUFELEVBQVcsaUJBQVgsRUFBbUIsa0JBQW5CLEVBQTRCLGdCQUE1QixFQUFtQyx3QkFBbkMsRUFBa0QsdUJBQWxELEVBQWdFLG1CQUFoRSxDQUFBO0FBQUEsUUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUZYLENBQUE7QUFJQSxRQUFBLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7QUFDRSxVQUFBLEtBQUEsQ0FBTSxrRUFBTixDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUZGO1NBSkE7QUFTQSxhQUFTLHVHQUFULEdBQUE7QUFDRSxVQUFBLE9BQUEsR0FBVSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBWixDQUFvQixXQUFwQixFQUFpQyxRQUFTLENBQUEsQ0FBQSxDQUExQyxDQUNSLENBQUMsT0FETyxDQUNDLFNBREQsRUFDWSxNQUFPLENBQUEsQ0FBQSxDQURuQixDQUVSLENBQUMsT0FGTyxDQUVDLFVBRkQsRUFFYSxPQUFRLENBQUEsQ0FBQSxDQUZyQixDQUdSLENBQUMsT0FITyxDQUdDLFFBSEQsRUFHVyxLQUFNLENBQUEsQ0FBQSxDQUhqQixDQUlSLENBQUMsT0FKTyxDQUlDLGdCQUpELEVBSW1CLGFBQWMsQ0FBQSxDQUFBLENBSmpDLENBS1IsQ0FBQyxPQUxPLENBS0MsZUFMRCxFQUtrQixZQUFhLENBQUEsQ0FBQSxDQUwvQixDQU1SLENBQUMsT0FOTyxDQU1DLFdBTkQsRUFNYyxRQUFTLENBQUEsQ0FBQSxDQU52QixDQUFWLENBQUE7QUFBQSxVQU9BLFNBQUEsR0FBWSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBWixDQUFvQixXQUFwQixFQUFpQyxRQUFTLENBQUEsQ0FBQSxDQUExQyxDQUNWLENBQUMsT0FEUyxDQUNELFNBREMsRUFDVSxNQUFPLENBQUEsQ0FBQSxDQURqQixDQUVWLENBQUMsT0FGUyxDQUVELFVBRkMsRUFFVyxPQUFRLENBQUEsQ0FBQSxDQUZuQixDQUdWLENBQUMsT0FIUyxDQUdELFFBSEMsRUFHUyxLQUFNLENBQUEsQ0FBQSxDQUhmLENBSVYsQ0FBQyxPQUpTLENBSUQsZ0JBSkMsRUFJaUIsYUFBYyxDQUFBLENBQUEsQ0FKL0IsQ0FLVixDQUFDLE9BTFMsQ0FLRCxlQUxDLEVBS2dCLFlBQWEsQ0FBQSxDQUFBLENBTDdCLENBTVYsQ0FBQyxPQU5TLENBTUQsV0FOQyxFQU1ZLFFBQVMsQ0FBQSxDQUFBLENBTnJCLENBUFosQ0FBQTtBQUFBLFVBY0EsVUFBVSxDQUFDLElBQVgsQ0FBaUI7QUFBQSxZQUFDLFNBQUEsRUFBVyxPQUFaO0FBQUEsWUFBcUIsV0FBQSxFQUFhLFNBQWxDO0FBQUEsWUFBNkMsSUFBQSxFQUFNLFFBQVMsQ0FBQSxDQUFBLENBQTVEO1dBQWpCLENBZEEsQ0FERjtBQUFBLFNBVkY7QUFBQSxPQTlCQTtBQUFBLE1BeURBLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBWCxDQUFvQixVQUFwQixDQXpEQSxDQUFBO2FBMERBLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7QUFDZixjQUFBLE9BQUE7QUFBQSxVQUFBLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBSSxDQUFDLEVBQW5CLENBQUEsQ0FBQTtBQUFBLFVBRUEsRUFBQSxHQUFLLEVBQUUsQ0FBQyx1QkFBSCxDQUFBLENBRkwsQ0FBQTtBQUFBLFVBR0EsR0FBQSxHQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBSixFQUFTLEVBQUUsQ0FBQyxNQUFaLENBQUQsRUFBc0IsQ0FBQyxFQUFFLENBQUMsR0FBSixFQUFTLEVBQUUsQ0FBQyxNQUFILEdBQVUsQ0FBbkIsQ0FBdEIsQ0FITixDQUFBO0FBSUEsVUFBQSxJQUFHLEVBQUUsQ0FBQyxvQkFBSCxDQUF3QixHQUF4QixDQUFBLEtBQWdDLEdBQW5DO21CQUNFLEVBQUUsQ0FBQyxTQUFILENBQUEsRUFERjtXQUxlO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsRUE1RFk7SUFBQSxDQXBGZCxDQUFBOztBQUFBLGdDQXlKQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQSxFQUZPO0lBQUEsQ0F6SlQsQ0FBQTs7NkJBQUE7O0tBRDhCLE1BVmhDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/completion-manager.coffee
