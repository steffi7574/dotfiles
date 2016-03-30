Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _configSchema = require('./config-schema');

var _configSchema2 = _interopRequireDefault(_configSchema);

'use babel';

exports['default'] = {
  config: _configSchema2['default'],

  activate: function activate() {
    var _this = this;

    this.commands = atom.commands.add('atom-workspace', {
      'latex:build': function latexBuild() {
        _this.bootstrap();
        _this.composer.build();
      },
      'latex:sync': function latexSync() {
        _this.bootstrap();
        _this.composer.sync();
      },
      'latex:clean': function latexClean() {
        _this.bootstrap();
        _this.composer.clean();
      }
    });
  },

  deactivate: function deactivate() {
    if (this.commands) {
      this.commands.dispose();
      delete this.commands;
    }

    if (this.composer) {
      this.composer.destroy();
      delete this.composer;
    }

    if (global.latex) {
      delete global.latex;
    }
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.bootstrap();
    this.composer.setStatusBar(statusBar);
  },

  bootstrap: function bootstrap() {
    if (this.composer && global.latex) {
      return;
    }

    var Latex = require('./latex');
    var Composer = require('./composer');

    global.latex = new Latex();
    this.composer = new Composer();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NEJBRXlCLGlCQUFpQjs7OztBQUYxQyxXQUFXLENBQUE7O3FCQUlJO0FBQ2IsUUFBTSwyQkFBYzs7QUFFcEIsVUFBUSxFQUFDLG9CQUFHOzs7QUFDVixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xELG1CQUFhLEVBQUUsc0JBQU07QUFDbkIsY0FBSyxTQUFTLEVBQUUsQ0FBQTtBQUNoQixjQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtPQUN0QjtBQUNELGtCQUFZLEVBQUUscUJBQU07QUFDbEIsY0FBSyxTQUFTLEVBQUUsQ0FBQTtBQUNoQixjQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtPQUNyQjtBQUNELG1CQUFhLEVBQUUsc0JBQU07QUFDbkIsY0FBSyxTQUFTLEVBQUUsQ0FBQTtBQUNoQixjQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtPQUN0QjtLQUNGLENBQUMsQ0FBQTtHQUNIOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNyQjs7QUFFRCxRQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN2QixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7S0FDckI7O0FBRUQsUUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2hCLGFBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQTtLQUNwQjtHQUNGOztBQUVELGtCQUFnQixFQUFDLDBCQUFDLFNBQVMsRUFBRTtBQUMzQixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDaEIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7R0FDdEM7O0FBRUQsV0FBUyxFQUFDLHFCQUFHO0FBQ1gsUUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7QUFBRSxhQUFNO0tBQUU7O0FBRTdDLFFBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNoQyxRQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRDLFVBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQTtBQUMxQixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUE7R0FDL0I7Q0FDRiIsImZpbGUiOiIvaG9tZS9zZ3VlbnRoZXIvLmF0b20vcGFja2FnZXMvbGF0ZXgvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgQ29uZmlnU2NoZW1hIGZyb20gJy4vY29uZmlnLXNjaGVtYSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IENvbmZpZ1NjaGVtYSxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgdGhpcy5jb21tYW5kcyA9IGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdsYXRleDpidWlsZCc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5ib290c3RyYXAoKVxuICAgICAgICB0aGlzLmNvbXBvc2VyLmJ1aWxkKClcbiAgICAgIH0sXG4gICAgICAnbGF0ZXg6c3luYyc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5ib290c3RyYXAoKVxuICAgICAgICB0aGlzLmNvbXBvc2VyLnN5bmMoKVxuICAgICAgfSxcbiAgICAgICdsYXRleDpjbGVhbic6ICgpID0+IHtcbiAgICAgICAgdGhpcy5ib290c3RyYXAoKVxuICAgICAgICB0aGlzLmNvbXBvc2VyLmNsZWFuKClcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIGRlYWN0aXZhdGUgKCkge1xuICAgIGlmICh0aGlzLmNvbW1hbmRzKSB7XG4gICAgICB0aGlzLmNvbW1hbmRzLmRpc3Bvc2UoKVxuICAgICAgZGVsZXRlIHRoaXMuY29tbWFuZHNcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb21wb3Nlcikge1xuICAgICAgdGhpcy5jb21wb3Nlci5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSB0aGlzLmNvbXBvc2VyXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbC5sYXRleCkge1xuICAgICAgZGVsZXRlIGdsb2JhbC5sYXRleFxuICAgIH1cbiAgfSxcblxuICBjb25zdW1lU3RhdHVzQmFyIChzdGF0dXNCYXIpIHtcbiAgICB0aGlzLmJvb3RzdHJhcCgpXG4gICAgdGhpcy5jb21wb3Nlci5zZXRTdGF0dXNCYXIoc3RhdHVzQmFyKVxuICB9LFxuXG4gIGJvb3RzdHJhcCAoKSB7XG4gICAgaWYgKHRoaXMuY29tcG9zZXIgJiYgZ2xvYmFsLmxhdGV4KSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBMYXRleCA9IHJlcXVpcmUoJy4vbGF0ZXgnKVxuICAgIGNvbnN0IENvbXBvc2VyID0gcmVxdWlyZSgnLi9jb21wb3NlcicpXG5cbiAgICBnbG9iYWwubGF0ZXggPSBuZXcgTGF0ZXgoKVxuICAgIHRoaXMuY29tcG9zZXIgPSBuZXcgQ29tcG9zZXIoKVxuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/main.js
