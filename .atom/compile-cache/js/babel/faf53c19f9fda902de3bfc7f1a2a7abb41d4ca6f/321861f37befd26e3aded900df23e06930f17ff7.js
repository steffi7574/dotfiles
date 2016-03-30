Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

'use babel';

var Project = (function () {
  function Project() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Project);

    this.props = {};
    this.emitter = new _atom.Emitter();
    this.db = new _db2['default']();
    this.updateProps(props);
    this.lookForUpdates();
  }

  _createClass(Project, [{
    key: 'updateProps',
    value: function updateProps(props) {
      this.props = _underscorePlus2['default'].deepExtend(this.defaultProps, props);
    }
  }, {
    key: 'getPropsToSave',
    value: function getPropsToSave() {
      var saveProps = {};
      var value = undefined;
      var key = undefined;
      for (key in this.props) {
        value = this.props[key];
        if (!this.isDefaultProp(key, value)) {
          saveProps[key] = value;
        }
      }

      return saveProps;
    }
  }, {
    key: 'isDefaultProp',
    value: function isDefaultProp(key, value) {
      if (!this.defaultProps.hasOwnProperty(key)) {
        return false;
      }

      var defaultProp = this.defaultProps[key];
      if (typeof defaultProp === 'object' && _underscorePlus2['default'].isEqual(defaultProp, value)) {
        return true;
      }

      if (defaultProp === value) {
        return true;
      }

      return false;
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      if (typeof key === 'object') {
        for (var i in key) {
          value = key[i];
          this.props[i] = value;
        }

        this.save();
      } else {
        this.props[key] = value;
        this.save();
      }
    }
  }, {
    key: 'unset',
    value: function unset(key) {
      if (_underscorePlus2['default'].has(this.defaultProps, key)) {
        this.props[key] = this.defaultProps[key];
      } else {
        this.props[key] = null;
      }

      this.save();
    }
  }, {
    key: 'lookForUpdates',
    value: function lookForUpdates() {
      var _this = this;

      if (this.props._id) {
        this.db.setSearchQuery('_id', this.props._id);
        this.db.onUpdate(function (props) {
          if (props) {
            var updatedProps = _underscorePlus2['default'].deepExtend(_this.defaultProps, props);
            if (!_underscorePlus2['default'].isEqual(_this.props, updatedProps)) {
              _this.updateProps(props);
              _this.emitter.emit('updated');
              if (_this.isCurrent()) {
                _this.load();
              }
            }
          } else {
            _this.db.setSearchQuery('paths', _this.props.paths);
            _this.db.find(function (props) {
              _this.updateProps(props);
              _this.db.setSearchQuery('_id', _this.props._id);
              _this.emitter.emit('updated');
              if (_this.isCurrent()) {
                _this.load();
              }
            });
          }
        });
      }
    }
  }, {
    key: 'isCurrent',
    value: function isCurrent() {
      var activePath = atom.project.getPaths()[0];
      var mainPath = this.props.paths[0];
      if (activePath === mainPath) {
        return true;
      }

      return false;
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      var _this2 = this;

      var valid = true;
      this.requiredProperties.forEach(function (key) {
        if (!_this2.props[key] || !_this2.props[key].length) {
          valid = false;
        }
      });

      return valid;
    }
  }, {
    key: 'load',
    value: function load() {
      if (this.isCurrent()) {
        var projectSettings = new _settings2['default']();
        projectSettings.load(this.props.settings);
      }
    }
  }, {
    key: 'save',
    value: function save() {
      var _this3 = this;

      if (this.isValid()) {
        if (this.props._id) {
          this.db.update(this.getPropsToSave());
        } else {
          this.db.add(this.getPropsToSave(), function (id) {
            _this3.props._id = id;
            _this3.lookForUpdates();
          });
        }

        return true;
      }

      return false;
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.db['delete'](this.props._id);
    }
  }, {
    key: 'open',
    value: function open() {
      var win = atom.getCurrentWindow();
      var closeCurrent = atom.config.get('project-manager.closeCurrent');

      atom.open({
        pathsToOpen: this.props.paths,
        devMode: this.props.devMode,
        newWindow: closeCurrent
      });

      if (closeCurrent) {
        setTimeout(function () {
          win.close();
        }, 0);
      }
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      this.emitter.on('updated', function () {
        return callback();
      });
    }
  }, {
    key: 'requiredProperties',
    get: function get() {
      return ['title', 'paths'];
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return {
        title: '',
        paths: [],
        icon: 'icon-chevron-right',
        settings: {},
        group: null,
        devMode: false,
        template: null
      };
    }
  }]);

  return Project;
})();

