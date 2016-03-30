Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _xregexp = require('xregexp');

var _events = require('events');

var _googleAnalytics = require('./google-analytics');

var _googleAnalytics2 = _interopRequireDefault(_googleAnalytics);

'use babel';

var ErrorMatcher = (function (_EventEmitter) {
  _inherits(ErrorMatcher, _EventEmitter);

  function ErrorMatcher() {
    _classCallCheck(this, ErrorMatcher);

    _get(Object.getPrototypeOf(ErrorMatcher.prototype), 'constructor', this).call(this);
    this.regex = null;
    this.cwd = null;
    this.stdout = null;
    this.stderr = null;
    this.currentMatch = [];
    this.firstMatchId = null;

    atom.commands.add('atom-workspace', 'build:error-match', this.match.bind(this));
    atom.commands.add('atom-workspace', 'build:error-match-first', this.matchFirst.bind(this));
  }

  _createClass(ErrorMatcher, [{
    key: '_gotoNext',
    value: function _gotoNext() {
      if (0 === this.currentMatch.length) {
        return;
      }

      this.goto(this.currentMatch[0].id);
    }
  }, {
    key: 'goto',
    value: function goto(id) {
      var _this = this;

      var match = this.currentMatch.find(function (m) {
        return m.id === id;
      });
      if (!match) {
        return this.emit('error', 'Can\'t find match with id ' + id);
      }

      // rotate to next match
      while (this.currentMatch[0] !== match) {
        this.currentMatch.push(this.currentMatch.shift());
      }
      this.currentMatch.push(this.currentMatch.shift());

      var file = match.file;
      if (!file) {
        return this.emit('error', 'Did not match any file. Don\'t know what to open.');
      }

      if (!_path2['default'].isAbsolute(file)) {
        file = this.cwd + _path2['default'].sep + file;
      }

      var row = match.line ? match.line - 1 : 0; /* Because atom is zero-based */
      var col = match.col ? match.col - 1 : 0; /* Because atom is zero-based */

      _fs2['default'].exists(file, function (exists) {
        if (!exists) {
          return _this.emit('error', 'Matched file does not exist: ' + file);
        }
        atom.workspace.open(file, {
          initialLine: row,
          initialColumn: col,
          searchAllPanes: true
        });
        _this.emit('matched', match.id);
      });
    }
  }, {
    key: '_parse',
    value: function _parse() {
      var _this2 = this;

      this.currentMatch = [];
      var self = this;
      var matchFunction = function matchFunction(match, i, string, regex) {
        match.id = 'error-match-' + self.regex.indexOf(regex) + '-' + i;
        this.push(match);
      };
      this.regex.forEach(function (regex) {
        _xregexp.XRegExp.forEach(_this2.output, regex, matchFunction, _this2.currentMatch);
      });

      this.currentMatch.sort(function (a, b) {
        return a.index - b.index;
      });

      this.firstMatchId = this.currentMatch.length > 0 ? this.currentMatch[0].id : null;

      this.currentMatch.forEach(function (match) {
        return _this2.emit('match', match[0], match.id);
      });
    }
  }, {
    key: 'set',
    value: function set(regex, cwd, output) {
      var _this3 = this;

      regex = regex || [];
      regex = regex instanceof Array ? regex : [regex];

      this.regex = regex.map(function (r) {
        try {
          return (0, _xregexp.XRegExp)(r);
        } catch (err) {
          _this3.emit('error', 'Error parsing regex. ' + err.message);
          return null;
        }
      }).filter(Boolean);

      this.cwd = cwd;
      this.output = output;
      this.currentMatch = [];

      this._parse();
    }
  }, {
    key: 'match',
    value: function match() {
      _googleAnalytics2['default'].sendEvent('errorMatch', 'match');

      this._gotoNext();
    }
  }, {
    key: 'matchFirst',
    value: function matchFirst() {
      _googleAnalytics2['default'].sendEvent('errorMatch', 'first');

      if (this.firstMatchId) {
        this.goto(this.firstMatchId);
      }
    }
  }, {
    key: 'hasMatch',
    value: function hasMatch() {
      return 0 !== this.currentMatch.length;
    }
  }]);

  return ErrorMatcher;
})(_events.EventEmitter);

