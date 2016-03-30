(function() {
  var Dialog, Project, Projects, SaveDialog, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  Project = require('./project');

  Projects = require('./projects');

  path = require('path');

  module.exports = SaveDialog = (function(_super) {
    __extends(SaveDialog, _super);

    SaveDialog.prototype.filePath = null;

    function SaveDialog() {
      var firstPath, projects, title;
      firstPath = atom.project.getPaths()[0];
      title = path.basename(firstPath);
      SaveDialog.__super__.constructor.call(this, {
        prompt: 'Enter name of project',
        input: title,
        select: true,
        iconClass: 'icon-arrow-right'
      });
      projects = new Projects();
      projects.getCurrent((function(_this) {
        return function(project) {
          if (project.props.paths[0] === firstPath) {
            return _this.showError("This project is already saved as " + project.props.title);
          }
        };
      })(this));
    }

    SaveDialog.prototype.onConfirm = function(title) {
      var project, properties;
      if (title) {
        properties = {
          title: title,
          paths: atom.project.getPaths()
        };
        project = new Project(properties);
        project.save();
        return this.close();
      } else {
        return this.showError('You need to specify a name for the project');
      }
    };

    return SaveDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvc2F2ZS1kaWFsb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FIUCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7O0FBQUEseUJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFFYSxJQUFBLG9CQUFBLEdBQUE7QUFDWCxVQUFBLDBCQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQXBDLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFJLENBQUMsUUFBTCxDQUFjLFNBQWQsQ0FEUixDQUFBO0FBQUEsTUFHQSw0Q0FDRTtBQUFBLFFBQUEsTUFBQSxFQUFRLHVCQUFSO0FBQUEsUUFDQSxLQUFBLEVBQU8sS0FEUDtBQUFBLFFBRUEsTUFBQSxFQUFRLElBRlI7QUFBQSxRQUdBLFNBQUEsRUFBVyxrQkFIWDtPQURGLENBSEEsQ0FBQTtBQUFBLE1BU0EsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFBLENBVGYsQ0FBQTtBQUFBLE1BVUEsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO0FBQ2xCLFVBQUEsSUFBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXBCLEtBQTBCLFNBQTdCO21CQUNFLEtBQUMsQ0FBQSxTQUFELENBQVksbUNBQUEsR0FBbUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUE3RCxFQURGO1dBRGtCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FWQSxDQURXO0lBQUEsQ0FGYjs7QUFBQSx5QkFrQkEsU0FBQSxHQUFXLFNBQUMsS0FBRCxHQUFBO0FBQ1QsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFIO0FBQ0UsUUFBQSxVQUFBLEdBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsVUFDQSxLQUFBLEVBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FEUDtTQURGLENBQUE7QUFBQSxRQUlBLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUSxVQUFSLENBSmQsQ0FBQTtBQUFBLFFBS0EsT0FBTyxDQUFDLElBQVIsQ0FBQSxDQUxBLENBQUE7ZUFPQSxJQUFDLENBQUEsS0FBRCxDQUFBLEVBUkY7T0FBQSxNQUFBO2VBVUUsSUFBQyxDQUFBLFNBQUQsQ0FBVyw0Q0FBWCxFQVZGO09BRFM7SUFBQSxDQWxCWCxDQUFBOztzQkFBQTs7S0FEdUIsT0FOekIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/save-dialog.coffee
