(function() {
  var Match, MatchList, _,
    __slice = [].slice;

  _ = require('underscore-plus');

  Match = (function() {
    function Match(editor, _arg) {
      var _ref;
      this.editor = editor;
      this.range = _arg.range, this.matchText = _arg.matchText;
      _ref = this.range, this.start = _ref.start, this.end = _ref.end;
    }

    Match.prototype.isTop = function() {
      return this.decoration.getProperties()['class'].match('top');
    };

    Match.prototype.isBottom = function() {
      return this.decoration.getProperties()['class'].match('bottom');
    };

    Match.prototype.decorate = function(klass, action) {
      if (action == null) {
        action = 'replace';
      }
      if (this.decoration == null) {
        this.decoration = this.decorateMarker({
          type: 'highlight',
          "class": klass
        });
        return;
      }
      switch (action) {
        case 'remove':
          klass = this.decoration.getProperties()['class'].replace(klass, '').trim();
          break;
        case 'append':
          klass = this.decoration.getProperties()['class'] + ' ' + klass;
      }
      return this.decoration.setProperties({
        type: 'highlight',
        "class": klass
      });
    };

    Match.prototype.decorateMarker = function(options) {
      this.marker = this.editor.markBufferRange(this.range, {
        invalidate: 'never',
        persistent: false
      });
      return this.editor.decorateMarker(this.marker, options);
    };

    Match.prototype.scroll = function() {
      var bufferRow, screenRange;
      screenRange = this.marker.getScreenRange();
      this.editor.scrollToScreenRange(screenRange, {
        center: true
      });
      bufferRow = this.marker.getStartBufferPosition().row;
      if (this.editor.isFoldedAtBufferRow(bufferRow)) {
        return this.editor.unfoldBufferRow(bufferRow);
      }
    };

    Match.prototype.flash = function() {
      var decoration;
      decoration = this.editor.decorateMarker(this.marker.copy(), {
        type: 'highlight',
        "class": 'isearch-flash'
      });
      return setTimeout(function() {
        return decoration.getMarker().destroy();
      }, 150);
    };

    Match.prototype.getScore = function() {
      var column, row, _ref;
      return this.score != null ? this.score : this.score = ((_ref = this.start, row = _ref.row, column = _ref.column, _ref), row * 1000 + column);
    };

    Match.prototype.destroy = function() {
      var _ref;
      this.range = this.start = this.end = this.score = this.editor = null;
      if ((_ref = this.marker) != null) {
        _ref.destroy();
      }
      return this.marker = this.decoration = null;
    };

    return Match;

  })();

  MatchList = (function() {
    function MatchList() {
      this.index = 0;
      this.entries = [];
      this.lastMatch = null;
    }

    MatchList.prototype.replace = function(entries) {
      this.entries = entries;
    };

    MatchList.prototype.isEmpty = function() {
      return this.entries.length === 0;
    };

    MatchList.prototype.isOnly = function() {
      return this.entries.length === 1;
    };

    MatchList.prototype.getCurrent = function() {
      return this.entries[this.index];
    };

    MatchList.prototype.visit = function(direction, options) {
      if (options == null) {
        options = {};
      }
      if (options.from) {
        this.setIndex(direction, options.from);
      } else {
        this.updateIndex(direction);
      }
      return this.redraw({
        all: options.redrawAll
      });
    };

    MatchList.prototype.setIndex = function(direction, matchCursor) {
      this.index = _.sortedIndex(this.entries, matchCursor, function(m) {
        return m.getScore();
      });
      if (direction === 'forward') {
        this.index -= 1;
      }
      return this.updateIndex(direction);
    };

    MatchList.prototype.updateIndex = function(direction) {
      if (direction === 'forward') {
        return this.index = (this.index + 1) % this.entries.length;
      } else {
        this.index -= 1;
        if (this.index === -1) {
          return this.index = this.entries.length - 1;
        }
      }
    };

    MatchList.prototype.redraw = function(options) {
      var current, first, last, others, _i, _ref;
      if (options == null) {
        options = {};
      }
      if (options.all) {
        _ref = this.entries, first = _ref[0], others = 3 <= _ref.length ? __slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []), last = _ref[_i++];
        this.decorate(others, 'isearch-match');
        first.decorate('isearch-match top');
        if (last != null) {
          last.decorate('isearch-match bottom');
        }
      }
      current = this.getCurrent();
      current.decorate('current', 'append');
      current.scroll();
      current.flash();
      return this.lastMatch = current;
    };

    MatchList.prototype.decorate = function(matches, klass) {
      var m, _i, _len, _ref, _results;
      _ref = matches != null ? matches : [];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        _results.push(m.decorate(klass));
      }
      return _results;
    };

    MatchList.prototype.reset = function() {
      var m, _i, _len, _ref;
      _ref = this.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        m = _ref[_i];
        m.destroy();
      }
      return this.replace([]);
    };

    MatchList.prototype.getInfo = function() {
      return {
        total: this.entries.length,
        current: this.isEmpty() ? 0 : this.index + 1
      };
    };

    MatchList.prototype.destroy = function() {
      this.reset();
      return this.index = this.entries = this.lastMatch = null;
    };

    return MatchList;

  })();

  module.exports = {
    Match: Match,
    MatchList: MatchList
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvc2d1ZW50aGVyLy5hdG9tL3BhY2thZ2VzL2lzZWFyY2gvbGliL21hdGNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFFTTtBQUNTLElBQUEsZUFBRSxNQUFGLEVBQVUsSUFBVixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURzQixJQUFDLENBQUEsYUFBQSxPQUFPLElBQUMsQ0FBQSxpQkFBQSxTQUMvQixDQUFBO0FBQUEsTUFBQSxPQUFpQixJQUFDLENBQUEsS0FBbEIsRUFBQyxJQUFDLENBQUEsYUFBQSxLQUFGLEVBQVMsSUFBQyxDQUFBLFdBQUEsR0FBVixDQURXO0lBQUEsQ0FBYjs7QUFBQSxvQkFHQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLFVBQVUsQ0FBQyxhQUFaLENBQUEsQ0FBNEIsQ0FBQSxPQUFBLENBQVEsQ0FBQyxLQUFyQyxDQUEyQyxLQUEzQyxFQURLO0lBQUEsQ0FIUCxDQUFBOztBQUFBLG9CQU1BLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsVUFBVSxDQUFDLGFBQVosQ0FBQSxDQUE0QixDQUFBLE9BQUEsQ0FBUSxDQUFDLEtBQXJDLENBQTJDLFFBQTNDLEVBRFE7SUFBQSxDQU5WLENBQUE7O0FBQUEsb0JBU0EsUUFBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLE1BQVIsR0FBQTs7UUFBUSxTQUFPO09BQ3ZCO0FBQUEsTUFBQSxJQUFPLHVCQUFQO0FBQ0UsUUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxjQUFELENBQWdCO0FBQUEsVUFB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

//# sourceURL=/home/sguenther/.atom/packages/isearch/lib/match.coffee
