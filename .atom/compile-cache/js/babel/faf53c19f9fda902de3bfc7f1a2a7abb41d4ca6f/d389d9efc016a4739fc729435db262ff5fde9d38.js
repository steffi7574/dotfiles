Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _opener = require('../opener');

var _opener2 = _interopRequireDefault(_opener);

'use babel';

var PreviewOpener = (function (_Opener) {
  _inherits(PreviewOpener, _Opener);

  function PreviewOpener() {
    _classCallCheck(this, PreviewOpener);

    _get(Object.getPrototypeOf(PreviewOpener.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PreviewOpener, [{
    key: 'open',
    value: function open(filePath, texPath, lineNumber, callback) {
      // TODO: Nuke this?
      if (typeof texPath === 'function') {
        callback = texPath;
      }

      var command = 'open -g -a Preview.app "' + filePath + '"';
      if (!this.shouldOpenInBackground()) {
        command = command.replace(/\-g\s/, '');
      }

      _child_process2['default'].exec(command, function (error) {
        if (callback) {
          callback(error ? error.code : 0);
        }
      });
    }
  }]);

  return PreviewOpener;
})(_opener2['default']);

exports['default'] = PreviewOpener;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVycy9wcmV2aWV3LW9wZW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs2QkFFMEIsZUFBZTs7OztzQkFDdEIsV0FBVzs7OztBQUg5QixXQUFXLENBQUE7O0lBS1UsYUFBYTtZQUFiLGFBQWE7O1dBQWIsYUFBYTswQkFBYixhQUFhOzsrQkFBYixhQUFhOzs7ZUFBYixhQUFhOztXQUMzQixjQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTs7QUFFN0MsVUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7QUFDakMsZ0JBQVEsR0FBRyxPQUFPLENBQUE7T0FDbkI7O0FBRUQsVUFBSSxPQUFPLGdDQUE4QixRQUFRLE1BQUcsQ0FBQTtBQUNwRCxVQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUU7QUFDbEMsZUFBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO09BQ3ZDOztBQUVELGlDQUFjLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDckMsWUFBSSxRQUFRLEVBQUU7QUFDWixrQkFBUSxDQUFDLEFBQUMsS0FBSyxHQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUE7U0FDbkM7T0FDRixDQUFDLENBQUE7S0FDSDs7O1NBakJrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvbGliL29wZW5lcnMvcHJldmlldy1vcGVuZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IE9wZW5lciBmcm9tICcuLi9vcGVuZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByZXZpZXdPcGVuZXIgZXh0ZW5kcyBPcGVuZXIge1xuICBvcGVuIChmaWxlUGF0aCwgdGV4UGF0aCwgbGluZU51bWJlciwgY2FsbGJhY2spIHtcbiAgICAvLyBUT0RPOiBOdWtlIHRoaXM/XG4gICAgaWYgKHR5cGVvZiB0ZXhQYXRoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IHRleFBhdGhcbiAgICB9XG5cbiAgICBsZXQgY29tbWFuZCA9IGBvcGVuIC1nIC1hIFByZXZpZXcuYXBwIFwiJHtmaWxlUGF0aH1cImBcbiAgICBpZiAoIXRoaXMuc2hvdWxkT3BlbkluQmFja2dyb3VuZCgpKSB7XG4gICAgICBjb21tYW5kID0gY29tbWFuZC5yZXBsYWNlKC9cXC1nXFxzLywgJycpXG4gICAgfVxuXG4gICAgY2hpbGRfcHJvY2Vzcy5leGVjKGNvbW1hbmQsIChlcnJvcikgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKChlcnJvcikgPyBlcnJvci5jb2RlIDogMClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/openers/preview-opener.js
