Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _csonParser = require('cson-parser');

var _csonParser2 = _interopRequireDefault(_csonParser);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

function getConfig(file) {
  var realFile = _fs2['default'].realpathSync(file);
  delete require.cache[realFile];
  switch (_path2['default'].extname(file)) {
    case '.json':
      return require(realFile);

    case '.cson':
      return _csonParser2['default'].parse(_fs2['default'].readFileSync(realFile));

    case '.yml':
      return _jsYaml2['default'].safeLoad(_fs2['default'].readFileSync(realFile));
  }
}

function createBuildConfig(build, name) {
  return {
    name: 'Custom: ' + name,
    exec: build.cmd,
    env: build.env,
    args: build.args,
    cwd: build.cwd,
    sh: build.sh,
    errorMatch: build.errorMatch,
    keymap: build.keymap
  };
}

var CustomFile = (function (_EventEmitter) {
  _inherits(CustomFile, _EventEmitter);

  function CustomFile(cwd) {
    _classCallCheck(this, CustomFile);

    _get(Object.getPrototypeOf(CustomFile.prototype), 'constructor', this).call(this);
    this.cwd = cwd;
    this.fileWatchers = [];
  }

  _createClass(CustomFile, [{
    key: 'destructor',
    value: function destructor() {
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
    }
  }, {
    key: 'getNiceName',
    value: function getNiceName() {
      return 'Custom file';
    }
  }, {
    key: 'isEligible',
    value: function isEligible() {
      var _this = this;

      this.files = ['.atom-build.json', '.atom-build.cson', '.atom-build.yml'].map(function (file) {
        return _path2['default'].join(_this.cwd, file);
      }).filter(_fs2['default'].existsSync);
      return 0 < this.files.length;
    }
  }, {
    key: 'settings',
    value: function settings() {
      var _this2 = this;

      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
      this.fileWatchers = this.files.map(function (file) {
        return _fs2['default'].watch(file, function () {
          return _this2.emit('refresh');
        });
      });

      var config = [];
      this.files.map(getConfig).forEach(function (build) {
        config.push.apply(config, [createBuildConfig(build, build.name || 'default')].concat(_toConsumableArray(_lodash2['default'].map(build.targets, function (target, name) {
          return createBuildConfig(target, name);
        }))));
      });

      return config;
    }
  }]);

  return CustomFile;
})(_events2['default']);

