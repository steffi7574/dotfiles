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

var TexifyBuilder = (function (_Builder) {
  _inherits(TexifyBuilder, _Builder);

  function TexifyBuilder() {
    _classCallCheck(this, TexifyBuilder);

    _get(Object.getPrototypeOf(TexifyBuilder.prototype), 'constructor', this).call(this);
    this.executable = 'texify';
  }

  _createClass(TexifyBuilder, [{
    key: 'run',
    value: function run(filePath) {
      var args = this.constructArgs(filePath);
      var command = this.executable + ' ' + args.join(' ');
      var options = this.constructChildProcessOptions();

      options.cwd = _path2['default'].dirname(filePath); // Run process with sensible CWD.
      options.maxBuffer = 52428800; // Set process' max buffer size to 50 MB.

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
      var args = ['--batch', '--pdf', '--tex-option="--synctex=1"', '--tex-option="--interaction=nonstopmode"',
      // Set logfile max line length.
      '--tex-option="--max-print-line=1000"'];

      var enableShellEscape = atom.config.get('latex.enableShellEscape');
      var engineFromMagic = this.getLatexEngineFromMagic(filePath);
      var customEngine = atom.config.get('latex.customEngine');
      var engine = atom.config.get('latex.engine');

      if (enableShellEscape) {
        args.push('--tex-option=--enable-write18');
      }

      if (engineFromMagic) {
        args.push('--engine="' + engineFromMagic + '"');
      } else if (customEngine) {
        args.push('--engine="' + customEngine + '"');
      } else if (engine && engine === 'xelatex') {
        args.push('--engine=xetex');
      } else if (engine && engine === 'lualatex') {
        args.push('--engine=luatex');
      }

      var outdir = this.getOutputDirectory(filePath);
      if (outdir) {
        atom.notifications.addWarning('Output directory functionality is poorly supported by texify, ' + 'so this functionality is disabled (for the foreseeable future) ' + 'when using the texify builder.');
      }

      args.push('"' + filePath + '"');
      return args;
    }
  }]);

  return TexifyBuilder;
})(_builder2['default']);

