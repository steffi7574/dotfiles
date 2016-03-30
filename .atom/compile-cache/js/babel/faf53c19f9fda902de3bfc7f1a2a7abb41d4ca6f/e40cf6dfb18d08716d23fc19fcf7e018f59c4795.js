function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _libAtomBuildJs = require('../lib/atom-build.js');

var _libAtomBuildJs2 = _interopRequireDefault(_libAtomBuildJs);

'use babel';

describe('custom provider', function () {
  var builder = undefined;
  var directory = null;

  _temp2['default'].track();

  beforeEach(function () {
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + '/';
    atom.project.setPaths([directory]);
    builder = new _libAtomBuildJs2['default'](directory);
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when .atom-build.cson exists', function () {
    it('it should be eligible targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });

    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['arg1', 'arg2']);
          expect(s.name).toEqual('Custom: Compose masterpiece');
          expect(s.sh).toEqual(false);
          expect(s.cwd).toEqual('/some/directory');
          expect(s.errorMatch).toEqual('(?<file>\\w+.js):(?<row>\\d+)');
        });
      });
    });
  });

  describe('when .atom-build.json exists', function () {
    it('it should be eligible targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });

    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('dd');
          expect(s.args).toEqual(['if=.atom-build.json']);
          expect(s.name).toEqual('Custom: Fly to moon');
        });
      });
    });
  });

  describe('when .atom-build.yml exists', function () {
    it('it should be eligible targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });

    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'yaml']);
          expect(s.name).toEqual('Custom: yaml conf');
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2N1c3RvbS1wcm92aWRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3VCQUVlLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7Ozs4QkFDQSxzQkFBc0I7Ozs7QUFKN0MsV0FBVyxDQUFDOztBQU1aLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxZQUFNO0FBQ2hDLE1BQUksT0FBTyxZQUFBLENBQUM7QUFDWixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRXJCLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsYUFBUyxHQUFHLHFCQUFHLFlBQVksQ0FBQyxrQkFBSyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2xGLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUUsU0FBUyxDQUFFLENBQUMsQ0FBQztBQUNyQyxXQUFPLEdBQUcsZ0NBQWUsU0FBUyxDQUFDLENBQUM7R0FDckMsQ0FBQyxDQUFDOztBQUVILFdBQVMsQ0FBQyxZQUFNO0FBQ2QseUJBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQzFCLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsOEJBQThCLEVBQUUsWUFBTTtBQUM3QyxNQUFFLENBQUMsK0JBQStCLEVBQUUsWUFBTTtBQUN4QywyQkFBRyxhQUFhLENBQUMsU0FBUyxHQUFHLGtCQUFrQixFQUFFLHFCQUFHLFlBQVksQ0FBQyxTQUFTLEdBQUcsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO0FBQzNHLFlBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDNUMsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQywyQkFBMkIsRUFBRSxZQUFNO0FBQ3BDLDJCQUFHLGFBQWEsQ0FB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QUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzVDLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsMkJBQTJCLEVBQUUsWUFBTTtBQUNwQywyQkFBRyxhQUFhLENBQUksU0FBUyxzQkFBbUIscUJBQUcsWUFBWSxDQUFJLFNBQVMsOEJBQTJCLENBQUMsQ0FBQztBQUN6RyxZQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUzQyxxQkFBZSxDQUFDLFlBQU07QUFDcEIsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUMxRCxjQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRSxDQUFDLENBQUM7QUFDN0QsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDN0MsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2N1c3RvbS1wcm92aWRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCBDdXN0b21GaWxlIGZyb20gJy4uL2xpYi9hdG9tLWJ1aWxkLmpzJztcblxuZGVzY3JpYmUoJ2N1c3RvbSBwcm92aWRlcicsICgpID0+IHtcbiAgbGV0IGJ1aWxkZXI7XG4gIGxldCBkaXJlY3RvcnkgPSBudWxsO1xuXG4gIHRlbXAudHJhY2soKTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBkaXJlY3RvcnkgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoeyBwcmVmaXg6ICdhdG9tLWJ1aWxkLXNwZWMtJyB9KSkgKyAnLyc7XG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFsgZGlyZWN0b3J5IF0pO1xuICAgIGJ1aWxkZXIgPSBuZXcgQ3VzdG9tRmlsZShkaXJlY3RvcnkpO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQuY3NvbiBleGlzdHMnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IHNob3VsZCBiZSBlbGlnaWJsZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuY3NvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuY3NvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcblxuICAgIGl0KCdpdCBzaG91bGQgcHJvdmlkZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuY3NvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuY3NvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKCkpLnRoZW4oc2V0dGluZ3MgPT4ge1xuICAgICAgICAgIGNvbnN0IHMgPSBzZXR0aW5nc1swXTtcbiAgICAgICAgICBleHBlY3Qocy5leGVjKS50b0VxdWFsKCdlY2hvJyk7XG4gICAgICAgICAgZXhwZWN0KHMuYXJncykudG9FcXVhbChbICdhcmcxJywgJ2FyZzInIF0pO1xuICAgICAgICAgIGV4cGVjdChzLm5hbWUpLnRvRXF1YWwoJ0N1c3RvbTogQ29tcG9zZSBtYXN0ZXJwaWVjZScpO1xuICAgICAgICAgIGV4cGVjdChzLnNoKS50b0VxdWFsKGZhbHNlKTtcbiAgICAgICAgICBleHBlY3Qocy5jd2QpLnRvRXF1YWwoJy9zb21lL2RpcmVjdG9yeScpO1xuICAgICAgICAgIGV4cGVjdChzLmVycm9yTWF0Y2gpLnRvRXF1YWwoJyg/PGZpbGU+XFxcXHcrLmpzKTooPzxyb3c+XFxcXGQrKScpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZC5qc29uIGV4aXN0cycsICgpID0+IHtcbiAgICBpdCgnaXQgc2hvdWxkIGJlIGVsaWdpYmxlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGAke2RpcmVjdG9yeX0uYXRvbS1idWlsZC5qc29uYCwgZnMucmVhZEZpbGVTeW5jKGAke19fZGlybmFtZX0vZml4dHVyZS8uYXRvbS1idWlsZC5qc29uYCkpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2l0IHNob3VsZCBwcm92aWRlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGAke2RpcmVjdG9yeX0uYXRvbS1idWlsZC5qc29uYCwgZnMucmVhZEZpbGVTeW5jKGAke19fZGlybmFtZX0vZml4dHVyZS8uYXRvbS1idWlsZC5qc29uYCkpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoKSkudGhlbihzZXR0aW5ncyA9PiB7XG4gICAgICAgICAgY29uc3QgcyA9IHNldHRpbmdzWzBdO1xuICAgICAgICAgIGV4cGVjdChzLmV4ZWMpLnRvRXF1YWwoJ2RkJyk7XG4gICAgICAgICAgZXhwZWN0KHMuYXJncykudG9FcXVhbChbICdpZj0uYXRvbS1idWlsZC5qc29uJyBdKTtcbiAgICAgICAgICBleHBlY3Qocy5uYW1lKS50b0VxdWFsKCdDdXN0b206IEZseSB0byBtb29uJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkLnltbCBleGlzdHMnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IHNob3VsZCBiZSBlbGlnaWJsZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhgJHtkaXJlY3Rvcnl9LmF0b20tYnVpbGQueW1sYCwgZnMucmVhZEZpbGVTeW5jKGAke19fZGlybmFtZX0vZml4dHVyZS8uYXRvbS1idWlsZC55bWxgKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnaXQgc2hvdWxkIHByb3ZpZGUgdGFyZ2V0cycsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoYCR7ZGlyZWN0b3J5fS5hdG9tLWJ1aWxkLnltbGAsIGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2ZpeHR1cmUvLmF0b20tYnVpbGQueW1sYCkpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoKSkudGhlbihzZXR0aW5ncyA9PiB7XG4gICAgICAgICAgY29uc3QgcyA9IHNldHRpbmdzWzBdO1xuICAgICAgICAgIGV4cGVjdChzLmV4ZWMpLnRvRXF1YWwoJ2VjaG8nKTtcbiAgICAgICAgICBleHBlY3Qocy5hcmdzKS50b0VxdWFsKFsgJ2hlbGxvJywgJ3dvcmxkJywgJ2Zyb20nLCAneWFtbCcgXSk7XG4gICAgICAgICAgZXhwZWN0KHMubmFtZSkudG9FcXVhbCgnQ3VzdG9tOiB5YW1sIGNvbmYnKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/spec/custom-provider-spec.js
