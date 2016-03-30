function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _specHelpers = require('../spec-helpers');

var _specHelpers2 = _interopRequireDefault(_specHelpers);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _libBuildersLatexmk = require('../../lib/builders/latexmk');

var _libBuildersLatexmk2 = _interopRequireDefault(_libBuildersLatexmk);

'use babel';

describe('LatexmkBuilder', function () {
  var builder = undefined,
      fixturesPath = undefined,
      filePath = undefined;

  beforeEach(function () {
    builder = new _libBuildersLatexmk2['default']();
    fixturesPath = _specHelpers2['default'].cloneFixtures();
    filePath = _path2['default'].join(fixturesPath, 'file.tex');
  });

  describe('constructArgs', function () {
    it('produces default arguments when package has default config values', function () {
      var expectedArgs = ['-interaction=nonstopmode', '-f', '-cd', '-pdf', '-synctex=1', '-file-line-error', '"' + filePath + '"'];
      var args = builder.constructArgs(filePath);

      expect(args).toEqual(expectedArgs);
    });

    it('adds -shell-escape flag when package config value is set', function () {
      _specHelpers2['default'].spyOnConfig('latex.enableShellEscape', true);
      expect(builder.constructArgs(filePath)).toContain('-shell-escape');
    });

    it('adds -outdir=<path> argument according to package config', function () {
      var outdir = 'bar';
      var expectedArg = '-outdir="' + _path2['default'].join(fixturesPath, outdir) + '"';
      _specHelpers2['default'].spyOnConfig('latex.outputDirectory', outdir);

      expect(builder.constructArgs(filePath)).toContain(expectedArg);
    });

    it('adds engine argument according to package config', function () {
      _specHelpers2['default'].spyOnConfig('latex.engine', 'lualatex');
      expect(builder.constructArgs(filePath)).toContain('-lualatex');
    });

    it('adds a custom engine string according to package config', function () {
      _specHelpers2['default'].spyOnConfig('latex.customEngine', 'pdflatex %O %S');
      expect(builder.constructArgs(filePath)).toContain('-pdflatex="pdflatex %O %S"');
    });
  });

  describe('run', function () {
    var exitCode = undefined;

    it('successfully executes latexmk when given a valid TeX file', function () {
      waitsForPromise(function () {
        return builder.run(filePath).then(function (code) {
          return exitCode = code;
        });
      });

      runs(function () {
        expect(exitCode).toBe(0);
      });
    });

    it('successfully executes latexmk when given a file path containing spaces', function () {
      filePath = _path2['default'].join(fixturesPath, 'filename with spaces.tex');

      waitsForPromise(function () {
        return builder.run(filePath).then(function (code) {
          return exitCode = code;
        });
      });

      runs(function () {
        expect(exitCode).toBe(0);
      });
    });

    it('fails to execute latexmk when given invalid arguments', function () {
      spyOn(builder, 'constructArgs').andReturn(['-invalid-argument']);

      waitsForPromise(function () {
        return builder.run(filePath).then(function (code) {
          return exitCode = code;
        });
      });

      runs(function () {
        expect(exitCode).toBe(10);
      });
    });

    it('fails to execute latexmk when given invalid file path', function () {
      filePath = _path2['default'].join(fixturesPath, 'foo.tex');
      var args = builder.constructArgs(filePath);

      // Need to remove the 'force' flag to trigger the desired failure.
      var removed = args.splice(1, 1);
      expect(removed).toEqual(['-f']);

      spyOn(builder, 'constructArgs').andReturn(args);

      waitsForPromise(function () {
        return builder.run(filePath).then(function (code) {
          return exitCode = code;
        });
      });

      runs(function () {
        expect(exitCode).toBe(11);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9zcGVjL2J1aWxkZXJzL2xhdGV4bWstc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzsyQkFFb0IsaUJBQWlCOzs7O29CQUNwQixNQUFNOzs7O2tDQUNJLDRCQUE0Qjs7OztBQUp2RCxXQUFXLENBQUE7O0FBTVgsUUFBUSxDQUFDLGdCQUFnQixFQUFFLFlBQU07QUFDL0IsTUFBSSxPQUFPLFlBQUE7TUFBRSxZQUFZLFlBQUE7TUFBRSxRQUFRLFlBQUEsQ0FBQTs7QUFFbkMsWUFBVSxDQUFDLFlBQU07QUFDZixXQUFPLEdBQUcscUNBQW9CLENBQUE7QUFDOUIsZ0JBQVksR0FBRyx5QkFBUSxhQUFhLEVBQUUsQ0FBQTtBQUN0QyxZQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQTtHQUMvQyxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLGVBQWUsRUFBRSxZQUFNO0FBQzlCLE1BQUUsQ0FBQyxtRUFBbUUsRUFBRSxZQUFNO0FBQzVFLFVBQU0sWUFBWSxHQUFHLENBQ25CLDBCQUEwQixFQUMxQixJQUFJLEVBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixZQUFZLEVBQ1osa0JBQWtCLFFBQ2QsUUFBUSxPQUNiLENBQUE7QUFDRCxVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUU1QyxZQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ25DLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsMERBQTBELEVBQUUsWUFBTTtBQUNuRSwrQkFBUSxXQUFXLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDcEQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7S0FDbkUsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQywwREFBMEQsRUFBRSxZQUFNO0FBQ25FLFVBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQTtBQUNwQixVQUFNLFdBQVcsaUJBQWUsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBRyxDQUFBO0FBQ2xFLCtCQUFRLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDL0QsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQyxrREFBa0QsRUFBRSxZQUFNO0FBQzNELCtCQUFRLFdBQVcsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUE7QUFDL0MsWUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDL0QsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQyx5REFBeUQsRUFBRSxZQUFNO0FBQ2xFLCtCQUFRLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzNELFlBQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLDRCQUE0QixDQUFDLENBQUE7S0FDaEYsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUNwQixRQUFJLFFBQVEsWUFBQSxDQUFBOztBQUVaLE1BQUUsQ0FBQywyREFBMkQsRUFBRSxZQUFNO0FBQ3BFLHFCQUFlLENBQUMsWUFBTTtBQUNwQixlQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxRQUFRLEdBQUcsSUFBSTtTQUFBLENBQUMsQ0FBQTtPQUMzRCxDQUFDLENBQUE7O0FBRUYsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQ3pCLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsd0VBQXdFLEVBQUUsWUFBTTtBQUNqRixjQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSwwQkFBMEIsQ0FBQyxDQUFBOztBQUU5RCxxQkFBZSxDQUFDLFlBQU07QUFDcEIsZUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7aUJBQUksUUFBUSxHQUFHLElBQUk7U0FBQSxDQUFDLENBQUE7T0FDM0QsQ0FBQyxDQUFBOztBQUVGLFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUN6QixDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLHVEQUF1RCxFQUFFLFlBQU07QUFDaEUsV0FBSyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUE7O0FBRWhFLHFCQUFlLENBQUMsWUFBTTtBQUNwQixlQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxRQUFRLEdBQUcsSUFBSTtTQUFBLENBQUMsQ0FBQTtPQUMzRCxDQUFDLENBQUE7O0FBRUYsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQzFCLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsdURBQXVELEVBQUUsWUFBTTtBQUNoRSxjQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM3QyxVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHNUMsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDakMsWUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7O0FBRS9CLFdBQUssQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUUvQyxxQkFBZSxDQUFDLFlBQU07QUFDcEIsZUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7aUJBQUksUUFBUSxHQUFHLElBQUk7U0FBQSxDQUFDLENBQUE7T0FDM0QsQ0FBQyxDQUFBOztBQUVGLFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUMxQixDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L3NwZWMvYnVpbGRlcnMvbGF0ZXhtay1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGhlbHBlcnMgZnJvbSAnLi4vc3BlYy1oZWxwZXJzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBMYXRleG1rQnVpbGRlciBmcm9tICcuLi8uLi9saWIvYnVpbGRlcnMvbGF0ZXhtaydcblxuZGVzY3JpYmUoJ0xhdGV4bWtCdWlsZGVyJywgKCkgPT4ge1xuICBsZXQgYnVpbGRlciwgZml4dHVyZXNQYXRoLCBmaWxlUGF0aFxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGJ1aWxkZXIgPSBuZXcgTGF0ZXhta0J1aWxkZXIoKVxuICAgIGZpeHR1cmVzUGF0aCA9IGhlbHBlcnMuY2xvbmVGaXh0dXJlcygpXG4gICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNQYXRoLCAnZmlsZS50ZXgnKVxuICB9KVxuXG4gIGRlc2NyaWJlKCdjb25zdHJ1Y3RBcmdzJywgKCkgPT4ge1xuICAgIGl0KCdwcm9kdWNlcyBkZWZhdWx0IGFyZ3VtZW50cyB3aGVuIHBhY2thZ2UgaGFzIGRlZmF1bHQgY29uZmlnIHZhbHVlcycsICgpID0+IHtcbiAgICAgIGNvbnN0IGV4cGVjdGVkQXJncyA9IFtcbiAgICAgICAgJy1pbnRlcmFjdGlvbj1ub25zdG9wbW9kZScsXG4gICAgICAgICctZicsXG4gICAgICAgICctY2QnLFxuICAgICAgICAnLXBkZicsXG4gICAgICAgICctc3luY3RleD0xJyxcbiAgICAgICAgJy1maWxlLWxpbmUtZXJyb3InLFxuICAgICAgICBgXCIke2ZpbGVQYXRofVwiYFxuICAgICAgXVxuICAgICAgY29uc3QgYXJncyA9IGJ1aWxkZXIuY29uc3RydWN0QXJncyhmaWxlUGF0aClcblxuICAgICAgZXhwZWN0KGFyZ3MpLnRvRXF1YWwoZXhwZWN0ZWRBcmdzKVxuICAgIH0pXG5cbiAgICBpdCgnYWRkcyAtc2hlbGwtZXNjYXBlIGZsYWcgd2hlbiBwYWNrYWdlIGNvbmZpZyB2YWx1ZSBpcyBzZXQnLCAoKSA9PiB7XG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5lbmFibGVTaGVsbEVzY2FwZScsIHRydWUpXG4gICAgICBleHBlY3QoYnVpbGRlci5jb25zdHJ1Y3RBcmdzKGZpbGVQYXRoKSkudG9Db250YWluKCctc2hlbGwtZXNjYXBlJylcbiAgICB9KVxuXG4gICAgaXQoJ2FkZHMgLW91dGRpcj08cGF0aD4gYXJndW1lbnQgYWNjb3JkaW5nIHRvIHBhY2thZ2UgY29uZmlnJywgKCkgPT4ge1xuICAgICAgY29uc3Qgb3V0ZGlyID0gJ2JhcidcbiAgICAgIGNvbnN0IGV4cGVjdGVkQXJnID0gYC1vdXRkaXI9XCIke3BhdGguam9pbihmaXh0dXJlc1BhdGgsIG91dGRpcil9XCJgXG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5vdXRwdXREaXJlY3RvcnknLCBvdXRkaXIpXG5cbiAgICAgIGV4cGVjdChidWlsZGVyLmNvbnN0cnVjdEFyZ3MoZmlsZVBhdGgpKS50b0NvbnRhaW4oZXhwZWN0ZWRBcmcpXG4gICAgfSlcblxuICAgIGl0KCdhZGRzIGVuZ2luZSBhcmd1bWVudCBhY2NvcmRpbmcgdG8gcGFja2FnZSBjb25maWcnLCAoKSA9PiB7XG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5lbmdpbmUnLCAnbHVhbGF0ZXgnKVxuICAgICAgZXhwZWN0KGJ1aWxkZXIuY29uc3RydWN0QXJncyhmaWxlUGF0aCkpLnRvQ29udGFpbignLWx1YWxhdGV4JylcbiAgICB9KVxuXG4gICAgaXQoJ2FkZHMgYSBjdXN0b20gZW5naW5lIHN0cmluZyBhY2NvcmRpbmcgdG8gcGFja2FnZSBjb25maWcnLCAoKSA9PiB7XG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5jdXN0b21FbmdpbmUnLCAncGRmbGF0ZXggJU8gJVMnKVxuICAgICAgZXhwZWN0KGJ1aWxkZXIuY29uc3RydWN0QXJncyhmaWxlUGF0aCkpLnRvQ29udGFpbignLXBkZmxhdGV4PVwicGRmbGF0ZXggJU8gJVNcIicpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgncnVuJywgKCkgPT4ge1xuICAgIGxldCBleGl0Q29kZVxuXG4gICAgaXQoJ3N1Y2Nlc3NmdWxseSBleGVjdXRlcyBsYXRleG1rIHdoZW4gZ2l2ZW4gYSB2YWxpZCBUZVggZmlsZScsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBidWlsZGVyLnJ1bihmaWxlUGF0aCkudGhlbihjb2RlID0+IGV4aXRDb2RlID0gY29kZSlcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZXhpdENvZGUpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzdWNjZXNzZnVsbHkgZXhlY3V0ZXMgbGF0ZXhtayB3aGVuIGdpdmVuIGEgZmlsZSBwYXRoIGNvbnRhaW5pbmcgc3BhY2VzJywgKCkgPT4ge1xuICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNQYXRoLCAnZmlsZW5hbWUgd2l0aCBzcGFjZXMudGV4JylcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIucnVuKGZpbGVQYXRoKS50aGVuKGNvZGUgPT4gZXhpdENvZGUgPSBjb2RlKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChleGl0Q29kZSkudG9CZSgwKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2ZhaWxzIHRvIGV4ZWN1dGUgbGF0ZXhtayB3aGVuIGdpdmVuIGludmFsaWQgYXJndW1lbnRzJywgKCkgPT4ge1xuICAgICAgc3B5T24oYnVpbGRlciwgJ2NvbnN0cnVjdEFyZ3MnKS5hbmRSZXR1cm4oWyctaW52YWxpZC1hcmd1bWVudCddKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYnVpbGRlci5ydW4oZmlsZVBhdGgpLnRoZW4oY29kZSA9PiBleGl0Q29kZSA9IGNvZGUpXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGV4aXRDb2RlKS50b0JlKDEwKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2ZhaWxzIHRvIGV4ZWN1dGUgbGF0ZXhtayB3aGVuIGdpdmVuIGludmFsaWQgZmlsZSBwYXRoJywgKCkgPT4ge1xuICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oZml4dHVyZXNQYXRoLCAnZm9vLnRleCcpXG4gICAgICBjb25zdCBhcmdzID0gYnVpbGRlci5jb25zdHJ1Y3RBcmdzKGZpbGVQYXRoKVxuXG4gICAgICAvLyBOZWVkIHRvIHJlbW92ZSB0aGUgJ2ZvcmNlJyBmbGFnIHRvIHRyaWdnZXIgdGhlIGRlc2lyZWQgZmFpbHVyZS5cbiAgICAgIGNvbnN0IHJlbW92ZWQgPSBhcmdzLnNwbGljZSgxLCAxKVxuICAgICAgZXhwZWN0KHJlbW92ZWQpLnRvRXF1YWwoWyctZiddKVxuXG4gICAgICBzcHlPbihidWlsZGVyLCAnY29uc3RydWN0QXJncycpLmFuZFJldHVybihhcmdzKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYnVpbGRlci5ydW4oZmlsZVBhdGgpLnRoZW4oY29kZSA9PiBleGl0Q29kZSA9IGNvZGUpXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGV4aXRDb2RlKS50b0JlKDExKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/spec/builders/latexmk-spec.js
