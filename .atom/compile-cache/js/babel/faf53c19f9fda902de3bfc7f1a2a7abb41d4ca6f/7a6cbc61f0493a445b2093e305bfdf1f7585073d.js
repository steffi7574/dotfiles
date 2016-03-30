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

var SumatraOpener = (function (_Opener) {
  _inherits(SumatraOpener, _Opener);

  function SumatraOpener() {
    _classCallCheck(this, SumatraOpener);

    _get(Object.getPrototypeOf(SumatraOpener.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SumatraOpener, [{
    key: 'open',
    value: function open(filePath, texPath, lineNumber, callback) {
      var sumatraPath = '"' + atom.config.get('latex.sumatraPath') + '"';
      var args = ['-reuse-instance', '-forward-search', '"' + texPath + '"', '"' + lineNumber + '"', '"' + filePath + '"'];

      var command = sumatraPath + ' ' + args.join(' ');

      _child_process2['default'].exec(command, function (error) {
        if (callback) {
          callback(error ? error.code : 0);
        }
      });
    }
  }]);

  return SumatraOpener;
})(_opener2['default']);

exports['default'] = SumatraOpener;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVycy9zdW1hdHJhLW9wZW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs2QkFFMEIsZUFBZTs7OztzQkFDdEIsV0FBVzs7OztBQUg5QixXQUFXLENBQUE7O0lBS1UsYUFBYTtZQUFiLGFBQWE7O1dBQWIsYUFBYTswQkFBYixhQUFhOzsrQkFBYixhQUFhOzs7ZUFBYixhQUFhOztXQUMzQixjQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtBQUM3QyxVQUFNLFdBQVcsU0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFHLENBQUE7QUFDL0QsVUFBTSxJQUFJLEdBQUcsQ0FDWCxpQkFBaUIsRUFDakIsaUJBQWlCLFFBQ2IsT0FBTyxjQUNQLFVBQVUsY0FDVixRQUFRLE9BQ2IsQ0FBQTs7QUFFRCxVQUFNLE9BQU8sR0FBTSxXQUFXLFNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBRSxDQUFBOztBQUVsRCxpQ0FBYyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3JDLFlBQUksUUFBUSxFQUFFO0FBQ1osa0JBQVEsQ0FBQyxBQUFDLEtBQUssR0FBSSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ25DO09BQ0YsQ0FBQyxDQUFBO0tBQ0g7OztTQWxCa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9vcGVuZXJzL3N1bWF0cmEtb3BlbmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBPcGVuZXIgZnJvbSAnLi4vb3BlbmVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdW1hdHJhT3BlbmVyIGV4dGVuZHMgT3BlbmVyIHtcbiAgb3BlbiAoZmlsZVBhdGgsIHRleFBhdGgsIGxpbmVOdW1iZXIsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgc3VtYXRyYVBhdGggPSBgXCIke2F0b20uY29uZmlnLmdldCgnbGF0ZXguc3VtYXRyYVBhdGgnKX1cImBcbiAgICBjb25zdCBhcmdzID0gW1xuICAgICAgJy1yZXVzZS1pbnN0YW5jZScsXG4gICAgICAnLWZvcndhcmQtc2VhcmNoJyxcbiAgICAgIGBcIiR7dGV4UGF0aH1cImAsXG4gICAgICBgXCIke2xpbmVOdW1iZXJ9XCJgLFxuICAgICAgYFwiJHtmaWxlUGF0aH1cImBcbiAgICBdXG5cbiAgICBjb25zdCBjb21tYW5kID0gYCR7c3VtYXRyYVBhdGh9ICR7YXJncy5qb2luKCcgJyl9YFxuXG4gICAgY2hpbGRfcHJvY2Vzcy5leGVjKGNvbW1hbmQsIChlcnJvcikgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKChlcnJvcikgPyBlcnJvci5jb2RlIDogMClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/openers/sumatra-opener.js
