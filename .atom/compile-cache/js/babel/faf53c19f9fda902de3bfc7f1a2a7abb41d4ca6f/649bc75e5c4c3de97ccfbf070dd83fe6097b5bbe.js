'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Opener = (function () {
  function Opener() {
    _classCallCheck(this, Opener);
  }

  _createClass(Opener, [{
    key: 'open',
    value: function open() /* filePath, texPath, lineNumber, callback */{}
  }, {
    key: 'shouldOpenInBackground',
    value: function shouldOpenInBackground() {
      return atom.config.get('latex.openResultInBackground');
    }
  }]);

  return Opener;
})();

exports['default'] = Opener;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztJQUVVLE1BQU07V0FBTixNQUFNOzBCQUFOLE1BQU07OztlQUFOLE1BQU07O1dBQ3BCLDZEQUFnRCxFQUFFOzs7V0FFaEMsa0NBQUc7QUFDeEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO0tBQ3ZEOzs7U0FMa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9vcGVuZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcGVuZXIge1xuICBvcGVuICgvKiBmaWxlUGF0aCwgdGV4UGF0aCwgbGluZU51bWJlciwgY2FsbGJhY2sgKi8pIHt9XG5cbiAgc2hvdWxkT3BlbkluQmFja2dyb3VuZCAoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGF0ZXgub3BlblJlc3VsdEluQmFja2dyb3VuZCcpXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/opener.js
