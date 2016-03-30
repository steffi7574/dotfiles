Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var StatusBarView = (function (_View) {
  _inherits(StatusBarView, _View);

  function StatusBarView(statusBar) {
    var _this = this;

    _classCallCheck(this, StatusBarView);

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    _get(Object.getPrototypeOf(StatusBarView.prototype), 'constructor', this).apply(this, args);
    this.statusBar = statusBar;
    atom.config.observe('build.statusBar', function () {
      return _this.attach();
    });
    atom.config.observe('build.statusBarPriority', function () {
      return _this.attach();
    });
  }

  _createClass(StatusBarView, [{
    key: 'attach',
    value: function attach() {
      var _this2 = this;

      this.destroy();

      var orientation = atom.config.get('build.statusBar');
      if ('Disable' === orientation) {
        return;
      }

      this.statusBarTile = this.statusBar['add' + orientation + 'Tile']({ item: this, priority: atom.config.get('build.statusBarPriority') });

      this.tooltip = atom.tooltips.add(this, {
        title: function title() {
          return _this2.tooltipMessage();
        }
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.statusBarTile) {
        this.statusBarTile.destroy();
        this.statusBarTile = null;
      }

      if (this.tooltip) {
        this.tooltip.dispose();
        this.tooltip = null;
      }
    }
  }, {
    key: 'tooltipMessage',
    value: function tooltipMessage() {
      var statusMessage = undefined === this.success ? '' : 'Last build ' + (this.success ? 'succeeded' : 'failed') + '!';
      return 'Current build target is \'' + this.element.textContent + '\'<br />' + statusMessage;
    }
  }, {
    key: 'setTarget',
    value: function setTarget(t) {
      this.target = t;
      this.message.text(t);
      this.targetView.removeClass('status-unknown status-success status-error icon-check icon-flame');
    }
  }, {
    key: 'setBuildSuccess',
    value: function setBuildSuccess(success) {
      this.success = success;
      this.targetView.removeClass('status-unknown status-success status-error icon-check icon-flame');
      this.targetView.addClass(success ? 'status-success icon-check' : 'status-error icon-flame');
    }
  }, {
    key: 'onClick',
    value: function onClick(cb) {
      this.onClick = cb;
    }
  }, {
    key: 'clicked',
    value: function clicked() {
      this.onClick && this.onClick();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ id: 'build-status-bar', 'class': 'inline-block' }, function () {
        _this3.span({ outlet: 'targetView' });
        _this3.a({ click: 'clicked', outlet: 'message' });
      });
    }
  }]);

  return StatusBarView;
})(_atomSpacePenViews.View);

