(function() {
  var LTSelectListView, SelectListView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SelectListView = require('atom-space-pen-views').SelectListView;

  module.exports = LTSelectListView = (function(_super) {
    __extends(LTSelectListView, _super);

    function LTSelectListView() {
      return LTSelectListView.__super__.constructor.apply(this, arguments);
    }

    LTSelectListView.prototype.callback = null;

    LTSelectListView.prototype.initialize = function() {
      LTSelectListView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      this.panel = atom.workspace.addModalPanel({
        item: this
      });
      return this.panel.hide();
    };

    LTSelectListView.prototype.viewForItem = function(item) {
      return "<li>" + item + "</li>";
    };

    LTSelectListView.prototype.confirmed = function(item) {
      this.selected_item = item;
      this.restoreFocus();
      this.panel.hide();
      return this.callback(item);
    };

    LTSelectListView.prototype.cancel = function() {
      LTSelectListView.__super__.cancel.apply(this, arguments);
      this.restoreFocus();
      return this.panel.hide();
    };

    LTSelectListView.prototype.start = function(callback) {
      this.callback = callback;
      this.selected_item = null;
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    LTSelectListView.prototype.getPanel = function() {
      return this.panel;
    };

    LTSelectListView.prototype.destroy = function() {
      this.panel.remove();
      return this.panel.destroy();
    };

    return LTSelectListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4dG9vbHMvbGliL2x0c2VsZWN0bGlzdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsaUJBQWtCLE9BQUEsQ0FBUSxzQkFBUixFQUFsQixjQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBQUEsK0JBRUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsa0RBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsa0JBQVYsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQU47T0FBN0IsQ0FGVCxDQUFBO2FBR0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsRUFKVTtJQUFBLENBRlosQ0FBQTs7QUFBQSwrQkFRQSxXQUFBLEdBQWEsU0FBQyxJQUFELEdBQUE7YUFDVixNQUFBLEdBQU0sSUFBTixHQUFXLFFBREQ7SUFBQSxDQVJiLENBQUE7O0FBQUEsK0JBV0EsU0FBQSxHQUFXLFNBQUMsSUFBRCxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBSlM7SUFBQSxDQVhYLENBQUE7O0FBQUEsK0JBa0JBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLDhDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLEVBSE07SUFBQSxDQWxCUixDQUFBOztBQUFBLCtCQXVCQSxLQUFBLEdBQU8sU0FBRSxRQUFGLEdBQUE7QUFDTCxNQURNLElBQUMsQ0FBQSxXQUFBLFFBQ1AsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUpLO0lBQUEsQ0F2QlAsQ0FBQTs7QUFBQSwrQkE2QkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLGFBQU8sSUFBQyxDQUFBLEtBQVIsQ0FEUTtJQUFBLENBN0JWLENBQUE7O0FBQUEsK0JBZ0NBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBRk87SUFBQSxDQWhDVCxDQUFBOzs0QkFBQTs7S0FENkIsZUFIL0IsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/latextools/lib/ltselectlist-view.coffee
