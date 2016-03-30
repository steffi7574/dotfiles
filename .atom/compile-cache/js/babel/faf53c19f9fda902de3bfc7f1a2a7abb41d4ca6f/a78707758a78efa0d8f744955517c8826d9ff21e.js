function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('../spec-helpers');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _libParsersLogParser = require('../../lib/parsers/log-parser');

var _libParsersLogParser2 = _interopRequireDefault(_libParsersLogParser);

'use babel';

describe('LogParser', function () {
  var fixturesPath = undefined;

  beforeEach(function () {
    fixturesPath = atom.project.getPaths()[0];
  });

  describe('parse', function () {
    it('returns the expected output path', function () {
      var logFile = _path2['default'].join(fixturesPath, 'file.log');
      var parser = new _libParsersLogParser2['default'](logFile);
      var result = parser.parse();
      var outputFilePath = _path2['default'].posix.resolve(result.outputFilePath);

      expect(outputFilePath).toBe('/foo/output/file.pdf');
    });

    it('returns the expected output path when the compiled file contained spaces', function () {
      var logFile = _path2['default'].join(fixturesPath, 'filename with spaces.log');
      var parser = new _libParsersLogParser2['default'](logFile);
      var result = parser.parse();
      var outputFilePath = _path2['default'].posix.resolve(result.outputFilePath);

      expect(outputFilePath).toBe('/foo/output/filename with spaces.pdf');
    });

    it('parses and returns all errors', function () {
      var logFile = _path2['default'].join(fixturesPath, 'errors.log');
      var parser = new _libParsersLogParser2['default'](logFile);
      var result = parser.parse();

      expect(result.errors.length).toBe(3);
    });

    it('associates an error with a file path, line number, and message', function () {
      var logFile = _path2['default'].join(fixturesPath, 'errors.log');
      var parser = new _libParsersLogParser2['default'](logFile);
      var result = parser.parse();
      var error = result.errors[0];

      expect(error).toEqual({
        logPosition: [196, 0],
        filePath: './errors.tex',
        lineNumber: 10,
        message: '\\begin{gather*} on input line 8 ended by \\end{gather}'
      });
    });
  });

  describe('getLines', function () {
    it('returns the expected number of lines', function () {
      var logFile = _path2['default'].join(fixturesPath, 'file.log');
      var parser = new _libParsersLogParser2['default'](logFile);
      var lines = parser.getLines();

      expect(lines.length).toBe(63);
    });

    it('throws an error when passed a filepath that does not exist', function () {
      var logFile = _path2['default'].join(fixturesPath, 'nope.log');
      var parser = new _libParsersLogParser2['default'](logFile);

      expect(parser.getLines).toThrow();
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9zcGVjL3BhcnNlcnMvbG9nLXBhcnNlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O1FBRU8saUJBQWlCOztvQkFFUCxNQUFNOzs7O21DQUNELDhCQUE4Qjs7OztBQUxwRCxXQUFXLENBQUE7O0FBT1gsUUFBUSxDQUFDLFdBQVcsRUFBRSxZQUFNO0FBQzFCLE1BQUksWUFBWSxZQUFBLENBQUE7O0FBRWhCLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsZ0JBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQzFDLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDdEIsTUFBRSxDQUFDLGtDQUFrQyxFQUFFLFlBQU07QUFDM0MsVUFBTSxPQUFPLEdBQUcsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUNuRCxVQUFNLE1BQU0sR0FBRyxxQ0FBYyxPQUFPLENBQUMsQ0FBQTtBQUNyQyxVQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDN0IsVUFBTSxjQUFjLEdBQUcsa0JBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7O0FBRWhFLFlBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtLQUNwRCxDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLDBFQUEwRSxFQUFFLFlBQU07QUFDbkYsVUFBTSxPQUFPLEdBQUcsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25FLFVBQU0sTUFBTSxHQUFHLHFDQUFjLE9BQU8sQ0FBQyxDQUFBO0FBQ3JDLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUM3QixVQUFNLGNBQWMsR0FBRyxrQkFBSyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTs7QUFFaEUsWUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO0tBQ3BFLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN4QyxVQUFNLE9BQU8sR0FBRyxrQkFBSyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQ3JELFVBQU0sTUFBTSxHQUFHLHFDQUFjLE9BQU8sQ0FBQyxDQUFBO0FBQ3JDLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7QUFFN0IsWUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3JDLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsZ0VBQWdFLEVBQUUsWUFBTTtBQUN6RSxVQUFNLE9BQU8sR0FBRyxrQkFBSyxJQUFJLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQ3JELFVBQU0sTUFBTSxHQUFHLHFDQUFjLE9BQU8sQ0FBQyxDQUFBO0FBQ3JDLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUM3QixVQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUU5QixZQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ3BCLG1CQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLGdCQUFRLEVBQUUsY0FBYztBQUN4QixrQkFBVSxFQUFFLEVBQUU7QUFDZCxlQUFPLEVBQUUseURBQXlEO09BQ25FLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsVUFBVSxFQUFFLFlBQU07QUFDekIsTUFBRSxDQUFDLHNDQUFzQyxFQUFFLFlBQU07QUFDL0MsVUFBTSxPQUFPLEdBQUcsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUNuRCxVQUFNLE1BQU0sR0FBRyxxQ0FBYyxPQUFPLENBQUMsQ0FBQTtBQUNyQyxVQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRS9CLFlBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQzlCLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsNERBQTRELEVBQUUsWUFBTTtBQUNyRSxVQUFNLE9BQU8sR0FBRyxrQkFBSyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQ25ELFVBQU0sTUFBTSxHQUFHLHFDQUFjLE9BQU8sQ0FBQyxDQUFBOztBQUVyQyxZQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ2xDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvc3BlYy9wYXJzZXJzL2xvZy1wYXJzZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCAnLi4vc3BlYy1oZWxwZXJzJ1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IExvZ1BhcnNlciBmcm9tICcuLi8uLi9saWIvcGFyc2Vycy9sb2ctcGFyc2VyJ1xuXG5kZXNjcmliZSgnTG9nUGFyc2VyJywgKCkgPT4ge1xuICBsZXQgZml4dHVyZXNQYXRoXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgZml4dHVyZXNQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgfSlcblxuICBkZXNjcmliZSgncGFyc2UnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIGV4cGVjdGVkIG91dHB1dCBwYXRoJywgKCkgPT4ge1xuICAgICAgY29uc3QgbG9nRmlsZSA9IHBhdGguam9pbihmaXh0dXJlc1BhdGgsICdmaWxlLmxvZycpXG4gICAgICBjb25zdCBwYXJzZXIgPSBuZXcgTG9nUGFyc2VyKGxvZ0ZpbGUpXG4gICAgICBjb25zdCByZXN1bHQgPSBwYXJzZXIucGFyc2UoKVxuICAgICAgY29uc3Qgb3V0cHV0RmlsZVBhdGggPSBwYXRoLnBvc2l4LnJlc29sdmUocmVzdWx0Lm91dHB1dEZpbGVQYXRoKVxuXG4gICAgICBleHBlY3Qob3V0cHV0RmlsZVBhdGgpLnRvQmUoJy9mb28vb3V0cHV0L2ZpbGUucGRmJylcbiAgICB9KVxuXG4gICAgaXQoJ3JldHVybnMgdGhlIGV4cGVjdGVkIG91dHB1dCBwYXRoIHdoZW4gdGhlIGNvbXBpbGVkIGZpbGUgY29udGFpbmVkIHNwYWNlcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxvZ0ZpbGUgPSBwYXRoLmpvaW4oZml4dHVyZXNQYXRoLCAnZmlsZW5hbWUgd2l0aCBzcGFjZXMubG9nJylcbiAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBMb2dQYXJzZXIobG9nRmlsZSlcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZSgpXG4gICAgICBjb25zdCBvdXRwdXRGaWxlUGF0aCA9IHBhdGgucG9zaXgucmVzb2x2ZShyZXN1bHQub3V0cHV0RmlsZVBhdGgpXG5cbiAgICAgIGV4cGVjdChvdXRwdXRGaWxlUGF0aCkudG9CZSgnL2Zvby9vdXRwdXQvZmlsZW5hbWUgd2l0aCBzcGFjZXMucGRmJylcbiAgICB9KVxuXG4gICAgaXQoJ3BhcnNlcyBhbmQgcmV0dXJucyBhbGwgZXJyb3JzJywgKCkgPT4ge1xuICAgICAgY29uc3QgbG9nRmlsZSA9IHBhdGguam9pbihmaXh0dXJlc1BhdGgsICdlcnJvcnMubG9nJylcbiAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBMb2dQYXJzZXIobG9nRmlsZSlcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZSgpXG5cbiAgICAgIGV4cGVjdChyZXN1bHQuZXJyb3JzLmxlbmd0aCkudG9CZSgzKVxuICAgIH0pXG5cbiAgICBpdCgnYXNzb2NpYXRlcyBhbiBlcnJvciB3aXRoIGEgZmlsZSBwYXRoLCBsaW5lIG51bWJlciwgYW5kIG1lc3NhZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsb2dGaWxlID0gcGF0aC5qb2luKGZpeHR1cmVzUGF0aCwgJ2Vycm9ycy5sb2cnKVxuICAgICAgY29uc3QgcGFyc2VyID0gbmV3IExvZ1BhcnNlcihsb2dGaWxlKVxuICAgICAgY29uc3QgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKClcbiAgICAgIGNvbnN0IGVycm9yID0gcmVzdWx0LmVycm9yc1swXVxuXG4gICAgICBleHBlY3QoZXJyb3IpLnRvRXF1YWwoe1xuICAgICAgICBsb2dQb3NpdGlvbjogWzE5NiwgMF0sXG4gICAgICAgIGZpbGVQYXRoOiAnLi9lcnJvcnMudGV4JyxcbiAgICAgICAgbGluZU51bWJlcjogMTAsXG4gICAgICAgIG1lc3NhZ2U6ICdcXFxcYmVnaW57Z2F0aGVyKn0gb24gaW5wdXQgbGluZSA4IGVuZGVkIGJ5IFxcXFxlbmR7Z2F0aGVyfSdcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZ2V0TGluZXMnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIGV4cGVjdGVkIG51bWJlciBvZiBsaW5lcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxvZ0ZpbGUgPSBwYXRoLmpvaW4oZml4dHVyZXNQYXRoLCAnZmlsZS5sb2cnKVxuICAgICAgY29uc3QgcGFyc2VyID0gbmV3IExvZ1BhcnNlcihsb2dGaWxlKVxuICAgICAgY29uc3QgbGluZXMgPSBwYXJzZXIuZ2V0TGluZXMoKVxuXG4gICAgICBleHBlY3QobGluZXMubGVuZ3RoKS50b0JlKDYzKVxuICAgIH0pXG5cbiAgICBpdCgndGhyb3dzIGFuIGVycm9yIHdoZW4gcGFzc2VkIGEgZmlsZXBhdGggdGhhdCBkb2VzIG5vdCBleGlzdCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGxvZ0ZpbGUgPSBwYXRoLmpvaW4oZml4dHVyZXNQYXRoLCAnbm9wZS5sb2cnKVxuICAgICAgY29uc3QgcGFyc2VyID0gbmV3IExvZ1BhcnNlcihsb2dGaWxlKVxuXG4gICAgICBleHBlY3QocGFyc2VyLmdldExpbmVzKS50b1Rocm93KClcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/spec/parsers/log-parser-spec.js
