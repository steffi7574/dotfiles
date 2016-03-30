(function() {
  var LTSelectList2View, SelectListView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  module.exports = LTSelectList2View = (function(_super) {
    __extends(LTSelectList2View, _super);

    function LTSelectList2View() {
      return LTSelectList2View.__super__.constructor.apply(this, arguments);
    }

    LTSelectList2View.prototype.callback = null;

    LTSelectList2View.prototype.initialize = function() {
      LTSelectList2View.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      this.panel = atom.workspace.addModalPanel({
        item: this
      });
      return this.panel.hide();
    };

    LTSelectList2View.prototype.viewForItem = function(item) {
      var li, pri, sec;
      li = document.createElement('li');
      li.classList.add('two_lines');
      pri = document.createElement('div');
      pri.classList.add('primary-line');
      pri.textContent = item.primary;
      li.appendChild(pri);
      sec = document.createElement('div');
      sec.classList.add('secondary-line');
      sec.textContent = item.secondary;
      li.appendChild(sec);
      return li;
    };

    LTSelectList2View.prototype.getFilterKey = function() {
      return 'primary';
    };

    LTSelectList2View.prototype.confirmed = function(item) {
      this.selected_item = item;
      this.restoreFocus();
      this.panel.hide();
      return this.callback(item);
    };

    LTSelectList2View.prototype.cancel = function() {
      LTSelectList2View.__super__.cancel.apply(this, arguments);
      this.restoreFocus();
      return this.panel.hide();
    };

    LTSelectList2View.prototype.start = function(callback) {
      this.callback = callback;
      this.selected_item = null;
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    LTSelectList2View.prototype.getPanel = function() {
      return this.panel;
    };

    LTSelectList2View.prototype.destroy = function() {
      this.panel.remove();
      return this.panel.destroy();
    };

    return LTSelectList2View;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2x0c2VsZWN0bGlzdDItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxnQ0FBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUFBLGdDQUVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLG1EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGtCQUFWLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFOO09BQTdCLENBRlQsQ0FBQTthQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLEVBSlU7SUFBQSxDQUZaLENBQUE7O0FBQUEsZ0NBUUEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1gsVUFBQSxZQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBTCxDQUFBO0FBQUEsTUFDQSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQWIsQ0FBaUIsV0FBakIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FGTixDQUFBO0FBQUEsTUFHQSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsY0FBbEIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxHQUFHLENBQUMsV0FBSixHQUFrQixJQUFJLENBQUMsT0FKdkIsQ0FBQTtBQUFBLE1BS0EsRUFBRSxDQUFDLFdBQUgsQ0FBZSxHQUFmLENBTEEsQ0FBQTtBQUFBLE1BTUEsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBTk4sQ0FBQTtBQUFBLE1BT0EsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixDQVBBLENBQUE7QUFBQSxNQVFBLEdBQUcsQ0FBQyxXQUFKLEdBQWtCLElBQUksQ0FBQyxTQVJ2QixDQUFBO0FBQUEsTUFTQSxFQUFFLENBQUMsV0FBSCxDQUFlLEdBQWYsQ0FUQSxDQUFBO0FBVUEsYUFBTyxFQUFQLENBWFc7SUFBQSxDQVJiLENBQUE7O0FBQUEsZ0NBNEJBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixVQURZO0lBQUEsQ0E1QmQsQ0FBQTs7QUFBQSxnQ0FnQ0EsU0FBQSxHQUFXLFNBQUMsSUFBRCxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBSlM7SUFBQSxDQWhDWCxDQUFBOztBQUFBLGdDQXVDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSwrQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxFQUhNO0lBQUEsQ0F2Q1IsQ0FBQTs7QUFBQSxnQ0E0Q0EsS0FBQSxHQUFPLFNBQUUsUUFBRixHQUFBO0FBQ0wsTUFETSxJQUFDLENBQUEsV0FBQSxRQUNQLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFKSztJQUFBLENBNUNQLENBQUE7O0FBQUEsZ0NBa0RBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixhQUFPLElBQUMsQ0FBQSxLQUFSLENBRFE7SUFBQSxDQWxEVixDQUFBOztBQUFBLGdDQXFEQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxFQUZPO0lBQUEsQ0FyRFQsQ0FBQTs7NkJBQUE7O0tBRDhCLGVBSGhDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/ltselectlist2-view.coffee
