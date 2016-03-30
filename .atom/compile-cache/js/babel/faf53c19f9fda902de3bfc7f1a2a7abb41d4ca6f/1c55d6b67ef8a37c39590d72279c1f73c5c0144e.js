Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _atomSpacePenViews = require('atom-space-pen-views');

var _ansi_up = require('ansi_up');

var _ansi_up2 = _interopRequireDefault(_ansi_up);

var _googleAnalytics = require('./google-analytics');

var _googleAnalytics2 = _interopRequireDefault(_googleAnalytics);

'use babel';

var BuildView = (function (_View) {
  _inherits(BuildView, _View);

  function BuildView() {
    _classCallCheck(this, BuildView);

    _get(Object.getPrototypeOf(BuildView.prototype), 'constructor', this).apply(this, arguments);
    this.titleLoop = ['Building', 'Building.', 'Building..', 'Building...'];
    this.titleLoop.rotate = function () {
      /* Throttle as we don't want to update as quick as the timer is */
      this.n = this.n || 0;
      if (++this.n === 3) {
        this.push(this.shift());
        this.n = 0;
      }
    };
    this.monocle = false;
    this.starttime = new Date();
    this.buffer = new Buffer(0);
    this.links = [];

    this._setMonocleIcon();

    atom.config.observe('build.panelVisibility', this.visibleFromConfig.bind(this));
    atom.config.observe('build.panelOrientation', this.orientationFromConfig.bind(this));
    atom.config.observe('build.monocleHeight', this.sizeFromConfig.bind(this));
    atom.config.observe('build.minimizedHeight', this.sizeFromConfig.bind(this));
    atom.config.observe('editor.fontFamily', this.fontFromConfig.bind(this));

    atom.commands.add('atom-workspace', 'build:toggle-panel', this.toggle.bind(this));
  }

  _createClass(BuildView, [{
    key: 'attach',
    value: function attach(force) {
      if (!force) {
        switch (atom.config.get('build.panelVisibility')) {
          case 'Hidden':
          case 'Show on Error':
            return;
        }
      }

      if (this.panel) {
        this.panel.destroy();
      }
      var addfn = {
        Top: atom.workspace.addTopPanel,
        Bottom: atom.workspace.addBottomPanel,
        Left: atom.workspace.addLeftPanel,
        Right: atom.workspace.addRightPanel
      };
      var orientation = atom.config.get('build.panelOrientation') || 'Bottom';
      this.panel = addfn[orientation].call(atom.workspace, { item: this });
      this.sizeFromConfig();
      this.fontFromConfig();
    }
  }, {
    key: 'detach',
    value: function detach(force) {
      force = force || false;
      if (atom.views.getView(atom.workspace)) {
        atom.views.getView(atom.workspace).focus();
      }
      if (this.panel && (force || 'Keep Visible' !== atom.config.get('build.panelVisibility'))) {
        this.panel.destroy();
        this.panel = null;
      }
    }
  }, {
    key: 'isAttached',
    value: function isAttached() {
      return !!this.panel;
    }
  }, {
    key: 'sizeFromConfig',
    value: function sizeFromConfig() {
      this.setSizePercent(atom.config.get(this.monocle ? 'build.monocleHeight' : 'build.minimizedHeight'));
    }
  }, {
    key: 'fontFromConfig',
    value: function fontFromConfig() {
      this.output.css('font-family', atom.config.get('editor.fontFamily'));
    }
  }, {
    key: 'visibleFromConfig',
    value: function visibleFromConfig(val) {
      switch (val) {
        case 'Toggle':
        case 'Show on Error':
          if (!this.title.hasClass('error')) {
            this.detach();
          }
          break;
      }
    }
  }, {
    key: 'orientationFromConfig',
    value: function orientationFromConfig() {
      var isVisible = this.isVisible();
      this.detach(true);
      if (isVisible) {
        this.attach();
        this._setMonocleIcon();
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      clearTimeout(this.titleTimer);
      this.buffer = new Buffer(0);
      this.links = [];
      this.titleTimer = 0;
      this.title.removeClass('success error warning');
      this.output.empty();
      this.titleText.text('Cleared.');
      this.detach();
    }
  }, {
    key: 'updateTitle',
    value: function updateTitle() {
      this.titleText.text(this.titleLoop[0]);
      this.titleLoop.rotate();
      this.buildTimer.text(((new Date() - this.starttime) / 1000).toFixed(1) + ' s');
      this.titleTimer = setTimeout(this.updateTitle.bind(this), 100);
    }
  }, {
    key: 'close',
    value: function close() {
      this.detach(true);
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      _googleAnalytics2['default'].sendEvent('view', 'panel toggled');
      this.isAttached() ? this.detach(true) : this.attach(true);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.reset();
      this.attach();
    }
  }, {
    key: 'build',
    value: function build() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:trigger');
    }
  }, {
    key: 'setSizePercent',
    value: function setSizePercent(percent) {
      var size = 0;
      var cssKey = 'height';
      switch (atom.config.get('build.panelOrientation')) {
        case 'Top':
        case 'Bottom':
          size = (0, _atomSpacePenViews.$)('atom-workspace-axis.vertical').height();
          cssKey = 'height';
          break;

        case 'Left':
        case 'Right':
          size = (0, _atomSpacePenViews.$)('atom-workspace-axis.vertical').width();
          if ((0, _atomSpacePenViews.$)('.build').length) {
            size += (0, _atomSpacePenViews.$)('.build').get(0).clientWidth;
          }
          cssKey = 'width';
          break;
      }
      this.output.css('width', 'auto');
      this.output.css('height', '100%');
      this.output.css(cssKey, percent * size + 'px');
    }
  }, {
    key: '_setMonocleIcon',
    value: function _setMonocleIcon() {
      var _this = this;

      var iconName = function iconName() {
        switch (atom.config.get('build.panelOrientation')) {
          case 'Top':
            return _this.monocle ? 'icon-chevron-up' : 'icon-chevron-down';
          case 'Bottom':
            return _this.monocle ? 'icon-chevron-down' : 'icon-chevron-up';
          case 'Right':
            return _this.monocle ? 'icon-chevron-right' : 'icon-chevron-left';
          case 'Left':
            return _this.monocle ? 'icon-chevron-left' : 'icon-chevron-right';
        }
      };

      this.monocleButton.removeClass('icon-chevron-down icon-chevron-up icon-chevron-left icon-chevron-right').addClass(iconName());
    }
  }, {
    key: 'toggleMonocle',
    value: function toggleMonocle() {
      _googleAnalytics2['default'].sendEvent('view', 'monocle toggled');
      this.monocle = !this.monocle;
      this.setSizePercent(atom.config.get(this.monocle ? 'build.monocleHeight' : 'build.minimizedHeight'));
      this._setMonocleIcon();
    }
  }, {
    key: 'buildStarted',
    value: function buildStarted() {
      this.starttime = new Date();
      this.reset();
      this.attach();
      if (atom.config.get('build.stealFocus')) {
        this.focus();
      }
      this.updateTitle();
    }
  }, {
    key: 'buildFinished',
    value: function buildFinished(success) {
      if (!success) {
        this.attach(atom.config.get('build.panelVisibility') === 'Show on Error');
      }
      this.titleText.text(success ? 'Build finished.' : 'Build failed.');
      this.title.addClass(success ? 'success' : 'error');
      clearTimeout(this.titleTimer);
    }
  }, {
    key: 'buildAbortInitiated',
    value: function buildAbortInitiated() {
      this.titleText.text('Build process termination imminent...');
      clearTimeout(this.titleTimer);
      this.title.addClass('error');
    }
  }, {
    key: 'buildAborted',
    value: function buildAborted() {
      this.titleText.text('Aborted!');
    }
  }, {
    key: '_render',
    value: function _render() {
      var _this2 = this;

      var string = _lodash2['default'].escape(this.buffer.toString('utf8'));
      this.links.forEach(function (link) {
        var replaceRegex = new RegExp(_lodash2['default'].escapeRegExp(_lodash2['default'].escape(link.text)), 'g');
        string = string.replace(replaceRegex, '<a id="' + link.id + '">' + _lodash2['default'].escape(link.text) + '</a>');
      });
      this.output.html(_ansi_up2['default'].ansi_to_html(string));
      this.output.find('a').on('click', function (event) {
        _this2.links.find(function (l) {
          return l.id === event.currentTarget.id;
        }).onClick();
      });
    }
  }, {
    key: 'append',
    value: function append(data) {
      this.buffer = Buffer.concat([this.buffer, Buffer.isBuffer(data) ? data : new Buffer(data)]);
      this._render();
      this.output.scrollTop(this.output[0].scrollHeight);
    }
  }, {
    key: 'link',
    value: function link(text, id, onClick) {
      if (this.links.find(function (l) {
        return l.text === text;
      })) {
        return;
      }

      this.links.push({
        id: id,
        text: text,
        onClick: onClick
      });
      this._render();
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(id) {
      var position = this.output.find('#' + id).position();
      if (position) {
        this.output.scrollTop(position.top + this.output.scrollTop());
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ tabIndex: -1, 'class': 'build tool-panel panel-bottom native-key-bindings' }, function () {
        _this3.div({ 'class': 'btn-container pull-right' }, function () {
          _this3.button({ 'class': 'btn btn-default icon icon-x', click: 'close' });
          _this3.button({ 'class': 'btn btn-default icon icon-chevron-up', outlet: 'monocleButton', click: 'toggleMonocle' });
          _this3.button({ 'class': 'btn btn-default icon icon-trashcan new-row', click: 'clear' });
          _this3.button({ 'class': 'btn btn-default icon icon-zap', click: 'build', title: 'Build current project' });
        });

        _this3.div({ 'class': 'output panel-body', outlet: 'output' });

        _this3.div({ 'class': 'status' }, function () {
          _this3.h1({ 'class': 'title panel-heading', outlet: 'title' }, function () {
            _this3.span({ 'class': 'build-timer', outlet: 'buildTimer' }, '0.0 s');
            _this3.span({ 'class': 'title-text', outlet: 'titleText' }, 'Ready');
          });
        });
      });
    }
  }]);

  return BuildView;
})(_atomSpacePenViews.View);

