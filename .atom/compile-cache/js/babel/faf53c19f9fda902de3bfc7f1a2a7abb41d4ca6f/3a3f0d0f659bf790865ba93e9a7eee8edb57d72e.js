Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.heredoc = heredoc;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

'use babel';

function heredoc(input) {
  if (input === null) {
    return null;
  }

  var lines = _lodash2['default'].dropWhile(input.split(/\r\n|\n|\r/), function (line) {
    return line.length === 0;
  });
  var indentLength = _lodash2['default'].takeWhile(lines[0], function (char) {
    return char === ' ';
  }).length;
  var truncatedLines = lines.map(function (line) {
    return line.slice(indentLength);
  });

  return truncatedLines.join('\n');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvd2Vya3pldWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztzQkFFYyxRQUFROzs7O0FBRnRCLFdBQVcsQ0FBQTs7QUFJSixTQUFTLE9BQU8sQ0FBRSxLQUFLLEVBQUU7QUFDOUIsTUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQUUsV0FBTyxJQUFJLENBQUE7R0FBRTs7QUFFbkMsTUFBTSxLQUFLLEdBQUcsb0JBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFBO0FBQy9FLE1BQU0sWUFBWSxHQUFHLG9CQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBQSxJQUFJO1dBQUksSUFBSSxLQUFLLEdBQUc7R0FBQSxDQUFDLENBQUMsTUFBTSxDQUFBO0FBQ3ZFLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7R0FBQSxDQUFDLENBQUE7O0FBRWxFLFNBQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtDQUNqQyIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvbGliL3dlcmt6ZXVnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuXG5leHBvcnQgZnVuY3Rpb24gaGVyZWRvYyAoaW5wdXQpIHtcbiAgaWYgKGlucHV0ID09PSBudWxsKSB7IHJldHVybiBudWxsIH1cblxuICBjb25zdCBsaW5lcyA9IF8uZHJvcFdoaWxlKGlucHV0LnNwbGl0KC9cXHJcXG58XFxufFxcci8pLCBsaW5lID0+IGxpbmUubGVuZ3RoID09PSAwKVxuICBjb25zdCBpbmRlbnRMZW5ndGggPSBfLnRha2VXaGlsZShsaW5lc1swXSwgY2hhciA9PiBjaGFyID09PSAnICcpLmxlbmd0aFxuICBjb25zdCB0cnVuY2F0ZWRMaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IGxpbmUuc2xpY2UoaW5kZW50TGVuZ3RoKSlcblxuICByZXR1cm4gdHJ1bmNhdGVkTGluZXMuam9pbignXFxuJylcbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/werkzeug.js
