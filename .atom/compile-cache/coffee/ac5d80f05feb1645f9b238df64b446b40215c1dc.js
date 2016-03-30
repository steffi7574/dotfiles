(function() {
  var $, BufferedProcess, ImportView, SelectListView, TextEditorView, View, fs, importer, notifier, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View, SelectListView = _ref.SelectListView;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs-plus');

  notifier = require('./notifier');

  importer = require('./import');

  module.exports = ImportView = (function(_super) {
    __extends(ImportView, _super);

    function ImportView() {
      return ImportView.__super__.constructor.apply(this, arguments);
    }

    ImportView.prototype.previouslyFocusedElement = null;

    ImportView.prototype.mode = null;

    ImportView.prototype["import"] = function(file) {
      var notification;
      return notification = notifier.addSuccess(importer.importConfig(file), {
        dismissable: true
      });
    };

    ImportView.prototype.initialize = function() {
      ImportView.__super__.initialize.apply(this, arguments);
      this.commandSubscription = atom.commands.add('atom-workspace', {
        'config-import-export:import': (function(_this) {
          return function() {
            return _this.attach('import');
          };
        })(this)
      });
      return this.addClass('overlay from-top');
    };

    ImportView.prototype.viewForItem = function(item) {
      return "<li>" + item + "</li>";
    };

    ImportView.prototype.confirmed = function(file) {
      var notification;
      notification = notifier.addSuccess(importer.importConfig(file), {
        dismissable: true
      });
      return this.close();
    };

    ImportView.prototype.cancelled = function() {
      return this.close();
    };

    ImportView.prototype.destroy = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ImportView.prototype.attach = function(mode) {
      var backupDirectory, defaultPath, files;
      this.mode = mode;
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      defaultPath = atom.config.get('config-import-export.defaultPath');
      backupDirectory = defaultPath[process.platform];
      files = fs.readdirSync(backupDirectory);
      this.setItems(files);
      this.panel.show();
      return this.focusFilterEditor();
    };

    ImportView.prototype.close = function() {
      var _ref1;
      if (!this.panel.isVisible()) {
        return;
      }
      this.panel.hide();
      return (_ref1 = this.previouslyFocusedElement) != null ? _ref1.focus() : void 0;
    };

    return ImportView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9jb25maWctaW1wb3J0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdHQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBNEMsT0FBQSxDQUFRLHNCQUFSLENBQTVDLEVBQUMsU0FBQSxDQUFELEVBQUksc0JBQUEsY0FBSixFQUFvQixZQUFBLElBQXBCLEVBQTBCLHNCQUFBLGNBRDFCLENBQUE7O0FBQUEsRUFFQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFGRCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FMWCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx5QkFBQSx3QkFBQSxHQUEwQixJQUExQixDQUFBOztBQUFBLHlCQUNBLElBQUEsR0FBTSxJQUROLENBQUE7O0FBQUEseUJBR0EsU0FBQSxHQUFRLFNBQUMsSUFBRCxHQUFBO0FBQ04sVUFBQSxZQUFBO2FBQUEsWUFBQSxHQUFlLFFBQVEsQ0FBQyxVQUFULENBQW9CLFFBQVEsQ0FBQyxZQUFULENBQXNCLElBQXRCLENBQXBCLEVBQWlEO0FBQUEsUUFBQSxXQUFBLEVBQWEsSUFBYjtPQUFqRCxFQURUO0lBQUEsQ0FIUixDQUFBOztBQUFBLHlCQU1BLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFD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

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/config-import-view.coffee
