'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompositeDisposable = undefined;
var ProjectsListView = undefined;
var Projects = undefined;
var SaveDialog = undefined;
var DB = undefined;

var ProjectManager = (function () {
  function ProjectManager() {
    _classCallCheck(this, ProjectManager);
  }

  _createClass(ProjectManager, null, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      CompositeDisposable = require('atom').CompositeDisposable;
      this.disposables = new CompositeDisposable();

      this.disposables.add(atom.commands.add('atom-workspace', {
        'project-manager:list-projects': function projectManagerListProjects() {
          ProjectsListView = require('./projects-list-view');
          var projectsListView = new ProjectsListView();
          projectsListView.toggle();
        },

        'project-manager:save-project': function projectManagerSaveProject() {
          SaveDialog = require('./save-dialog');
          var saveDialog = new SaveDialog();
          saveDialog.attach();
        },

        'project-manager:edit-projects': function projectManagerEditProjects() {
          DB = require('./db');
          var db = new DB();
          atom.workspace.open(db.file());
        }
      }));

      atom.project.onDidChangePaths(function () {
        return _this.updatePaths();
      });
      this.loadProject();
    }
  }, {
    key: 'loadProject',
    value: function loadProject() {
      var _this2 = this;

      Projects = require('./projects');
      this.projects = new Projects();
      this.projects.getCurrent(function (project) {
        if (project) {
          _this2.project = project;
          _this2.project.load();
        }
      });
    }
  }, {
    key: 'updatePaths',
    value: function updatePaths() {
      var paths = atom.project.getPaths();
      if (this.project && paths.length) {
        this.project.set('paths', paths);
      }
    }
  }, {
    key: 'provideProjects',
    value: function provideProjects() {
      Projects = require('./projects');
      return {
        projects: new Projects()
      };
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.disposables.dispose();
    }
  }, {
    key: 'config',
    get: function get() {
      return {
        showPath: {
          type: 'boolean',
          'default': true
        },
        closeCurrent: {
          type: 'boolean',
          'default': false,
          description: 'Closes the current window after opening another project'
        },
        environmentSpecificProjects: {
          type: 'boolean',
          'default': false
        },
        sortBy: {
          type: 'string',
          description: 'Default sorting is the order in which the projects are',
          'default': 'default',
          'enum': ['default', 'title', 'group']
        }
      };
    }
  }]);

  return ProjectManager;
})();

