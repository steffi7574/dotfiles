Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var Settings = (function () {
  function Settings() {
    _classCallCheck(this, Settings);
  }

  _createClass(Settings, [{
    key: 'update',
    value: function update() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.load(settings);
    }
  }, {
    key: 'load',
    value: function load() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if ('global' in settings) {
        settings['*'] = settings.global;
        delete settings.global;
      }

      if ('*' in settings) {
        var scopedSettings = settings;
        settings = settings['*'];
        delete scopedSettings['*'];

        var setting = undefined;
        var scope = undefined;
        for (scope in scopedSettings) {
          setting = scopedSettings[scope];
          this.set(setting, scope);
        }
      }

      this.set(settings);
    }
  }, {
    key: 'set',
    value: function set(settings, scope) {
      var flatSettings = {};
      var setting = undefined;
      var value = undefined;
      var valueOptions = undefined;
      var currentValue = undefined;
      var options = scope ? { scopeSelector: scope } : {};
      options.save = false;
      this.flatten(flatSettings, settings);

      for (setting in flatSettings) {
        value = flatSettings[setting];
        if (_underscorePlus2['default'].isArray(value)) {
          valueOptions = scope ? { scope: scope } : {};
          currentValue = atom.config.get(setting, valueOptions);
          value = _underscorePlus2['default'].union(currentValue, value);
        }

        atom.config.set(setting, value, options);
      }
    }
  }, {
    key: 'flatten',
    value: function flatten(root, dict, path) {
      var key = undefined;
      var value = undefined;
      var dotPath = undefined;
      var isObject = undefined;
      for (key in dict) {
        value = dict[key];
        dotPath = path ? path + '.' + key : key;
        isObject = !_underscorePlus2['default'].isArray(value) && _underscorePlus2['default'].isObject(value);

        if (isObject) {
          this.flatten(root, dict[key], dotPath);
        } else {
          root[dotPath] = value;
        }
      }
    }
  }]);

  return Settings;
})();

