Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _opener = require('../opener');

var _opener2 = _interopRequireDefault(_opener);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

'use babel';

var CustomOpener = (function (_Opener) {
  _inherits(CustomOpener, _Opener);

  function CustomOpener() {
    _classCallCheck(this, CustomOpener);

    _get(Object.getPrototypeOf(CustomOpener.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CustomOpener, [{
    key: 'open',

    // Custom PDF viewer cannot support texPath and lineNumber
    value: function open(filePath, texPath, lineNumber, callback) {
      var command = '"' + atom.config.get('latex.viewerPath') + '" "' + filePath + '"';

      _child_process2['default'].exec(command, function (error) {
        if (callback) {
          callback(error ? error.code : 0);
        }
      });
    }
  }]);

  return CustomOpener;
})(_opener2['default']);

exports['default'] = CustomOpener;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVycy9jdXN0b20tb3BlbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3NCQUVtQixXQUFXOzs7OzZCQUNKLGVBQWU7Ozs7QUFIekMsV0FBVyxDQUFBOztJQUtVLFlBQVk7WUFBWixZQUFZOztXQUFaLFlBQVk7MEJBQVosWUFBWTs7K0JBQVosWUFBWTs7O2VBQVosWUFBWTs7OztXQUUxQixjQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtBQUM3QyxVQUFNLE9BQU8sU0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFNLFFBQVEsTUFBRyxDQUFBOztBQUV4RSxpQ0FBYyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3JDLFlBQUksUUFBUSxFQUFFO0FBQ1osa0JBQVEsQ0FBQyxBQUFDLEtBQUssR0FBSSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ25DO09BQ0YsQ0FBQyxDQUFBO0tBQ0g7OztTQVZrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvbGliL29wZW5lcnMvY3VzdG9tLW9wZW5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBPcGVuZXIgZnJvbSAnLi4vb3BlbmVyJ1xuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tT3BlbmVyIGV4dGVuZHMgT3BlbmVyIHtcbiAgLy8gQ3VzdG9tIFBERiB2aWV3ZXIgY2Fubm90IHN1cHBvcnQgdGV4UGF0aCBhbmQgbGluZU51bWJlclxuICBvcGVuIChmaWxlUGF0aCwgdGV4UGF0aCwgbGluZU51bWJlciwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBjb21tYW5kID0gYFwiJHthdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LnZpZXdlclBhdGgnKX1cIiBcIiR7ZmlsZVBhdGh9XCJgXG5cbiAgICBjaGlsZF9wcm9jZXNzLmV4ZWMoY29tbWFuZCwgKGVycm9yKSA9PiB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soKGVycm9yKSA/IGVycm9yLmNvZGUgOiAwKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/openers/custom-opener.js
