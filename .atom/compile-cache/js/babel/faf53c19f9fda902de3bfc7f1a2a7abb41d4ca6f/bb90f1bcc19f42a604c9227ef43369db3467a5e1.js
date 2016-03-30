Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var TargetsView = (function (_SelectListView) {
  _inherits(TargetsView, _SelectListView);

  function TargetsView() {
    _classCallCheck(this, TargetsView);

    _get(Object.getPrototypeOf(TargetsView.prototype), 'constructor', this).apply(this, arguments);
    this.show();
  }

  _createClass(TargetsView, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(TargetsView.prototype), 'initialize', this).apply(this, arguments);
      this.list.addClass('mark-active');
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.show();
      this.focusFilterEditor();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
    }
  }, {
    key: 'setItems',
    value: function setItems() {
      _get(Object.getPrototypeOf(TargetsView.prototype), 'setItems', this).apply(this, arguments);

      var activeItemView = this.find('.active');
      if (0 < activeItemView.length) {
        this.selectItemView(activeItemView);
        this.scrollToItemView(activeItemView);
      }
    }
  }, {
    key: 'setActiveTarget',
    value: function setActiveTarget(target) {
      this.activeTarget = target;
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(targetName) {
      var activeTarget = this.activeTarget;
      return TargetsView.render(function () {
        var activeClass = targetName === activeTarget ? 'active' : '';
        this.li({ 'class': activeClass + ' build-target' }, targetName);
      });
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage(itemCount) {
      return 0 === itemCount ? 'No targets found.' : 'No matches';
    }
  }, {
    key: 'awaitSelection',
    value: function awaitSelection() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.resolveFunction = resolve;
      });
    }
  }, {
    key: 'confirmed',
    value: function confirmed(target) {
      if (this.resolveFunction) {
        this.resolveFunction(target);
        this.resolveFunction = null;
      }
      this.hide();
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      this.hide();
    }
  }]);

  return TargetsView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = TargetsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0cy12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQ0FFK0Isc0JBQXNCOztBQUZyRCxXQUFXLENBQUM7O0lBSVMsV0FBVztZQUFYLFdBQVc7O0FBRW5CLFdBRlEsV0FBVyxHQUVoQjswQkFGSyxXQUFXOztBQUc1QiwrQkFIaUIsV0FBVyw4Q0FHbkIsU0FBUyxFQUFFO0FBQ3BCLFFBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNiOztlQUxrQixXQUFXOztXQU9wQixzQkFBRztBQUNYLGlDQVJpQixXQUFXLDZDQVFSLFNBQVMsRUFBRTtBQUMvQixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuQzs7O1dBRUcsZ0JBQUc7QUFDTCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDMUQsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMxQjs7O1dBRUcsZ0JBQUc7QUFDTCxVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ25COzs7V0FFTyxvQkFBRztBQUNULGlDQXZCaUIsV0FBVywyQ0F1QlYsU0FBUyxFQUFFOztBQUU3QixVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDN0IsWUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxZQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDdkM7S0FDRjs7O1dBRWMseUJBQUMsTUFBTSxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO0tBQzVCOzs7V0FFVSxxQkFBQyxVQUFVLEVBQUU7QUFDdEIsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN2QyxhQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWTtBQUNwQyxZQUFNLFdBQVcsR0FBSSxVQUFVLEtBQUssWUFBWSxHQUFHLFFBQVEsR0FBRyxFQUFFLEFBQUMsQ0FBQztBQUNsRSxZQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBTyxXQUFXLEdBQUcsZUFBZSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDL0QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixhQUFPLEFBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBSSxtQkFBbUIsR0FBRyxZQUFZLENBQUM7S0FDL0Q7OztXQUVhLDBCQUFHOzs7QUFDZixhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxjQUFLLGVBQWUsR0FBRyxPQUFPLENBQUM7T0FDaEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVRLG1CQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDeEIsWUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixZQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztPQUM3QjtBQUNELFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNiOzs7V0FFUSxxQkFBRztBQUNWLFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNiOzs7U0FoRWtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0cy12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IFNlbGVjdExpc3RWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYXJnZXRzVmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMuc2hvdygpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKC4uLmFyZ3VtZW50cyk7XG4gICAgdGhpcy5saXN0LmFkZENsYXNzKCdtYXJrLWFjdGl2ZScpO1xuICB9XG5cbiAgc2hvdygpIHtcbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSk7XG4gICAgdGhpcy5wYW5lbC5zaG93KCk7XG4gICAgdGhpcy5mb2N1c0ZpbHRlckVkaXRvcigpO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICB0aGlzLnBhbmVsLmhpZGUoKTtcbiAgfVxuXG4gIHNldEl0ZW1zKCkge1xuICAgIHN1cGVyLnNldEl0ZW1zKC4uLmFyZ3VtZW50cyk7XG5cbiAgICBjb25zdCBhY3RpdmVJdGVtVmlldyA9IHRoaXMuZmluZCgnLmFjdGl2ZScpO1xuICAgIGlmICgwIDwgYWN0aXZlSXRlbVZpZXcubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNlbGVjdEl0ZW1WaWV3KGFjdGl2ZUl0ZW1WaWV3KTtcbiAgICAgIHRoaXMuc2Nyb2xsVG9JdGVtVmlldyhhY3RpdmVJdGVtVmlldyk7XG4gICAgfVxuICB9XG5cbiAgc2V0QWN0aXZlVGFyZ2V0KHRhcmdldCkge1xuICAgIHRoaXMuYWN0aXZlVGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgdmlld0Zvckl0ZW0odGFyZ2V0TmFtZSkge1xuICAgIGNvbnN0IGFjdGl2ZVRhcmdldCA9IHRoaXMuYWN0aXZlVGFyZ2V0O1xuICAgIHJldHVybiBUYXJnZXRzVmlldy5yZW5kZXIoZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgYWN0aXZlQ2xhc3MgPSAodGFyZ2V0TmFtZSA9PT0gYWN0aXZlVGFyZ2V0ID8gJ2FjdGl2ZScgOiAnJyk7XG4gICAgICB0aGlzLmxpKHsgY2xhc3M6IGFjdGl2ZUNsYXNzICsgJyBidWlsZC10YXJnZXQnIH0sIHRhcmdldE5hbWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0RW1wdHlNZXNzYWdlKGl0ZW1Db3VudCkge1xuICAgIHJldHVybiAoMCA9PT0gaXRlbUNvdW50KSA/ICdObyB0YXJnZXRzIGZvdW5kLicgOiAnTm8gbWF0Y2hlcyc7XG4gIH1cblxuICBhd2FpdFNlbGVjdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlRnVuY3Rpb24gPSByZXNvbHZlO1xuICAgIH0pO1xuICB9XG5cbiAgY29uZmlybWVkKHRhcmdldCkge1xuICAgIGlmICh0aGlzLnJlc29sdmVGdW5jdGlvbikge1xuICAgICAgdGhpcy5yZXNvbHZlRnVuY3Rpb24odGFyZ2V0KTtcbiAgICAgIHRoaXMucmVzb2x2ZUZ1bmN0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5oaWRlKCk7XG4gIH1cblxuICBjYW5jZWxsZWQoKSB7XG4gICAgdGhpcy5oaWRlKCk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/lib/targets-view.js
