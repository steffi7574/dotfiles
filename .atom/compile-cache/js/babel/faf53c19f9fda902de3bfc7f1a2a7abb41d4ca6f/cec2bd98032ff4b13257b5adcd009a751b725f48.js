Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _werkzeug = require('./werkzeug');

'use babel';

var Composer = (function () {
  function Composer() {
    _classCallCheck(this, Composer);
  }

  _createClass(Composer, [{
    key: 'destroy',
    value: function destroy() {
      this.destroyProgressIndicator();
      this.destroyErrorIndicator();
    }
  }, {
    key: 'build',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var _getEditorDetails = this.getEditorDetails();

      var editor = _getEditorDetails.editor;
      var filePath = _getEditorDetails.filePath;

      if (!filePath) {
        latex.log.warning('File needs to be saved to disk before it can be TeXified.');
        return Promise.reject(false);
      }

      if (!this.isTexFile(filePath)) {
        latex.log.warning((0, _werkzeug.heredoc)('File does not seem to be a TeX file\n        unsupported extension \'' + _path2['default'].extname(filePath) + '\'.'));
        return Promise.reject(false);
      }

      if (editor.isModified()) {
        editor.save(); // TODO: Make this configurable?
      }

      var builder = latex.getBuilder();
      var rootFilePath = this.resolveRootFilePath(filePath);

      this.destroyErrorIndicator();
      this.showProgressIndicator();

      return new Promise(_asyncToGenerator(function* (resolve, reject) {
        var statusCode = undefined,
            result = undefined;

        var showBuildError = function showBuildError() {
          _this.showError(statusCode, result, builder);
          reject(statusCode);
        };

        try {
          statusCode = yield builder.run(rootFilePath);
          result = builder.parseLogFile(rootFilePath);
          if (statusCode > 0 || !result || !result.outputFilePath) {
            showBuildError(statusCode, result, builder);
            return;
          }

          if (_this.shouldMoveResult()) {
            _this.moveResult(result, rootFilePath);
          }

          _this.showResult(result);
          resolve(statusCode);
        } catch (error) {
          console.error(error.message);
          reject(error.message);
        } finally {
          _this.destroyProgressIndicator();
        }
      }));
    })
  }, {
    key: 'sync',
    value: function sync() {
      var _getEditorDetails2 = this.getEditorDetails();

      var filePath = _getEditorDetails2.filePath;
      var lineNumber = _getEditorDetails2.lineNumber;

      if (!filePath || !this.isTexFile(filePath)) {
        return;
      }

      var outputFilePath = this.resolveOutputFilePath(filePath);
      if (!outputFilePath) {
        latex.log.warning('Could not resolve path to output file associated with the current file.');
        return;
      }

      var opener = latex.getOpener();
      if (opener) {
        opener.open(outputFilePath, filePath, lineNumber);
      }
    }

    // NOTE: Does not support `latex.outputDirectory` setting!
  }, {
    key: 'clean',
    value: _asyncToGenerator(function* () {
      var _getEditorDetails3 = this.getEditorDetails();

      var filePath = _getEditorDetails3.filePath;

      if (!filePath || !this.isTexFile(filePath)) {
        return Promise.reject();
      }

      var rootFilePath = this.resolveRootFilePath(filePath);
      var rootPath = _path2['default'].dirname(rootFilePath);
      var rootFile = _path2['default'].basename(rootFilePath);
      rootFile = rootFile.substring(0, rootFile.lastIndexOf('.'));

      var cleanExtensions = atom.config.get('latex.cleanExtensions');
      return yield Promise.all(cleanExtensions.map(_asyncToGenerator(function* (extension) {
        var candidatePath = _path2['default'].join(rootPath, rootFile + extension);
        return new Promise(_asyncToGenerator(function* (resolve) {
          _fsPlus2['default'].remove(candidatePath, function (error) {
            resolve({ filePath: candidatePath, error: error });
          });
        }));
      })));
    })
  }, {
    key: 'setStatusBar',
    value: function setStatusBar(statusBar) {
      this.statusBar = statusBar;
    }
  }, {
    key: 'moveResult',
    value: function moveResult(result, filePath) {
      var originalOutputFilePath = result.outputFilePath;
      result.outputFilePath = this.alterParentPath(filePath, originalOutputFilePath);
      if (_fsPlus2['default'].existsSync(originalOutputFilePath)) {
        _fsPlus2['default'].removeSync(result.outputFilePath);
        _fsPlus2['default'].moveSync(originalOutputFilePath, result.outputFilePath);
      }

      var originalSyncFilePath = originalOutputFilePath.replace(/\.pdf$/, '.synctex.gz');
      if (_fsPlus2['default'].existsSync(originalSyncFilePath)) {
        var syncFilePath = this.alterParentPath(filePath, originalSyncFilePath);
        _fsPlus2['default'].removeSync(syncFilePath);
        _fsPlus2['default'].moveSync(originalSyncFilePath, syncFilePath);
      }
    }
  }, {
    key: 'resolveRootFilePath',
    value: function resolveRootFilePath(filePath) {
      var MasterTexFinder = require('./master-tex-finder');
      var finder = new MasterTexFinder(filePath);
      return finder.getMasterTexPath();
    }
  }, {
    key: 'resolveOutputFilePath',
    value: function resolveOutputFilePath(filePath) {
      var outputFilePath = undefined,
          rootFilePath = undefined;

      if (this.outputLookup) {
        outputFilePath = this.outputLookup[filePath];
      }

      if (!outputFilePath) {
        rootFilePath = this.resolveRootFilePath(filePath);

        var builder = latex.getBuilder();
        var result = builder.parseLogFile(rootFilePath);
        if (!result || !result.outputFilePath) {
          latex.log.warning('Log file parsing failed!');
          return null;
        }

        this.outputLookup = this.outputLookup || {};
        this.outputLookup[filePath] = result.outputFilePath;
      }

      if (this.shouldMoveResult()) {
        outputFilePath = this.alterParentPath(rootFilePath, outputFilePath);
      }

      return outputFilePath;
    }
  }, {
    key: 'showResult',
    value: function showResult(result) {
      if (!this.shouldOpenResult()) {
        return;
      }

      var opener = latex.getOpener();
      if (opener) {
        var _getEditorDetails4 = this.getEditorDetails();

        var filePath = _getEditorDetails4.filePath;
        var lineNumber = _getEditorDetails4.lineNumber;

        opener.open(result.outputFilePath, filePath, lineNumber);
      }
    }
  }, {
    key: 'showError',
    value: function showError(statusCode, result, builder) {
      this.showErrorIndicator(result);
      latex.log.error(statusCode, result, builder);
    }
  }, {
    key: 'showProgressIndicator',
    value: function showProgressIndicator() {
      if (!this.statusBar) {
        return null;
      }
      if (this.indicator) {
        return this.indicator;
      }

      var ProgressIndicator = require('./status-bar/progress-indicator');
      this.indicator = new ProgressIndicator();
      this.statusBar.addRightTile({
        item: this.indicator,
        priority: 9001
      });
    }
  }, {
    key: 'showErrorIndicator',
    value: function showErrorIndicator(result) {
      if (!this.statusBar) {
        return null;
      }
      if (this.errorIndicator) {
        return this.errorIndicator;
      }

      var ErrorIndicator = require('./status-bar/error-indicator');
      this.errorIndicator = new ErrorIndicator(result);
      this.statusBar.addRightTile({
        item: this.errorIndicator,
        priority: 9001
      });
    }
  }, {
    key: 'destroyProgressIndicator',
    value: function destroyProgressIndicator() {
      if (this.indicator) {
        this.indicator.element.remove();
        this.indicator = null;
      }
    }
  }, {
    key: 'destroyErrorIndicator',
    value: function destroyErrorIndicator() {
      if (this.errorIndicator) {
        this.errorIndicator.element.remove();
        this.errorIndicator = null;
      }
    }
  }, {
    key: 'isTexFile',
    value: function isTexFile(filePath) {
      // TODO: Improve will suffice for the time being.
      return !filePath || filePath.search(/\.(tex|lhs)$/) > 0;
    }
  }, {
    key: 'getEditorDetails',
    value: function getEditorDetails() {
      var editor = atom.workspace.getActiveTextEditor();
      var filePath = undefined,
          lineNumber = undefined;
      if (editor) {
        filePath = editor.getPath();
        lineNumber = editor.getCursorBufferPosition().row + 1;
      }

      return {
        editor: editor,
        filePath: filePath,
        lineNumber: lineNumber
      };
    }
  }, {
    key: 'alterParentPath',
    value: function alterParentPath(targetPath, originalPath) {
      var targetDir = _path2['default'].dirname(targetPath);
      return _path2['default'].join(targetDir, _path2['default'].basename(originalPath));
    }
  }, {
    key: 'shouldMoveResult',
    value: function shouldMoveResult() {
      var moveResult = atom.config.get('latex.moveResultToSourceDirectory');
      var outputDirectory = atom.config.get('latex.outputDirectory');
      return moveResult && outputDirectory.length > 0;
    }
  }, {
    key: 'shouldOpenResult',
    value: function shouldOpenResult() {
      return atom.config.get('latex.openResultAfterBuild');
    }
  }]);

  return Composer;
})();

