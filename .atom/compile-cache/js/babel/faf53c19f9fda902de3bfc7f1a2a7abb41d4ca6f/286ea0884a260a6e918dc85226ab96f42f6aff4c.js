Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _parsersMagicParser = require('./parsers/magic-parser');

var _parsersMagicParser2 = _interopRequireDefault(_parsersMagicParser);

'use babel';

var masterFilePattern = new RegExp('' + '^\\s*' + // Optional whitespace.
'\\\\documentclass' + // Command.
'(\\[.*\\])?' + // Optional command options.
'\\{.*\\}' // Class name.
);

var MasterTexFinder = (function () {
  // Create a new MasterTexFinder.
  // this.param filePath: a file name in the directory to be searched

  function MasterTexFinder(filePath) {
    _classCallCheck(this, MasterTexFinder);

    this.filePath = filePath;
    this.fileName = _path2['default'].basename(filePath);
    this.projectPath = _path2['default'].dirname(filePath);
  }

  // Returns the list of tex files in the project directory

  _createClass(MasterTexFinder, [{
    key: 'getTexFilesList',
    value: function getTexFilesList() {
      return _fsPlus2['default'].listSync(this.projectPath, ['.tex']);
    }

    // Returns true iff path is a master file (contains the documentclass declaration)
  }, {
    key: 'isMasterFile',
    value: function isMasterFile(filePath) {
      if (!_fsPlus2['default'].existsSync(filePath)) {
        return false;
      }

      var rawFile = _fsPlus2['default'].readFileSync(filePath, { encoding: 'utf-8' });
      return masterFilePattern.test(rawFile);
    }

    // Returns an array containing the path to the root file indicated by a magic
    // comment in this.filePath.
    // Returns null if no magic comment can be found in this.filePath.
  }, {
    key: 'getMagicCommentMasterFile',
    value: function getMagicCommentMasterFile() {
      var magic = new _parsersMagicParser2['default'](this.filePath).parse();
      if (!magic || !magic.root) {
        return null;
      }
      return _path2['default'].resolve(this.projectPath, magic.root);
    }

    // Returns the list of tex files in the directory where this.filePath lives that
    // contain a documentclass declaration.
  }, {
    key: 'searchForMasterFile',
    value: function searchForMasterFile() {
      var _this = this;

      var files = this.getTexFilesList();
      if (!files) {
        return null;
      }
      if (files.length === 0) {
        return this.filePath;
      }
      if (files.length === 1) {
        return files[0];
      }

      var result = files.filter(function (p) {
        return _this.isMasterFile(p);
      });
      if (result.length === 1) {
        return result[0];
      }

      // TODO: Nuke warning?
      latex.log.warning('Cannot find latex master file');
      return this.filePath;
    }

    // Returns the a latex master file.
    //
    // If this.filePath contains a magic comment uses that comment to determine the master file.
    // Else if master file search is disabled, returns this.filePath.
    // Else if the this.filePath is itself a master file, returns this.filePath.
    // Otherwise it searches the directory where this.filePath is contained for files having a
    //   'documentclass' declaration.
  }, {
    key: 'getMasterTexPath',
    value: function getMasterTexPath() {
      var masterPath = this.getMagicCommentMasterFile();
      if (masterPath) {
        return masterPath;
      }
      if (!this.isMasterFileSearchEnabled()) {
        return this.filePath;
      }
      if (this.isMasterFile(this.filePath)) {
        return this.filePath;
      }

      return this.searchForMasterFile();
    }
  }, {
    key: 'isMasterFileSearchEnabled',
    value: function isMasterFileSearchEnabled() {
      return atom.config.get('latex.useMasterFileSearch');
    }
  }]);

  return MasterTexFinder;
})();

