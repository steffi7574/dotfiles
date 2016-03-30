Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.provideBuilder = provideBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _child_process = require('child_process');

var _voucher = require('voucher');

var _voucher2 = _interopRequireDefault(_voucher);

var _events = require('events');

'use babel';

var config = {
  jobs: {
    title: 'Simultaneous jobs',
    description: 'Limits how many jobs make will run simultaneously. Defaults to number of processors. Set to 1 for default behavior of make.',
    type: 'number',
    'default': _os2['default'].cpus().length,
    minimum: 1,
    maximum: _os2['default'].cpus().length,
    order: 1
  },
  useMake: {
    title: 'Target extraction with make',
    description: 'Use `make` to extract targets. This may yield unwanted targets, or take a long time and a lot of resource.',
    type: 'boolean',
    'default': false,
    order: 2
  }
};

exports.config = config;

function provideBuilder() {
  return (function (_EventEmitter) {
    _inherits(MakeBuildProvider, _EventEmitter);

    function MakeBuildProvider(cwd) {
      var _this = this;

      _classCallCheck(this, MakeBuildProvider);

      _get(Object.getPrototypeOf(MakeBuildProvider.prototype), 'constructor', this).call(this);
      this.cwd = cwd;
      atom.config.observe('build-make.jobs', function () {
        return _this.emit('refresh');
      });
    }

    _createClass(MakeBuildProvider, [{
      key: 'getNiceName',
      value: function getNiceName() {
        return 'GNU Make';
      }
    }, {
      key: 'isEligible',
      value: function isEligible() {
        var _this2 = this;

        this.files = ['Makefile', 'GNUmakefile', 'makefile'].map(function (f) {
          return _path2['default'].join(_this2.cwd, f);
        }).filter(_fs2['default'].existsSync);
        return this.files.length > 0;
      }
    }, {
      key: 'settings',
      value: function settings() {
        var args = ['-j' + atom.config.get('build-make.jobs')];

        var defaultTarget = {
          exec: 'make',
          name: 'GNU Make: default (no target)',
          args: args,
          sh: false
        };

        var promise = atom.config.get('build-make.useMake') ? (0, _voucher2['default'])(_child_process.exec, 'make -prRn', { cwd: this.cwd }) : (0, _voucher2['default'])(_fs2['default'].readFile, this.files[0]); // Only take the first file

        return promise.then(function (output) {
          return [defaultTarget].concat(output.toString('utf8').split(/[\r\n]{1,2}/).filter(function (line) {
            return (/^[a-zA-Z0-9][^$#\/\t=]*:([^=]|$)/.test(line)
            );
          }).map(function (targetLine) {
            return targetLine.split(':').shift();
          }).map(function (target) {
            return {
              exec: 'make',
              args: args.concat([target]),
              name: 'GNU Make: ' + target,
              sh: false
            };
          }));
        })['catch'](function (e) {
          return [defaultTarget];
        });
      }
    }]);

    return MakeBuildProvider;
  })(_events.EventEmitter);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC1tYWtlL2xpYi9tYWtlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBRWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7NkJBQ0UsZUFBZTs7dUJBQ2hCLFNBQVM7Ozs7c0JBQ0EsUUFBUTs7QUFQckMsV0FBVyxDQUFDOztBQVNMLElBQU0sTUFBTSxHQUFHO0FBQ3BCLE1BQUksRUFBRTtBQUNKLFNBQUssRUFBRSxtQkFBbUI7QUFDMUIsZUFBVyxFQUFFLDZIQUE2SDtBQUMxSSxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsZ0JBQUcsSUFBSSxFQUFFLENBQUMsTUFBTTtBQUN6QixXQUFPLEVBQUUsQ0FBQztBQUNWLFdBQU8sRUFBRSxnQkFBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNO0FBQ3pCLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxTQUFPLEVBQUU7QUFDUCxTQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGVBQVcsRUFBRSw0R0FBNEc7QUFDekgsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0NBQ0YsQ0FBQzs7OztBQUVLLFNBQVMsY0FBYyxHQUFHO0FBQy9CO2NBQWEsaUJBQWlCOztBQUNqQixhQURBLGlCQUFpQixDQUNoQixHQUFHLEVBQUU7Ozs0QkFETixpQkFBaUI7O0FBRTFCLGlDQUZTLGlCQUFpQiw2Q0FFbEI7QUFDUixVQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNmLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsU0FBUyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ3BFOztpQkFMVSxpQkFBaUI7O2FBT2pCLHVCQUFHO0FBQ1osZUFBTyxVQUFVLENBQUM7T0FDbkI7OzthQUVTLHNCQUFHOzs7QUFDWCxZQUFJLENBQUMsS0FBSyxHQUFHLENBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUUsQ0FDbkQsR0FBRyxDQUFDLFVBQUEsQ0FBQztpQkFBSSxrQkFBSyxJQUFJLENBQUMsT0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQUEsQ0FBQyxDQUNoQyxNQUFNLENBQUMsZ0JBQUcsVUFBVSxDQUFDLENBQUM7QUFDekIsZUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7T0FDOUI7OzthQUVPLG9CQUFHO0FBQ1QsWUFBTSxJQUFJLEdBQUcsUUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFJLENBQUM7O0FBRTNELFlBQU0sYUFBYSxHQUFHO0FBQ3BCLGNBQUksRUFBRSxNQUFNO0FBQ1osY0FBSSxpQ0FBaUM7QUFDckMsY0FBSSxFQUFFLElBQUk7QUFDVixZQUFFLEVBQUUsS0FBSztTQUNWLENBQUM7O0FBRUYsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsR0FDbkQsK0NBQWMsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUM5QywwQkFBUSxnQkFBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV0QyxlQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDNUIsaUJBQU8sQ0FBRSxhQUFhLENBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FDcEQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUNwQixNQUFNLENBQUMsVUFBQSxJQUFJO21CQUFJLG1DQUFrQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7O1dBQUEsQ0FBQyxDQUM3RCxHQUFHLENBQUMsVUFBQSxVQUFVO21CQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1dBQUEsQ0FBQyxDQUNoRCxHQUFHLENBQUMsVUFBQSxNQUFNO21CQUFLO0FBQ2Qsa0JBQUksRUFBRSxNQUFNO0FBQ1osa0JBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUUsTUFBTSxDQUFFLENBQUM7QUFDN0Isa0JBQUksaUJBQWUsTUFBTSxBQUFFO0FBQzNCLGdCQUFFLEVBQUUsS0FBSzthQUNWO1dBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUixDQUFDLFNBQU0sQ0FBQyxVQUFBLENBQUM7aUJBQUksQ0FBRSxhQUFhLENBQUU7U0FBQSxDQUFDLENBQUM7T0FDbEM7OztXQTVDVSxpQkFBaUI7MkJBNkM1QjtDQUNIIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC1tYWtlL2xpYi9tYWtlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgdm91Y2hlciBmcm9tICd2b3VjaGVyJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGpvYnM6IHtcbiAgICB0aXRsZTogJ1NpbXVsdGFuZW91cyBqb2JzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xpbWl0cyBob3cgbWFueSBqb2JzIG1ha2Ugd2lsbCBydW4gc2ltdWx0YW5lb3VzbHkuIERlZmF1bHRzIHRvIG51bWJlciBvZiBwcm9jZXNzb3JzLiBTZXQgdG8gMSBmb3IgZGVmYXVsdCBiZWhhdmlvciBvZiBtYWtlLicsXG4gICAgdHlwZTogJ251bWJlcicsXG4gICAgZGVmYXVsdDogb3MuY3B1cygpLmxlbmd0aCxcbiAgICBtaW5pbXVtOiAxLFxuICAgIG1heGltdW06IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgb3JkZXI6IDFcbiAgfSxcbiAgdXNlTWFrZToge1xuICAgIHRpdGxlOiAnVGFyZ2V0IGV4dHJhY3Rpb24gd2l0aCBtYWtlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1VzZSBgbWFrZWAgdG8gZXh0cmFjdCB0YXJnZXRzLiBUaGlzIG1heSB5aWVsZCB1bndhbnRlZCB0YXJnZXRzLCBvciB0YWtlIGEgbG9uZyB0aW1lIGFuZCBhIGxvdCBvZiByZXNvdXJjZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMlxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBjbGFzcyBNYWtlQnVpbGRQcm92aWRlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5jd2QgPSBjd2Q7XG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdidWlsZC1tYWtlLmpvYnMnLCAoKSA9PiB0aGlzLmVtaXQoJ3JlZnJlc2gnKSk7XG4gICAgfVxuXG4gICAgZ2V0TmljZU5hbWUoKSB7XG4gICAgICByZXR1cm4gJ0dOVSBNYWtlJztcbiAgICB9XG5cbiAgICBpc0VsaWdpYmxlKCkge1xuICAgICAgdGhpcy5maWxlcyA9IFsgJ01ha2VmaWxlJywgJ0dOVW1ha2VmaWxlJywgJ21ha2VmaWxlJyBdXG4gICAgICAgIC5tYXAoZiA9PiBwYXRoLmpvaW4odGhpcy5jd2QsIGYpKVxuICAgICAgICAuZmlsdGVyKGZzLmV4aXN0c1N5bmMpO1xuICAgICAgcmV0dXJuIHRoaXMuZmlsZXMubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBzZXR0aW5ncygpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbIGAtaiR7YXRvbS5jb25maWcuZ2V0KCdidWlsZC1tYWtlLmpvYnMnKX1gIF07XG5cbiAgICAgIGNvbnN0IGRlZmF1bHRUYXJnZXQgPSB7XG4gICAgICAgIGV4ZWM6ICdtYWtlJyxcbiAgICAgICAgbmFtZTogYEdOVSBNYWtlOiBkZWZhdWx0IChubyB0YXJnZXQpYCxcbiAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgc2g6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwcm9taXNlID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1tYWtlLnVzZU1ha2UnKSA/XG4gICAgICAgIHZvdWNoZXIoZXhlYywgJ21ha2UgLXByUm4nLCB7IGN3ZDogdGhpcy5jd2QgfSkgOlxuICAgICAgICB2b3VjaGVyKGZzLnJlYWRGaWxlLCB0aGlzLmZpbGVzWzBdKTsgLy8gT25seSB0YWtlIHRoZSBmaXJzdCBmaWxlXG5cbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ob3V0cHV0ID0+IHtcbiAgICAgICAgcmV0dXJuIFsgZGVmYXVsdFRhcmdldCBdLmNvbmNhdChvdXRwdXQudG9TdHJpbmcoJ3V0ZjgnKVxuICAgICAgICAgIC5zcGxpdCgvW1xcclxcbl17MSwyfS8pXG4gICAgICAgICAgLmZpbHRlcihsaW5lID0+IC9eW2EtekEtWjAtOV1bXiQjXFwvXFx0PV0qOihbXj1dfCQpLy50ZXN0KGxpbmUpKVxuICAgICAgICAgIC5tYXAodGFyZ2V0TGluZSA9PiB0YXJnZXRMaW5lLnNwbGl0KCc6Jykuc2hpZnQoKSlcbiAgICAgICAgICAubWFwKHRhcmdldCA9PiAoe1xuICAgICAgICAgICAgZXhlYzogJ21ha2UnLFxuICAgICAgICAgICAgYXJnczogYXJncy5jb25jYXQoWyB0YXJnZXQgXSksXG4gICAgICAgICAgICBuYW1lOiBgR05VIE1ha2U6ICR7dGFyZ2V0fWAsXG4gICAgICAgICAgICBzaDogZmFsc2VcbiAgICAgICAgICB9KSkpO1xuICAgICAgfSkuY2F0Y2goZSA9PiBbIGRlZmF1bHRUYXJnZXQgXSk7XG4gICAgfVxuICB9O1xufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/build-make/lib/make.js
