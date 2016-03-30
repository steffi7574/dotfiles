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

var _werkzeug = require('../werkzeug');

var _opener = require('../opener');

var _opener2 = _interopRequireDefault(_opener);

'use babel';

var SkimOpener = (function (_Opener) {
  _inherits(SkimOpener, _Opener);

  function SkimOpener() {
    _classCallCheck(this, SkimOpener);

    _get(Object.getPrototypeOf(SkimOpener.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SkimOpener, [{
    key: 'open',
    value: function open(filePath, texPath, lineNumber, callback) {
      var skimPath = atom.config.get('latex.skimPath');
      var shouldActivate = !this.shouldOpenInBackground();
      var command = (0, _werkzeug.heredoc)('\n      osascript -e       "\n      set theLine to \\"' + lineNumber + '\\" as integer\n      set theFile to POSIX file \\"' + filePath + '\\"\n      set theSource to POSIX file \\"' + texPath + '\\"\n      set thePath to POSIX path of (theFile as alias)\n      tell application \\"' + skimPath + '\\"\n        if ' + shouldActivate + ' then activate\n        try\n          set theDocs to get documents whose path is thePath\n          if (count of theDocs) > 0 then revert theDocs\n        end try\n        open theFile\n        tell front document to go to TeX line theLine from theSource\n      end tell\n      "\n      ');

      _child_process2['default'].exec(command, function (error) {
        if (callback) {
          callback(error ? error.code : 0);
        }
      });
    }
  }]);

  return SkimOpener;
})(_opener2['default']);

exports['default'] = SkimOpener;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVycy9za2ltLW9wZW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs2QkFFMEIsZUFBZTs7Ozt3QkFDbkIsYUFBYTs7c0JBQ2hCLFdBQVc7Ozs7QUFKOUIsV0FBVyxDQUFBOztJQU1VLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7O2VBQVYsVUFBVTs7V0FDeEIsY0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUU7QUFDN0MsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUNsRCxVQUFNLGNBQWMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFBO0FBQ3JELFVBQU0sT0FBTyxHQUFHLGtGQUdPLFVBQVUsMkRBQ0MsUUFBUSxrREFDTixPQUFPLDhGQUVsQixRQUFRLHdCQUN4QixjQUFjLHNTQVNuQixDQUFBOztBQUVKLGlDQUFjLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDckMsWUFBSSxRQUFRLEVBQUU7QUFDWixrQkFBUSxDQUFDLEFBQUMsS0FBSyxHQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUE7U0FDbkM7T0FDRixDQUFDLENBQUE7S0FDSDs7O1NBNUJrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvbGliL29wZW5lcnMvc2tpbS1vcGVuZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHtoZXJlZG9jfSBmcm9tICcuLi93ZXJremV1ZydcbmltcG9ydCBPcGVuZXIgZnJvbSAnLi4vb3BlbmVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTa2ltT3BlbmVyIGV4dGVuZHMgT3BlbmVyIHtcbiAgb3BlbiAoZmlsZVBhdGgsIHRleFBhdGgsIGxpbmVOdW1iZXIsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgc2tpbVBhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LnNraW1QYXRoJylcbiAgICBjb25zdCBzaG91bGRBY3RpdmF0ZSA9ICF0aGlzLnNob3VsZE9wZW5JbkJhY2tncm91bmQoKVxuICAgIGNvbnN0IGNvbW1hbmQgPSBoZXJlZG9jKGBcbiAgICAgIG9zYXNjcmlwdCAtZSBcXFxuICAgICAgXCJcbiAgICAgIHNldCB0aGVMaW5lIHRvIFxcXFxcXFwiJHtsaW5lTnVtYmVyfVxcXFxcXFwiIGFzIGludGVnZXJcbiAgICAgIHNldCB0aGVGaWxlIHRvIFBPU0lYIGZpbGUgXFxcXFxcXCIke2ZpbGVQYXRofVxcXFxcXFwiXG4gICAgICBzZXQgdGhlU291cmNlIHRvIFBPU0lYIGZpbGUgXFxcXFxcXCIke3RleFBhdGh9XFxcXFxcXCJcbiAgICAgIHNldCB0aGVQYXRoIHRvIFBPU0lYIHBhdGggb2YgKHRoZUZpbGUgYXMgYWxpYXMpXG4gICAgICB0ZWxsIGFwcGxpY2F0aW9uIFxcXFxcXFwiJHtza2ltUGF0aH1cXFxcXFxcIlxuICAgICAgICBpZiAke3Nob3VsZEFjdGl2YXRlfSB0aGVuIGFjdGl2YXRlXG4gICAgICAgIHRyeVxuICAgICAgICAgIHNldCB0aGVEb2NzIHRvIGdldCBkb2N1bWVudHMgd2hvc2UgcGF0aCBpcyB0aGVQYXRoXG4gICAgICAgICAgaWYgKGNvdW50IG9mIHRoZURvY3MpID4gMCB0aGVuIHJldmVydCB0aGVEb2NzXG4gICAgICAgIGVuZCB0cnlcbiAgICAgICAgb3BlbiB0aGVGaWxlXG4gICAgICAgIHRlbGwgZnJvbnQgZG9jdW1lbnQgdG8gZ28gdG8gVGVYIGxpbmUgdGhlTGluZSBmcm9tIHRoZVNvdXJjZVxuICAgICAgZW5kIHRlbGxcbiAgICAgIFwiXG4gICAgICBgKVxuXG4gICAgY2hpbGRfcHJvY2Vzcy5leGVjKGNvbW1hbmQsIChlcnJvcikgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKChlcnJvcikgPyBlcnJvci5jb2RlIDogMClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/openers/skim-opener.js
