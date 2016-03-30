Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _werkzeug = require('./werkzeug');

'use babel';

function defineDefaultProperty(target, property) {
  var shadowProperty = '__' + property;
  var defaultGetter = 'getDefault' + _lodash2['default'].capitalize(property);

  Object.defineProperty(target, property, {
    get: function get() {
      if (!target[shadowProperty]) {
        target[shadowProperty] = target[defaultGetter].apply(target);
      }
      return target[shadowProperty];
    },

    set: function set(value) {
      target[shadowProperty] = value;
    }
  });
}

var Latex = (function () {
  function Latex() {
    _classCallCheck(this, Latex);

    this.createLogProxy();

    defineDefaultProperty(this, 'builder');
    defineDefaultProperty(this, 'logger');
    defineDefaultProperty(this, 'opener');

    this.observeOpenerConfig();
    this.observeBuilderConfig();
  }

  _createClass(Latex, [{
    key: 'getBuilder',
    value: function getBuilder() {
      return this.builder;
    }
  }, {
    key: 'getLogger',
    value: function getLogger() {
      return this.logger;
    }
  }, {
    key: 'getOpener',
    value: function getOpener() {
      return this.opener;
    }
  }, {
    key: 'setLogger',
    value: function setLogger(logger) {
      this.logger = logger;
    }
  }, {
    key: 'getDefaultBuilder',
    value: function getDefaultBuilder() {
      var BuilderClass = null;
      if (this.useLatexmk()) {
        BuilderClass = require('./builders/latexmk');
      } else {
        BuilderClass = require('./builders/texify');
      }
      return new BuilderClass();
    }
  }, {
    key: 'getDefaultLogger',
    value: function getDefaultLogger() {
      var ConsoleLogger = require('./loggers/console-logger');
      return new ConsoleLogger();
    }
  }, {
    key: 'getDefaultOpener',
    value: function getDefaultOpener() {
      var OpenerImpl = this.resolveOpenerImplementation(process.platform);
      if (OpenerImpl) {
        return new OpenerImpl();
      }

      if (this['__logger'] && this.log) {
        this.log.warning((0, _werkzeug.heredoc)('\n        No PDF opener found.\n        For cross-platform viewing, consider installing the pdf-view package.\n        '));
      }
    }
  }, {
    key: 'createLogProxy',
    value: function createLogProxy() {
      var _this = this;

      this.log = {
        error: function error(statusCode, result, builder) {
          _this.logger.error(statusCode, result, builder);
        },
        warning: function warning(message) {
          _this.logger.warning(message);
        },
        info: function info(message) {
          _this.logger.info(message);
        }
      };
    }
  }, {
    key: 'observeOpenerConfig',
    value: function observeOpenerConfig() {
      var _this2 = this;

      var callback = function callback() {
        _this2['__opener'] = _this2.getDefaultOpener();
      };
      atom.config.onDidChange('latex.alwaysOpenResultInAtom', callback);
      atom.config.onDidChange('latex.skimPath', callback);
      atom.config.onDidChange('latex.sumatraPath', callback);
      atom.config.onDidChange('latex.okularPath', callback);
    }
  }, {
    key: 'observeBuilderConfig',
    value: function observeBuilderConfig() {
      var _this3 = this;

      var callback = function callback() {
        _this3['__builder'] = _this3.getDefaultBuilder();
      };
      atom.config.onDidChange('latex.builder', callback);
    }
  }, {
    key: 'resolveOpenerImplementation',
    value: function resolveOpenerImplementation(platform) {
      if (this.hasPdfViewerPackage() && this.shouldOpenResultInAtom()) {
        return require('./openers/atompdf-opener');
      }

      if (this.viewerExecutableExists()) {
        return require('./openers/custom-opener');
      }

      switch (platform) {
        case 'darwin':
          if (this.skimExecutableExists()) {
            return require('./openers/skim-opener');
          }

          return require('./openers/preview-opener');

        case 'win32':
          if (this.sumatraExecutableExists()) {
            return require('./openers/sumatra-opener');
          }

          break;

        case 'linux':
          if (this.okularExecutableExists()) {
            return require('./openers/okular-opener');
          }
      }

      if (this.hasPdfViewerPackage()) {
        return require('./openers/atompdf-opener');
      }

      return null;
    }
  }, {
    key: 'hasPdfViewerPackage',
    value: function hasPdfViewerPackage() {
      return !!atom.packages.resolvePackagePath('pdf-view');
    }
  }, {
    key: 'shouldOpenResultInAtom',
    value: function shouldOpenResultInAtom() {
      return atom.config.get('latex.alwaysOpenResultInAtom');
    }
  }, {
    key: 'skimExecutableExists',
    value: function skimExecutableExists() {
      return _fsPlus2['default'].existsSync(atom.config.get('latex.skimPath'));
    }
  }, {
    key: 'sumatraExecutableExists',
    value: function sumatraExecutableExists() {
      return _fsPlus2['default'].existsSync(atom.config.get('latex.sumatraPath'));
    }
  }, {
    key: 'okularExecutableExists',
    value: function okularExecutableExists() {
      return _fsPlus2['default'].existsSync(atom.config.get('latex.okularPath'));
    }
  }, {
    key: 'viewerExecutableExists',
    value: function viewerExecutableExists() {
      return _fsPlus2['default'].existsSync(atom.config.get('latex.viewerPath'));
    }
  }, {
    key: 'useLatexmk',
    value: function useLatexmk() {
      return atom.config.get('latex.builder') === 'latexmk';
    }
  }]);

  return Latex;
})();