exports['default'] = Composer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvY29tcG9zZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3NCQUVlLFNBQVM7Ozs7b0JBQ1AsTUFBTTs7Ozt3QkFDRCxZQUFZOztBQUpsQyxXQUFXLENBQUE7O0lBTVUsUUFBUTtXQUFSLFFBQVE7MEJBQVIsUUFBUTs7O2VBQVIsUUFBUTs7V0FDbkIsbUJBQUc7QUFDVCxVQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQTtBQUMvQixVQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtLQUM3Qjs7OzZCQUVXLGFBQUc7Ozs4QkFDYyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7O1VBQTNDLE1BQU0scUJBQU4sTUFBTTtVQUFFLFFBQVEscUJBQVIsUUFBUTs7QUFFdkIsVUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGFBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDJEQUEyRCxDQUFDLENBQUE7QUFDOUUsZUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzdCOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzdCLGFBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlHQUNTLGtCQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBSyxDQUFDLENBQUE7QUFDdkQsZUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzdCOztBQUVELFVBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3ZCLGNBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtPQUNkOztBQUVELFVBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQTtBQUNsQyxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRXZELFVBQUksQ0FBQyxxQkFB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QUksTUFBTSxFQUFFO0FBQ1YsZ0JBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDM0Isa0JBQVUsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO09BQ3REOztBQUVELGFBQU87QUFDTCxjQUFNLEVBQUUsTUFBTTtBQUNkLGdCQUFRLEVBQUUsUUFBUTtBQUNsQixrQkFBVSxFQUFFLFVBQVU7T0FDdkIsQ0FBQTtLQUNGOzs7V0FFZSx5QkFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFO0FBQ3pDLFVBQU0sU0FBUyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMxQyxhQUFPLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsa0JBQUssUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7S0FDekQ7OztXQUVnQiw0QkFBRztBQUNsQixVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBQ3ZFLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUE7QUFDaEUsYUFBTyxVQUFVLElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7S0FDaEQ7OztXQUVnQiw0QkFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtLQUFFOzs7U0FoUHpELFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvY29tcG9zZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQge2hlcmVkb2N9IGZyb20gJy4vd2Vya3pldWcnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBvc2VyIHtcbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5kZXN0cm95UHJvZ3Jlc3NJbmRpY2F0b3IoKVxuICAgIHRoaXMuZGVzdHJveUVycm9ySW5kaWNhdG9yKClcbiAgfVxuXG4gIGFzeW5jIGJ1aWxkICgpIHtcbiAgICBjb25zdCB7ZWRpdG9yLCBmaWxlUGF0aH0gPSB0aGlzLmdldEVkaXRvckRldGFpbHMoKVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgbGF0ZXgubG9nLndhcm5pbmcoJ0ZpbGUgbmVlZHMgdG8gYmUgc2F2ZWQgdG8gZGlzayBiZWZvcmUgaXQgY2FuIGJlIFRlWGlmaWVkLicpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZmFsc2UpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzVGV4RmlsZShmaWxlUGF0aCkpIHtcbiAgICAgIGxhdGV4LmxvZy53YXJuaW5nKGhlcmVkb2MoYEZpbGUgZG9lcyBub3Qgc2VlbSB0byBiZSBhIFRlWCBmaWxlXG4gICAgICAgIHVuc3VwcG9ydGVkIGV4dGVuc2lvbiAnJHtwYXRoLmV4dG5hbWUoZmlsZVBhdGgpfScuYCkpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZmFsc2UpXG4gICAgfVxuXG4gICAgaWYgKGVkaXRvci5pc01vZGlmaWVkKCkpIHtcbiAgICAgIGVkaXRvci5zYXZlKCkgLy8gVE9ETzogTWFrZSB0aGlzIGNvbmZpZ3VyYWJsZT9cbiAgICB9XG5cbiAgICBjb25zdCBidWlsZGVyID0gbGF0ZXguZ2V0QnVpbGRlcigpXG4gICAgY29uc3Qgcm9vdEZpbGVQYXRoID0gdGhpcy5yZXNvbHZlUm9vdEZpbGVQYXRoKGZpbGVQYXRoKVxuXG4gICAgdGhpcy5kZXN0cm95RXJyb3JJbmRpY2F0b3IoKVxuICAgIHRoaXMuc2hvd1Byb2dyZXNzSW5kaWNhdG9yKClcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc3RhdHVzQ29kZSwgcmVzdWx0XG5cbiAgICAgIGNvbnN0IHNob3dCdWlsZEVycm9yID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNob3dFcnJvcihzdGF0dXNDb2RlLCByZXN1bHQsIGJ1aWxkZXIpXG4gICAgICAgIHJlamVjdChzdGF0dXNDb2RlKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBzdGF0dXNDb2RlID0gYXdhaXQgYnVpbGRlci5ydW4ocm9vdEZpbGVQYXRoKVxuICAgICAgICByZXN1bHQgPSBidWlsZGVyLnBhcnNlTG9nRmlsZShyb290RmlsZVBhdGgpXG4gICAgICAgIGlmIChzdGF0dXNDb2RlID4gMCB8fCAhcmVzdWx0IHx8ICFyZXN1bHQub3V0cHV0RmlsZVBhdGgpIHtcbiAgICAgICAgICBzaG93QnVpbGRFcnJvcihzdGF0dXNDb2RlLCByZXN1bHQsIGJ1aWxkZXIpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zaG91bGRNb3ZlUmVzdWx0KCkpIHtcbiAgICAgICAgICB0aGlzLm1vdmVSZXN1bHQocmVzdWx0LCByb290RmlsZVBhdGgpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3dSZXN1bHQocmVzdWx0KVxuICAgICAgICByZXNvbHZlKHN0YXR1c0NvZGUpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5kZXN0cm95UHJvZ3Jlc3NJbmRpY2F0b3IoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBzeW5jICgpIHtcbiAgICBjb25zdCB7ZmlsZVBhdGgsIGxpbmVOdW1iZXJ9ID0gdGhpcy5nZXRFZGl0b3JEZXRhaWxzKClcbiAgICBpZiAoIWZpbGVQYXRoIHx8ICF0aGlzLmlzVGV4RmlsZShmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dEZpbGVQYXRoID0gdGhpcy5yZXNvbHZlT3V0cHV0RmlsZVBhdGgoZmlsZVBhdGgpXG4gICAgaWYgKCFvdXRwdXRGaWxlUGF0aCkge1xuICAgICAgbGF0ZXgubG9nLndhcm5pbmcoJ0NvdWxkIG5vdCByZXNvbHZlIHBhdGggdG8gb3V0cHV0IGZpbGUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50IGZpbGUuJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG9wZW5lciA9IGxhdGV4LmdldE9wZW5lcigpXG4gICAgaWYgKG9wZW5lcikge1xuICAgICAgb3BlbmVyLm9wZW4ob3V0cHV0RmlsZVBhdGgsIGZpbGVQYXRoLCBsaW5lTnVtYmVyKVxuICAgIH1cbiAgfVxuXG4gIC8vIE5PVEU6IERvZXMgbm90IHN1cHBvcnQgYGxhdGV4Lm91dHB1dERpcmVjdG9yeWAgc2V0dGluZyFcbiAgYXN5bmMgY2xlYW4gKCkge1xuICAgIGNvbnN0IHtmaWxlUGF0aH0gPSB0aGlzLmdldEVkaXRvckRldGFpbHMoKVxuICAgIGlmICghZmlsZVBhdGggfHwgIXRoaXMuaXNUZXhGaWxlKGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KClcbiAgICB9XG5cbiAgICBjb25zdCByb290RmlsZVBhdGggPSB0aGlzLnJlc29sdmVSb290RmlsZVBhdGgoZmlsZVBhdGgpXG4gICAgY29uc3Qgcm9vdFBhdGggPSBwYXRoLmRpcm5hbWUocm9vdEZpbGVQYXRoKVxuICAgIGxldCByb290RmlsZSA9IHBhdGguYmFzZW5hbWUocm9vdEZpbGVQYXRoKVxuICAgIHJvb3RGaWxlID0gcm9vdEZpbGUuc3Vic3RyaW5nKDAsIHJvb3RGaWxlLmxhc3RJbmRleE9mKCcuJykpXG5cbiAgICBjb25zdCBjbGVhbkV4dGVuc2lvbnMgPSBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4LmNsZWFuRXh0ZW5zaW9ucycpXG4gICAgcmV0dXJuIGF3YWl0KiBjbGVhbkV4dGVuc2lvbnMubWFwKGFzeW5jIChleHRlbnNpb24pID0+IHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVBhdGggPSBwYXRoLmpvaW4ocm9vdFBhdGgsIHJvb3RGaWxlICsgZXh0ZW5zaW9uKVxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGZzLnJlbW92ZShjYW5kaWRhdGVQYXRoLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICByZXNvbHZlKHtmaWxlUGF0aDogY2FuZGlkYXRlUGF0aCwgZXJyb3I6IGVycm9yfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHNldFN0YXR1c0JhciAoc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXJcbiAgfVxuXG4gIG1vdmVSZXN1bHQgKHJlc3VsdCwgZmlsZVBhdGgpIHtcbiAgICBjb25zdCBvcmlnaW5hbE91dHB1dEZpbGVQYXRoID0gcmVzdWx0Lm91dHB1dEZpbGVQYXRoXG4gICAgcmVzdWx0Lm91dHB1dEZpbGVQYXRoID0gdGhpcy5hbHRlclBhcmVudFBhdGgoZmlsZVBhdGgsIG9yaWdpbmFsT3V0cHV0RmlsZVBhdGgpXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMob3JpZ2luYWxPdXRwdXRGaWxlUGF0aCkpIHtcbiAgICAgIGZzLnJlbW92ZVN5bmMocmVzdWx0Lm91dHB1dEZpbGVQYXRoKVxuICAgICAgZnMubW92ZVN5bmMob3JpZ2luYWxPdXRwdXRGaWxlUGF0aCwgcmVzdWx0Lm91dHB1dEZpbGVQYXRoKVxuICAgIH1cblxuICAgIGNvbnN0IG9yaWdpbmFsU3luY0ZpbGVQYXRoID0gb3JpZ2luYWxPdXRwdXRGaWxlUGF0aC5yZXBsYWNlKC9cXC5wZGYkLywgJy5zeW5jdGV4Lmd6JylcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhvcmlnaW5hbFN5bmNGaWxlUGF0aCkpIHtcbiAgICAgIGNvbnN0IHN5bmNGaWxlUGF0aCA9IHRoaXMuYWx0ZXJQYXJlbnRQYXRoKGZpbGVQYXRoLCBvcmlnaW5hbFN5bmNGaWxlUGF0aClcbiAgICAgIGZzLnJlbW92ZVN5bmMoc3luY0ZpbGVQYXRoKVxuICAgICAgZnMubW92ZVN5bmMob3JpZ2luYWxTeW5jRmlsZVBhdGgsIHN5bmNGaWxlUGF0aClcbiAgICB9XG4gIH1cblxuICByZXNvbHZlUm9vdEZpbGVQYXRoIChmaWxlUGF0aCkge1xuICAgIGNvbnN0IE1hc3RlclRleEZpbmRlciA9IHJlcXVpcmUoJy4vbWFzdGVyLXRleC1maW5kZXInKVxuICAgIGNvbnN0IGZpbmRlciA9IG5ldyBNYXN0ZXJUZXhGaW5kZXIoZmlsZVBhdGgpXG4gICAgcmV0dXJuIGZpbmRlci5nZXRNYXN0ZXJUZXhQYXRoKClcbiAgfVxuXG4gIHJlc29sdmVPdXRwdXRGaWxlUGF0aCAoZmlsZVBhdGgpIHtcbiAgICBsZXQgb3V0cHV0RmlsZVBhdGgsIHJvb3RGaWxlUGF0aFxuXG4gICAgaWYgKHRoaXMub3V0cHV0TG9va3VwKSB7XG4gICAgICBvdXRwdXRGaWxlUGF0aCA9IHRoaXMub3V0cHV0TG9va3VwW2ZpbGVQYXRoXVxuICAgIH1cblxuICAgIGlmICghb3V0cHV0RmlsZVBhdGgpIHtcbiAgICAgIHJvb3RGaWxlUGF0aCA9IHRoaXMucmVzb2x2ZVJvb3RGaWxlUGF0aChmaWxlUGF0aClcblxuICAgICAgY29uc3QgYnVpbGRlciA9IGxhdGV4LmdldEJ1aWxkZXIoKVxuICAgICAgY29uc3QgcmVzdWx0ID0gYnVpbGRlci5wYXJzZUxvZ0ZpbGUocm9vdEZpbGVQYXRoKVxuICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5vdXRwdXRGaWxlUGF0aCkge1xuICAgICAgICBsYXRleC5sb2cud2FybmluZygnTG9nIGZpbGUgcGFyc2luZyBmYWlsZWQhJylcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cblxuICAgICAgdGhpcy5vdXRwdXRMb29rdXAgPSB0aGlzLm91dHB1dExvb2t1cCB8fCB7fVxuICAgICAgdGhpcy5vdXRwdXRMb29rdXBbZmlsZVBhdGhdID0gcmVzdWx0Lm91dHB1dEZpbGVQYXRoXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2hvdWxkTW92ZVJlc3VsdCgpKSB7XG4gICAgICBvdXRwdXRGaWxlUGF0aCA9IHRoaXMuYWx0ZXJQYXJlbnRQYXRoKHJvb3RGaWxlUGF0aCwgb3V0cHV0RmlsZVBhdGgpXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dEZpbGVQYXRoXG4gIH1cblxuICBzaG93UmVzdWx0IChyZXN1bHQpIHtcbiAgICBpZiAoIXRoaXMuc2hvdWxkT3BlblJlc3VsdCgpKSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBvcGVuZXIgPSBsYXRleC5nZXRPcGVuZXIoKVxuICAgIGlmIChvcGVuZXIpIHtcbiAgICAgIGNvbnN0IHtmaWxlUGF0aCwgbGluZU51bWJlcn0gPSB0aGlzLmdldEVkaXRvckRldGFpbHMoKVxuICAgICAgb3BlbmVyLm9wZW4ocmVzdWx0Lm91dHB1dEZpbGVQYXRoLCBmaWxlUGF0aCwgbGluZU51bWJlcilcbiAgICB9XG4gIH1cblxuICBzaG93RXJyb3IgKHN0YXR1c0NvZGUsIHJlc3VsdCwgYnVpbGRlcikge1xuICAgIHRoaXMuc2hvd0Vycm9ySW5kaWNhdG9yKHJlc3VsdClcbiAgICBsYXRleC5sb2cuZXJyb3Ioc3RhdHVzQ29kZSwgcmVzdWx0LCBidWlsZGVyKVxuICB9XG5cbiAgc2hvd1Byb2dyZXNzSW5kaWNhdG9yICgpIHtcbiAgICBpZiAoIXRoaXMuc3RhdHVzQmFyKSB7IHJldHVybiBudWxsIH1cbiAgICBpZiAodGhpcy5pbmRpY2F0b3IpIHsgcmV0dXJuIHRoaXMuaW5kaWNhdG9yIH1cblxuICAgIGNvbnN0IFByb2dyZXNzSW5kaWNhdG9yID0gcmVxdWlyZSgnLi9zdGF0dXMtYmFyL3Byb2dyZXNzLWluZGljYXRvcicpXG4gICAgdGhpcy5pbmRpY2F0b3IgPSBuZXcgUHJvZ3Jlc3NJbmRpY2F0b3IoKVxuICAgIHRoaXMuc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XG4gICAgICBpdGVtOiB0aGlzLmluZGljYXRvcixcbiAgICAgIHByaW9yaXR5OiA5MDAxXG4gICAgfSlcbiAgfVxuXG4gIHNob3dFcnJvckluZGljYXRvciAocmVzdWx0KSB7XG4gICAgaWYgKCF0aGlzLnN0YXR1c0JhcikgeyByZXR1cm4gbnVsbCB9XG4gICAgaWYgKHRoaXMuZXJyb3JJbmRpY2F0b3IpIHsgcmV0dXJuIHRoaXMuZXJyb3JJbmRpY2F0b3IgfVxuXG4gICAgY29uc3QgRXJyb3JJbmRpY2F0b3IgPSByZXF1aXJlKCcuL3N0YXR1cy1iYXIvZXJyb3ItaW5kaWNhdG9yJylcbiAgICB0aGlzLmVycm9ySW5kaWNhdG9yID0gbmV3IEVycm9ySW5kaWNhdG9yKHJlc3VsdClcbiAgICB0aGlzLnN0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbTogdGhpcy5lcnJvckluZGljYXRvcixcbiAgICAgIHByaW9yaXR5OiA5MDAxXG4gICAgfSlcbiAgfVxuXG4gIGRlc3Ryb3lQcm9ncmVzc0luZGljYXRvciAoKSB7XG4gICAgaWYgKHRoaXMuaW5kaWNhdG9yKSB7XG4gICAgICB0aGlzLmluZGljYXRvci5lbGVtZW50LnJlbW92ZSgpXG4gICAgICB0aGlzLmluZGljYXRvciA9IG51bGxcbiAgICB9XG4gIH1cblxuICBkZXN0cm95RXJyb3JJbmRpY2F0b3IgKCkge1xuICAgIGlmICh0aGlzLmVycm9ySW5kaWNhdG9yKSB7XG4gICAgICB0aGlzLmVycm9ySW5kaWNhdG9yLmVsZW1lbnQucmVtb3ZlKClcbiAgICAgIHRoaXMuZXJyb3JJbmRpY2F0b3IgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgaXNUZXhGaWxlIChmaWxlUGF0aCkge1xuICAgIC8vIFRPRE86IEltcHJvdmUgd2lsbCBzdWZmaWNlIGZvciB0aGUgdGltZSBiZWluZy5cbiAgICByZXR1cm4gIWZpbGVQYXRoIHx8IGZpbGVQYXRoLnNlYXJjaCgvXFwuKHRleHxsaHMpJC8pID4gMFxuICB9XG5cbiAgZ2V0RWRpdG9yRGV0YWlscyAoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgbGV0IGZpbGVQYXRoLCBsaW5lTnVtYmVyXG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBsaW5lTnVtYmVyID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93ICsgMVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBlZGl0b3I6IGVkaXRvcixcbiAgICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICAgIGxpbmVOdW1iZXI6IGxpbmVOdW1iZXJcbiAgICB9XG4gIH1cblxuICBhbHRlclBhcmVudFBhdGggKHRhcmdldFBhdGgsIG9yaWdpbmFsUGF0aCkge1xuICAgIGNvbnN0IHRhcmdldERpciA9IHBhdGguZGlybmFtZSh0YXJnZXRQYXRoKVxuICAgIHJldHVybiBwYXRoLmpvaW4odGFyZ2V0RGlyLCBwYXRoLmJhc2VuYW1lKG9yaWdpbmFsUGF0aCkpXG4gIH1cblxuICBzaG91bGRNb3ZlUmVzdWx0ICgpIHtcbiAgICBjb25zdCBtb3ZlUmVzdWx0ID0gYXRvbS5jb25maWcuZ2V0KCdsYXRleC5tb3ZlUmVzdWx0VG9Tb3VyY2VEaXJlY3RvcnknKVxuICAgIGNvbnN0IG91dHB1dERpcmVjdG9yeSA9IGF0b20uY29uZmlnLmdldCgnbGF0ZXgub3V0cHV0RGlyZWN0b3J5JylcbiAgICByZXR1cm4gbW92ZVJlc3VsdCAmJiBvdXRwdXREaXJlY3RvcnkubGVuZ3RoID4gMFxuICB9XG5cbiAgc2hvdWxkT3BlblJlc3VsdCAoKSB7IHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2xhdGV4Lm9wZW5SZXN1bHRBZnRlckJ1aWxkJykgfVxufVxuIl19
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/composer.js