exports['default'] = BuildView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFYyxRQUFROzs7O2lDQUNFLHNCQUFzQjs7dUJBQzNCLFNBQVM7Ozs7K0JBQ0Esb0JBQW9COzs7O0FBTGhELFdBQVcsQ0FBQzs7SUFPUyxTQUFTO1lBQVQsU0FBUzs7QUFDakIsV0FEUSxTQUFTLEdBQ2Q7MEJBREssU0FBUzs7QUFFMUIsK0JBRmlCLFNBQVMsOENBRWpCLFNBQVMsRUFBRTtBQUNwQixRQUFJLENBQUMsU0FBUyxHQUFHLENBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFFLENBQUM7QUFDMUUsUUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWTs7QUFFbEMsVUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixVQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEIsWUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUN4QixZQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNaO0tBQ0YsQ0FBQztBQUNGLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUM1QixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVoQixRQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFB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RUFBRSxTQUFPLGFBQWEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkUsbUJBQUssSUFBSSxDQUFDLEVBQUUsU0FBTyxZQUFZLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1dBQ2xFLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7U0E5Q2tCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgVmlldywgJCB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcbmltcG9ydCBhbnNpVXAgZnJvbSAnYW5zaV91cCc7XG5pbXBvcnQgR29vZ2xlQW5hbHl0aWNzIGZyb20gJy4vZ29vZ2xlLWFuYWx5dGljcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWxkVmlldyBleHRlbmRzIFZpZXcge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMudGl0bGVMb29wID0gWyAnQnVpbGRpbmcnLCAnQnVpbGRpbmcuJywgJ0J1aWxkaW5nLi4nLCAnQnVpbGRpbmcuLi4nIF07XG4gICAgdGhpcy50aXRsZUxvb3Aucm90YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgLyogVGhyb3R0bGUgYXMgd2UgZG9uJ3Qgd2FudCB0byB1cGRhdGUgYXMgcXVpY2sgYXMgdGhlIHRpbWVyIGlzICovXG4gICAgICB0aGlzLm4gPSB0aGlzLm4gfHwgMDtcbiAgICAgIGlmICgrK3RoaXMubiA9PT0gMykge1xuICAgICAgICB0aGlzLnB1c2godGhpcy5zaGlmdCgpKTtcbiAgICAgICAgdGhpcy5uID0gMDtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMubW9ub2NsZSA9IGZhbHNlO1xuICAgIHRoaXMuc3RhcnR0aW1lID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLmJ1ZmZlciA9IG5ldyBCdWZmZXIoMCk7XG4gICAgdGhpcy5saW5rcyA9IFtdO1xuXG4gICAgdGhpcy5fc2V0TW9ub2NsZUljb24oKTtcblxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScsIHRoaXMudmlzaWJsZUZyb21Db25maWcuYmluZCh0aGlzKSk7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYnVpbGQucGFuZWxPcmllbnRhdGlvbicsIHRoaXMub3JpZW50YXRpb25Gcm9tQ29uZmlnLmJpbmQodGhpcykpO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLm1vbm9jbGVIZWlnaHQnLCB0aGlzLnNpemVGcm9tQ29uZmlnLmJpbmQodGhpcykpO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLm1pbmltaXplZEhlaWdodCcsIHRoaXMuc2l6ZUZyb21Db25maWcuYmluZCh0aGlzKSk7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnZWRpdG9yLmZvbnRGYW1pbHknLCB0aGlzLmZvbnRGcm9tQ29uZmlnLmJpbmQodGhpcykpO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnRvZ2dsZS1wYW5lbCcsIHRoaXMudG9nZ2xlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhpcy5kaXYoeyB0YWJJbmRleDogLTEsIGNsYXNzOiAnYnVpbGQgdG9vbC1wYW5lbCBwYW5lbC1ib3R0b20gbmF0aXZlLWtleS1iaW5kaW5ncycgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2J0bi1jb250YWluZXIgcHVsbC1yaWdodCcgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi14JywgY2xpY2s6ICdjbG9zZScgfSk7XG4gICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6ICdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLWNoZXZyb24tdXAnLCBvdXRsZXQ6ICdtb25vY2xlQnV0dG9uJywgY2xpY2s6ICd0b2dnbGVNb25vY2xlJyB9KTtcbiAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biBidG4tZGVmYXVsdCBpY29uIGljb24tdHJhc2hjYW4gbmV3LXJvdycsIGNsaWNrOiAnY2xlYXInIH0pO1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi16YXAnLCBjbGljazogJ2J1aWxkJywgdGl0bGU6ICdCdWlsZCBjdXJyZW50IHByb2plY3QnIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdvdXRwdXQgcGFuZWwtYm9keScsIG91dGxldDogJ291dHB1dCcgfSk7XG5cbiAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdzdGF0dXMnIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5oMSh7IGNsYXNzOiAndGl0bGUgcGFuZWwtaGVhZGluZycsIG91dGxldDogJ3RpdGxlJyB9LCAoKT0+IHtcbiAgICAgICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ2J1aWxkLXRpbWVyJywgb3V0bGV0OiAnYnVpbGRUaW1lcicgfSwgJzAuMCBzJyk7XG4gICAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICd0aXRsZS10ZXh0Jywgb3V0bGV0OiAndGl0bGVUZXh0JyB9LCAnUmVhZHknKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGF0dGFjaChmb3JjZSkge1xuICAgIGlmICghZm9yY2UpIHtcbiAgICAgIHN3aXRjaCAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbFZpc2liaWxpdHknKSkge1xuICAgICAgICBjYXNlICdIaWRkZW4nOlxuICAgICAgICBjYXNlICdTaG93IG9uIEVycm9yJzpcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgICBjb25zdCBhZGRmbiA9IHtcbiAgICAgIFRvcDogYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwsXG4gICAgICBCb3R0b206IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsLFxuICAgICAgTGVmdDogYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsLFxuICAgICAgUmlnaHQ6IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWxcbiAgICB9O1xuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbE9yaWVudGF0aW9uJykgfHwgJ0JvdHRvbSc7XG4gICAgdGhpcy5wYW5lbCA9IGFkZGZuW29yaWVudGF0aW9uXS5jYWxsKGF0b20ud29ya3NwYWNlLCB7IGl0ZW06IHRoaXMgfSk7XG4gICAgdGhpcy5zaXplRnJvbUNvbmZpZygpO1xuICAgIHRoaXMuZm9udEZyb21Db25maWcoKTtcbiAgfVxuXG4gIGRldGFjaChmb3JjZSkge1xuICAgIGZvcmNlID0gZm9yY2UgfHwgZmFsc2U7XG4gICAgaWYgKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkpIHtcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkuZm9jdXMoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGFuZWwgJiYgKGZvcmNlIHx8ICdLZWVwIFZpc2libGUnICE9PSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScpKSkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBpc0F0dGFjaGVkKCkge1xuICAgIHJldHVybiAhIXRoaXMucGFuZWw7XG4gIH1cblxuICBzaXplRnJvbUNvbmZpZygpIHtcbiAgICB0aGlzLnNldFNpemVQZXJjZW50KGF0b20uY29uZmlnLmdldCh0aGlzLm1vbm9jbGUgPyAnYnVpbGQubW9ub2NsZUhlaWdodCcgOiAnYnVpbGQubWluaW1pemVkSGVpZ2h0JykpO1xuICB9XG5cbiAgZm9udEZyb21Db25maWcoKSB7XG4gICAgdGhpcy5vdXRwdXQuY3NzKCdmb250LWZhbWlseScsIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKSk7XG4gIH1cblxuICB2aXNpYmxlRnJvbUNvbmZpZyh2YWwpIHtcbiAgICBzd2l0Y2ggKHZhbCkge1xuICAgICAgY2FzZSAnVG9nZ2xlJzpcbiAgICAgIGNhc2UgJ1Nob3cgb24gRXJyb3InOlxuICAgICAgICBpZiAoIXRoaXMudGl0bGUuaGFzQ2xhc3MoJ2Vycm9yJykpIHtcbiAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIG9yaWVudGF0aW9uRnJvbUNvbmZpZygpIHtcbiAgICBjb25zdCBpc1Zpc2libGUgPSB0aGlzLmlzVmlzaWJsZSgpO1xuICAgIHRoaXMuZGV0YWNoKHRydWUpO1xuICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICB0aGlzLl9zZXRNb25vY2xlSWNvbigpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpdGxlVGltZXIpO1xuICAgIHRoaXMuYnVmZmVyID0gbmV3IEJ1ZmZlcigwKTtcbiAgICB0aGlzLmxpbmtzID0gW107XG4gICAgdGhpcy50aXRsZVRpbWVyID0gMDtcbiAgICB0aGlzLnRpdGxlLnJlbW92ZUNsYXNzKCdzdWNjZXNzIGVycm9yIHdhcm5pbmcnKTtcbiAgICB0aGlzLm91dHB1dC5lbXB0eSgpO1xuICAgIHRoaXMudGl0bGVUZXh0LnRleHQoJ0NsZWFyZWQuJyk7XG4gICAgdGhpcy5kZXRhY2goKTtcbiAgfVxuXG4gIHVwZGF0ZVRpdGxlKCkge1xuICAgIHRoaXMudGl0bGVUZXh0LnRleHQodGhpcy50aXRsZUxvb3BbMF0pO1xuICAgIHRoaXMudGl0bGVMb29wLnJvdGF0ZSgpO1xuICAgIHRoaXMuYnVpbGRUaW1lci50ZXh0KCgobmV3IERhdGUoKSAtIHRoaXMuc3RhcnR0aW1lKSAvIDEwMDApLnRvRml4ZWQoMSkgKyAnIHMnKTtcbiAgICB0aGlzLnRpdGxlVGltZXIgPSBzZXRUaW1lb3V0KHRoaXMudXBkYXRlVGl0bGUuYmluZCh0aGlzKSwgMTAwKTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuZGV0YWNoKHRydWUpO1xuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ3ZpZXcnLCAncGFuZWwgdG9nZ2xlZCcpO1xuICAgIHRoaXMuaXNBdHRhY2hlZCgpID8gdGhpcy5kZXRhY2godHJ1ZSkgOiB0aGlzLmF0dGFjaCh0cnVlKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICB0aGlzLmF0dGFjaCgpO1xuICB9XG5cbiAgYnVpbGQoKSB7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnYnVpbGQ6dHJpZ2dlcicpO1xuICB9XG5cbiAgc2V0U2l6ZVBlcmNlbnQocGVyY2VudCkge1xuICAgIGxldCBzaXplID0gMDtcbiAgICBsZXQgY3NzS2V5ID0gJ2hlaWdodCc7XG4gICAgc3dpdGNoIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnBhbmVsT3JpZW50YXRpb24nKSkge1xuICAgICAgY2FzZSAnVG9wJzpcbiAgICAgIGNhc2UgJ0JvdHRvbSc6XG4gICAgICAgIHNpemUgPSAkKCdhdG9tLXdvcmtzcGFjZS1heGlzLnZlcnRpY2FsJykuaGVpZ2h0KCk7XG4gICAgICAgIGNzc0tleSA9ICdoZWlnaHQnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnTGVmdCc6XG4gICAgICBjYXNlICdSaWdodCc6XG4gICAgICAgIHNpemUgPSAkKCdhdG9tLXdvcmtzcGFjZS1heGlzLnZlcnRpY2FsJykud2lkdGgoKTtcbiAgICAgICAgaWYgKCQoJy5idWlsZCcpLmxlbmd0aCkge1xuICAgICAgICAgIHNpemUgKz0gJCgnLmJ1aWxkJykuZ2V0KDApLmNsaWVudFdpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGNzc0tleSA9ICd3aWR0aCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLm91dHB1dC5jc3MoJ3dpZHRoJywgJ2F1dG8nKTtcbiAgICB0aGlzLm91dHB1dC5jc3MoJ2hlaWdodCcsICcxMDAlJyk7XG4gICAgdGhpcy5vdXRwdXQuY3NzKGNzc0tleSwgcGVyY2VudCAqIHNpemUgKyAncHgnKTtcbiAgfVxuXG4gIF9zZXRNb25vY2xlSWNvbigpIHtcbiAgICBjb25zdCBpY29uTmFtZSA9ICgpID0+IHtcbiAgICAgIHN3aXRjaCAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbE9yaWVudGF0aW9uJykpIHtcbiAgICAgICAgY2FzZSAnVG9wJzogcmV0dXJuIHRoaXMubW9ub2NsZSA/ICdpY29uLWNoZXZyb24tdXAnIDogJ2ljb24tY2hldnJvbi1kb3duJztcbiAgICAgICAgY2FzZSAnQm90dG9tJzogcmV0dXJuIHRoaXMubW9ub2NsZSA/ICdpY29uLWNoZXZyb24tZG93bicgOiAnaWNvbi1jaGV2cm9uLXVwJztcbiAgICAgICAgY2FzZSAnUmlnaHQnOiByZXR1cm4gdGhpcy5tb25vY2xlID8gJ2ljb24tY2hldnJvbi1yaWdodCcgOiAnaWNvbi1jaGV2cm9uLWxlZnQnO1xuICAgICAgICBjYXNlICdMZWZ0JzogcmV0dXJuIHRoaXMubW9ub2NsZSA/ICdpY29uLWNoZXZyb24tbGVmdCcgOiAnaWNvbi1jaGV2cm9uLXJpZ2h0JztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5tb25vY2xlQnV0dG9uXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2ljb24tY2hldnJvbi1kb3duIGljb24tY2hldnJvbi11cCBpY29uLWNoZXZyb24tbGVmdCBpY29uLWNoZXZyb24tcmlnaHQnKVxuICAgICAgLmFkZENsYXNzKGljb25OYW1lKCkpO1xuICB9XG5cbiAgdG9nZ2xlTW9ub2NsZSgpIHtcbiAgICBHb29nbGVBbmFseXRpY3Muc2VuZEV2ZW50KCd2aWV3JywgJ21vbm9jbGUgdG9nZ2xlZCcpO1xuICAgIHRoaXMubW9ub2NsZSA9ICF0aGlzLm1vbm9jbGU7XG4gICAgdGhpcy5zZXRTaXplUGVyY2VudChhdG9tLmNvbmZpZy5nZXQodGhpcy5tb25vY2xlID8gJ2J1aWxkLm1vbm9jbGVIZWlnaHQnIDogJ2J1aWxkLm1pbmltaXplZEhlaWdodCcpKTtcbiAgICB0aGlzLl9zZXRNb25vY2xlSWNvbigpO1xuICB9XG5cbiAgYnVpbGRTdGFydGVkKCkge1xuICAgIHRoaXMuc3RhcnR0aW1lID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5hdHRhY2goKTtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zdGVhbEZvY3VzJykpIHtcbiAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVUaXRsZSgpO1xuICB9XG5cbiAgYnVpbGRGaW5pc2hlZChzdWNjZXNzKSB7XG4gICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICB0aGlzLmF0dGFjaChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScpID09PSAnU2hvdyBvbiBFcnJvcicpO1xuICAgIH1cbiAgICB0aGlzLnRpdGxlVGV4dC50ZXh0KHN1Y2Nlc3MgPyAnQnVpbGQgZmluaXNoZWQuJyA6ICdCdWlsZCBmYWlsZWQuJyk7XG4gICAgdGhpcy50aXRsZS5hZGRDbGFzcyhzdWNjZXNzID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGl0bGVUaW1lcik7XG4gIH1cblxuICBidWlsZEFib3J0SW5pdGlhdGVkKCkge1xuICAgIHRoaXMudGl0bGVUZXh0LnRleHQoJ0J1aWxkIHByb2Nlc3MgdGVybWluYXRpb24gaW1taW5lbnQuLi4nKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aXRsZVRpbWVyKTtcbiAgICB0aGlzLnRpdGxlLmFkZENsYXNzKCdlcnJvcicpO1xuICB9XG5cbiAgYnVpbGRBYm9ydGVkKCkge1xuICAgIHRoaXMudGl0bGVUZXh0LnRleHQoJ0Fib3J0ZWQhJyk7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIGxldCBzdHJpbmcgPSBfLmVzY2FwZSh0aGlzLmJ1ZmZlci50b1N0cmluZygndXRmOCcpKTtcbiAgICB0aGlzLmxpbmtzLmZvckVhY2goKGxpbmspID0+IHtcbiAgICAgIGNvbnN0IHJlcGxhY2VSZWdleCA9IG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAoXy5lc2NhcGUobGluay50ZXh0KSksICdnJyk7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXgsICc8YSBpZD1cIicgKyBsaW5rLmlkICsgJ1wiPicgKyBfLmVzY2FwZShsaW5rLnRleHQpICsgJzwvYT4nKTtcbiAgICB9KTtcbiAgICB0aGlzLm91dHB1dC5odG1sKGFuc2lVcC5hbnNpX3RvX2h0bWwoc3RyaW5nKSk7XG4gICAgdGhpcy5vdXRwdXQuZmluZCgnYScpLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgdGhpcy5saW5rcy5maW5kKGwgPT4gbC5pZCA9PT0gZXZlbnQuY3VycmVudFRhcmdldC5pZCkub25DbGljaygpO1xuICAgIH0pO1xuICB9XG5cbiAgYXBwZW5kKGRhdGEpIHtcbiAgICB0aGlzLmJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoWyB0aGlzLmJ1ZmZlciwgQnVmZmVyLmlzQnVmZmVyKGRhdGEpID8gZGF0YSA6IG5ldyBCdWZmZXIoZGF0YSkgXSk7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgdGhpcy5vdXRwdXQuc2Nyb2xsVG9wKHRoaXMub3V0cHV0WzBdLnNjcm9sbEhlaWdodCk7XG4gIH1cblxuICBsaW5rKHRleHQsIGlkLCBvbkNsaWNrKSB7XG4gICAgaWYgKHRoaXMubGlua3MuZmluZChsID0+IGwudGV4dCA9PT0gdGV4dCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxpbmtzLnB1c2goe1xuICAgICAgaWQ6IGlkLFxuICAgICAgdGV4dDogdGV4dCxcbiAgICAgIG9uQ2xpY2s6IG9uQ2xpY2tcbiAgICB9KTtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIHNjcm9sbFRvKGlkKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLm91dHB1dC5maW5kKCcjJyArIGlkKS5wb3NpdGlvbigpO1xuICAgIGlmIChwb3NpdGlvbikge1xuICAgICAgdGhpcy5vdXRwdXQuc2Nyb2xsVG9wKHBvc2l0aW9uLnRvcCArIHRoaXMub3V0cHV0LnNjcm9sbFRvcCgpKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/lib/build-view.js
