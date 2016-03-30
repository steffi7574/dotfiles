Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _season = require('season');

var _season2 = _interopRequireDefault(_season);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

'use babel';

var DB = (function () {
  function DB() {
    var _this = this;

    var searchKey = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var searchValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, DB);

    this.setSearchQuery(searchKey, searchValue);
    this.emitter = new _atom.Emitter();

    _fs2['default'].exists(this.file(), function (exists) {
      if (exists) {
        _this.observeProjects();
      } else {
        _this.writeFile({});
      }
    });
  }

  _createClass(DB, [{
    key: 'setSearchQuery',
    value: function setSearchQuery() {
      var searchKey = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
      var searchValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this.searchKey = searchKey;
      this.searchValue = searchValue;
    }
  }, {
    key: 'find',
    value: function find(callback) {
      var _this2 = this;

      this.readFile(function (results) {
        var found = false;
        var projects = [];
        var project = null;
        var result = null;
        var template = null;
        var key = undefined;

        for (key in results) {
          result = results[key];
          template = result.template || null;
          result._id = key;

          if (template && results[template] !== null) {
            result = _underscorePlus2['default'].deepExtend(result, results[template]);
          }

          for (var i in result.paths) {
            if (typeof result.paths[i] !== 'string') {
              continue;
            }

            result.paths[i] = result.paths[i].replace('~', _os2['default'].homedir());
          }

          projects.push(result);
        }

        if (_this2.searchKey && _this2.searchValue) {
          for (key in projects) {
            project = projects[key];
            if (_underscorePlus2['default'].isEqual(project[_this2.searchKey], _this2.searchValue)) {
              found = project;
            }
          }
        } else {
          found = projects;
        }

        callback(found);
      });
    }
  }, {
    key: 'add',
    value: function add(props, callback) {
      var _this3 = this;

      this.readFile(function (projects) {
        var id = _this3.generateID(props.title);
        projects[id] = props;

        _this3.writeFile(projects, function () {
          atom.notifications.addSuccess(props.title + ' has been added');
          callback(id);
        });
      });
    }
  }, {
    key: 'update',
    value: function update(props) {
      var _this4 = this;

      if (!props._id) {
        return false;
      }

      var project = null;
      var key = undefined;
      this.readFile(function (projects) {
        for (key in projects) {
          project = projects[key];
          if (key === props._id) {
            delete props._id;
            projects[key] = props;
          }

          _this4.writeFile(projects);
        }
      });
    }
  }, {
    key: 'delete',
    value: function _delete(id, callback) {
      var _this5 = this;

      this.readFile(function (projects) {
        for (var key in projects) {
          if (key === id) {
            delete projects[key];
          }
        }

        _this5.writeFile(projects, function () {
          if (callback) {
            callback();
          }
        });
      });
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(callback) {
      var _this6 = this;

      this.emitter.on('db-updated', function () {
        _this6.find(callback);
      });
    }
  }, {
    key: 'observeProjects',
    value: function observeProjects() {
      var _this7 = this;

      if (this.fileWatcher) {
        this.fileWatcher.close();
      }

      try {
        this.fileWatcher = _fs2['default'].watch(this.file(), function () {
          _this7.emitter.emit('db-updated');
        });
      } catch (error) {
        var url = 'https://github.com/atom/atom/blob/master/docs/';
        url += 'build-instructions/linux.md#typeerror-unable-to-watch-path';
        var filename = _path2['default'].basename(this.file());
        var errorMessage = '<b>Project Manager</b><br>Could not watch changes\n        to ' + filename + '. Make sure you have permissions to ' + this.file() + '.\n        On linux there can be problems with watch sizes.\n        See <a href=\'' + url + '\'> this document</a> for more info.>';
        this.notifyFailure(errorMessage);
      }
    }
  }, {
    key: 'updateFile',
    value: function updateFile() {
      var _this8 = this;

      _fs2['default'].exists(this.file(true), function (exists) {
        if (!exists) {
          _this8.writeFile({});
        }
      });
    }
  }, {
    key: 'generateID',
    value: function generateID(string) {
      return string.replace(/\s+/g, '').toLowerCase();
    }
  }, {
    key: 'file',
    value: function file() {
      var filename = 'projects.cson';
      var filedir = atom.getConfigDirPath();

      if (this.environmentSpecificProjects) {
        var hostname = _os2['default'].hostname().split('.').shift().toLowerCase();
        filename = 'projects.' + hostname + '.cson';
      }

      return filedir + '/' + filename;
    }
  }, {
    key: 'readFile',
    value: function readFile(callback) {
      var _this9 = this;

      _fs2['default'].exists(this.file(), function (exists) {
        if (exists) {
          try {
            var projects = _season2['default'].readFileSync(_this9.file()) || {};
            callback(projects);
          } catch (error) {
            var message = 'Failed to load ' + _path2['default'].basename(_this9.file());
            var detail = error.location != null ? error.stack : error.message;
            _this9.notifyFailure(message, detail);
          }
        } else {
          _fs2['default'].writeFile(_this9.file(), '{}', function () {
            return callback({});
          });
        }
      });
    }
  }, {
    key: 'writeFile',
    value: function writeFile(projects, callback) {
      _season2['default'].writeFileSync(this.file(), projects);
      if (callback) {
        callback();
      }
    }
  }, {
    key: 'notifyFailure',
    value: function notifyFailure(message) {
      var detail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      atom.notifications.addError(message, {
        detail: detail,
        dismissable: true
      });
    }
  }, {
    key: 'environmentSpecificProjects',
    get: function get() {
      return atom.config.get('project-manager.environmentSpecificProjects');
    }
  }]);

  return DB;
})();