exports['default'] = Settings;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3NldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OEJBRWMsaUJBQWlCOzs7O0FBRi9CLFdBQVcsQ0FBQzs7SUFJUyxRQUFRO1dBQVIsUUFBUTswQkFBUixRQUFROzs7ZUFBUixRQUFROztXQUVyQixrQkFBYztVQUFiLFFBQVEseURBQUMsRUFBRTs7QUFDaEIsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNyQjs7O1dBRUcsZ0JBQWM7VUFBYixRQUFRLHlEQUFDLEVBQUU7O0FBRWQsVUFBSSxRQUFRLElBQUksUUFBUSxFQUFFO0FBQ3hCLGdCQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztBQUNoQyxlQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7T0FDeEI7O0FBRUQsVUFBSSxHQUFHLElBQUksUUFBUSxFQUFFO0FBQ25CLFlBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUM5QixnQkFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixlQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFM0IsWUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFlBQUksS0FBSyxZQUFBLENBQUM7QUFDVixhQUFLLEtBQUssSUFBSSxjQUFjLEVBQUU7QUFDNUIsaUJBQU8sR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsY0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDMUI7T0FDRjs7QUFFRCxVQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BCOzs7V0FFRSxhQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUU7QUFDbkIsVUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsVUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixVQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLFVBQUksT0FBTyxHQUFHLEtBQUssR0FBRyxFQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEQsYUFBTyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDckIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRXJDLFdBQUssT0FBTyxJQUFJLFlBQVksRUFBRTtBQUM1QixhQUFLLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLFlBQUksNEJBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3BCLHNCQUFZLEdBQUcsS0FBSyxHQUFHLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxHQUFHLEVBQUUsQ0FBQztBQUMzQyxzQkFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN0RCxlQUFLLEdBQUcsNEJBQUUsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0Qzs7QUFFRCxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQzFDO0tBQ0Y7OztXQUVNLGlCQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3hCLFVBQUksR0FBRyxZQUFBLENBQUM7QUFDUixVQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsVUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFVBQUksUUFBUSxZQUFBLENBQUM7QUFDYixXQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDaEIsYUFBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQixlQUFPLEdBQUcsSUFBSSxHQUFNLElBQUksU0FBSSxHQUFHLEdBQUssR0FBRyxDQUFDO0FBQ3hDLGdCQUFRLEdBQUcsQ0FBQyw0QkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksNEJBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVsRCxZQUFJLFFBQVEsRUFBRTtBQUNaLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN4QyxNQUFNO0FBQ0wsY0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztTQUN2QjtPQUNGO0tBQ0Y7OztTQW5Fa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL3Byb2plY3QtbWFuYWdlci9saWIvc2V0dGluZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0dGluZ3Mge1xuXG4gIHVwZGF0ZShzZXR0aW5ncz17fSkge1xuICAgIHRoaXMubG9hZChzZXR0aW5ncyk7XG4gIH1cblxuICBsb2FkKHNldHRpbmdzPXt9KSB7XG5cbiAgICBpZiAoJ2dsb2JhbCcgaW4gc2V0dGluZ3MpIHtcbiAgICAgIHNldHRpbmdzWycqJ10gPSBzZXR0aW5ncy5nbG9iYWw7XG4gICAgICBkZWxldGUgc2V0dGluZ3MuZ2xvYmFsO1xuICAgIH1cblxuICAgIGlmICgnKicgaW4gc2V0dGluZ3MpIHtcbiAgICAgIGxldCBzY29wZWRTZXR0aW5ncyA9IHNldHRpbmdzO1xuICAgICAgc2V0dGluZ3MgPSBzZXR0aW5nc1snKiddO1xuICAgICAgZGVsZXRlIHNjb3BlZFNldHRpbmdzWycqJ107XG5cbiAgICAgIGxldCBzZXR0aW5nO1xuICAgICAgbGV0IHNjb3BlO1xuICAgICAgZm9yIChzY29wZSBpbiBzY29wZWRTZXR0aW5ncykge1xuICAgICAgICBzZXR0aW5nID0gc2NvcGVkU2V0dGluZ3Nbc2NvcGVdO1xuICAgICAgICB0aGlzLnNldChzZXR0aW5nLCBzY29wZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZXQoc2V0dGluZ3MpO1xuICB9XG5cbiAgc2V0KHNldHRpbmdzLCBzY29wZSkge1xuICAgIGxldCBmbGF0U2V0dGluZ3MgPSB7fTtcbiAgICBsZXQgc2V0dGluZztcbiAgICBsZXQgdmFsdWU7XG4gICAgbGV0IHZhbHVlT3B0aW9ucztcbiAgICBsZXQgY3VycmVudFZhbHVlO1xuICAgIGxldCBvcHRpb25zID0gc2NvcGUgPyB7c2NvcGVTZWxlY3Rvcjogc2NvcGV9IDoge307XG4gICAgb3B0aW9ucy5zYXZlID0gZmFsc2U7XG4gICAgdGhpcy5mbGF0dGVuKGZsYXRTZXR0aW5ncywgc2V0dGluZ3MpO1xuXG4gICAgZm9yIChzZXR0aW5nIGluIGZsYXRTZXR0aW5ncykge1xuICAgICAgdmFsdWUgPSBmbGF0U2V0dGluZ3Nbc2V0dGluZ107XG4gICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZU9wdGlvbnMgPSBzY29wZSA/IHtzY29wZTogc2NvcGV9IDoge307XG4gICAgICAgIGN1cnJlbnRWYWx1ZSA9IGF0b20uY29uZmlnLmdldChzZXR0aW5nLCB2YWx1ZU9wdGlvbnMpO1xuICAgICAgICB2YWx1ZSA9IF8udW5pb24oY3VycmVudFZhbHVlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGF0b20uY29uZmlnLnNldChzZXR0aW5nLCB2YWx1ZSwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgZmxhdHRlbihyb290LCBkaWN0LCBwYXRoKSB7XG4gICAgbGV0IGtleTtcbiAgICBsZXQgdmFsdWU7XG4gICAgbGV0IGRvdFBhdGg7XG4gICAgbGV0IGlzT2JqZWN0O1xuICAgIGZvciAoa2V5IGluIGRpY3QpIHtcbiAgICAgIHZhbHVlID0gZGljdFtrZXldO1xuICAgICAgZG90UGF0aCA9IHBhdGggPyBgJHtwYXRofS4ke2tleX1gIDoga2V5O1xuICAgICAgaXNPYmplY3QgPSAhXy5pc0FycmF5KHZhbHVlKSAmJiBfLmlzT2JqZWN0KHZhbHVlKTtcblxuICAgICAgaWYgKGlzT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuZmxhdHRlbihyb290LCBkaWN0W2tleV0sIGRvdFBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdFtkb3RQYXRoXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/settings.js
