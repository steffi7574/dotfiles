Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _parsersLogParser = require('./parsers/log-parser');

var _parsersLogParser2 = _interopRequireDefault(_parsersLogParser);

var _parsersMagicParser = require('./parsers/magic-parser');

var _parsersMagicParser2 = _interopRequireDefault(_parsersMagicParser);

'use babel';

var Builder = (function () {
  function Builder() {
    _classCallCheck(this, Builder);

    this.envPathKey = this.getEnvironmentPathKey(process.platform);
  }

  _createClass(Builder, [{
    key: 'run',
    value: function run() /* filePath */{}
  }, {
    key: 'constructArgs',
    value: function constructArgs() /* filePath */{}
  }, {
    key: 'parseLogFile',
    value: function parseLogFile(texFilePath) {
      var logFilePath = this.resolveLogFilePath(texFilePath);
      if (!_fsPlus2['default'].existsSync(logFilePath)) {
        return null;
      }

      var parser = this.getLogParser(logFilePath);
      return parser.parse();
    }
  }, {
    key: 'getLogParser',
    value: function getLogParser(logFilePath) {
      return new _parsersLogParser2['default'](logFilePath);
    }
  }, {
    key: 'constructChildProcessOptions',
    value: function constructChildProcessOptions() {
      var env = _lodash2['default'].clone(process.env);
      var childPath = this.constructPath();
      if (childPath) {
        env[this.envPathKey] = childPath;
      }

      return { env: env };
    }
  }, {
    key: 'constructPath',
    value: function constructPath() {
      var texPath = (atom.config.get('latex.texPath') || '').trim();
      if (texPath.length === 0) {
        texPath = this.defaultTexPath(process.platform);
      }

      var processPath = process.env[this.envPathKey];
      var match = texPath.match(/^(.*)(\$PATH)(.*)$/);
      if (match) {
        return '' + match[1] + processPath + match[3];
      }

      return [texPath, processPath].filter(function (str) {
        return str && str.length > 0;
      }).join(_path2['default'].delimiter);
    }
  }, {
    key: 'defaultTexPath',
    value: function defaultTexPath(platform) {
      if (platform === 'win32') {
        return ['%SystemDrive%\\texlive\\2015\\bin\\win32', '%SystemDrive%\\texlive\\2014\\bin\\win32', '%ProgramFiles%\\MiKTeX 2.9\\miktex\\bin\\x64', '%ProgramFiles(x86)%\\MiKTeX 2.9\\miktex\\bin'].join(';');
      }

      return ['/usr/texbin', '/Library/TeX/texbin'].join(':');
    }
  }, {
    key: 'resolveLogFilePath',
    value: function resolveLogFilePath(texFilePath) {
      var outputDirectory = atom.config.get('latex.outputDirectory') || '';
      var currentDirectory = _path2['default'].dirname(texFilePath);
      var fileName = _path2['default'].basename(texFilePath).replace(/\.\w+$/, '.log');

      return _path2['default'].join(currentDirectory, outputDirectory, fileName);
    }
  }, {
    key: 'getEnvironmentPathKey',
    value: function getEnvironmentPathKey(platform) {
      if (platform === 'win32') {
        return 'Path';
      }
      return 'PATH';
    }
  }, {
    key: 'getOutputDirectory',
    value: function getOutputDirectory(filePath) {
      var outdir = atom.config.get('latex.outputDirectory');
      if (outdir) {
        var dir = _path2['default'].dirname(filePath);
        outdir = _path2['default'].join(dir, outdir);
      }

      return outdir;
    }
  }, {
    key: 'getLatexEngineFromMagic',
    value: function getLatexEngineFromMagic(filePath) {
      var magic = new _parsersMagicParser2['default'](filePath).parse();
      if (magic && magic.program) {
        return magic.program;
      }

      return null;
    }
  }]);

  return Builder;
})();