exports['default'] = Project;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFc0IsTUFBTTs7OEJBQ2QsaUJBQWlCOzs7O3dCQUNWLFlBQVk7Ozs7a0JBQ2xCLE1BQU07Ozs7QUFMckIsV0FBVyxDQUFDOztJQU9TLE9BQU87QUFFZixXQUZRLE9BQU8sR0FFSjtRQUFWLEtBQUsseURBQUMsRUFBRTs7MEJBRkQsT0FBTzs7QUFHeEIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxFQUFFLEdBQUcscUJBQVEsQ0FBQztBQUNuQixRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztHQUN2Qjs7ZUFSa0IsT0FBTzs7V0EwQmYscUJBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLEdBQUcsNEJBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDckQ7OztXQUVhLDBCQUFHO0FBQ2YsVUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFVBQUksS0FBSyxZQUFBLENBQUM7QUFDVixVQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsV0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN0QixhQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDbkMsbUJBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDeEI7T0FDRjs7QUFFRCxhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1dBRVks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RUFBRTtBQUNaLGFBQUssRUFBRSxJQUFJO0FBQ1gsZUFBTyxFQUFFLEtBQUs7QUFDZCxnQkFBUSxFQUFFLElBQUk7T0FDZixDQUFDO0tBQ0g7OztTQXhCa0IsT0FBTzs7O3FCQUFQLE9BQU8iLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvcHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcbmltcG9ydCBTZXR0aW5ncyBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCBEQiBmcm9tICcuL2RiJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHM9e30pIHtcbiAgICB0aGlzLnByb3BzID0ge307XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLmRiID0gbmV3IERCKCk7XG4gICAgdGhpcy51cGRhdGVQcm9wcyhwcm9wcyk7XG4gICAgdGhpcy5sb29rRm9yVXBkYXRlcygpO1xuICB9XG5cbiAgZ2V0IHJlcXVpcmVkUHJvcGVydGllcygpIHtcbiAgICByZXR1cm4gWyd0aXRsZScsICdwYXRocyddO1xuICB9XG5cbiAgZ2V0IGRlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6ICcnLFxuICAgICAgcGF0aHM6IFtdLFxuICAgICAgaWNvbjogJ2ljb24tY2hldnJvbi1yaWdodCcsXG4gICAgICBzZXR0aW5nczoge30sXG4gICAgICBncm91cDogbnVsbCxcbiAgICAgIGRldk1vZGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGU6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlUHJvcHMocHJvcHMpIHtcbiAgICB0aGlzLnByb3BzID0gXy5kZWVwRXh0ZW5kKHRoaXMuZGVmYXVsdFByb3BzLCBwcm9wcyk7XG4gIH1cblxuICBnZXRQcm9wc1RvU2F2ZSgpIHtcbiAgICBsZXQgc2F2ZVByb3BzID0ge307XG4gICAgbGV0IHZhbHVlO1xuICAgIGxldCBrZXk7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5wcm9wcykge1xuICAgICAgdmFsdWUgPSB0aGlzLnByb3BzW2tleV07XG4gICAgICBpZiAoIXRoaXMuaXNEZWZhdWx0UHJvcChrZXksIHZhbHVlKSkge1xuICAgICAgICBzYXZlUHJvcHNba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzYXZlUHJvcHM7XG4gIH1cblxuICBpc0RlZmF1bHRQcm9wKGtleSwgdmFsdWUpIHtcbiAgICBpZiAoIXRoaXMuZGVmYXVsdFByb3BzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0UHJvcCA9IHRoaXMuZGVmYXVsdFByb3BzW2tleV07XG4gICAgaWYgKHR5cGVvZiBkZWZhdWx0UHJvcCA9PT0gJ29iamVjdCcgJiYgXy5pc0VxdWFsKGRlZmF1bHRQcm9wLCB2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChkZWZhdWx0UHJvcCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHNldChrZXksIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKGxldCBpIGluIGtleSkge1xuICAgICAgICB2YWx1ZSA9IGtleVtpXTtcbiAgICAgICAgdGhpcy5wcm9wc1tpXSA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNhdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wc1trZXldID0gdmFsdWU7XG4gICAgICB0aGlzLnNhdmUoKTtcbiAgICB9XG4gIH1cblxuICB1bnNldChrZXkpIHtcbiAgICBpZiAoXy5oYXModGhpcy5kZWZhdWx0UHJvcHMsIGtleSkpIHtcbiAgICAgIHRoaXMucHJvcHNba2V5XSA9IHRoaXMuZGVmYXVsdFByb3BzW2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHNba2V5XSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5zYXZlKCk7XG4gIH1cblxuICBsb29rRm9yVXBkYXRlcygpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5faWQpIHtcbiAgICAgIHRoaXMuZGIuc2V0U2VhcmNoUXVlcnkoJ19pZCcsIHRoaXMucHJvcHMuX2lkKTtcbiAgICAgIHRoaXMuZGIub25VcGRhdGUoKHByb3BzKSA9PiB7XG4gICAgICAgIGlmIChwcm9wcykge1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZWRQcm9wcyA9IF8uZGVlcEV4dGVuZCh0aGlzLmRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICAgICAgICAgIGlmICghXy5pc0VxdWFsKHRoaXMucHJvcHMsIHVwZGF0ZWRQcm9wcykpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvcHMocHJvcHMpO1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3VwZGF0ZWQnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ3VycmVudCgpKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRiLnNldFNlYXJjaFF1ZXJ5KCdwYXRocycsIHRoaXMucHJvcHMucGF0aHMpO1xuICAgICAgICAgIHRoaXMuZGIuZmluZCgocHJvcHMpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvcHMocHJvcHMpO1xuICAgICAgICAgICAgdGhpcy5kYi5zZXRTZWFyY2hRdWVyeSgnX2lkJywgdGhpcy5wcm9wcy5faWQpO1xuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3VwZGF0ZWQnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ3VycmVudCgpKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpc0N1cnJlbnQoKSB7XG4gICAgY29uc3QgYWN0aXZlUGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgIGNvbnN0IG1haW5QYXRoID0gdGhpcy5wcm9wcy5wYXRoc1swXTtcbiAgICBpZiAoYWN0aXZlUGF0aCA9PT0gbWFpblBhdGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzVmFsaWQoKSB7XG4gICAgbGV0IHZhbGlkID0gdHJ1ZTtcbiAgICB0aGlzLnJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvcHNba2V5XSB8fCAhdGhpcy5wcm9wc1trZXldLmxlbmd0aCkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgbG9hZCgpIHtcbiAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgbGV0IHByb2plY3RTZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xuICAgICAgcHJvamVjdFNldHRpbmdzLmxvYWQodGhpcy5wcm9wcy5zZXR0aW5ncyk7XG4gICAgfVxuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLl9pZCkge1xuICAgICAgICB0aGlzLmRiLnVwZGF0ZSh0aGlzLmdldFByb3BzVG9TYXZlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kYi5hZGQodGhpcy5nZXRQcm9wc1RvU2F2ZSgpLCBpZCA9PiB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5faWQgPSBpZDtcbiAgICAgICAgICB0aGlzLmxvb2tGb3JVcGRhdGVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZW1vdmUoKSB7XG4gICAgdGhpcy5kYi5kZWxldGUodGhpcy5wcm9wcy5faWQpO1xuICB9XG5cbiAgb3BlbigpIHtcbiAgICBjb25zdCB3aW4gPSBhdG9tLmdldEN1cnJlbnRXaW5kb3coKTtcbiAgICBjb25zdCBjbG9zZUN1cnJlbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5jbG9zZUN1cnJlbnQnKTtcblxuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogdGhpcy5wcm9wcy5wYXRocyxcbiAgICAgIGRldk1vZGU6IHRoaXMucHJvcHMuZGV2TW9kZSxcbiAgICAgIG5ld1dpbmRvdzogY2xvc2VDdXJyZW50XG4gICAgfSk7XG5cbiAgICBpZiAoY2xvc2VDdXJyZW50KSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW4uY2xvc2UoKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfVxuXG4gIG9uVXBkYXRlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKCd1cGRhdGVkJywgKCkgPT4gY2FsbGJhY2soKSk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/project.js