exports['default'] = MasterTexFinder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvbWFzdGVyLXRleC1maW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFZSxTQUFTOzs7O29CQUNQLE1BQU07Ozs7a0NBQ0Msd0JBQXdCOzs7O0FBSmhELFdBQVcsQ0FBQTs7QUFNWCxJQUFNLGlCQUFpQixHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsR0FDckMsT0FBTztBQUNQLG1CQUFtQjtBQUNuQixhQUFhO0FBQ2IsVUFBVTtDQUNYLENBQUE7O0lBRW9CLGVBQWU7Ozs7QUFHdEIsV0FITyxlQUFlLENBR3JCLFFBQVEsRUFBRTswQkFISixlQUFlOztBQUloQyxRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtBQUN4QixRQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUN2QyxRQUFJLENBQUMsV0FBVyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtHQUMxQzs7OztlQVBrQixlQUFlOztXQVVsQiwyQkFBRztBQUNqQixhQUFPLG9CQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtLQUMvQzs7Ozs7V0FHWSxzQkFBQyxRQUFRLEVBQUU7QUFDdEIsVUFBSSxDQUFDLG9CQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUFFLGVBQU8sS0FBSyxDQUFBO09BQUU7O0FBRTlDLFVBQU0sT0FBTyxHQUFHLG9CQUFHLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQTtBQUM5RCxhQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUN2Qzs7Ozs7OztXQUt5QixxQ0FBRztBQUMzQixVQUFNLEtBQUssR0FBRyxvQ0FBZ0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3BELFVBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO0FBQUUsZUFBTyxJQUFJLENBQUE7T0FBRTtBQUMxQyxhQUFPLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNsRDs7Ozs7O1dBSW1CLCtCQUFHOzs7QUFDckIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0FBQ3BDLFVBQUksQ0FBQyxLQUFLLEVBQUU7QUFBRSxlQUFPLElBQUksQ0FBQTtPQUFFO0FBQzNCLFVBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFBRSxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7T0FBRTtBQUNoRCxVQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQUUsZUFBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FBRTs7QUFFM0MsVUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7ZUFBSSxNQUFLLFlBQVksQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDdEQsVUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUFFLGVBQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQUU7OztBQUc3QyxXQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0FBQ2xELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUNyQjs7Ozs7Ozs7Ozs7V0FTZ0IsNEJBQUc7QUFDbEIsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUE7QUFDbkQsVUFBSSxVQUFVLEVBQUU7QUFBRSxlQUFPLFVBQVUsQ0FBQTtPQUFFO0FBQ3JDLFVBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFBRTtBQUFFLGVBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtPQUFFO0FBQy9ELFVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFBRSxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7T0FBRTs7QUFFOUQsYUFBTyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtLQUNsQzs7O1dBRXlCLHFDQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0tBQUU7OztTQS9EakUsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2xhdGV4L2xpYi9tYXN0ZXItdGV4LWZpbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBNYWdpY1BhcnNlciBmcm9tICcuL3BhcnNlcnMvbWFnaWMtcGFyc2VyJ1xuXG5jb25zdCBtYXN0ZXJGaWxlUGF0dGVybiA9IG5ldyBSZWdFeHAoJycgK1xuICAnXlxcXFxzKicgKyAgICAgICAgICAgICAvLyBPcHRpb25hbCB3aGl0ZXNwYWNlLlxuICAnXFxcXFxcXFxkb2N1bWVudGNsYXNzJyArIC8vIENvbW1hbmQuXG4gICcoXFxcXFsuKlxcXFxdKT8nICsgICAgICAgLy8gT3B0aW9uYWwgY29tbWFuZCBvcHRpb25zLlxuICAnXFxcXHsuKlxcXFx9JyAgICAgICAgICAgIC8vIENsYXNzIG5hbWUuXG4pXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hc3RlclRleEZpbmRlciB7XG4gIC8vIENyZWF0ZSBhIG5ldyBNYXN0ZXJUZXhGaW5kZXIuXG4gIC8vIHRoaXMucGFyYW0gZmlsZVBhdGg6IGEgZmlsZSBuYW1lIGluIHRoZSBkaXJlY3RvcnkgdG8gYmUgc2VhcmNoZWRcbiAgY29uc3RydWN0b3IgKGZpbGVQYXRoKSB7XG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoXG4gICAgdGhpcy5maWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG4gICAgdGhpcy5wcm9qZWN0UGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIGxpc3Qgb2YgdGV4IGZpbGVzIGluIHRoZSBwcm9qZWN0IGRpcmVjdG9yeVxuICBnZXRUZXhGaWxlc0xpc3QgKCkge1xuICAgIHJldHVybiBmcy5saXN0U3luYyh0aGlzLnByb2plY3RQYXRoLCBbJy50ZXgnXSlcbiAgfVxuXG4gIC8vIFJldHVybnMgdHJ1ZSBpZmYgcGF0aCBpcyBhIG1hc3RlciBmaWxlIChjb250YWlucyB0aGUgZG9jdW1lbnRjbGFzcyBkZWNsYXJhdGlvbilcbiAgaXNNYXN0ZXJGaWxlIChmaWxlUGF0aCkge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpIHsgcmV0dXJuIGZhbHNlIH1cblxuICAgIGNvbnN0IHJhd0ZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIHtlbmNvZGluZzogJ3V0Zi04J30pXG4gICAgcmV0dXJuIG1hc3RlckZpbGVQYXR0ZXJuLnRlc3QocmF3RmlsZSlcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgcGF0aCB0byB0aGUgcm9vdCBmaWxlIGluZGljYXRlZCBieSBhIG1hZ2ljXG4gIC8vIGNvbW1lbnQgaW4gdGhpcy5maWxlUGF0aC5cbiAgLy8gUmV0dXJucyBudWxsIGlmIG5vIG1hZ2ljIGNvbW1lbnQgY2FuIGJlIGZvdW5kIGluIHRoaXMuZmlsZVBhdGguXG4gIGdldE1hZ2ljQ29tbWVudE1hc3RlckZpbGUgKCkge1xuICAgIGNvbnN0IG1hZ2ljID0gbmV3IE1hZ2ljUGFyc2VyKHRoaXMuZmlsZVBhdGgpLnBhcnNlKClcbiAgICBpZiAoIW1hZ2ljIHx8ICFtYWdpYy5yb290KSB7IHJldHVybiBudWxsIH1cbiAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHRoaXMucHJvamVjdFBhdGgsIG1hZ2ljLnJvb3QpXG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSBsaXN0IG9mIHRleCBmaWxlcyBpbiB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoaXMuZmlsZVBhdGggbGl2ZXMgdGhhdFxuICAvLyBjb250YWluIGEgZG9jdW1lbnRjbGFzcyBkZWNsYXJhdGlvbi5cbiAgc2VhcmNoRm9yTWFzdGVyRmlsZSAoKSB7XG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldFRleEZpbGVzTGlzdCgpXG4gICAgaWYgKCFmaWxlcykgeyByZXR1cm4gbnVsbCB9XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gdGhpcy5maWxlUGF0aCB9XG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMSkgeyByZXR1cm4gZmlsZXNbMF0gfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gZmlsZXMuZmlsdGVyKHAgPT4gdGhpcy5pc01hc3RlckZpbGUocCkpXG4gICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDEpIHsgcmV0dXJuIHJlc3VsdFswXSB9XG5cbiAgICAvLyBUT0RPOiBOdWtlIHdhcm5pbmc/XG4gICAgbGF0ZXgubG9nLndhcm5pbmcoJ0Nhbm5vdCBmaW5kIGxhdGV4IG1hc3RlciBmaWxlJylcbiAgICByZXR1cm4gdGhpcy5maWxlUGF0aFxuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgYSBsYXRleCBtYXN0ZXIgZmlsZS5cbiAgLy9cbiAgLy8gSWYgdGhpcy5maWxlUGF0aCBjb250YWlucyBhIG1hZ2ljIGNvbW1lbnQgdXNlcyB0aGF0IGNvbW1lbnQgdG8gZGV0ZXJtaW5lIHRoZSBtYXN0ZXIgZmlsZS5cbiAgLy8gRWxzZSBpZiBtYXN0ZXIgZmlsZSBzZWFyY2ggaXMgZGlzYWJsZWQsIHJldHVybnMgdGhpcy5maWxlUGF0aC5cbiAgLy8gRWxzZSBpZiB0aGUgdGhpcy5maWxlUGF0aCBpcyBpdHNlbGYgYSBtYXN0ZXIgZmlsZSwgcmV0dXJucyB0aGlzLmZpbGVQYXRoLlxuICAvLyBPdGhlcndpc2UgaXQgc2VhcmNoZXMgdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGlzLmZpbGVQYXRoIGlzIGNvbnRhaW5lZCBmb3IgZmlsZXMgaGF2aW5nIGFcbiAgLy8gICAnZG9jdW1lbnRjbGFzcycgZGVjbGFyYXRpb24uXG4gIGdldE1hc3RlclRleFBhdGggKCkge1xuICAgIGNvbnN0IG1hc3RlclBhdGggPSB0aGlzLmdldE1hZ2ljQ29tbWVudE1hc3RlckZpbGUoKVxuICAgIGlmIChtYXN0ZXJQYXRoKSB7IHJldHVybiBtYXN0ZXJQYXRoIH1cbiAgICBpZiAoIXRoaXMuaXNNYXN0ZXJGaWxlU2VhcmNoRW5hYmxlZCgpKSB7IHJldHVybiB0aGlzLmZpbGVQYXRoIH1cbiAgICBpZiAodGhpcy5pc01hc3RlckZpbGUodGhpcy5maWxlUGF0aCkpIHsgcmV0dXJuIHRoaXMuZmlsZVBhdGggfVxuXG4gICAgcmV0dXJuIHRoaXMuc2VhcmNoRm9yTWFzdGVyRmlsZSgpXG4gIH1cblxuICBpc01hc3RlckZpbGVTZWFyY2hFbmFibGVkICgpIHsgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnbGF0ZXgudXNlTWFzdGVyRmlsZVNlYXJjaCcpIH1cbn1cbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/master-tex-finder.js
