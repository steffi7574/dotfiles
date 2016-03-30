Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @jsx etch.dom */

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _etch = require('etch');

var _etch2 = _interopRequireDefault(_etch);

'use babel';
var ErrorIndicator = (function () {
  function ErrorIndicator(model) {
    _classCallCheck(this, ErrorIndicator);

    this.model = model;

    _etch2['default'].createElement(this);
    this.subscribeToEvents();
  }

  _createClass(ErrorIndicator, [{
    key: 'render',
    value: function render() {
      return _etch2['default'].dom(
        'div',
        { className: 'latex-error-indicator inline-block' },
        _etch2['default'].dom(
          'a',
          null,
          'LaTeX compilation error'
        )
      );
    }
  }, {
    key: 'subscribeToEvents',
    value: function subscribeToEvents() {
      var _this = this;

      var clickHandler = function clickHandler() {
        return _this.openLogFile();
      };
      this.element.querySelector('a').addEventListener('click', clickHandler);
    }
  }, {
    key: 'openLogFile',
    value: function openLogFile() {
      var _this2 = this;

      if (!this.model) {
        return;
      }

      atom.workspace.open(this.model.logFilePath).then(function (editor) {
        var position = _this2.getFirstErrorPosition();
        editor.scrollToBufferPosition(position, { center: true });
      });
    }
  }, {
    key: 'getFirstErrorPosition',
    value: function getFirstErrorPosition() {
      var position = _lodash2['default'].first(_lodash2['default'].pluck(this.model.errors, 'logPosition'));
      return position || [0, 0];
    }
  }]);

  return ErrorIndicator;
})();

exports['default'] = ErrorIndicator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvc3RhdHVzLWJhci9lcnJvci1pbmRpY2F0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3NCQUdjLFFBQVE7Ozs7b0JBQ0wsTUFBTTs7OztBQUp2QixXQUFXLENBQUE7SUFNVSxjQUFjO0FBQ3JCLFdBRE8sY0FBYyxDQUNwQixLQUFLLEVBQUU7MEJBREQsY0FBYzs7QUFFL0IsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7O0FBRWxCLHNCQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixRQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtHQUN6Qjs7ZUFOa0IsY0FBYzs7V0FRMUIsa0JBQUc7QUFDUixhQUNFOztVQUFLLFNBQVMsRUFBQyxvQ0FBb0M7UUFDakQ7Ozs7U0FBOEI7T0FDMUIsQ0FDUDtLQUNGOzs7V0FFaUIsNkJBQUc7OztBQUNuQixVQUFNLFlBQVksR0FBRyxTQUFmLFlBQVk7ZUFBUyxNQUFLLFdBQVcsRUFBRTtPQUFBLENBQUE7QUFDN0MsVUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFBO0tBQ3hFOzs7V0FFVyx1QkFBRzs7O0FBQ2IsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFBRSxlQUFNO09BQUU7O0FBRTNCLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ3pELFlBQU0sUUFBUSxHQUFHLE9BQUsscUJBQXFCLEVBQUUsQ0FBQTtBQUM3QyxjQUFNLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUE7T0FDeEQsQ0FBQyxDQUFBO0tBQ0g7OztXQUVxQixpQ0FBRztBQUN2QixVQUFNLFFBQVEsR0FBRyxvQkFBRSxLQUFLLENBQUMsb0JBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUE7QUFDbkUsYUFBTyxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDMUI7OztTQWpDa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9zdGF0dXMtYmFyL2Vycm9yLWluZGljYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgZXRjaCBmcm9tICdldGNoJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvckluZGljYXRvciB7XG4gIGNvbnN0cnVjdG9yIChtb2RlbCkge1xuICAgIHRoaXMubW9kZWwgPSBtb2RlbFxuXG4gICAgZXRjaC5jcmVhdGVFbGVtZW50KHRoaXMpXG4gICAgdGhpcy5zdWJzY3JpYmVUb0V2ZW50cygpXG4gIH1cblxuICByZW5kZXIgKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0nbGF0ZXgtZXJyb3ItaW5kaWNhdG9yIGlubGluZS1ibG9jayc+XG4gICAgICAgIDxhPkxhVGVYIGNvbXBpbGF0aW9uIGVycm9yPC9hPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9FdmVudHMgKCkge1xuICAgIGNvbnN0IGNsaWNrSGFuZGxlciA9ICgpID0+IHRoaXMub3BlbkxvZ0ZpbGUoKVxuICAgIHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdhJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbGlja0hhbmRsZXIpXG4gIH1cblxuICBvcGVuTG9nRmlsZSAoKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsKSB7IHJldHVybiB9XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMubW9kZWwubG9nRmlsZVBhdGgpLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nZXRGaXJzdEVycm9yUG9zaXRpb24oKVxuICAgICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24ocG9zaXRpb24sIHtjZW50ZXI6IHRydWV9KVxuICAgIH0pXG4gIH1cblxuICBnZXRGaXJzdEVycm9yUG9zaXRpb24gKCkge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gXy5maXJzdChfLnBsdWNrKHRoaXMubW9kZWwuZXJyb3JzLCAnbG9nUG9zaXRpb24nKSlcbiAgICByZXR1cm4gcG9zaXRpb24gfHwgWzAsIDBdXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/status-bar/error-indicator.js
