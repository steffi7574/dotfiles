Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

'use babel';

var magicCommentPattern = new RegExp('' + '^%\\s*' + // Optional whitespace.
'!TEX' + // Magic marker.
'\\s+' + // Semi-optional whitespace.
'(\\w+)' + // [1] Captures the magic keyword. E.g. 'root'.
'\\s*=\\s*' + // Equal sign wrapped in optional whitespace.
'(.*)' + // [2] Captures everything following the equal sign.
'$' // EOL.
);

var latexCommandPattern = new RegExp('' + '\\' + // starting command \
'\\w+' + // command name e.g. input
'(\\{|\\w|\\}|/|\\]|\\[)*' // options to the command
);

var MagicParser = (function () {
  function MagicParser(filePath) {
    _classCallCheck(this, MagicParser);

    this.filePath = filePath;
  }

  _createClass(MagicParser, [{
    key: 'parse',
    value: function parse() {
      var result = {};
      var lines = this.getLines();
      for (var line of lines) {
        var latexCommandMatch = line.match(latexCommandPattern);
        if (latexCommandMatch) {
          break;
        } // Stop parsing if a latex command was found

        var match = line.match(magicCommentPattern);
        if (match != null) {
          result[match[1]] = match[2];
        }
      }

      return result;
    }
  }, {
    key: 'getLines',
    value: function getLines() {
      if (!_fsPlus2['default'].existsSync(this.filePath)) {
        return [];
      }

      var rawFile = _fsPlus2['default'].readFileSync(this.filePath, { encoding: 'utf-8' });
      var lines = rawFile.replace(/(\r\n)|\r/g, '\n').split('\n');
      return lines;
    }
  }]);

  return MagicParser;
})();

exports['default'] = MagicParser;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvcGFyc2Vycy9tYWdpYy1wYXJzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFZSxTQUFTOzs7O0FBRnhCLFdBQVcsQ0FBQTs7QUFJWCxJQUFNLG1CQUFtQixHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsR0FDdkMsUUFBUTtBQUNSLE1BQU07QUFDTixNQUFNO0FBQ04sUUFBUTtBQUNSLFdBQVc7QUFDWCxNQUFNO0FBQ04sR0FBRztDQUNKLENBQUE7O0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEdBQ3ZDLElBQUk7QUFDSixNQUFNO0FBQ04sMEJBQTBCO0NBQzNCLENBQUE7O0lBRW9CLFdBQVc7QUFDbEIsV0FETyxXQUFXLENBQ2pCLFFBQVEsRUFBRTswQkFESixXQUFXOztBQUU1QixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtHQUN6Qjs7ZUFIa0IsV0FBVzs7V0FLeEIsaUJBQUc7QUFDUCxVQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7QUFDakIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQzdCLFdBQUssSUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ3hCLFlBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pELFlBQUksaUJBQWlCLEVBQUU7QUFBRSxnQkFBSztTQUFFOztBQUVoQyxZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDN0MsWUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLGdCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzVCO09BQ0Y7O0FBRUQsYUFBTyxNQUFNLENBQUE7S0FDZDs7O1dBRVEsb0JBQUc7QUFDVixVQUFJLENBQUMsb0JBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUFFLGVBQU8sRUFBRSxDQUFBO09BQUU7O0FBRWhELFVBQU0sT0FBTyxHQUFHLG9CQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUE7QUFDbkUsVUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdELGFBQU8sS0FBSyxDQUFBO0tBQ2I7OztTQTNCa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9wYXJzZXJzL21hZ2ljLXBhcnNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuXG5jb25zdCBtYWdpY0NvbW1lbnRQYXR0ZXJuID0gbmV3IFJlZ0V4cCgnJyArXG4gICdeJVxcXFxzKicgKyAgICAvLyBPcHRpb25hbCB3aGl0ZXNwYWNlLlxuICAnIVRFWCcgKyAgICAgIC8vIE1hZ2ljIG1hcmtlci5cbiAgJ1xcXFxzKycgKyAgICAgIC8vIFNlbWktb3B0aW9uYWwgd2hpdGVzcGFjZS5cbiAgJyhcXFxcdyspJyArICAgIC8vIFsxXSBDYXB0dXJlcyB0aGUgbWFnaWMga2V5d29yZC4gRS5nLiAncm9vdCcuXG4gICdcXFxccyo9XFxcXHMqJyArIC8vIEVxdWFsIHNpZ24gd3JhcHBlZCBpbiBvcHRpb25hbCB3aGl0ZXNwYWNlLlxuICAnKC4qKScgKyAgICAgIC8vIFsyXSBDYXB0dXJlcyBldmVyeXRoaW5nIGZvbGxvd2luZyB0aGUgZXF1YWwgc2lnbi5cbiAgJyQnICAgICAgICAgICAvLyBFT0wuXG4pXG5cbmNvbnN0IGxhdGV4Q29tbWFuZFBhdHRlcm4gPSBuZXcgUmVnRXhwKCcnICtcbiAgJ1xcXFwnICsgICAgICAgICAgICAgICAgICAgICAgLy8gc3RhcnRpbmcgY29tbWFuZCBcXFxuICAnXFxcXHcrJyArICAgICAgICAgICAgICAgICAgICAvLyBjb21tYW5kIG5hbWUgZS5nLiBpbnB1dFxuICAnKFxcXFx7fFxcXFx3fFxcXFx9fC98XFxcXF18XFxcXFspKicgIC8vIG9wdGlvbnMgdG8gdGhlIGNvbW1hbmRcbilcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFnaWNQYXJzZXIge1xuICBjb25zdHJ1Y3RvciAoZmlsZVBhdGgpIHtcbiAgICB0aGlzLmZpbGVQYXRoID0gZmlsZVBhdGhcbiAgfVxuXG4gIHBhcnNlICgpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fVxuICAgIGNvbnN0IGxpbmVzID0gdGhpcy5nZXRMaW5lcygpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBjb25zdCBsYXRleENvbW1hbmRNYXRjaCA9IGxpbmUubWF0Y2gobGF0ZXhDb21tYW5kUGF0dGVybilcbiAgICAgIGlmIChsYXRleENvbW1hbmRNYXRjaCkgeyBicmVhayB9IC8vIFN0b3AgcGFyc2luZyBpZiBhIGxhdGV4IGNvbW1hbmQgd2FzIGZvdW5kXG5cbiAgICAgIGNvbnN0IG1hdGNoID0gbGluZS5tYXRjaChtYWdpY0NvbW1lbnRQYXR0ZXJuKVxuICAgICAgaWYgKG1hdGNoICE9IG51bGwpIHtcbiAgICAgICAgcmVzdWx0W21hdGNoWzFdXSA9IG1hdGNoWzJdXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZ2V0TGluZXMgKCkge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmZpbGVQYXRoKSkgeyByZXR1cm4gW10gfVxuXG4gICAgY29uc3QgcmF3RmlsZSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLmZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9KVxuICAgIGNvbnN0IGxpbmVzID0gcmF3RmlsZS5yZXBsYWNlKC8oXFxyXFxuKXxcXHIvZywgJ1xcbicpLnNwbGl0KCdcXG4nKVxuICAgIHJldHVybiBsaW5lc1xuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/parsers/magic-parser.js