exports['default'] = Builder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvYnVpbGRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3NCQUVjLFFBQVE7Ozs7c0JBQ1AsU0FBUzs7OztvQkFDUCxNQUFNOzs7O2dDQUNELHNCQUFzQjs7OztrQ0FDcEIsd0JBQXdCOzs7O0FBTmhELFdBQVcsQ0FBQTs7SUFRVSxPQUFPO0FBQ2QsV0FETyxPQUFPLEdBQ1g7MEJBREksT0FBTzs7QUFFeEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0dBQy9EOztlQUhrQixPQUFPOztXQUt0Qiw2QkFBaUIsRUFBRTs7O1dBQ1QsdUNBQWlCLEVBQUU7OztXQUVwQixzQkFBQyxXQUFXLEVBQUU7QUFDekIsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3hELFVBQUksQ0FBQyxvQkFBRyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFBRSxlQUFPLElBQUksQ0FBQTtPQUFFOztBQUVoRCxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzdDLGFBQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO0tBQ3RCOzs7V0FFWSxzQkFBQyxXQUFXLEVBQUU7QUFDekIsYUFBTyxrQ0FBYyxXQUFXLENBQUMsQ0FBQTtLQUNsQzs7O1dBRTRCLHdDQUFHO0FBQzlCLFVBQU0sR0FBRyxHQUFHLG9CQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDaEMsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO0FBQ3RDLFVBQUksU0FBUyxFQUFFO0FBQ2IsV0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFTLENBQUE7T0FDakM7O0FBRUQsYUFBTyxF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dWlsZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IExvZ1BhcnNlciBmcm9tICcuL3BhcnNlcnMvbG9nLXBhcnNlcidcbmltcG9ydCBNYWdpY1BhcnNlciBmcm9tICcuL3BhcnNlcnMvbWFnaWMtcGFyc2VyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuZW52UGF0aEtleSA9IHRoaXMuZ2V0RW52aXJvbm1lbnRQYXRoS2V5KHByb2Nlc3MucGxhdGZvcm0pXG4gIH1cblxuICBydW4gKC8qIGZpbGVQYXRoICovKSB7fVxuICBjb25zdHJ1Y3RBcmdzICgvKiBmaWxlUGF0aCAqLykge31cblxuICBwYXJzZUxvZ0ZpbGUgKHRleEZpbGVQYXRoKSB7XG4gICAgY29uc3QgbG9nRmlsZVBhdGggPSB0aGlzLnJlc29sdmVMb2dGaWxlUGF0aCh0ZXhGaWxlUGF0aClcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMobG9nRmlsZVBhdGgpKSB7IHJldHVybiBudWxsIH1cblxuICAgIGNvbnN0IHBhcnNlciA9IHRoaXMuZ2V0TG9nUGFyc2VyKGxvZ0ZpbGVQYXRoKVxuICAgIHJldHVybiBwYXJzZXIucGFyc2UoKVxuICB9XG5cbiAgZ2V0TG9nUGFyc2VyIChsb2dGaWxlUGF0aCkge1xuICAgIHJldHVybiBuZXcgTG9nUGFyc2VyKGxvZ0ZpbGVQYXRoKVxuICB9XG5cbiAgY29uc3RydWN0Q2hpbGRQcm9jZXNzT3B0aW9ucyAoKSB7XG4gICAgY29uc3QgZW52ID0gXy5jbG9uZShwcm9jZXNzLmVudilcbiAgICBjb25zdCBjaGlsZFBhdGggPSB0aGlzLmNvbnN0cnVjdFBhdGgoKVxuICAgIGlmIChjaGlsZFBhdGgpIHtcbiAgICAgIGVudlt0aGlzLmVudlBhdGhLZXldID0gY2hpbGRQYXRoXG4gICAgfVxuXG4gICAgcmV0dXJuIHtlbnZ9XG4gIH1cblxuICBjb25zdHJ1Y3RQYXRoICgpIHtcbiAgICBsZXQgdGV4UGF0aCA9IChhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LnRleFBhdGgnKSB8fCAnJykudHJpbSgpXG4gICAgaWYgKHRleFBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICB0ZXhQYXRoID0gdGhpcy5kZWZhdWx0VGV4UGF0aChwcm9jZXNzLnBsYXRmb3JtKVxuICAgIH1cblxuICAgIGNvbnN0IHByb2Nlc3NQYXRoID0gcHJvY2Vzcy5lbnZbdGhpcy5lbnZQYXRoS2V5XVxuICAgIGNvbnN0IG1hdGNoID0gdGV4UGF0aC5tYXRjaCgvXiguKikoXFwkUEFUSCkoLiopJC8pXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICByZXR1cm4gYCR7bWF0Y2hbMV19JHtwcm9jZXNzUGF0aH0ke21hdGNoWzNdfWBcbiAgICB9XG5cbiAgICByZXR1cm4gW3RleFBhdGgsIHByb2Nlc3NQYXRoXVxuICAgICAgLmZpbHRlcihzdHIgPT4gc3RyICYmIHN0ci5sZW5ndGggPiAwKVxuICAgICAgLmpvaW4ocGF0aC5kZWxpbWl0ZXIpXG4gIH1cblxuICBkZWZhdWx0VGV4UGF0aCAocGxhdGZvcm0pIHtcbiAgICBpZiAocGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgICclU3lzdGVtRHJpdmUlXFxcXHRleGxpdmVcXFxcMjAxNVxcXFxiaW5cXFxcd2luMzInLFxuICAgICAgICAnJVN5c3RlbURyaXZlJVxcXFx0ZXhsaXZlXFxcXDIwMTRcXFxcYmluXFxcXHdpbjMyJyxcbiAgICAgICAgJyVQcm9ncmFtRmlsZXMlXFxcXE1pS1RlWCAyLjlcXFxcbWlrdGV4XFxcXGJpblxcXFx4NjQnLFxuICAgICAgICAnJVByb2dyYW1GaWxlcyh4ODYpJVxcXFxNaUtUZVggMi45XFxcXG1pa3RleFxcXFxiaW4nXG4gICAgICBdLmpvaW4oJzsnKVxuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICAnL3Vzci90ZXhiaW4nLFxuICAgICAgJy9MaWJyYXJ5L1RlWC90ZXhiaW4nXG4gICAgXS5qb2luKCc6JylcbiAgfVxuXG4gIHJlc29sdmVMb2dGaWxlUGF0aCAodGV4RmlsZVBhdGgpIHtcbiAgICBjb25zdCBvdXRwdXREaXJlY3RvcnkgPSBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4Lm91dHB1dERpcmVjdG9yeScpIHx8ICcnXG4gICAgY29uc3QgY3VycmVudERpcmVjdG9yeSA9IHBhdGguZGlybmFtZSh0ZXhGaWxlUGF0aClcbiAgICBjb25zdCBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUodGV4RmlsZVBhdGgpLnJlcGxhY2UoL1xcLlxcdyskLywgJy5sb2cnKVxuXG4gICAgcmV0dXJuIHBhdGguam9pbihjdXJyZW50RGlyZWN0b3J5LCBvdXRwdXREaXJlY3RvcnksIGZpbGVOYW1lKVxuICB9XG5cbiAgZ2V0RW52aXJvbm1lbnRQYXRoS2V5IChwbGF0Zm9ybSkge1xuICAgIGlmIChwbGF0Zm9ybSA9PT0gJ3dpbjMyJykgeyByZXR1cm4gJ1BhdGgnIH1cbiAgICByZXR1cm4gJ1BBVEgnXG4gIH1cblxuICBnZXRPdXRwdXREaXJlY3RvcnkgKGZpbGVQYXRoKSB7XG4gICAgbGV0IG91dGRpciA9IGF0b20uY29uZmlnLmdldCgnbGF0ZXgub3V0cHV0RGlyZWN0b3J5JylcbiAgICBpZiAob3V0ZGlyKSB7XG4gICAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICBvdXRkaXIgPSBwYXRoLmpvaW4oZGlyLCBvdXRkaXIpXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dGRpclxuICB9XG5cbiAgZ2V0TGF0ZXhFbmdpbmVGcm9tTWFnaWMgKGZpbGVQYXRoKSB7XG4gICAgY29uc3QgbWFnaWMgPSBuZXcgTWFnaWNQYXJzZXIoZmlsZVBhdGgpLnBhcnNlKClcbiAgICBpZiAobWFnaWMgJiYgbWFnaWMucHJvZ3JhbSkge1xuICAgICAgcmV0dXJuIG1hZ2ljLnByb2dyYW1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/builder.js
