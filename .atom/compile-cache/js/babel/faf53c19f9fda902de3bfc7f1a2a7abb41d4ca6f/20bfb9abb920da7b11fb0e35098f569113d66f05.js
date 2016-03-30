Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @jsx etch.dom */

var _etch = require('etch');

var _etch2 = _interopRequireDefault(_etch);

'use babel';
var ProgressIndicator = (function () {
  function ProgressIndicator() {
    _classCallCheck(this, ProgressIndicator);

    _etch2['default'].createElement(this);
  }

  _createClass(ProgressIndicator, [{
    key: 'render',
    value: function render() {
      return _etch2['default'].dom(
        'div',
        { className: 'latex-progress-indicator inline-block' },
        _etch2['default'].dom(
          'span',
          { className: 'inline-block' },
          'Compiling TeX file'
        ),
        _etch2['default'].dom(
          'span',
          { className: 'dot one' },
          '.'
        ),
        _etch2['default'].dom(
          'span',
          { className: 'dot two' },
          '.'
        ),
        _etch2['default'].dom(
          'span',
          { className: 'dot three' },
          '.'
        )
      );
    }
  }]);

  return ProgressIndicator;
})();

exports['default'] = ProgressIndicator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvc3RhdHVzLWJhci9wcm9ncmVzcy1pbmRpY2F0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O29CQUdpQixNQUFNOzs7O0FBSHZCLFdBQVcsQ0FBQTtJQUtVLGlCQUFpQjtBQUN4QixXQURPLGlCQUFpQixHQUNyQjswQkFESSxpQkFBaUI7O0FBRWxDLHNCQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUN6Qjs7ZUFIa0IsaUJBQWlCOztXQUs3QixrQkFBRztBQUNSLGFBQ0U7O1VBQUssU0FBUyxFQUFDLHVDQUF1QztRQUNwRDs7WUFBTSxTQUFTLEVBQUMsY0FBYzs7U0FBMEI7UUFDeEQ7O1lBQU0sU0FBUyxFQUFDLFNBQVM7O1NBQVM7UUFDbEM7O1lBQU0sU0FBUyxFQUFDLFNBQVM7O1NBQVM7UUFDbEM7O1lBQU0sU0FBUyxFQUFDLFdBQVc7O1NBQVM7T0FDaEMsQ0FDUDtLQUNGOzs7U0Fka0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvbGliL3N0YXR1cy1iYXIvcHJvZ3Jlc3MtaW5kaWNhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2dyZXNzSW5kaWNhdG9yIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIGV0Y2guY3JlYXRlRWxlbWVudCh0aGlzKVxuICB9XG5cbiAgcmVuZGVyICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2xhdGV4LXByb2dyZXNzLWluZGljYXRvciBpbmxpbmUtYmxvY2snPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2lubGluZS1ibG9jayc+Q29tcGlsaW5nIFRlWCBmaWxlPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2RvdCBvbmUnPi48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nZG90IHR3byc+Ljwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdkb3QgdGhyZWUnPi48L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/status-bar/progress-indicator.js
