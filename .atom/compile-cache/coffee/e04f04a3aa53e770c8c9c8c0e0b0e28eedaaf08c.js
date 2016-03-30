(function() {
  var $$, Point, SelectListView, SymbolsView, fs, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  Point = require('atom').Point;

  fs = null;

  module.exports = SymbolsView = (function(_super) {
    __extends(SymbolsView, _super);

    function SymbolsView() {
      return SymbolsView.__super__.constructor.apply(this, arguments);
    }

    SymbolsView.activate = function() {
      return new SymbolsView;
    };

    SymbolsView.prototype.initialize = function(stack) {
      this.stack = stack;
      SymbolsView.__super__.initialize.apply(this, arguments);
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: false
      });
      return this.addClass('atom-ctags');
    };

    SymbolsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    SymbolsView.prototype.getFilterKey = function() {
      return 'name';
    };

    SymbolsView.prototype.viewForItem = function(_arg) {
      var directory, file, lineNumber, name;
      lineNumber = _arg.lineNumber, name = _arg.name, file = _arg.file, directory = _arg.directory;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + name + ":" + lineNumber, {
              "class": 'primary-line'
            });
            return _this.div(file, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    SymbolsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No symbols found';
      } else {
        return SymbolsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    SymbolsView.prototype.cancelled = function() {
      return this.panel.hide();
    };

    SymbolsView.prototype.confirmed = function(tag) {
      this.cancelPosition = null;
      this.cancel();
      return this.openTag(tag);
    };

    SymbolsView.prototype.getTagPosition = function(tag) {
      if (!tag.position && tag.lineNumber && tag.pattern) {
        tag.position = new Point(tag.lineNumber - 1, tag.pattern.indexOf(tag.name) - 2);
      }
      if (!tag.position) {
        console.error("Atom Ctags: please create a new issue: " + JSON.stringify(tag));
      }
      return tag.position;
    };

    SymbolsView.prototype.openTag = function(tag) {
      var editor, previous;
      if (editor = atom.workspace.getActiveTextEditor()) {
        previous = {
          position: editor.getCursorBufferPosition(),
          file: editor.getURI()
        };
      }
      if (tag.file) {
        atom.workspace.open(tag.file).then((function(_this) {
          return function() {
            if (_this.getTagPosition(tag)) {
              return _this.moveToPosition(tag.position);
            }
          };
        })(this));
      }
      return this.stack.push(previous);
    };

    SymbolsView.prototype.moveToPosition = function(position) {
      var editor;
      if (editor = atom.workspace.getActiveTextEditor()) {
        editor.scrollToBufferPosition(position, {
          center: true
        });
        return editor.setCursorBufferPosition(position);
      }
    };

    SymbolsView.prototype.attach = function() {
      this.storeFocusedElement();
      this.panel.show();
      return this.focusFilterEditor();
    };

    return SymbolsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL3N5bWJvbHMtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBQUwsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssSUFGTCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFdBQUMsQ0FBQSxRQUFELEdBQVcsU0FBQSxHQUFBO2FBQ1QsR0FBQSxDQUFBLFlBRFM7SUFBQSxDQUFYLENBQUE7O0FBQUEsMEJBR0EsVUFBQSxHQUFZLFNBQUUsS0FBRixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsUUFBQSxLQUNaLENBQUE7QUFBQSxNQUFBLDZDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxRQUFZLE9BQUEsRUFBUyxLQUFyQjtPQUE3QixDQURULENBQUE7YUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLFlBQVYsRUFIVTtJQUFBLENBSFosQ0FBQTs7QUFBQSwwQkFRQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBRk87SUFBQSxDQVJULENBQUE7O0FBQUEsMEJBWUEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLE9BQUg7SUFBQSxDQVpkLENBQUE7O0FBQUEsMEJBY0EsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1gsVUFBQSxpQ0FBQTtBQUFBLE1BRGEsa0JBQUEsWUFBWSxZQUFBLE1BQU0sWUFBQSxNQUFNLGlCQUFBLFNBQ3JDLENBQUE7YUFBQSxFQUFBLENBQUcsU0FBQSxHQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFVBQUEsT0FBQSxFQUFPLFdBQVA7U0FBSixFQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTtBQUN0QixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUssRUFBQSxHQUFHLElBQUgsR0FBUSxHQUFSLEdBQVcsVUFBaEIsRUFBOEI7QUFBQSxjQUFBLE9BQUEsRUFBTyxjQUFQO2FBQTlCLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVztBQUFBLGNBQUEsT0FBQSxFQUFPLGdCQUFQO2FBQVgsRUFGc0I7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixFQURDO01BQUEsQ0FBSCxFQURXO0lBQUEsQ0FkYixDQUFBOztBQUFBLDBCQW9CQSxlQUFBLEdBQWlCLFNBQUMsU0FBRCxHQUFBO0FBQ2YsTUFBQSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtlQUNFLG1CQURGO09BQUEsTUFBQTtlQUdFLGtEQUFBLFNBQUEsRUFIRjtPQURlO0lBQUEsQ0FwQmpCLENBQUE7O0FBQUEsMEJBMEJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7YUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxFQURTO0lBQUEsQ0ExQlgsQ0FBQTs7QUFBQSwwQkE2QkEsU0FBQSxHQUFZLFNBQUMsR0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFsQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsR0FBVCxFQUhVO0lBQUEsQ0E3QlosQ0FBQTs7QUFBQSwwQkFrQ0EsY0FBQSxHQUFnQixTQUFDLEdBQUQsR0FBQTtBQUNkLE1BQUEsSUFBRyxDQUFBLEdBQU8sQ0FBQyxRQUFSLElBQXFCLEdBQUcsQ0FBQyxVQUF6QixJQUF3QyxHQUFHLENBQUMsT0FBL0M7QUFDRSxRQUFBLEdBQUcsQ0FBQyxRQUFKLEdBQW1CLElBQUEsS0FBQSxDQUFNLEdBQUcsQ0FBQyxVQUFKLEdBQWUsQ0FBckIsRUFBd0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFaLENBQW9CLEdBQUcsQ0FBQyxJQUF4QixDQUFBLEdBQThCLENBQXRELENBQW5CLENBREY7T0FBQTtBQUVBLE1BQUEsSUFBRyxDQUFBLEdBQU8sQ0FBQyxRQUFYO0FBQ0UsUUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLHlDQUFBLEdBQTRDLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixDQUExRCxDQUFBLENBREY7T0FGQTtBQUlBLGFBQU8sR0FBRyxDQUFDLFFBQVgsQ0FMYztJQUFBLENBbENoQixDQUFBOztBQUFBLDBCQXlDQSxPQUFBLEdBQVMsU0FBQyxHQUFELEdBQUE7QUFDUCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxJQUFHLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBWjtBQUNFLFFBQUEsUUFBQSxHQUNFO0FBQUEsVUFBQSxRQUFBLEVBQVUsTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBVjtBQUFBLFVBQ0EsSUFBQSxFQUFNLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FETjtTQURGLENBREY7T0FBQTtBQUtBLE1BQUEsSUFBRyxHQUFHLENBQUMsSUFBUDtBQUNFLFFBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEdBQUcsQ0FBQyxJQUF4QixDQUE2QixDQUFDLElBQTlCLENBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQSxHQUFBO0FBQ2pDLFlBQUEsSUFBaUMsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsR0FBaEIsQ0FBakM7cUJBQUEsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsR0FBRyxDQUFDLFFBQXBCLEVBQUE7YUFEaUM7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQyxDQUFBLENBREY7T0FMQTthQVNBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLFFBQVosRUFWTztJQUFBLENBekNULENBQUE7O0FBQUEsMEJBcURBLGNBQUEsR0FBZ0IsU0FBQyxRQUFELEdBQUE7QUFDZCxVQUFBLE1BQUE7QUFBQSxNQUFBLElBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFaO0FBQ0UsUUFBQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsUUFBOUIsRUFBd0M7QUFBQSxVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQXhDLENBQUEsQ0FBQTtlQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixRQUEvQixFQUZGO09BRGM7SUFBQSxDQXJEaEIsQ0FBQTs7QUFBQSwwQkEwREEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUhNO0lBQUEsQ0ExRFIsQ0FBQTs7dUJBQUE7O0tBRHdCLGVBTDFCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/lib/symbols-view.coffee
