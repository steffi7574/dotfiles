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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _builder = require('../builder');

var _builder2 = _interopRequireDefault(_builder);

'use babel';

var LatexmkBuilder = (function (_Builder) {
  _inherits(LatexmkBuilder, _Builder);

  function LatexmkBuilder() {
    _classCallCheck(this, LatexmkBuilder);

    _get(Object.getPrototypeOf(LatexmkBuilder.prototype), 'constructor', this).call(this);
    this.executable = 'latexmk';
  }

  _createClass(LatexmkBuilder, [{
    key: 'run',
    value: function run(filePath) {
      var args = this.constructArgs(filePath);
      var command = this.executable + ' ' + args.join(' ');
      var options = this.constructChildProcessOptions();

      options.cwd = _path2['default'].dirname(filePath); // Run process with sensible CWD.
      options.maxBuffer = 52428800; // Set process' max buffer size to 50 MB.
      options.env.max_print_line = 1000; // Max log file line length.

      return new Promise(function (resolve) {
        // TODO: Add support for killing the process.
        _child_process2['default'].exec(command, options, function (error) {
          resolve(error ? error.code : 0);
        });
      });
    }
  }, {
    key: 'constructArgs',
    value: function constructArgs(filePath) {
      var args = ['-interaction=nonstopmode', '-f', '-cd', '-pdf', '-synctex=1', '-file-line-error'];

      var enableShellEscape = atom.config.get('latex.enableShellEscape');
      var engineFromMagic = this.getLatexEngineFromMagic(filePath);
      var customEngine = atom.config.get('latex.customEngine');
      var engine = atom.config.get('latex.engine');

      if (enableShellEscape) {
        args.push('-shell-escape');
      }

      if (engineFromMagic) {
        args.push('-pdflatex="' + engineFromMagic + '"');
      } else if (customEngine) {
        args.push('-pdflatex="' + customEngine + '"');
      } else if (engine && engine !== 'pdflatex') {
        args.push('-' + engine);
      }

      var outdir = this.getOutputDirectory(filePath);
      if (outdir) {
        args.push('-outdir="' + outdir + '"');
      }

      args.push('"' + filePath + '"');
      return args;
    }
  }]);

  return LatexmkBuilder;
})(_builder2['default']);