exports['default'] = CustomFile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYXRvbS1idWlsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQUVpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7c0JBQ0wsUUFBUTs7OzswQkFDTCxhQUFhOzs7O3NCQUNiLFNBQVM7Ozs7c0JBQ0QsUUFBUTs7OztBQVBqQyxXQUFXLENBQUM7O0FBU1osU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLE1BQU0sUUFBUSxHQUFHLGdCQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxTQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsVUFBUSxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3hCLFNBQUssT0FBTztBQUNWLGFBQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUFBLEFBRTNCLFNBQUssT0FBTztBQUNWLGFBQU8sd0JBQUssS0FBSyxDQUFDLGdCQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOztBQUFBLEFBRS9DLFNBQUssTUFBTTtBQUNULGFBQU8sb0JBQUssUUFBUSxDQUFDLGdCQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQUEsR0FDbkQ7Q0FDRjs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDdEMsU0FBTztBQUNMLFFBQUksRUFBRSxVQUFVLEdBQUcsSUFBSTtBQUN2QixRQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFDZixPQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFDZCxRQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7QUFDaEIsT0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO0FBQ2QsTUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ1osY0FBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO0FBQzVCLFVBQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtHQUNyQixDQUFDO0NBQ0g7O0lBRW9CLFVBQVU7WUFBVixVQUFVOztBQUNsQixXQURRLFVBQVUsQ0FDakIsR0FBRyxFQUFFOzBCQURFLFVBQVU7O0FBRTNCLCtCQUZpQixVQUFVLDZDQUVuQjtBQUNSLFFBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7R0FDeEI7O2VBTGtCLFVBQVU7O1dBT25CLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO2VBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtPQUFBLENBQUMsQ0FBQztLQUM3Qzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLGFBQWEsQ0FBQztLQUN0Qjs7O1dBRVMsc0JBQUc7OztBQUNYLFVBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsQ0FBRSxDQUN2RSxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQUksa0JBQUssSUFBSSxDQUFDLE1BQUssR0FBRyxFQUFFLElBQUksQ0FBQztPQUFBLENBQUMsQ0FDdEMsTUFBTSxDQUFDLGdCQUFHLFVBQVUsQ0FBQyxDQUFDO0FBQ3pCLGFBQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0tBQzlCOzs7V0FFTyxvQkFBRzs7O0FBQ1QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO2VBQUksRUFBRSxDQUFDLEtBQUssRUFBRTtPQUFBLENBQUMsQ0FBQztBQUM1QyxVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLGdCQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUU7aUJBQU0sT0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQUEsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFdkYsVUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN6QyxjQUFNLENBQUMsSUFBSSxNQUFBLENBQVgsTUFBTSxHQUNKLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyw0QkFDOUMsb0JBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBQyxNQUFNLEVBQUUsSUFBSTtpQkFBSyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO1NBQUEsQ0FBQyxHQUMzRSxDQUFDO09BQ0gsQ0FBQyxDQUFDOztBQUVILGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztTQW5Da0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9hdG9tLWJ1aWxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgQ1NPTiBmcm9tICdjc29uLXBhcnNlcic7XG5pbXBvcnQgeWFtbCBmcm9tICdqcy15YW1sJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcblxuZnVuY3Rpb24gZ2V0Q29uZmlnKGZpbGUpIHtcbiAgY29uc3QgcmVhbEZpbGUgPSBmcy5yZWFscGF0aFN5bmMoZmlsZSk7XG4gIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlYWxGaWxlXTtcbiAgc3dpdGNoIChwYXRoLmV4dG5hbWUoZmlsZSkpIHtcbiAgICBjYXNlICcuanNvbic6XG4gICAgICByZXR1cm4gcmVxdWlyZShyZWFsRmlsZSk7XG5cbiAgICBjYXNlICcuY3Nvbic6XG4gICAgICByZXR1cm4gQ1NPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocmVhbEZpbGUpKTtcblxuICAgIGNhc2UgJy55bWwnOlxuICAgICAgcmV0dXJuIHlhbWwuc2FmZUxvYWQoZnMucmVhZEZpbGVTeW5jKHJlYWxGaWxlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVpbGRDb25maWcoYnVpbGQsIG5hbWUpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnQ3VzdG9tOiAnICsgbmFtZSxcbiAgICBleGVjOiBidWlsZC5jbWQsXG4gICAgZW52OiBidWlsZC5lbnYsXG4gICAgYXJnczogYnVpbGQuYXJncyxcbiAgICBjd2Q6IGJ1aWxkLmN3ZCxcbiAgICBzaDogYnVpbGQuc2gsXG4gICAgZXJyb3JNYXRjaDogYnVpbGQuZXJyb3JNYXRjaCxcbiAgICBrZXltYXA6IGJ1aWxkLmtleW1hcFxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXN0b21GaWxlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB0aGlzLmZpbGVXYXRjaGVycyA9IFtdO1xuICB9XG5cbiAgZGVzdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmZpbGVXYXRjaGVycy5mb3JFYWNoKGZ3ID0+IGZ3LmNsb3NlKCkpO1xuICB9XG5cbiAgZ2V0TmljZU5hbWUoKSB7XG4gICAgcmV0dXJuICdDdXN0b20gZmlsZSc7XG4gIH1cblxuICBpc0VsaWdpYmxlKCkge1xuICAgIHRoaXMuZmlsZXMgPSBbICcuYXRvbS1idWlsZC5qc29uJywgJy5hdG9tLWJ1aWxkLmNzb24nLCAnLmF0b20tYnVpbGQueW1sJyBdXG4gICAgICAubWFwKGZpbGUgPT4gcGF0aC5qb2luKHRoaXMuY3dkLCBmaWxlKSlcbiAgICAgIC5maWx0ZXIoZnMuZXhpc3RzU3luYyk7XG4gICAgcmV0dXJuIDAgPCB0aGlzLmZpbGVzLmxlbmd0aDtcbiAgfVxuXG4gIHNldHRpbmdzKCkge1xuICAgIHRoaXMuZmlsZVdhdGNoZXJzLmZvckVhY2goZncgPT4gZncuY2xvc2UoKSk7XG4gICAgdGhpcy5maWxlV2F0Y2hlcnMgPSB0aGlzLmZpbGVzLm1hcChmaWxlID0+IGZzLndhdGNoKGZpbGUsICgpID0+IHRoaXMuZW1pdCgncmVmcmVzaCcpKSk7XG5cbiAgICBjb25zdCBjb25maWcgPSBbXTtcbiAgICB0aGlzLmZpbGVzLm1hcChnZXRDb25maWcpLmZvckVhY2goYnVpbGQgPT4ge1xuICAgICAgY29uZmlnLnB1c2goXG4gICAgICAgIGNyZWF0ZUJ1aWxkQ29uZmlnKGJ1aWxkLCBidWlsZC5uYW1lIHx8ICdkZWZhdWx0JyksXG4gICAgICAgIC4uLl8ubWFwKGJ1aWxkLnRhcmdldHMsICh0YXJnZXQsIG5hbWUpID0+IGNyZWF0ZUJ1aWxkQ29uZmlnKHRhcmdldCwgbmFtZSkpXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/build/lib/atom-build.js
