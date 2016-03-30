Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

'use babel';

var Projects = (function () {
  function Projects() {
    var _this = this;

    _classCallCheck(this, Projects);

    this.emitter = new _atom.Emitter();
    this.db = new _db2['default']();
    this.db.onUpdate(function () {
      return _this.emitter.emit('projects-updated');
    });
  }

  _createClass(Projects, [{
    key: 'onUpdate',
    value: function onUpdate(callback) {
      this.emitter.on('projects-updated', callback);
    }
  }, {
    key: 'getAll',
    value: function getAll(callback) {
      this.db.find(function (projectSettings) {
        var projects = [];
        var setting = undefined;
        var project = undefined;
        var key = undefined;
        for (key in projectSettings) {
          setting = projectSettings[key];
          if (setting.paths) {
            project = new _project2['default'](setting);
            projects.push(project);
          }
        }

        callback(projects);
      });
    }
  }, {
    key: 'getCurrent',
    value: function getCurrent(callback) {
      this.getAll(function (projects) {
        projects.forEach(function (project) {
          if (project.isCurrent()) {
            callback(project);
          }
        });
      });
    }
  }]);

  return Projects;
})();

exports['default'] = Projects;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNCLE1BQU07O2tCQUNiLE1BQU07Ozs7dUJBQ0QsV0FBVzs7OztBQUovQixXQUFXLENBQUM7O0lBTVMsUUFBUTtBQUNoQixXQURRLFFBQVEsR0FDYjs7OzBCQURLLFFBQVE7O0FBRXpCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQztBQUM3QixRQUFJLENBQUMsRUFBRSxHQUFHLHFCQUFRLENBQUM7QUFDbkIsUUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7YUFBTSxNQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDL0Q7O2VBTGtCLFFBQVE7O1dBT25CLGtCQUFDLFFBQVEsRUFBRTtBQUNqQixVQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMvQzs7O1dBRUssZ0JBQUMsUUFBUSxFQUFFO0FBQ2YsVUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQSxlQUFlLEVBQUk7QUFDOUIsWUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFlBQUksT0FBTyxZQUFBLENBQUM7QUFDWixZQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osWUFBSSxHQUFHLFlBQUEsQ0FBQztBQUNSLGFBQUssR0FBRyxJQUFJLGVBQWUsRUFBRTtBQUMzQixpQkFBTyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixjQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7QUFDakIsbUJBQU8sR0FBRyx5QkFBWSxPQUFPLENBQUMsQ0FBQztBQUMvQixvQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztXQUN4QjtTQUNGOztBQUVELGdCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDcEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVTLG9CQUFDLFFBQVEsRUFBRTtBQUNuQixVQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ3RCLGdCQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQzFCLGNBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3ZCLG9CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDbkI7U0FDRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBckNrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9wcm9qZWN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IERCIGZyb20gJy4vZGInO1xuaW1wb3J0IFByb2plY3QgZnJvbSAnLi9wcm9qZWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuZGIgPSBuZXcgREIoKTtcbiAgICB0aGlzLmRiLm9uVXBkYXRlKCgpID0+IHRoaXMuZW1pdHRlci5lbWl0KCdwcm9qZWN0cy11cGRhdGVkJykpO1xuICB9XG5cbiAgb25VcGRhdGUoY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ3Byb2plY3RzLXVwZGF0ZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBnZXRBbGwoY2FsbGJhY2spIHtcbiAgICB0aGlzLmRiLmZpbmQocHJvamVjdFNldHRpbmdzID0+IHtcbiAgICAgIGxldCBwcm9qZWN0cyA9IFtdO1xuICAgICAgbGV0IHNldHRpbmc7XG4gICAgICBsZXQgcHJvamVjdDtcbiAgICAgIGxldCBrZXk7XG4gICAgICBmb3IgKGtleSBpbiBwcm9qZWN0U2V0dGluZ3MpIHtcbiAgICAgICAgc2V0dGluZyA9IHByb2plY3RTZXR0aW5nc1trZXldO1xuICAgICAgICBpZiAoc2V0dGluZy5wYXRocykge1xuICAgICAgICAgIHByb2plY3QgPSBuZXcgUHJvamVjdChzZXR0aW5nKTtcbiAgICAgICAgICBwcm9qZWN0cy5wdXNoKHByb2plY3QpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKHByb2plY3RzKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEN1cnJlbnQoY2FsbGJhY2spIHtcbiAgICB0aGlzLmdldEFsbChwcm9qZWN0cyA9PiB7XG4gICAgICBwcm9qZWN0cy5mb3JFYWNoKHByb2plY3QgPT4ge1xuICAgICAgICBpZiAocHJvamVjdC5pc0N1cnJlbnQoKSkge1xuICAgICAgICAgIGNhbGxiYWNrKHByb2plY3QpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/projects.js