exports['default'] = LatexmkBuilder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvYnVpbGRlcnMvbGF0ZXhtay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs2QkFFMEIsZUFBZTs7OztvQkFDeEIsTUFBTTs7Ozt1QkFDSCxZQUFZOzs7O0FBSmhDLFdBQVcsQ0FBQTs7SUFNVSxjQUFjO1lBQWQsY0FBYzs7QUFDckIsV0FETyxjQUFjLEdBQ2xCOzBCQURJLGNBQWM7O0FBRS9CLCtCQUZpQixjQUFjLDZDQUV4QjtBQUNQLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFBO0dBQzVCOztlQUprQixjQUFjOztXQU03QixhQUFDLFFBQVEsRUFBRTtBQUNiLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDekMsVUFBTSxPQUFPLEdBQU0sSUFBSSxDQUFDLFVBQVUsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxBQUFFLENBQUE7QUFDdEQsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUE7O0FBRW5ELGFBQU8sQ0FBQyxHQUFHLEdBQUcsa0JBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3BDLGFBQU8sQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFBO0FBQzVCLGFBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQTs7QUFFakMsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBSzs7QUFFOUIsbUNBQWMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDOUMsaUJBQU8sQ0FBQyxBQUFDLEtBQUssR0FBSSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQ2xDLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNIOzs7V0FFYSx1QkFBQyxRQUFRLEVBQUU7QUFDdkIsVUFBTSxJQUFJLEdBQUcsQ0FDWCwwQkFBMEIsRUFDMUIsSUFBSSxFQUNKLEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLGtCQUFrQixDQUNuQixDQUFBOztBQUVELFVBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQTtBQUNwRSxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUQsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUMxRCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTs7QUFFOUMsVUFBSSxpQkFBaUIsRUFBRTtBQUNyQixZQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO09BQzNCOztBQUVELFVBQUksZUFBZSxFQUFFO0FBQ25CLFlBQUksQ0FBQyxJQUFJLGlCQUFlLGVBQWUsT0FBSSxDQUFBO09BQzVDLE1BQU0sSUFBSSxZQUFZLEVBQUU7QUFDdkIsWUFBSSxDQUFDLElBQUksaUJBQWUsWUFBWSxPQUFJLENBQUE7T0FDekMsTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLEtBQUssVUFBVSxFQUFFO0FBQzFDLFlBQUksQ0FBQyxJQUFJLE9BQUssTUFBTSxDQUFHLENBQUE7T0FDeEI7O0FBRUQsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLFVBQUksTUFBTSxFQUFFO0FBQ1YsWUFBSSxDQUFDLElBQUksZUFBYSxNQUFNLE9BQUksQ0FBQTtPQUNqQzs7QUFFRCxVQUFJLENBQUMsSUFBSSxPQUFLLFFBQVEsT0FBSSxDQUFBO0FBQzFCLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztTQXpEa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9idWlsZGVycy9sYXRleG1rLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgQnVpbGRlciBmcm9tICcuLi9idWlsZGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXRleG1rQnVpbGRlciBleHRlbmRzIEJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuZXhlY3V0YWJsZSA9ICdsYXRleG1rJ1xuICB9XG5cbiAgcnVuIChmaWxlUGF0aCkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLmNvbnN0cnVjdEFyZ3MoZmlsZVBhdGgpXG4gICAgY29uc3QgY29tbWFuZCA9IGAke3RoaXMuZXhlY3V0YWJsZX0gJHthcmdzLmpvaW4oJyAnKX1gXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuY29uc3RydWN0Q2hpbGRQcm9jZXNzT3B0aW9ucygpXG5cbiAgICBvcHRpb25zLmN3ZCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCkgLy8gUnVuIHByb2Nlc3Mgd2l0aCBzZW5zaWJsZSBDV0QuXG4gICAgb3B0aW9ucy5tYXhCdWZmZXIgPSA1MjQyODgwMCAvLyBTZXQgcHJvY2VzcycgbWF4IGJ1ZmZlciBzaXplIHRvIDUwIE1CLlxuICAgIG9wdGlvbnMuZW52Lm1heF9wcmludF9saW5lID0gMTAwMCAvLyBNYXggbG9nIGZpbGUgbGluZSBsZW5ndGguXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIC8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBraWxsaW5nIHRoZSBwcm9jZXNzLlxuICAgICAgY2hpbGRfcHJvY2Vzcy5leGVjKGNvbW1hbmQsIG9wdGlvbnMsIChlcnJvcikgPT4ge1xuICAgICAgICByZXNvbHZlKChlcnJvcikgPyBlcnJvci5jb2RlIDogMClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0cnVjdEFyZ3MgKGZpbGVQYXRoKSB7XG4gICAgY29uc3QgYXJncyA9IFtcbiAgICAgICctaW50ZXJhY3Rpb249bm9uc3RvcG1vZGUnLFxuICAgICAgJy1mJyxcbiAgICAgICctY2QnLFxuICAgICAgJy1wZGYnLFxuICAgICAgJy1zeW5jdGV4PTEnLFxuICAgICAgJy1maWxlLWxpbmUtZXJyb3InXG4gICAgXVxuXG4gICAgY29uc3QgZW5hYmxlU2hlbGxFc2NhcGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LmVuYWJsZVNoZWxsRXNjYXBlJylcbiAgICBjb25zdCBlbmdpbmVGcm9tTWFnaWMgPSB0aGlzLmdldExhdGV4RW5naW5lRnJvbU1hZ2ljKGZpbGVQYXRoKVxuICAgIGNvbnN0IGN1c3RvbUVuZ2luZSA9IGF0b20uY29uZmlnLmdldCgnbGF0ZXguY3VzdG9tRW5naW5lJylcbiAgICBjb25zdCBlbmdpbmUgPSBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LmVuZ2luZScpXG5cbiAgICBpZiAoZW5hYmxlU2hlbGxFc2NhcGUpIHtcbiAgICAgIGFyZ3MucHVzaCgnLXNoZWxsLWVzY2FwZScpXG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZUZyb21NYWdpYykge1xuICAgICAgYXJncy5wdXNoKGAtcGRmbGF0ZXg9XCIke2VuZ2luZUZyb21NYWdpY31cImApXG4gICAgfSBlbHNlIGlmIChjdXN0b21FbmdpbmUpIHtcbiAgICAgIGFyZ3MucHVzaChgLXBkZmxhdGV4PVwiJHtjdXN0b21FbmdpbmV9XCJgKVxuICAgIH0gZWxzZSBpZiAoZW5naW5lICYmIGVuZ2luZSAhPT0gJ3BkZmxhdGV4Jykge1xuICAgICAgYXJncy5wdXNoKGAtJHtlbmdpbmV9YClcbiAgICB9XG5cbiAgICBsZXQgb3V0ZGlyID0gdGhpcy5nZXRPdXRwdXREaXJlY3RvcnkoZmlsZVBhdGgpXG4gICAgaWYgKG91dGRpcikge1xuICAgICAgYXJncy5wdXNoKGAtb3V0ZGlyPVwiJHtvdXRkaXJ9XCJgKVxuICAgIH1cblxuICAgIGFyZ3MucHVzaChgXCIke2ZpbGVQYXRofVwiYClcbiAgICByZXR1cm4gYXJnc1xuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/builders/latexmk.js
