(function() {
  var CompositeDisposable, ContentsByMode, Disposable, StatusBarManager, _ref;

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  ContentsByMode = {
    'insert': ["insert", "Insert"],
    'insert.replace': ["insert", "Replace"],
    'normal': ["normal", "Normal"],
    'visual': ["visual", "Visual"],
    'visual.characterwise': ["visual", "Visual Char"],
    'visual.linewise': ["visual", "Visual Line"],
    'visual.blockwise': ["visual", "Visual Block"]
  };

  module.exports = StatusBarManager = (function() {
    function StatusBarManager() {
      this.element = document.createElement("div");
      this.prefix = this.element.id = 'status-bar-vim-mode-plus';
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.container.appendChild(this.element);
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      var klass, newContents, text;
      if (submode != null) {
        mode += "." + submode;
      }
      if (newContents = ContentsByMode[mode]) {
        klass = newContents[0], text = newContents[1];
        this.element.className = "" + this.prefix + "-" + klass;
        return this.element.textContent = text;
      }
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFDQTtBQUFBLE1BQUEsdUVBQUE7O0FBQUEsRUFBQSxPQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLGtCQUFBLFVBQUQsRUFBYSwyQkFBQSxtQkFBYixDQUFBOztBQUFBLEVBRUEsY0FBQSxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUFWO0FBQUEsSUFDQSxnQkFBQSxFQUFrQixDQUFDLFFBQUQsRUFBVyxTQUFYLENBRGxCO0FBQUEsSUFFQSxRQUFBLEVBQVUsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUZWO0FBQUEsSUFHQSxRQUFBLEVBQVUsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUhWO0FBQUEsSUFJQSxzQkFBQSxFQUF3QixDQUFDLFFBQUQsRUFBVyxhQUFYLENBSnhCO0FBQUEsSUFLQSxpQkFBQSxFQUFtQixDQUFDLFFBQUQsRUFBVyxhQUFYLENBTG5CO0FBQUEsSUFNQSxrQkFBQSxFQUFvQixDQUFDLFFBQUQsRUFBVyxjQUFYLENBTnBCO0dBSEYsQ0FBQTs7QUFBQSxFQVdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLDBCQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxHQUFjLDBCQUR4QixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsU0FBRCxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBSGIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLEdBQXVCLGNBSnZCLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixJQUFDLENBQUEsT0FBeEIsQ0FMQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSwrQkFRQSxVQUFBLEdBQVksU0FBRSxTQUFGLEdBQUE7QUFBYyxNQUFiLElBQUMsQ0FBQSxZQUFBLFNBQVksQ0FBZDtJQUFBLENBUlosQ0FBQTs7QUFBQSwrQkFVQSxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sT0FBUCxHQUFBO0FBQ04sVUFBQSx3QkFBQTtBQUFBLE1BQUEsSUFBeUIsZUFBekI7QUFBQSxRQUFBLElBQUEsSUFBUyxHQUFBLEdBQUcsT0FBWixDQUFBO09BQUE7QUFDQSxNQUFBLElBQUcsV0FBQSxHQUFjLGNBQWUsQ0FBQSxJQUFBLENBQWhDO0FBQ0UsUUFBQyxzQkFBRCxFQUFRLHFCQUFSLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixFQUFBLEdBQUcsSUFBQyxDQUFBLE1BQUosR0FBVyxHQUFYLEdBQWMsS0FEbkMsQ0FBQTtlQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxHQUF1QixLQUh6QjtPQUZNO0lBQUEsQ0FWUixDQUFBOztBQUFBLCtCQWtCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0I7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBUDtBQUFBLFFBQWtCLFFBQUEsRUFBVSxFQUE1QjtPQUF4QixFQURGO0lBQUEsQ0FsQlIsQ0FBQTs7QUFBQSwrQkFxQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLEVBRE07SUFBQSxDQXJCUixDQUFBOzs0QkFBQTs7TUFiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/status-bar-manager.coffee