exports['default'] = Latex;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvbGF0ZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFZSxTQUFTOzs7O3NCQUNWLFFBQVE7Ozs7d0JBQ0EsWUFBWTs7QUFKbEMsV0FBVyxDQUFBOztBQU1YLFNBQVMscUJBQXFCLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUNoRCxNQUFNLGNBQWMsVUFBUSxRQUFRLEFBQUUsQ0FBQTtBQUN0QyxNQUFNLGFBQWEsa0JBQWdCLG9CQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsQUFBRSxDQUFBOztBQUUzRCxRQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDdEMsT0FBRyxFQUFFLGVBQVk7QUFDZixVQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFO0FBQzNCLGNBQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQzdEO0FBQ0QsYUFBTyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7S0FDOUI7O0FBRUQsT0FBRyxFQUFFLGFBQVUsS0FBSyxFQUFFO0FBQUUsWUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtLQUFFO0dBQ3pELENBQUMsQ0FBQTtDQUNIOztJQUVvQixLQUFLO0FBQ1osV0FETyxLQUFLLEdBQ1Q7MEJBREksS0FBSzs7QUFFdEIsUUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBOztBQUVyQix5QkFBcUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDdEMseUJBQXFCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3JDLHlCQUFxQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTs7QUFFckMsUUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7QUFDMUIsUUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7R0FDNUI7O2VBVmtCLEtBQUs7O1dBWWIsc0JBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7S0FBRTs7O1dBQzNCLHFCQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0tBQUU7OztXQUN6QixxQkFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUFFOzs7V0FFekIsbUJBQUMsTUFBTSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0tBQ3JCOzs7V0FFaUIsNkJBQUc7QUFDbkIsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFBO0FBQ3ZCLFVBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3JCLG9CQUFZLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7T0FDN0MsTUFBTTtBQUNMLG9CQUFZLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7T0FDNUM7QUFDRCxhQUFPLElBQUksWUFBWSxFQUFFLENBQUE7S0FDMUI7OztXQUVnQiw0QkFBRztBQUNsQixVQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RCxhQUFPLElBQUksYUFBYSxFQUFFLENBQUE7S0FDM0I7OztXQUVnQiw0QkFBRztBQUNsQixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3JFLFVBQUksVUFBVSxFQUFFO0FBQ2QsZUFBTyxJQUFJLFVBQVUsRUFBRSxDQUFBO09BQ3hCOztBQUVELFVBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDaEMsWUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsaUpBR2IsQ0FDSCxDQUFBO09BQ0Y7S0FDRjs7O1dBRWMsMEJBQUc7OztBQUNoQixVQUFJLENBQUMsR0FBRyxHQUFHO0FBQ1QsYUFBSyxFQUFFLGVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUs7QUFDdEMsZ0JBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1NBQy9DO0FBQ0QsZUFBTyxFQUFFLGlCQUFDLE9BQU8sRUFBSztBQUNwQixnQkFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQzdCO0FBQ0QsWUFBSSxFQUFFLGNBQUMsT0FBTyxFQUFLO0FBQ2pCLGdCQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDMUI7T0FDRixDQUFBO0tBQ0Y7OztXQUVtQiwrQkFBRzs7O0FBQ3JCLFVBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxHQUFTO0FBQUUsZUFBSyxVQUFVLENBQUMsR0FBRyxPQUFLLGdCQUFnQixFQUFFLENBQUE7T0FBRSxDQUFBO0FBQ3JFLFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLDhCQUE4QixFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ2pFLFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ25ELFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3RELFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3REOzs7V0FFb0IsZ0NBQUc7OztBQUN0QixVQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBUztBQUFFLGVBQUssV0FBVyxDQUFDLEdBQUcsT0FBSyxpQkFBaUIsRUFBRSxDQUFBO09BQUUsQ0FBQTtBQUN2RSxVQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDbkQ7OztXQUUyQixxQ0FBQyxRQUFRLEVBQUU7QUFDckMsVUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtBQUMvRCxlQUFPLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFBO09BQzNDOztBQUVELFVBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLEVBQUU7QUFDakMsZUFBTyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQTtPQUMxQzs7QUFFRCxjQUFRLFFBQVE7QUFDZCxhQUFLLFFBQVE7QUFDWCxjQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO0FBQy9CLG1CQUFPLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1dBQ3hDOztBQUVELGlCQUFPLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFBOztBQUFBLEFBRTVDLGFBQUssT0FBTztBQUNWLGNBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFLEVBQUU7QUFDbEMsbUJBQU8sT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUE7V0FDM0M7O0FBRUQsZ0JBQUs7O0FBQUEsQUFFUCxhQUFLLE9BQU87QUFDVixjQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxFQUFFO0FBQ2pDLG1CQUFPLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1dBQzFDO0FBQUEsT0FDSjs7QUFFRCxVQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO0FBQzlCLGVBQU8sT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUE7T0FDM0M7O0FBRUQsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1dBRW1CLCtCQUFHO0FBQ3JCLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUE7S0FDdEQ7OztXQUVzQixrQ0FBRztBQUN4QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUE7S0FDdkQ7OztXQUVvQixnQ0FBRztBQUN0QixhQUFPLG9CQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7S0FDeEQ7OztXQUV1QixtQ0FBRztBQUN6QixhQUFPLG9CQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUE7S0FDM0Q7OztXQUVzQixrQ0FBRztBQUN4QixhQUFPLG9CQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7S0FDMUQ7OztXQUVzQixrQ0FBRztBQUN4QixhQUFPLG9CQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7S0FDMUQ7OztXQUVVLHNCQUFHO0FBQ1osYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsS0FBSyxTQUFTLENBQUE7S0FDdEQ7OztTQTVJa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9sYXRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHtoZXJlZG9jfSBmcm9tICcuL3dlcmt6ZXVnJ1xuXG5mdW5jdGlvbiBkZWZpbmVEZWZhdWx0UHJvcGVydHkgKHRhcmdldCwgcHJvcGVydHkpIHtcbiAgY29uc3Qgc2hhZG93UHJvcGVydHkgPSBgX18ke3Byb3BlcnR5fWBcbiAgY29uc3QgZGVmYXVsdEdldHRlciA9IGBnZXREZWZhdWx0JHtfLmNhcGl0YWxpemUocHJvcGVydHkpfWBcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eSwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0YXJnZXRbc2hhZG93UHJvcGVydHldKSB7XG4gICAgICAgIHRhcmdldFtzaGFkb3dQcm9wZXJ0eV0gPSB0YXJnZXRbZGVmYXVsdEdldHRlcl0uYXBwbHkodGFyZ2V0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldFtzaGFkb3dQcm9wZXJ0eV1cbiAgICB9LFxuXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHsgdGFyZ2V0W3NoYWRvd1Byb3BlcnR5XSA9IHZhbHVlIH1cbiAgfSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF0ZXgge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5jcmVhdGVMb2dQcm94eSgpXG5cbiAgICBkZWZpbmVEZWZhdWx0UHJvcGVydHkodGhpcywgJ2J1aWxkZXInKVxuICAgIGRlZmluZURlZmF1bHRQcm9wZXJ0eSh0aGlzLCAnbG9nZ2VyJylcbiAgICBkZWZpbmVEZWZhdWx0UHJvcGVydHkodGhpcywgJ29wZW5lcicpXG5cbiAgICB0aGlzLm9ic2VydmVPcGVuZXJDb25maWcoKVxuICAgIHRoaXMub2JzZXJ2ZUJ1aWxkZXJDb25maWcoKVxuICB9XG5cbiAgZ2V0QnVpbGRlciAoKSB7IHJldHVybiB0aGlzLmJ1aWxkZXIgfVxuICBnZXRMb2dnZXIgKCkgeyByZXR1cm4gdGhpcy5sb2dnZXIgfVxuICBnZXRPcGVuZXIgKCkgeyByZXR1cm4gdGhpcy5vcGVuZXIgfVxuXG4gIHNldExvZ2dlciAobG9nZ2VyKSB7XG4gICAgdGhpcy5sb2dnZXIgPSBsb2dnZXJcbiAgfVxuXG4gIGdldERlZmF1bHRCdWlsZGVyICgpIHtcbiAgICBsZXQgQnVpbGRlckNsYXNzID0gbnVsbFxuICAgIGlmICh0aGlzLnVzZUxhdGV4bWsoKSkge1xuICAgICAgQnVpbGRlckNsYXNzID0gcmVxdWlyZSgnLi9idWlsZGVycy9sYXRleG1rJylcbiAgICB9IGVsc2Uge1xuICAgICAgQnVpbGRlckNsYXNzID0gcmVxdWlyZSgnLi9idWlsZGVycy90ZXhpZnknKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEJ1aWxkZXJDbGFzcygpXG4gIH1cblxuICBnZXREZWZhdWx0TG9nZ2VyICgpIHtcbiAgICBjb25zdCBDb25zb2xlTG9nZ2VyID0gcmVxdWlyZSgnLi9sb2dnZXJzL2NvbnNvbGUtbG9nZ2VyJylcbiAgICByZXR1cm4gbmV3IENvbnNvbGVMb2dnZXIoKVxuICB9XG5cbiAgZ2V0RGVmYXVsdE9wZW5lciAoKSB7XG4gICAgY29uc3QgT3BlbmVySW1wbCA9IHRoaXMucmVzb2x2ZU9wZW5lckltcGxlbWVudGF0aW9uKHByb2Nlc3MucGxhdGZvcm0pXG4gICAgaWYgKE9wZW5lckltcGwpIHtcbiAgICAgIHJldHVybiBuZXcgT3BlbmVySW1wbCgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXNbJ19fbG9nZ2VyJ10gJiYgdGhpcy5sb2cpIHtcbiAgICAgIHRoaXMubG9nLndhcm5pbmcoaGVyZWRvYyhgXG4gICAgICAgIE5vIFBERiBvcGVuZXIgZm91bmQuXG4gICAgICAgIEZvciBjcm9zcy1wbGF0Zm9ybSB2aWV3aW5nLCBjb25zaWRlciBpbnN0YWxsaW5nIHRoZSBwZGYtdmlldyBwYWNrYWdlLlxuICAgICAgICBgKVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUxvZ1Byb3h5ICgpIHtcbiAgICB0aGlzLmxvZyA9IHtcbiAgICAgIGVycm9yOiAoc3RhdHVzQ29kZSwgcmVzdWx0LCBidWlsZGVyKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKHN0YXR1c0NvZGUsIHJlc3VsdCwgYnVpbGRlcilcbiAgICAgIH0sXG4gICAgICB3YXJuaW5nOiAobWVzc2FnZSkgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci53YXJuaW5nKG1lc3NhZ2UpXG4gICAgICB9LFxuICAgICAgaW5mbzogKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIuaW5mbyhtZXNzYWdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9ic2VydmVPcGVuZXJDb25maWcgKCkge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4geyB0aGlzWydfX29wZW5lciddID0gdGhpcy5nZXREZWZhdWx0T3BlbmVyKCkgfVxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsYXRleC5hbHdheXNPcGVuUmVzdWx0SW5BdG9tJywgY2FsbGJhY2spXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2xhdGV4LnNraW1QYXRoJywgY2FsbGJhY2spXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2xhdGV4LnN1bWF0cmFQYXRoJywgY2FsbGJhY2spXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2xhdGV4Lm9rdWxhclBhdGgnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9ic2VydmVCdWlsZGVyQ29uZmlnICgpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHsgdGhpc1snX19idWlsZGVyJ10gPSB0aGlzLmdldERlZmF1bHRCdWlsZGVyKCkgfVxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsYXRleC5idWlsZGVyJywgY2FsbGJhY2spXG4gIH1cblxuICByZXNvbHZlT3BlbmVySW1wbGVtZW50YXRpb24gKHBsYXRmb3JtKSB7XG4gICAgaWYgKHRoaXMuaGFzUGRmVmlld2VyUGFja2FnZSgpICYmIHRoaXMuc2hvdWxkT3BlblJlc3VsdEluQXRvbSgpKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZSgnLi9vcGVuZXJzL2F0b21wZGYtb3BlbmVyJylcbiAgICB9XG5cbiAgICBpZiAodGhpcy52aWV3ZXJFeGVjdXRhYmxlRXhpc3RzKCkpIHtcbiAgICAgIHJldHVybiByZXF1aXJlKCcuL29wZW5lcnMvY3VzdG9tLW9wZW5lcicpXG4gICAgfVxuXG4gICAgc3dpdGNoIChwbGF0Zm9ybSkge1xuICAgICAgY2FzZSAnZGFyd2luJzpcbiAgICAgICAgaWYgKHRoaXMuc2tpbUV4ZWN1dGFibGVFeGlzdHMoKSkge1xuICAgICAgICAgIHJldHVybiByZXF1aXJlKCcuL29wZW5lcnMvc2tpbS1vcGVuZXInKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoJy4vb3BlbmVycy9wcmV2aWV3LW9wZW5lcicpXG5cbiAgICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgICAgaWYgKHRoaXMuc3VtYXRyYUV4ZWN1dGFibGVFeGlzdHMoKSkge1xuICAgICAgICAgIHJldHVybiByZXF1aXJlKCcuL29wZW5lcnMvc3VtYXRyYS1vcGVuZXInKVxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnbGludXgnOlxuICAgICAgICBpZiAodGhpcy5va3VsYXJFeGVjdXRhYmxlRXhpc3RzKCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVxdWlyZSgnLi9vcGVuZXJzL29rdWxhci1vcGVuZXInKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFzUGRmVmlld2VyUGFja2FnZSgpKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZSgnLi9vcGVuZXJzL2F0b21wZGYtb3BlbmVyJylcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaGFzUGRmVmlld2VyUGFja2FnZSAoKSB7XG4gICAgcmV0dXJuICEhYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgoJ3BkZi12aWV3JylcbiAgfVxuXG4gIHNob3VsZE9wZW5SZXN1bHRJbkF0b20gKCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LmFsd2F5c09wZW5SZXN1bHRJbkF0b20nKVxuICB9XG5cbiAgc2tpbUV4ZWN1dGFibGVFeGlzdHMgKCkge1xuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKGF0b20uY29uZmlnLmdldCgnbGF0ZXguc2tpbVBhdGgnKSlcbiAgfVxuXG4gIHN1bWF0cmFFeGVjdXRhYmxlRXhpc3RzICgpIHtcbiAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LnN1bWF0cmFQYXRoJykpXG4gIH1cblxuICBva3VsYXJFeGVjdXRhYmxlRXhpc3RzICgpIHtcbiAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4Lm9rdWxhclBhdGgnKSlcbiAgfVxuXG4gIHZpZXdlckV4ZWN1dGFibGVFeGlzdHMgKCkge1xuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKGF0b20uY29uZmlnLmdldCgnbGF0ZXgudmlld2VyUGF0aCcpKVxuICB9XG5cbiAgdXNlTGF0ZXhtayAoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGF0ZXguYnVpbGRlcicpID09PSAnbGF0ZXhtaydcbiAgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/latex.js
