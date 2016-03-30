Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _werkzeug = require('../werkzeug');

'use babel';

var ConsoleLogger = (function (_Logger) {
  _inherits(ConsoleLogger, _Logger);

  function ConsoleLogger() {
    _classCallCheck(this, ConsoleLogger);

    _get(Object.getPrototypeOf(ConsoleLogger.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ConsoleLogger, [{
    key: 'error',
    value: function error(statusCode, result, builder) {
      console.group('LaTeX errors');
      switch (statusCode) {
        case 127:
          var executable = builder.executable;
          console.log((0, _werkzeug.heredoc)('\n          %cTeXification failed! Builder executable \'' + executable + '\' not found.\n\n            latex.texPath\n              as configured: ' + atom.config.get('latex.texPath') + '\n              when resolved: ' + builder.constructPath() + '\n\n          Make sure latex.texPath is configured correctly either adjust it           via the settings view, or directly in your config.cson file.\n          '), 'color: red');
          break;

        default:
          if (result && result.errors) {
            console.group('TeXification failed with status code ' + statusCode);
            for (var error of result.errors) {
              console.log('%c' + error.filePath + ':' + error.lineNumber + ': ' + error.message, 'color: red');
            }
            console.groupEnd();
          } else {
            console.log('%cTeXification failed with status code ' + statusCode, 'color: red');
          }
      }
      console.groupEnd();
    }
  }, {
    key: 'warning',
    value: function warning(message) {
      console.group('LaTeX warnings');
      console.log(message);
      console.groupEnd();
    }
  }]);

  return ConsoleLogger;
})(_logger2['default']);

exports['default'] = ConsoleLogger;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvbG9nZ2Vycy9jb25zb2xlLWxvZ2dlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFbUIsV0FBVzs7Ozt3QkFDUixhQUFhOztBQUhuQyxXQUFXLENBQUE7O0lBS1UsYUFBYTtZQUFiLGFBQWE7O1dBQWIsYUFBYTswQkFBYixhQUFhOzsrQkFBYixhQUFhOzs7ZUFBYixhQUFhOztXQUMxQixlQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2xDLGFBQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDN0IsY0FBUSxVQUFVO0FBQ2hCLGFBQUssR0FBRztBQUNOLGNBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7QUFDckMsaUJBQU8sQ0FBQyxHQUFHLENBQUMsb0ZBQ21DLFVBQVUsaUZBR2xDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyx1Q0FDaEMsT0FBTyxDQUFDLGFBQWEsRUFBRSx1S0FJMUMsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUNuQixnQkFBSzs7QUFBQSxBQUVQO0FBQ0UsY0FBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUMzQixtQkFBTyxDQUFDLEtBQUssMkNBQXlDLFVBQVUsQ0FBRyxDQUFBO0FBQ25FLGlCQUFLLElBQU0sS0FBSyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDakMscUJBQU8sQ0FBQyxHQUFHLFFBQU0sS0FBSyxDQUFDLFFBQVEsU0FBSSxLQUFLLENBQUMsVUFBVSxVQUFLLEtBQUssQ0FBQyxPQUFPLEVBQUksWUFBWSxDQUFDLENBQUE7YUFDdkY7QUFDRCxtQkFBTyxDQUFDLFFBQVEsRUFBRSxDQUFBO1dBQ25CLE1BQU07QUFDTCxtQkFBTyxDQUFDLEdBQUcsNkNBQTJDLFVBQVUsRUFBSSxZQUFZLENBQUMsQ0FBQTtXQUNsRjtBQUFBLE9BQ0o7QUFDRCxhQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7S0FDbkI7OztXQUVPLGlCQUFDLE9BQU8sRUFBRTtBQUNoQixhQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFDL0IsYUFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQixhQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7S0FDbkI7OztTQXBDa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9sb2dnZXJzL2NvbnNvbGUtbG9nZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IExvZ2dlciBmcm9tICcuLi9sb2dnZXInXG5pbXBvcnQge2hlcmVkb2N9IGZyb20gJy4uL3dlcmt6ZXVnJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25zb2xlTG9nZ2VyIGV4dGVuZHMgTG9nZ2VyIHtcbiAgZXJyb3IgKHN0YXR1c0NvZGUsIHJlc3VsdCwgYnVpbGRlcikge1xuICAgIGNvbnNvbGUuZ3JvdXAoJ0xhVGVYIGVycm9ycycpXG4gICAgc3dpdGNoIChzdGF0dXNDb2RlKSB7XG4gICAgICBjYXNlIDEyNzpcbiAgICAgICAgY29uc3QgZXhlY3V0YWJsZSA9IGJ1aWxkZXIuZXhlY3V0YWJsZVxuICAgICAgICBjb25zb2xlLmxvZyhoZXJlZG9jKGBcbiAgICAgICAgICAlY1RlWGlmaWNhdGlvbiBmYWlsZWQhIEJ1aWxkZXIgZXhlY3V0YWJsZSAnJHtleGVjdXRhYmxlfScgbm90IGZvdW5kLlxuXG4gICAgICAgICAgICBsYXRleC50ZXhQYXRoXG4gICAgICAgICAgICAgIGFzIGNvbmZpZ3VyZWQ6ICR7YXRvbS5jb25maWcuZ2V0KCdsYXRleC50ZXhQYXRoJyl9XG4gICAgICAgICAgICAgIHdoZW4gcmVzb2x2ZWQ6ICR7YnVpbGRlci5jb25zdHJ1Y3RQYXRoKCl9XG5cbiAgICAgICAgICBNYWtlIHN1cmUgbGF0ZXgudGV4UGF0aCBpcyBjb25maWd1cmVkIGNvcnJlY3RseSBlaXRoZXIgYWRqdXN0IGl0IFxcXG4gICAgICAgICAgdmlhIHRoZSBzZXR0aW5ncyB2aWV3LCBvciBkaXJlY3RseSBpbiB5b3VyIGNvbmZpZy5jc29uIGZpbGUuXG4gICAgICAgICAgYCksICdjb2xvcjogcmVkJylcbiAgICAgICAgYnJlYWtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuZXJyb3JzKSB7XG4gICAgICAgICAgY29uc29sZS5ncm91cChgVGVYaWZpY2F0aW9uIGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICR7c3RhdHVzQ29kZX1gKVxuICAgICAgICAgIGZvciAoY29uc3QgZXJyb3Igb2YgcmVzdWx0LmVycm9ycykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCVjJHtlcnJvci5maWxlUGF0aH06JHtlcnJvci5saW5lTnVtYmVyfTogJHtlcnJvci5tZXNzYWdlfWAsICdjb2xvcjogcmVkJylcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5ncm91cEVuZCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCVjVGVYaWZpY2F0aW9uIGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICR7c3RhdHVzQ29kZX1gLCAnY29sb3I6IHJlZCcpXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5ncm91cEVuZCgpXG4gIH1cblxuICB3YXJuaW5nIChtZXNzYWdlKSB7XG4gICAgY29uc29sZS5ncm91cCgnTGFUZVggd2FybmluZ3MnKVxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpXG4gICAgY29uc29sZS5ncm91cEVuZCgpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/loggers/console-logger.js
