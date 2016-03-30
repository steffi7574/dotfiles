(function() {
  var $, BufferedProcess, ExportView, TextEditorView, View, exporter, fs, importer, notifier, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  _ref = require('atom-space-pen-views'), $ = _ref.$, TextEditorView = _ref.TextEditorView, View = _ref.View;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs-plus');

  notifier = require('./notifier');

  importer = require('./import');

  exporter = require('./export');

  module.exports = ExportView = (function(_super) {
    __extends(ExportView, _super);

    function ExportView() {
      return ExportView.__super__.constructor.apply(this, arguments);
    }

    ExportView.prototype.previouslyFocusedElement = null;

    ExportView.prototype.mode = null;

    ExportView.prototype["export"] = function(file) {
      var notification;
      return notification = notifier.addSuccess(exporter.exportConfig(file), {
        dismissable: true
      });
    };

    ExportView.content = function() {
      return this.div({
        "class": 'config-import-export'
      }, (function(_this) {
        return function() {
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.div({
            "class": 'error',
            outlet: 'error'
          });
          return _this.div({
            "class": 'message',
            outlet: 'message'
          });
        };
      })(this));
    };

    ExportView.prototype.initialize = function() {
      this.commandSubscription = atom.commands.add('atom-workspace', {
        'config-import-export:export': (function(_this) {
          return function() {
            return _this.attach('export');
          };
        })(this)
      });
      this.miniEditor.on('blur', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
      return atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this)
      });
    };

    ExportView.prototype.destroy = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ExportView.prototype.attach = function(mode) {
      var now;
      this.mode = mode;
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.panel.show();
      now = new Date();
      this.message.text("Enter the backup path");
      this.setPathText("backup-" + (now.getMonth() + 1) + "-" + (now.getDate()) + "-" + (now.getFullYear()) + ".json");
      return this.miniEditor.focus();
    };

    ExportView.prototype.setPathText = function(placeholderName, rangeToSelect) {
      var backupDirectory, defaultPath, editor, endOfDirectoryIndex, pathLength;
      editor = this.miniEditor.getModel();
      if (rangeToSelect == null) {
        rangeToSelect = [0, placeholderName.length - 5];
      }
      defaultPath = atom.config.get('config-import-export.defaultPath');
      backupDirectory = defaultPath[process.platform];
      editor.setText(path.join(backupDirectory, placeholderName));
      pathLength = editor.getText().length;
      endOfDirectoryIndex = pathLength - placeholderName.length;
      return editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]]);
    };

    ExportView.prototype.close = function() {
      var _ref1;
      if (!this.panel.isVisible()) {
        return;
      }
      this.panel.hide();
      return (_ref1 = this.previouslyFocusedElement) != null ? _ref1.focus() : void 0;
    };

    ExportView.prototype.confirm = function() {
      if (this.validBackupPath()) {
        this["export"](this.getBackupPath());
        return this.close();
      }
    };

    ExportView.prototype.getBackupPath = function() {
      return fs.normalize(this.miniEditor.getText().trim());
    };

    ExportView.prototype.validBackupPath = function() {
      if (fs.existsSync(this.getBackupPath())) {
        this.error.text("File already exists at '" + (this.getBackupPath()) + "'");
        this.error.show();
        return false;
      } else {
        return true;
      }
    };

    return ExportView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2NvbmZpZy1pbXBvcnQtZXhwb3J0L2xpYi9jb25maWctZXhwb3J0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtHQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBQSxDQUFELEVBQUksc0JBQUEsY0FBSixFQUFvQixZQUFBLElBRHBCLENBQUE7O0FBQUEsRUFFQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFGRCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBTlgsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEseUJBQUEsd0JBQUEsR0FBMEIsSUFBMUIsQ0FBQTs7QUFBQSx5QkFDQSxJQUFBLEdBQU0sSUFETixDQUFBOztBQUFBLHlCQUdBLFNBQUEsR0FBUSxTQUFDLElBQUQsR0FBQTtBQUNOLFVBQUEsWUFBQTthQUFBLFlBQUEsR0FBZSxRQUFRLENBQUMsVUFBVCxDQUFvQixRQUFRLENBQUMsWUFBVCxDQUFzQixJQUF0QixDQUFwQixFQUFpRDtBQUFBLFFBQUEsV0FBQSxFQUFhLElBQWI7T0FBakQsRUFEVDtJQUFBLENBSFIsQ0FBQTs7QUFBQSxJ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

//# sourceURL=/home/sguenther/.atom/packages/config-import-export/lib/config-export-view.coffee