exports['default'] = ProjectManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7QUFFWixJQUFJLG1CQUFtQixZQUFBLENBQUM7QUFDeEIsSUFBSSxnQkFBZ0IsWUFBQSxDQUFDO0FBQ3JCLElBQUksUUFBUSxZQUFBLENBQUM7QUFDYixJQUFJLFVBQVUsWUFBQSxDQUFDO0FBQ2YsSUFBSSxFQUFFLFlBQUEsQ0FBQzs7SUFFYyxjQUFjO1dBQWQsY0FBYzswQkFBZCxjQUFjOzs7ZUFBZCxjQUFjOztXQTBCbEIsb0JBQUc7OztBQUNoQix5QkFBbUIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLENBQUM7QUFDMUQsVUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7O0FBRTdDLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZELHVDQUErQixFQUFFLHNDQUFNO0FBQ3JDLDBCQUFnQixHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ25ELGNBQUksZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0FBQzlDLDBCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzNCOztBQUVELHNDQUE4QixFQUFFLHFDQUFNO0FBQ3BDLG9CQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3RDLGNBQUksVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDbEMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNyQjs7QUFFRCx1Q0FBK0IsRUFBRSxzQ0FBTTtBQUNyQyxZQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JCLGNBQUksRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDbEIsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDaEM7T0FDRixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2VBQU0sTUFBSyxXQUFXLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDeEQsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7V0FFaUIsdUJBQUc7OztBQUNuQixjQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2pDLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNsQyxZQUFJLE9BQU8sRUFBRTtBQUNYLGlCQUFLLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsaUJBQUssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3JCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVpQix1QkFBRztBQUNuQixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3BDLFVBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2hDLFlBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztPQUNsQztLQUNGOzs7V0FFcUIsMkJBQUc7QUFDdkIsY0FBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqQyxhQUFPO0FBQ0wsZ0JBQVEsRUFBRSxJQUFJLFFBQVEsRUFBRTtPQUN6QixDQUFDO0tBQ0g7OztXQUVnQixzQkFBRztBQUNsQixVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCOzs7U0EvRWdCLGVBQUc7QUFDbEIsYUFBTztBQUNMLGdCQUFRLEVBQUU7QUFDUixjQUFJLEVBQUUsU0FBUztBQUNmLHFCQUFTLElBQUk7U0FDZDtBQUNELG9CQUFZLEVBQUU7QUFDWixjQUFJLEVBQUUsU0FBUztBQUNmLHFCQUFTLEtBQUs7QUFDZCxxQkFBVyxFQUFFLHlEQUF5RDtTQUN2RTtBQUNELG1DQUEyQixFQUFFO0FBQzNCLGNBQUksRUFBRSxTQUFTO0FBQ2YscUJBQVMsS0FBSztTQUNmO0FBQ0QsY0FBTSxFQUFFO0FBQ04sY0FBSSxFQUFFLFFBQVE7QUFDZCxxQkFBVyxFQUFFLHdEQUF3RDtBQUNyRSxxQkFBUyxTQUFTO0FBQ2xCLGtCQUFNLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7U0FDcEM7T0FDRixDQUFDO0tBQ0g7OztTQXhCa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvcHJvamVjdC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmxldCBDb21wb3NpdGVEaXNwb3NhYmxlO1xubGV0IFByb2plY3RzTGlzdFZpZXc7XG5sZXQgUHJvamVjdHM7XG5sZXQgU2F2ZURpYWxvZztcbmxldCBEQjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdE1hbmFnZXIge1xuXG4gIHN0YXRpYyBnZXQgY29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzaG93UGF0aDoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBjbG9zZUN1cnJlbnQ6IHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDbG9zZXMgdGhlIGN1cnJlbnQgd2luZG93IGFmdGVyIG9wZW5pbmcgYW5vdGhlciBwcm9qZWN0J1xuICAgICAgfSxcbiAgICAgIGVudmlyb25tZW50U3BlY2lmaWNQcm9qZWN0czoge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB9LFxuICAgICAgc29ydEJ5OiB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgc29ydGluZyBpcyB0aGUgb3JkZXIgaW4gd2hpY2ggdGhlIHByb2plY3RzIGFyZScsXG4gICAgICAgIGRlZmF1bHQ6ICdkZWZhdWx0JyxcbiAgICAgICAgZW51bTogWydkZWZhdWx0JywgJ3RpdGxlJywgJ2dyb3VwJ11cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGFjdGl2YXRlKCkge1xuICAgIENvbXBvc2l0ZURpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdwcm9qZWN0LW1hbmFnZXI6bGlzdC1wcm9qZWN0cyc6ICgpID0+IHtcbiAgICAgICAgUHJvamVjdHNMaXN0VmlldyA9IHJlcXVpcmUoJy4vcHJvamVjdHMtbGlzdC12aWV3Jyk7XG4gICAgICAgIGxldCBwcm9qZWN0c0xpc3RWaWV3ID0gbmV3IFByb2plY3RzTGlzdFZpZXcoKTtcbiAgICAgICAgcHJvamVjdHNMaXN0Vmlldy50b2dnbGUoKTtcbiAgICAgIH0sXG5cbiAgICAgICdwcm9qZWN0LW1hbmFnZXI6c2F2ZS1wcm9qZWN0JzogKCkgPT4ge1xuICAgICAgICBTYXZlRGlhbG9nID0gcmVxdWlyZSgnLi9zYXZlLWRpYWxvZycpO1xuICAgICAgICBsZXQgc2F2ZURpYWxvZyA9IG5ldyBTYXZlRGlhbG9nKCk7XG4gICAgICAgIHNhdmVEaWFsb2cuYXR0YWNoKCk7XG4gICAgICB9LFxuXG4gICAgICAncHJvamVjdC1tYW5hZ2VyOmVkaXQtcHJvamVjdHMnOiAoKSA9PiB7XG4gICAgICAgIERCID0gcmVxdWlyZSgnLi9kYicpO1xuICAgICAgICBsZXQgZGIgPSBuZXcgREIoKTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihkYi5maWxlKCkpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHRoaXMudXBkYXRlUGF0aHMoKSk7XG4gICAgdGhpcy5sb2FkUHJvamVjdCgpO1xuICB9XG5cbiAgc3RhdGljIGxvYWRQcm9qZWN0KCkge1xuICAgIFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuICAgIHRoaXMucHJvamVjdHMgPSBuZXcgUHJvamVjdHMoKTtcbiAgICB0aGlzLnByb2plY3RzLmdldEN1cnJlbnQocHJvamVjdCA9PiB7XG4gICAgICBpZiAocHJvamVjdCkge1xuICAgICAgICB0aGlzLnByb2plY3QgPSBwcm9qZWN0O1xuICAgICAgICB0aGlzLnByb2plY3QubG9hZCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHVwZGF0ZVBhdGhzKCkge1xuICAgIGxldCBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIGlmICh0aGlzLnByb2plY3QgJiYgcGF0aHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnByb2plY3Quc2V0KCdwYXRocycsIHBhdGhzKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgcHJvdmlkZVByb2plY3RzKCkge1xuICAgIFByb2plY3RzID0gcmVxdWlyZSgnLi9wcm9qZWN0cycpO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9qZWN0czogbmV3IFByb2plY3RzKClcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/project-manager.js
