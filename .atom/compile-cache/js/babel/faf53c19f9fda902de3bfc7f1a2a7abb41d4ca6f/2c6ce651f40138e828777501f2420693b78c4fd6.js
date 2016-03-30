'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Logger = (function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, [{
    key: 'error',
    value: function error() /* statusCode, result, builder */{}
  }, {
    key: 'warning',
    value: function warning() /* message */{}
  }, {
    key: 'info',
    value: function info() /* message */{}
  }]);

  return Logger;
})();

exports['default'] = Logger;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvbG9nZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztJQUVVLE1BQU07V0FBTixNQUFNOzBCQUFOLE1BQU07OztlQUFOLE1BQU07O1dBQ25CLGtEQUFvQyxFQUFFOzs7V0FDcEMsZ0NBQWdCLEVBQUU7OztXQUNyQiw2QkFBZ0IsRUFBRTs7O1NBSEosTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9sb2dnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dnZXIge1xuICBlcnJvciAoLyogc3RhdHVzQ29kZSwgcmVzdWx0LCBidWlsZGVyICovKSB7fVxuICB3YXJuaW5nICgvKiBtZXNzYWdlICovKSB7fVxuICBpbmZvICgvKiBtZXNzYWdlICovKSB7fVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/logger.js
