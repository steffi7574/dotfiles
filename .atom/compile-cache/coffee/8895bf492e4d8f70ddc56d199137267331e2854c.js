(function() {
  var CompositeDisposable, ConfigExportView, ConfigImportExport, ConfigImportView, fs, path;

  ConfigExportView = require('./config-export-view');

  ConfigImportView = require('./config-import-view');

  fs = require('fs-plus');

  path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ConfigImportExport = {
    configImportExportView: null,
    subscriptions: null,
    activate: function(state) {
      var defaultPath, thePath;
      defaultPath = atom.config.get('config-import-export.defaultPath');
      if (defaultPath == null) {
        defaultPath = {};
      }
      thePath = defaultPath[process.platform];
      if (thePath == null) {
        thePath = "";
      }
      if (thePath === "" || !fs.existsSync(thePath)) {
        defaultPath[process.platform] = path.join(fs.getHomeDirectory(), "AtomBackups");
        atom.config.set('config-import-export.defaultPath', defaultPath);
      }
      this.importView = new ConfigImportView();
      return this.exportView = new ConfigExportView();
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.importView) != null) {
        _ref.destroy();
      }
      return (_ref1 = this.exportView) != null ? _ref1.destroy() : void 0;
    },
    serialize: function() {},
    "export": function() {
      console.log('exports was toggled');
      return this.exportView.attach();
    },
    "import": function() {
      console.log('imports was toggled');
      return this.importView.attach();
    },
    config: {
      defaultPath: {
        type: 'object',
        properties: {
          win32: {
            type: 'string',
            "default": ''
          },
          darwin: {
            type: 'string',
            "default": ''
          },
          linux: {
            type: 'string',
            "default": ''
          },
          freebsd: {
            type: 'string',
            "default": ''
          },
          sunos: {
            type: 'string',
            "default": ''
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9jb25maWctaW1wb3J0LWV4cG9ydC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUZBQUE7O0FBQUEsRUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsc0JBQVIsQ0FBbkIsQ0FBQTs7QUFBQSxFQUNBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUixDQURuQixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUhQLENBQUE7O0FBQUEsRUFJQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBSkQsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGtCQUFBLEdBQ2Y7QUFBQSxJQUFBLHNCQUFBLEVBQXdCLElBQXhCO0FBQUEsSUFDQSxhQUFBLEVBQWUsSUFEZjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsVUFBQSxvQkFBQTtBQUFBLE1BQUEsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBZCxDQUFBOztRQUNBLGNBQWU7T0FEZjtBQUFBLE1BRUEsT0FBQSxHQUFVLFdBQVksQ0FBQSxPQUFPLENBQUMsUUFBUixDQUZ0QixDQUFBOztRQUdBLFVBQVc7T0FIWDtBQUlBLE1BQUEsSUFBRyxPQUFBLEtBQVcsRUFBWCxJQUFpQixDQUFBLEVBQU0sQ0FBQyxVQUFILENBQWMsT0FBZCxDQUF4QjtBQUNFLFFBQUEsV0FBWSxDQUFBLE9BQU8sQ0FBQyxRQUFSLENBQVosR0FBZ0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFFLENBQUMsZ0JBQUgsQ0FBQSxDQUFWLEVBQWlDLGFBQWpDLENBQWhDLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsRUFBb0QsV0FBcEQsQ0FEQSxDQURGO09BSkE7QUFBQSxNQVFBLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsZ0JBQUEsQ0FBQSxDQVJsQixDQUFBO2FBU0EsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxnQkFBQSxDQUFBLEVBVlY7SUFBQSxDQUhWO0FBQUEsSUFnQkEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsV0FBQTs7WUFBVyxDQUFFLE9BQWIsQ0FBQTtPQUFBO3NEQUNXLENBQUUsT0FBYixDQUFBLFdBRlU7SUFBQSxDQWhCWjtBQUFBLElBb0JBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0FwQlg7QUFBQSxJQXVCQSxRQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHFCQUFaLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFBLEVBRk07SUFBQSxDQXZCUjtBQUFBLElBMkJBLFFBQUEsRUFBUSxTQUFBLEdBQUE7QUFDTixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQVosQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUEsRUFGTTtJQUFBLENBM0JSO0FBQUEsSUErQkEsTUFBQSxFQUNFO0FBQUEsTUFBQSxXQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBREY7QUFBQSxVQUdBLE1BQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBSkY7QUFBQSxVQU1BLEtBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBUEY7QUFBQSxVQVNBLE9BQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBVkY7QUFBQSxVQVlBLEtBQUEsRUFDRTtBQUFBLFlBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxZQUNBLFNBQUEsRUFBUyxFQURUO1dBYkY7U0FGRjtPQURGO0tBaENGO0dBUEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/config-import-export.coffee
