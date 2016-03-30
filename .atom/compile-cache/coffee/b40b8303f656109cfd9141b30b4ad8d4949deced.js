(function() {
  var CompositeDisposable, MinimapHighlightSelected, MinimapHighlightSelectedView, requirePackages,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapHighlightSelectedView = null;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.destroyViews = __bind(this.destroyViews, this);
      this.createViews = __bind(this.createViews, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapHighlightSelected.prototype.activate = function(state) {};

    MinimapHighlightSelected.prototype.consumeMinimapServiceV1 = function(minimap) {
      this.minimap = minimap;
      return requirePackages('highlight-selected').then((function(_this) {
        return function(_arg) {
          _this.highlightSelected = _arg[0];
          MinimapHighlightSelectedView = require('./minimap-highlight-selected-view')();
          return _this.minimap.registerPlugin('highlight-selected', _this);
        };
      })(this));
    };

    MinimapHighlightSelected.prototype.deactivate = function() {
      this.deactivatePlugin();
      this.minimapPackage = null;
      this.highlightSelectedPackage = null;
      this.highlightSelected = null;
      return this.minimap = null;
    };

    MinimapHighlightSelected.prototype.isActive = function() {
      return this.active;
    };

    MinimapHighlightSelected.prototype.activatePlugin = function() {
      if (this.active) {
        return;
      }
      this.active = true;
      this.createViews();
      this.subscriptions.add(this.minimap.onDidActivate(this.createViews));
      return this.subscriptions.add(this.minimap.onDidDeactivate(this.destroyViews));
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.destroyViews();
      return this.subscriptions.dispose();
    };

    MinimapHighlightSelected.prototype.createViews = function() {
      if (this.viewsCreated) {
        return;
      }
      this.viewsCreated = true;
      this.view = new MinimapHighlightSelectedView(this.minimap);
      return this.view.handleSelection();
    };

    MinimapHighlightSelected.prototype.destroyViews = function() {
      if (!this.viewsCreated) {
        return;
      }
      this.viewsCreated = false;
      this.view.removeMarkers();
      return this.view.destroy();
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNEZBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsV0FBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0Msa0JBQW1CLE9BQUEsQ0FBUSxZQUFSLEVBQW5CLGVBREQsQ0FBQTs7QUFBQSxFQUVBLDRCQUFBLEdBQStCLElBRi9CLENBQUE7O0FBQUEsRUFJTTtBQUNTLElBQUEsa0NBQUEsR0FBQTtBQUNYLHlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBRFc7SUFBQSxDQUFiOztBQUFBLHVDQUdBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQSxDQUhWLENBQUE7O0FBQUEsdUNBS0EsdUJBQUEsR0FBeUIsU0FBRSxPQUFGLEdBQUE7QUFDdkIsTUFEd0IsSUFBQyxDQUFBLFVBQUEsT0FDekIsQ0FBQTthQUFBLGVBQUEsQ0FBZ0Isb0JBQWhCLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQ3pDLFVBRDJDLEtBQUMsQ0FBQSxvQkFBRixPQUMxQyxDQUFBO0FBQUEsVUFBQSw0QkFBQSxHQUErQixPQUFBLENBQVEsbUNBQVIsQ0FBQSxDQUFBLENBQS9CLENBQUE7aUJBRUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLG9CQUF4QixFQUE4QyxLQUE5QyxFQUh5QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFB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

//# sourceURL=/home/sguenther/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected.coffee
