Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _opener = require('../opener');

var _opener2 = _interopRequireDefault(_opener);

'use babel';

var AtomPdfOpener = (function (_Opener) {
  _inherits(AtomPdfOpener, _Opener);

  function AtomPdfOpener() {
    _classCallCheck(this, AtomPdfOpener);

    _get(Object.getPrototypeOf(AtomPdfOpener.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AtomPdfOpener, [{
    key: 'open',
    value: function open(filePath, texPath, lineNumber, callback) {
      // Opens PDF in a new pane -- requires pdf-view module
      var openPanes = atom.workspace.getPaneItems();
      for (var openPane of openPanes) {
        // File is already open in another pane
        if (openPane.filePath === filePath) {
          return;
        }
      }

      var pane = atom.workspace.getActivePane();
      // TODO: Make this configurable?
      // FIXME: Migrate to Pane::splitRight.
      var newPane = pane.split('horizontal', 'after');
      // FIXME: Use public API instead.
      atom.workspace.openURIInPane(filePath, newPane);

      // TODO: Check for actual success?
      if (callback) {
        callback(0);
      }
    }
  }]);

  return AtomPdfOpener;
})(_opener2['default']);

exports['default'] = AtomPdfOpener;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVycy9hdG9tcGRmLW9wZW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFbUIsV0FBVzs7OztBQUY5QixXQUFXLENBQUE7O0lBSVUsYUFBYTtZQUFiLGFBQWE7O1dBQWIsYUFBYTswQkFBYixhQUFhOzsrQkFBYixhQUFhOzs7ZUFBYixhQUFhOztXQUMzQixjQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTs7QUFFN0MsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtBQUMvQyxXQUFLLElBQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTs7QUFFaEMsWUFBSSxRQUFRLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtBQUFFLGlCQUFNO1NBQUU7T0FDL0M7O0FBRUQsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQTs7O0FBRzNDLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUVqRCxVQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUE7OztBQUcvQyxVQUFJLFFBQVEsRUFBRTtBQUNaLGdCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDWjtLQUNGOzs7U0FwQmtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9sYXRleC9saWIvb3BlbmVycy9hdG9tcGRmLW9wZW5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBPcGVuZXIgZnJvbSAnLi4vb3BlbmVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tUGRmT3BlbmVyIGV4dGVuZHMgT3BlbmVyIHtcbiAgb3BlbiAoZmlsZVBhdGgsIHRleFBhdGgsIGxpbmVOdW1iZXIsIGNhbGxiYWNrKSB7XG4gICAgLy8gT3BlbnMgUERGIGluIGEgbmV3IHBhbmUgLS0gcmVxdWlyZXMgcGRmLXZpZXcgbW9kdWxlXG4gICAgY29uc3Qgb3BlblBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKClcbiAgICBmb3IgKGNvbnN0IG9wZW5QYW5lIG9mIG9wZW5QYW5lcykge1xuICAgICAgLy8gRmlsZSBpcyBhbHJlYWR5IG9wZW4gaW4gYW5vdGhlciBwYW5lXG4gICAgICBpZiAob3BlblBhbmUuZmlsZVBhdGggPT09IGZpbGVQYXRoKSB7IHJldHVybiB9XG4gICAgfVxuXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIC8vIFRPRE86IE1ha2UgdGhpcyBjb25maWd1cmFibGU/XG4gICAgLy8gRklYTUU6IE1pZ3JhdGUgdG8gUGFuZTo6c3BsaXRSaWdodC5cbiAgICBjb25zdCBuZXdQYW5lID0gcGFuZS5zcGxpdCgnaG9yaXpvbnRhbCcsICdhZnRlcicpXG4gICAgLy8gRklYTUU6IFVzZSBwdWJsaWMgQVBJIGluc3RlYWQuXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZShmaWxlUGF0aCwgbmV3UGFuZSlcblxuICAgIC8vIFRPRE86IENoZWNrIGZvciBhY3R1YWwgc3VjY2Vzcz9cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKDApXG4gICAgfVxuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/latex/lib/openers/atompdf-opener.js
