(function() {
  var CountManager, toggleClassByCondition, _;

  _ = require('underscore-plus');

  toggleClassByCondition = require('./utils').toggleClassByCondition;

  CountManager = (function() {
    CountManager.prototype.count = null;

    function CountManager(vimState) {
      this.vimState = vimState;
      this.editorElement = this.vimState.editorElement;
    }

    CountManager.prototype.set = function(num) {
      if (this.count == null) {
        this.count = 0;
      }
      this.count = (this.count * 10) + num;
      this.vimState.hover.add(num);
      return this.updateEditorElement();
    };

    CountManager.prototype.get = function() {
      return this.count;
    };

    CountManager.prototype.reset = function() {
      this.count = null;
      return this.updateEditorElement();
    };

    CountManager.prototype.updateEditorElement = function() {
      return toggleClassByCondition(this.editorElement, 'with-count', this.count != null);
    };

    return CountManager;

  })();

  module.exports = CountManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2NvdW50LW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQyx5QkFBMEIsT0FBQSxDQUFRLFNBQVIsRUFBMUIsc0JBREQsQ0FBQTs7QUFBQSxFQUdNO0FBQ0osMkJBQUEsS0FBQSxHQUFPLElBQVAsQ0FBQTs7QUFFYSxJQUFBLHNCQUFFLFFBQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFdBQUEsUUFDYixDQUFBO0FBQUEsTUFBQyxJQUFDLENBQUEsZ0JBQWlCLElBQUMsQ0FBQSxTQUFsQixhQUFGLENBRFc7SUFBQSxDQUZiOztBQUFBLDJCQUtBLEdBQUEsR0FBSyxTQUFDLEdBQUQsR0FBQTs7UUFDSCxJQUFDLENBQUEsUUFBUztPQUFWO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQUMsSUFBQyxDQUFBLEtBQUQsR0FBUyxFQUFWLENBQUEsR0FBZ0IsR0FEekIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBaEIsQ0FBb0IsR0FBcEIsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLG1CQUFELENBQUEsRUFKRztJQUFBLENBTEwsQ0FBQTs7QUFBQSwyQkFXQSxHQUFBLEdBQUssU0FBQSxHQUFBO2FBQ0gsSUFBQyxDQUFBLE1BREU7SUFBQSxDQVhMLENBQUE7O0FBQUEsMkJBY0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFULENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQUZLO0lBQUEsQ0FkUCxDQUFBOztBQUFBLDJCQWtCQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7YUFDbkIsc0JBQUEsQ0FBdUIsSUFBQyxDQUFBLGFBQXhCLEVBQXVDLFlBQXZDLEVBQXFELGtCQUFyRCxFQURtQjtJQUFBLENBbEJyQixDQUFBOzt3QkFBQTs7TUFKRixDQUFBOztBQUFBLEVBeUJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBekJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/sguenther/.atom/packages/vim-mode-plus/lib/count-manager.coffee
