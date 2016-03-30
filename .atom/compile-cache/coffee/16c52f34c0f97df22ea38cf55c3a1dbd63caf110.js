(function() {
  var GoBackView, SymbolsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SymbolsView = require('./symbols-view');

  module.exports = GoBackView = (function(_super) {
    __extends(GoBackView, _super);

    function GoBackView() {
      return GoBackView.__super__.constructor.apply(this, arguments);
    }

    GoBackView.prototype.toggle = function() {
      var previousTag;
      previousTag = this.stack.pop();
      if (previousTag == null) {
        return;
      }
      return atom.workspace.open(previousTag.file).then((function(_this) {
        return function() {
          if (previousTag.position) {
            return _this.moveToPosition(previousTag.position, false);
          }
        };
      })(this));
    };

    return GoBackView;

  })(SymbolsView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2F0b20tY3RhZ3MvbGliL2dvLWJhY2stdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FBZCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxXQUFBO0FBQUEsTUFBQSxXQUFBLEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQUEsQ0FBZCxDQUFBO0FBQ0EsTUFBQSxJQUFjLG1CQUFkO0FBQUEsY0FBQSxDQUFBO09BREE7YUFHQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsV0FBVyxDQUFDLElBQWhDLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN6QyxVQUFBLElBQWdELFdBQVcsQ0FBQyxRQUE1RDttQkFBQSxLQUFDLENBQUEsY0FBRCxDQUFnQixXQUFXLENBQUMsUUFBNUIsRUFBc0MsS0FBdEMsRUFBQTtXQUR5QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLEVBSk07SUFBQSxDQUFSLENBQUE7O3NCQUFBOztLQUR1QixZQUh6QixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/atom-ctags/lib/go-back-view.coffee