exports['default'] = DB;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL2RiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNCLE1BQU07O3NCQUNYLFFBQVE7Ozs7a0JBQ1YsSUFBSTs7OztvQkFDRixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7OEJBQ0wsaUJBQWlCOzs7O0FBUC9CLFdBQVcsQ0FBQzs7SUFTUyxFQUFFO0FBQ1YsV0FEUSxFQUFFLEdBQ3lCOzs7UUFBbEMsU0FBUyx5REFBQyxJQUFJO1FBQUUsV0FBVyx5REFBQyxJQUFJOzswQkFEekIsRUFBRTs7QUFFbkIsUUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDOztBQUU3QixvQkFBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFVBQUMsTUFBTSxFQUFLO0FBQ2pDLFVBQUksTUFBTSxFQUFFO0FBQ1YsY0FBSyxlQUFlLEVBQUUsQ0FBQztPQUN4QixNQUFNO0FBQ0wsY0FBSyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDcEI7S0FDRixDQUFDLENBQUM7R0FDSjs7ZUFaa0IsRUFBRTs7V0FrQlAsMEJBQW1DO1VBQWxDLFNBQVMseURBQUMsSUFBSTtVQUFFLFdBQVcseURBQUMsSUFBSTs7QUFDN0MsVUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsVUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7S0FDaEM7OztXQUVHLGNBQUMsUUFBUSxFQUFFOzs7QUFDYixVQUFJLENBQUMsUUFBUSxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ3ZCLFlBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixZQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsWUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFlBQUksTUFBTSxH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QUFDLE9BQUssSUFBSSxFQUFFLENBQUMsQUFBRSxDQUFDO0FBQy9ELGdCQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDcEUsbUJBQUssYUFBYSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztXQUNyQztTQUNGLE1BQU07QUFDTCwwQkFBRyxTQUFTLENBQUMsT0FBSyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUU7bUJBQU0sUUFBUSxDQUFDLEVBQUUsQ0FBQztXQUFBLENBQUMsQ0FBQztTQUNyRDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFUSxtQkFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzVCLDBCQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDMUMsVUFBSSxRQUFRLEVBQUU7QUFDWixnQkFBUSxFQUFFLENBQUM7T0FDWjtLQUNGOzs7V0FFWSx1QkFBQyxPQUFPLEVBQWU7VUFBYixNQUFNLHlEQUFDLElBQUk7O0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUNuQyxjQUFNLEVBQUUsTUFBTTtBQUNkLG1CQUFXLEVBQUUsSUFBSTtPQUNsQixDQUFDLENBQUM7S0FDSjs7O1NBckw4QixlQUFHO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQztLQUN2RTs7O1NBaEJrQixFQUFFOzs7cUJBQUYsRUFBRSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvcHJvamVjdC1tYW5hZ2VyL2xpYi9kYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENTT04gZnJvbSAnc2Vhc29uJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEQiB7XG4gIGNvbnN0cnVjdG9yKHNlYXJjaEtleT1udWxsLCBzZWFyY2hWYWx1ZT1udWxsKSB7XG4gICAgdGhpcy5zZXRTZWFyY2hRdWVyeShzZWFyY2hLZXksIHNlYXJjaFZhbHVlKTtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gICAgZnMuZXhpc3RzKHRoaXMuZmlsZSgpLCAoZXhpc3RzKSA9PiB7XG4gICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2ZVByb2plY3RzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndyaXRlRmlsZSh7fSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXQgZW52aXJvbm1lbnRTcGVjaWZpY1Byb2plY3RzKCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5lbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHMnKTtcbiAgfVxuXG4gIHNldFNlYXJjaFF1ZXJ5KHNlYXJjaEtleT1udWxsLCBzZWFyY2hWYWx1ZT1udWxsKSB7XG4gICAgdGhpcy5zZWFyY2hLZXkgPSBzZWFyY2hLZXk7XG4gICAgdGhpcy5zZWFyY2hWYWx1ZSA9IHNlYXJjaFZhbHVlO1xuICB9XG5cbiAgZmluZChjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocmVzdWx0cyA9PiB7XG4gICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgIGxldCBwcm9qZWN0cyA9IFtdO1xuICAgICAgbGV0IHByb2plY3QgPSBudWxsO1xuICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgICBsZXQgdGVtcGxhdGUgPSBudWxsO1xuICAgICAgbGV0IGtleTtcblxuICAgICAgZm9yIChrZXkgaW4gcmVzdWx0cykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHRzW2tleV07XG4gICAgICAgIHRlbXBsYXRlID0gcmVzdWx0LnRlbXBsYXRlIHx8IG51bGw7XG4gICAgICAgIHJlc3VsdC5faWQgPSBrZXk7XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlICYmIHJlc3VsdHNbdGVtcGxhdGVdICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVzdWx0ID0gXy5kZWVwRXh0ZW5kKHJlc3VsdCwgcmVzdWx0c1t0ZW1wbGF0ZV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSBpbiByZXN1bHQucGF0aHMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdC5wYXRoc1tpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdC5wYXRoc1tpXSA9IHJlc3VsdC5wYXRoc1tpXS5yZXBsYWNlKCd+Jywgb3MuaG9tZWRpcigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2plY3RzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc2VhcmNoS2V5ICYmIHRoaXMuc2VhcmNoVmFsdWUpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gcHJvamVjdHMpIHtcbiAgICAgICAgICBwcm9qZWN0ID0gcHJvamVjdHNba2V5XTtcbiAgICAgICAgICBpZiAoXy5pc0VxdWFsKHByb2plY3RbdGhpcy5zZWFyY2hLZXldLCB0aGlzLnNlYXJjaFZhbHVlKSkge1xuICAgICAgICAgICAgZm91bmQgPSBwcm9qZWN0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmQgPSBwcm9qZWN0cztcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZm91bmQpO1xuICAgIH0pO1xuICB9XG5cbiAgYWRkKHByb3BzLCBjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocHJvamVjdHMgPT4ge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLmdlbmVyYXRlSUQocHJvcHMudGl0bGUpO1xuICAgICAgcHJvamVjdHNbaWRdID0gcHJvcHM7XG5cbiAgICAgIHRoaXMud3JpdGVGaWxlKHByb2plY3RzLCAoKSA9PiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGAke3Byb3BzLnRpdGxlfSBoYXMgYmVlbiBhZGRlZGApO1xuICAgICAgICBjYWxsYmFjayhpZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZShwcm9wcykge1xuICAgIGlmICghcHJvcHMuX2lkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHByb2plY3QgPSBudWxsO1xuICAgIGxldCBrZXk7XG4gICAgdGhpcy5yZWFkRmlsZShwcm9qZWN0cyA9PiB7XG4gICAgICBmb3IgKGtleSBpbiBwcm9qZWN0cykge1xuICAgICAgICBwcm9qZWN0ID0gcHJvamVjdHNba2V5XTtcbiAgICAgICAgaWYgKGtleSA9PT0gcHJvcHMuX2lkKSB7XG4gICAgICAgICAgZGVsZXRlKHByb3BzLl9pZCk7XG4gICAgICAgICAgcHJvamVjdHNba2V5XSA9IHByb3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53cml0ZUZpbGUocHJvamVjdHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlKGlkLCBjYWxsYmFjaykge1xuICAgIHRoaXMucmVhZEZpbGUocHJvamVjdHMgPT4ge1xuICAgICAgZm9yIChsZXQga2V5IGluIHByb2plY3RzKSB7XG4gICAgICAgIGlmIChrZXkgPT09IGlkKSB7XG4gICAgICAgICAgZGVsZXRlKHByb2plY3RzW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMud3JpdGVGaWxlKHByb2plY3RzLCAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgb25VcGRhdGUoY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ2RiLXVwZGF0ZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLmZpbmQoY2FsbGJhY2spO1xuICAgIH0pO1xuICB9XG5cbiAgb2JzZXJ2ZVByb2plY3RzKCkge1xuICAgIGlmICh0aGlzLmZpbGVXYXRjaGVyKSB7XG4gICAgICB0aGlzLmZpbGVXYXRjaGVyLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZmlsZVdhdGNoZXIgPSBmcy53YXRjaCh0aGlzLmZpbGUoKSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGItdXBkYXRlZCcpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxldCB1cmwgPSAnaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL21hc3Rlci9kb2NzLyc7XG4gICAgICB1cmwgKz0gJ2J1aWxkLWluc3RydWN0aW9ucy9saW51eC5tZCN0eXBlZXJyb3ItdW5hYmxlLXRvLXdhdGNoLXBhdGgnO1xuICAgICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMuZmlsZSgpKTtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGA8Yj5Qcm9qZWN0IE1hbmFnZXI8L2I+PGJyPkNvdWxkIG5vdCB3YXRjaCBjaGFuZ2VzXG4gICAgICAgIHRvICR7ZmlsZW5hbWV9LiBNYWtlIHN1cmUgeW91IGhhdmUgcGVybWlzc2lvbnMgdG8gJHt0aGlzLmZpbGUoKX0uXG4gICAgICAgIE9uIGxpbnV4IHRoZXJlIGNhbiBiZSBwcm9ibGVtcyB3aXRoIHdhdGNoIHNpemVzLlxuICAgICAgICBTZWUgPGEgaHJlZj0nJHt1cmx9Jz4gdGhpcyBkb2N1bWVudDwvYT4gZm9yIG1vcmUgaW5mby4+YDtcbiAgICAgIHRoaXMubm90aWZ5RmFpbHVyZShlcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUZpbGUoKSB7XG4gICAgZnMuZXhpc3RzKHRoaXMuZmlsZSh0cnVlKSwgKGV4aXN0cykgPT4ge1xuICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgdGhpcy53cml0ZUZpbGUoe30pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2VuZXJhdGVJRChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1xccysvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBmaWxlKCkge1xuICAgIGxldCBmaWxlbmFtZSA9ICdwcm9qZWN0cy5jc29uJztcbiAgICBjb25zdCBmaWxlZGlyID0gYXRvbS5nZXRDb25maWdEaXJQYXRoKCk7XG5cbiAgICBpZiAodGhpcy5lbnZpcm9ubWVudFNwZWNpZmljUHJvamVjdHMpIHtcbiAgICAgIGxldCBob3N0bmFtZSA9IG9zLmhvc3RuYW1lKCkuc3BsaXQoJy4nKS5zaGlmdCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBmaWxlbmFtZSA9IGBwcm9qZWN0cy4ke2hvc3RuYW1lfS5jc29uYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7ZmlsZWRpcn0vJHtmaWxlbmFtZX1gO1xuICB9XG5cbiAgcmVhZEZpbGUoY2FsbGJhY2spIHtcbiAgICBmcy5leGlzdHModGhpcy5maWxlKCksIChleGlzdHMpID0+IHtcbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgcHJvamVjdHMgPSBDU09OLnJlYWRGaWxlU3luYyh0aGlzLmZpbGUoKSkgfHwge307XG4gICAgICAgICAgY2FsbGJhY2socHJvamVjdHMpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgRmFpbGVkIHRvIGxvYWQgJHtwYXRoLmJhc2VuYW1lKHRoaXMuZmlsZSgpKX1gO1xuICAgICAgICAgIGNvbnN0IGRldGFpbCA9IGVycm9yLmxvY2F0aW9uICE9IG51bGwgPyBlcnJvci5zdGFjayA6IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgdGhpcy5ub3RpZnlGYWlsdXJlKG1lc3NhZ2UsIGRldGFpbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZzLndyaXRlRmlsZSh0aGlzLmZpbGUoKSwgJ3t9JywgKCkgPT4gY2FsbGJhY2soe30pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHdyaXRlRmlsZShwcm9qZWN0cywgY2FsbGJhY2spIHtcbiAgICBDU09OLndyaXRlRmlsZVN5bmModGhpcy5maWxlKCksIHByb2plY3RzKTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG5cbiAgbm90aWZ5RmFpbHVyZShtZXNzYWdlLCBkZXRhaWw9bnVsbCkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7XG4gICAgICBkZXRhaWw6IGRldGFpbCxcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/db.js
