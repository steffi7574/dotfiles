function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

'use babel';

describe('Error Match', function () {
  var errorMatchAtomBuildFile = __dirname + '/fixture/.atom-build.error-match.json';
  var errorMatchNoFileBuildFile = __dirname + '/fixture/.atom-build.error-match-no-file.json';
  var errorMatchNLCAtomBuildFile = __dirname + '/fixture/.atom-build.error-match-no-line-col.json';
  var errorMatchMultiAtomBuildFile = __dirname + '/fixture/.atom-build.error-match-multiple.json';
  var errorMatchMultiFirstAtomBuildFile = __dirname + '/fixture/.atom-build.error-match-multiple-first.json';
  var errorMatchLongOutputAtomBuildFile = __dirname + '/fixture/.atom-build.error-match-long-output.json';
  var errorMatchMultiMatcherAtomBuildFile = __dirname + '/fixture/.atom-build.error-match-multiple-errorMatch.json';

  var directory = null;
  var workspaceElement = null;

  _temp2['default'].track();

  beforeEach(function () {
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + '/';
    atom.project.setPaths([directory]);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.scrollOnError', false);
    atom.config.set('build.notificationOnRefresh', true);
    atom.notifications.clear();

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return atom.packages.activatePackage('build');
    });
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when error matcher is configured incorrectly', function () {
    it('should show an error if regex is invalid', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'return 1',
        errorMatch: '(invalidRegex'
      }));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        expect(atom.notifications.getNotifications().length).toEqual(1);

        var notification = atom.notifications.getNotifications()[0];
        expect(notification.getType()).toEqual('error');
        expect(notification.getMessage()).toEqual('Error matching failed!');
        expect(notification.options.detail).toMatch(/Unterminated group/);
      });
    });
  });

  describe('when output is captured to show editor on error', function () {
    it('should place the line and column on error in correct file', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
      });
    });

    it('should give an error if matched file does not exist', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchNoFileBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.notifications.getNotifications().length > 0;
      });

      runs(function () {
        var notification = atom.notifications.getNotifications()[0];
        expect(notification.getType()).toEqual('error');
        expect(notification.getMessage()).toEqual('Error matching failed!');
      });
    });

    it('should open just the file if line and column is not available', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchNLCAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        expect(editor.getTitle()).toEqual('.atom-build.json');
      });
    });

    it('should cycle through the file if multiple error occurred', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchMultiAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
        atom.workspace.getActivePane().destroyActiveItem();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(1);
        expect(bufferPosition.column).toEqual(4);
        atom.workspace.getActivePane().destroyActiveItem();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
      });
    });

    it('should jump to first error', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchMultiFirstAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match-first');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
        atom.workspace.getActivePane().destroyActiveItem();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(1);
        expect(bufferPosition.column).toEqual(4);
        atom.workspace.getActivePane().destroyActiveItem();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match-first');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
      });
    });

    it('should open the the file even if tool gives absolute path', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo __' + directory + '.atom-build.json__ && return 1',
        errorMatch: '__(?<file>.+)__'
      }));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:error-match-first');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        expect(editor.getPath()).toEqual(directory + '.atom-build.json');
      });
    });

    it('should prepend `cwd` to the relative matched file if set', function () {
      var atomBuild = {
        cmd: 'echo __.atom-build.json__ && exit 1',
        cwd: directory,
        errorMatch: '__(?<file>.+)__'
      };
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify(atomBuild));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:error-match-first');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        // Error match one more time to make sure `cwd` isn't prepended multiple times
        atom.workspace.getActivePaneItem().destroy();
      });

      waitsFor(function () {
        return !atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:error-match-first');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        expect(editor.getPath()).toEqual(directory + '.atom-build.json');
      });
    });

    it('should auto match error on failed build when config is set', function () {
      atom.config.set('build.scrollOnError', true);

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
      });
    });

    it('should scroll the build panel to the text of the error', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchLongOutputAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waits(100);
      var firstScrollTop = undefined;
      runs(function () {
        firstScrollTop = workspaceElement.querySelector('.build .output').scrollTop;
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waits(100);
      runs(function () {
        expect(workspaceElement.querySelector('.build .output').scrollTop).toBeGreaterThan(firstScrollTop);
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waits(100);
      runs(function () {
        /* Should wrap around to first match */
        expect(workspaceElement.querySelector('.build .output').scrollTop).toEqual(firstScrollTop);
      });
    });

    it('match-first should scroll the build panel', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchLongOutputAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waits(100);
      var firstScrollTop = undefined;
      runs(function () {
        firstScrollTop = workspaceElement.querySelector('.build .output').scrollTop;
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waits(100);
      runs(function () {
        expect(workspaceElement.querySelector('.build .output').scrollTop).toBeGreaterThan(firstScrollTop);
        atom.commands.dispatch(workspaceElement, 'build:error-match-first');
      });

      waits(100);
      runs(function () {
        expect(workspaceElement.querySelector('.build .output').scrollTop).toEqual(firstScrollTop);
      });
    });

    it('should match multiple regexes in the correct order', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(errorMatchMultiMatcherAtomBuildFile));

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(2);
        expect(bufferPosition.column).toEqual(7);
        atom.workspace.getActivePane().destroyActiveItem();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(0);
        expect(bufferPosition.column).toEqual(1);
        atom.workspace.getActivePane().destroyActiveItem();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:error-match');
      });

      waitsFor(function () {
        return atom.workspace.getActiveTextEditor();
      });

      runs(function () {
        var editor = atom.workspace.getActiveTextEditor();
        var bufferPosition = editor.getCursorBufferPosition();
        expect(editor.getTitle()).toEqual('.atom-build.json');
        expect(bufferPosition.row).toEqual(1);
        expect(bufferPosition.column).toEqual(4);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2J1aWxkLWVycm9yLW1hdGNoLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7dUJBRWUsVUFBVTs7OztvQkFDUixNQUFNOzs7O29DQUNDLHlCQUF5Qjs7OztBQUpqRCxXQUFXLENBQUM7O0FBTVosUUFBUSxDQUFDLGFBQWEsRUFBRSxZQUFNO0FBQzVCLE1BQU0sdUJBQXVCLEdBQUcsU0FBUyxHQUFHLHVDQUF1QyxDQUFDO0FBQ3BGLE1BQU0seUJBQXlCLEdBQUcsU0FBUyxHQUFHLCtDQUErQyxDQUFDO0FBQzlGLE1BQU0sMEJBQTBCLEdBQUcsU0FBUyxHQUFHLG1EQUFtRCxDQUFDO0FBQ25HLE1BQU0sNEJBQTRCLEdBQUcsU0FBUyxHQUFHLGdEQUFnRCxDQUFDO0FBQ2xHLE1BQU0saUNBQWlDLEdBQUcsU0FBUyxHQUFHLHNEQUFzRCxDQUFDO0FBQzdHLE1BQU0saUNBQWlDLEdBQUcsU0FBUyxHQUFHLG1EQUFtRCxDQUFDO0FBQzFHLE1BQU0sbUNBQW1DLEdBQUcsU0FBUyxHQUFHLDJEQUEyRCxDQUFDOztBQUVwSCxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O0FBRTVCLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsYUFBUyxHQUFHLHFCQUFHLFlBQVksQ0FBQyxrQkFBSyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2xGLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUUsU0FBUyxDQUFFLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMs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QUFDLGlCQUFpQixFQUFFLENBQUM7T0FDcEQsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztPQUMvRCxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztPQUM3QyxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDcEQsWUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFDeEQsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3RELGNBQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLGNBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQzFDLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1lcnJvci1tYXRjaC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCBzcGVjSGVscGVycyBmcm9tICdhdG9tLWJ1aWxkLXNwZWMtaGVscGVycyc7XG5cbmRlc2NyaWJlKCdFcnJvciBNYXRjaCcsICgpID0+IHtcbiAgY29uc3QgZXJyb3JNYXRjaEF0b21CdWlsZEZpbGUgPSBfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuZXJyb3ItbWF0Y2guanNvbic7XG4gIGNvbnN0IGVycm9yTWF0Y2hOb0ZpbGVCdWlsZEZpbGUgPSBfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuZXJyb3ItbWF0Y2gtbm8tZmlsZS5qc29uJztcbiAgY29uc3QgZXJyb3JNYXRjaE5MQ0F0b21CdWlsZEZpbGUgPSBfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuZXJyb3ItbWF0Y2gtbm8tbGluZS1jb2wuanNvbic7XG4gIGNvbnN0IGVycm9yTWF0Y2hNdWx0aUF0b21CdWlsZEZpbGUgPSBfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuZXJyb3ItbWF0Y2gtbXVsdGlwbGUuanNvbic7XG4gIGNvbnN0IGVycm9yTWF0Y2hNdWx0aUZpcnN0QXRvbUJ1aWxkRmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5lcnJvci1tYXRjaC1tdWx0aXBsZS1maXJzdC5qc29uJztcbiAgY29uc3QgZXJyb3JNYXRjaExvbmdPdXRwdXRBdG9tQnVpbGRGaWxlID0gX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLmVycm9yLW1hdGNoLWxvbmctb3V0cHV0Lmpzb24nO1xuICBjb25zdCBlcnJvck1hdGNoTXVsdGlNYXRjaGVyQXRvbUJ1aWxkRmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5lcnJvci1tYXRjaC1tdWx0aXBsZS1lcnJvck1hdGNoLmpzb24nO1xuXG4gIGxldCBkaXJlY3RvcnkgPSBudWxsO1xuICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IG51bGw7XG5cbiAgdGVtcC50cmFjaygpO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGRpcmVjdG9yeSA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYyh7IHByZWZpeDogJ2F0b20tYnVpbGQtc3BlYy0nIH0pKSArICcvJztcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoWyBkaXJlY3RvcnkgXSk7XG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JywgJ1RvZ2dsZScpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc2F2ZU9uQnVpbGQnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5zY3JvbGxPbkVycm9yJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQubm90aWZpY2F0aW9uT25SZWZyZXNoJywgdHJ1ZSk7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmNsZWFyKCk7XG5cbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKTtcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ2NsZWFyVGltZW91dCcpO1xuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdidWlsZCcpO1xuICAgIH0pO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gZXJyb3IgbWF0Y2hlciBpcyBjb25maWd1cmVkIGluY29ycmVjdGx5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgc2hvdyBhbiBlcnJvciBpZiByZWdleCBpcyBpbnZhbGlkJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY21kOiAncmV0dXJuIDEnLFxuICAgICAgICBlcnJvck1hdGNoOiAnKGludmFsaWRSZWdleCdcbiAgICAgIH0pKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpLmxlbmd0aCkudG9FcXVhbCgxKTtcblxuICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpWzBdO1xuICAgICAgICBleHBlY3Qobm90aWZpY2F0aW9uLmdldFR5cGUoKSkudG9FcXVhbCgnZXJyb3InKTtcbiAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRNZXNzYWdlKCkpLnRvRXF1YWwoJ0Vycm9yIG1hdGNoaW5nIGZhaWxlZCEnKTtcbiAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5vcHRpb25zLmRldGFpbCkudG9NYXRjaCgvVW50ZXJtaW5hdGVkIGdyb3VwLyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gb3V0cHV0IGlzIGNhcHR1cmVkIHRvIHNob3cgZWRpdG9yIG9uIGVycm9yJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgcGxhY2UgdGhlIGxpbmUgYW5kIGNvbHVtbiBvbiBlcnJvciBpbiBjb3JyZWN0IGZpbGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkubm90LnRvRXhpc3QoKTtcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIGZzLnJlYWRGaWxlU3luYyhlcnJvck1hdGNoQXRvbUJ1aWxkRmlsZSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUaXRsZSgpKS50b0VxdWFsKCcuYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5yb3cpLnRvRXF1YWwoMik7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5jb2x1bW4pLnRvRXF1YWwoNyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZ2l2ZSBhbiBlcnJvciBpZiBtYXRjaGVkIGZpbGUgZG9lcyBub3QgZXhpc3QnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkubm90LnRvRXhpc3QoKTtcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIGZzLnJlYWRGaWxlU3luYyhlcnJvck1hdGNoTm9GaWxlQnVpbGRGaWxlKSk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBzcGVjSGVscGVycy5yZWZyZXNoQXdhaXRUYXJnZXRzKCkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKCkubGVuZ3RoID4gMDtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKVswXTtcbiAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi5nZXRUeXBlKCkpLnRvRXF1YWwoJ2Vycm9yJyk7XG4gICAgICAgIGV4cGVjdChub3RpZmljYXRpb24uZ2V0TWVzc2FnZSgpKS50b0VxdWFsKCdFcnJvciBtYXRjaGluZyBmYWlsZWQhJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgb3BlbiBqdXN0IHRoZSBmaWxlIGlmIGxpbmUgYW5kIGNvbHVtbiBpcyBub3QgYXZhaWxhYmxlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBmcy5yZWFkRmlsZVN5bmMoZXJyb3JNYXRjaE5MQ0F0b21CdWlsZEZpbGUpKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOmVycm9yLW1hdGNoJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGl0bGUoKSkudG9FcXVhbCgnLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGN5Y2xlIHRocm91Z2ggdGhlIGZpbGUgaWYgbXVsdGlwbGUgZXJyb3Igb2NjdXJyZWQnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkubm90LnRvRXhpc3QoKTtcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIGZzLnJlYWRGaWxlU3luYyhlcnJvck1hdGNoTXVsdGlBdG9tQnVpbGRGaWxlKSk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBzcGVjSGVscGVycy5yZWZyZXNoQXdhaXRUYXJnZXRzKCkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRpdGxlKCkpLnRvRXF1YWwoJy5hdG9tLWJ1aWxkLmpzb24nKTtcbiAgICAgICAgZXhwZWN0KGJ1ZmZlclBvc2l0aW9uLnJvdykudG9FcXVhbCgyKTtcbiAgICAgICAgZXhwZWN0KGJ1ZmZlclBvc2l0aW9uLmNvbHVtbikudG9FcXVhbCg3KTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOmVycm9yLW1hdGNoJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGl0bGUoKSkudG9FcXVhbCgnLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24ucm93KS50b0VxdWFsKDEpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24uY29sdW1uKS50b0VxdWFsKDQpO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZGVzdHJveUFjdGl2ZUl0ZW0oKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUaXRsZSgpKS50b0VxdWFsKCcuYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5yb3cpLnRvRXF1YWwoMik7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5jb2x1bW4pLnRvRXF1YWwoNyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQganVtcCB0byBmaXJzdCBlcnJvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgZnMucmVhZEZpbGVTeW5jKGVycm9yTWF0Y2hNdWx0aUZpcnN0QXRvbUJ1aWxkRmlsZSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gtZmlyc3QnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUaXRsZSgpKS50b0VxdWFsKCcuYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5yb3cpLnRvRXF1YWwoMik7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5jb2x1bW4pLnRvRXF1YWwoNyk7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5kZXN0cm95QWN0aXZlSXRlbSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRpdGxlKCkpLnRvRXF1YWwoJy5hdG9tLWJ1aWxkLmpzb24nKTtcbiAgICAgICAgZXhwZWN0KGJ1ZmZlclBvc2l0aW9uLnJvdykudG9FcXVhbCgxKTtcbiAgICAgICAgZXhwZWN0KGJ1ZmZlclBvc2l0aW9uLmNvbHVtbikudG9FcXVhbCg0KTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOmVycm9yLW1hdGNoLWZpcnN0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGl0bGUoKSkudG9FcXVhbCgnLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24ucm93KS50b0VxdWFsKDIpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24uY29sdW1uKS50b0VxdWFsKDcpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG9wZW4gdGhlIHRoZSBmaWxlIGV2ZW4gaWYgdG9vbCBnaXZlcyBhYnNvbHV0ZSBwYXRoJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY21kOiAnZWNobyBfXycgKyBkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbl9fICYmIHJldHVybiAxJyxcbiAgICAgICAgZXJyb3JNYXRjaDogJ19fKD88ZmlsZT4uKylfXydcbiAgICAgIH0pKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaC1maXJzdCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFBhdGgoKSkudG9FcXVhbChkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHByZXBlbmQgYGN3ZGAgdG8gdGhlIHJlbGF0aXZlIG1hdGNoZWQgZmlsZSBpZiBzZXQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBhdG9tQnVpbGQgPSB7XG4gICAgICAgIGNtZDogJ2VjaG8gX18uYXRvbS1idWlsZC5qc29uX18gJiYgZXhpdCAxJyxcbiAgICAgICAgY3dkOiBkaXJlY3RvcnksXG4gICAgICAgIGVycm9yTWF0Y2g6ICdfXyg/PGZpbGU+LispX18nXG4gICAgICB9O1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KGF0b21CdWlsZCkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOmVycm9yLW1hdGNoLWZpcnN0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAvLyBFcnJvciBtYXRjaCBvbmUgbW9yZSB0aW1lIHRvIG1ha2Ugc3VyZSBgY3dkYCBpc24ndCBwcmVwZW5kZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKS5kZXN0cm95KCk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gIWF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOmVycm9yLW1hdGNoLWZpcnN0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0UGF0aCgpKS50b0VxdWFsKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYXV0byBtYXRjaCBlcnJvciBvbiBmYWlsZWQgYnVpbGQgd2hlbiBjb25maWcgaXMgc2V0JywgKCkgPT4ge1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5zY3JvbGxPbkVycm9yJywgdHJ1ZSk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBmcy5yZWFkRmlsZVN5bmMoZXJyb3JNYXRjaEF0b21CdWlsZEZpbGUpKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGl0bGUoKSkudG9FcXVhbCgnLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24ucm93KS50b0VxdWFsKDIpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24uY29sdW1uKS50b0VxdWFsKDcpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHNjcm9sbCB0aGUgYnVpbGQgcGFuZWwgdG8gdGhlIHRleHQgb2YgdGhlIGVycm9yJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgZnMucmVhZEZpbGVTeW5jKGVycm9yTWF0Y2hMb25nT3V0cHV0QXRvbUJ1aWxkRmlsZSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0cygxMDApO1xuICAgICAgbGV0IGZpcnN0U2Nyb2xsVG9wO1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGZpcnN0U2Nyb2xsVG9wID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLm91dHB1dCcpLnNjcm9sbFRvcDtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0cygxMDApO1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAub3V0cHV0Jykuc2Nyb2xsVG9wKS50b0JlR3JlYXRlclRoYW4oZmlyc3RTY3JvbGxUb3ApO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzKDEwMCk7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgLyogU2hvdWxkIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1hdGNoICovXG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAub3V0cHV0Jykuc2Nyb2xsVG9wKS50b0VxdWFsKGZpcnN0U2Nyb2xsVG9wKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ21hdGNoLWZpcnN0IHNob3VsZCBzY3JvbGwgdGhlIGJ1aWxkIHBhbmVsJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgZnMucmVhZEZpbGVTeW5jKGVycm9yTWF0Y2hMb25nT3V0cHV0QXRvbUJ1aWxkRmlsZSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0cygxMDApO1xuICAgICAgbGV0IGZpcnN0U2Nyb2xsVG9wO1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGZpcnN0U2Nyb2xsVG9wID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLm91dHB1dCcpLnNjcm9sbFRvcDtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0cygxMDApO1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAub3V0cHV0Jykuc2Nyb2xsVG9wKS50b0JlR3JlYXRlclRoYW4oZmlyc3RTY3JvbGxUb3ApO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaC1maXJzdCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzKDEwMCk7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC5vdXRwdXQnKS5zY3JvbGxUb3ApLnRvRXF1YWwoZmlyc3RTY3JvbGxUb3ApO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG1hdGNoIG11bHRpcGxlIHJlZ2V4ZXMgaW4gdGhlIGNvcnJlY3Qgb3JkZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkubm90LnRvRXhpc3QoKTtcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIGZzLnJlYWRGaWxlU3luYyhlcnJvck1hdGNoTXVsdGlNYXRjaGVyQXRvbUJ1aWxkRmlsZSkpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUaXRsZSgpKS50b0VxdWFsKCcuYXRvbS1idWlsZC5qc29uJyk7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5yb3cpLnRvRXF1YWwoMik7XG4gICAgICAgIGV4cGVjdChidWZmZXJQb3NpdGlvbi5jb2x1bW4pLnRvRXF1YWwoNyk7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5kZXN0cm95QWN0aXZlSXRlbSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDplcnJvci1tYXRjaCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRpdGxlKCkpLnRvRXF1YWwoJy5hdG9tLWJ1aWxkLmpzb24nKTtcbiAgICAgICAgZXhwZWN0KGJ1ZmZlclBvc2l0aW9uLnJvdykudG9FcXVhbCgwKTtcbiAgICAgICAgZXhwZWN0KGJ1ZmZlclBvc2l0aW9uLmNvbHVtbikudG9FcXVhbCgxKTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKCk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOmVycm9yLW1hdGNoJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGl0bGUoKSkudG9FcXVhbCgnLmF0b20tYnVpbGQuanNvbicpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24ucm93KS50b0VxdWFsKDEpO1xuICAgICAgICBleHBlY3QoYnVmZmVyUG9zaXRpb24uY29sdW1uKS50b0VxdWFsKDQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/build/spec/build-error-match-spec.js