exports['default'] = StatusBarView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvc3RhdHVzLWJhci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQ0FFcUIsc0JBQXNCOztBQUYzQyxXQUFXLENBQUM7O0lBSVMsYUFBYTtZQUFiLGFBQWE7O0FBQ3JCLFdBRFEsYUFBYSxDQUNwQixTQUFTLEVBQVc7OzswQkFEYixhQUFhOztzQ0FDTixJQUFJO0FBQUosVUFBSTs7O0FBQzVCLCtCQUZpQixhQUFhLDhDQUVyQixJQUFJLEVBQUU7QUFDZixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMzQixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTthQUFNLE1BQUssTUFBTSxFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFO2FBQU0sTUFBSyxNQUFNLEVBQUU7S0FBQSxDQUFDLENBQUM7R0FDckU7O2VBTmtCLGFBQWE7O1dBUTFCLGtCQUFHOzs7QUFDUCxVQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWYsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN2RCxVQUFJLFNBQVMsS0FBSyxXQUFXLEVBQUU7QUFDN0IsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsU0FBTyxXQUFXLFVBQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVuSSxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtBQUNyQyxhQUFLLEVBQUU7aUJBQU0sT0FBSyxjQUFjLEVBQUU7U0FBQTtPQUNuQyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztPQUMzQjs7QUFFRCxVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztPQUNyQjtLQUNGOzs7V0FTYSwwQkFBRztBQUNmLFVBQU0sYUFBYSxHQUFHLFNBQVMsS0FBSyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsb0JBQWlCLElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxHQUFHLFFBQVEsQ0FBQSxNQUFHLENBQUM7QUFDL0csNENBQW1DLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxnQkFBVSxhQUFhLENBQUc7S0FDdEY7OztXQUVRLG1CQUFDLENBQUMsRUFBRTtBQUNYLFVBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7S0FDakc7OztXQUVjLHlCQUFDLE9BQU8sRUFBRTtBQUN2QixVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixVQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO0FBQ2hHLFVBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRywyQkFBMkIsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO0tBQzdGOzs7V0FFTSxpQkFBQyxFQUFFLEVBQUU7QUFDVixVQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztLQUNuQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQzs7O1dBOUJhLG1CQUFHOzs7QUFDZixVQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLGtCQUFrQixFQUFFLFNBQU8sY0FBYyxFQUFFLEVBQUUsWUFBTTtBQUNoRSxlQUFLLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLGVBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztPQUNoRCxDQUFDLENBQUM7S0FDSjs7O1NBeENrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3N0YXR1cy1iYXItdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0dXNCYXJWaWV3IGV4dGVuZHMgVmlldyB7XG4gIGNvbnN0cnVjdG9yKHN0YXR1c0JhciwgLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLnN0YXR1c0JhcicsICgpID0+IHRoaXMuYXR0YWNoKCkpO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLnN0YXR1c0JhclByaW9yaXR5JywgKCkgPT4gdGhpcy5hdHRhY2goKSk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG5cbiAgICBjb25zdCBvcmllbnRhdGlvbiA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQuc3RhdHVzQmFyJyk7XG4gICAgaWYgKCdEaXNhYmxlJyA9PT0gb3JpZW50YXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXR1c0JhclRpbGUgPSB0aGlzLnN0YXR1c0JhcltgYWRkJHtvcmllbnRhdGlvbn1UaWxlYF0oeyBpdGVtOiB0aGlzLCBwcmlvcml0eTogYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zdGF0dXNCYXJQcmlvcml0eScpIH0pO1xuXG4gICAgdGhpcy50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodGhpcywge1xuICAgICAgdGl0bGU6ICgpID0+IHRoaXMudG9vbHRpcE1lc3NhZ2UoKVxuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5zdGF0dXNCYXJUaWxlKSB7XG4gICAgICB0aGlzLnN0YXR1c0JhclRpbGUuZGVzdHJveSgpO1xuICAgICAgdGhpcy5zdGF0dXNCYXJUaWxlID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpO1xuICAgICAgdGhpcy50b29sdGlwID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICB0aGlzLmRpdih7IGlkOiAnYnVpbGQtc3RhdHVzLWJhcicsIGNsYXNzOiAnaW5saW5lLWJsb2NrJyB9LCAoKSA9PiB7XG4gICAgICB0aGlzLnNwYW4oeyBvdXRsZXQ6ICd0YXJnZXRWaWV3JyB9KTtcbiAgICAgIHRoaXMuYSh7IGNsaWNrOiAnY2xpY2tlZCcsIG91dGxldDogJ21lc3NhZ2UnfSk7XG4gICAgfSk7XG4gIH1cblxuICB0b29sdGlwTWVzc2FnZSgpIHtcbiAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gdW5kZWZpbmVkID09PSB0aGlzLnN1Y2Nlc3MgPyAnJyA6IGBMYXN0IGJ1aWxkICR7dGhpcy5zdWNjZXNzID8gJ3N1Y2NlZWRlZCcgOiAnZmFpbGVkJ30hYDtcbiAgICByZXR1cm4gYEN1cnJlbnQgYnVpbGQgdGFyZ2V0IGlzICcke3RoaXMuZWxlbWVudC50ZXh0Q29udGVudH0nPGJyIC8+JHtzdGF0dXNNZXNzYWdlfWA7XG4gIH1cblxuICBzZXRUYXJnZXQodCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdDtcbiAgICB0aGlzLm1lc3NhZ2UudGV4dCh0KTtcbiAgICB0aGlzLnRhcmdldFZpZXcucmVtb3ZlQ2xhc3MoJ3N0YXR1cy11bmtub3duIHN0YXR1cy1zdWNjZXNzIHN0YXR1cy1lcnJvciBpY29uLWNoZWNrIGljb24tZmxhbWUnKTtcbiAgfVxuXG4gIHNldEJ1aWxkU3VjY2VzcyhzdWNjZXNzKSB7XG4gICAgdGhpcy5zdWNjZXNzID0gc3VjY2VzcztcbiAgICB0aGlzLnRhcmdldFZpZXcucmVtb3ZlQ2xhc3MoJ3N0YXR1cy11bmtub3duIHN0YXR1cy1zdWNjZXNzIHN0YXR1cy1lcnJvciBpY29uLWNoZWNrIGljb24tZmxhbWUnKTtcbiAgICB0aGlzLnRhcmdldFZpZXcuYWRkQ2xhc3Moc3VjY2VzcyA/ICdzdGF0dXMtc3VjY2VzcyBpY29uLWNoZWNrJyA6ICdzdGF0dXMtZXJyb3IgaWNvbi1mbGFtZScpO1xuICB9XG5cbiAgb25DbGljayhjYikge1xuICAgIHRoaXMub25DbGljayA9IGNiO1xuICB9XG5cbiAgY2xpY2tlZCgpIHtcbiAgICB0aGlzLm9uQ2xpY2sgJiYgdGhpcy5vbkNsaWNrKCk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/lib/status-bar-view.js
