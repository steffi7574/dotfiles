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
      var mainPath = this.props.paths[0] ? this.props.paths[0] : null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFc0IsTUFBTTs7OEJBQ2QsaUJBQWlCOzs7O3dCQUNWLFlBQVk7Ozs7a0JBQ2xCLE1BQU07Ozs7QUFMckIsV0FBVyxDQUFDOztJQU9TLE9BQU87QUFFZixXQUZRLE9BQU8sR0FFSjtRQUFWLEtBQUsseURBQUMsRUFBRTs7MEJBRkQsT0FBTzs7QUFHeEIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxFQUFFLEdBQUcscUJBQVEsQ0FBQztBQUNuQixRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztHQUN2Qjs7ZUFSa0IsT0FBTzs7V0EwQmYscUJBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLEdBQUcsNEJBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDckQ7OztXQUVhLDBCQUFHO0FBQ2YsVUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFVBQUksS0FBSyxZQUFBLENBQUM7QUFDVixVQUFJLEdBQUcsWUFBQSxDQUFDO0FBQ1IsV0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN0QixhQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDbkMsbUJBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDeEI7T0FDRjs7QUFFRCxhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1dBRVks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LGFBQUssRUFBRSxFQUFFO0FBQ1QsWUFBSSxFQUFFLG9CQUFvQjtBQUMxQixnQkFBUSxFQUFFLEVBQUU7QUFDWixhQUFLLEVBQUUsSUFBSTtBQUNYLGVBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVEsRUFBRSxJQUFJO09BQ2YsQ0FBQztLQUNIOzs7U0F4QmtCLE9BQU87OztxQkFBUCxPQUFPIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cyc7XG5pbXBvcnQgU2V0dGluZ3MgZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgREIgZnJvbSAnLi9kYic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2plY3Qge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzPXt9KSB7XG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5kYiA9IG5ldyBEQigpO1xuICAgIHRoaXMudXBkYXRlUHJvcHMocHJvcHMpO1xuICAgIHRoaXMubG9va0ZvclVwZGF0ZXMoKTtcbiAgfVxuXG4gIGdldCByZXF1aXJlZFByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIFsndGl0bGUnLCAncGF0aHMnXTtcbiAgfVxuXG4gIGdldCBkZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIHBhdGhzOiBbXSxcbiAgICAgIGljb246ICdpY29uLWNoZXZyb24tcmlnaHQnLFxuICAgICAgc2V0dGluZ3M6IHt9LFxuICAgICAgZ3JvdXA6IG51bGwsXG4gICAgICBkZXZNb2RlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZVByb3BzKHByb3BzKSB7XG4gICAgdGhpcy5wcm9wcyA9IF8uZGVlcEV4dGVuZCh0aGlzLmRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICB9XG5cbiAgZ2V0UHJvcHNUb1NhdmUoKSB7XG4gICAgbGV0IHNhdmVQcm9wcyA9IHt9O1xuICAgIGxldCB2YWx1ZTtcbiAgICBsZXQga2V5O1xuICAgIGZvciAoa2V5IGluIHRoaXMucHJvcHMpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5wcm9wc1trZXldO1xuICAgICAgaWYgKCF0aGlzLmlzRGVmYXVsdFByb3Aoa2V5LCB2YWx1ZSkpIHtcbiAgICAgICAgc2F2ZVByb3BzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2F2ZVByb3BzO1xuICB9XG5cbiAgaXNEZWZhdWx0UHJvcChrZXksIHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLmRlZmF1bHRQcm9wcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdFByb3AgPSB0aGlzLmRlZmF1bHRQcm9wc1trZXldO1xuICAgIGlmICh0eXBlb2YgZGVmYXVsdFByb3AgPT09ICdvYmplY3QnICYmIF8uaXNFcXVhbChkZWZhdWx0UHJvcCwgdmFsdWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoZGVmYXVsdFByb3AgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzZXQoa2V5LCB2YWx1ZSkge1xuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yIChsZXQgaSBpbiBrZXkpIHtcbiAgICAgICAgdmFsdWUgPSBrZXlbaV07XG4gICAgICAgIHRoaXMucHJvcHNbaV0gPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zYXZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHNba2V5XSA9IHZhbHVlO1xuICAgICAgdGhpcy5zYXZlKCk7XG4gICAgfVxuICB9XG5cbiAgdW5zZXQoa2V5KSB7XG4gICAgaWYgKF8uaGFzKHRoaXMuZGVmYXVsdFByb3BzLCBrZXkpKSB7XG4gICAgICB0aGlzLnByb3BzW2tleV0gPSB0aGlzLmRlZmF1bHRQcm9wc1trZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzW2tleV0gPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuc2F2ZSgpO1xuICB9XG5cbiAgbG9va0ZvclVwZGF0ZXMoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuX2lkKSB7XG4gICAgICB0aGlzLmRiLnNldFNlYXJjaFF1ZXJ5KCdfaWQnLCB0aGlzLnByb3BzLl9pZCk7XG4gICAgICB0aGlzLmRiLm9uVXBkYXRlKChwcm9wcykgPT4ge1xuICAgICAgICBpZiAocHJvcHMpIHtcbiAgICAgICAgICBjb25zdCB1cGRhdGVkUHJvcHMgPSBfLmRlZXBFeHRlbmQodGhpcy5kZWZhdWx0UHJvcHMsIHByb3BzKTtcbiAgICAgICAgICBpZiAoIV8uaXNFcXVhbCh0aGlzLnByb3BzLCB1cGRhdGVkUHJvcHMpKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb3BzKHByb3BzKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCd1cGRhdGVkJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5kYi5zZXRTZWFyY2hRdWVyeSgncGF0aHMnLCB0aGlzLnByb3BzLnBhdGhzKTtcbiAgICAgICAgICB0aGlzLmRiLmZpbmQoKHByb3BzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByb3BzKHByb3BzKTtcbiAgICAgICAgICAgIHRoaXMuZGIuc2V0U2VhcmNoUXVlcnkoJ19pZCcsIHRoaXMucHJvcHMuX2lkKTtcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCd1cGRhdGVkJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaXNDdXJyZW50KCkge1xuICAgIGNvbnN0IGFjdGl2ZVBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICBjb25zdCBtYWluUGF0aCA9IHRoaXMucHJvcHMucGF0aHNbMF0gPyB0aGlzLnByb3BzLnBhdGhzWzBdIDogbnVsbDtcbiAgICBpZiAoYWN0aXZlUGF0aCA9PT0gbWFpblBhdGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlzVmFsaWQoKSB7XG4gICAgbGV0IHZhbGlkID0gdHJ1ZTtcbiAgICB0aGlzLnJlcXVpcmVkUHJvcGVydGllcy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoIXRoaXMucHJvcHNba2V5XSB8fCAhdGhpcy5wcm9wc1trZXldLmxlbmd0aCkge1xuICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgbG9hZCgpIHtcbiAgICBpZiAodGhpcy5pc0N1cnJlbnQoKSkge1xuICAgICAgbGV0IHByb2plY3RTZXR0aW5ncyA9IG5ldyBTZXR0aW5ncygpO1xuICAgICAgcHJvamVjdFNldHRpbmdzLmxvYWQodGhpcy5wcm9wcy5zZXR0aW5ncyk7XG4gICAgfVxuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICBpZiAodGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLl9pZCkge1xuICAgICAgICB0aGlzLmRiLnVwZGF0ZSh0aGlzLmdldFByb3BzVG9TYXZlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kYi5hZGQodGhpcy5nZXRQcm9wc1RvU2F2ZSgpLCBpZCA9PiB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5faWQgPSBpZDtcbiAgICAgICAgICB0aGlzLmxvb2tGb3JVcGRhdGVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZW1vdmUoKSB7XG4gICAgdGhpcy5kYi5kZWxldGUodGhpcy5wcm9wcy5faWQpO1xuICB9XG5cbiAgb3BlbigpIHtcbiAgICBjb25zdCB3aW4gPSBhdG9tLmdldEN1cnJlbnRXaW5kb3coKTtcbiAgICBjb25zdCBjbG9zZUN1cnJlbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5jbG9zZUN1cnJlbnQnKTtcblxuICAgIGF0b20ub3Blbih7XG4gICAgICBwYXRoc1RvT3BlbjogdGhpcy5wcm9wcy5wYXRocyxcbiAgICAgIGRldk1vZGU6IHRoaXMucHJvcHMuZGV2TW9kZSxcbiAgICAgIG5ld1dpbmRvdzogY2xvc2VDdXJyZW50XG4gICAgfSk7XG5cbiAgICBpZiAoY2xvc2VDdXJyZW50KSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW4uY2xvc2UoKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfVxuXG4gIG9uVXBkYXRlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKCd1cGRhdGVkJywgKCkgPT4gY2FsbGJhY2soKSk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/project.js