exports['default'] = TexifyBuilder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvYnVpbGRlcnMvdGV4aWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OzZCQUUwQixlQUFlOzs7O29CQUN4QixNQUFNOzs7O3VCQUNILFlBQVk7Ozs7QUFKaEMsV0FBVyxDQUFBOztJQU1VLGFBQWE7WUFBYixhQUFhOztBQUNwQixXQURPLGFBQWEsR0FDakI7MEJBREksYUFBYTs7QUFFOUIsK0JBRmlCLGFBQWEsNkNBRXZCO0FBQ1AsUUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUE7R0FDM0I7O2VBSmtCLGFBQWE7O1dBTTVCLGFBQUMsUUFBUSxFQUFFO0FBQ2IsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUN6QyxVQUFNLE9BQU8sR0FBTSxJQUFJLENBQUMsVUFBVSxTQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEFBQUUsQ0FBQTtBQUN0RCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQTs7QUFFbkQsYUFBTyxDQUFDLEdBQUcsR0FBRyxrQkFBSyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDcEMsYUFBTyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUE7O0FBRTVCLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7O0FBRTlCLG1DQUFjLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzlDLGlCQUFPLENBQUMsQUFBQyxLQUFLLEdBQUksS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQTtTQUNsQyxDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7S0FDSDs7O1dBRWEsdUJBQUMsUUFBUSxFQUFFO0FBQ3ZCLFVBQU0sSUFBSSxHQUFHLENBQ1gsU0FBUyxFQUNULE9BQU8sRUFDUCw0QkFBNEIsRUFDNUIsMENBQTBDOztBQUUxQyw0Q0FBc0MsQ0FDdkMsQ0FBQTs7QUFFRCxVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFDcEUsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlELFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDMUQsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7O0FBRTlDLFVBQUksaUJBQWlCLEVBQUU7QUFDckIsWUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO09BQzNDOztBQUVELFVBQUksZUFBZSxFQUFFO0FBQ25CLFlBQUksQ0FBQyxJQUFJLGdCQUFjLGVBQWUsT0FBSSxDQUFBO09BQzNDLE1BQU0sSUFBSSxZQUFZLEVBQUU7QUFDdkIsWUFBSSxDQUFDLElBQUksZ0JBQWMsWUFBWSxPQUFJLENBQUE7T0FDeEMsTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQ3pDLFlBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtPQUM1QixNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxVQUFVLEVBQUU7QUFDMUMsWUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO09BQzdCOztBQUVELFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QyxVQUFJLE1BQU0sRUFBRTtBQUNWLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUMzQixnRUFBZ0UsR0FDaEUsaUVBQWlFLEdBQ2pFLGdDQUFnQyxDQUNqQyxDQUFBO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLElBQUksT0FBSyxRQUFRLE9BQUksQ0FBQTtBQUMxQixhQUFPLElBQUksQ0FBQTtLQUNaOzs7U0E5RGtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvYnVpbGRlcnMvdGV4aWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgQnVpbGRlciBmcm9tICcuLi9idWlsZGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXhpZnlCdWlsZGVyIGV4dGVuZHMgQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5leGVjdXRhYmxlID0gJ3RleGlmeSdcbiAgfVxuXG4gIHJ1biAoZmlsZVBhdGgpIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5jb25zdHJ1Y3RBcmdzKGZpbGVQYXRoKVxuICAgIGNvbnN0IGNvbW1hbmQgPSBgJHt0aGlzLmV4ZWN1dGFibGV9ICR7YXJncy5qb2luKCcgJyl9YFxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmNvbnN0cnVjdENoaWxkUHJvY2Vzc09wdGlvbnMoKVxuXG4gICAgb3B0aW9ucy5jd2QgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpIC8vIFJ1biBwcm9jZXNzIHdpdGggc2Vuc2libGUgQ1dELlxuICAgIG9wdGlvbnMubWF4QnVmZmVyID0gNTI0Mjg4MDAgLy8gU2V0IHByb2Nlc3MnIG1heCBidWZmZXIgc2l6ZSB0byA1MCBNQi5cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIGtpbGxpbmcgdGhlIHByb2Nlc3MuXG4gICAgICBjaGlsZF9wcm9jZXNzLmV4ZWMoY29tbWFuZCwgb3B0aW9ucywgKGVycm9yKSA9PiB7XG4gICAgICAgIHJlc29sdmUoKGVycm9yKSA/IGVycm9yLmNvZGUgOiAwKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgY29uc3RydWN0QXJncyAoZmlsZVBhdGgpIHtcbiAgICBjb25zdCBhcmdzID0gW1xuICAgICAgJy0tYmF0Y2gnLFxuICAgICAgJy0tcGRmJyxcbiAgICAgICctLXRleC1vcHRpb249XCItLXN5bmN0ZXg9MVwiJyxcbiAgICAgICctLXRleC1vcHRpb249XCItLWludGVyYWN0aW9uPW5vbnN0b3Btb2RlXCInLFxuICAgICAgLy8gU2V0IGxvZ2ZpbGUgbWF4IGxpbmUgbGVuZ3RoLlxuICAgICAgJy0tdGV4LW9wdGlvbj1cIi0tbWF4LXByaW50LWxpbmU9MTAwMFwiJ1xuICAgIF1cblxuICAgIGNvbnN0IGVuYWJsZVNoZWxsRXNjYXBlID0gYXRvbS5jb25maWcuZ2V0KCdsYXRleC5lbmFibGVTaGVsbEVzY2FwZScpXG4gICAgY29uc3QgZW5naW5lRnJvbU1hZ2ljID0gdGhpcy5nZXRMYXRleEVuZ2luZUZyb21NYWdpYyhmaWxlUGF0aClcbiAgICBjb25zdCBjdXN0b21FbmdpbmUgPSBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LmN1c3RvbUVuZ2luZScpXG4gICAgY29uc3QgZW5naW5lID0gYXRvbS5jb25maWcuZ2V0KCdsYXRleC5lbmdpbmUnKVxuXG4gICAgaWYgKGVuYWJsZVNoZWxsRXNjYXBlKSB7XG4gICAgICBhcmdzLnB1c2goJy0tdGV4LW9wdGlvbj0tLWVuYWJsZS13cml0ZTE4JylcbiAgICB9XG5cbiAgICBpZiAoZW5naW5lRnJvbU1hZ2ljKSB7XG4gICAgICBhcmdzLnB1c2goYC0tZW5naW5lPVwiJHtlbmdpbmVGcm9tTWFnaWN9XCJgKVxuICAgIH0gZWxzZSBpZiAoY3VzdG9tRW5naW5lKSB7XG4gICAgICBhcmdzLnB1c2goYC0tZW5naW5lPVwiJHtjdXN0b21FbmdpbmV9XCJgKVxuICAgIH0gZWxzZSBpZiAoZW5naW5lICYmIGVuZ2luZSA9PT0gJ3hlbGF0ZXgnKSB7XG4gICAgICBhcmdzLnB1c2goJy0tZW5naW5lPXhldGV4JylcbiAgICB9IGVsc2UgaWYgKGVuZ2luZSAmJiBlbmdpbmUgPT09ICdsdWFsYXRleCcpIHtcbiAgICAgIGFyZ3MucHVzaCgnLS1lbmdpbmU9bHVhdGV4JylcbiAgICB9XG5cbiAgICBsZXQgb3V0ZGlyID0gdGhpcy5nZXRPdXRwdXREaXJlY3RvcnkoZmlsZVBhdGgpXG4gICAgaWYgKG91dGRpcikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICdPdXRwdXQgZGlyZWN0b3J5IGZ1bmN0aW9uYWxpdHkgaXMgcG9vcmx5IHN1cHBvcnRlZCBieSB0ZXhpZnksICcgK1xuICAgICAgICAnc28gdGhpcyBmdW5jdGlvbmFsaXR5IGlzIGRpc2FibGVkIChmb3IgdGhlIGZvcmVzZWVhYmxlIGZ1dHVyZSkgJyArXG4gICAgICAgICd3aGVuIHVzaW5nIHRoZSB0ZXhpZnkgYnVpbGRlci4nXG4gICAgICApXG4gICAgfVxuXG4gICAgYXJncy5wdXNoKGBcIiR7ZmlsZVBhdGh9XCJgKVxuICAgIHJldHVybiBhcmdzXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/builders/texify.js
