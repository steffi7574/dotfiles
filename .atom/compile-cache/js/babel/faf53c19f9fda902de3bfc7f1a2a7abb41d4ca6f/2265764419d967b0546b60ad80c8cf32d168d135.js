function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

'use babel';

describe('Target', function () {
  var directory = null;
  var workspaceElement = null;

  _temp2['default'].track();

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.notificationOnRefresh', true);

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');
    jasmine.attachToDOM(workspaceElement);

    waitsForPromise(function () {
      return _atomBuildSpecHelpers2['default'].vouch(_temp2['default'].mkdir, { prefix: 'atom-build-spec-' }).then(function (dir) {
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        directory = dir + '/';
        atom.project.setPaths([directory]);
        return atom.packages.activatePackage('build');
      });
    });
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when multiple targets exists', function () {
    it('should list those targets in a SelectListView (from .atom-build.json)', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json').then(function () {
          return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
        });
      });

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        var targets = _lodash2['default'].map(workspaceElement.querySelectorAll('.select-list li.build-target'), function (el) {
          return el.textContent;
        });
        expect(targets).toEqual(['Custom: The default build', 'Custom: Some customized build']);
      });
    });

    it('should mark the first target as active', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json').then(function () {
          return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
        });
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        var el = workspaceElement.querySelector('.select-list li.build-target'); // querySelector selects the first element
        expect(el).toHaveClass('selected');
        expect(el).toHaveClass('active');
      });
    });

    it('should run the selected build', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json').then(function () {
          return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
        });
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement.querySelector('.select-list'), 'core:confirm');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build .output').textContent).toMatch(/default/);
      });
    });

    it('should run the default target if no selection has been made', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json').then(function () {
          return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
        });
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build .output').textContent).toMatch(/default/);
      });
    });

    it('run the selected target if selection has changed, and subsequent build should run that target', function () {
      waitsForPromise(function () {
        var file = __dirname + '/fixture/.atom-build.targets.json';
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].copy, file, directory + '/.atom-build.json').then(function () {
          return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
        });
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:select-active-target');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.build-target');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement.querySelector('.select-list'), 'core:move-down');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.select-list li.selected').textContent === 'Custom: Some customized build';
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement.querySelector('.select-list'), 'core:confirm');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build .output').textContent).toMatch(/customized/);
        atom.commands.dispatch(workspaceElement.querySelector('.build'), 'build:stop');
      });

      waitsFor(function () {
        return !workspaceElement.querySelector('.build');
      });

      runs(function () {
        atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build .output').textContent).toMatch(/customized/);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2J1aWxkLXRhcmdldHMtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztzQkFFYyxRQUFROzs7O3VCQUNQLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7OztvQ0FDQyx5QkFBeUI7Ozs7QUFMakQsV0FBVyxDQUFDOztBQU9aLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBTTtBQUN2QixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O0FBRTVCLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2Ysb0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFckQsV0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDcEMsV0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEMsV0FBTyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUV0QyxtQkFBZSxDQUFDLFlBQU07QUFDcEIsYUFBTyxrQ0FBWSxLQUFLLENBQUMsa0JBQUssS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENB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Qzs7QUFFSCxjQUFRLENBQUMsWUFBTTtBQUNiLGVBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDbEQsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7T0FDM0QsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQ3BELGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ2pGLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDNUYsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2J1aWxkLXRhcmdldHMtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnO1xuaW1wb3J0IHNwZWNIZWxwZXJzIGZyb20gJ2F0b20tYnVpbGQtc3BlYy1oZWxwZXJzJztcblxuZGVzY3JpYmUoJ1RhcmdldCcsICgpID0+IHtcbiAgbGV0IGRpcmVjdG9yeSA9IG51bGw7XG4gIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gbnVsbDtcblxuICB0ZW1wLnRyYWNrKCk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JywgJ1RvZ2dsZScpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc2F2ZU9uQnVpbGQnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5ub3RpZmljYXRpb25PblJlZnJlc2gnLCB0cnVlKTtcblxuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnc2V0VGltZW91dCcpO1xuICAgIGphc21pbmUudW5zcHkod2luZG93LCAnY2xlYXJUaW1lb3V0Jyk7XG4gICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2godGVtcC5ta2RpciwgeyBwcmVmaXg6ICdhdG9tLWJ1aWxkLXNwZWMtJyB9KS50aGVuKChkaXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHNwZWNIZWxwZXJzLnZvdWNoKGZzLnJlYWxwYXRoLCBkaXIpO1xuICAgICAgfSkudGhlbigoZGlyKSA9PiB7XG4gICAgICAgIGRpcmVjdG9yeSA9IGRpciArICcvJztcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFsgZGlyZWN0b3J5IF0pO1xuICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2J1aWxkJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBmcy5yZW1vdmVTeW5jKGRpcmVjdG9yeSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIG11bHRpcGxlIHRhcmdldHMgZXhpc3RzJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgbGlzdCB0aG9zZSB0YXJnZXRzIGluIGEgU2VsZWN0TGlzdFZpZXcgKGZyb20gLmF0b20tYnVpbGQuanNvbiknLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLnRhcmdldHMuanNvbic7XG4gICAgICAgIHJldHVybiBzcGVjSGVscGVycy52b3VjaChmcy5jb3B5LCBmaWxlLCBkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLmpzb24nKVxuICAgICAgICAgIC50aGVuKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDpzZWxlY3QtYWN0aXZlLXRhcmdldCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1saXN0IGxpLmJ1aWxkLXRhcmdldCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gXy5tYXAod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0JyksIGVsID0+IGVsLnRleHRDb250ZW50KTtcbiAgICAgICAgZXhwZWN0KHRhcmdldHMpLnRvRXF1YWwoWyAnQ3VzdG9tOiBUaGUgZGVmYXVsdCBidWlsZCcsICdDdXN0b206IFNvbWUgY3VzdG9taXplZCBidWlsZCcgXSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbWFyayB0aGUgZmlyc3QgdGFyZ2V0IGFzIGFjdGl2ZScsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQudGFyZ2V0cy5qc29uJztcbiAgICAgICAgcmV0dXJuIHNwZWNIZWxwZXJzLnZvdWNoKGZzLmNvcHksIGZpbGUsIGRpcmVjdG9yeSArICcvLmF0b20tYnVpbGQuanNvbicpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6c2VsZWN0LWFjdGl2ZS10YXJnZXQnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbGlzdCBsaS5idWlsZC10YXJnZXQnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWxlY3QtbGlzdCBsaS5idWlsZC10YXJnZXQnKTsgLy8gcXVlcnlTZWxlY3RvciBzZWxlY3RzIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICAgIGV4cGVjdChlbCkudG9IYXZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgIGV4cGVjdChlbCkudG9IYXZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIHJ1biB0aGUgc2VsZWN0ZWQgYnVpbGQnLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWxlID0gX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLnRhcmdldHMuanNvbic7XG4gICAgICAgIHJldHVybiBzcGVjSGVscGVycy52b3VjaChmcy5jb3B5LCBmaWxlLCBkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLmpzb24nKVxuICAgICAgICAgIC50aGVuKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnNlbGVjdC1hY3RpdmUtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QgbGkuYnVpbGQtdGFyZ2V0Jyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QnKSwgJ2NvcmU6Y29uZmlybScpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAub3V0cHV0JykudGV4dENvbnRlbnQpLnRvTWF0Y2goL2RlZmF1bHQvKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBydW4gdGhlIGRlZmF1bHQgdGFyZ2V0IGlmIG5vIHNlbGVjdGlvbiBoYXMgYmVlbiBtYWRlJywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC50YXJnZXRzLmpzb24nO1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMuY29weSwgZmlsZSwgZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5qc29uJylcbiAgICAgICAgICAudGhlbigoKSA9PiBzcGVjSGVscGVycy5yZWZyZXNoQXdhaXRUYXJnZXRzKCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC5vdXRwdXQnKS50ZXh0Q29udGVudCkudG9NYXRjaCgvZGVmYXVsdC8pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgncnVuIHRoZSBzZWxlY3RlZCB0YXJnZXQgaWYgc2VsZWN0aW9uIGhhcyBjaGFuZ2VkLCBhbmQgc3Vic2VxdWVudCBidWlsZCBzaG91bGQgcnVuIHRoYXQgdGFyZ2V0JywgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC50YXJnZXRzLmpzb24nO1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMuY29weSwgZmlsZSwgZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5qc29uJylcbiAgICAgICAgICAudGhlbigoKSA9PiBzcGVjSGVscGVycy5yZWZyZXNoQXdhaXRUYXJnZXRzKCkpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDpzZWxlY3QtYWN0aXZlLXRhcmdldCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1saXN0IGxpLmJ1aWxkLXRhcmdldCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1saXN0JyksICdjb3JlOm1vdmUtZG93bicpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlbGVjdC1saXN0IGxpLnNlbGVjdGVkJykudGV4dENvbnRlbnQgPT09ICdDdXN0b206IFNvbWUgY3VzdG9taXplZCBidWlsZCc7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2VsZWN0LWxpc3QnKSwgJ2NvcmU6Y29uZmlybScpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAub3V0cHV0JykudGV4dENvbnRlbnQpLnRvTWF0Y2goL2N1c3RvbWl6ZWQvKTtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpLCAnYnVpbGQ6c3RvcCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuICF3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJyk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC5vdXRwdXQnKS50ZXh0Q29udGVudCkudG9NYXRjaCgvY3VzdG9taXplZC8pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/build/spec/build-targets-spec.js
