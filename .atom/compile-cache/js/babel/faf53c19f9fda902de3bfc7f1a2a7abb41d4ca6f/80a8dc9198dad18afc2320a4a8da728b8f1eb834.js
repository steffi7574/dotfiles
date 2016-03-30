function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _specHelpers = require('./spec-helpers');

var _specHelpers2 = _interopRequireDefault(_specHelpers);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _libComposer = require('../lib/composer');

var _libComposer2 = _interopRequireDefault(_libComposer);

'use babel';

describe('Composer', function () {
  var composer = undefined;

  beforeEach(function () {
    composer = new _libComposer2['default']();
  });

  describe('build', function () {
    var editor = undefined,
        builder = undefined;

    function initializeSpies(filePath) {
      var statusCode = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      editor = jasmine.createSpyObj('MockEditor', ['save', 'isModified']);
      spyOn(composer, 'resolveRootFilePath').andReturn(filePath);
      spyOn(composer, 'getEditorDetails').andReturn({
        editor: editor,
        filePath: filePath
      });

      builder = jasmine.createSpyObj('MockBuilder', ['run', 'constructArgs', 'parseLogFile']);
      builder.run.andCallFake(function () {
        switch (statusCode) {
          case 0:
            {
              return Promise.resolve(statusCode);
            }
        }

        return Promise.reject(statusCode);
      });
      spyOn(latex, 'getBuilder').andReturn(builder);
    }

    beforeEach(function () {
      spyOn(composer, 'showResult').andReturn();
      spyOn(composer, 'showError').andReturn();
    });

    it('does nothing for new, unsaved files', function () {
      initializeSpies(null);

      var result = 'aaaaaaaaaaaa';
      waitsForPromise(function () {
        return composer.build()['catch'](function (r) {
          return result = r;
        });
      });

      runs(function () {
        expect(result).toBe(false);
        expect(composer.showResult).not.toHaveBeenCalled();
        expect(composer.showError).not.toHaveBeenCalled();
      });
    });

    it('does nothing for unsupported file extensions', function () {
      initializeSpies('foo.bar');

      var result = undefined;
      waitsForPromise(function () {
        return composer.build()['catch'](function (r) {
          return result = r;
        });
      });

      runs(function () {
        expect(result).toBe(false);
        expect(composer.showResult).not.toHaveBeenCalled();
        expect(composer.showError).not.toHaveBeenCalled();
      });
    });

    it('saves the file before building, if modified', function () {
      initializeSpies('file.tex');
      editor.isModified.andReturn(true);

      builder.parseLogFile.andReturn({
        outputFilePath: 'file.pdf',
        errors: [],
        warnings: []
      });

      waitsForPromise(function () {
        return composer.build();
      });

      runs(function () {
        expect(editor.isModified).toHaveBeenCalled();
        expect(editor.save).toHaveBeenCalled();
      });
    });

    it('invokes `showResult` after a successful build, with expected log parsing result', function () {
      var result = {
        outputFilePath: 'file.pdf',
        errors: [],
        warnings: []
      };

      initializeSpies('file.tex');
      builder.parseLogFile.andReturn(result);

      waitsForPromise(function () {
        return composer.build();
      });

      runs(function () {
        expect(composer.showResult).toHaveBeenCalledWith(result);
      });
    });

    it('treats missing output file data in log file as an error', function () {
      initializeSpies('file.tex');

      builder.parseLogFile.andReturn({
        outputFilePath: null,
        errors: [],
        warnings: []
      });

      waitsForPromise(function () {
        return composer.build()['catch'](function (r) {
          return r;
        });
      });

      runs(function () {
        expect(composer.showError).toHaveBeenCalled();
      });
    });

    it('treats missing result from parser as an error', function () {
      initializeSpies('file.tex');
      builder.parseLogFile.andReturn(null);

      waitsForPromise(function () {
        return composer.build()['catch'](function (r) {
          return r;
        });
      });

      runs(function () {
        expect(composer.showError).toHaveBeenCalled();
      });
    });

    it('handles active item not being a text editor', function () {
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn();
      spyOn(composer, 'getEditorDetails').andCallThrough();

      waitsForPromise(function () {
        return composer.build()['catch'](function (r) {
          return r;
        });
      });

      runs(function () {
        expect(composer.getEditorDetails).toHaveBeenCalled();
      });
    });
  });

  describe('clean', function () {
    var extensions = ['.bar', '.baz', '.quux'];

    function fakeFilePaths(filePath) {
      var filePathSansExtension = filePath.substring(0, filePath.lastIndexOf('.'));
      return extensions.map(function (ext) {
        return filePathSansExtension + ext;
      });
    }

    function initializeSpies(filePath) {
      spyOn(composer, 'getEditorDetails').andReturn({ filePath: filePath });
      spyOn(composer, 'resolveRootFilePath').andReturn(filePath);
    }

    beforeEach(function () {
      spyOn(_fsPlus2['default'], 'remove').andCallThrough();
      _specHelpers2['default'].spyOnConfig('latex.cleanExtensions', extensions);
    });

    it('deletes all files for the current tex document when output has not been redirected', function () {
      var filePath = _path2['default'].normalize('/a/foo.tex');
      var filesToDelete = fakeFilePaths(filePath);
      initializeSpies(filePath);

      var candidatePaths = undefined;
      waitsForPromise(function () {
        return composer.clean().then(function (resolutions) {
          candidatePaths = _lodash2['default'].pluck(resolutions, 'filePath');
        });
      });

      runs(function () {
        expect(candidatePaths).toEqual(filesToDelete);
      });
    });

    it('stops immidiately if the file is not a TeX document', function () {
      var filePath = 'foo.bar';
      initializeSpies(filePath, []);

      waitsForPromise(function () {
        return composer.clean()['catch'](function (r) {
          return r;
        });
      });

      runs(function () {
        expect(composer.resolveRootFilePath).not.toHaveBeenCalled();
        expect(_fsPlus2['default'].remove).not.toHaveBeenCalled();
      });
    });
  });

  describe('shouldMoveResult', function () {
    it('should return false when using neither an output directory, nor the move option', function () {
      _specHelpers2['default'].spyOnConfig('latex.outputDirectory', '');
      _specHelpers2['default'].spyOnConfig('latex.moveResultToSourceDirectory', false);

      expect(composer.shouldMoveResult()).toBe(false);
    });

    it('should return false when not using an output directory, but using the move option', function () {
      _specHelpers2['default'].spyOnConfig('latex.outputDirectory', '');
      _specHelpers2['default'].spyOnConfig('latex.moveResultToSourceDirectory', true);

      expect(composer.shouldMoveResult()).toBe(false);
    });

    it('should return false when not using the move option, but using an output directory', function () {
      _specHelpers2['default'].spyOnConfig('latex.outputDirectory', 'baz');
      _specHelpers2['default'].spyOnConfig('latex.moveResultToSourceDirectory', false);

      expect(composer.shouldMoveResult()).toBe(false);
    });

    it('should return true when using both an output directory and the move option', function () {
      _specHelpers2['default'].spyOnConfig('latex.outputDirectory', 'baz');
      _specHelpers2['default'].spyOnConfig('latex.moveResultToSourceDirectory', true);

      expect(composer.shouldMoveResult()).toBe(true);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9zcGVjL2NvbXBvc2VyLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7MkJBRW9CLGdCQUFnQjs7OztzQkFDckIsU0FBUzs7OztzQkFDVixRQUFROzs7O29CQUNMLE1BQU07Ozs7MkJBQ0YsaUJBQWlCOzs7O0FBTnRDLFdBQVcsQ0FBQTs7QUFRWCxRQUFRLENBQUMsVUFBVSxFQUFFLFlBQU07QUFDekIsTUFBSSxRQUFRLFlBQUEsQ0FBQTs7QUFFWixZQUFVLENBQUMsWUFBTTtBQUNmLFlBQVEsR0FBRyw4QkFBYyxDQUFBO0dBQzFCLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDdEIsUUFBSSxNQUFNLFlBQUE7UUFBRSxPQUFPLFlBQUEsQ0FBQTs7QUFFbkIsYUFBUyxlQUFlLENBQUUsUUFBUSxFQUFrQjtVQUFoQixVQUFVLHlEQUFHLENBQUM7O0FBQ2hELFlBQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFBO0FBQ25FLFdBQUssQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDMUQsV0FBSyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUM1QyxjQUFNLEVBQUUsTUFBTTtBQUNkLGdCQUFRLEVBQUUsUUFBUTtPQUNuQixDQUFDLENBQUE7O0FBRUYsYUFBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFBO0FBQ3ZGLGFBQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFlBQU07QUFDNUIsZ0JBQVEsVUFBVTtBQUNoQixlQUFLLENBQUM7QUFBRTtBQUFFLHFCQUFPLE9BQU8sQ0FB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RCxZQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDaEQsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQyw0RUFBNEUsRUFBRSxZQUFNO0FBQ3JGLCtCQUFRLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNuRCwrQkFBUSxXQUFXLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUE7O0FBRTlELFlBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMvQyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L3NwZWMvY29tcG9zZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBoZWxwZXJzIGZyb20gJy4vc3BlYy1oZWxwZXJzJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzLXBsdXMnXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IENvbXBvc2VyIGZyb20gJy4uL2xpYi9jb21wb3NlcidcblxuZGVzY3JpYmUoJ0NvbXBvc2VyJywgKCkgPT4ge1xuICBsZXQgY29tcG9zZXJcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjb21wb3NlciA9IG5ldyBDb21wb3NlcigpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2J1aWxkJywgKCkgPT4ge1xuICAgIGxldCBlZGl0b3IsIGJ1aWxkZXJcblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemVTcGllcyAoZmlsZVBhdGgsIHN0YXR1c0NvZGUgPSAwKSB7XG4gICAgICBlZGl0b3IgPSBqYXNtaW5lLmNyZWF0ZVNweU9iaignTW9ja0VkaXRvcicsIFsnc2F2ZScsICdpc01vZGlmaWVkJ10pXG4gICAgICBzcHlPbihjb21wb3NlciwgJ3Jlc29sdmVSb290RmlsZVBhdGgnKS5hbmRSZXR1cm4oZmlsZVBhdGgpXG4gICAgICBzcHlPbihjb21wb3NlciwgJ2dldEVkaXRvckRldGFpbHMnKS5hbmRSZXR1cm4oe1xuICAgICAgICBlZGl0b3I6IGVkaXRvcixcbiAgICAgICAgZmlsZVBhdGg6IGZpbGVQYXRoXG4gICAgICB9KVxuXG4gICAgICBidWlsZGVyID0gamFzbWluZS5jcmVhdGVTcHlPYmooJ01vY2tCdWlsZGVyJywgWydydW4nLCAnY29uc3RydWN0QXJncycsICdwYXJzZUxvZ0ZpbGUnXSlcbiAgICAgIGJ1aWxkZXIucnVuLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXNDb2RlKSB7XG4gICAgICAgICAgY2FzZSAwOiB7IHJldHVybiBQcm9taXNlLnJlc29sdmUoc3RhdHVzQ29kZSkgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHN0YXR1c0NvZGUpXG4gICAgICB9KVxuICAgICAgc3B5T24obGF0ZXgsICdnZXRCdWlsZGVyJykuYW5kUmV0dXJuKGJ1aWxkZXIpXG4gICAgfVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzcHlPbihjb21wb3NlciwgJ3Nob3dSZXN1bHQnKS5hbmRSZXR1cm4oKVxuICAgICAgc3B5T24oY29tcG9zZXIsICdzaG93RXJyb3InKS5hbmRSZXR1cm4oKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBub3RoaW5nIGZvciBuZXcsIHVuc2F2ZWQgZmlsZXMnLCAoKSA9PiB7XG4gICAgICBpbml0aWFsaXplU3BpZXMobnVsbClcblxuICAgICAgbGV0IHJlc3VsdCA9ICdhYWFhYWFhYWFhYWEnXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29tcG9zZXIuYnVpbGQoKS5jYXRjaChyID0+IHJlc3VsdCA9IHIpXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlc3VsdCkudG9CZShmYWxzZSlcbiAgICAgICAgZXhwZWN0KGNvbXBvc2VyLnNob3dSZXN1bHQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGNvbXBvc2VyLnNob3dFcnJvcikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgbm90aGluZyBmb3IgdW5zdXBwb3J0ZWQgZmlsZSBleHRlbnNpb25zJywgKCkgPT4ge1xuICAgICAgaW5pdGlhbGl6ZVNwaWVzKCdmb28uYmFyJylcblxuICAgICAgbGV0IHJlc3VsdFxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbXBvc2VyLmJ1aWxkKCkuY2F0Y2gociA9PiByZXN1bHQgPSByKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmUoZmFsc2UpXG4gICAgICAgIGV4cGVjdChjb21wb3Nlci5zaG93UmVzdWx0KS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChjb21wb3Nlci5zaG93RXJyb3IpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdzYXZlcyB0aGUgZmlsZSBiZWZvcmUgYnVpbGRpbmcsIGlmIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgaW5pdGlhbGl6ZVNwaWVzKCdmaWxlLnRleCcpXG4gICAgICBlZGl0b3IuaXNNb2RpZmllZC5hbmRSZXR1cm4odHJ1ZSlcblxuICAgICAgYnVpbGRlci5wYXJzZUxvZ0ZpbGUuYW5kUmV0dXJuKHtcbiAgICAgICAgb3V0cHV0RmlsZVBhdGg6ICdmaWxlLnBkZicsXG4gICAgICAgIGVycm9yczogW10sXG4gICAgICAgIHdhcm5pbmdzOiBbXVxuICAgICAgfSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbXBvc2VyLmJ1aWxkKClcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLnNhdmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2ludm9rZXMgYHNob3dSZXN1bHRgIGFmdGVyIGEgc3VjY2Vzc2Z1bCBidWlsZCwgd2l0aCBleHBlY3RlZCBsb2cgcGFyc2luZyByZXN1bHQnLCAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIG91dHB1dEZpbGVQYXRoOiAnZmlsZS5wZGYnLFxuICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICB3YXJuaW5nczogW11cbiAgICAgIH1cblxuICAgICAgaW5pdGlhbGl6ZVNwaWVzKCdmaWxlLnRleCcpXG4gICAgICBidWlsZGVyLnBhcnNlTG9nRmlsZS5hbmRSZXR1cm4ocmVzdWx0KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29tcG9zZXIuYnVpbGQoKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChjb21wb3Nlci5zaG93UmVzdWx0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChyZXN1bHQpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgndHJlYXRzIG1pc3Npbmcgb3V0cHV0IGZpbGUgZGF0YSBpbiBsb2cgZmlsZSBhcyBhbiBlcnJvcicsICgpID0+IHtcbiAgICAgIGluaXRpYWxpemVTcGllcygnZmlsZS50ZXgnKVxuXG4gICAgICBidWlsZGVyLnBhcnNlTG9nRmlsZS5hbmRSZXR1cm4oe1xuICAgICAgICBvdXRwdXRGaWxlUGF0aDogbnVsbCxcbiAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgd2FybmluZ3M6IFtdXG4gICAgICB9KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29tcG9zZXIuYnVpbGQoKS5jYXRjaChyID0+IHIpXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNvbXBvc2VyLnNob3dFcnJvcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgndHJlYXRzIG1pc3NpbmcgcmVzdWx0IGZyb20gcGFyc2VyIGFzIGFuIGVycm9yJywgKCkgPT4ge1xuICAgICAgaW5pdGlhbGl6ZVNwaWVzKCdmaWxlLnRleCcpXG4gICAgICBidWlsZGVyLnBhcnNlTG9nRmlsZS5hbmRSZXR1cm4obnVsbClcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbXBvc2VyLmJ1aWxkKCkuY2F0Y2gociA9PiByKVxuICAgICAgfSlcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChjb21wb3Nlci5zaG93RXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoJ2hhbmRsZXMgYWN0aXZlIGl0ZW0gbm90IGJlaW5nIGEgdGV4dCBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4oKVxuICAgICAgc3B5T24oY29tcG9zZXIsICdnZXRFZGl0b3JEZXRhaWxzJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29tcG9zZXIuYnVpbGQoKS5jYXRjaChyID0+IHIpXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNvbXBvc2VyLmdldEVkaXRvckRldGFpbHMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdjbGVhbicsICgpID0+IHtcbiAgICBjb25zdCBleHRlbnNpb25zID0gWycuYmFyJywgJy5iYXonLCAnLnF1dXgnXVxuXG4gICAgZnVuY3Rpb24gZmFrZUZpbGVQYXRocyAoZmlsZVBhdGgpIHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoU2Fuc0V4dGVuc2lvbiA9IGZpbGVQYXRoLnN1YnN0cmluZygwLCBmaWxlUGF0aC5sYXN0SW5kZXhPZignLicpKVxuICAgICAgcmV0dXJuIGV4dGVuc2lvbnMubWFwKGV4dCA9PiBmaWxlUGF0aFNhbnNFeHRlbnNpb24gKyBleHQpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVNwaWVzIChmaWxlUGF0aCkge1xuICAgICAgc3B5T24oY29tcG9zZXIsICdnZXRFZGl0b3JEZXRhaWxzJykuYW5kUmV0dXJuKHtmaWxlUGF0aH0pXG4gICAgICBzcHlPbihjb21wb3NlciwgJ3Jlc29sdmVSb290RmlsZVBhdGgnKS5hbmRSZXR1cm4oZmlsZVBhdGgpXG4gICAgfVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzcHlPbihmcywgJ3JlbW92ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIGhlbHBlcnMuc3B5T25Db25maWcoJ2xhdGV4LmNsZWFuRXh0ZW5zaW9ucycsIGV4dGVuc2lvbnMpXG4gICAgfSlcblxuICAgIGl0KCdkZWxldGVzIGFsbCBmaWxlcyBmb3IgdGhlIGN1cnJlbnQgdGV4IGRvY3VtZW50IHdoZW4gb3V0cHV0IGhhcyBub3QgYmVlbiByZWRpcmVjdGVkJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLm5vcm1hbGl6ZSgnL2EvZm9vLnRleCcpXG4gICAgICBjb25zdCBmaWxlc1RvRGVsZXRlID0gZmFrZUZpbGVQYXRocyhmaWxlUGF0aClcbiAgICAgIGluaXRpYWxpemVTcGllcyhmaWxlUGF0aClcblxuICAgICAgbGV0IGNhbmRpZGF0ZVBhdGhzXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29tcG9zZXIuY2xlYW4oKS50aGVuKHJlc29sdXRpb25zID0+IHtcbiAgICAgICAgICBjYW5kaWRhdGVQYXRocyA9IF8ucGx1Y2socmVzb2x1dGlvbnMsICdmaWxlUGF0aCcpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGNhbmRpZGF0ZVBhdGhzKS50b0VxdWFsKGZpbGVzVG9EZWxldGUpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBpdCgnc3RvcHMgaW1taWRpYXRlbHkgaWYgdGhlIGZpbGUgaXMgbm90IGEgVGVYIGRvY3VtZW50JywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSAnZm9vLmJhcidcbiAgICAgIGluaXRpYWxpemVTcGllcyhmaWxlUGF0aCwgW10pXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBjb21wb3Nlci5jbGVhbigpLmNhdGNoKHIgPT4gcilcbiAgICAgIH0pXG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoY29tcG9zZXIucmVzb2x2ZVJvb3RGaWxlUGF0aCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZnMucmVtb3ZlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Nob3VsZE1vdmVSZXN1bHQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gZmFsc2Ugd2hlbiB1c2luZyBuZWl0aGVyIGFuIG91dHB1dCBkaXJlY3RvcnksIG5vciB0aGUgbW92ZSBvcHRpb24nLCAoKSA9PiB7XG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5vdXRwdXREaXJlY3RvcnknLCAnJylcbiAgICAgIGhlbHBlcnMuc3B5T25Db25maWcoJ2xhdGV4Lm1vdmVSZXN1bHRUb1NvdXJjZURpcmVjdG9yeScsIGZhbHNlKVxuXG4gICAgICBleHBlY3QoY29tcG9zZXIuc2hvdWxkTW92ZVJlc3VsdCgpKS50b0JlKGZhbHNlKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSB3aGVuIG5vdCB1c2luZyBhbiBvdXRwdXQgZGlyZWN0b3J5LCBidXQgdXNpbmcgdGhlIG1vdmUgb3B0aW9uJywgKCkgPT4ge1xuICAgICAgaGVscGVycy5zcHlPbkNvbmZpZygnbGF0ZXgub3V0cHV0RGlyZWN0b3J5JywgJycpXG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5tb3ZlUmVzdWx0VG9Tb3VyY2VEaXJlY3RvcnknLCB0cnVlKVxuXG4gICAgICBleHBlY3QoY29tcG9zZXIuc2hvdWxkTW92ZVJlc3VsdCgpKS50b0JlKGZhbHNlKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiBmYWxzZSB3aGVuIG5vdCB1c2luZyB0aGUgbW92ZSBvcHRpb24sIGJ1dCB1c2luZyBhbiBvdXRwdXQgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgaGVscGVycy5zcHlPbkNvbmZpZygnbGF0ZXgub3V0cHV0RGlyZWN0b3J5JywgJ2JheicpXG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5tb3ZlUmVzdWx0VG9Tb3VyY2VEaXJlY3RvcnknLCBmYWxzZSlcblxuICAgICAgZXhwZWN0KGNvbXBvc2VyLnNob3VsZE1vdmVSZXN1bHQoKSkudG9CZShmYWxzZSlcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gdHJ1ZSB3aGVuIHVzaW5nIGJvdGggYW4gb3V0cHV0IGRpcmVjdG9yeSBhbmQgdGhlIG1vdmUgb3B0aW9uJywgKCkgPT4ge1xuICAgICAgaGVscGVycy5zcHlPbkNvbmZpZygnbGF0ZXgub3V0cHV0RGlyZWN0b3J5JywgJ2JheicpXG4gICAgICBoZWxwZXJzLnNweU9uQ29uZmlnKCdsYXRleC5tb3ZlUmVzdWx0VG9Tb3VyY2VEaXJlY3RvcnknLCB0cnVlKVxuXG4gICAgICBleHBlY3QoY29tcG9zZXIuc2hvdWxkTW92ZVJlc3VsdCgpKS50b0JlKHRydWUpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/spec/composer-spec.js
