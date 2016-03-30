(function() {
  var $$, FileView, SymbolsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $$ = require('atom-space-pen-views').$$;

  SymbolsView = require('./symbols-view');

  module.exports = FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.initialize = function() {
      FileView.__super__.initialize.apply(this, arguments);
      return this.editorsSubscription = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var disposable;
          disposable = editor.onDidSave(function() {
            var f;
            f = editor.getPath();
            if (!atom.project.contains(f)) {
              return;
            }
            return _this.ctagsCache.generateTags(f, true);
          });
          return editor.onDidDestroy(function() {
            return disposable.dispose();
          });
        };
      })(this));
    };

    FileView.prototype.destroy = function() {
      this.editorsSubscription.dispose();
      return FileView.__super__.destroy.apply(this, arguments);
    };

    FileView.prototype.viewForItem = function(_arg) {
      var file, lineNumber, name, pattern;
      lineNumber = _arg.lineNumber, name = _arg.name, file = _arg.file, pattern = _arg.pattern;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": 'primary-line'
            }, function() {
              _this.span(name, {
                "class": 'pull-left'
              });
              return _this.span(pattern.substring(2, pattern.length - 2), {
                "class": 'pull-right'
              });
            });
            return _this.div({
              "class": 'secondary-line'
            }, function() {
              _this.span("Line: " + lineNumber, {
                "class": 'pull-left'
              });
              return _this.span(file, {
                "class": 'pull-right'
              });
            });
          };
        })(this));
      });
    };

    FileView.prototype.toggle = function() {
      var editor, filePath;
      if (this.panel.isVisible()) {
        return this.cancel();
      } else {
        editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
          return;
        }
        filePath = editor.getPath();
        if (!filePath) {
          return;
        }
        this.cancelPosition = editor.getCursorBufferPosition();
        this.populate(filePath);
        return this.attach();
      }
    };

    FileView.prototype.cancel = function() {
      FileView.__super__.cancel.apply(this, arguments);
      if (this.cancelPosition) {
        this.scrollToPosition(this.cancelPosition, false);
      }
      return this.cancelPosition = null;
    };

    FileView.prototype.toggleAll = function() {
      var key, tag, tags, val, _i, _len, _ref;
      if (this.panel.isVisible()) {
        return this.cancel();
      } else {
        this.list.empty();
        this.maxItems = 10;
        tags = [];
        _ref = this.ctagsCache.cachedTags;
        for (key in _ref) {
          val = _ref[key];
          for (_i = 0, _len = val.length; _i < _len; _i++) {
            tag = val[_i];
            tags.push(tag);
          }
        }
        this.setItems(tags);
        return this.attach();
      }
    };

    FileView.prototype.getCurSymbol = function() {
      var cursor, editor, range;
      editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        console.error("[atom-ctags:getCurSymbol] failed getActiveTextEditor ");
        return;
      }
      cursor = editor.getLastCursor();
      if (cursor.getScopeDescriptor().getScopesArray().indexOf('source.ruby') !== -1) {
        range = cursor.getCurrentWordBufferRange({
          wordRegex: /[\w!?]*/g
        });
      } else {
        range = cursor.getCurrentWordBufferRange();
      }
      return editor.getTextInRange(range);
    };

    FileView.prototype.rebuild = function() {
      var projectPath, projectPaths, _i, _len, _results;
      projectPaths = atom.project.getPaths();
      if (projectPaths.length < 1) {
        console.error("[atom-ctags:rebuild] cancel rebuild, invalid projectPath: " + projectPath);
        return;
      }
      this.ctagsCache.cachedTags = {};
      _results = [];
      for (_i = 0, _len = projectPaths.length; _i < _len; _i++) {
        projectPath = projectPaths[_i];
        _results.push(this.ctagsCache.generateTags(projectPath));
      }
      return _results;
    };

    FileView.prototype.goto = function() {
      var symbol, tags;
      symbol = this.getCurSymbol();
      if (!symbol) {
        console.error("[atom-ctags:goto] failed getCurSymbol");
        return;
      }
      tags = this.ctagsCache.findTags(symbol);
      if (tags.length === 1) {
        return this.openTag(tags[0]);
      } else {
        this.setItems(tags);
        return this.attach();
      }
    };

    FileView.prototype.populate = function(filePath) {
      this.list.empty();
      this.setLoading('Generating symbols\u2026');
      return this.ctagsCache.getOrCreateTags(filePath, (function(_this) {
        return function(tags) {
          _this.maxItem = Infinity;
          return _this.setItems(tags);
        };
      })(this));
    };

    FileView.prototype.scrollToItemView = function(view) {
      var tag;
      FileView.__super__.scrollToItemView.apply(this, arguments);
      if (!this.cancelPosition) {
        return;
      }
      tag = this.getSelectedItem();
      return this.scrollToPosition(this.getTagPosition(tag));
    };

    FileView.prototype.scrollToPosition = function(position, select) {
      var editor;
      if (select == null) {
        select = true;
      }
      if (editor = atom.workspace.getActiveTextEditor()) {
        editor.scrollToBufferPosition(position, {
          center: true
        });
        editor.setCursorBufferPosition(position);
        if (select) {
          return editor.selectWordsContainingCursors();
        }
      }
    };

    return FileView;

  })(SymbolsView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2ZpbGUtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLEtBQU0sT0FBQSxDQUFRLHNCQUFSLEVBQU4sRUFBRCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQURkLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHVCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLDBDQUFBLFNBQUEsQ0FBQSxDQUFBO2FBRUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO0FBQ3ZELGNBQUEsVUFBQTtBQUFBLFVBQUEsVUFBQSxHQUFhLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQUEsR0FBQTtBQUM1QixnQkFBQSxDQUFBO0FBQUEsWUFBQSxDQUFBLEdBQUksTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFKLENBQUE7QUFDQSxZQUFBLElBQUEsQ0FBQSxJQUFrQixDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQXNCLENBQXRCLENBQWQ7QUFBQSxvQkFBQSxDQUFBO2FBREE7bUJBRUEsS0FBQyxDQUFBLFVBQVUsQ0FBQyxZQUFaLENBQXlCLENBQXpCLEVBQTRCLElBQTVCLEVBSDRCO1VBQUEsQ0FBakIsQ0FBYixDQUFBO2lCQUtBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLFNBQUEsR0FBQTttQkFBRyxVQUFVLENBQUMsT0FBWCxDQUFBLEVBQUg7VUFBQSxDQUFwQixFQU51RDtR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

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/lib/file-view.coffee
