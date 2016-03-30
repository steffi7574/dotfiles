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

'use babel';

var outputPattern = new RegExp('' + '^Output\\swritten\\son\\s' + // Leading text.
'(.*)' + // Output path.
'\\s\\(.*\\)\\.$' // Trailing text.
);

var errorPattern = new RegExp('' + '^(.*):' + // File path.
'(\\d+):' + // Line number.
'\\sLaTeX\\sError:\\s' + // Marker.
'(.*)\\.$' // Error message.
);

var LogParser = (function () {
  function LogParser(filePath) {
    _classCallCheck(this, LogParser);

    this.filePath = filePath;
    this.projectPath = _path2['default'].dirname(filePath);
  }

  _createClass(LogParser, [{
    key: 'parse',
    value: function parse() {
      var _this = this;

      var result = {
        logFilePath: this.filePath,
        outputFilePath: null,
        errors: [],
        warnings: []
      };

      var lines = this.getLines();
      _lodash2['default'].forEach(lines, function (line, index) {
        // Simplest Thing That Works™ and KISS®
        var match = line.match(outputPattern);
        if (match) {
          var filePath = match[1].replace(/"/g, ''); // TODO: Fix with improved regex.
          result.outputFilePath = _path2['default'].resolve(_this.projectPath, filePath);
          return;
        }

        match = line.match(errorPattern);
        if (match) {
          result.errors.push({
            logPosition: [index, 0],
            filePath: match[1],
            lineNumber: parseInt(match[2], 10),
            message: match[3]
          });
          return;
        }
      });

      return result;
    }
  }, {
    key: 'getLines',
    value: function getLines() {
      if (!_fsPlus2['default'].existsSync(this.filePath)) {
        throw new Error('No such file: ' + this.filePath);
      }

      var rawFile = _fsPlus2['default'].readFileSync(this.filePath, { encoding: 'utf-8' });
      var lines = rawFile.replace(/(\r\n)|\r/g, '\n').split('\n');
      return lines;
    }
  }]);

  return LogParser;
})();

exports['default'] = LogParser;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvcGFyc2Vycy9sb2ctcGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBRWMsUUFBUTs7OztzQkFDUCxTQUFTOzs7O29CQUNQLE1BQU07Ozs7QUFKdkIsV0FBVyxDQUFBOztBQU1YLElBQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsR0FDakMsMkJBQTJCO0FBQzNCLE1BQU07QUFDTixpQkFBaUI7Q0FDbEIsQ0FBQTs7QUFFRCxJQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEdBQ2hDLFFBQVE7QUFDUixTQUFTO0FBQ1Qsc0JBQXNCO0FBQ3RCLFVBQVU7Q0FDWCxDQUFBOztJQUVvQixTQUFTO0FBQ2hCLFdBRE8sU0FBUyxDQUNmLFFBQVEsRUFBRTswQkFESixTQUFTOztBQUUxQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtBQUN4QixRQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtHQUMxQzs7ZUFKa0IsU0FBUzs7V0FNdEIsaUJBQUc7OztBQUNQLFVBQU0sTUFBTSxHQUFHO0FBQ2IsbUJBQVcsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUMxQixzQkFBYyxFQUFFLElBQUk7QUFDcEIsY0FBTSxFQUFFLEVBQUU7QUFDVixnQkFBUSxFQUFFLEVBQUU7T0FDYixDQUFBOztBQUVELFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUM3QiwwQkFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLFVBQUMsSUFBSSxFQUFFLEtBQUssRUFBSzs7QUFFaEMsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNyQyxZQUFJLEtBQUssRUFBRTtBQUNULGNBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzNDLGdCQUFNLENBQUMsY0FBYyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxNQUFLLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNoRSxpQkFBTTtTQUNQOztBQUVELGFBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ2hDLFlBQUksS0FBSyxFQUFFO0FBQ1QsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2pCLHVCQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLG9CQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNsQixzQkFBVSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2xDLG1CQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztXQUNsQixDQUFDLENBQUE7QUFDRixpQkFBTTtTQUNQO09BQ0YsQ0FBQyxDQUFBOztBQUVGLGFBQU8sTUFBTSxDQUFBO0tBQ2Q7OztXQUVRLG9CQUFHO0FBQ1YsVUFBSSxDQUFDLG9CQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDakMsY0FBTSxJQUFJLEtBQUssb0JBQWtCLElBQUksQ0FBQyxRQUFRLENBQUcsQ0FBQTtPQUNsRDs7QUFFRCxVQUFNLE9BQU8sR0FBRyxvQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFBO0FBQ25FLFVBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3RCxhQUFPLEtBQUssQ0FBQTtLQUNiOzs7U0EvQ2tCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvcGFyc2Vycy9sb2ctcGFyc2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5jb25zdCBvdXRwdXRQYXR0ZXJuID0gbmV3IFJlZ0V4cCgnJyArXG4gICdeT3V0cHV0XFxcXHN3cml0dGVuXFxcXHNvblxcXFxzJyArIC8vIExlYWRpbmcgdGV4dC5cbiAgJyguKiknICsgICAgICAgICAgICAgICAgICAgICAgLy8gT3V0cHV0IHBhdGguXG4gICdcXFxcc1xcXFwoLipcXFxcKVxcXFwuJCcgICAgICAgICAgICAgLy8gVHJhaWxpbmcgdGV4dC5cbilcblxuY29uc3QgZXJyb3JQYXR0ZXJuID0gbmV3IFJlZ0V4cCgnJyArXG4gICdeKC4qKTonICsgICAgICAgICAgICAgICAvLyBGaWxlIHBhdGguXG4gICcoXFxcXGQrKTonICsgICAgICAgICAgICAgIC8vIExpbmUgbnVtYmVyLlxuICAnXFxcXHNMYVRlWFxcXFxzRXJyb3I6XFxcXHMnICsgLy8gTWFya2VyLlxuICAnKC4qKVxcXFwuJCcgICAgICAgICAgICAgICAvLyBFcnJvciBtZXNzYWdlLlxuKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dQYXJzZXIge1xuICBjb25zdHJ1Y3RvciAoZmlsZVBhdGgpIHtcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGhcbiAgICB0aGlzLnByb2plY3RQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICB9XG5cbiAgcGFyc2UgKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGxvZ0ZpbGVQYXRoOiB0aGlzLmZpbGVQYXRoLFxuICAgICAgb3V0cHV0RmlsZVBhdGg6IG51bGwsXG4gICAgICBlcnJvcnM6IFtdLFxuICAgICAgd2FybmluZ3M6IFtdXG4gICAgfVxuXG4gICAgY29uc3QgbGluZXMgPSB0aGlzLmdldExpbmVzKClcbiAgICBfLmZvckVhY2gobGluZXMsIChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgLy8gU2ltcGxlc3QgVGhpbmcgVGhhdCBXb3Jrc+KEoiBhbmQgS0lTU8KuXG4gICAgICBsZXQgbWF0Y2ggPSBsaW5lLm1hdGNoKG91dHB1dFBhdHRlcm4pXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBtYXRjaFsxXS5yZXBsYWNlKC9cIi9nLCAnJykgLy8gVE9ETzogRml4IHdpdGggaW1wcm92ZWQgcmVnZXguXG4gICAgICAgIHJlc3VsdC5vdXRwdXRGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLnByb2plY3RQYXRoLCBmaWxlUGF0aClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIG1hdGNoID0gbGluZS5tYXRjaChlcnJvclBhdHRlcm4pXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKHtcbiAgICAgICAgICBsb2dQb3NpdGlvbjogW2luZGV4LCAwXSxcbiAgICAgICAgICBmaWxlUGF0aDogbWF0Y2hbMV0sXG4gICAgICAgICAgbGluZU51bWJlcjogcGFyc2VJbnQobWF0Y2hbMl0sIDEwKSxcbiAgICAgICAgICBtZXNzYWdlOiBtYXRjaFszXVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZ2V0TGluZXMgKCkge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmZpbGVQYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIGZpbGU6ICR7dGhpcy5maWxlUGF0aH1gKVxuICAgIH1cblxuICAgIGNvbnN0IHJhd0ZpbGUgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5maWxlUGF0aCwge2VuY29kaW5nOiAndXRmLTgnfSlcbiAgICBjb25zdCBsaW5lcyA9IHJhd0ZpbGUucmVwbGFjZSgvKFxcclxcbil8XFxyL2csICdcXG4nKS5zcGxpdCgnXFxuJylcbiAgICByZXR1cm4gbGluZXNcbiAgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/parsers/log-parser.js
