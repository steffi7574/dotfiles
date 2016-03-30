Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _projects = require('./projects');

var _projects2 = _interopRequireDefault(_projects);

var _project = require('./project');

var _project2 = _interopRequireDefault(_project);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var ProjectsListView = (function (_SelectListView) {
  _inherits(ProjectsListView, _SelectListView);

  function ProjectsListView() {
    _classCallCheck(this, ProjectsListView);

    _get(Object.getPrototypeOf(ProjectsListView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProjectsListView, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(ProjectsListView.prototype), 'initialize', this).call(this);
      this.addClass('project-manager');
      this.projects = new _projects2['default']();
    }
  }, {
    key: 'activate',
    value: function activate() {
      // return new ProjectListView();
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      var input = this.filterEditorView.getText();
      var inputArr = input.split(':');
      var isFilterKey = _underscorePlus2['default'].contains(this.possibleFilterKeys, inputArr[0]);
      var filter = this.defaultFilterKey;

      if (inputArr.length > 1 && isFilterKey) {
        filter = inputArr[0];
      }

      return filter;
    }
  }, {
    key: 'getFilterQuery',
    value: function getFilterQuery() {
      var input = this.filterEditorView.getText();
      var inputArr = input.split(':');
      var filter = input;

      if (inputArr.length > 1) {
        filter = inputArr[1];
      }

      return filter;
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage(itemCount, filteredItemCount) {
      if (itemCount === 0) {
        return 'No projects saved yet';
      } else {
        _get(Object.getPrototypeOf(ProjectsListView.prototype), 'getEmptyMessage', this).call(this, itemCount, filteredItemCount);
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var _this = this;

      if (this.panel && this.panel.isVisible()) {
        this.close();
      } else {
        this.projects.getAll(function (projects) {
          return _this.show(projects);
        });
      }
    }
  }, {
    key: 'show',
    value: function show(projects) {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({ item: this });
      }

      this.panel.show();

      var items = [];
      var project = undefined;
      for (project of projects) {
        var data = project.props;
        data.pathMissing = false;
        try {
          var stats = _fs2['default'].statSync(project.props.paths[0]);
          data.pathStats = stats;
        } catch (e) {
          data.pathMissing = true;
        }

        items.push(data);
      }

      items = this.sortItems(items);
      this.setItems(items);
      this.focusFilterEditor();
    }
  }, {
    key: 'confirmed',
    value: function confirmed(props) {
      if (props && !props.pathMissing) {
        var project = new _project2['default'](props);
        project.open();
        this.close();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.panel) {
        this.panel.emitter.emit('did-destroy');
      }
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      this.close();
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(_ref) {
      var _id = _ref._id;
      var title = _ref.title;
      var group = _ref.group;
      var icon = _ref.icon;
      var devMode = _ref.devMode;
      var paths = _ref.paths;
      var pathMissing = _ref.pathMissing;

      var showPath = this.showPath;

      return (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.li({ 'class': 'two-lines' }, { 'data-project-id': _id, 'data-path-missing': pathMissing }, function () {
          _this2.div({ 'class': 'primary-line' }, function () {
            if (devMode) {
              _this2.span({ 'class': 'project-manager-devmode' });
            }

            _this2.div({ 'class': 'icon ' + icon }, function () {
              _this2.span(title);
              if (group != null) {
                _this2.span({ 'class': 'project-manager-list-group' }, group);
              }
            });
          });
          _this2.div({ 'class': 'secondary-line' }, function () {
            if (pathMissing) {
              _this2.div({ 'class': 'icon icon-alert' }, 'Path is not available');
            } else if (showPath) {
              var path = undefined;
              for (path of paths) {
                _this2.div({ 'class': 'no-icon' }, path);
              }
            }
          });
        });
      });
    }
  }, {
    key: 'sortItems',
    value: function sortItems(items) {
      var key = this.sortBy;
      if (key !== 'default') {
        items.sort(function (a, b) {
          a = (a[key] || '￿').toUpperCase();
          b = (b[key] || '￿').toUpperCase();

          return a > b ? 1 : -1;
        });
      }

      return items;
    }
  }, {
    key: 'possibleFilterKeys',
    get: function get() {
      return ['title', 'group', 'template'];
    }
  }, {
    key: 'defaultFilterKey',
    get: function get() {
      return 'title';
    }
  }, {
    key: 'sortBy',
    get: function get() {
      return atom.config.get('project-manager.sortBy');
    }
  }, {
    key: 'showPath',
    get: function get() {
      return atom.config.get('project-manager.showPath');
    }
  }]);

  return ProjectsListView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = ProjectsListView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3RzLWxpc3Qtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztpQ0FFaUMsc0JBQXNCOzs4QkFDekMsaUJBQWlCOzs7O3dCQUNWLFlBQVk7Ozs7dUJBQ2IsV0FBVzs7OztrQkFDaEIsSUFBSTs7OztBQU5uQixXQUFXLENBQUM7O0lBUVMsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7V0FBaEIsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7OytCQUFoQixnQkFBZ0I7OztlQUFoQixnQkFBZ0I7O1dBQ3pCLHNCQUFHO0FBQ1gsaUNBRmlCLGdCQUFnQiw0Q0FFZDtBQUNuQixVQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLFFBQVEsR0FBRywyQkFBYyxDQUFDO0tBQ2hDOzs7V0FFTyxvQkFBRzs7S0FFVjs7O1dBa0JXLHdCQUFHO0FBQ2IsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlDLFVBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsVUFBTSxXQUFXLEdBQUcsNEJBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7O0FBRW5DLFVBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksV0FBVyxFQUFFO0FBQ3RDLGNBQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDdEI7O0FBRUQsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRWEsMEJBQUc7QUFDZixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxF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QkFBSyxHQUFHLENBQUMsRUFBQyxTQUFPLFNBQVMsRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2VBQ3BDO2FBQ0Y7V0FDRixDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRVEsbUJBQUMsS0FBSyxFQUFFO0FBQ2YsVUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN4QixVQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7QUFDckIsYUFBSyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDbkIsV0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQVEsQ0FBQSxDQUFFLFdBQVcsRUFBRSxDQUFDO0FBQ3ZDLFdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFRLENBQUEsQ0FBRSxXQUFXLEVBQUUsQ0FBQzs7QUFFdkMsaUJBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDdkIsQ0FBQyxDQUFDO09BRUo7O0FBRUQsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1NBbkpxQixlQUFHO0FBQ3ZCLGFBQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3ZDOzs7U0FFbUIsZUFBRztBQUNyQixhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1NBRVMsZUFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUNsRDs7O1NBRVcsZUFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztLQUNwRDs7O1NBekJrQixnQkFBZ0I7OztxQkFBaEIsZ0JBQWdCIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3Byb2plY3RzLWxpc3Qtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge1NlbGVjdExpc3RWaWV3LCAkJH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJztcbmltcG9ydCBQcm9qZWN0cyBmcm9tICcuL3Byb2plY3RzJztcbmltcG9ydCBQcm9qZWN0IGZyb20gJy4vcHJvamVjdCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9qZWN0c0xpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXcge1xuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgICB0aGlzLmFkZENsYXNzKCdwcm9qZWN0LW1hbmFnZXInKTtcbiAgICB0aGlzLnByb2plY3RzID0gbmV3IFByb2plY3RzKCk7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICAvLyByZXR1cm4gbmV3IFByb2plY3RMaXN0VmlldygpO1xuICB9XG5cbiAgZ2V0IHBvc3NpYmxlRmlsdGVyS2V5cygpIHtcbiAgICByZXR1cm4gWyd0aXRsZScsICdncm91cCcsICd0ZW1wbGF0ZSddO1xuICB9XG5cbiAgZ2V0IGRlZmF1bHRGaWx0ZXJLZXkoKSB7XG4gICAgcmV0dXJuICd0aXRsZSc7XG4gIH1cblxuICBnZXQgc29ydEJ5KCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ3Byb2plY3QtbWFuYWdlci5zb3J0QnknKTtcbiAgfVxuXG4gIGdldCBzaG93UGF0aCgpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdwcm9qZWN0LW1hbmFnZXIuc2hvd1BhdGgnKTtcbiAgfVxuXG4gIGdldEZpbHRlcktleSgpIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMuZmlsdGVyRWRpdG9yVmlldy5nZXRUZXh0KCk7XG4gICAgY29uc3QgaW5wdXRBcnIgPSBpbnB1dC5zcGxpdCgnOicpO1xuICAgIGNvbnN0IGlzRmlsdGVyS2V5ID0gXy5jb250YWlucyh0aGlzLnBvc3NpYmxlRmlsdGVyS2V5cywgaW5wdXRBcnJbMF0pO1xuICAgIGxldCBmaWx0ZXIgPSB0aGlzLmRlZmF1bHRGaWx0ZXJLZXk7XG5cbiAgICBpZiAoaW5wdXRBcnIubGVuZ3RoID4gMSAmJiBpc0ZpbHRlcktleSkge1xuICAgICAgZmlsdGVyID0gaW5wdXRBcnJbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbHRlcjtcbiAgfVxuXG4gIGdldEZpbHRlclF1ZXJ5KCkge1xuICAgIGNvbnN0IGlucHV0ID0gdGhpcy5maWx0ZXJFZGl0b3JWaWV3LmdldFRleHQoKTtcbiAgICBjb25zdCBpbnB1dEFyciA9IGlucHV0LnNwbGl0KCc6Jyk7XG4gICAgbGV0IGZpbHRlciA9IGlucHV0O1xuXG4gICAgaWYgKGlucHV0QXJyLmxlbmd0aCA+IDEpIHtcbiAgICAgIGZpbHRlciA9IGlucHV0QXJyWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBmaWx0ZXI7XG4gIH1cblxuICBnZXRFbXB0eU1lc3NhZ2UoaXRlbUNvdW50LCBmaWx0ZXJlZEl0ZW1Db3VudCkge1xuICAgIGlmIChpdGVtQ291bnQgPT09IDApIHtcbiAgICAgIHJldHVybiAnTm8gcHJvamVjdHMgc2F2ZWQgeWV0JztcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIuZ2V0RW1wdHlNZXNzYWdlKGl0ZW1Db3VudCwgZmlsdGVyZWRJdGVtQ291bnQpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAmJiB0aGlzLnBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvamVjdHMuZ2V0QWxsKChwcm9qZWN0cykgPT4gdGhpcy5zaG93KHByb2plY3RzKSk7XG4gICAgfVxuICB9XG5cbiAgc2hvdyhwcm9qZWN0cykge1xuICAgIGlmICh0aGlzLnBhbmVsID09IG51bGwpIHtcbiAgICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiB0aGlzfSk7XG4gICAgfVxuXG4gICAgdGhpcy5wYW5lbC5zaG93KCk7XG5cbiAgICBsZXQgaXRlbXMgPSBbXTtcbiAgICBsZXQgcHJvamVjdDtcbiAgICBmb3IgKHByb2plY3Qgb2YgcHJvamVjdHMpIHtcbiAgICAgIGxldCBkYXRhID0gcHJvamVjdC5wcm9wcztcbiAgICAgIGRhdGEucGF0aE1pc3NpbmcgPSBmYWxzZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBzdGF0cyA9IGZzLnN0YXRTeW5jKHByb2plY3QucHJvcHMucGF0aHNbMF0pO1xuICAgICAgICBkYXRhLnBhdGhTdGF0cyA9IHN0YXRzO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkYXRhLnBhdGhNaXNzaW5nID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaXRlbXMucHVzaChkYXRhKTtcbiAgICB9XG5cbiAgICBpdGVtcyA9IHRoaXMuc29ydEl0ZW1zKGl0ZW1zKTtcbiAgICB0aGlzLnNldEl0ZW1zKGl0ZW1zKTtcbiAgICB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKCk7XG4gIH1cblxuICBjb25maXJtZWQocHJvcHMpIHtcbiAgICBpZiAocHJvcHMgJiYgIXByb3BzLnBhdGhNaXNzaW5nKSB7XG4gICAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFByb2plY3QocHJvcHMpO1xuICAgICAgcHJvamVjdC5vcGVuKCk7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgIHRoaXMucGFuZWwuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpO1xuICAgIH1cbiAgfVxuXG4gIGNhbmNlbGxlZCgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cblxuICB2aWV3Rm9ySXRlbSh7X2lkLCB0aXRsZSwgZ3JvdXAsIGljb24sIGRldk1vZGUsIHBhdGhzLCBwYXRoTWlzc2luZ30pIHtcbiAgICBsZXQgc2hvd1BhdGggPSB0aGlzLnNob3dQYXRoO1xuXG4gICAgcmV0dXJuICQkKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5saSh7Y2xhc3M6ICd0d28tbGluZXMnfSxcbiAgICAgIHsnZGF0YS1wcm9qZWN0LWlkJzogX2lkLCAnZGF0YS1wYXRoLW1pc3NpbmcnOiBwYXRoTWlzc2luZ30sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoe2NsYXNzOiAncHJpbWFyeS1saW5lJ30sICgpID0+IHtcbiAgICAgICAgICBpZiAoZGV2TW9kZSkge1xuICAgICAgICAgICAgdGhpcy5zcGFuKHtjbGFzczogJ3Byb2plY3QtbWFuYWdlci1kZXZtb2RlJ30pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuZGl2KHtjbGFzczogYGljb24gJHtpY29ufWB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNwYW4odGl0bGUpO1xuICAgICAgICAgICAgaWYgKGdyb3VwICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5zcGFuKHtjbGFzczogJ3Byb2plY3QtbWFuYWdlci1saXN0LWdyb3VwJ30sIGdyb3VwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGl2KHtjbGFzczogJ3NlY29uZGFyeS1saW5lJ30sICgpID0+IHtcbiAgICAgICAgICBpZiAocGF0aE1pc3NpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZGl2KHtjbGFzczogJ2ljb24gaWNvbi1hbGVydCd9LCAnUGF0aCBpcyBub3QgYXZhaWxhYmxlJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzaG93UGF0aCkge1xuICAgICAgICAgICAgbGV0IHBhdGg7XG4gICAgICAgICAgICBmb3IgKHBhdGggb2YgcGF0aHMpIHtcbiAgICAgICAgICAgICAgdGhpcy5kaXYoe2NsYXNzOiAnbm8taWNvbid9LCBwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzb3J0SXRlbXMoaXRlbXMpIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLnNvcnRCeTtcbiAgICBpZiAoa2V5ICE9PSAnZGVmYXVsdCcpIHtcbiAgICAgIGl0ZW1zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgYSA9IChhW2tleV0gfHwgJ1xcdWZmZmYnKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBiID0gKGJba2V5XSB8fCAnXFx1ZmZmZicpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgcmV0dXJuIGEgPiBiID8gMSA6IC0xO1xuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/project-manager/lib/projects-list-view.js
