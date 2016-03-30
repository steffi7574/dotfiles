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
      return "<li class='two lines'>\n  <div class='primary-line'>" + item.primary + "</div>\n  <div class='secondary-line'>" + item.secondary + "</div>\n</li>";
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2x0c2VsZWN0bGlzdDItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGlCQUFrQixPQUFBLENBQVEsc0JBQVIsRUFBbEIsY0FBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxnQ0FBQSxRQUFBLEdBQVUsSUFBVixDQUFBOztBQUFBLGdDQUVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLG1EQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGtCQUFWLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFOO09BQTdCLENBRlQsQ0FBQTthQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLEVBSlU7SUFBQSxDQUZaLENBQUE7O0FBQUEsZ0NBUUEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO2FBRWYsc0RBQUEsR0FDMEIsSUFBSSxDQUFDLE9BRC9CLEdBQ3VDLHdDQUR2QyxHQUV3QixJQUFJLENBQUMsU0FGN0IsR0FFdUMsZ0JBSnhCO0lBQUEsQ0FSYixDQUFBOztBQUFBLGdDQWdCQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osVUFEWTtJQUFBLENBaEJkLENBQUE7O0FBQUEsZ0NBb0JBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBVixFQUpTO0lBQUEsQ0FwQlgsQ0FBQTs7QUFBQSxnQ0EyQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsK0NBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsRUFITTtJQUFBLENBM0JSLENBQUE7O0FBQUEsZ0NBZ0NBLEtBQUEsR0FBTyxTQUFFLFFBQUYsR0FBQTtBQUNMLE1BRE0sSUFBQyxDQUFBLFdBQUEsUUFDUCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBSks7SUFBQSxDQWhDUCxDQUFBOztBQUFBLGdDQXNDQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsYUFBTyxJQUFDLENBQUEsS0FBUixDQURRO0lBQUEsQ0F0Q1YsQ0FBQTs7QUFBQSxnQ0F5Q0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUEsRUFGTztJQUFBLENBekNULENBQUE7OzZCQUFBOztLQUQ4QixlQUhoQyxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/ltselectlist2-view.coffee