exports['default'] = ErrorMatcher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvZXJyb3ItbWF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7O29CQUNGLE1BQU07Ozs7dUJBQ0MsU0FBUzs7c0JBQ0osUUFBUTs7K0JBQ1Qsb0JBQW9COzs7O0FBTmhELFdBQVcsQ0FBQzs7SUFRUyxZQUFZO1lBQVosWUFBWTs7QUFFcEIsV0FGUSxZQUFZLEdBRWpCOzBCQUZLLFlBQVk7O0FBRzdCLCtCQUhpQixZQUFZLDZDQUdyQjtBQUNSLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV6QixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2hGLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHlCQUF5QixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDNUY7O2VBYmtCLFlBQVk7O1dBZXRCLHFCQUFHO0FBQ1YsVUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7QUFDbEMsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNw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c0JBQUc7QUFDWCxtQ0FBZ0IsU0FBUyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFakQsVUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQzlCO0tBQ0Y7OztXQUVPLG9CQUFHO0FBQ1QsYUFBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7S0FDdkM7OztTQWxIa0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9lcnJvci1tYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFhSZWdFeHAgfSBmcm9tICd4cmVnZXhwJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgR29vZ2xlQW5hbHl0aWNzIGZyb20gJy4vZ29vZ2xlLWFuYWx5dGljcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yTWF0Y2hlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnJlZ2V4ID0gbnVsbDtcbiAgICB0aGlzLmN3ZCA9IG51bGw7XG4gICAgdGhpcy5zdGRvdXQgPSBudWxsO1xuICAgIHRoaXMuc3RkZXJyID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNYXRjaCA9IFtdO1xuICAgIHRoaXMuZmlyc3RNYXRjaElkID0gbnVsbDtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDplcnJvci1tYXRjaCcsIHRoaXMubWF0Y2guYmluZCh0aGlzKSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOmVycm9yLW1hdGNoLWZpcnN0JywgdGhpcy5tYXRjaEZpcnN0LmJpbmQodGhpcykpO1xuICB9XG5cbiAgX2dvdG9OZXh0KCkge1xuICAgIGlmICgwID09PSB0aGlzLmN1cnJlbnRNYXRjaC5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmdvdG8odGhpcy5jdXJyZW50TWF0Y2hbMF0uaWQpO1xuICB9XG5cbiAgZ290byhpZCkge1xuICAgIGNvbnN0IG1hdGNoID0gdGhpcy5jdXJyZW50TWF0Y2guZmluZChtID0+IG0uaWQgPT09IGlkKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsICdDYW5cXCd0IGZpbmQgbWF0Y2ggd2l0aCBpZCAnICsgaWQpO1xuICAgIH1cblxuICAgIC8vIHJvdGF0ZSB0byBuZXh0IG1hdGNoXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudE1hdGNoWzBdICE9PSBtYXRjaCkge1xuICAgICAgdGhpcy5jdXJyZW50TWF0Y2gucHVzaCh0aGlzLmN1cnJlbnRNYXRjaC5zaGlmdCgpKTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TWF0Y2gucHVzaCh0aGlzLmN1cnJlbnRNYXRjaC5zaGlmdCgpKTtcblxuICAgIGxldCBmaWxlID0gbWF0Y2guZmlsZTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgJ0RpZCBub3QgbWF0Y2ggYW55IGZpbGUuIERvblxcJ3Qga25vdyB3aGF0IHRvIG9wZW4uJyk7XG4gICAgfVxuXG4gICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoZmlsZSkpIHtcbiAgICAgIGZpbGUgPSB0aGlzLmN3ZCArIHBhdGguc2VwICsgZmlsZTtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSBtYXRjaC5saW5lID8gbWF0Y2gubGluZSAtIDEgOiAwOyAvKiBCZWNhdXNlIGF0b20gaXMgemVyby1iYXNlZCAqL1xuICAgIGNvbnN0IGNvbCA9IG1hdGNoLmNvbCA/IG1hdGNoLmNvbCAtIDEgOiAwOyAvKiBCZWNhdXNlIGF0b20gaXMgemVyby1iYXNlZCAqL1xuXG4gICAgZnMuZXhpc3RzKGZpbGUsIChleGlzdHMpID0+IHtcbiAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgJ01hdGNoZWQgZmlsZSBkb2VzIG5vdCBleGlzdDogJyArIGZpbGUpO1xuICAgICAgfVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlLCB7XG4gICAgICAgIGluaXRpYWxMaW5lOiByb3csXG4gICAgICAgIGluaXRpYWxDb2x1bW46IGNvbCxcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5lbWl0KCdtYXRjaGVkJywgbWF0Y2guaWQpO1xuICAgIH0pO1xuICB9XG5cbiAgX3BhcnNlKCkge1xuICAgIHRoaXMuY3VycmVudE1hdGNoID0gW107XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgbWF0Y2hGdW5jdGlvbiA9IGZ1bmN0aW9uIChtYXRjaCwgaSwgc3RyaW5nLCByZWdleCkge1xuICAgICAgbWF0Y2guaWQgPSAnZXJyb3ItbWF0Y2gtJyArIHNlbGYucmVnZXguaW5kZXhPZihyZWdleCkgKyAnLScgKyBpO1xuICAgICAgdGhpcy5wdXNoKG1hdGNoKTtcbiAgICB9O1xuICAgIHRoaXMucmVnZXguZm9yRWFjaCgocmVnZXgpID0+IHtcbiAgICAgIFhSZWdFeHAuZm9yRWFjaCh0aGlzLm91dHB1dCwgcmVnZXgsIG1hdGNoRnVuY3Rpb24sIHRoaXMuY3VycmVudE1hdGNoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudE1hdGNoLnNvcnQoKGEsIGIpID0+IGEuaW5kZXggLSBiLmluZGV4KTtcblxuICAgIHRoaXMuZmlyc3RNYXRjaElkID0gKHRoaXMuY3VycmVudE1hdGNoLmxlbmd0aCA+IDApID8gdGhpcy5jdXJyZW50TWF0Y2hbMF0uaWQgOiBudWxsO1xuXG4gICAgdGhpcy5jdXJyZW50TWF0Y2guZm9yRWFjaChtYXRjaCA9PiB0aGlzLmVtaXQoJ21hdGNoJywgbWF0Y2hbMF0sIG1hdGNoLmlkKSk7XG4gIH1cblxuICBzZXQocmVnZXgsIGN3ZCwgb3V0cHV0KSB7XG4gICAgcmVnZXggPSByZWdleCB8fCBbXTtcbiAgICByZWdleCA9IChyZWdleCBpbnN0YW5jZW9mIEFycmF5KSA/IHJlZ2V4IDogWyByZWdleCBdO1xuXG4gICAgdGhpcy5yZWdleCA9IHJlZ2V4Lm1hcCgocikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIFhSZWdFeHAocik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsICdFcnJvciBwYXJzaW5nIHJlZ2V4LiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9KS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbiAgICB0aGlzLmN1cnJlbnRNYXRjaCA9IFtdO1xuXG4gICAgdGhpcy5fcGFyc2UoKTtcbiAgfVxuXG4gIG1hdGNoKCkge1xuICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2Vycm9yTWF0Y2gnLCAnbWF0Y2gnKTtcblxuICAgIHRoaXMuX2dvdG9OZXh0KCk7XG4gIH1cblxuICBtYXRjaEZpcnN0KCkge1xuICAgIEdvb2dsZUFuYWx5dGljcy5zZW5kRXZlbnQoJ2Vycm9yTWF0Y2gnLCAnZmlyc3QnKTtcblxuICAgIGlmICh0aGlzLmZpcnN0TWF0Y2hJZCkge1xuICAgICAgdGhpcy5nb3RvKHRoaXMuZmlyc3RNYXRjaElkKTtcbiAgICB9XG4gIH1cblxuICBoYXNNYXRjaCgpIHtcbiAgICByZXR1cm4gMCAhPT0gdGhpcy5jdXJyZW50TWF0Y2gubGVuZ3RoO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/sguenther/.atom/packages/build/lib/error-matcher.js
